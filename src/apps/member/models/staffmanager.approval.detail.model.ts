import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";


import { app } from "@reco-m/core-ui";
import { memberService } from "@reco-m/member-service";


import { Namespaces as memberNamespaces } from "./common";


export namespace staffmanagerApprovalDetailModel {

  export const namespace = memberNamespaces.staffmanagerApprovalDetail;

  export type StateType = typeof state;

  export const state: any = freeze({
    reason: ""
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message, successcall, errorcall }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getStaffmanagerApprovalDetail`, message, data: data.id, successcall, errorcall });
        yield put({ type: `getCertify`, message });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getCertify({ message }, { select, put }) {
      try {
        yield put({ type: "showLoading" });

        yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
        const memberState: any = yield select(state => state[memberNamespaces.member]),
          member = memberState.member;

        yield put({ type: "input", data: { member: member } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getStaffmanagerApprovalDetail({ message, data, successcall, errorcall }, { call, put }) {
      try {

        const staffmanagerApprovalDetail = yield call(memberService.getMember, data, getLocalStorage("parkId"));

        yield put({ type: "input", data: { staffmanagerApprovalDetail: staffmanagerApprovalDetail } });

        successcall && successcall(staffmanagerApprovalDetail.id)
        errorcall && !staffmanagerApprovalDetail.id && errorcall()
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *certifyUpdate({ message, callback, param }, { call, put }) {
      try {
        yield put({ type: "showLoading" });


        const certifyUpdate = yield call(memberService.audit, param);

        yield call(callback!, certifyUpdate);
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };

}

app.model(staffmanagerApprovalDetailModel);
