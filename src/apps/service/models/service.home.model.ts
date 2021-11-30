import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage, isAnonymous, setStorageObject } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { appModuleService } from "@reco-m/service-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces as memberNamespaces, myCertifyModel } from "@reco-m/member-models";

import { parkCateService } from "@reco-m/park-service";

import { workOrderService } from "@reco-m/workorder-service";

import { Namespaces, isEqual, MAX_ITEM_NUM } from "./common";
export namespace iparkServiceHomeModel {
    export const namespace = Namespaces.serviceHome;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            tags: [],
            menus: [],
            isEdit: false,
            modules: null,
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
        ...myCertifyModel.effects,
        *initPage({ message }, { put }) {
            try {
                if (!isAnonymous()) {
                    yield put({ type: "getByUser", message });
                    yield put({
                        type: "getUserProfile",
                        params: {
                            ownerId: getLocalStorage("parkId") ? getLocalStorage("parkId") : 1,
                            ownerType: 3,
                            areaCode: "IPARK",
                        },
                        message,
                    });
                    yield put({ type: "getCertifyMember", message });
                }
                
                if (getLocalStorage("parkId")) {
                    yield put({
                        type: "getAppModules",
                        params: {
                            ownerId: getLocalStorage("parkId") ? getLocalStorage("parkId") : 1,
                            ownerType: 3,
                            areaCode: "IPARK",
                        },
                        message,
                    });
                }
                
               
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getUserProfile({ params, message }, { call, put }) {
            // 新增可配置跳转内部和外部浏览器
            try {
                const result = yield call(appModuleService.getHomeModules, params);
                yield put({ type: "input", data: { menus: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getAppModules({ message, params }, { call, put }) {
            try {
                const modules = yield call(appModuleService.getModules, params);
                setStorageObject("servicecacheModules", modules);
                yield put({ type: "input", data: { modules: modules.serviceList || [] } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCertifyMember({ message }, { select, put }) {
            try {
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member;
                yield put({ type: "update", data: { member: member } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *edit({ params }, { call, put }) {
            try {
                if (params.isEdit) {
                    yield put({ type: "showLoading" });
                    yield put({ type: "input", data: { isEdit: !params.isEdit } });
                    let ItemIDs;
                    if (params.menus) {
                        ItemIDs = params.menus.map((item) => {
                            return item.id;
                        });
                    }
                    let paramsData = {
                        appIds: ItemIDs,
                        ownerId: getLocalStorage("parkId") ? getLocalStorage("parkId") : 1,
                        ownerType: 3,
                        areaCode: "IPARK",
                    };
                    yield call(appModuleService.postHomeModules, paramsData);
                    yield put({ type: "hideLoading" });
                } else {
                    yield put({ type: "hideLoading" });
                    yield put({ type: "input", data: { isEdit: !params.isEdit } });
                }
            } catch (e) {
                yield put({ type: "hideLoading" });
            }
        },
        *removeItem({ message, params }, { put }) {
            try {
                if (isEqual(params.item, params.menus) > -1) {
                    let filter = params.menus.filter((menu) => params.item.moduleName.indexOf(menu.moduleName) === -1);
                    yield put({ type: "input", data: { menus: filter } });
                } else {
                    message!.error(`抱歉,未找到此应用`);
                }
            } catch (e) {
                yield put({ type: "hideLoading" });
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *itemClick({ message, params }, { put }) {
            try {
                if (params.menus.length >= MAX_ITEM_NUM) {
                    message!.error(`您最多添加${MAX_ITEM_NUM}个应用`);
                } else {
                    if (isEqual(params.item, params.menus) > -1) {
                        message!.error(`抱歉,您已经添加了此应用`);
                    } else {
                        let nMenus = params.menus.concat([params.item]);
                        yield put({ type: "input", data: { menus: nMenus } });
                    }
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *sortItem({ message, children }, { select, put }) {
            try {
                const state = yield select((state) => state[Namespaces.serviceHome]),
                    menus = state!.menus,
                    childrens = Array.from(children);
                let sortMenus = [];

                childrens.forEach((item: any) => {
                    menus.forEach((i) => {
                        if (item.id === i.id) {
                            sortMenus.push(i as never);
                        }
                    });
                });
                yield put({ type: "input", data: { menus: sortMenus } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
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
    };
}

app.model(iparkServiceHomeModel);
