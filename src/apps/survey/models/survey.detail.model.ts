import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { surveyAnswerService } from "@reco-m/survey-service";

import { Namespaces } from "./common";

export namespace surveyDetailModel {

  export const namespace = Namespaces.surveyDetail;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ id, message }, {put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getSurveyDetail`, message, id });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getSurveyDetail({ message, id }, { call, put }) {
      try {
        const surveyDetail = yield call(surveyAnswerService.get, id);

        yield put({ type: "input", data: { surveyDetail: surveyDetail } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    }
  };

}

app.model(surveyDetailModel);
