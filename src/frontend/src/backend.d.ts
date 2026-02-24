import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LoginKey {
    id: KeyId;
    key: string;
    created: Time;
    injector?: InjectorId;
    expires?: Time;
    blocked: boolean;
    used: bigint;
}
export type Time = bigint;
export type KeyId = bigint;
export type InjectorId = bigint;
export interface Injector {
    id: InjectorId;
    created: Time;
    name: string;
    redirectUrl?: string;
}
export type Password = string;
export type Username = string;
export interface backendInterface {
    authenticate(username: Username, password: Password): Promise<boolean>;
    blockKey(keyId: KeyId): Promise<void>;
    createInjector(name: string, redirectUrl: string | null): Promise<void>;
    createKey(keyValue: string, expiresInSeconds: bigint, injectorId: InjectorId | null): Promise<void>;
    deleteInjector(injectorId: InjectorId): Promise<void>;
    generateLoginRedirectUrl(injectorId: InjectorId): Promise<string>;
    getAllInjectors(): Promise<Array<Injector>>;
    getAllKeys(): Promise<Array<LoginKey>>;
    getInjectorById(injectorId: InjectorId): Promise<Injector>;
    getKeyById(keyId: KeyId): Promise<LoginKey>;
    isValidKey(keyId: KeyId): Promise<boolean>;
    unblockKey(keyId: KeyId): Promise<void>;
    updateInjectorRedirect(injectorId: InjectorId, newRedirect: string | null): Promise<void>;
}
