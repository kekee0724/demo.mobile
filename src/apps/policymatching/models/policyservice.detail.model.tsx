import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { policyServiceHttpService, policyService, policySpecialService } from "@reco-m/policymatching-service";

import { Namespaces, PolicyDeclareModeEnum } from "./common";

export namespace policyserviceDetailModel {
    export const namespace = Namespaces.policyservicedetail;

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
        *initPage({ id, message }, { put, call, select }) {
            put({ type: "showLoading" });
            try {
                yield yield put({ type: `getDeclareMode`, message });
                const result = yield call(policyServiceHttpService.getPolicyServiceDetail, id);

                const state = yield select((state) => state[Namespaces.policyservicedetail]),
                    declareMode = state!.declareMode;

                if (declareMode === PolicyDeclareModeEnum.complex && result) {
                    const policyImplementationDetailIdList = [result.id];
                    const specialList = yield call(policySpecialService.getSpecialDetailList, {
                        policyImplementationDetailIdList,
                        isValid: true,
                    });
                    result.special = specialList.find((x) => x.policyImplementationDetailId === result.id);
                    if (result.special && result.special.startDate) {
                        result.declareStartTime = result.special?.startDate;
                        result.declareEndTime = result.special?.endDate;
                    }
                }

                const ZHENGCJBArr =
                    result.tagList &&
                    result.tagList.filter((item) => {
                        return item.tagClassCode === "POLICY/ZHENGCJB";
                    });
                yield put({ type: "input", data: { policyserviceDetail: result, zhengcjb: ZHENGCJBArr ? ZHENGCJBArr[0] : {} } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
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

app.model(policyserviceDetailModel);
