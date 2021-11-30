import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces } from "./common";
import { interactiveTopicHttpService, followService } from "@reco-m/ipark-white-circle-service";
import { authService } from "@reco-m/auth-service";

export namespace NewesttopicdetailsModel {
    export const namespace = Namespaces.newesttopicdetails;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            title: "全部动态",
            show: false,
            isMyFollow: false,
            pageSize: 5,
            pageIndex: 1,
        },
        !0
    );

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

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, data }, { put }) {
            try {
                yield put({ type: "init" });
                yield put({ type: "getCurrentUser", data, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCurrentUser({ data, message }, { put, call }) {
            try {
                const user = yield call(authService.getCurrentUser);
                yield put({ type: "getCircleTopic", data: data.datas, message });
                yield put({ type: "input", data: { user: user } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCircleTopic({ message, data }, { call, put, select }) {
            
            try {
                if (data.isMyFollow) {
                    yield put({ type: "input", data: { isMyFollow: data.isMyFollow } });
                } else {
                    const newesttopicdetails = yield select((state) => state[Namespaces.newesttopicdetails]);
                    const isMyFollow = newesttopicdetails.isMyFollow;
                    data.isMyFollow = isMyFollow;
                    yield put({ type: "input", data: { categoryValue: data.categoryValue } });
                }

                const parm = { ...data, isValid: true, parkId: getLocalStorage("parkId"), orderBy: "publishTime desc", isUserDelete: false, isPublic: true };
                const thisChangeId = ++changeCounter;
                const datas = yield call(interactiveTopicHttpService.getPaged, parm);
                yield put({ type: "input", data: { pageIndex: datas.currentPage } });
                yield put({ type: "getCustomerPage", datas, thisChangeId });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCircleTopicTwo({ message }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });
                const newesttopicdetails = yield select((state) => state[Namespaces.newesttopicdetails]);
                const pageIndex = newesttopicdetails.pageIndex;
                const isMyFollow = newesttopicdetails.isMyFollow;
                const data = {
                    pageIndex: 1,
                    pageSize: pageIndex * 5,
                    categoryValue: getLocalStorage("categoryValue"),
                    isMyFollow: isMyFollow ? isMyFollow : null,
                };
                const parm = { ...data, isValid: true, parkId: getLocalStorage("parkId"), orderBy: "publishTime desc", isUserDelete: false, isPublic: true };
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
    };
}

app.model(NewesttopicdetailsModel);
