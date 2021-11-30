import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { memberCompanyHttpService } from "@reco-m/member-service";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Namespaces, initContactData } from "./common";
export namespace iparkContactModel {

  export const namespace = Namespaces.contact;

  export type StateType = typeof state;

  let changeCounter = 0;

  export const state: any = freeze({
    companyId: "",
    searchContent: ""
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,

    init() {
      return state;
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getContactList`, message });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getContactList({ message }, { call, put, select }) {
      try {
        yield put({ type: "showLoading" });

        // 获取用户信息
        yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });

        const memberState = yield select(state => state[memberNamespaces.member]),
          member = memberState.member,
          companyId = member && member.companyId;
        if (companyId) {
          let params = {
            pageIndex: 1,
            pageSize: 99999,
            companyId: companyId,
            isIncludeQygly: true
          };
          const data = yield call(memberCompanyHttpService.userPage, params);

          const thisChangeId = ++changeCounter;
          yield put({
            type: "input",
            data: { contactList: initContactData(data.items) },
            thisChangeId
          });

          yield put({
            type: "input",
            data: {
              companyId: companyId,
              certify: member
            }
          });
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },

    *getSearchContact({ message, searchContent }, { call, put, select }) {
      try {
        const state = yield select(state => state[Namespaces.contact]),
          companyId = state!.companyId;
        let params = {
          pageIndex: 1,
          pageSize: 99999,
          companyId: companyId,
          isIncludeQygly: true,
          key: searchContent
        };
        const data = yield call(memberCompanyHttpService.userPage, params);
        const thisChangeId = ++changeCounter;
        yield put({
          type: "input",
          data: { contactList: initContactData(data.items) },
          thisChangeId
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

app.model(iparkContactModel);
