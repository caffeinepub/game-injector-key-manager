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
    expires?: Time;
    blocked: boolean;
    used: bigint;
}
export type KeyId = bigint;
export type Time = bigint;
export interface backendInterface {
    blockKey(keyId: KeyId): Promise<void>;
    createKey(keyValue: string, expiresInSeconds: bigint): Promise<void>;
    getAllKeys(): Promise<Array<LoginKey>>;
    getKeyById(keyId: KeyId): Promise<LoginKey>;
    isValidKey(keyId: KeyId): Promise<boolean>;
    unblockKey(keyId: KeyId): Promise<void>;
}
