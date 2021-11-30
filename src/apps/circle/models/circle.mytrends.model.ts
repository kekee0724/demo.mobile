import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { interactiveTopicHttpService } from "@reco-m/ipark-white-circle-service";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

export namespace myTrendModel {
    export const namespace = Namespaces.myTrend;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    let changeCounter = 0;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        getCustomerPage(state: any, { datas, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;
            return produce(state, (draft) => {
                Object.assign(draft, datas, {
                    items: datas.currentPage <= 1 ? datas.items : [...draft.items, ...datas.items],
                    refreshing: false,
                    hasMore: datas.currentPage < datas.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, data }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: "init" });
                yield put({ type: "getCircleTopic", id: data.id, data: data.datas, message });
                yield put({ type: `getUserInfo`, userID: data.id, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCircleTopic({ message, data, id }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const parm = { ...data, inputerId: id, isPublic: true, parkId: getLocalStorage("parkId"), isUserDelete: false, orderBy: "publishTime desc", pageSize: 9999 };
                const thisChangeId = ++changeCounter;
                const datas = yield call(interactiveTopicHttpService.getPaged, parm);
                yield put({ type: "getCustomerPage", datas, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *delTopic({ message, id, callback }, { call }) {
            try {
                yield call(interactiveTopicHttpService.deletes, id);
                if (callback) yield call(callback);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getUserInfo({ message, userID }, { select, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]) || {},
                    currentUser = user.currentUser || {};
                const isNotCurrentUser = currentUser.id === userID ? false : true; // 判断显示主页是否是当前用户的

                let data = {};
                data[`isNotCurrentUser${userID}`] = isNotCurrentUser;
                yield put({
                    type: "input",
                    data: data,
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

app.model(myTrendModel);
