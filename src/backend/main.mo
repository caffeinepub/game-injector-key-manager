import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

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

  type DeviceRegistry = {
    deviceId : Text;
    used : Time.Time;
  };

  let deviceRegistries = Map.empty<Nat, List.List<DeviceRegistry>>();

  var panelSettings : PanelSettings = {
    panelName = "Game Injector";
    themePreset = "dark";
  };

  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

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
    resellers.add(resellerId, { reseller with credits = Nat.sub(reseller.credits, amount) });
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

  func getKey(keyId : KeyId) : LoginKey {
    switch (keys.get(keyId)) {
      case (null) { Runtime.trap("KEY_NOT_FOUND") };
      case (?key) { key };
    };
  };

  func keyExists(key : Text) : Bool {
    let found = keys.values().toArray().find(func(k) { k.key == key });
    switch (found) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared ({ caller }) func checkKeyExists(key : Text) : async Bool {
    keyExists(key);
  };

  public shared ({ caller }) func adminCreateKey(request : KeyRequest) : async () {
    authenticated();

    if (keyExists(request.key)) {
      Runtime.trap("This key already exists");
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
      resellerId = null;
    };

    keys.add(nextKeyId, newKey);
    nextKeyId += 1;
  };

  func generateRandomKey() : Text {
    let chars = Array.fromIter(alphabet.chars());
    let charsSize = chars.size();

    // Use Time.now() to get a different seed each time this is called
    let baseSeed = Int.abs(Time.now());

    func getRandomChar(index : Nat) : Char {
      // Combine base seed with index and nextKeyId to create variation
      let seed = baseSeed + index * 7919 + nextKeyId * 6151;
      let randomIndex = seed % charsSize;
      chars[randomIndex];
    };

    func getRandomString(length : Nat, offset : Nat) : Text {
      if (length == 0) {
        "";
      } else {
        let char = getRandomChar(offset);
        let rest = getRandomString(length - 1, offset + 1);
        char.toText() # rest;
      };
    };

    let randomPrefix = "GAURAV-";
    let result = randomPrefix # getRandomString(5, 0);
    result;
  };

  public shared ({ caller }) func resellerCreateKey(request : KeyRequest, resellerId : ResellerId) : async () {
    let reseller = getReseller(resellerId);

    if (reseller.credits < keyCreditCost) {
      Runtime.trap("INSUFFICIENT_CREDITS");
    };

    let generatedKey = generateRandomKey();

    if (generatedKey.size() == 0) {
      Runtime.trap("ERROR_GENERATING_KEY");
    };

    let newKey : LoginKey = {
      id = nextKeyId;
      key = generatedKey;
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
    resellers.add(resellerId, { reseller with credits = Nat.sub(reseller.credits, keyCreditCost) });
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

  public query ({ caller }) func getDevicesForKey(keyId : KeyId) : async [(Text, Time.Time)] {
    switch (deviceRegistries.get(keyId)) {
      case (null) {
        [];
      };
      case (?devicesList) {
        let devices = devicesList.toArray();
        devices.map(func(device) { (device.deviceId, device.used) });
      };
    };
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

  public shared ({ caller }) func updatePanelSettings(newSettings : PanelSettings) : async () {
    authenticated();
    panelSettings := newSettings;
  };

  public query ({ caller }) func getPanelSettings() : async PanelSettings {
    panelSettings;
  };

  // OLD verifyLogin -> kept for backwards compatibility
  public query ({ caller }) func verifyLogin(key : Text, deviceId : Text) : async {
    valid : Bool;
    message : Text;
    status : Text;
  } {
    let keyEntry = keys.toArray().find(
      func((_, entry)) {
        Text.equal(entry.key, key);
      }
    );

    switch (keyEntry) {
      case (null) {
        { valid = false; message = "Key not found"; status = "error" };
      };
      case (?(_, loginKey)) {
        if (loginKey.blocked) {
          return { valid = false; message = "Key is blocked"; status = "error" };
        };

        switch (loginKey.expires) {
          case (null) {};
          case (?expires) {
            if (Time.now() >= expires) {
              return {
                valid = false;
                message = "Key has expired";
                status = "error";
              };
            };
          };
        };

        switch (loginKey.maxDevices) {
          case (null) {};
          case (?maxDevices) {
            if (loginKey.deviceCount >= maxDevices) {
              return {
                valid = false;
                message = "Device count limit reached";
                status = "error";
              };
            };

            let deviceUsed = switch (deviceRegistries.get(loginKey.id)) {
              case (null) { false };
              case (?devicesList) {
                let deviceArray = devicesList.toArray();
                let found = deviceArray.find(
                  func(device) { Text.equal(device.deviceId, deviceId) }
                );
                switch (found) {
                  case (null) { false };
                  case (?_) { true };
                };
              };
            };

            if (deviceUsed) {
              return {
                valid = false;
                message = "Device already used";
                status = "error";
              };
            };
          };
        };

        let newDeviceList = switch (deviceRegistries.get(loginKey.id)) {
          case (null) { List.empty<DeviceRegistry>() };
          case (?existing) { existing };
        };
        newDeviceList.add({ deviceId; used = Time.now() });
        deviceRegistries.add(loginKey.id, newDeviceList);

        { valid = true; message = "Key is valid"; status = "success" };
      };
    };
  };

  /// -------  NEW verifyLogin replaces verifyLicense function ------- ///
  public query ({ caller }) func verifyLoginWithInjector(key : Text, deviceId : Text, injectorIdParam : Text) : async {
    valid : Bool;
    message : Text;
    status : Text;
  } {
    let keyEntry = keys.toArray().find(
      func((_, entry)) {
        Text.equal(entry.key, key);
      }
    );

    switch (keyEntry) {
      case (null) {
        { valid = false; message = "Key not found"; status = "error" };
      };
      case (?(_, loginKey)) {
        // Validate injector ID
        switch (loginKey.injector) {
          case (?assignedInjectorId) {
            if (injectorIdParam != "0" and not Text.equal(assignedInjectorId.toText(), injectorIdParam)) {
              let injectorName = switch (injectors.get(assignedInjectorId)) {
                case (?injector) { injector.name };
                case (null) { "Unknown Injector" };
              };
              return {
                valid = false;
                message = "This key is not valid for " # injectorName;
                status = "error";
              };
            };
          };
          case (null) {
            if (injectorIdParam != "0" and injectorIdParam != "") {
              return {
                valid = false;
                message = "This key is not valid for the specified injector";
                status = "error";
              };
            };
          };
        };

        // Existing validations
        if (loginKey.blocked) {
          return { valid = false; message = "Key is blocked"; status = "error" };
        };

        switch (loginKey.expires) {
          case (null) {};
          case (?expires) {
            if (Time.now() >= expires) {
              return {
                valid = false;
                message = "Key has expired";
                status = "error";
              };
            };
          };
        };

        switch (loginKey.maxDevices) {
          case (null) {};
          case (?maxDevices) {
            if (loginKey.deviceCount >= maxDevices) {
              return {
                valid = false;
                message = "Device count limit reached";
                status = "error";
              };
            };

            let deviceUsed = switch (deviceRegistries.get(loginKey.id)) {
              case (null) { false };
              case (?devicesList) {
                let deviceArray = devicesList.toArray();
                let found = deviceArray.find(
                  func(device) { Text.equal(device.deviceId, deviceId) }
                );
                switch (found) {
                  case (null) { false };
                  case (?_) { true };
                };
              };
            };

            if (deviceUsed) {
              return {
                valid = false;
                message = "Device already used";
                status = "error";
              };
            };
          };
        };

        let newDeviceList = switch (deviceRegistries.get(loginKey.id)) {
          case (null) { List.empty<DeviceRegistry>() };
          case (?existing) { existing };
        };
        newDeviceList.add({ deviceId; used = Time.now() });
        deviceRegistries.add(loginKey.id, newDeviceList);

        { valid = true; message = "Key is valid"; status = "success" };
      };
    };
  };

  // New getKeyCountByInjector function
  public query ({ caller }) func getKeyCountByInjector() : async [(InjectorId, Nat)] {
    let counts = injectors.map<InjectorId, Injector, (InjectorId, Nat)>(
      func(id, _) { (id, 0) }
    );

    for (key in keys.values()) {
      switch (key.injector) {
        case (?injectorId) {
          switch (counts.get(injectorId)) {
            case (?countTuple) {
              let currentCount = countTuple.1;
              counts.add(injectorId, (injectorId, currentCount + 1));
            };
            case (null) {};
          };
        };
        case (null) {};
      };
    };

    // Filter counts to only include injectors with at least one key
    let entries = counts.entries();
    let filteredEntries = entries.filter(func((_, pair)) { pair.1 > 0 });
    filteredEntries.toArray().map(func((_, pair)) { pair });
  };

  // New getKeysByInjector function
  public query ({ caller }) func getKeysByInjector(injectorId : InjectorId) : async [LoginKey] {
    let filtered = keys.values().toList<LoginKey>().filter(
      func(key) {
        switch (key.injector) {
          case (null) { false };
          case (?id) { id == injectorId };
        };
      }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func deleteKey(keyId : KeyId, resellerId : ?ResellerId) : async () {
    switch (keys.get(keyId)) {
      case (null) { Runtime.trap("KEY_NOT_FOUND") };
      case (?key) {
        switch (resellerId, key.resellerId) {
          case (null, _) {
            authenticated();
            keys.remove(keyId);
          };
          case (?(reseller), ?creator) {
            if (reseller != creator) {
              Runtime.trap("PERMISSION_DENIED - RESELLER_NOT_OWNER");
            };
            keys.remove(keyId);
          };
          case (_) { Runtime.trap("PERMISSION_DENIED - RESELLER_ID_MISSING") };
        };
      };
    };
  };
};
