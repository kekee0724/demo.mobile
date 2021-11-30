import {
    getSessionStorage,
    setSessionStorage,
    getSessionStorageObject,
    setSessionStorageObject,
    updateSessionStorageObject,
    setSessionStorageObjectKey,
    deleteSessionStorageObjectKey,
    removeSessionStorage,
    createSessionStorageScene,
    createSessionStorage,
    getLocalStorage,
    setLocalStorage,
    getLocalStorageObject,
    setLocalStorageObject,
    updateLocalStorageObject,
    setLocalStorageObjectKey,
    deleteLocalStorageObjectKey,
    removeLocalStorage,
    createLocalStorageScene,
    createLocalStorage,
    getMemoryStorage,
    setMemoryStorage,
    updateMemoryStorageObject,
    setMemoryStorageObjectKey,
    deleteMemoryStorageObjectKey,
    removeMemoryStorage,
    createMemoryStorageScene,
    createMemoryStorage,
    getStorage,
    getStorageObject,
    setStorage,
    setStorageObject,
    updateStorageObject,
    setStorageObjectKey,
    deleteStorageObjectKey,
    removeStorage,
    createStorageScene,
    createStorage,
    storageSceneFactory,
    storageFactory,
    createStorageByKey,
} from "./storage";

function getCurrentUserKey(key: string) {
    return `${key}_${getSessionStorage("currentUserId") || 0}`;
}

export function getCurrentUserSessionStorage(key: string): string {
    return getSessionStorage(getCurrentUserKey(key));
}

export function setCurrentUserSessionStorage(key: string, value: string): string {
    return setSessionStorage(getCurrentUserKey(key), value);
}

export function getCurrentUserSessionStorageObject<R = any>(key: string): R {
    return getSessionStorageObject<R>(getCurrentUserKey(key));
}

export function setCurrentUserSessionStorageObject<T>(key: string, value: T): T {
    return setSessionStorageObject(getCurrentUserKey(key), value);
}

export function updateCurrentUserSessionStorageObject<T>(key: string, value: T): T {
    return updateSessionStorageObject(getCurrentUserKey(key), value);
}

export function setCurrentUserSessionStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return setSessionStorageObjectKey(getCurrentUserKey(key), keyPath, value);
}

export function deleteCurrentUserSessionStorageObjectKey(key: string, keyPath: string | string[]): void {
    deleteSessionStorageObjectKey(getCurrentUserKey(key), keyPath);
}

export function removeCurrentUserSessionStorage(key: string): void {
    removeSessionStorage(getCurrentUserKey(key));
}

export function createCurrentUserSessionStorageScene(key: string, keyPath: string | string[]) {
    return createSessionStorageScene(getCurrentUserKey(key), keyPath);
}

export function createCurrentUserSessionStorage(key: string) {
    return createSessionStorage(getCurrentUserKey(key));
}

export function getCurrentUserLocalStorage(key: string): string {
    return getLocalStorage(getCurrentUserKey(key));
}

export function setCurrentUserLocalStorage(key: string, value: string): string {
    return setLocalStorage(getCurrentUserKey(key), value);
}

export function getCurrentUserLocalStorageObject<R = any>(key: string): R {
    return getLocalStorageObject<R>(getCurrentUserKey(key));
}

export function setCurrentUserLocalStorageObject<T>(key: string, value: T): T {
    return setLocalStorageObject(getCurrentUserKey(key), value);
}

export function updateCurrentUserLocalStorageObject<T>(key: string, value: T): T {
    return updateLocalStorageObject(getCurrentUserKey(key), value);
}

export function setCurrentUserLocalStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return setLocalStorageObjectKey(getCurrentUserKey(key), keyPath, value);
}

export function deleteCurrentUserLocalStorageObjectKey(key: string, keyPath: string | string[]): void {
    deleteLocalStorageObjectKey(getCurrentUserKey(key), keyPath);
}

export function removeCurrentUserLocalStorage(key: string): void {
    removeLocalStorage(getCurrentUserKey(key));
}

export function createCurrentUserLocalStorageScene(key: string, keyPath: string | string[]) {
    return createLocalStorageScene(getCurrentUserKey(key), keyPath);
}

export function createCurrentUserLocalStorage(key: string) {
    return createLocalStorage(getCurrentUserKey(key));
}

export function getCurrentUserMemoryStorage<R = any>(key: string) {
    return getMemoryStorage<R>(getCurrentUserKey(key));
}

export function setCurrentUserMemoryStorage<T>(key: string, value: T): T {
    return setMemoryStorage(getCurrentUserKey(key), value);
}

export function updateCurrentUserMemoryStorageObject<T>(key: string, value: T): T {
    return updateMemoryStorageObject(getCurrentUserKey(key), value);
}

export function setCurrentUserMemoryStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return setMemoryStorageObjectKey(getCurrentUserKey(key), keyPath, value);
}

export function deleteCurrentUserMemoryStorageObjectKey(key: string, keyPath: string | string[]): void {
    deleteMemoryStorageObjectKey(getCurrentUserKey(key), keyPath);
}

export function removeCurrentUserMemoryStorage(key: string): void {
    removeMemoryStorage(getCurrentUserKey(key));
}

export function createCurrentUserMemoryStorageScene(key: string, keyPath: string | string[]) {
    return createMemoryStorageScene(getCurrentUserKey(key), keyPath);
}

export function createCurrentUserMemoryStorage(key: string) {
    return createMemoryStorage(getCurrentUserKey(key));
}

export function getCurrentUserStorage(key: string) {
    return getStorage(getCurrentUserKey(key));
}

export function getCurrentUserStorageObject<R = any>(key: string) {
    return getStorageObject<R>(getCurrentUserKey(key));
}

export function setCurrentUserStorage(key: string, value: string): string {
    return setStorage(getCurrentUserKey(key), value);
}

export function setCurrentUserStorageObject<T>(key: string, value: T): T {
    return setStorageObject(getCurrentUserKey(key), value);
}

export function updateCurrentUserStorageObject<T>(key: string, value: T): T {
    return updateStorageObject(getCurrentUserKey(key), value);
}

export function setCurrentUserStorageObjectKey<T>(key: string, keyPath: string | string[], value: T): T {
    return setStorageObjectKey(getCurrentUserKey(key), keyPath, value);
}

export function deleteCurrentUserStorageObjectKey(key: string, keyPath: string | string[]): void {
    deleteStorageObjectKey(getCurrentUserKey(key), keyPath);
}

export function removeCurrentUserStorage(key: string): void {
    removeStorage(getCurrentUserKey(key));
}

export function createCurrentUserStorageScene(key: string, keyPath: string | string[]) {
    return createStorageScene(getCurrentUserKey(key), keyPath);
}

export function createCurrentUserStorage(key: string) {
    return createStorage(getCurrentUserKey(key));
}

export function storageCurrentUserSceneFactory(key: string, keyPath: string | string[], ...storageCreaters: any[]) {
    return storageSceneFactory(getCurrentUserKey(key), keyPath, ...storageCreaters);
}

export function storageCurrentUserFactory(key: string, ...storageCreaters: any[]) {
    return storageFactory(getCurrentUserKey(key), ...storageCreaters);
}

export function createCurrentUserStorageByKey(key: string) {
    return createStorageByKey(getCurrentUserKey(key));
}
