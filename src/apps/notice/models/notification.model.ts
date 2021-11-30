import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage, getStorageObject } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { notificationService } from "@reco-m/notice-service";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { NotificationTypesEnum, MailBoxTypeEnum, Namespaces } from "./common";

export namespace notificationModel {
    export const namespace = Namespaces.notification;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    let changeCounter = 0;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {},
        notificationListPage(state: any, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getAllNotificationSence`, message });
                yield put({ type: `getCertify`, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCertify({ message }, { select, put }) {
            try {
                yield put({ type: "showLoading" });

                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member;

                yield put({ type: "input", data: { member: member } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *initPageList({ message, param }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({
                    type: "getNotificationList",
                    param: param,
                    message,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getNotificationList({ message, param }, { call, select, put }) {
            try {
                // const user = yield select(state => state[authNamespaces.user]);
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                let thisChangeId = ++changeCounter,
                    data = yield call(notificationService.getPaged, {
                        ownerId: currentUser.id,
                        mailbox: MailBoxTypeEnum.mailBox,
                        notificationType: NotificationTypesEnum.unRead,
                        parkId: getLocalStorage("parkId"),
                        ...param,
                    });
                yield put({ type: "notificationListPage", data, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        // 全部已读
        *readAllNotification({ param }, { call, put }) {
            yield call(notificationService.readAllNotification, { notificationType: NotificationTypesEnum.unRead, ...param });
            yield put({ type: "getNotificationList", param: { pageSize: 15, sceneId: [param.sceneId], pageIndex: 1 } });
        },

        // 已读
        *readNotificationAction({ detailID }, { call }) {
            yield call(notificationService.readNotification, detailID);
        },

        *getAllNotificationSence({}, { put }) {
            try {
                let sceneIDs = getStorageObject("allscenesIDS");

                yield put({ type: "getSence", param: { sceneId: sceneIDs } });
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getSence({ message, param }, { call, put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                if (currentUser.id) {
                    const notificationScene = yield call(notificationService.getScene, {
                        ownerId: currentUser.id,
                        pageSize: 10,
                        notificationType: NotificationTypesEnum.unRead,
                        mailbox: MailBoxTypeEnum.mailBox,
                        parkId: getLocalStorage("parkId"),
                        sceneId: getStorageObject("allscenesIDS") || param.sceneId,
                    });
                    yield put({ type: "input", data: { notificationScene: notificationScene!.items } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        // 删除消息
        *deleteNotification({ message, callback, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                yield call(notificationService.deleteNotification, data);

                yield call(callback, "删除成功");
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(notificationModel);
