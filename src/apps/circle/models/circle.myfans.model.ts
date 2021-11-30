import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { followService } from "@reco-m/ipark-white-circle-service";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

export namespace myFansModel {

  export const namespace = Namespaces.myFans;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);
  let changeCounter = 0;

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    getCustomerPage(state: any, { datas, thisChangeId, bindTableId }) {
      if (thisChangeId < changeCounter) return state;
      let data = {};
      data[`datas${bindTableId}`] = { ...datas, refreshing: false, hasMore: datas.currentPage < datas.totalPages };
      return produce(state, draft => {
        Object.assign(draft, data);
      })
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ params, message }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getUserFollow`, params, message });
        yield put({ type: `getUserInfo`, userID: params.bindTableId, message });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getUserFollow({ params, message }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const thisChangeId = ++changeCounter,
          datas = yield call(followService.getMyFans, { ...params , status: 1});
        yield put({ type: "getCustomerPage", datas, thisChangeId, bindTableId: params.bindTableId });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    // 删除关注
    *deleteFollow({ id, callback, message }, { call }) {
      try {
        const result = yield call(followService.deleteFollow, id)
        if (result) {
          yield call(callback);
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    // 取消关注保留记录
    *cancelFollow({ id, callback, message }, { call }) {
      try {
        yield call(followService.cancelFollow, id)
        yield call(callback);
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    // 关注
    *follow({ data, callback, message }, { call }) {
      try {
        const result = yield call(followService.follow, data);
        if (result) {
          yield call(callback);
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *getUserInfo({ message, userID }, { select, put }) {
      try {
        yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
        const user = yield select(state => state[authNamespaces.user]);
        const currentUser = (user && user!.currentUser) || {};

        const isNotCurrentUser = (currentUser.id === userID ? false : true); // 判断显示主页是否是当前用户的

        let data = {};
        data[`isNotCurrentUser${userID}`] = isNotCurrentUser;
        yield put({
          type: "input",
          data: data
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

app.model(myFansModel);
