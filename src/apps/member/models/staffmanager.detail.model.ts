import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { memberService, memberCompanyUserTypeHttpService } from "@reco-m/member-service";


import { Namespaces } from "./common";

export namespace staffmanagerDetailModel {

  export const namespace = Namespaces.staffmanagerDetail;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message }, { put, call }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getStaffmanagerDetail`, data, message });

        let usertypes = yield call(memberCompanyUserTypeHttpService.list);
        let usertypeNames = [] as any;
        usertypes && usertypes.forEach(item => {
          usertypeNames.push(item.name);
        })
        usertypeNames.push('取消')

        yield put({
          type: "input",
          data: {
            usertypes,
            usertypeNames
          }
        });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getStaffmanagerDetail({ message, data }, { call, put }) {
      try {
        const staffmanagerDetail = yield call(memberService.getMember, data, getLocalStorage("parkId"));

        yield put({ type: "input", data: { staffmanagerDetail: staffmanagerDetail } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    }
  };

}

app.model(staffmanagerDetailModel);
