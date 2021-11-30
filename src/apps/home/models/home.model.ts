import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import * as routerRedux from "react-router-redux";

import { freeze } from "immer";

import { getLocalStorage, CoreEffects, CoreReducers, pictureService, getCurrentToken, isAnonymous, setStorageObject, setLocalStorage, removeStorage } from "@reco-m/core";

import { app, jpushRegister, postBridgeSetAnonymousToken, getLocation, scan } from "@reco-m/core-ui";

import { authService } from "@reco-m/auth-service";

import { parkService, impressionService } from "@reco-m/home-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { appModuleService } from "@reco-m/service-service";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { parkCateService } from "@reco-m/park-service";

import { workOrderService } from "@reco-m/workorder-service";

import { IParkBindTableNameEnum, setMapScript } from "@reco-m/ipark-common";

import { Namespaces as articleNamespaces } from "@reco-m/article-models";

import { Namespaces as noticeNamespaces } from "@reco-m/notice-models";

import { Namespaces as activityNamespaces } from "@reco-m/activity-models";

import { Namespaces as policyserviceNamespaces } from "@reco-m/policymatching-models";

import { Namespaces } from "./common";
export namespace homeModel {
    export const namespace = Namespaces.home;

    export type StateType = typeof state;

    export const state: any = freeze({
        stopautostate: true
    }, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        addPage(state, { data }) {
            return { ...state, data } as any;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            try {
                yield put({ type: "showLoading" });
                yield put({ type: "getPark", message });
                yield put({ type: "setAnonymousToken", tokens: getCurrentToken(), message });
                if (!isAnonymous()) {
                    yield put({ type: "getCertifyMember" });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *initPagebanner({ message }, { put }) {
            try {
                yield put({ type: "showLoading" });
                yield put({ type: "getParkHomeDetail", data: getLocalStorage("parkId") || "1" });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *initHomeService({ message }, { put }) {
            try {
                if (!isAnonymous()) {
                    yield put({ type: "getByUser" });
                }
                yield put({
                    type: "getUserProfile",
                    params: {
                        ownerId: getLocalStorage("parkId") ? getLocalStorage("parkId") : 1,
                        ownerType: 3,
                        areaCode: "IPARK",
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *refreshHomeData({ message, key }, { put }) {
            try {
                if (!isAnonymous()) {
                    yield put({ type: "getByUser" });
                }

                yield put({
                    type: "getUserProfile",
                    params: {
                        ownerId: getLocalStorage("parkId") ? getLocalStorage("parkId") : 1,
                        ownerType: 3,
                        areaCode: "IPARK",
                    },
                });
                yield put({
                    type: `${articleNamespaces.article}/initPage`,
                    data: {
                        pageIndex: 1,
                        parkId: getLocalStorage("parkId"),
                        catalogueCode: "DTZX",
                    },
                });
                yield put({
                    type: "initPagebanner",
                });
                yield put({
                    type: `${noticeNamespaces.assistant}/getnoticeList`,
                    data: {
                        pageIndex: 1,
                        parkId: getLocalStorage("parkId"),
                        catalogueCode: "TZTG",
                    },
                });
                const data = {
                    orderBy: "applyNumber desc",
                    pageIndex: 1,
                    isValid: true,
                    key: key,
                    parkId: getLocalStorage("parkId"),
                };
                yield put({ type: `${activityNamespaces.activity}/initPageHome`, data: data });
                yield put({
                    type: `${memberNamespaces.myCertify}/getMember`,
                });
                yield put({ type: "getCertifyMember" });
                yield put({
                    type: `${policyserviceNamespaces.policyserviceHomeModel}/getPolicy`,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getParkHomeDetail({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.space, bindTableId: data, customType: 0 });

                result && result.length && setStorageObject("homecachePic", result[0]);
                yield put({
                    type: "input",
                    data: {
                        pictures: result,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *load({ data }, { put }) {
            yield put({ type: "addPage", data });
        },
        *getPark({ message, successCallback }, { call, put }) {
            try {
                const items = yield call(parkService.list, { pageIndex: 1, pageSize: 50, isEnabled: true });
                yield put({ type: "input", data: { parks: items, i: Math.random() } });
                if (items && items.length && !getLocalStorage("parkId")) {
                    setLocalStorage("parkId", items[0].id);
                    setLocalStorage("parkName", items[0].parkName);
                    yield put({ type: "input", data: { random: Math.random() } });
                    yield put({
                        type: "getUserProfile",
                        params: {
                            ownerId: getLocalStorage("parkId") ? getLocalStorage("parkId") : 1,
                            ownerType: 3,
                            areaCode: "IPARK",
                        },
                    });
                    successCallback && successCallback();
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCertifyMember({ message }, { select, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser` });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                /**
                 * 原生极光设置别名为当前用户id
                 */
                currentUser && jpushRegister(currentUser.id);
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member;
                yield put({ type: "update", data: { member: member } });
                yield put({ type: "update", data: { currentMember: member } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getUserProfile({ message, params }, { call, put }) {
            // 新增可配置跳转内部和外部浏览器
            try {
                let result = {} as any;
                if (!isAnonymous()) {
                    result = yield call(appModuleService.getHomeModules, params);
                } else {
                    params.areaCode = "IPARK";
                    result = yield call(appModuleService.getDefaultModules, params);
                }
                result.push({
                    iconUrl: "icon icon-qita color-0",
                    moduleName: `更多`,
                    routeKey: `/service`,
                    openType: 0,
                });
                setStorageObject("homecacheService", result);
                yield put({ type: "input", data: { userProfile: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getMapConfig({ message, callback}, { call, put}) {
            try {
                const result = yield call(appModuleService.getConfig);
                if (result?.gaudes?.h5?.key) {
                    // 设置h5定位key配置
                    setMapScript(result?.gaudes?.h5?.key)
                    client.openMapLocation = true;
                }
                client.openThirdLogin = result?.isOpenThirdPartyLogin ? true : false
                callback && callback();
                yield put({ type: "input", data: { mapConfig: result } });
            } catch (e) {
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getUserLocation({ callback }, { call, put, select }) {
            try {
                const state = yield select((state) => state[Namespaces.home]);
                const parks = state!.parks;
                const mapConfig = state!.mapConfig;
                let data: any = {};

                if (!window["webkit"]) {
                    data = yield call(getLocation, mapConfig?.gaudes?.android?.key);
                } else {
                    data = yield call(getLocation, mapConfig?.gaudes?.ios?.key);
                }
                // 模拟定位数据
                // let data = { latitude: "31.178167", longitude: "121.605738", address: "上海市浦东新区荣科路", deviceId: "38210068-8CAD-4C8A-9217C-10416C1F3441" };

                if (data && data.longitude) {
                    yield put({ type: "input", data: { userLocation: data.address } });
                    const result = yield call(impressionService.getNearPark, { lng: +data.longitude, lat: +data.latitude });
                    let nearPark = null;
                    parks &&
                        parks.forEach((item) => {
                            if (item.id === result) {
                                nearPark = item;
                            }
                        });
                    nearPark ? callback && callback(nearPark) : setLocalStorage("hasGetNearPark", "1");
                } else {
                    setLocalStorage("hasGetNearPark", "1");
                }
            } catch (e) {
                setLocalStorage("hasGetNearPark", "1");
            }
        },
        *setAnonymousToken({ tokens }, { call }) {
            try {
                yield call(postBridgeSetAnonymousToken, tokens);
            } catch (e: any) {
                console.log('catcherror', e?.errmsg||e);
                //  message!.error(`${e?.errmsg || e}`)
            }
        },
        *loadPark({ callback }, { select, put, call }) {
            try {
                const state = yield select((state) => state[Namespaces.home]);
                // 未设置园区自动弹出选择园区
                if (state!.parks && state!.parks.length > 0) {
                    if (!getLocalStorage("hasGetNearPark")) {
                        setLocalStorage("parkId", state!.parks[0].id);
                        setLocalStorage("parkName", state!.parks[0].parkName);
                        yield put({ type: "input", data: { i: Math.random() } });
                        callback && callback();
                    } else {
                        // const data: any = { latitude: "31.178167", longitude: "121.605738", address: "上海市浦东新区荣科路", deviceId: "38210068-8CAD-4C8A-9217C-10416C1F3441" };
                        const state = yield select((state) => state[Namespaces.home]);
                        const mapConfig = state!.mapConfig;
                        let data: any = {};
                        if (!window["webkit"]) {
                            data = yield call(getLocation, mapConfig?.gaudes?.android?.key);
                        } else {
                            data = yield call(getLocation, mapConfig?.gaudes?.ios?.key);
                        }
                        if (data && data.longitude) {
                            yield put({ type: "input", data: { userLocation: data.address } });
                        } else {
                            setLocalStorage("hasGetNearPark", "1");
                        }
                    }
                }
            } catch (e: any) {
                setLocalStorage("hasGetNearPark", "1");
            }
        },
        *scancall({}, { call, put }) {
            try {
                // const state = yield select(state => state[Namespaces.home]);
                // const currentMember = state!.currentMember || {};
                const data = yield call(scan);
                // 活动
                // const data = {type: "activity", id: "1996729138282680"} as any; // 模拟扫码返回失败
                // const data = {type: "activity", id: "1974912482803850"} as any; // 模拟扫码返回成功
                // 会议室
                // const data = {type: "meetingRoom", id: "1842575883371740"} as any; // 模拟扫码返回失败
                // const data = {type: "meetingRoom", id: "1975944147371101"} as any; // 模拟扫码返回成功
                if (!data.msg) {
                    if (data.type === "meetingRoom") {
                        // 会议室
                        // if (isCertifyMeeting(currentMember, "会议室预订")) {  // ID1004341
                        //     yield put(routerRedux.push(`/index/resource/room/3/detail/${data.id}/${data.id}/31/order/${data.id}/3`));
                        // }
                        yield put(routerRedux.push(`/index/roomdetail/32/${data.id}`));
                    } else if (data.type === "activity") {
                        // 活动详情
                        yield put(routerRedux.push(`/index/activityDetail/${data.id}`));
                    }
                }
            } catch (e) {}
        },
        *logout({ message }, { call, put }) {
            try {
                removeStorage("allscenes");
                removeStorage("allscenesIDS");
                removeStorage("allTakeScenesID");
                yield call(authService.logout);

                yield put({ type: "init" });

                yield put(routerRedux.replace("/login"));
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

app.model(homeModel);
