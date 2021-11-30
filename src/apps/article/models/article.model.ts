import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from 'immer';

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { interactiveTopicHttpService } from "@reco-m/comment-service";

import { articleHttpService } from "@reco-m/article-service";

import { Namespaces } from "./common";
export namespace articleModel {

  export const namespace = Namespaces.article;

  export type StateType = typeof state;

  let changeCounter = 0;

  export const state: any = freeze({
    pageIndex: 1
  }, !0);


  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state;
    },
    getArticleListPage(state: any, { params, thisChangeId }) {
      // 获取资讯列表
      if (thisChangeId < changeCounter) return state;

      return produce(state, draft => {
        Object.assign(draft, params, { items: params.currentPage <= 1 ? params.items : [...draft.items, ...params.items],
          refreshing: false, hasMore: params.currentPage < params.totalPages });
      })
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message }, { put }) {

      try {
        yield put({ type: "showLoading" });
        yield put({ type: `getArticleList`, data, message });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *getArticleList({ message, data }, { call, put }) {
      try {
        yield put({ type: "input", data: { tagValue: data.tagValue} });

        let thisChangeId = ++changeCounter,
          params = yield call(articleHttpService.getPaged, {
            pageSize: 25,
            orderBy: "isTop desc,sequence asc,publishTime desc",
            isPublish: true,
            ...data
          });
        yield put({ type: "input", data: { articleListhome: params.items } });
        let ids = params.items.map(t => t.id)
        let obj = {
          bindTableId: ids,
          bindTableName: IParkBindTableNameEnum.article,
          replyId: 0,
          isUserDelete: false,
          isPublic: true,
          auditStatus: 1
        }
        // 获取评论个数
        let commentCount = yield call(interactiveTopicHttpService.getCommentCount, obj)
        params = JSON.parse(JSON.stringify(params))
        params.items.forEach(t => (t.commentNumber = commentCount[t.id] || 0))
        yield put({
          type: "getArticleListPage",
          params,
          thisChangeId,
          message
        });
        yield put({
          type: "input",
          data: {
            pageIndex: (params && params.currentPage) || 1
          }
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

app.model(articleModel);
