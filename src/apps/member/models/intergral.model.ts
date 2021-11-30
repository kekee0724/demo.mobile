import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { integralintegralHttpService, integralConfigHttpService, memberSignHttpService, integralEventHttpService, integralOperateHttpService } from "@reco-m/member-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { parkCateService } from "@reco-m/park-service";

import { workOrderService } from "@reco-m/workorder-service";

import { deepClone } from "@reco-m/ipark-common";

import { Namespaces, getCertifyStatusEnum, getCertifyCompanyName, changeCounters, multisort, CurrentIntergralTypeEnum } from "./common";

export namespace intergralModel {
    export const namespace = Namespaces.intergral;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            currentIntergralType: 0, // 0个人 1企业
            ruleType: 0, // 0赚取  1支出
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
        *initPage({ message }, { put }) {
            yield put({ type: "showLoading" });

            try {
                yield put({ type: "init" });
                yield put({ type: `isSign`, message });

                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });

                yield put({ type: "getCertifyMember", message });
                yield put({ type: "getEventStatisticEarnExpend", message });
                yield put({ type: "getLoyal", message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *initTab({ message }, { put }) {
            try {
                yield put({
                    type: "input",
                    data: {
                        member: null,
                    },
                });
                yield put({ type: "getOperatesAction", data: { pageIndex: 1 }, message });

                yield put({ type: "companyEarnIntergral", currentIntergralType: CurrentIntergralTypeEnum.company, message });

                yield put({ type: "companySpendIntergral", currentIntergralType: CurrentIntergralTypeEnum.company, message });

                yield put({ type: "personEarnIntergral", currentIntergralType: CurrentIntergralTypeEnum.person, message });

                yield put({ type: "personSpendIntergral", currentIntergralType: CurrentIntergralTypeEnum.person, message });
                yield put({ type: "getByUser", message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *isSign({ message }, { call, put, select }) {
            // 判断是否已签到
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });
                const memberState = yield select((state) => state[Namespaces.member]),
                    userLoyalty = memberState.userLoyalty;
                const result = yield call(memberSignHttpService.signInfo, userLoyalty.personalSetID);

                yield put({
                    type: "input",
                    data: {
                        isSign: result.isSign,
                        continuitySignDay: result.continueSignDay,
                        todayIntegral: result.todayIntegral,
                        tomorrowIntegral: result.tomorrowIntegral,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getLoyal({ message }, { select, call, put }) {
            // 获取总积分
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });
                const memberState = yield select((state) => state[Namespaces.member]),
                    intergralState = yield select((state) => state[Namespaces.intergral]),
                    userLoyalty = memberState.userLoyalty,
                    currentIntergralType = intergralState.currentIntergralType;
                if (userLoyalty) {
                    let totalJiFen = 0;
                    const loyalID = currentIntergralType === CurrentIntergralTypeEnum.company ? userLoyalty.companySetID : userLoyalty.personalSetID;
                    if (loyalID) {
                        let loyalty = yield call(integralintegralHttpService.get, loyalID);
                        totalJiFen = loyalty ? loyalty.availableIntegral : 0;
                    }
                    yield put({ type: "input", data: { totalJiFen: totalJiFen } });

                    if (currentIntergralType === CurrentIntergralTypeEnum.person) yield put({ type: "input", data: { userIntergral: totalJiFen } });
                } else {
                    yield put({ type: "input", data: { totalJiFen: 0, userIntergral: 0 } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCertifyMember({ message }, { select, put }) {
            try {
                // 获取用户信息
                yield yield put({ type: `${Namespaces.member}/getCurrentMemberInfo`, message });

                const memberState = yield select((state) => state[Namespaces.member]),
                    member = memberState.member;
                const status = getCertifyStatusEnum(member);
                const certifyName = getCertifyCompanyName(member);

                yield put({
                    type: "input",
                    data: {
                        member: member,
                        isCertify: status,
                        certifyName: certifyName ? certifyName : "",
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getIntegralSign({ message }, { call, put, select }) {
            // 签到
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });
                const memberState = yield select((state) => state[Namespaces.member]),
                    userLoyalty = memberState.userLoyalty;
                yield call(memberSignHttpService.sign, userLoyalty.personalSetID);

                yield put({ type: "initTab" });
                yield put({ type: "isSign" });
                yield put({ type: "getEventStatisticEarnExpend", data: { currentIntergralType: 0 } });
                yield put({ type: "getLoyal", currentIntergralType: 0 });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *refreshDatas({ currentIntergralType, message }, { put }) {
            // 企业和个人切换时刷新数据
            try {
                yield put({ type: "getLoyal", currentIntergralType: currentIntergralType, message });
                yield put({ type: "isSign", currentIntergralType: currentIntergralType, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getEventStatisticEarnExpend({ message }, { select, call, put }) {
            // 积分统计 收入 支出
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });

                const memberState = yield select((state) => state[Namespaces.member]),
                    intergralState = yield select((state) => state[Namespaces.intergral]),
                    userLoyalty = memberState.userLoyalty,
                    currentIntergralType = intergralState!.currentIntergralType;

                const loyalID = currentIntergralType === CurrentIntergralTypeEnum.company ? userLoyalty.companySetID : userLoyalty.personalSetID,
                    result = yield call(integralintegralHttpService.intergralChart, { setId: loyalID });
                let statisticEarn = {} as any,
                    statisticExpend = {} as any;

                if (result) {
                    result &&
                        result.map((item) => {
                            if (item.prefix === "+") {
                                statisticEarn = item;
                            }
                            if (item.prefix === "-") {
                                statisticExpend = item;
                            }
                        });
                    yield put({
                        type: "input",
                        data: {
                            eventStatistic: statisticEarn.categoryMonthIntegralList,
                            eventStatisticSum: statisticEarn.totalRewardPoint,
                            eventStatisticExpend: statisticExpend.categoryMonthIntegralList,
                            eventStatisticSumExpend: statisticExpend.totalRewardPoint,
                        },
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *companyEarnIntergral({ currentIntergralType, message }, { select, call, put }) {
            // 企业挣积分列表
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });

                const memberState = yield select((state) => state[Namespaces.member]),
                    userLoyalty = memberState.userLoyalty;

                const result = yield call(integralEventHttpService.integralEvent, {
                    setId: currentIntergralType === CurrentIntergralTypeEnum.company ? userLoyalty.companySetID : userLoyalty.personalSetID,
                    prefix: "positive",
                    eventType: 2, // 企业
                });

                if (result) {
                    yield put({ type: "input", data: { companyEarn: result } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *companySpendIntergral({ currentIntergralType, message }, { select, call, put }) {
            // 企业挣积分列表
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });

                const memberState = yield select((state) => state[Namespaces.member]),
                    userLoyalty = memberState.userLoyalty;

                const result = yield call(integralEventHttpService.integralEvent, {
                    setId: currentIntergralType === CurrentIntergralTypeEnum.company ? userLoyalty.companySetID : userLoyalty.personalSetID,
                    prefix: "negative",
                    eventType: 2, // 企业
                });
                if (result) {
                    yield put({ type: "input", data: { companySpend: result } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *personEarnIntergral({ currentIntergralType, message }, { select, call, put }) {
            // 个人挣积分列表
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });

                const memberState = yield select((state) => state[Namespaces.member]),
                    userLoyalty = memberState.userLoyalty;

                const result = yield call(integralEventHttpService.integralEvent, {
                    setId: currentIntergralType === CurrentIntergralTypeEnum.company ? userLoyalty.companySetID : userLoyalty.personalSetID,
                    prefix: "positive",
                    eventType: 1, // 个人
                });

                if (result) {
                    yield put({ type: "input", data: { personEarn: result } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *personSpendIntergral({ message, currentIntergralType }, { select, call, put }) {
            // 个人花积分列表
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });

                const memberState = yield select((state) => state[Namespaces.member]),
                    userLoyalty = memberState.userLoyalty;

                const result = yield call(integralEventHttpService.integralEvent, {
                    setId: currentIntergralType === CurrentIntergralTypeEnum.company ? userLoyalty.companySetID : userLoyalty.personalSetID,
                    prefix: "negative",
                    eventType: 1, // 个人
                });

                if (result) {
                    yield put({ type: "input", data: { personSpend: result } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getOperatesAction({ message, data }, { select, call, put }) {
            // 获取积分获取和花费列表
            try {
                yield yield put({ type: `${Namespaces.member}/getUserLoyalty`, message });

                const memberState = yield select((state) => state[Namespaces.member]),
                    intergralState = yield select((state) => state[Namespaces.intergral]),
                    userLoyalty = memberState.userLoyalty,
                    currentIntergralType = intergralState!.currentIntergralType;

                const thisChangeId = ++changeCounters.articleChangeCounter;
                const action = yield call(
                    integralOperateHttpService.getPaged,
                    Object.assign(
                        {
                            pageSize: 15,
                            setId: currentIntergralType === CurrentIntergralTypeEnum.company ? userLoyalty.companySetID : userLoyalty.personalSetID,
                        },
                        data
                    )
                );
                // console.log('action', action);

                if (action) {
                    if (changeCounters.articleChangeCounter !== thisChangeId) return state;

                    const page = action;

                    if (page.currentPage <= 1) {
                        changeCounters.articles = page.items;
                    } else {
                        changeCounters.articles = deepClone(changeCounters.articles);
                        page.items &&
                            page.items.map((item) => {
                                let nohas = true;
                                changeCounters.articles = changeCounters.articles.map((itm: any) => {
                                    if (itm.year === item.year && itm.month === item.month) {
                                        nohas = false;
                                        let tempitem = itm;
                                        tempitem.operateList = itm.operateList.concat(item.operateList);
                                        return tempitem;
                                    }
                                    return itm;
                                });
                                if (nohas) {
                                    changeCounters.articles.push(item);
                                }
                            });
                    }
                    multisort(
                        changeCounters.articles,
                        (a, b) => b.year - a.year,
                        (a, b) => b.month - a.month
                    );
                    yield put({
                        type: "input",
                        data: {
                            data: changeCounters.articles,
                            listData: changeCounters.articles,
                            isLoading: false,
                            refreshing: false,
                            pageIndex: page.currentPage,
                            thisChangeId: action.thisChangeId,
                            hasMore: !(page && page.currentPage >= page.totalPages),
                        },
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *loyalGetConfig({ message }, { call, put }) {
            // 企业挣积分列表
            try {
                const result = yield call(integralConfigHttpService.getConfig);
                if (result) {
                    yield put({ type: "input", data: { intergralConfigure: result } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getByUser({ params, message }, { call, select, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]);

                if (user?.currentUser?.id) {
                    const catalogue = yield call(parkCateService.getCateByCode, "ruzsq"),
                        data = yield call(workOrderService.getByUser, {
                            ...params,
                            catalogueId: catalogue && catalogue.id,
                            inputerId: user.currentUser.id,
                            parkId: getLocalStorage("parkId"),
                            showHidCatalogs: true,
                        });

                    const checkDetailData = data.items;

                    const checkDetailDataItem = checkDetailData?.length > 0 ? checkDetailData[0].order : {};

                    // 入驻申请状态
                    const checkStatus = checkDetailDataItem.status;
                    // 入驻申请工单id
                    const checkOrderId = checkDetailDataItem.id;
                    // 入驻申请状态机stateid
                    const topicStatus = checkDetailDataItem.topicStatus;

                    yield put({
                        type: "update",
                        data: {
                            rzsqOrder: {
                                checkStatus,
                                checkOrderId,
                                topicStatus,
                            },
                        },
                    });

                    yield put({ type: "hideLoading" });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        /**
         * 触发积分事件
         * @param { parkId = getLocalStorage("parkId") }
         * @param { select, put, call }
         */
        *operateMemberIntegral({ data, eventCode, callback, error }, { select, put, call }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser` });
                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = user.currentUser;

                const events = yield call(integralEventHttpService.getList, { code: eventCode });

                if (events?.length > 0) {
                    yield call(integralintegralHttpService.operateMemberIntegral, { ...data, accountId: currentUser?.id, eventCode, times: events[0].times });
                }

                if (callback) {
                    yield call(callback);
                }
            } catch (e) {
                yield call(error, e.errmsg);
            }
        },
        /**
         * 解除触发积分事件
         * @param { parkId = getLocalStorage("parkId") }
         * @param { select, put, call }
         */
         *refundMemberIntegral({ data, eventCode, callback, error }, { select, put, call }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser` });
                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = user.currentUser;

                const events = yield call(integralEventHttpService.getList, { code: eventCode });

                if (events?.length > 0) {
                    yield call(integralintegralHttpService.refundMemberIntegral, { ...data, accountId: currentUser?.id, eventCode, times: events[0].times });
                }

                if (callback) {
                    yield call(callback);
                }
            } catch (e) {
                yield call(error, e.errmsg);
            }
        },
    };
}

app.model(intergralModel);
