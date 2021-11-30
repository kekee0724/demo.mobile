import { EffectsMapObject } from "dva";
import produce, { freeze } from "immer";
import { AnyAction, ReducersMapObject } from "redux";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { businessBillHttpService } from "@reco-m/busynessbill-service";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";
import { tagService } from "@reco-m/tag-service";

import { Namespaces } from "./common";

let listCounter = 0;
export namespace billModel {
  export const namespace = Namespaces.bill;

  export type StateType = typeof state;

  export const state: any = freeze({ number: 0 }, !0);


  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state;
    },

    listPage(state: any, { data, thisChangeId }) {
      if (thisChangeId < listCounter) return state;
      data = { ...data };
      return produce(state, (draft) => {
        Object.assign(draft, data, {
          items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
          refreshing: false,
          hasMore: data.currentPage < data.totalPages,
          showList: true,
        });
      });
    },
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message }, { put }) {
      put({ type: "showLoading" });
      try {
        yield put({ type: `getTag`, message, data: { tagClass: "BUSINESSBILL/FEIYXM", unitId: getLocalStorage("parkId") }, map: "bills" });
        yield put({ type: `getData`, params: { pageIndex: 1 }, message, });
      } catch (e) {
        message!.error(`${e?.errmsg || e}`);
      }
    },
    *getData({ params, message }, { call, select, put }) {
      try {
        yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
        const memberState: any = yield select((state) => state[memberNamespaces.member]),
          member = memberState.member;
        if (member) {
          const thisChangeId = ++listCounter,
            data = yield call(businessBillHttpService.getPaged, {
              pageSize: 15,
              customerId: member.companyId,
              parkId: getLocalStorage("parkId"),
              orderBy: "inputTime desc",
              ...params,
            });
          yield put({ type: "listPage", data, thisChangeId });
        }
      } catch (e) {
        message!.error(`${e?.errmsg || e}`);
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getTag({ message, data, map }, { call, put }) {
      try {
        const tags = yield call(tagService.getTagByTagClass, data);
        yield put({
          type: "input",
          data: { [map]: tags }
        });
      } catch (e) {
        message!.error(`${e?.errmsg || e}`)
      }
    },
  };
}

app.model(billModel);
