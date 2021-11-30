import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { surveyService, surveyAnswerService } from "@reco-m/survey-service";

import { SurveryStatusEnum, SurveyStatusInUrlEnum, Namespaces } from "./common";

export namespace surveyModel {
    export const namespace = Namespaces.survey;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        surveyPage(state: any, { data, thisChangeId }) {
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
        *initPage({ status, message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({
                    type: `getSurvey`,
                    message,
                    status: status,
                    key: "",
                    pageIndex: 1,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getSurvey({ message, status, key, pageIndex }, { call, put }) {
            try {
                let thisChangeId = ++changeCounter,
                    parm;

                if (status === SurveyStatusInUrlEnum.myList) {
                    let params = {
                        pageSize: 8,
                        pageIndex: pageIndex,
                        key: key,
                        parkId: getLocalStorage("parkId"),
                        status: SurveryStatusEnum.published,
                        deviceId: getLocalStorage("fingerprint"),
                    };
                    parm = yield call(surveyAnswerService.mySurvey, params);
                } else {
                    let params = {
                        // orderBy: "Answer.inputTime desc",
                        pageSize: 8,
                        pageIndex: pageIndex,
                        key: key,
                        parkId: getLocalStorage("parkId"),
                        status: SurveryStatusEnum.published,
                        deviceId: getLocalStorage("fingerprint"),
                    };
                    parm = yield call(surveyService.getPaged, params);
                }
                yield put({ type: "surveyPage", data: parm, thisChangeId: thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(surveyModel);
