import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, pictureService, formatDate, getLocalStorage } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { authAccountHttpService } from "@reco-m/auth-service";

import { Namespaces, BindTableNameEnum } from "./common";

export namespace accountinfoModel {
    export const namespace = Namespaces.accountinfo;
    export const state: any = freeze({ ...CoreState }, !0);
    export type StateType = typeof state;
    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: "getPersonInfoAction", message });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getPersonInfoAction({ message }, { select, put, call }) {
            try {
                yield put({ type: "showLoading" });
                yield yield put({ type: `${Namespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[Namespaces.user]),
                currentUser = user!.currentUser,
                positions = user!.positions,
                position = positions.find((item) => item.unitId === getLocalStorage("unitId")),
                pictureSrc = yield call(pictureService.getPictureList, {
                    bindTableName: BindTableNameEnum.account,
                    bindTableId: currentUser.id,
                    customType: 1,
                });

                yield put({
                    type: "input",
                    data: {
                        info: currentUser,
                        currentUser,
                        depart: position,
                        thumb: pictureSrc ? pictureSrc[pictureSrc.length - 1] : "",
                        birthday: currentUser && currentUser.birthday,
                        gender: currentUser && currentUser.gender,
                    },
                });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *modifyPersonInfoAction({ message, callback }, { call, put, select }) {
            try {
                const { birthday, gender, currentUser } = yield select((state) => state[Namespaces.accountinfo]);
                callback && callback(currentUser.id);
                yield call(authAccountHttpService.put, currentUser.id, {
                    account: {
                        ...currentUser,
                        password: null,
                        gender: gender,
                        birthday: formatDate(birthday),
                    },
                });
                yield put({
                    type: `${Namespaces.user}/cleanCurrentUser`,
                });
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },
    };
}

app.model(accountinfoModel);
