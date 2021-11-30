/**
 * 组合函数
 * @param funcs 需要组合的函数
 * @returns 组合后的函数
 */
export function composeFuncs(...funcs: Function[]) {
    return (...args: any[]) => {
        return funcs.map(func => func(...args));
    };
}
