import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { newCouponHttpService } from "@reco-m/coupon-service";

import { Namespaces } from "./common";

export namespace couponchiceModel {
    export const namespace = Namespaces.couponchice;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            selectID: {},
            selectCouponTypeID: [],
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({
                    type: `getMemberOrderUseCoupon`,
                    sceneValue: data.sceneValue,
                    orderAmount: data.orderAmount,
                    message,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getMemberOrderUseCoupon({ sceneValue, orderAmount, message }, { call, put }) {
            try {
                const result = yield call(newCouponHttpService.getMyCoupon, {
                    parkId: getLocalStorage("parkId"),
                    status: 6,
                    sceneValueList: sceneValue,
                    pageSize: 500,
                    couponStatus: 4,
                }) || {};

                let items = result.items;
                let couponData: any = [];
                let unUseCouponData: any = [];
                if (items && items.length > 0) {
                    items.forEach((t) => {
                        if (!t.minUsefulAmount || t.minUsefulAmount <= orderAmount) {
                            couponData.push(t);
                        } else {
                            unUseCouponData.push(t);
                        }
                    });
                }
                yield put({ type: "input", data: { couponData: couponData, unUseCouponData: unUseCouponData } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(couponchiceModel);
