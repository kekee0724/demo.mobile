import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { activityHttpService } from "@reco-m/activity-service";

import { Namespaces } from "./common";

export namespace activityModel {
    let changeCounter = 0;

    export const namespace = Namespaces.activity;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            down: true,
            CurrentPage: 0,
            pageSize: 8,
            hasMore: true,
            orderBy: "inputTime desc",
            selectedActivityNumber: 0,
            newestActivityOrder: true,
            hottestActivityOrder: false,
            mostActivityOrder: false,
            activityTimeOrder: false,
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
        getActivityContentsPage(state, { params, thisChangeId }) {
            // 获取活动列表
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, params, { items: params.currentPage <= 1 ? params.items : [...draft.items, ...params.items], refreshing: false, hasMore: params.currentPage < params.totalPages });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: "getActivityContents", data, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *initPageHome({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: "getActivityHomeContents", data, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getActivityContents({ message, data }, { call, put }) {
            try {
                yield put({ type: "input", data: { activityTypeValue: data.activityTypeValue } });
                const thisChangeId = ++changeCounter,
                    params = yield call(activityHttpService.getPaged, { pageSize: 8, ...data });
                yield put({ type: "getActivityContentsPage", params, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getActivityHomeContents({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const params = yield call(activityHttpService.getPaged, { pageSize: 3, ...data });

                yield put({ type: "input", data: { content: params } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(activityModel);
