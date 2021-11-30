import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { collectionHttpService } from "@reco-m/favorites-service";

import { Namespaces } from "./common";

export namespace favoritesModel {
    export const namespace = Namespaces.favorites;

    let favoritesCounter = 0;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            items: [],
            key: "",
            favorites: "",
            bindTableName: "",
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        favoritesPage(state: any, { params, thisChangeId }) {
            if (thisChangeId < favoritesCounter) return state;

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
                yield put({ type: `getUserFollow`, data, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getUserFollow({ data, message }, { call, select, put }) {
            try {
                yield put({ type: "showLoading" });
                const thisChangeId = ++favoritesCounter;

                const state = yield select((state) => state[Namespaces.favorites]);
                let params = {};

                if (state!.key === "") {
                    params = yield call(collectionHttpService.getPaged, {
                        pageIndex: data!.pageIndex,
                        orderBy: "inputTime desc",
                    });
                }

                if (state!.key !== "" && state!.bindTableName === "") {
                    params = yield call(collectionHttpService.getPaged, {
                        pageSize: state!.pageSize,
                        pageIndex: data!.pageIndex,
                        key: data!.key,
                        orderBy: "inputTime desc",
                    });
                }

                if (state!.bindTableName !== "" && state!.key === "") {
                    params = yield call(collectionHttpService.getPaged, {
                        pageSize: state!.pageSize,
                        pageIndex: data!.pageIndex,
                        bindTableName: state!.bindTableName,
                        orderBy: "inputTime desc",
                    });
                }

                if (state!.key !== "" && state!.bindTableName !== "") {
                    params = yield call(collectionHttpService.getPaged, {
                        pageSize: state!.pageSize,
                        pageIndex: data!.pageIndex,
                        key: data!.key,
                        bindTableName: state!.bindTableName,
                        orderBy: "inputTime desc",
                    });
                }

                yield put({ type: "favoritesPage", params, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        // 取消收藏
        *unFollow({ data, message, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const result = yield call(collectionHttpService.cancelCollection, data);

                yield call(callback!, result);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(favoritesModel);
