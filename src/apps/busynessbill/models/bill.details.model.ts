import { EffectsMapObject } from "dva";
import { freeze } from "immer";
import { AnyAction, ReducersMapObject } from "redux";

import { CoreEffects, CoreReducers } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { businessBillHttpService } from "@reco-m/busynessbill-service";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Namespaces, BusinessBillSourceEnum } from "./common";

export namespace billDetailsModel {
  export const namespace = Namespaces.billDetails;

  export type StateType = typeof state;

  export const state: any = freeze({ number: 0 }, !0);


  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state;
    },
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ id, message }, { put }) {
      put({ type: "showLoading" });
      try {
        yield put({ type: `getDetail`, id, message, });
      } catch (e) {
        message!.error(`${e?.errmsg || e}`);
      }
    },
    *getDetail({ id, message }, { call, select, put }) {
      try {
        yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
        const memberState: any = yield select((state) => state[memberNamespaces.member]),
          member = memberState.member;
        const details = yield call(businessBillHttpService.get, id);
        if (details) {
          yield call(businessBillHttpService.read, {
            billId: details?.id,
            inputerRole: member?.companyUserTypeName,
            operationSource: BusinessBillSourceEnum.App
          });
          const config = yield call(businessBillHttpService.getConfig, id);
          yield put({
            type: "input",
            data: { details, config: config?.accountInfo?.default }
          });
        }
      } catch (e) {
        message!.error(`${e?.errmsg || e}`);
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
  };
}

app.model(billDetailsModel);
