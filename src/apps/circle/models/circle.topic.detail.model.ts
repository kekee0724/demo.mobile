import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app, getSharePicture, share, shareType, setEventWithLabel } from "@reco-m/core-ui";

import { followService, interactiveTopicHttpService } from "@reco-m/ipark-white-circle-service";

import { authService } from "@reco-m/auth-service";

import { statisticsEvent } from "@reco-m/ipark-statistics";
import { Namespaces } from "./common";

export namespace circleTopicDetailModel {
    export const namespace = Namespaces.circleTopicDetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,

        *initPage({ message, topicID }, { call, put }) {
            try {
                put({ type: "showLoading" });
                yield put({ type: "init" });
                yield put({ type: "getfirstTopicComment", data: topicID, message });
                yield put({ type: "getCurrentUser", message });
            } catch (e) {
                yield call(message!.error, e.errmsg);
            }
        },
        *getfirstTopicComment({ message, data }, { call, put }) {
            try {
                const firstTopicComment = yield call(interactiveTopicHttpService.get, data);

                yield put({ type: "input", data: { firstTopicComment: firstTopicComment } });

                if (!firstTopicComment) {
                    location.href = `${location.href.split("?")[0]}/deleteData`
                }
            } catch (e) {
                yield call(message!.error, e.errmsg);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCurrentUser({ message }, { put, call }) {
            try {
                const user = yield call(authService.refreshCurrentUser);
                yield put({ type: "input", data: { user: user } });
            } catch (e) {
                yield call(message!.error, e.errmsg);
            }
        },
        // 取消关注保留记录
        *cancelFollow({ id, callback, message }, { call }) {
            try {
                yield call(followService.cancelFollow, id);
                yield call(callback);
            } catch (e) {
                yield call(message!.error, e.errmsg);
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
                yield call(message!.error, e.errmsg);
            }
        },
        *startShareATopicDetail({ message, callback, callback2 }, { select, call }) {
            try {
                const { circletopicDetail = {} } = yield select((state) => ({ circletopicDetail: state[Namespaces.circleTopicDetail] })),
                    firstTopicComment = circletopicDetail.firstTopicComment || {},
                    contentHTML = firstTopicComment.postContent || "话题分享";

                const img = getSharePicture(firstTopicComment && firstTopicComment.pictureUrlList && firstTopicComment.pictureUrlList[0], contentHTML, "");

                let articleContent = contentHTML && contentHTML.replace(/<\/?.+?\/?>/g, ""),
                    shareArticleContent = articleContent ? articleContent.substring(0, 40) : "";

                const result = share(shareArticleContent, shareArticleContent, img, window.location.href);
                result!.then((data) => {
                    if (callback2) callback2();
                    data === shareType.qq
                        ? setEventWithLabel(statisticsEvent.parkHeadlineQQShare)
                        : data === shareType.weixin
                        ? setEventWithLabel(statisticsEvent.parkHeadlineWeChatShare)
                        : data === shareType.weibo
                        ? setEventWithLabel(statisticsEvent.parkHeadlineWeiboShare)
                        : data === shareType.qqspace && setEventWithLabel(statisticsEvent.parkHeadlineSpaceShare);
                });
                yield call(callback);
            } catch (e) {
                yield call(message!.error, e.errmsg);
            }
        },
    };
}

app.model(circleTopicDetailModel);
