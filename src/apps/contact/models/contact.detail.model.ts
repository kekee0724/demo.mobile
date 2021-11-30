import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { memberService } from "@reco-m/member-service";

import { Namespaces } from "./common";
export namespace iparkContactDetailModel {

  export const namespace = Namespaces.contactDetail;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state;
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ contactId, message }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getContactDetail`, message, contactId });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getContactDetail({ message, contactId }, { call, put }) {
      try {
        yield put({ type: "showLoading" });

        const contactDetail = yield call(memberService.getCertifyDetail, contactId, getLocalStorage("parkId"));

        yield put({
          type: "input",
          data: { contactDetail: contactDetail }
        });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };

}

app.model(iparkContactDetailModel);
