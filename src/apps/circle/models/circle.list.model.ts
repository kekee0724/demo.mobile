import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { circleService } from "@reco-m/ipark-white-circle-service";

import { Namespaces } from "./common";
export namespace circleListModel {
  export const namespace = Namespaces.circleList;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  let changeCounter = 0;

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    getCustomerPage(state: any, { datas, thisChangeId }) {
      if (thisChangeId < changeCounter) return state;

      return produce(state, (draft) => {
        Object.assign(draft, datas, {
          items: datas.currentPage <= 1 ? datas.items : [...draft.items, ...datas.items],
          refreshing: false,
          hasMore: datas.currentPage < datas.totalPages,
        });
      });
    },
  };

  const certifyCache = new Map();

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message, data }, { put }) {
      put({ type: "showLoading" });
      try {
        yield put({ type: "init" });
        yield put({ type: "getCircleData", message, data: data.datas });
      } catch (e) {
        console.log('catcherror', e?.errmsg || e);
        message!.error(`${e?.errmsg || e}`);
      }
    },
    *getCircleData({ message, data }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        let parkId = getLocalStorage("parkId");
        let certifyDetail = certifyCache.get(parkId);
        const thisChangeId = ++changeCounter;

        const datas = yield call(circleService.getPaged, {
          categoryValue: getLocalStorage("categoryValue"),
          orderBy: "isTop Desc,publishStatus Desc,sequence asc,publishTime Desc",
          postIsPublic: true,
          publishStatus: 1,
          ...data,
        });
        yield put({ type: "input", data: { certifyDetail, pageIndex: datas.currentPage, pageNum: null, circleData: null } });
        yield put({ type: "getCustomerPage", thisChangeId, datas });
      } catch (e) {
        console.log('catcherror', e?.errmsg || e);
        message!.error(`${e?.errmsg || e}`);
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getCircleDataTwo({ message, data }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        let parkId = getLocalStorage("parkId");
        let certifyDetail = certifyCache.get(parkId);
        const thisChangeId = ++changeCounter;
        yield put({ type: "input", data: { pageNum: null, circleData: null } });

        const datas = yield call(circleService.getPaged, {
          orderBy: "isTop Desc,publishStatus Desc,sequence asc,publishTime Desc", postIsPublic: true, publishStatus: 1, ...data
        });
        yield put({ type: "input", data: { certifyDetail } });
        yield put({ type: "getCustomerPage", thisChangeId, datas });
      } catch (e) {
        console.log('catcherror', e?.errmsg || e);
        message!.error(`${e?.errmsg || e}`);
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *outCircle({ message, id, callback }, { call, put }) {
      try {
        // yield put({ type: "showLoading" });
        const result = yield call(circleService.out, { id: id, parkId: getLocalStorage("parkId") });
        yield put({ type: "input", data: { result: result } });
        yield call(callback!, result);
      } catch (e) {
        console.log('catcherror', e?.errmsg || e);
        message!.error(`${e?.errmsg || e}`);
      }
    },
    *joinCircle({ message, id, callback }, { call, put }) {
      try {
        const result = yield call(circleService.Join, { id: id, parkId: getLocalStorage("parkId") });
        yield put({ type: "input", data: { result: result } });
        yield call(callback!, result);
      } catch (e) {
        console.log('catcherror', e?.errmsg || e);
        message!.error(`${e?.errmsg || e}`);
      }
    },
  };
}

app.model(circleListModel);
