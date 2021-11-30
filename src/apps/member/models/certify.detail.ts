import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { memberService, memberCompanyHttpService } from "@reco-m/member-service";

import { Namespaces } from "./common";

export namespace certifyDetailModel {
    export const namespace = Namespaces.certifyDetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ params, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getCertify`, message, params });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCertify({ message }, { select, put }) {
            try {
                yield put({ type: "showLoading" });

                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[Namespaces.member]),
                    member = memberState.member;

                yield put({ type: "input", data: { certifyDetail: member } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *unBindCompany({ id, callback, errorback, message }, { call }) {
            try {
                const unBindRes = yield call(memberService.unbindCertify, id);
                yield call(callback!, unBindRes);
            } catch (e) {
                if (e.errcode === "COMPANY_UNBIND_ERROR") {
                    errorback && errorback(e.errmsg);
                } else {
                    console.log("catcherror", e?.errmsg || e);
                    message!.error(`${e?.errmsg || e}`);
                }
            }
        },
        *setUserManager({ companyUser, member, message, callback }, { call }) {
            try {
                let result = yield call(memberCompanyHttpService.setUserManager, {
                    companyId: companyUser.companyId,
                    accountId: companyUser.accountId,
                    oldAccountId: member.accountId,
                });
                callback && callback(result);
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *cancelBindCompany({ message, id, callback }, { call }) {
            try {
                yield call(memberService.cancelCertify, id);

                yield call(callback!);
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(certifyDetailModel);
