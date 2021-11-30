import { EffectsMapObject, routerRedux } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { memberService, memberCompanyUserTypeHttpService } from "@reco-m/member-service";

import {  ServiceSourceEnum } from "@reco-m/ipark-common";

import { Namespaces } from "./common";

export namespace staffmanagerListModel {
    export const namespace = Namespaces.staffmanagerList;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            items: [],
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        staffmanagerPage(state: any, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put, call }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getstaffmanagerList`, pageIndex: 1, message });
                yield put({ type: `getApprovalCount`, message });
                let usertypes = yield call(memberCompanyUserTypeHttpService.list);
                let usertypeNames = [] as any;
                usertypes &&
                    usertypes.forEach((item) => {
                        usertypeNames.push(item.name);
                    });
                usertypeNames.push("取消");
                yield put({
                    type: "input",
                    data: {
                        usertypes,
                        usertypeNames,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getstaffmanagerList({ message, key, pageIndex }, { call, put, select }) {
            try {
                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[Namespaces.member]),
                    member = memberState.member;
                    if (!member.companyId) {
                        yield put(routerRedux.goBack());
                        return;
                    }
                let params = {
                    pageIndex: pageIndex,
                    pageSize: 15,
                    status: 3,
                    companyId: member.companyId,
                    key: key || "",
                    parkId: getLocalStorage("parkId"),
                };
                const thisChangeId = ++changeCounter,
                    data = yield call(memberService.pageCompanyStaff, params);

                yield put({ type: "staffmanagerPage", data, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getApprovalCount({ message }, { call, put, select }) {
            try {
                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[Namespaces.member]),
                    member = memberState.member;
                let params = {
                    pageIndex: 1,
                    pageSize: 1,
                    status: 2,
                    companyId: member.companyId,
                    parkId: getLocalStorage("parkId"),
                };
                const data = yield call(memberService.pageCompanyStaff, params);
                yield put({ type: "input", data: { approvalCount: data.totalItems } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *unBindComPany({ message, callback, params }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const unBindRes = yield call(memberService.unbindCertify, params.accountId);

                yield call(callback!, unBindRes);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *changeCetifyInfo({ message, buttonIndex, item, callback, usertypeNames }, { call, put, select }) {
            try {
                if (buttonIndex !== usertypeNames.length - 1) {
                    const staffmanagerList = yield select((state) => state[Namespaces.staffmanagerList]);
                    const usertypes = staffmanagerList!.usertypes;
                    const changeCetifyInfo = yield call(memberService.updateCompanyUserType, item.accountId, getLocalStorage("parkId"), usertypes[buttonIndex].id, {
                        operateSource: ServiceSourceEnum.app
                    });
                    yield call(callback!, changeCetifyInfo);
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(staffmanagerListModel);
