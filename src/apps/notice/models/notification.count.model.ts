import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from 'immer';

import { CoreEffects, CoreReducers, getLocalStorage, getStorageObject } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { notificationService } from "@reco-m/notice-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces, NotificationTypesEnum, MailBoxTypeEnum } from "./common";

export namespace notificationCountModel {

  export const namespace = Namespaces.notificationCount;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getNotificationCount`, message });

      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getNotificationCount({ message }, { call, put, select }) {
      try {
        yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
        const user = yield select((state) => state[authNamespaces.user]);
        const currentUser = user!.currentUser;

        if (currentUser.id ) {
          const { totalItems } = yield call(notificationService.getPaged, {
            isRead: "false",
            ownerID: currentUser.id,
            notificationType: NotificationTypesEnum.unRead,
            mailbox: MailBoxTypeEnum.mailBox,
            parkId: getLocalStorage("parkId"),
            sceneId: getStorageObject("allscenesIDS")
          });
          yield put({ type: "input", data: { notificationCount: totalItems } });
        }
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      }
    }
  };
}

app.model(notificationCountModel);
