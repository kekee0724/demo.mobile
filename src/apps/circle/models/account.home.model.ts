import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { memberSocialInfoHttpService } from "@reco-m/member-service";
import { CoreEffects, CoreReducers, pictureService, getLocalStorage, setLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { PersonInfoService } from "@reco-m/auth-service";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
import { followService } from "@reco-m/ipark-white-circle-service";
import { Namespaces } from "./common";

export namespace accountHomeModel {
    export const namespace = Namespaces.accountHome;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, userID }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `getUserInfo`, userID, message });
                yield put({ type: `getUserFollow`, userID, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *receivePropsRefresh({ message, userID, myTrendData, myTopicData, myFollowData, myFansData }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `initPage`, userID, message });
                yield put({ type: `myTrend/initPage`, data: myTrendData, message });
                yield put({ type: `myTopic/initPage`, data: {datas: myTopicData}, message });
                yield put({ type: `myFollow/initPage`, params: myFollowData, message });
                yield put({ type: `myFans/initPage`, params: myFansData, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getUserInfo({ message, userID }, { select, put, call }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser || {};
                const isNotCurrentUser = currentUser.id === userID ? false : true; // 判断显示主页是否是当前用户的
                setLocalStorage("userID", currentUser.id);

                const pictureSrc = yield call(pictureService.getPictureList, {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: userID,
                    customType: 1,
                });
                const personInfo = yield call(PersonInfoService.getInfo, {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: userID,
                });

                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    currentMember = memberState.member || {};

                let data = {};
                data[`isNotCurrentUser${userID}`] = isNotCurrentUser;
                data[`thumb${userID}`] = pictureSrc ? pictureSrc[pictureSrc.length - 1] : "";
                data[`realName${userID}`] = personInfo?.fullName;
                data[`nickName${userID}`] = personInfo?.fullName || currentUser.nickName;
                data[`province${userID}`] = personInfo?.province;
                data[`city${userID}`] = personInfo?.city;
                data[`idiograph${userID}`] = personInfo?.idiograph;
                data[`currentCompany${userID}`] = currentMember.companyName;

                yield put({
                    type: "input",
                    data: data,
                });
                yield put({ type: `getReleventNum`, userID, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getReleventNum({ message, userID }, { call, put }) {
            try {
                const result = yield call(memberSocialInfoHttpService.getMyCount, userID);
                let data = {};
                data[`releventNum${userID}`] = result;
                yield put({ type: "input", data: data });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        // 取消关注保留记录
        *cancelFollow({ id, callback, message }, { call }) {
            try {
                yield call(followService.cancelFollow, id);
                yield call(callback);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
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
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getUserFollow({ userID, message }, { call, put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = (user && user.currentUser) || {};
                let datas = yield call(followService.getMyfollow, {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    inputerId: currentUser.id,
                    parkId: getLocalStorage("parkId"),
                    pageSize: 999,
                });
                let isFollow = 0;
                datas &&
                    datas.items &&
                    datas.items.forEach((item) => {
                        if (item.status && item.userId === userID) {
                            isFollow = isFollow + 1;
                        }
                    });
                let data = {};
                data[`isFollow${userID}`] = isFollow;
                yield put({ type: "input", data });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(accountHomeModel);
