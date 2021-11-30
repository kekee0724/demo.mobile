import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, getLocalStorage, setLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { memberService } from "@reco-m/member-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { msgReachService } from "@reco-m/msgreach-service";

import { MsgReachAttachCustomTypeEnum, MsgReachBindTableNameEnum, Namespaces } from "./common";

export namespace msgreachModel {
    export const namespace = Namespaces.msgreach;

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
        *initPage({ message }, { put }) {
            try {
                yield put({ type: "showLoading" });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getCertifyMember({ message, parkList, callback, error }, { put, call, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user.currentUser;

                let member: any, park: any, parkId: any;
                park = parkList && parkList.length > 0 && parkList[0];
                if (currentUser && currentUser.id) {
                    const data = yield call(memberService.getCertifyPark, currentUser.id);
                    if (data && data.length && parkList && parkList.length) {
                        const certifyParkIds = data.map((x) => x.parkId);
                        const bindTableItemParkIds = parkList.map((x) => x.id || x.parkId);
                        // 对比推送内容所在园区与用户认证园区，如果有相同园区Id，就返回会员信息
                        if (bindTableItemParkIds.some((x) => certifyParkIds.contains(x))) {
                            if (getLocalStorage("parkId") && bindTableItemParkIds.contains(getLocalStorage("parkId"))) {
                                parkId = getLocalStorage("parkId");
                            } else {
                                parkId = bindTableItemParkIds.find((x) => certifyParkIds.contains(x));
                            }
                            park = data.find((x) => x.parkId === parkId);
                            if (parkId) {
                                // 如果有parkId，就获取会员认证信息，并将缓存中的ParkID变为这个
                                setLocalStorage("parkId", park.parkId);
                                setLocalStorage("parkName", park.parkName);
                                member = yield call(memberService.getMember, currentUser.id, parkId);
                            }
                        }
                    }
                } else {
                    error && error("未获取用户信息,请重新登录");
                }

                callback && callback(member, park);
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        /**
         * 获取推送信息
         */
        *getReadMsg({ message, data, callback }, { put, call }) {
            try {
                if (data.objectLogId || data.channelId || data.pushSubjectId || data.recordId || (data.bindTableId && data.bindTableName)) {
                    let result = yield call(msgReachService.getMsg, data);

                    let ps = yield call(pictureService.getList, {
                        bindTableId: data.pushSubjectId || result.id,
                        bindTableName: MsgReachBindTableNameEnum.msgReach,
                        customType: MsgReachAttachCustomTypeEnum.logo,
                    });

                    let picUrl = "";

                    if (ps && ps.length) {
                        picUrl = ps[0].filePath;
                    }

                    if (!result) {
                        callback && callback(result, picUrl);
                        return;
                    }

                    callback && callback(result, picUrl);
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        /**
         * 添加注册记录
         */
        *addRegisterInfo({ message, callback }, { put, call, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user.currentUser;

                yield call(msgReachService.post, {
                    channelId: getLocalStorage("channelId") || undefined,
                    recordId: getLocalStorage("recordId") || undefined,
                    pushSubjectId: getLocalStorage("pushSubjectId") || undefined,
                    registerCannal: getLocalStorage("reachCanal") || undefined,
                    mobile: currentUser && currentUser.mobile,
                    userId: currentUser && currentUser.id,
                    userName: currentUser && (currentUser.realName || currentUser.loginName),
                });

                if (callback) {
                    yield call(callback);
                }
            } catch (e) {
                message!.error(`addRegisterInfo=${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        /**
         * 判断手机号是注册还是登陆
         */
        *getRegisterOrLogin({ message, mobile, successcall }, { call }) {
            try {
                const result = yield call(msgReachService.getRegisterOrLogin, mobile);
                if (successcall) {
                    yield call(successcall, result);
                }
            } catch (e) {
                message!.error(`getRegisterOrLogin=${e?.errmsg || e}`);
            }
        },

        /**
         * 阅读推送信息
         */
        *readMsg({ message }, { put, call }) {
            try {
                if (getLocalStorage("objectLogId") || getLocalStorage("channelId") || (getLocalStorage("bindTableId") && getLocalStorage("bindTableName"))) {
                    yield call(msgReachService.readMsg, {
                        objectLogId: getLocalStorage("objectLogId") || undefined,
                        objectId: getLocalStorage("objectId") || undefined,
                        channelId: getLocalStorage("channelId") || undefined,
                        bindTableId: getLocalStorage("bindTableId") || undefined,
                        bindTableName: getLocalStorage("bindTableName") || undefined,
                        readMode: getLocalStorage("reachCanal") || undefined,
                        reachCanal: getLocalStorage("reachCanal") || undefined,
                        recordId: getLocalStorage("recordId") || undefined,
                        pushSubjectId: getLocalStorage("pushSubjectId") || undefined,
                    });

                    setLocalStorage("objectId", "");
                    setLocalStorage("objectLogId", "");
                    setLocalStorage("channelId", "");
                    setLocalStorage("bindTableId", "");
                    setLocalStorage("bindTableName", "");
                    setLocalStorage("reachCanal", "");
                    setLocalStorage("recordId", "");
                    setLocalStorage("pushSubjectId", "");
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(msgreachModel);
