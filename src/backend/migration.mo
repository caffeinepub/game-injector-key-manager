import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // Old record types
  type OldLoginKey = {
    id : Nat;
    key : Text;
    created : Time.Time;
    expires : ?Time.Time;
    used : Nat;
    blocked : Bool;
    injector : ?Nat;
    maxDevices : ?Nat;
    deviceCount : Nat;
    devicesUsed : Nat;
  };

  type OldLoginKeys = Map.Map<Nat, OldLoginKey>;

  type NewLoginKey = {
    id : Nat;
    key : Text;
    created : Time.Time;
    expires : ?Time.Time;
    used : Nat;
    blocked : Bool;
    injector : ?Nat;
    maxDevices : ?Nat;
    deviceCount : Nat;
    devicesUsed : Nat;
    resellerId : ?Nat;
  };

  type NewLoginKeys = Map.Map<Nat, NewLoginKey>;

  // Old actor state
  type OldActor = {
    keys : OldLoginKeys;
  };

  // New actor state
  type NewActor = {
    keys : NewLoginKeys;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newLoginKeys = old.keys.map<Nat, OldLoginKey, NewLoginKey>(
      func(_id, oldLoginKey) {
        {
          oldLoginKey with
          resellerId = null;
        };
      }
    );
    { keys = newLoginKeys };
  };
};
