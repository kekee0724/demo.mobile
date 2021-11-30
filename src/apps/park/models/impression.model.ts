import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, getLocalStorage, isAnonymous } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { parkCateService, parkService } from "@reco-m/park-service";

import { Namespaces } from "./common";
import { workOrderService } from "@reco-m/workorder-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace impressionModel {
    export const namespace = Namespaces.impression;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            showmap: true,
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
        *initPage({ message, parkId }, { put }) {
            try {
                yield put({ type: "showLoading" });
                if (!isAnonymous()) {
                    yield put({ type: "getByUser", message });
                }
                if (parkId) {
                    yield put({ type: "getParkDetailAction", message, inpree: parkId });
                } else {
                    yield put({ type: "getParkDetailAction", message, inpree: getLocalStorage("parkId") });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getByUser({ params, message }, { call, select, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = user && user.currentUser;

                if (currentUser.id) {
                    const catalogue = yield call(parkCateService.getCateByCode, "ruzsq"),
                        data = yield call(workOrderService.getByUser, {
                            ...params,
                            catalogueId: catalogue && catalogue.id,
                            inputerId: currentUser.id,
                            parkId: getLocalStorage("parkId"),
                            showHidCatalogs: true,
                        });

                    const checkDetailData = data.items;

                    const checkDetailDataItem = checkDetailData?.length > 0 ? checkDetailData[0].order : {};

                    // 入驻申请状态
                    const checkStatus = checkDetailDataItem.status;
                    // 入驻申请工单id
                    const checkOrderId = checkDetailDataItem.id;
                    // 入驻申请状态机stateid
                    const topicStatus = checkDetailDataItem.topicStatus;
                    yield put({
                        type: "update",
                        data: {
                            rzsqOrder: {
                                checkStatus,
                                checkOrderId,
                                topicStatus,
                            },
                        },
                    });
                    yield put({ type: "hideLoading" });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getParkDetailAction({ message, inpree }, { call, put }) {
            try {
                const data = yield call(parkService.getParkDetail, inpree);
                yield put({ type: "getParkPicturesAction", id: inpree });
                yield put({
                    type: "update",
                    data: {
                        // parkInfon: data.Park,
                        parkImpressionDetailData: data || {},
                        ...data,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getParkPicturesAction({ message, id }, { call, put }) {
            try {
                const data = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.space, bindTableId: id, customType: 0 });

                yield put({
                    type: "input",
                    data: {
                        parkPictureAsync: data || [],
                        // pictureSrc: pictureSrc
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(impressionModel);
