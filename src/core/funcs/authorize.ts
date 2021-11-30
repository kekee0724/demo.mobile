import { getCurrentUserStorage } from "./current-user.storage";

let strategies: any = [],
    unitStrategies: any = {},
    strategy_cache: any = {};

export function refreshStrategies(rules: any) {
    strategy_cache = {};

    if (Array.isArray(rules)) {
        strategies = rules;
    } else {
        strategies = rules.strategies || [];
        unitStrategies = rules.unitStrategies || {};
    }
}

export function refreshUnitStrategies(rules: any = {}) {
    strategy_cache = {};

    unitStrategies = rules;
}

export function checkStrategy(code: string, app: string = "") {
    const key = "checkStrategy:" + (app ? code + ":" + app : code);

    if (strategy_cache.hasOwnProperty(key)) return strategy_cache[key];

    return (strategy_cache[key] = app
        ? strategies.some((item) => (app.endsWith("_") ? item.startsWith(code + ":" + app) : item === code + ":" + app))
        : strategies.some((item) => item === code || item.substr(0, item.indexOf(":")) === code));
}

export function checkStrategyPrefix(code: string) {
    const key = "checkStrategyPrefix:" + code;

    return strategy_cache.hasOwnProperty(key) ? strategy_cache[key] : (strategy_cache[key] = strategies.some((item) => item.startsWith(code)));
}

export function checkStrategyAny(...codes: string[]): boolean {
    const key = "checkStrategyAny:" + codes.join();

    return strategy_cache.hasOwnProperty(key) ? strategy_cache[key] : (strategy_cache[key] = codes.some((v) => checkStrategy(v)));
}

export function checkStrategyAll(...codes: string[]): boolean {
    const key = "checkStrategyAll:" + codes.join();

    return strategy_cache.hasOwnProperty(key) ? strategy_cache[key] : (strategy_cache[key] = codes.every((v) => checkStrategy(v)));
}

export function checkStrategyRegExp(exp: RegExp): boolean {
    const key = "checkStrategyRegExp:" + exp;

    return strategy_cache.hasOwnProperty(key) ? strategy_cache[key] : (strategy_cache[key] = strategies.some((v) => exp.test(v)));
}

export function checkStrategyRegExpAny(...exps: RegExp[]): boolean {
    const key = "checkStrategyRegExpAny:" + exps.join();

    return strategy_cache.hasOwnProperty(key) ? strategy_cache[key] : (strategy_cache[key] = exps.some((v) => checkStrategyRegExp(v)));
}

export function checkStrategyRegExpAll(...exps: RegExp[]): boolean {
    const key = "checkStrategyRegExpAll:" + exps.join();

    return strategy_cache.hasOwnProperty(key) ? strategy_cache[key] : (strategy_cache[key] = exps.every((v) => checkStrategyRegExp(v)));
}

export function checkStrategyUnit(code: string, unitId?: any, app?: string): boolean {
    unitId = unitId && unitId !== 0 ? unitId : getCurrentUserStorage("unitId");

    const key = "checkStrategyUnit:" + unitId + ":" + code + (app ? ":" + app : "");
    const filter = app
        ? (item) => (app.endsWith("_") ? item.startsWith(code + ":" + app) : item === code + ":" + app)
        : (item) => item === code || item.substr(0, item.indexOf(":")) === code;

    return strategy_cache.hasOwnProperty(key) ? strategy_cache[key] : (strategy_cache[key] = unitStrategies[unitId] && unitStrategies[unitId].some(filter));
}
