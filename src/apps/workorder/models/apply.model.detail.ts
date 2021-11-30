import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { rateRateHttpService } from "@reco-m/comment-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { workOrderService, myMarketInHttpService } from "@reco-m/workorder-service";

import { CommentAuditStatusEnum, IParkBindTableNameEnum } from "@reco-m/ipark-common";
import { Namespaces } from "./common";

export namespace applyDetailModel {
    export const namespace = Namespaces.applyDetail;

    export type StateType = typeof state;

    // let changeCounter = 0;

    export const state: any = freeze(
        {
            submitting: false,
            modalFlag: false,
            hasMore: true,
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
        *initPage({ data, error, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `input`, data: { applyDetailData: undefined }, message });
                yield put({ type: `getMyApplyDetail`, data: data.id, message });

                yield put({ type: `getApplyLog`, data: data.id, message });
            } catch (e) {
                console.error(e);
                error(e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        
        // 获取该工单的详细内容
        *getMyApplyDetail({ data, message, callback }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });

                const applyDetailData = yield call(workOrderService.get, data);
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const { user } = yield select((state) => ({ user: state[authNamespaces.user] }));
                const currentUser = user!.currentUser;
                const inputerId = applyDetailData?.order?.inputerId;

                let pictureSrc;
                if (applyDetailData.receiver) {
                    pictureSrc = yield call(pictureService.getPictureList, {
                        bindTableName: IParkBindTableNameEnum.sysaccount,
                        bindTableId: applyDetailData.receiver.id,
                        customType: 1,
                    });
                }

                yield put({ type: `getCommentList`, id: data, userid: applyDetailData?.order?.inputerId, message });

                yield put({
                    type: "input",
                    data: {
                        applyDetailData: applyDetailData,
                        realName: currentUser.realName,
                        isInputer: inputerId === currentUser.id ? true : false,
                        thumb: pictureSrc && pictureSrc.length ? pictureSrc[pictureSrc.length - 1] : null
                    },
                });
                callback && callback();
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        // 获取评价列表
        *getCommentList({ fail, id, userid}, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                let data = { bindTableIdList: [id], inputerId: userid,  auditStatus: CommentAuditStatusEnum.pass, isShowWaitAudit: true };
                const commentData = yield call(rateRateHttpService.getPaged, data);

                yield put({
                    type: "input",
                    data: {
                        hasMore: commentData.currentPage < commentData.totalPages,
                        commentData,
                    },
                });
            } catch (error) {
                fail!(error.errmsg);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        // 获取加载进度
        *getApplyLog({ data, message }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const applyLogData = yield call(workOrderService.getLog, data);
                const billLogData = yield call(workOrderService.getBill, data);

                if (!applyLogData || applyLogData.length <= 4) yield put({ type: "input", data: { isOrderView: true } });

                let applyLogArr = [] as any,
                    applyBackArr = [] as any;
                applyLogData.forEach((item) => {
                    if (item.description === "工单反馈") {
                        applyBackArr.push(item);
                    } else {
                        applyLogArr.push(item);
                    }
                });

                yield put({
                    type: "input",
                    data: { applyLogData: applyLogArr.reverse(), applyBackData: applyBackArr, repairList: billLogData },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        // 提醒管理员审核工单
        *remindAdmin({ message, data, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const submitResult = yield call(workOrderService.remindAdmin, data);

                yield call(callback!, submitResult);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        // 获取机构详情
        *getMarketDetail({ e, data, message }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const marketDetail = yield call(myMarketInHttpService.get, data);

                yield put({ type: "input", data: { detail: marketDetail } });
            } catch (error) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(applyDetailModel);
