import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { cashInvoiceService } from "@reco-m/invoice-service";

import { Namespaces } from "./common";


export namespace invoiceDetailModel {

  export const namespace = Namespaces.invoiceDetail;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getInvoiceDetail`, message, data });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getInvoiceDetail({ message, data }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const invoiceDetail = yield call(cashInvoiceService.getInvoiceDetail, data);

        yield put({ type: "input", data: { invoiceDetail: invoiceDetail } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };

}

app.model(invoiceDetailModel);
