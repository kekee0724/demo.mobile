import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage, formatDate, formatDateTime } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { myPolicyMatchHttpService, policyService, policyDeclareService } from "@reco-m/policymatching-service";

import { Namespaces as commonNamespaces } from "@reco-m/ipark-common-models";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Namespaces, PolicyDeclareModeEnum } from "./common";

export namespace policyserviceMyModel {
    export const namespace = Namespaces.policyserviceMy;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            tabItem: { title: "全部", stateTagValue: "", exceptStateTagValues: -5 },
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
        policyPage(state: any, { data, thisChangeId }) {
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
        *initPage({ message, callBack }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `getDeclareMode`, message });
                callBack();
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getDatas({ message, param }, { put, call, select }) {
            try {
                const state: any = yield select((state) => state[Namespaces.policyserviceMy]),
                year = +formatDateTime(state.year, "yyyy");
                yield yield put({ type: `${commonNamespaces.consumerCommon}/getCurrentConsumer`, message });
                const consumerCommonState: any = yield select((state) => state[commonNamespaces.consumerCommon]),
                    consumerDetail = consumerCommonState.consumerDetail;

                const thisChangeId = ++changeCounter;
                let data;


                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member;

                if (state.declareMode === PolicyDeclareModeEnum.complex) {
                    if (!consumerDetail?.id) {
                        yield put({ type: "input", data: { showloading: false, showList: true } });
                        return
                    }
                    data = yield call(myPolicyMatchHttpService.getMyPolicy, { consumerId: consumerDetail?.id, ...param });
                } else {
                    data = yield call(policyDeclareService.getPaged, {
                        detailTitle: state!.key,
                        parkId: getLocalStorage("parkId"),
                        pageIndex: param.pageIndex,
                        pageSize: 15,
                        inputTimeBegin: year ? formatDate(new Date(year, 0, 1)) : undefined,
                        inputTimeEnd: year ? formatDate(new Date(year + 1, 0, 1).dateAdd("d", -1)) + " 23:59:59" : undefined,
                        status: param.stateTagValue,
                        customerId: member.companyId,
                    });
                }

                yield put({ type: "policyPage", data, thisChangeId });

                yield put({ type: "input", data: { showloading: false, showList: true } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        /**
         * 获取申报类型
         * @param { message }
         * @param { call, put }
         */
        *getDeclareMode({ message }, { call, put }) {
            try {
                const config = yield call(policyService.getConfig);

                yield put({ type: "input", data: { declareMode: config?.declareMode } });
            } catch (e) {
                yield call(message!.error, "getDeclareMode：" + e.errmsg);
            }
        },
    };
}

app.model(policyserviceMyModel);
