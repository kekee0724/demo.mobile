import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { interactiveTopicHttpService } from "@reco-m/comment-service";

import { Namespaces } from "./common";


export namespace commentInputModel {

  export const namespace = Namespaces.commentInput;

  export type StateType = typeof state;

  export const state: any = freeze({
    commentContent: "",
    submitLoading: false
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *changeCommentState({ data }, { put }) {
      yield put({ type: "input", data: data });
    },
    *submitCommentContent({ commentFail, commentSuccess, data }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const postReturnData = yield call(interactiveTopicHttpService.post, data);
        if (postReturnData) {
          yield call(commentSuccess, "评论成功");
        }
      } catch (e) {
        yield call(commentFail, e.errmsg);
        yield put({ type: "input", data: { msg: e.errmsg } });
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };

}

app.model(commentInputModel);
