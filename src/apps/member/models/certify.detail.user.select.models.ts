import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { memberCompanyHttpService } from "@reco-m/member-service";

import { Namespaces } from "./common";

export namespace selectCompanyUserModel {
    export const namespace = Namespaces.selectCompanyUser;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        getCustomerPage(state: any, { data, thisChangeId }) {
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
        *initPage({ message }, { put, select }) {
            put({ type: "showLoading" });

            try {
                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[Namespaces.member]),
                    member = memberState.member;

                yield put({ type: "input", data: { certifyDetail: member, companyId: member.companyId } });
                yield put({ type: `getCustomer`, message, companyId: member.companyId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCustomer({ index, key, message, companyId }, { call, put }) {
            try {
                let params = {
                    pageIndex: index,
                    pageSize: 20,
                    companyId: companyId,
                    key,
                };
                const thisChangeId = ++changeCounter;
                let data = yield call(memberCompanyHttpService.userPage, params);

                yield put({ type: "getCustomerPage", data, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(selectCompanyUserModel);
