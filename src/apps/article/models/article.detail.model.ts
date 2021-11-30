import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, getLocalStorage, setLocalStorage } from "@reco-m/core";

import { app, getSharePicture, share, shareType, setEventWithLabel, ToastInfo } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { articleHttpService } from "@reco-m/article-service";

import { interactiveTopicHttpService } from "@reco-m/comment-service";

import { IParkBindTableNameEnum, htmlContentTreatWord } from "@reco-m/ipark-common";

import { Namespaces } from "./common";
export namespace articleDetailModel {
    export const namespace = Namespaces.articleDetail;

    export type StateType = typeof state;

    export const state: any = freeze({ number: 0 }, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ id, message, callback }, { put }) {
            try {
                yield put({ type: "showLoading" });
                yield put({ type: "getArticleDetail", data: { articleId: id }, message, callback });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getArticleDetail({ message, data, callback }, { call, put }) {
            try {
                const articleDetail = yield call(articleHttpService.get, data.articleId);
                if (!articleDetail) {
                    location.href = `${location.href.split("?")[0]}/deleteData`
                    return
                }
                let obj = {
                    bindTableId: data.articleId,
                    bindTableName: IParkBindTableNameEnum.article,
                    replyId: 0,
                    isUserDelete: false,
                    isPublic: true,
                    auditStatus: 1
                };
                const pictureSrc = yield call(pictureService.getPictureUrl, {
                    bindTableName: IParkBindTableNameEnum.article,
                    bindTableId: data.articleId,
                    customType: 0,
                    fileUsage: 1
                });
                // 获取评论个数
                let commentCount = yield call(interactiveTopicHttpService.getCommentCount, obj);

                // 处理信息园区
                let parkId = getLocalStorage("parkId");
                const parkVMList = articleDetail.parkVMList;
                if (!parkId) {        
                    setLocalStorage("parkId", parkVMList[0]!.parkId)
                } else {
                    let access = false;
                    parkVMList && parkVMList.map((item) => {
                        if (item.parkId === parkId || item.id === parkId) {
                            access = true;
                        }
                    })
                    !access && ToastInfo("非此园区资源，请在首页顶部切换园区后再操作", 2, undefined, () => {
                        history.go(-1);
                    })
                }

                yield put({
                    type: "input",
                    data: { articleDetail: articleDetail, commentCount: commentCount[data.articleId], pictureSrc },
                });
                callback && callback();
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *startShareArticle({ message, callback }, { select }) {
            try {
                const { articleDetail } = yield select((state) => state[Namespaces.articleDetail]);
                const { articleVM = {}, pictureSrc, content: contentDetail } = articleDetail || {},
                    title = articleVM.title;

                const contentHTML = contentDetail;
                let content = htmlContentTreatWord(contentHTML),
                    shareContent = content ? content.substring(0, 40) : "",
                    img = getSharePicture(pictureSrc, contentHTML, "http://demo.bitech.cn/IPark_Share/assets/images/ipark1.png");

                let result = share(title, shareContent, img, window.location.href);

                result!.then((data) => {
                   if (callback) callback();

                    data === shareType.qq
                        ? setEventWithLabel(statisticsEvent.parkHeadlineQQShare)
                        : data === shareType.weixin
                        ? setEventWithLabel(statisticsEvent.parkHeadlineWeChatShare)
                        : data === shareType.weibo
                        ? setEventWithLabel(statisticsEvent.parkHeadlineWeiboShare)
                        : data === shareType.qqspace && setEventWithLabel(statisticsEvent.parkHeadlineSpaceShare);
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *addViewCounts({ message, articleId, callback }, { call }) {
            try {
                const addViewResult = yield call(articleHttpService.addView, articleId);

                yield call(callback, addViewResult);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(articleDetailModel);
