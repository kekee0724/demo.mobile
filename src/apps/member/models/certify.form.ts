import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { memberService, memberCompanyUserTypeHttpService } from "@reco-m/member-service";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { CertifyEnum, ServiceSourceEnum } from "@reco-m/ipark-common";
import { Namespaces } from "./common";

export namespace certifyFormModel {
    export const namespace = Namespaces.certifyForm;

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
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `input`, data });
                yield put({ type: `getMember`, message });
                yield put({ type: `getUserTypes`, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getUserTypes({ message }, { call, put }) {
            try {
                const usertypes = yield call(memberCompanyUserTypeHttpService.list);
                yield put({
                    type: "input",
                    data: {
                        usertypes,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getMember({ message }, { put, select }) {
            try {
                yield put({ type: "showLoading" });

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);
                let currentUser = user.currentUser;
                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[Namespaces.member]),
                    member = memberState.member;

                yield put({
                    type: "input",
                    data: {
                        account: currentUser,
                        realname: (currentUser && currentUser.realName) || "",
                        mobile: (currentUser && currentUser.mobile) || "",
                        member: member,
                        company: {
                            customerId: member.companyId,
                            customerName: member.companyName,
                        },
                        type: member.companyUserTypeName === CertifyEnum.companyStaff ? 0 : 1,
                    },
                });
                yield put({
                    type: "selectCompany/input",
                    data: {
                        selectitem: {
                            customerId: member.companyId,
                            customerName: member.companyName,
                        },
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *certify({ message, params, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const { company, type, usertypes, account, updatamemberID, realname, mobile, department } = params;

                let usertype = {} as any;

                if (type === CertifyEnum.admin) {
                    usertypes &&
                        usertypes.forEach((item) => {
                            if (item.code === "qiygly") {
                                usertype = item;
                            }
                        });
                } else if (type === CertifyEnum.companyStaff) {
                    usertypes &&
                        usertypes.forEach((item) => {
                            if (item.code === "qiyyg") {
                                usertype = item;
                            }
                        });
                }
                let paramss = {
                    accountId: account.id,
                    companyDepartment: department,
                    companyId: company.customerId,
                    companyName: company.customerName,
                    companyUserTypeId: usertype.id,
                    companyUserTypeName: usertype.name,
                    parkId: getLocalStorage("parkId"),
                    parkName: getLocalStorage("parkName"),
                    realName: realname || account.realName,
                    mobile: mobile || account.mobile,
                    operateSource: ServiceSourceEnum.app
                };

                let certify;
                if (updatamemberID) {
                    certify = yield call(memberService.put, updatamemberID, paramss);
                } else {
                    certify = yield call(memberService.post, paramss);
                }

                yield call(callback!, certify);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(certifyFormModel);
