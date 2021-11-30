import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { memberService } from "@reco-m/member-service";

import { Namespaces } from "./common";

export namespace staffmanagerApprovalModel {
    export const namespace = Namespaces.staffmanagerApproval;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            items: [],
            pageSize: 15,
        },
        !0
    );

    let changeCounter = 0;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        staffmanagerApprovalPage(state: any, { data, thisChangeId }) {
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
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getStaffmanagerApproval`, message, pageIndex: 1, status: data.status });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getStaffmanagerApproval({ message, pageIndex, status }, { call, put, select }) {
            try {
                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[Namespaces.member]),
                    member = memberState.member;
                let params = {
                    pageIndex: pageIndex,
                    pageSize: 15,
                    status: status,
                    companyId: member.companyId,
                    parkId: getLocalStorage("parkId"),
                };
                const thisChangeId = ++changeCounter,
                    data = yield call(memberService.pageCompanyStaff, params);

                yield put({ type: "staffmanagerApprovalPage", data, thisChangeId });
                yield put({ type: "input", data: { showList: true } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(staffmanagerApprovalModel);
