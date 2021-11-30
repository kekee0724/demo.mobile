import * as routerRedux from "react-router-redux";
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, customEvent, isAnonymous, removeLocalStorage } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { authService, userProfileService } from "@reco-m/auth-service";

import { Namespaces } from "./common";

export namespace userModel {
    export const namespace = Namespaces.user;

    export const state = freeze({ ...CoreState });

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,

        *getAvatar({ message }, { call, put }) {
            if (!isAnonymous()) {
                try {
                    const avatar = yield call(userProfileService.getHeadImage);

                    yield put({ type: "input", data: { avatar } });
                } catch (e) {
                    message!.error(e.errmsg || e);
                    return Promise.reject(e);
                }
            }
        },

        *cleanCurrentUser({}, {}) {
            authService.clearCurrentUser();
        },

        *getCurrentUser({ message, callback, data }, { call, put }) {
            if (isAnonymous()) yield put({ type: "input", data: {currentUser: {}} });
            else {
                try {
                    let user = yield call(authService.getCurrentUser, data);
                    user = user || {};
                    user.currentUser = user.currentUser || {}

                    yield put({ type: "input", data: user || {} });

                    if (callback) yield call(callback, user);
                } catch (e) {
                    message!.error(e.errmsg || e);
                }
            }
        },

        *getCurrentUserFullInfo({ message, callback, data, ...props }, { put, call }) {
            try {
                yield put({ ...props, message, type: "getAvatar" });

                yield put({
                    ...props,
                    message,
                    type: "getCurrentUser",
                    data,
                    *callback(user) {
                        yield put({ type: "getEdit", params: user });

                        callback && (yield call(callback));
                    },
                });
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },

        *logout({ message }, { call, put }) {
            try {
                removeLocalStorage("allscenes");
                removeLocalStorage("allscenesIds");
                removeLocalStorage("allTakeScenesId");
                yield call(authService.logout);

                yield call(customEvent.emit, "logout");

                yield put({ type: "init" });

                yield put(routerRedux.replace("/"));
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },
    };
}

app.model(userModel);
