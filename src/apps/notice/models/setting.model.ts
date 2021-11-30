import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, setStorageObject } from "@reco-m/core";

import { app, jpushRegisterTag } from "@reco-m/core-ui";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { notificationSceneService } from "@reco-m/notice-service";

import { Namespaces } from "./common";

export namespace noticesettingModel {
    export const namespace = Namespaces.noticesetting;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            version: "0.0.0.0",
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *postTake({ message, take, item }, { put, select, call }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                if (take) {
                    yield call(notificationSceneService.cancelTake, {
                        sceneIds: [item.id],
                        userId: currentUser.id,
                    });
                } else {
                    yield call(notificationSceneService.takeScene, {
                        sceneIds: [item.id],
                        userId: currentUser.id,
                    });
                }

                yield put({ type: "getTake", message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getTake({ message }, { put, call }) {
            try {
                const result = yield call(notificationSceneService.getTakeScene, "SOC");
                let arr = result;
                let tags: any = [];

                arr.forEach((s) => {
                    tags.push("Scene_" + s.id);
                });
                /**
                 * 原生极光设置标签场景
                 */
                jpushRegisterTag(tags.join(","));
                let idsInt = arr.map(function (data) {
                    return data.id;
                });
                setStorageObject("allTakeScenesID", idsInt.length === 0 ? [] : idsInt);
                yield put({ type: "input", data: { takeScences: arr } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(noticesettingModel);
