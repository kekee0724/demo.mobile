import { merge, set } from "lodash";
import { encode } from "base-64";

import { getObjectProp } from "../utils/get.object.prop";

const appDomain = encode(getObjectProp(client, "appDomain") || getObjectProp(server, "url", "api"));

function non<T>(value: T) {
    return value !== null && value !== void 0;
}

function getKey(key: string) {
    return `${key}_${appDomain}`;
}

function getValue(storage: Storage, key: string): string {
    return storage.getItem(getKey(key))!;
}

function setValue(storage: Storage, key: string, value: string) {
    non(value) ? storage.setItem(getKey(key), value) : storage.removeItem(getKey(key));
}

function getObject<R = any>(storage: Storage, key: string): R {
    const json = storage.getItem(getKey(key));

    return json ? JSON.parse(json) : json;
}

function setObject<T>(storage: Storage, key: string, value: T) {
    non(value) ? storage.setItem(getKey(key), JSON.stringify(value)) : storage.removeItem(getKey(key));
}

export function getSessionStorage(key: string): string {
    return getValue(sessionStorage, key);
}

export function setSessionStorage(key: string, value: string): string {
    return setValue(sessionStorage, key, value), value;
}

export function getSessionStorageObject<R = any>(key: string): R {
    return getObject(sessionStorage, key);
}

export function setSessionStorageObject<T>(key: string, value: T): T {
    return setObject(sessionStorage, key, value), value;
}

export function updateSessionStorageObject<T>(key: string, value: T): T {
    return setObject(sessionStorage, key, (value = merge({}, getSessionStorageObject(key), value))), value;
}

export function setSessionStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return setObject(sessionStorage, key, set(getSessionStorageObject(key), keyPath, value)), value;
}

export function deleteSessionStorageObjectKey(key: string, keyPath: string | string[]): void {
    setSessionStorageObjectKey(key, keyPath, null);
}

export function removeSessionStorage(key: string): void {
    sessionStorage.removeItem(getKey(key));
}

export function clearSessionStorage(): void {
    sessionStorage.clear();
}

export function createSessionStorageScene(key: string, keyPath: string | string[]) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        setObjectKey<T>(value: T): T {
            return setSessionStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey() {
            deleteSessionStorageObjectKey(key, keyPath);
        },
    };
}

export function createSessionStorage(key: string) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        has(): boolean {
            return !!getSessionStorage(key);
        },
        get(): string {
            return getSessionStorage(key);
        },
        set(value: string) {
            return setSessionStorage(key, value);
        },
        getObject<R = any>(): R {
            return getSessionStorageObject<R>(key);
        },
        setObject<T>(value: T): T {
            return setSessionStorageObject(key, value);
        },
        updateObject<T>(value: T) {
            return updateSessionStorageObject(key, value);
        },
        setObjectKey<T>(keyPath: string | string[], value: T): T {
            return setSessionStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey(keyPath: string | string[]) {
            deleteSessionStorageObjectKey(key, keyPath);
        },
        remove() {
            removeSessionStorage(key);
        },
        clear() {
            clearSessionStorage();
        },
        createScene(keyPath: string | string[]) {
            return createSessionStorageScene(key, keyPath);
        },
    };
}

export function getLocalStorage(key: string): string {
    return getValue(localStorage, key);
}

export function setLocalStorage(key: string, value: string): string {
    return setValue(localStorage, key, value), value;
}

export function getLocalStorageObject<R = any>(key: string): R {
    return getObject(localStorage, key);
}

export function setLocalStorageObject<T>(key: string, value: T): T {
    return setObject(localStorage, key, value), value;
}

export function updateLocalStorageObject<T>(key: string, value: T): T {
    return setObject(localStorage, key, (value = merge({}, getLocalStorageObject(key), value))), value;
}

export function setLocalStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return setObject(localStorage, key, set(getLocalStorageObject(key), keyPath, value)), value;
}

export function deleteLocalStorageObjectKey(key: string, keyPath: string | string[]): void {
    setLocalStorageObjectKey(key, keyPath, null);
}

export function removeLocalStorage(key: string): void {
    localStorage.removeItem(getKey(key));
}

export function clearLocalStorage(): void {
    localStorage.clear();
}

export function createLocalStorageScene(key: string, keyPath: string | string[]) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        setObjectKey<T>(value: T): T {
            return setLocalStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey() {
            deleteLocalStorageObjectKey(key, keyPath);
        },
    };
}

