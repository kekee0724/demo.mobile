import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { resourceService } from "@reco-m/order-service";

import { newCouponHttpService } from "@reco-m/coupon-service";
import { ResourceTypeEnum } from "@reco-m/ipark-common";
import { Namespaces } from "./common";

export namespace positiondetailModel {
    export const namespace = Namespaces.positiondetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

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
                yield put({ type: "init" });
                yield put({ type: `getResourceRoomDetailAction`, data: data.detailid, message });
                if (Number(data.resourceType) === ResourceTypeEnum.working) {
                    yield put({
                        type: `couponGetAllPage`,
                        data: {
                            parkId: getLocalStorage("parkId"),
                            sceneValueList: ["station", "all"],
                            status: 0,
                            isShowInVoucherCenter: true,
                            pageSize: 1,
                            pageIndex: 1,
                        },
                        message,
                    });
                    yield put({
                        type: `couponGetPage`,
                        data: {
                            status: 1,
                            sceneValueList: ["station", "all"],
                            pageSize: 3,
                            parkId: getLocalStorage("parkId"),
                        },
                        message,
                    });
                } else if (Number(data.resourceType) === ResourceTypeEnum.advertisement) {
                    yield put({
                        type: `couponGetAllPage`,
                        data: {
                            parkId: getLocalStorage("parkId"),
                            sceneValueList: ["adsense", "all"],
                            status: 0,
                            isShowInVoucherCenter: true,
                            pageSize: 1,
                            pageIndex: 1,
                            orderBy: "isReceived,inputTime"
                        },
                        message,
                    });
                    yield put({
                        type: `couponGetPage`,
                        data: {
                            status: 1,
                            sceneValueList: ["adsense", "all"],
                            pageSize: 3,
                            parkId: getLocalStorage("parkId"),
                        },
                        message,
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getResourceRoomDetailAction({ message, data }, { call, put }) {
            try {
                const project = yield call(resourceService.getResourceDetail, data);
                let roomprice = "";
                if (project) {
                    if (project.price.length === 1) {
                        project.price[0].price === 0 ? (roomprice = "免费") : (roomprice = `${project.price[0].price}元`);
                    } else if (project.price.length > 1) {
                        let minprice = 1000000,
                            maxprice = 0;
                        project.price.forEach((item) => {
                            if (item.price > maxprice) {
                                maxprice = item.price;
                            }
                            if (item.price < minprice) {
                                minprice = item.price;
                            }
                        });
                        roomprice = `${minprice}-${maxprice}元`;
                    }
                }
                yield put({ type: "input", data: { roomdetail: project, roomPrice: roomprice } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *couponGetPage({ message, data }, { call, put }) {
            try {
                const reslut = yield call(newCouponHttpService.getMyCoupon, data);
                yield put({ type: "input", data: { couponData: reslut } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *couponGetAllPage({ message, data }, { call, put }) {
            try {
                const allCoupon = yield call(newCouponHttpService.getAllCoupon, data);
                yield put({ type: "input", data: { allCouponCount: +allCoupon.totalItems } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(positiondetailModel);
