import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { collectionHttpService } from "@reco-m/favorites-service";


import { Namespaces } from "./common";

export namespace favoritesButtonModel {

  export const namespace = Namespaces.favoritesButton;

  export type StateType = typeof state;

  export const state: any = freeze({
    isFollow: false
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,

    init() {
      return state;
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message }, { put }) {
      put({ type: "showLoading" });
      try {
        yield put({
          type: `isFollow`,
          bindTableName: data.bindTableName,
          bindTableId: data.bindTableId,
          success: data.success,
          message
        });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },

    *isFollow({ bindTableName, bindTableId, message }, { call, put }) {
      try {
        const result = yield call(collectionHttpService.isCollected, {
          bindTableName,
          bindTableId
        });
        yield put({ type: "input", data: { isFollow: result } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },

    *unFollow({ bindTableName, bindTableId, bindTableValue, callsuccess, message }, { call, put }) {
      try {
        const result = yield call(collectionHttpService.cancelCollection, {
          bindTableName,
          bindTableId,
          bindTableValue
        });
        if (result) {
          yield put({ type: "input", data: { isFollow: false } });
          yield call(callsuccess, "取消收藏成功");
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },

    *followActivity({ bindTableName, bindTableId, bindTableValue, callsuccess, message }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const result = yield call(collectionHttpService.post, {
          bindTableName,
          bindTableId,
          bindTableValue
        });
        if (result) {
          yield put({ type: "input", data: { isFollow: true } });
          yield call(callsuccess, "收藏成功");
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };


}

app.model(favoritesButtonModel);