export function createLocalStorage(key: string) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        has(): boolean {
            return !!getLocalStorage(key);
        },
        get(): string {
            return getLocalStorage(key);
        },
        set(value: string) {
            return setLocalStorage(key, value);
        },
        getObject<R = any>(): R {
            return getLocalStorageObject<R>(key);
        },
        setObject<T>(value: T): T {
            return setLocalStorageObject(key, value);
        },
        updateObject<T>(value: T) {
            return updateLocalStorageObject(key, value);
        },
        setObjectKey<T>(keyPath: string | string[], value: T): T {
            return setLocalStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey(keyPath: string | string[]) {
            deleteLocalStorageObjectKey(key, keyPath);
        },
        remove() {
            removeLocalStorage(key);
        },
        clear() {
            clearLocalStorage();
        },
        createScene(keyPath: string | string[]) {
            return createLocalStorageScene(key, keyPath);
        },
    };
}

let memoryStorageKeys: any = {},
    memoryStorage = new WeakMap();

function getMemoryStorageKey(key: string) {
    return memoryStorageKeys[key] || (memoryStorageKeys[key] = {});
}

function removeMemoryStorageKey(key: string) {
    delete memoryStorageKeys[key];
}

export function getMemoryStorage<R = any>(key: string) {
    return memoryStorage.get(getMemoryStorageKey(key)) as R;
}

export function setMemoryStorage<T>(key: string, value: T): T {
    return memoryStorage.set(getMemoryStorageKey(key), value), value;
}

export function updateMemoryStorageObject<T>(key: string, value: T): T {
    return memoryStorage.set(getMemoryStorageKey(key), (value = merge({}, getMemoryStorage(key), value))), value;
}

export function setMemoryStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return memoryStorage.set(getMemoryStorageKey(key), set(getMemoryStorage(key), keyPath, value)), value;
}

export function deleteMemoryStorageObjectKey(key: string, keyPath: string | string[]): void {
    setMemoryStorageObjectKey(key, keyPath, null);
}

export function removeMemoryStorage(key: string): void {
    memoryStorage.delete(getMemoryStorageKey(key));

    removeMemoryStorageKey(key);
}

export function clearMemoryStorage(): void {
    memoryStorageKeys = {};

    memoryStorage = new WeakMap();
}

export function createMemoryStorageScene(key: string, keyPath: string | string[]) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        setObjectKey<T>(value: T): T {
            return setMemoryStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey() {
            deleteMemoryStorageObjectKey(key, keyPath);
        },
    };
}

export function createMemoryStorage(key: string) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        has(): boolean {
            return !!getMemoryStorage(key);
        },
        get(): string {
            return getMemoryStorage(key);
        },
        set(value: string) {
            return setMemoryStorage(key, value);
        },
        getObject<R = any>(): R {
            return getMemoryStorage<R>(key);
        },
        setObject<T>(value: T): T {
            return setMemoryStorage(key, value);
        },
        updateObject<T>(value: T) {
            return updateMemoryStorageObject(key, value);
        },
        setObjectKey<T>(keyPath: string | string[], value: T): T {
            return setMemoryStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey(keyPath: string | string[]) {
            deleteMemoryStorageObjectKey(key, keyPath);
        },
        remove() {
            removeMemoryStorage(key);
        },
        clear() {
            clearMemoryStorage();
        },
        createScene(keyPath: string | string[]) {
            return createMemoryStorageScene(key, keyPath);
        },
    };
}

export function getStorage(key: string) {
    return value<string>(key, getMemoryStorage, getSessionStorage, getLocalStorage);
}

export function getStorageObject<R = any>(key: string) {
    return value<R>(key, getMemoryStorage, getSessionStorageObject, getLocalStorageObject);
}

function value<R>(key: string, ...storages: ((key: string) => R)[]) {
    for (const storage of storages) {
        const value = storage(key);

        if (non(value)) {
            return value;
        }
    }
}

export function setStorage(key: string, value: string): string {
    return setMemoryStorage(key, value), setSessionStorage(key, value), setLocalStorage(key, value);
}

export function setStorageObject<T>(key: string, value: T): T {
    return setMemoryStorage(key, value), setSessionStorageObject(key, value), setLocalStorageObject(key, value);
}

export function updateStorageObject<T>(key: string, value: T): T {
    return updateMemoryStorageObject(key, value), updateSessionStorageObject(key, value), updateLocalStorageObject(key, value);
}

