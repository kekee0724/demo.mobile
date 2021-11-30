import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { rateRateHttpService } from "@reco-m/comment-service";

import { tagService } from "@reco-m/tag-service";

import {ServiceSourceEnum, ServiceSourceTextEnum } from "@reco-m/ipark-common";

import { Namespaces, TopicRateTypeEnum } from "./common";

export namespace evaluateModel {
    export const namespace = Namespaces.evaluate;

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
        *initPage({ message, evaluateTagClassCode }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getCertifyUser`, message });
                yield put({ type: `getEvaluateTags`, data: { tagClass: evaluateTagClassCode ? evaluateTagClassCode : "RATE/PINGJLX", parkId: getLocalStorage("parkId") }, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCertifyUser({ message }, { put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);

                if (user.id) {
                    yield put({ type: "input", data: { currentUser: user } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *evaluateAction({ message,  callback, bindTable, bindTableValue }, { put, call, select }) {
            try {
                const state = yield select((state) => state[Namespaces.evaluate]);

                const selectTags = state!.selectTags;
                let selectTagTexts = [] as any;
                selectTags &&
                    selectTags.forEach((item) => {
                        selectTagTexts.push(item.tagName);
                    });
                let selectTagText = selectTagTexts && selectTagTexts.length > 0 ? selectTagTexts.join(",") + "<br/>" : "";
                const params = {
                    rateRelationVMList: bindTable,
                    bindTableValue: bindTableValue,
                    score: state!.satisfaction ? state!.satisfaction : 0,
                    rateContent: (selectTagText || "") + (state!.content && typeof state!.content !== "undefined" ? state!.content : ""),
                    source: ServiceSourceTextEnum.app,
                    sourceValue: ServiceSourceEnum.app,
                    tagList: state!.selectTags,
                    isAnonymous: state!.IsAnonymous,
                    parkId: getLocalStorage("parkId"),
                    parkName: getLocalStorage("parkName"),
                    rateType: TopicRateTypeEnum.rate,
                };
                const result = yield call(rateRateHttpService.post, params);
                if (result) {
                    yield call(callback, "评价成功");
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getEvaluateTags({ message, data }, { put, call }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(tagService.getTagByTagClass, data);
                result &&
                    result.forEach((item) => {
                        item.tagId = item.id;
                    });
                yield put({ type: "input", data: { evaluateTags: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(evaluateModel);
