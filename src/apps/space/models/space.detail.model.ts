import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, formatDate, getLocalStorage, isAnonymous } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { spaceProjectService } from "@reco-m/space-service";

import { parkCateService, parkService } from "@reco-m/park-service";

import { resourceService } from "@reco-m/order-service";

import { workOrderService } from "@reco-m/workorder-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";


import { Namespaces } from "./common";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace spacedetailModel {
    export const namespace = Namespaces.spacedetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        space(state: any, { data }) {
            return produce(state, (draft) => {
                Object.assign(draft, data);
            });
        },
        spaceRoom(state: any, { data }) {
            return produce(state, (draft) => {
                Object.assign(draft, data);
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        init() {
            return state;
        },
        *initPage({ id, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: "input", data: { selectType: 0, showTexts: false } });
                yield put({ type: `getSpaceDetailWithIDAction`, message, spacedetail: id });
                yield put({ type: `getSpaceRoomAction`, message, roomType: 32, id: id });

                yield put({ type: "getParkDetailAction", message, inpree: getLocalStorage("parkId") });

                if (!isAnonymous()) {
                    yield put({ type: `getCurrentMember`, message });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getSpaceDetailWithIDAction({ message, spacedetail }, { call, put }) {
            try {
                const spaceDetail = yield call(spaceProjectService.getProjectDetail, spacedetail);
                const data = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.space, bindTableId: spacedetail, customType: 0 });
                yield put({ type: "update", data: { spaceDetailData: spaceDetail, imgUrls: data || [] } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getSpaceRoomAction({ message, roomType, id }, { call, put }) {
            try {
                const spaceroom = {
                    projectId: id,
                    parkId: getLocalStorage("parkId"),
                    resourceType: roomType,
                    // isFilterEffective: true,
                    pageIndex: 1,
                    pageSize: 999,
                    startDate: formatDate(new Date()) + " 00:00:00",
                    endDate: formatDate(new Date()) + " 23:59:59",
                };
                const spaceDetail = yield call(resourceService.getResource, spaceroom);
                yield put({ type: "input", data: { roomData: (spaceDetail && spaceDetail.items) || [] } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCurrentMember({ message }, { put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser || {};
                if (currentUser.id) {
                    yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                    const memberState = yield select((state) => state[memberNamespaces.member]),
                        currentMember = memberState.member;
                    yield put({ type: "input", data: { currentMember: currentMember, currentUser: user } });
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

                const user = yield select((state) => state[authNamespaces.user]);

                if (user.id) {
                    const catalogue = yield call(parkCateService.getCateByCode, "ruzsq"),
                        data = yield call(workOrderService.getByUser, {
                            ...params,
                            catalogueID: catalogue && catalogue.id,
                            inputerID: user.id,
                            parkId: getLocalStorage("parkId"),
                            showHidCatalogs: true,
                        });

                    const projectItems = data.items;

                    yield put({
                        type: "input",
                        data: {
                            projectItems: projectItems,
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
    };
}

app.model(spacedetailModel);
