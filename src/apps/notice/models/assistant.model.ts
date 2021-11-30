import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers} from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces } from "./common";
import { articleHttpService } from "@reco-m/article-service";



export namespace assistantModel {

  export const namespace = Namespaces.assistant;

  export type StateType = typeof state;

  export const state: any = freeze({
    pageIndex: 1,
    hasMore: true
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message, data }, { put }) {
      put({ type: "showLoading" });
      try {
        yield put({ type: "getnoticeList", data });

      } catch (e) {
          console.log('catcherror', e?.errmsg||e);
          message!.error(`${e?.errmsg || e}`);
      } finally {
          yield put({ type: "hideLoading" });
      }
  },
    *getnoticeList({ message, data }, { call, put }) {
      try {
        const noticeList = yield call(articleHttpService.getPaged, {
          pageSize: 20,
          orderBy: "isTop desc,sequence asc,publishTime desc",
          ...data
        });

        yield put({ type: "input", data: { noticeList: noticeList.items || [] } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };

}

app.model(assistantModel);
