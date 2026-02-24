import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type KeyId = Nat;

  type LoginKey = {
    id : KeyId;
    key : Text;
    created : Time.Time;
    expires : ?Time.Time;
    used : Nat;
    blocked : Bool;
  };

  let keys = Map.empty<KeyId, LoginKey>();
  var nextKeyId = 0;

  func getKey(keyId : KeyId) : LoginKey {
    switch (keys.get(keyId)) {
      case (null) { Runtime.trap("KEY_NOT_FOUND") };
      case (?key) { key };
    };
  };

  func updateKey(key : LoginKey) {
    keys.add(key.id, key);
  };

  func saveKey(key : LoginKey) {
    updateKey(key);
    nextKeyId += 1;
  };

  public shared ({ caller }) func createKey(keyValue : Text, expiresInSeconds : Nat) : async () {
    let newKey : LoginKey = {
      id = nextKeyId;
      key = keyValue;
      created = Time.now();
      expires = if (expiresInSeconds == 0) { null } else {
        ?(Time.now() + (expiresInSeconds * 1_000_000_000));
      };
      used = 0;
      blocked = false;
    };
    saveKey(newKey);
  };

  public shared ({ caller }) func blockKey(keyId : KeyId) : async () {
    let key = getKey(keyId);
    updateKey({
      key with
      blocked = true;
    });
  };

  public shared ({ caller }) func unblockKey(keyId : KeyId) : async () {
    let key = getKey(keyId);
    updateKey({
      key with
      blocked = false;
    });
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

  public query ({ caller }) func getKeyById(keyId : KeyId) : async LoginKey {
    getKey(keyId);
  };

  public query ({ caller }) func getAllKeys() : async [LoginKey] {
    keys.values().toArray();
  };
};
