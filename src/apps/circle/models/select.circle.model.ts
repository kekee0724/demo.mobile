import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { circleService } from "@reco-m/ipark-white-circle-service";

import { Namespaces } from "./common";

export namespace selectCircleModel {
  export const namespace = Namespaces.selectCircle;

  export type StateType = typeof state;

  let changeCounter = 0;

  export const state: any = freeze(
    {
      pageSize: 20,
      item: {},
    },
    !0
  );

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,

    init() {
      return state;
    },

    getCustomerPage(state: any, { data, thisChangeId }) {
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
    *initPage({ datas, message }, { put }) {
      put({ type: "showLoading" });
      try {
        yield put({ type: `getCircleData`, message, datas });
      } catch (e) {
        console.log('catcherror', e?.errmsg || e);
        message!.error(`${e?.errmsg || e}`);
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getCircleData({ message, datas }, { call, put }) {
      try {
        // yield put({ type: "showLoading" });
        const thisChangeId = ++changeCounter;
        yield put({ type: "input", data: { pageNum: null, circleData: null } });

        const data = yield call(circleService.getPaged, { postIsPublic: true, publishStatus: 1, ...datas });
        yield put({ type: "getCustomerPage", data, thisChangeId });
      } catch (e) {
        console.log('catcherror', e?.errmsg || e);
        message!.error(`${e?.errmsg || e}`);
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
  };
}

app.model(selectCircleModel);
