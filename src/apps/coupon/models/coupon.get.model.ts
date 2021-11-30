import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { newCouponHttpService } from "@reco-m/coupon-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { tagService } from "@reco-m/tag-service";
import { Namespaces } from "./common";

export namespace coupongetModel {
    export const namespace = Namespaces.couponget;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            selectID: {},
            selectCouponTypeID: [],
        },
        !0
    );

    let changeCounter = 0;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        getCouponListPage(state, { couponList, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, couponList, {
                    items: couponList.currentPage <= 1 ? couponList.items : [...draft.items, ...couponList.items],
                    refreshing: false,
                    hasMore: couponList.currentPage < couponList.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `couponGetPage`, message, data });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *couponGetPage({ message, data }, { call, put, select }) {
            try {
                const reslut = yield call(newCouponHttpService.getAllCoupon, { ...data, isReceiveOver: false });
                yield put({ type: "input", data: { couponData: reslut } });
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);
                yield put({
                    type: "input",
                    data: {
                        user: user,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *initCouponPage({ data, message }, { put, call }) {
            put({ type: "showLoading" });

            try {
                const tags = yield call(tagService.getTagByTagClass, {
                    tagClass: "COUPON/shiycj",
                });
                let typeTabs = [{ title: "全部", scenceCode: "", sub: 0 }] as any;
                tags && tags.forEach((element: any, index: number) => {
                    let tem: any = {};
                    tem.title = element.tagName;
                    tem.scenceCode = element.tagValue;
                    tem.sub = index + 1;
                    typeTabs.push(tem)
                });
                yield put({ type: "input", data: { tabs: typeTabs, scenceCode: "" } });
                yield put({ type: "couponGetListPage", data });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *couponGetListPage({ message, data }, { call, put, select }) {
            try {
                let thisChangeId = ++changeCounter,
                    couponList = yield call(newCouponHttpService.getAllCoupon, { ...data, pageSize: 999 });
                yield put({ type: "getCouponListPage", couponList, thisChangeId });

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);
                yield put({ type: "input", data: { user: user } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *gainCoupon({ message, data, params, gainSuccess }, { call, select }) {
            try {
                const state = yield select((state) => state[Namespaces.couponget]),
                    user = state!.user,
                    currentUser = user!.currentUser;
                const reslut = yield call(newCouponHttpService.gainCoupon, data.CouponID, {
                    userId: currentUser.id,
                    userName: currentUser.nickName,
                    ...params,
                });
                if (reslut) {
                    gainSuccess();
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(coupongetModel);
