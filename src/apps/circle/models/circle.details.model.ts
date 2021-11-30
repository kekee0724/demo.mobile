import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { authService } from "@reco-m/auth-service";
import { circleService, followService, interactiveTopicHttpService } from "@reco-m/ipark-white-circle-service";

import { Namespaces } from "./common";

export namespace circleDetailModel {
    export const namespace = Namespaces.circleDetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    let changeCounter = 0;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        getCustomerPage(state: any, { datas, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;
            return produce(state, (draft) => {
                let tempItem = datas.currentPage <= 1 ? datas.items : [...draft.items, ...datas.items];
                Object.assign(draft, datas, { items: tempItem, refreshing: false, hasMore: datas.currentPage < datas.totalPages });
            });
        },
    };

    const certifyCache = new Map();

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, data }, {  put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: "init" });
                yield put({ type: "getCurrentUser", message });
                yield put({ type: "getCircleTopic", id: data.id, data: data.datas, message });
                yield put({ type: "getCircleData", id: data.id, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCircleTopic({ message, data, id }, { call, put }) {
            try {
                const parm = { ...data, isValid: true, parkId: getLocalStorage("parkId"), topicId: id, isUserDelete: false, orderBy: "publishTime desc", isPublic: true };
                const thisChangeId = ++changeCounter;
                const datas = yield call(interactiveTopicHttpService.getPaged, parm);
                yield put({ type: "input", data: { pageIndex: datas.currentPage } });
                yield put({ type: "getCustomerPage", datas, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCircleTopicTwo({ message, data, id }, { call, put }) {
            try {
                const parm = { ...data, isValid: true, parkId: getLocalStorage("parkId"), topicId: id, orderBy: "publishTime desc", isPublic: true };
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
        *getCircleData({ message, id }, { call, put }) {
            try {
                const circleDetail = yield call(circleService.get, id, { parkId: getLocalStorage("parkId") });
                yield put({ type: "input", data: { circleDetail: circleDetail } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCurrentUser({ message }, { put, call }) {
            try {
                let parkId = getLocalStorage("parkId");
                let certifyDetail = certifyCache.get((parkId));
                if (!certifyDetail) {
                    const user = yield call(authService.refreshCurrentUser);
                    yield put({ type: "input", data: { user, certifyDetail } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        // 取消关注保留记录
        *cancelFollow({ id, callback, message }, { call }) {
            try {
                yield call(followService.cancelFollow, id);
                yield call(callback);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        // 关注
        *follow({ data, callback, message }, { call }) {
            try {
                const result = yield call(followService.follow, data);
                if (result) {
                    yield call(callback);
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *outCircle({ message, id, callback }, { call, put }) {
            try {
                const result = yield call(circleService.out, { id: id, parkId: getLocalStorage("parkId") });
                yield put({ type: "input", data: { result: result } });
                yield call(callback!, result);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *joinCircle({ message, id, callback }, { call, put }) {
            try {
                const result = yield call(circleService.Join, { id: id, parkId: getLocalStorage("parkId") });
                yield put({ type: "input", data: { result: result } });
                yield call(callback!, result);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(circleDetailModel);
