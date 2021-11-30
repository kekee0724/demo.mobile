import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { policyServiceHttpService, policyService, policySpecialService } from "@reco-m/policymatching-service";

import { CertifyStatusEnum } from "@reco-m/ipark-common";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Namespaces, PolicyDeclareModeEnum } from "./common";

export namespace policyserviceHomeModel {
    export const namespace = Namespaces.policyserviceHomeModel;

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
        *initPage({ message, callback }, { put }) {
            put({ type: "showLoading" });
            try {
                yield yield put({ type: `getDeclareMode`, message });
                callback && callback()
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getPolicy({ message }, { call, put, select }) {
            try {
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member;

                const params = {
                    isPublish: true,
                    pageIndex: 1,
                    pageSize: 2,
                    parkId: getLocalStorage("parkId"),
                    customerId: member && member.status === CertifyStatusEnum.allow ? member!.companyId : undefined,
                };
                const data = yield call(policyServiceHttpService.getPolicyServiceList, params);
                const state = yield select((state) => state[Namespaces.policyserviceHomeModel]),
                    declareMode = state!.declareMode;
                if (declareMode === PolicyDeclareModeEnum.complex && data?.items?.length > 0) {
                    const policyImplementationDetailIdList = data.items.map((x) => x.id);
                    const specialList = yield call(policySpecialService.getSpecialDetailList, {
                        policyImplementationDetailIdList,
                        isValid: true,
                    });
                    data.items.forEach((item) => {
                        item.special = specialList.find((x) => x.policyImplementationDetailId === item.id);
                    });
                }
                if (data?.items?.some((x) => x.specialId)) {
                    data.items.forEach((item) => {
                        item.declareStartTime = item.special?.startDate;
                        item.declareEndTime = item.special?.endDate;
                    });
                }
                yield put({ type: "input", data: { policyservice: data.items || [] } });
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

app.model(policyserviceHomeModel);
