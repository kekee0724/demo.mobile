import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, customEvent, getLocalStorage, setLocalStorage, removeLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { memberService, integralSetHttpService } from "@reco-m/member-service";

import { Namespaces, CertifyStatusEnum } from "./common";

/**
 * 积极地会员认证状态（已通过）
 */
const CertifyStatusEnumPositiveArr = [CertifyStatusEnum.allow];

export namespace memberModel {
    const loyaltyCache = new Map();
    let time;
    export const namespace = Namespaces.member;
    export const state: any = freeze({ ...CoreState }, !0);
    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({}, {}) {},
        *getCurrentMemberInfo({ message, refresh = true }, { select, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user.currentUser;
                // 如果有需要会员信息,每三秒清空会员信息后从新获取,防止后台认证改变会员信息而移动端一直使用本地缓存导致会员信息不会发生变化问题
                if (time && !refresh) {
                    const memberState = yield select((state) => state[Namespaces.member]);
                    if (currentUser   && !memberState.member) {
                        yield yield put({ type: "refreshCurrentMemberInfo", currentUser, message });
                    }
                } else {
                    // 设置定时器确保每三秒才会刷新一次会员信息,不会让接口调用过于频繁
                    time = setTimeout(() => {
                        clearTimeout(time);
                        time = null;
                    }, 3000);
                    yield put({ type: "cleanCurrentMemberInfo" });
                    if (currentUser && currentUser.id) {
                        yield yield put({ type: "refreshCurrentMemberInfo", currentUser, message });
                    }
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *refreshCurrentMemberInfo({ message, currentUser }, { put, call }) {
            try {
                if (!getLocalStorage("parkId")) {
                    client.isBiParkApp ? message?.error("未获取到园区信息!") : console.log("未获取到园区信息!");
                    return;
                }
                const member = yield call(memberService.getMember, currentUser.id, getLocalStorage("parkId"));

                if (
                    member &&
                    CertifyStatusEnumPositiveArr.contains(member.status) &&
                    (!getLocalStorage("companyId") || Number(getLocalStorage("companyId")) !== member.companyId)
                ) {
                    setLocalStorage("companyName", member.companyName);
                    setLocalStorage("companyId", member.companyId);
                }
                if (!member || !CertifyStatusEnumPositiveArr.contains(member.status)) {
                    removeLocalStorage("companyName");
                    removeLocalStorage("companyId");
                }

                yield put({ type: "input", data: { member } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *cleanCurrentMemberInfo({}, { put }) {
            yield put({ type: "input", data: { member: null } });
        },
        *getUserLoyalty({ message, parkId = getLocalStorage("parkId") }, { select, put, call }) {
            try {
                let userLoyalty = loyaltyCache.get((parkId = +parkId));

                if (!userLoyalty) {
                    yield yield put({ type: "getCurrentMemberInfo" });

                    const memberState: any = yield select((state) => state[Namespaces.member]),
                        member = memberState.member;
                    
                    if (!!member && member.id) {
                        let companySetID = yield call(integralSetHttpService.companySet, member.companyId);
                        let personalSetID = yield call(integralSetHttpService.personalSet, member.accountId);

                        userLoyalty = {} as any;
                        companySetID && (userLoyalty.companySetID = companySetID.id);
                        personalSetID && (userLoyalty.personalSetID = personalSetID.id);
                        loyaltyCache.set(parkId, userLoyalty);
                    } else {
                        yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                        const user = yield select((state) => state[authNamespaces.user]);
                        const currentUser = user!.currentUser;
                        let personalSetID = yield call(integralSetHttpService.personalSet, currentUser.id);
                        userLoyalty = {} as any;
                        personalSetID && (userLoyalty.personalSetID = personalSetID.id);
                        loyaltyCache.set(parkId, userLoyalty);
                    }
                }

                yield put({ type: "input", data: { userLoyalty } });
            } catch (e) {
                console.log("getUserLoyalty", e);
            }
        },
        *cleanLoyalty({}, { put }) {
            loyaltyCache.clear();

            yield put({ type: "input", data: { userLoyalty: null } });
        },
        *clean({}, { put }) {
            yield put({ type: "cleanCurrentMemberInfo" });
            yield put({ type: "cleanLoyalty" });
        },
    };
    export const subscriptions = {
        cleanCache({ dispatch }) {
            return customEvent.on("load clearCache logout", () => dispatch({ type: `clean` }));
        },
    };
}

app.model(memberModel);
