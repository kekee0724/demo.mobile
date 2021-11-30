import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { articleHttpService } from "@reco-m/article-service";

import { Namespaces } from "./common";

export namespace noticeWhiteModel {
    export const namespace = Namespaces.noticeWhite;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        getNoticeListPage(state: any, { params, thisChangeId }) {
            // 获取通知通告列表
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, params, {
                    items: params.currentPage <= 1 ? params.items : [...draft.items, ...params.items],
                    refreshing: false,
                    hasMore: params.currentPage < params.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `getnoticeList`, data, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getnoticeList({ message, data }, { call, put }) {
            try {
                const thisChangeId = ++changeCounter,
                    params = yield call(articleHttpService.getPaged, {
                        pageSize: 25,
                        orderBy: "isTop desc,sequence asc,publishTime desc",
                        ...data,
                    });
                yield put({
                    type: "getNoticeListPage",
                    params,
                    thisChangeId,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(noticeWhiteModel);
