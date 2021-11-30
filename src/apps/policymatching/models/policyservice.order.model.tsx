import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { policySubscribeService } from "@reco-m/policymatching-service";

import { tagService } from "@reco-m/tag-service";

import { datatagService, datatagGroupService, policyService } from "@reco-m/policymatching-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces, DataTypeEnum, POLICY_TAG_ARR, transformArrFromMultiToSingle } from "./common";

export namespace policyserviceOrderModel {
    export const namespace = Namespaces.policyserviceOrder;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({
        pageSize: 15
    }, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
        policyPage(state: any, { data, thisChangeId }) {
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
        *initPage({ param, message, pageIndex }, { put }) {
            put({ type: "showLoading" });
            try {
                yield yield put({ type: "getDatas", param, message, pageIndex });
                yield yield put({ type: "getTags", message });
                yield put({ type: "getSubscription", message });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getDatas({ message, pageIndex, param }, { put, call }) {
            try {
                const params = {
                    pageIndex: pageIndex,
                    pageSize: 15,
                    parkId: getLocalStorage("parkId"),
                    ...param,
                };
                const thisChangeId = ++changeCounter,
                    data = yield call(policySubscribeService.getSubscribePaged, params);

                yield put({ type: "policyPage", data, thisChangeId });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                // yield put({ type: "hideLoading" });
            }
        },
        *getTags({ message }, { put, call }) {
            try {
                /**
                 * 获取标签数据
                 */
                const tagClass = POLICY_TAG_ARR.map((x) => x.tagCode).join(",");
                const tagter = yield call(tagService.getTagByTagClasses, { tagClass: tagClass, parkId: getLocalStorage("parkId") });
                const tagData: any[] = [];
                POLICY_TAG_ARR.forEach((item) => {
                    tagData.push({ map: item.tagCode, title: item.title, list: tagter[item.tagCode].map((x) => ({ label: x.tagName, value: x.id })) });
                });

                /**
                 * 获取政策标签数据
                 */
                const result = yield call(policyService.getApplyTags, { applyTagFlags: [1, 2, 3], parkId: getLocalStorage("parkId") });

                const policyTags: any[] = [];
                Object.keys(result).forEach((key) => {
                    const list = result[key];

                    list.length > 0 &&
                        list.forEach((item) => {
                            policyTags.push({
                                map: item.id,
                                title: item.className,
                                list: item.fitTags.length > 0 && item.fitTags.map((x) => ({ label: x.tagName, value: x.id } || [])),
                            });
                        });
                });
                /**
                 * 获取实施细则标签数据
                 */
                const groups = yield call(datatagGroupService.getList, { dataTypeValue: DataTypeEnum.string, isValid: true });
                const result2 = transformArrFromMultiToSingle(groups.map((x) => x.tagList)).filter((x) => x.dataTypeValue === DataTypeEnum.string);

                const implementationTags: any[] = [];

                for (let i = 0; i < result2?.length; i++) {
                    const tag = result2[i];
                    const tagId = tag?.id;
                    const tagItemList = yield call(datatagService.getList, { tagClassId: tagId });
                    tag.tagList = tagItemList || [];

                    implementationTags.push({
                        map: tagId,
                        title: tag.className,
                        list: tagItemList?.length > 0 && tagItemList.map((x) => ({ label: x.tagName, value: x.id } || [])),
                    });
                }
                yield put({ type: "input", data: { tagList: [...tagData, ...policyTags, ...implementationTags], tagData, policyTags, implementationTags } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        /**
         * 重置政策订阅
         * @param { message }
         * @param { call, put }
         */
        *resetTag({ message }, { call, put, select }) {
            try {
                const state = yield select((state) => state[Namespaces.policyserviceOrder]),
                    tagList = state!.tagList || [];
                for (let i = 0; i < tagList?.length; i++) {
                    const item = tagList[i];
                    yield put({ type: "input", data: { [item.map]: [] } });
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                yield call(message!.error, e.errmsg);
            }
        },
        /**
         * 政策订阅
         * @param { message, callback }
         * @param { call, put }
         */
        *subscription({ message, callback }, { call, put, select }) {
            try {
                const state = yield select((state) => state[Namespaces.policyserviceOrder]),
                    tagData = state!.tagData || [],
                    policyTags = state!.policyTags || [],
                    implementationTags = state!.implementationTags || [];
                // const user = yield call(authService.getCurrentUser);

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                const policySubscribeTagStrObj = handleSubscriptionTags([...tagData, ...policyTags], state);
                const implementationSubscribeTagStrObj = handleSubscriptionTags(implementationTags, state);

                const data = {
                    accountId: currentUser.id,
                    policySubscribeTags: policySubscribeTagStrObj.nameStr,
                    policySubscribeTagIds: policySubscribeTagStrObj.idStr,
                    implementationSubscribeTags: implementationSubscribeTagStrObj.nameStr,
                    implementationSubscribeTagIds: implementationSubscribeTagStrObj.idStr,
                };

                yield call(policySubscribeService.post, data);
                if (callback) {
                    yield call(callback);
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                yield call(message!.error, e.errmsg);
            }
        },
        /**
         * 获取当前用户政策订阅
         * @param { message }
         * @param { call, put }
         */
        *getSubscription({ message }, { call, put, select }) {
            try {
                const result = yield call(policySubscribeService.getByUser);

                if (
                    result &&
                    (result.policySubscribeTags ||
                        result.implementationSubscribeTags )
                ) {
                    yield put({ type: "input", data: { isSubscription: true } });
                    const implementationSubscribeTagIds = result.implementationSubscribeTagIds ? result.implementationSubscribeTagIds.split(",") : [];
                    const policySubscribeTagIds = result.policySubscribeTagIds ? result.policySubscribeTagIds.split(",") : [];
                    const selectedIds = [...implementationSubscribeTagIds, ...policySubscribeTagIds];

                    const state = yield select((state) => state[Namespaces.policyserviceOrder]),
                        tagList = state!.tagList || [];

                    for (let i = 0; i < tagList?.length; i++) {
                        const item = tagList[i];
                        // console.log("item", item);
                        const ids = item.list && item.list
                            .filter((x) => selectedIds.some((a) => a === x.value))
                            .map((a) => {
                                return { label: a.label, value: a.value };
                            });
                        if (ids.length) {
                            yield put({ type: "update", data: { [item.map]: ids } });
                        } else {
                            yield put({ type: "update", data: { [item.map]: null } });
                        }
                    }
                } else {
                    yield put({ type: "input", data: { isSubscription: false } });
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                yield call(message!.error, e.errmsg);
            
            } finally {
                // yield put({ type: "hideLoading" });
            }
        },
    };

    /**
     * 处理订阅标签
     * @param tags
     * @param state
     * @returns
     */
    export function handleSubscriptionTags(tags: any[], state: any) {
        let nameStr = "";
        let idStr = "";

        tags.length > 0 &&
            tags.forEach((item) => {
                const selected = state && state[item.map];
                let tags: any[] = [];
                if (selected?.length) {
                    tags = item.list.filter((x) => selected.some((a) => a.value === x.value));
                }
                if (tags.length) {
                    nameStr = nameStr + (nameStr ? "," : "") + tags.map((x) => x.label).join(",");
                    idStr = idStr + (idStr ? "," : "") + tags.map((x) => x.value).join(",");
                }
            });
        return { nameStr, idStr };
    }
}

app.model(policyserviceOrderModel);
