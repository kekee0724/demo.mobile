import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { rateRateHttpService } from "@reco-m/comment-service";

import { IParkBindTableNameEnum, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { Namespaces } from "./common";
export namespace positiondetailcommentModel {

  export const namespace = Namespaces.positiondetailcomment;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

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
        yield put({ type: `getCommentsDetailAction`, params: { bindTableName: IParkBindTableNameEnum.resource, bindTableId: data.id, pageIndex: 1, pageSize: 3, auditStatus: CommentAuditStatusEnum.pass, isShowWaitAudit: true }, message });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getCommentsDetailAction({ message, params }, { call, put }) {
      try {
        const projects = yield call(rateRateHttpService.getPaged, params);
        projects.items =  projects.items.filter(item => {
          return item.isPublic
        })
        yield put({
          type: "input",
          data: { comments: projects.items, pageIndex: (projects && projects.currentPage) || 1, hasMore: projects && projects.currentPage < projects.totalPages }
        });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    }
  };

}

app.model(positiondetailcommentModel);
