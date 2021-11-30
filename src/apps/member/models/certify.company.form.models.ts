import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { memberCompanyHttpService } from "@reco-m/member-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { CertifyEnum, ServiceSourceEnum } from "@reco-m/ipark-common";

import { Namespaces } from "./common";

export namespace certifyCompanyFormModel {
    export const namespace = Namespaces.certifyCompanyForm;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        getCertifyIDPage(state: any, { memberRoles }) {
            let companyCertifID;
            memberRoles.forEach((item) => {
                if (item.tagName === "企业认证") {
                    companyCertifID = item.id;
                }
            });

            return produce(state, (draft) => {
                Object.assign(draft, companyCertifID);
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, companyId, key }, { put, call }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getMember`, message });
                if (companyId) {
                    const companyInfo = yield call(memberCompanyHttpService.get, companyId);

                    yield put({
                        type: "input",
                        data: {
                            company: key ? decodeURI(key as any) : companyInfo.name,
                            creditCode: companyInfo.creditCode,
                            companyaddress: companyInfo.address,
                            realName: companyInfo.realName,
                        },
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getMember({ message }, { put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);
                let currentUser = user.currentUser;

                yield put({
                    type: "input",
                    data: {
                        account: currentUser,
                        realname: (currentUser && currentUser.realName) || "",
                        mobile: (currentUser && currentUser.mobile) || "",
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        /**
         * 校验统一社会信用代码
         * @param { message, creditCode, callback }
         * @param { call }
         */
        *validateCreditcode({ message, creditCode, callback }, { call }) {
            try {
                const result = yield call(memberCompanyHttpService.validateCreditcode, { creditCode });

                if (callback) {
                    yield call(callback, result);
                }
            } catch (e) {
                yield call(message!.error, e.errmsg);
            }
        },

        *certify({ message, params, callback, companyId }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const { company, companyaddress, creditCode, account, realname, mobile } = params;

                let permissions: any[] = [];

                permissions.push({ id: CertifyEnum.admin, Name: "企业管理员" });

                let params2 = {
                    accountId: account.id,
                    address: companyaddress,
                    creditCode: creditCode,
                    mobile: mobile || account.mobile,
                    name: company,
                    parkId: getLocalStorage("parkId"),
                    parkName: getLocalStorage("parkName"),
                    realName: realname || account.realName,
                    operateSource: ServiceSourceEnum.app,
                };
                if (companyId) {
                    const certify = yield call(memberCompanyHttpService.put, companyId, params2);
                    yield call(callback!, certify || {});
                } else {
                    const certify = yield call(memberCompanyHttpService.post, params2);
                    yield call(callback!, certify || {});
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        /**
         * 赋值附件
         * @param { message, data }
         * @param { call, put }
         */
        *generateAttach({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                yield call(memberCompanyHttpService.generateAttach, [data]);
            } catch (e) {
                yield call(message!.error, "generateAttach：" + e.errmsg);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(certifyCompanyFormModel);
