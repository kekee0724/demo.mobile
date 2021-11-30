import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from 'immer';

import { CoreEffects, CoreReducers} from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { activityHttpService, activityApplyHttpService, activitySignHttpService } from "@reco-m/activity-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

export namespace myActivityModel {

  export const namespace = Namespaces.myActivity;

  export type StateType = typeof state;

  let changeCounter = 0;

  export const state: any = freeze({
    items: []
  }, !0);


  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,

    init() {
      return state;
    },

    getActivityContentsPage(state, { params, thisChangeId }) {
      // 获取活动列表
      if (thisChangeId < changeCounter) return state;

      return produce(state, draft => {
        Object.assign(draft, params, { items: params.currentPage <= 1 ? params.items : [...draft.items, ...params.items], refreshing: false, hasMore: params.currentPage < params.totalPages});
      })
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message, data }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getMyActivity`, data, message });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getMyActivity({ message, data }, { call, put, select }) {
      try {
        yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
        const user = yield select(state => state[authNamespaces.user]);
        const currentUser = user!.currentUser;
        const thisChangeId = ++changeCounter,
          params = yield call(activityHttpService.getPaged, { pageSize: 8, inputerId: currentUser.id, mobile: currentUser.mobile, ...data });
        yield put({ type: "getActivityContentsPage", params, thisChangeId, message });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },

    *unRigistActivity({ message, callback, params }, { call, put, select }) {
      try {
        yield put({ type: "showLoading" });
        yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
        const user = yield select(state => state[authNamespaces.user]);
        const currentUser = user!.currentUser;
        yield call(activityApplyHttpService.unapply, params.activityID, currentUser.mobile);

        yield call(callback!);
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    // 活动签到
    *activitySignIn({ message, activityID, callback }, { call, put }) {
      try {
        yield put({ type: "showLoading" });

        yield call(activitySignHttpService.signIn, activityID, {});

        yield call(callback, "签到成功");
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };

}

app.model(myActivityModel);
