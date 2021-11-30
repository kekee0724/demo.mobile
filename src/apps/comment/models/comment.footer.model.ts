import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { interactiveTopicHttpService, rateRateHttpService } from "@reco-m/comment-service";

import { IParkBindTableNameEnum, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { Namespaces, CommentTypeEnum, TopicRateTypeEnum } from "./common";

export namespace commentFooterModel {
    export const namespace = Namespaces.commentFooter;

    export type StateType = typeof state;

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
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getCommentList`, data, message });
                yield put({ type: `getarticledianzancount`, bindTableName: data.bindTableName, bindTableId: data.bindTableId, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getCommentList({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                if ( data.bindTableName === IParkBindTableNameEnum.post) {
                    data.parkId = getLocalStorage("parkId");
                    data.authenticatedParkId = getLocalStorage("parkId");
                }
                const commentList = yield call(interactiveTopicHttpService.getPaged, {
                    ...data,
                    isUserDelete: false,
                    pageSize: 1,
                    isPublic: true,
                    auditStatus: CommentAuditStatusEnum.pass
                });
                yield put({
                    type: "input",
                    data: { commentalllist: commentList.items, number: commentList.totalItems ? +commentList.totalItems : 0 },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                yield put({ type: "input", data: { msg: e.errmsg } });
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getarticledianzancount({ message, bindTableId, bindTableName }, { put, call }) {
            try {
                const result = yield call(rateRateHttpService.getAgreeCoutn, bindTableId, bindTableName);
                yield put({
                    type: "input",
                    data: { dianzancount: result.agreeCount, isFollow: result.isAgreed },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *changeCommentNum({ message, data }, { put, select }) {
            try {
                yield put({ type: "showLoading" });

                const { commentFooterMsg } = yield select((state) => ({ commentFooterMsg: state[Namespaces.commentFooter] }));

                let commentNum = -1;
                if (data === CommentTypeEnum.reduce)
                    // 评论减1
                    commentNum = commentFooterMsg.number - 1;
                else if (data === CommentTypeEnum.add)
                    // 评论加1
                    commentNum = commentFooterMsg.number + 1;

                if (commentNum !== -1)
                    yield put({
                        type: "input",
                        data: { number: commentNum },
                    });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                yield put({ type: "input", data: { msg: e.errmsg } });
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *submitCommentContent({ commentFail, commentSuccess, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const postReturnData = yield call(interactiveTopicHttpService.post, data);
                if (postReturnData) {
                    yield call(commentSuccess, "评论成功");
                    yield put({
                        type: "changeCommentNum",
                        data: CommentTypeEnum.add,
                    });
                }
            } catch (e) {
                yield call(commentFail, e.errmsg);
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

app.model(commentFooterModel);