export function setStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return setMemoryStorageObjectKey(key, keyPath, value), setSessionStorageObjectKey(key, keyPath, value), setLocalStorageObjectKey(key, keyPath, value);
}

export function deleteStorageObjectKey(key: string, keyPath: string | string[]): void {
    deleteMemoryStorageObjectKey(key, keyPath), deleteSessionStorageObjectKey(key, keyPath), deleteLocalStorageObjectKey(key, keyPath);
}

export function removeStorage(key: string): void {
    removeMemoryStorage(key), removeSessionStorage(key), removeLocalStorage(key);
}

export function clearStorage(): void {
    clearMemoryStorage(), clearSessionStorage(), clearLocalStorage();
}

export function createStorageScene(key: string, keyPath: string | string[]) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        setObjectKey<T>(value: T): T {
            return setStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey() {
            deleteStorageObjectKey(key, keyPath);
        },
    };
}

export function createStorage(key: string) {
    const backKey = key;

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;
        },
        has(): boolean {
            return !!getStorage(key);
        },
        get(): string | void {
            return getStorage(key);
        },
        set(value: string) {
            return setStorage(key, value);
        },
        getObject<R = any>(): R | void {
            return getStorageObject<R>(key);
        },
        setObject<T>(value: T): T {
            return setStorageObject(key, value);
        },
        updateObject<T>(value: T) {
            return updateStorageObject(key, value);
        },
        setObjectKey<T>(keyPath: string | string[], value: T): T {
            return setStorageObjectKey(key, keyPath, value);
        },
        deleteObjectKey(keyPath: string | string[]) {
            deleteStorageObjectKey(key, keyPath);
        },
        remove() {
            removeStorage(key);
        },
        clear() {
            clearStorage();
        },
        createScene(keyPath: string | string[]) {
            return createStorageScene(key, keyPath);
        },
    };
}

export function storageSceneFactory(key: string, keyPath: string | string[], ...storageCreaters: any[]) {
    const storages = storageCreaters.map((storageCreater) => storageCreater(key));

    return {
        resetKey(subKey: string) {
            storages.forEach((storage) => storage.resetKey(subKey));
        },
        setObjectKey<T>(value: T): T {
            return storages.forEach((storage) => storage.setObjectKey(keyPath, value)), value;
        },
        deleteObjectKey() {
            storages.forEach((storage) => storage.deleteObjectKey(keyPath));
        },
    };
}

export function storageFactory(key: string, ...storageCreaters: any[]) {
    const backKey = key,
        storages = storageCreaters.map((storageCreater) => storageCreater(key));

    return {
        resetKey(subKey: string) {
            key = `${backKey}_${subKey}`;

            storages.forEach((storage) => storage.resetKey(subKey));
        },
        has(): boolean {
            return !!storages.last()?.has();
        },
        get(): string | void {
            for (const storage of storages) {
                const value = storage.get();

                if (non(value)) {
                    return value;
                }
            }
        },
        set(value: string) {
            return storages.forEach((storage) => storage.set(value)), value;
        },
        getObject<R = any>(): R | void {
            for (const storage of storages) {
                const value = storage.getObject();

                if (non(value)) {
                    return value;
                }
            }
        },
        setObject<T>(value: T): T {
            return storages.forEach((storage) => storage.setObject(value)), value;
        },
        updateObject<T>(value: T) {
            return storages.forEach((storage) => storage.updateObject(value)), value;
        },
        setObjectKey<T>(keyPath: string | string[], value: T): T {
            return storages.forEach((storage) => storage.setObjectKey(keyPath, value)), value;
        },
        deleteObjectKey(keyPath: string | string[]) {
            storages.forEach((storage) => storage.deleteObjectKey(keyPath));
        },
        remove() {
            storages.forEach((storage) => storage.remove());
        },
        clear() {
            storages.forEach((storage) => storage.clear());
        },
        createScene(keyPath: string | string[]) {
            return {
                setObjectKey<T>(value: T): T {
                    return storages.forEach((storage) => storage.setObjectKey(keyPath, value)), value;
                },
                deleteObjectKey() {
                    storages.forEach((storage) => storage.deleteObjectKey(keyPath));
                },
            };
        },
    };
}

export function createStorageByKey(key: string) {
    if (memoryStorageKeys[key]) {
        return createMemoryStorage(key);
    }

    if (sessionStorage.getItem(getKey(key))) {
        return createSessionStorage(key);
    }

    if (localStorage.getItem(getKey(key))) {
        return createLocalStorage(key);
    }
}
