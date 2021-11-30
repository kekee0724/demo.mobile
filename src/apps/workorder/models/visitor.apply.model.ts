import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { memberServiceHttpService } from "@reco-m/workorder-service";

import { Namespaces, MyVisitorTypeEnum } from "./common";

export namespace myVisitorModel {
    export const namespace = Namespaces.myVisitor;

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

        getMyVisitorListPage(state: any, { data, thisChangeId }) {
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

        *getMyVisitorList({ fail, params, status, companyId }, { call, put }) {
            try {
                const visitorData = {
                        pageIndex: 1,
                        pageSize: 15,
                        codes: "FKYY_fk,FKYY_sfz",
                        status: status === MyVisitorTypeEnum.allBack ? "" : status,
                        parkId: getLocalStorage("parkId"),
                        customerId: companyId,
                        ...params,
                    },
                    thisChangeId = ++changeCounter,
                    data = yield call(memberServiceHttpService.visitorOrder, visitorData);
                yield put({ type: "getMyVisitorListPage", data, thisChangeId });
                yield put({ type: "input", data: { showList: true } });
            } catch (error) {
                fail!(error.errmsg);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(myVisitorModel);
