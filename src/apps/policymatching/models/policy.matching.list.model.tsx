import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { policyService } from "@reco-m/policymatching-service";

import { tagService } from "@reco-m/tag-service";

import { Namespaces } from "./common";

export namespace policymatchinglistModel {
    export const namespace = Namespaces.policymatchinglist;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        policyPage(state: any, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;
            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },
        policyMatchingPage(state: any, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;
            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `getApplyTags`, message, isGlobalSearch: data.isGlobalSearch, applyTagsCallback: data.applyTagsCallback });
                yield put({
                    type: `getPolicy`,
                    pageIndex: 1,
                    key: "",
                    searchParamkey: data.key,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getApplyTags({ message, isGlobalSearch, applyTagsCallback }, { call, put }) {
            try {
                const zhengclb = yield call(tagService.getTagByTagClass, { tagClass: "Policy/zhengclb", parkId: getLocalStorage("parkId") });
                const tuijian = [{ tagName: isGlobalSearch ? "全部" : "推荐", id: "" }];
                const tabs = tuijian.concat(zhengclb);
                yield put({ type: "input", data: { ApplyTags: tabs } });
                applyTagsCallback(tabs);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getPolicy({ message, pageIndex, searchParamkey, key }, { call, put }) {
            try {

                const params = {
                    pageIndex: pageIndex,
                    pageSize: 15,
                    applyTagID: key,
                    parkId: getLocalStorage("parkId"),
                    key: searchParamkey,
                    isValid: true,
                };

                const thisChangeId = ++changeCounter,
                    data = yield call(policyService.getPaged, params);

                yield put({ type: "policyPage", data, thisChangeId });
                yield put({ type: "input", data: { showList: true } });
                // callback();
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(policymatchinglistModel);
