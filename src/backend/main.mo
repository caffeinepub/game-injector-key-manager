import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
  type KeyId = Nat;
  type InjectorId = Nat;

  type Password = Text;
  type Username = Text;

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
  };

  type Injector = {
    id : InjectorId;
    name : Text;
    redirectUrl : ?Text;
    created : Time.Time;
  };

  let keys = Map.empty<KeyId, LoginKey>();
  let injectors = Map.empty<InjectorId, Injector>();

  let adminUsername = "Gaurav";
  var adminAccount : ?AdminAccount = null;

  var nextKeyId : Nat = 0;
  var nextInjectorId : Nat = 0;

  //-- Authentication --
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

  //-- Login Key Management --
  func getKey(keyId : KeyId) : LoginKey {
    switch (keys.get(keyId)) {
      case (null) { Runtime.trap("KEY_NOT_FOUND") };
      case (?key) { key };
    };
  };

  public shared ({ caller }) func createKey(keyValue : Text, expiresInSeconds : Nat, injectorId : ?InjectorId) : async () {
    authenticated();

    let newKey : LoginKey = {
      id = nextKeyId;
      key = keyValue;
      created = Time.now();
      expires = if (expiresInSeconds == 0) { null } else {
        ?(Time.now() + (expiresInSeconds * 1_000_000_000));
      };
      used = 0;
      blocked = false;
      injector = injectorId;
    };
    keys.add(nextKeyId, newKey);
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
    if (key.blocked) { return false };
    switch (key.expires) {
      case (null) { true };
      case (?expires) {
        Time.now() < expires;
      };
    };
  };

  //-- Injector Management --
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

  //-- URL Generation --
  public query ({ caller }) func generateLoginRedirectUrl(injectorId : InjectorId) : async Text {
    let injector = getInjector(injectorId);
    let captchaBaseUrl = "https://yonicap.com/scan";
    let params = "?injectorId=" # injector.id.toText() # "&name=" # injector.name;
    switch (injector.redirectUrl) {
      case (null) { captchaBaseUrl # params };
      case (?url) { captchaBaseUrl # params # "&redirect=" # url };
    };
  };

  //-- Query Functions --
  public query ({ caller }) func getKeyById(keyId : KeyId) : async LoginKey {
    getKey(keyId);
  };

  public query ({ caller }) func getAllKeys() : async [LoginKey] {
    keys.values().toArray();
  };

  public query ({ caller }) func getInjectorById(injectorId : InjectorId) : async Injector {
    getInjector(injectorId);
  };

  public query ({ caller }) func getAllInjectors() : async [Injector] {
    injectors.values().toArray();
  };
};
