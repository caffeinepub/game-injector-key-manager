import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
  type KeyId = Nat;
  type InjectorId = Nat;
  type Password = Text;
  type Username = Text;
  type ResellerId = Nat;

  type AdminAccount = {
    username : Username;
    password : Password;
    created : Time.Time;
    lastLogin : ?Time.Time;
  };

  type LoginKey = {
    id : KeyId;
    key : Text;
    created : Time.Time;
    expires : ?Time.Time;
    used : Nat;
    blocked : Bool;
    injector : ?InjectorId;
    maxDevices : ?Nat;
    deviceCount : Nat;
    devicesUsed : Nat;
    resellerId : ?ResellerId;
  };

  type Injector = {
    id : InjectorId;
    name : Text;
    redirectUrl : ?Text;
    created : Time.Time;
    status : Bool;
  };

  type KeyRequest = {
    key : Text;
    expires : ?Time.Time;
    injector : ?InjectorId;
    maxDevices : ?Nat;
    resellerId : ?ResellerId;
  };

  type Reseller = {
    id : ResellerId;
    username : Username;
    password : Password;
    credits : Nat;
    created : Time.Time;
    lastLogin : ?Time.Time;
  };

  type PanelSettings = {
    panelName : Text;
    themePreset : Text;
  };

  let keys = Map.empty<KeyId, LoginKey>();
  let injectors = Map.empty<InjectorId, Injector>();
  let resellers = Map.empty<ResellerId, Reseller>();

  var adminUsername = "Gaurav";
  var adminAccount : ?AdminAccount = null;

  var nextKeyId : Nat = 0;
  var nextInjectorId : Nat = 0;
  var nextResellerId : Nat = 0;

  var keyCreditCost : Nat = 1;

  var panelSettings : PanelSettings = {
    panelName = "Game Injector";
    themePreset = "dark";
  };

  // Authentication
  public shared ({ caller }) func authenticate(username : Username, password : Password) : async Bool {
    if (Text.equal(username, adminUsername) and Text.equal(password, "Gaurav_20")) {
      adminAccount := ?{
        username;
        password;
        created = Time.now();
        lastLogin = ?Time.now();
      };
      true;
    } else {
      false;
    };
  };

  func authenticated() {
    if (adminAccount == null) {
      Runtime.trap("AUTHENTICATION_FAILED");
    };
  };

  // -- Reseller Management --
  func getReseller(resellerId : ResellerId) : Reseller {
    switch (resellers.get(resellerId)) {
      case (null) { Runtime.trap("RESELLER_NOT_FOUND") };
      case (?reseller) { reseller };
    };
  };

  public shared ({ caller }) func createReseller(username : Username, password : Password) : async () {
    authenticated();

    let newReseller : Reseller = {
      id = nextResellerId;
      username;
      password;
      credits = 0;
      created = Time.now();
      lastLogin = null;
    };

    resellers.add(nextResellerId, newReseller);
    nextResellerId += 1;
  };

  public shared ({ caller }) func authenticateReseller(username : Username, password : Password) : async ResellerId {
    for ((id, reseller) in resellers.entries()) {
      if (Text.equal(reseller.username, username) and Text.equal(reseller.password, password)) {
        return id;
      };
    };
    Runtime.trap("RESELLER_AUTHENTICATION_FAILED");
  };

  public shared ({ caller }) func addCredits(resellerId : ResellerId, amount : Nat) : async () {
    authenticated();
    let reseller = getReseller(resellerId);
    resellers.add(resellerId, { reseller with credits = reseller.credits + amount });
  };

  public shared ({ caller }) func subtractCredits(resellerId : ResellerId, amount : Nat) : async () {
    authenticated();
    let reseller = getReseller(resellerId);
    if (reseller.credits < amount) {
      Runtime.trap("INSUFFICIENT_CREDITS");
    };
    resellers.add(resellerId, { reseller with credits = reseller.credits - amount });
  };

  public shared ({ caller }) func deleteReseller(resellerId : ResellerId) : async () {
    authenticated();
    if (not resellers.containsKey(resellerId)) {
      Runtime.trap("RESELLER_NOT_FOUND");
    };
    resellers.remove(resellerId);
  };

  public query ({ caller }) func getAllResellers() : async [Reseller] {
    resellers.values().toArray();
  };

  public shared ({ caller }) func setKeyCreditCost(cost : Nat) : async () {
    authenticated();
    keyCreditCost := cost;
  };

  public query ({ caller }) func getKeyCreditCost() : async Nat {
    keyCreditCost;
  };

  // -- Login Key Management --
  func getKey(keyId : KeyId) : LoginKey {
    switch (keys.get(keyId)) {
      case (null) { Runtime.trap("KEY_NOT_FOUND") };
      case (?key) { key };
    };
  };

  public shared ({ caller }) func adminCreateKey(request : KeyRequest) : async () {
    authenticated();

    let newKey : LoginKey = {
      id = nextKeyId;
      key = request.key;
      created = Time.now();
      expires = request.expires;
      used = 0;
      blocked = false;
      injector = request.injector;
      maxDevices = request.maxDevices;
      deviceCount = 0;
      devicesUsed = 0;
      resellerId = null;
    };

    keys.add(nextKeyId, newKey);
    nextKeyId += 1;
  };

  public shared ({ caller }) func resellerCreateKey(request : KeyRequest, resellerId : ResellerId) : async () {
    let reseller = getReseller(resellerId);

    if (reseller.credits < keyCreditCost) {
      Runtime.trap("INSUFFICIENT_CREDITS");
    };

    let newKey : LoginKey = {
      id = nextKeyId;
      key = request.key;
      created = Time.now();
      expires = request.expires;
      used = 0;
      blocked = false;
      injector = request.injector;
      maxDevices = request.maxDevices;
      deviceCount = 0;
      devicesUsed = 0;
      resellerId = ?resellerId;
    };

    keys.add(nextKeyId, newKey);
    resellers.add(resellerId, { reseller with credits = reseller.credits - keyCreditCost });
    nextKeyId += 1;
  };

  public shared ({ caller }) func blockKey(keyId : KeyId) : async () {
    authenticated();

    let key = getKey(keyId);
    keys.add(keyId, { key with blocked = true });
  };

  public shared ({ caller }) func unblockKey(keyId : KeyId) : async () {
    authenticated();

    let key = getKey(keyId);
    keys.add(keyId, { key with blocked = false });
  };

  public shared ({ caller }) func isValidKey(keyId : KeyId) : async Bool {
    let key = getKey(keyId);

    if (key.blocked) {
      return false;
    };

    switch (key.expires) {
      case (null) { true };
      case (?expires) {
        Time.now() < expires
      };
    };
  };

  // Validate Key and Track Device
  public shared ({ caller }) func validateKey(keyId : KeyId, deviceId : Text) : async Bool {
    let key = getKey(keyId);

    if (key.blocked) {
      return false;
    };

    switch (key.expires) {
      case (null) {};
      case (?expires) {
        if (Time.now() >= expires) {
          return false;
        };
      };
    };

    let deviceTracker = Map.empty<Text, Bool>();

    switch (key.maxDevices) {
      case (null) {};
      case (?maxDevices) {
        if (key.deviceCount >= maxDevices) {
          switch (deviceTracker.get(deviceId)) {
            case (null) { return false };
            case (?exists) {
              if (not exists) { return false };
            };
          };
        } else {
          let newDeviceCount = key.deviceCount + 1 : Nat;
          keys.add(
            keyId,
            {
              key with
              deviceCount = newDeviceCount;
              used = key.used + 1;
            },
          );
          deviceTracker.add(deviceId, true);
        };
      };
    };
    true;
  };

  public query ({ caller }) func getKeyById(keyId : KeyId) : async LoginKey {
    getKey(keyId);
  };

  public query ({ caller }) func getAllKeys() : async [LoginKey] {
    keys.values().toArray();
  };

  public query ({ caller }) func getKeysByReseller(resellerId : ResellerId) : async [LoginKey] {
    let filtered = keys.values().toList<LoginKey>().filter(
      func(key) {
        switch (key.resellerId) {
          case (null) { false };
          case (?id) { id == resellerId };
        };
      }
    );
    filtered.toArray();
  };

  // -- Injector Management --
  func getInjector(injectorId : InjectorId) : Injector {
    switch (injectors.get(injectorId)) {
      case (null) { Runtime.trap("INJECTOR_NOT_FOUND") };
      case (?injector) { injector };
    };
  };

  public shared ({ caller }) func createInjector(name : Text, redirectUrl : ?Text) : async () {
    authenticated();

    let newInjector : Injector = {
      id = nextInjectorId;
      name;
      redirectUrl;
      created = Time.now();
      status = true;
    };
    injectors.add(nextInjectorId, newInjector);
    nextInjectorId += 1;
  };

  public shared ({ caller }) func deleteInjector(injectorId : InjectorId) : async () {
    authenticated();

    if (not injectors.containsKey(injectorId)) {
      Runtime.trap("INJECTOR_NOT_FOUND");
    };
    injectors.remove(injectorId);
  };

  public shared ({ caller }) func updateInjectorRedirect(injectorId : InjectorId, newRedirect : ?Text) : async () {
    authenticated();

    let injector = getInjector(injectorId);
    injectors.add(injectorId, { injector with redirectUrl = newRedirect });
  };

  public query ({ caller }) func generateLoginRedirectUrl(injectorId : InjectorId) : async Text {
    let injector = getInjector(injectorId);
    let captchaBaseUrl = "https://yonicap.com/scan";
    let params = "?injectorId=" # injector.id.toText() # "&name=" # injector.name;
    switch (injector.redirectUrl) {
      case (null) { captchaBaseUrl # params };
      case (?url) { captchaBaseUrl # params # "&redirect=" # url };
    };
  };

  public query ({ caller }) func getInjectorById(injectorId : InjectorId) : async Injector {
    getInjector(injectorId);
  };

  public query ({ caller }) func getAllInjectors() : async [Injector] {
    injectors.values().toArray();
  };

  public query ({ caller }) func getDevicesForKey(_ : KeyId) : async [Text] {
    List.empty<Text>().toArray();
  };

  public shared ({ caller }) func updateAccountUsername(newUsername : Text) : async () {
    authenticated();
    adminUsername := newUsername;
  };

  public query ({ caller }) func getAccountByUsername(username : Username) : async ?AdminAccount {
    switch (adminAccount) {
      case (null) { null };
      case (?account) {
        if (Text.equal(account.username, username)) {
          ?account;
        } else {
          null;
        };
      };
    };
  };

  public shared ({ caller }) func updateAccount(account : AdminAccount) : async () {
    authenticated();
    adminAccount := ?account;
  };

  public query ({ caller }) func getAllAccounts() : async [AdminAccount] {
    switch (adminAccount) {
      case (null) { [] };
      case (?account) { [account] };
    };
  };

  // Panel Customization Settings Management
  public shared ({ caller }) func updatePanelSettings(newSettings : PanelSettings) : async () {
    authenticated();
    panelSettings := newSettings;
  };

  public query ({ caller }) func getPanelSettings() : async PanelSettings {
    panelSettings;
  };
};
