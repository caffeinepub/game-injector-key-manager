import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface KeyRequest {
    key: string;
    injector?: InjectorId;
    expires?: Time;
    maxDevices?: bigint;
    resellerId?: ResellerId;
}
export interface LoginKey {
    id: KeyId;
    key: string;
    created: Time;
    injector?: InjectorId;
    expires?: Time;
    deviceCount: bigint;
    maxDevices?: bigint;
    blocked: boolean;
    used: bigint;
    resellerId?: ResellerId;
    devicesUsed: bigint;
}
export type Time = bigint;
export type KeyId = bigint;
export type InjectorId = bigint;
export interface PanelSettings {
    themePreset: string;
    panelName: string;
}
export type ResellerId = bigint;
export type Password = string;
export interface Injector {
    id: InjectorId;
    status: boolean;
    created: Time;
    name: string;
    redirectUrl?: string;
}
export interface AdminAccount {
    created: Time;
    username: Username;
    password: Password;
    lastLogin?: Time;
}
export type Username = string;
export interface Reseller {
    id: ResellerId;
    created: Time;
    credits: bigint;
    username: Username;
    password: Password;
    lastLogin?: Time;
}
export interface backendInterface {
    addCredits(resellerId: ResellerId, amount: bigint): Promise<void>;
    adminCreateKey(request: KeyRequest): Promise<void>;
    authenticate(username: Username, password: Password): Promise<boolean>;
    authenticateReseller(username: Username, password: Password): Promise<ResellerId>;
    blockKey(keyId: KeyId): Promise<void>;
    checkKeyExists(key: string): Promise<boolean>;
    createInjector(name: string, redirectUrl: string | null): Promise<void>;
    createReseller(username: Username, password: Password): Promise<void>;
    deleteInjector(injectorId: InjectorId): Promise<void>;
    deleteKey(keyId: KeyId, resellerId: ResellerId | null): Promise<void>;
    deleteReseller(resellerId: ResellerId): Promise<void>;
    generateLoginRedirectUrl(injectorId: InjectorId): Promise<string>;
    getAccountByUsername(username: Username): Promise<AdminAccount | null>;
    getAllAccounts(): Promise<Array<AdminAccount>>;
    getAllInjectors(): Promise<Array<Injector>>;
    getAllKeys(): Promise<Array<LoginKey>>;
    getAllResellers(): Promise<Array<Reseller>>;
    getDevicesForKey(keyId: KeyId): Promise<Array<[string, Time]>>;
    getInjectorById(injectorId: InjectorId): Promise<Injector>;
    getKeyById(keyId: KeyId): Promise<LoginKey>;
    getKeyCountByInjector(): Promise<Array<[InjectorId, bigint]>>;
    getKeyCreditCost(): Promise<bigint>;
    getKeysByInjector(injectorId: InjectorId): Promise<Array<LoginKey>>;
    getKeysByReseller(resellerId: ResellerId): Promise<Array<LoginKey>>;
    getPanelSettings(): Promise<PanelSettings>;
    isValidKey(keyId: KeyId): Promise<boolean>;
    resellerCreateKey(request: KeyRequest, resellerId: ResellerId): Promise<void>;
    setKeyCreditCost(cost: bigint): Promise<void>;
    subtractCredits(resellerId: ResellerId, amount: bigint): Promise<void>;
    unblockKey(keyId: KeyId): Promise<void>;
    updateAccount(account: AdminAccount): Promise<void>;
    updateAccountUsername(newUsername: string): Promise<void>;
    updateInjectorRedirect(injectorId: InjectorId, newRedirect: string | null): Promise<void>;
    updatePanelSettings(newSettings: PanelSettings): Promise<void>;
    validateKey(keyId: KeyId, deviceId: string): Promise<boolean>;
    verifyLogin(key: string, deviceId: string): Promise<{
        status: string;
        valid: boolean;
        message: string;
    }>;
    /**
     * / -------  NEW verifyLogin replaces verifyLicense function ------- ///
     */
    verifyLoginWithInjector(key: string, deviceId: string, injectorIdParam: string): Promise<{
        status: string;
        valid: boolean;
        message: string;
    }>;
}
