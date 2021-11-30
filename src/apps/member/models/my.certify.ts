import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { parkCateService } from "@reco-m/park-service";

import { myMarketInHttpService, workOrderService } from "@reco-m/workorder-service";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { memberServiceHttpService } from "@reco-m/workorder-service";

import { Namespaces } from "./common";

export namespace myCertifyModel {
    export const namespace = Namespaces.myCertify;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `getCurrentUser`, message });
                yield put({ type: `getMember`, message });
                yield put({ type: `getInstitution`, message });
                yield put({ type: `${Namespaces.intergral}/getLoyal`, currentIntergralType: 0 });
                yield put({ type: `notificationCount/getNotificationCount` });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCurrentUser({ message }, { call, put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/cleanCurrentUser`, message });
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                const pictureSrc = yield call(pictureService.getPictureList, {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: currentUser.id,
                    customType: 1,
                });

                yield put({
                    type: "update",
                    data: { currentUser: currentUser, thumb: pictureSrc && pictureSrc.length ? pictureSrc[pictureSrc.length - 1] : null, random: Math.random() },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getMember({ message }, { put, select }) {
            try {
                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message, refresh: true });
                const memberState: any = yield select((state) => state[Namespaces.member]),
                    member = memberState.member || {};

                yield put({ type: "input", data: { member: member.id ? member : null } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getInstitution({ message }, { call, put }) {
            try {
                const result = yield call(myMarketInHttpService.getMyInstitution);

                yield put({ type: "update", data: { institution: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getByUser({ params, message }, { call, select, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                let pendingBusiness;
                let staffManagerCount = 0,
                    visitorCount = 0,
                    serviceCount = 0;

                if (getLocalStorage("companyId")) {
                    pendingBusiness = yield call(memberServiceHttpService.pendingBusiness, {
                        parkId: getLocalStorage("parkId"),
                        customerId: getLocalStorage("companyId"),
                    });
                }

                pendingBusiness &&
                    pendingBusiness.forEach((item) => {
                        if (item.code === "memberAuthentication") {
                            staffManagerCount = +item.number;
                        } else if (item.code === "visitorOrder") {
                            visitorCount = +item.number;
                        } else if (item.code === "serviceAlliance") {
                            serviceCount = +item.number;
                        }
                    });

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
                            orderBy: "id desc",
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
                            staffManagerCount,
                            visitorCount,
                            serviceCount,
                        },
                    });
                    yield put({ type: "hideLoading" });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(myCertifyModel);
