import { ReducersMapObject, AnyAction } from "redux";
import { get, set, isObjectLike, isArray, isString, mergeWith, assign } from "lodash";
import produce, { Draft } from "immer";

// 实例
// let objects = {
//     a: 1, b: { d: 4, e: [5, 6, 7] }, c: 3
// };
// let result = mergeState(objects, {key: "b.d", data: 999})
// console.log('result', result);

export function mergeState(state: any, { key, data }: any) {
    return produce(state, (draft: Draft<any>) => {
        if (isArray(key) || isString(key)) {
            const value = get(draft, key);

            isObjectLike(value) ? mergeWith(value, data, customizer) : set(draft, key, data);
        } else {
            return mergeWith(draft, data, customizer);
        }
    });
}

function customizer(objValue: any, srcValue: any) {
    if (isArray(objValue)) {
        return srcValue;
    }
}

export const CoreReducers: ReducersMapObject<any, AnyAction> = {
    delete(state: any, { key }) {
        return produce(state, (draft) => set(draft, key!, null));
    },
    update(state: any, { key, data }) {
        return produce(state, (draft) => (key ? set(draft, key, data) : assign(draft, data)));
    },
    reset({}: any, { data }) {
        return produce(data);
    },
    input(state: any, action: AnyAction) {
        return mergeState(state, action);
    },
    showLoading(state: any, action: AnyAction) {
        return mergeState(state, { ...action, data: { isLoading: !0, ...action.data } });
    },
    hideLoading(state: any, action: AnyAction) {
        return mergeState(state, { ...action, data: { isLoading: !1, ...action.data } });
    },
};
