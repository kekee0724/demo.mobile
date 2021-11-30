import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { myMarketInHttpService } from "@reco-m/workorder-service";

import { Namespaces } from "./common";

export namespace marketauthModel {
    export const namespace = Namespaces.marketauth;

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
                yield put({ type: `getMarketDetail`, data: data.institutionId, id: data.id, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getMarketDetail({ message, data, id }, { call, put }) {
            try {
                const marketDetail = yield call(myMarketInHttpService.get, data);
                const { serviceInstitutionBasicFormVM: insBasic = {} } = marketDetail || {};
                let marketPersonDetail
                if (id) {
                    marketPersonDetail = yield call(myMarketInHttpService.institutionContactPerson, id);
                } else {
                    marketPersonDetail = {
                        currentContactPerson: insBasic.handlerName,
                        currentContactPersonMobile: insBasic.handlerMobile
                    }
                }
                yield put({ type: "input", data: { marketDetail, marketPersonDetail } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *sendVerifyCode({ message, delay, data }, { call }) {
            const cleardelay = delay();

            try {
              if (data.id) {
                yield call(myMarketInHttpService.messageVerifiCode, data.mobile, data.id);
              } else {
                yield call(myMarketInHttpService.sendMessageCode, data.mobile);
              }
                
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                cleardelay();
            }
        },
        *submitVerification({ data, message, callback, institutionId }, { call }) {
            try {
                console.log("submitVerification");
                
                if (data.id) { // 确认机构联系人变更
                    let result = yield call(myMarketInHttpService.validateMessageCode, data.mobile, data.id, { submitMessageCode: data.code });
                    callback && callback(result);
                } else { // 后台新加机构确认
                    console.log("confirminstitution");
                    let result = yield call(myMarketInHttpService.confirminstitution, institutionId, data.mobile, data.code);
                    callback && callback(result);
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(marketauthModel);
