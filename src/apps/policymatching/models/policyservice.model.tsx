import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage, formatDateTime, isAuth } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { CertifyEnum, ServiceSourceEnum, ServiceSourceTextEnum, CertifyStatusEnum } from "@reco-m/ipark-common";

import { memberService, memberCompanyUserTypeHttpService } from "@reco-m/member-service";

import { tagService } from "@reco-m/tag-service";

import {
    policyServiceHttpService,
    datatagService,
    policyMatchHttpService,
    datatagGroupService,
    policySubscribeService,
    policyService,
    policySpecialService,
} from "@reco-m/policymatching-service";

import { Namespaces, DataTypeEnum, PolicyDeclareModeEnum, transformArrFromMultiToSingle } from "./common";

export namespace policyserviceModel {
    export const namespace = Namespaces.policyservice;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            deadlineDate: null,
            type: CertifyEnum.admin,
            agreechecked: true,
        },
        !0
    );

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
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield yield put({ type: `getDeclareMode`, message });
                yield put({ type: `getMember`, message });
                yield put({ type: `getUserTypes`, message });
                yield put({ type: `getApplyTags`, message }); // 政策申报标签
                yield put({ type: `getCalculateTags`, message }); // 政策计算
                yield put({ type: `getMatchDatas`, message }); // 政策匹配
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getMatchDatas({ message, isCalculate }, { call, put, select }) {
            try {
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member || {};
     
                if (!member.id) {
                    return;
                }
                let param = {
                    mobile: member.mobile,
                    customerId: member.status === CertifyStatusEnum.allow ? member.companyId : undefined,
                    customerName: member.status === CertifyStatusEnum.allow ? member.companyName : undefined,
                    source: ServiceSourceTextEnum.app,
                    sourceValue: ServiceSourceEnum.app,
                    parkId: getLocalStorage("parkId"),
                };
                const result = yield call(policyMatchHttpService.postPolicyMatchResult, param);
                const resultList = yield call(policyMatchHttpService.getPolicyMatchList, { customerId: member.companyId, pageSize: 9999, parkId: getLocalStorage("parkId"),  isCalculate: isCalculate });
                const zhengclb = yield call(tagService.getTagByTagClass, { tagClass: "Policy/zhengclb", parkId: getLocalStorage("parkId") });

                if (!resultList) {
                    yield put({ type: "update", data: { policyMatch: result } });
                    return;
                }

                const resultListItems = resultList.items || [];

                const state = yield select((state) => state[Namespaces.policyservice]),
                    declareMode = state!.declareMode;
                if (declareMode === PolicyDeclareModeEnum.complex && resultListItems?.length > 0) {
                    const policyImplementationDetailIdList = resultListItems.map((x) => x.id);
                    const specialList = yield call(policySpecialService.getSpecialDetailList, {
                        policyImplementationDetailIdList,
                        isValid: true,
                    });
                    resultListItems.forEach((item) => {
                        item.special = specialList.find((x) => x.policyImplementationDetailId === item.id);
                    });
                }
                if (resultListItems?.some((x) => x.special)) {
                    resultListItems.forEach((item) => {
                        item.declareStartTime = item.special?.startDate;
                        item.declareEndTime = item.special?.endDate;
                    });
                }

                let resultListSort: any = [];
                zhengclb &&
                    zhengclb.forEach((item) => {
                        let tem = {
                            name: item.tagName,
                            listarr: [] as any,
                        };
                        resultListItems &&
                            resultListItems.forEach((itm) => {
                                if (item.tagValue === itm.policyTypeValue) {
                                    tem.listarr.push(itm);
                                }
                            });
                        resultListSort.push(tem);
                    });
                // zhengclb
                yield put({ type: "update", data: { policyMatch: result, resultListSort: resultListSort } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                // yield put({ type: "hideLoading" });
            }
        },
        *getCalculateTags({ message }, { call, put }) {
            try {
                const defaultTags = yield call(policyMatchHttpService.getPolicyMatchDefaultTagList);
                const matchLog = yield call(policyMatchHttpService.getPolicyMatchLog);
                const matchLogParse = matchLog ? JSON.parse(matchLog) : {};

                let groups = yield call(datatagGroupService.getList, { isValid: true });
                let result = transformArrFromMultiToSingle(groups.map((x) => x.tagList));
                result = result.filter((x) => !defaultTags.some((a) => a.id === x.id));
                // const resultper = yield call(policyTagHttpService.getList, { category: PolicyTagEnum.person });

                yield put({ type: "input", data: { calculateTags: result, ...matchLogParse, defaultTags } });
                yield put({ type: "getSubscription", message });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCalculateTagsItems({ message, tagId }, { call, put }) {
            try {
                const result = yield call(datatagService.getList, { tagClassId: tagId });

                yield put({ type: "input", data: { [tagId]: result } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getApplyTags({ message }, { call, put }) {
            try {
                const zhengclb = yield call(tagService.getTagByTagClass, { tagClass: "Policy/zhengclb", parkId: getLocalStorage("parkId") });
                const zhengcjb = yield call(tagService.getTagByTagClass, { tagClass: "Policy/zhengcjb", parkId: getLocalStorage("parkId") });
                const tuijian = [{ tagName: "全部" }];
                const tabs = tuijian.concat(zhengcjb);
                console.log("getApplyTags", zhengcjb);
                
                yield put({ type: "input", data: { zhengcjb: tabs, zhengclb } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getMember({ message }, { put, select }) {
            try {
                if (!isAuth()) {
                    return;
                }
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                let currentUser = user.currentUser;

                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message, refresh: true });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member || {};
                yield put({
                    type: "input",
                    data: {
                        member: member.id ? member : null,
                        account: currentUser,
                        realname: (currentUser && currentUser.realName) || "",
                        mobile: (currentUser && currentUser.mobile) || "",
                    },
                });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getUserTypes({ message }, { call, put }) {
            try {
                const usertypes = yield call(memberCompanyUserTypeHttpService.list);
                yield put({
                    type: "input",
                    data: {
                        usertypes,
                    },
                });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *certify({ message, params, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const { company, type, usertypes, account, updatamemberID, realname, mobile, department } = params;

                let usertype = {} as any;

                if (type === CertifyEnum.admin) {
                    usertypes &&
                        usertypes.forEach((item) => {
                            if (item.code === "qiygly") {
                                usertype = item;
                            }
                        });
                } else if (type === CertifyEnum.companyStaff) {
                    usertypes &&
                        usertypes.forEach((item) => {
                            if (item.code === "qiyyg") {
                                usertype = item;
                            }
                        });
                }
                let paramss = {
                    accountId: account.id,
                    companyDepartment: department,
                    companyId: company.customerId,
                    companyName: company.customerName,
                    companyUserTypeId: usertype.id,
                    companyUserTypeName: usertype.name,
                    parkId: getLocalStorage("parkId"),
                    parkName: getLocalStorage("parkName"),
                    realName: realname || account.realName,
                    mobile: mobile || account.mobile,
                    operateSource: ServiceSourceEnum.app,
                };
                let certify;
                if (updatamemberID) {
                    certify = yield call(memberService.put, updatamemberID, paramss);
                } else {
                    certify = yield call(memberService.post, paramss);
                }
                yield call(callback!, certify);
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        /**
         * 获取当前用户政策订阅
         * @param { message }
         * @param { call, put }
         */
        *getSubscription({ message }, { call, put }) {
            try {
                const result = yield call(policySubscribeService.getByUser);

                yield put({ type: "input", data: { subscription: result } });
            } catch (e) {
                yield call(message!.error, e.errmsg);
            }
        },
        *getPolicy({ message, pageIndex, param }, { call, put, select }) {
            try {
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member;
                const params = {
                    isPublish: true,
                    pageIndex: pageIndex,
                    pageSize: 15,
                    parkId: getLocalStorage("parkId"),
                    customerId: member && member.status === CertifyStatusEnum.allow ? member.companyId : undefined,
                    ...param,
                };

                const thisChangeId = ++changeCounter,
                    data = yield call(policyServiceHttpService.getPolicyServiceList, params);

                const state = yield select((state) => state[Namespaces.policyservice]),
                    declareMode = state!.declareMode;
                if (declareMode === PolicyDeclareModeEnum.complex && data?.items?.length > 0) {
                    const policyImplementationDetailIdList = data.items.map((x) => x.id);
                    const specialList = yield call(policySpecialService.getSpecialDetailList, {
                        policyImplementationDetailIdList,
                        isValid: true,
                    });
                    data.items.forEach((item) => {
                        item.special = specialList.find((x) => x.policyImplementationDetailId === item.id);
                    });
                }
                if (data?.items?.some((x) => x.specialId)) {
                    data.items.forEach((item) => {
                        item.declareStartTime = item.special?.startDate;
                        item.declareEndTime = item.special?.endDate;
                    });
                }
                yield put({ type: "policyPage", data, thisChangeId });
                yield put({ type: "input", data: { showList: true } });
                // callback();
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *policyMatchResult({ message, callback }, { call, put, select }) {
            try {
                const policyserviceState: any = yield select((state) => state[Namespaces.policyservice]),
                    defaultTags = policyserviceState!.defaultTags,
                    calculateTags = policyserviceState!.calculateTags,
                    subscription = policyserviceState!.subscription || [],
                    agreechecked = policyserviceState!.agreechecked;
                const defaultTagsArr: any = [];
                const calculateTagsArr: any = [];

                let tagList: any = [];
                let tagJson: any = {};
                defaultTags &&
                    defaultTags.forEach((element) => {
                        let itemSelect = policyserviceState[`${element.id}Select`];
                        if (itemSelect) {
                            let tem: any = {};
                            tem.tagId = element.id;
                            tem.tagName = element.className;
                            tem.dateTypeValue = element.dataTypeValue;
                            if (element.dataTypeValue === DataTypeEnum.string) {
                                if (element.remark === "多选") {
                                    let tagValue = "";
                                    itemSelect &&
                                        itemSelect.map((itm, i) => {
                                            defaultTagsArr.push(itm);
                                            if (i === 0) {
                                                tagValue = tagValue + itm.tagName;
                                            } else {
                                                tagValue = tagValue + "," + itm.tagName;
                                            }
                                        });
                                    tem.tagValue = tagValue;
                                } else {
                                    defaultTagsArr.push(itemSelect);
                                    tem.tagValue = itemSelect.tagName;
                                }
                            } else if (element.dataTypeValue === DataTypeEnum.num) {
                                tem.tagValue = itemSelect;
                            } else if (element.dataTypeValue === DataTypeEnum.date) {
                                tem.tagValue = formatDateTime(itemSelect);
                            } else if (element.dataTypeValue === DataTypeEnum.bool) {
                                tem.tagValue = itemSelect[0].tagValue;
                            }

                            tagJson[`${element.id}Select`] = itemSelect;

                            tagList.push(tem);
                        }
                    });
                calculateTags &&
                    calculateTags.forEach((element) => {
                        let itemSelect = policyserviceState[`${element.id}Select`];
                        if (itemSelect) {
                            let tem: any = {};
                            tem.tagId = element.id;
                            tem.tagName = element.className;
                            tem.dateTypeValue = element.dataTypeValue;
                            if (element.dataTypeValue === DataTypeEnum.string) {
                                if (element.remark === "多选") {
                                    let tagValue = "";
                                    itemSelect &&
                                        itemSelect.map((itm, i) => {
                                            calculateTagsArr.push(itm);
                                            if (i === 0) {
                                                tagValue = tagValue + itm.tagName;
                                            } else {
                                                tagValue = tagValue + "," + itm.tagName;
                                            }
                                        });
                                    tem.tagValue = tagValue;
                                } else {
                                    calculateTagsArr.push(itemSelect);
                                    tem.tagValue = itemSelect.tagName;
                                }
                            } else if (element.dataTypeValue === DataTypeEnum.num) {
                                tem.tagValue = itemSelect;
                            } else if (element.dataTypeValue === DataTypeEnum.date) {
                                tem.tagValue = formatDateTime(itemSelect);
                            } else if (element.dataTypeValue === DataTypeEnum.bool) {
                                tem.tagValue = itemSelect[0].tagValue;
                            }

                            tagJson[`${element.id}Select`] = itemSelect;

                            tagList.push(tem);
                        }
                    });
                if (!(tagList && tagList.length)) {
                    message!.error("至少选择一项标签");
                    return
                }
                

                if (agreechecked) {
                    // 统一同步至政策订阅
                    let implementationSubscribeTagIds = subscription.implementationSubscribeTagIds || "";
                    let implementationSubscribeTags = subscription.implementationSubscribeTags || "";
                    let implementationSubscribeTagIdsArr = implementationSubscribeTagIds.split(",");
                    let implementationSubscribeTagsArr = implementationSubscribeTags.split(",");
                    defaultTagsArr.forEach((element) => {
                        let tem = implementationSubscribeTagIdsArr.find((itm) => itm === element.id);

                        if (!tem) {
                            implementationSubscribeTagsArr.push(element.tagName);
                            implementationSubscribeTagIdsArr.push(element.id);
                        }
                    });
                    calculateTagsArr.forEach((element) => {
                        let tem = implementationSubscribeTagIdsArr.find((itm) => itm === element.id);

                        if (!tem) {
                            implementationSubscribeTagsArr.push(element.tagName);
                            implementationSubscribeTagIdsArr.push(element.id);
                        }
                    });

                    yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                    const user = yield select((state) => state[authNamespaces.user]);
                    const currentUser = user!.currentUser;
                    const data = {
                        accountId: currentUser?.id,
                        policySubscribeTags: subscription?.policySubscribeTags,
                        policySubscribeTagIds: subscription?.policySubscribeTagIds,
                        implementationSubscribeTags: implementationSubscribeTagsArr.join(","),
                        implementationSubscribeTagIds: implementationSubscribeTagIdsArr.join(","),
                    };
                    // 政策订阅
                    yield call(policySubscribeService.post, data);
                }

                // 政策计算器逻辑
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member || {};
                let param = {
                    mobile: member.mobile,
                    customerId: member.status === CertifyStatusEnum.allow ? member.companyId : undefined,
                    customerName: member.status === CertifyStatusEnum.allow ? member.companyName : undefined,
                    source: ServiceSourceTextEnum.app,
                    sourceValue: ServiceSourceEnum.app,
                    tagJson: JSON.stringify(tagJson),
                    tagList: tagList,
                    parkId: getLocalStorage("parkId"),
                };

                const result = yield call(policyMatchHttpService.postPolicyMatchResult, param);
                const resultList = yield call(policyMatchHttpService.getPolicyMatchList, { customerId: member.companyId, pageSize: 9999, parkId: getLocalStorage("parkId"), isCalculate: true });
                const zhengclb = yield call(tagService.getTagByTagClass, { tagClass: "Policy/zhengclb", parkId: getLocalStorage("parkId") });

                if (!resultList) {
                    yield put({ type: "input", data: { policyMatch: result } });
                    callback && callback(result);
                    return;
                }

                const resultListItems = resultList.items || [];

                const state = yield select((state) => state[Namespaces.policyservice]),
                    declareMode = state!.declareMode;
                if (declareMode === PolicyDeclareModeEnum.complex && resultListItems?.length > 0) {
                    const policyImplementationDetailIdList = resultListItems.map((x) => x.id);
                    const specialList = yield call(policySpecialService.getSpecialDetailList, {
                        policyImplementationDetailIdList,
                        isValid: true,
                    });
                    resultListItems.forEach((item) => {
                        item.special = specialList.find((x) => x.policyImplementationDetailId === item.id);
                    });
                }
                if (resultListItems?.some((x) => x.special)) {
                    resultListItems.forEach((item) => {
                        item.declareStartTime = item.special?.startDate;
                        item.declareEndTime = item.special?.endDate;
                    });
                }

                let resultListSort: any = [];
                zhengclb &&
                    zhengclb.forEach((item) => {
                        let tem = {
                            name: item.tagName,
                            listarr: [] as any,
                        };
                        resultListItems &&
                            resultListItems.forEach((itm) => {
                                if (item.tagValue === itm.policyTypeValue) {
                                    tem.listarr.push(itm);
                                }
                            });
                        resultListSort.push(tem);
                    });

                yield put({ type: "input", data: { policyMatch: result, resultListSort } });

                callback && callback(result);

            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                // yield put({ type: "hideLoading" });
            }
        },
        /**
         * 获取申报类型
         * @param { message }
         * @param { call, put }
         */
        *getDeclareMode({ message }, { call, put }) {
            try {
                const config = yield call(policyService.getConfig);
                yield put({ type: "input", data: { declareMode: config?.declareMode } });
            } catch (e) {
                yield call(message!.error, "getDeclareMode：" + e.errmsg);
            }
        },
    };
}

app.model(policyserviceModel);
