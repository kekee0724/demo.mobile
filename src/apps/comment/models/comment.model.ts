import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { interactiveTopicHttpService, rateRateHttpService } from "@reco-m/comment-service";

import { IParkBindTableNameEnum, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { TopicRateTypeEnum, Namespaces } from "./common";
export namespace commentModel {
    export const namespace = Namespaces.comment;

    export type StateType = typeof state;

    let getCommentListCounter = 0;

    export const state: any = freeze(
        {
            pageSize: 10,
            showModal: false,
            commentSelected: {},
            commentSuccess: false,
            replyContent: "",
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        getCommentListPage(state: any, { data, thisChangeId }) {
            // 获取评论列表
            if (thisChangeId < getCommentListCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },

        getCommentReplyListReducerPage(state: any, { data, thisChangeId }) {
            // 获取评论回复列表
            if (thisChangeId < getCommentListCounter) return state;
            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    commentReplyList: data.commentReplyList.currentPage <= 1 ? data.commentReplyList : [...draft.commentReplyList, ...data.commentReplyList],
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getAppCommentList`, data, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *changeState({ data }, { put }) {
            yield put({ type: "input", data: data });
        },
        *getAppCommentList({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const thisChangeId = ++getCommentListCounter;

                if ( data.bindTableName === IParkBindTableNameEnum.post) {
                    data.parkId = getLocalStorage("parkId");
                    data.authenticatedParkId = getLocalStorage("parkId");
                }
                const commentList = yield call(interactiveTopicHttpService.getPaged, {
                    ...data,
                    isUserDelete: false,
                    pageSize: 9999,
                    auditStatus: CommentAuditStatusEnum.pass,
                    isShowWaitAudit: true,
                });

                yield put({ type: "getCommentListPage", data: commentList, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCommentReplyList({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const thisChangeId = ++getCommentListCounter;

                const commentReplyList = yield call(interactiveTopicHttpService.getPaged, { ...data, isUserDelete: false, pageSize: 999, auditStatus: CommentAuditStatusEnum.pass,
                    isShowWaitAudit: true, });

                yield put({ type: "getCommentReplyListReducerPage", data: { commentReplyList: commentReplyList }, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                yield put({ type: "input", data: { msg: e.errmsg } });
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getCurrentUser({ message }, { select, put }) {
            try {
                yield put({ type: "showLoading" });

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const currentUser = yield select((state) => state[authNamespaces.user]);
                // console.log("currentUser", currentUser)

                yield put({ type: "input", data: { currentUser: currentUser } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                yield put({ type: "input", data: { msg: e.errmsg } });
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *deleteOneComment({ message, callback, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(interactiveTopicHttpService.delete, data);
                if (result) {
                    yield call(callback, "删除成功");
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *submitReplyContent({ message, callback, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const submitCommentReplyResult = yield call(interactiveTopicHttpService.post, data);
                if (submitCommentReplyResult) {
                    yield call(callback, "回复成功");
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                yield put({ type: "input", data: { msg: e.errmsg } });
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *likeComment({ comment, bindTableName, likecallback, message }, { call }) {
            try {
                let result;
                bindTableName = bindTableName || IParkBindTableNameEnum.comment;
                if (comment?.isAgreed) {
                    result = yield call(rateRateHttpService.cancelAgree, comment?.id, bindTableName);
                } else {
                    result = yield call(rateRateHttpService.post, {
                        bindTableName: bindTableName,
                        bindTableId: comment?.id,
                        parkId: getLocalStorage("parkId"),
                        score: 1,
                        rateType: TopicRateTypeEnum.agree,
                    });
                }
                if (result) {
                    yield call(likecallback);
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(commentModel);
