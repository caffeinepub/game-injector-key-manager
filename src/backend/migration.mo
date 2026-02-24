import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type KeyId = Nat;
  type InjectorId = Nat;
  type Password = Text;
  type Username = Text;

  type OldKey = {
    id : KeyId;
    key : Text;
    created : Time.Time;
    expires : ?Time.Time;
    used : Nat;
    blocked : Bool;
  };

  type OldInjector = {
    id : InjectorId;
    name : Text;
    redirectUrl : ?Text;
    created : Time.Time;
  };

  type NewAdminAccount = {
    username : Username;
    password : Password;
    created : Time.Time;
    lastLogin : ?Time.Time;
  };

  type NewKey = {
    id : KeyId;
    key : Text;
    created : Time.Time;
    expires : ?Time.Time;
    used : Nat;
    blocked : Bool;
    injector : ?InjectorId;
  };

  type NewInjector = OldInjector;

  type OldActor = {
    keys : Map.Map<KeyId, OldKey>;
    injectors : Map.Map<InjectorId, OldInjector>;
    nextKeyId : Nat;
    nextInjectorId : Nat;
  };

  type NewActor = {
    keys : Map.Map<KeyId, NewKey>;
    injectors : Map.Map<InjectorId, NewInjector>;
    adminUsername : Username;
    adminAccount : ?NewAdminAccount;
    nextKeyId : Nat;
    nextInjectorId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newKeys = old.keys.map<KeyId, OldKey, NewKey>(
      func(_id, oldKey) { { oldKey with injector = null } }
    );
    {
      old with
      keys = newKeys;
      adminUsername = "Gaurav";
      adminAccount = null;
    };
  };
};
