import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, formatDateTimeSend, formatDate, formatDateTime, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { integralConfigHttpService, integralintegralHttpService } from "@reco-m/member-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { resourceService, myOrderService } from "@reco-m/order-service";

import { Namespaces as memberNamespaces, MemberTypeEnum } from "@reco-m/member-models";

import { aliPay, wechatPay, PayWayEnum, PaymentTypeEnum, IParkBindTableNameEnum } from "@reco-m/ipark-common";
import { ResourceTypeEnum } from "@reco-m/ipark-common";
import { Namespaces, getOrderType, getDeductionItems, PriceUnitNameEnum } from "./common";

export namespace positionorderModel {
    export const namespace = Namespaces.positionorder;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            selectDucType: 0,
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getResourceDetailAction`, id: data.detailid, params: data.params, message });
                yield put({ type: `getResourceStatusAction`, resourcedeta: data.params, message });
                yield put({ type: `loyalGetConfig`, data: {}, message });
                yield put({ type: `getUserLoyal`, message });
                yield put({ type: `getResourceConfig`, id: data.detailid, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *clearErrorToast({ message }, { put }) {
            try {
                yield put({ type: "input" });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getResourceDetailAction({ message, id }, { call, put, select }) {
            try {
                const reslut = yield call(resourceService.getResourceDetail, id);

                if (!reslut) {
                    location.href = `${location.href.split("?")[0]}/deleteData`
                    return
                }

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    currentMember = memberState.member;

                yield put({
                    type: "input",
                    data: {
                        detail: reslut.resource,
                        resouceDetail: reslut,
                        currentUser,
                        currentMember: currentMember,
                        name: currentUser.name,
                        company: currentMember.companyName,
                        companyId: currentMember.companyId,
                        mobile: currentUser.mobile,
                        email: currentUser.email,
                        isManager: currentMember.companyUserTypeName === MemberTypeEnum.admin,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getResourceStatusAction({ message, resourcedeta }, { call, put }) {
            try {
                const reslut = yield call(resourceService.getResourceStatus, resourcedeta);
                // console.log('reslut', reslut);
                let list = reslut.items[0];
                if (list && list.items) {
                    list = list.items.filter((item) => {
                        return item.status === 0;
                    });
                }
                yield put({ type: "input", data: { resourceStatus: list } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *loyalGetConfig({ message }, { call, put }) {
            try {
                const result = yield call(integralConfigHttpService.getConfig);
                if (result) {
                    yield put({ type: "input", data: { IntegralWorth: result.integralWorth } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getUserLoyal({ message }, { call, put, select }) {
            try {
                yield yield put({ type: `${memberNamespaces.member}/getUserLoyalty`, message });

                const memberState = yield select((state) => state[memberNamespaces.member]),
                    userLoyalty = memberState.userLoyalty;
                if (userLoyalty) {
                    let totalJiFen = 0,
                        totalJiFen2 = 0;

                    if (userLoyalty.personalSetID) {
                        const loyalID = userLoyalty.personalSetID,
                            loyalty = yield call(integralintegralHttpService.get, loyalID);
                        totalJiFen = loyalty ? loyalty.availableIntegral : 0;
                    }
                    if (userLoyalty.companySetID) {
                        const loyalID2 = userLoyalty.companySetID,
                            loyalty2 = yield call(integralintegralHttpService.get, loyalID2);
                        totalJiFen2 = loyalty2 ? loyalty2.availableIntegral : 0;
                    }

                    let availableIntegral = {
                        companyAvailableIntegral: totalJiFen2,
                        personalAvailableIntegral: totalJiFen,
                    };
                    // console.log('availableIntegral', availableIntegral);
                    yield put({ type: "input", data: { userIntergral: availableIntegral } });
                } else {
                    yield put({ type: "input", data: { totalJiFen: 0, userIntergral: 0 } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getResourceConfig({ message, id }, { call, put }) {
            try {
                const reslut = yield call(resourceService.getResourceConfig, id);
                yield put({
                    type: "input",
                    data: {
                        resourceConfigure: reslut,
                        // /IntegralWorth: reslut.integralDeductRatio
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *positionSubmitAction({ message, id, callback, resourcetype }, { call, select }) {
            try {
                const state = yield select((state) => state[Namespaces.positionorder]);
                let resourceStatus = state!.resourceStatus;

                let num = state.num;
                let detail = state.detail;
                let name = state!.name;
                let mobile = state!.mobile;
                let company = state!.company;
                let selectDucType = state!.selectDucType;
                let startDate = state!.startDate;
                let endDate = state!.endDate;
                let invoice = state!.invoice;
                let email = state!.email;
                let orderRemark = state!.orderRemark;
                let DeductionIntegral = state!.DeductionIntegral;
                let check = state!.check;
                let couponSelect = state!.couponSelect;
                let companyId = state!.companyId;

                if (invoice) {
                    invoice = { ...invoice };
                    delete invoice.id;
                }

                // console.log("positionSubmitAction0", resourceStatus);
                let end = new Date(endDate);
                let params;
                let OrderItem: any = [];
                // 广告位只有一个
                if (Number(resourcetype) === ResourceTypeEnum.working) {
                    resourceStatus &&
                        resourceStatus.forEach((item, index) => {
                            if (index < num) {
                                let itm = {
                                    skuId: item.itemId,
                                    skuName: item.itemCode,
                                    skuType: 1,
                                    quantity: 1,
                                    price: detail.price,
                                    priceUnitName: detail.priceUnitName,
                                };
                                OrderItem.push(itm);
                            }
                        });
                } else {
                    OrderItem = undefined;
                }
                if (selectDucType !== 0) {
                    // console.log("positionSubmitAction1");
                    params = {
                        resourceId: id,
                        contactPerson: name,
                        contactMobile: mobile && mobile.replace(" ", ""),
                        contactEmail: email,
                        customerName: company,
                        remarks: orderRemark,
                        serviceStartDate: formatDateTimeSend(startDate.split(" ")[0] + " 00:00:00"),
                        serviceEndDate: formatDateTimeSend(formatDate(end, "yyyy/MM/dd") + " 23:59:00"),
                        isCashPay: check,
                        invoice: invoice || null,
                        integralType: selectDucType,
                        integralUsed: DeductionIntegral,
                        couponUsed: couponSelect ? couponSelect.couponIDs : undefined,
                        orderItem: OrderItem,
                        parkId: getLocalStorage("parkId"),
                        customerId: companyId,
                    };
                } else {
                    // console.log("positionSubmitAction2");
                    params = {
                        resourceId: id,
                        contactPerson: name,
                        contactMobile: mobile && mobile.replace(" ", ""),
                        contactEmail: email,
                        customerName: company,
                        remarks: orderRemark,
                        serviceStartDate: formatDateTimeSend(startDate.split(" ")[0] + " 00:00:00"),
                        serviceEndDate: formatDateTimeSend(formatDate(end, "yyyy/MM/dd") + " 23:59:00"),
                        isCashPay: check,
                        invoice: invoice || undefined,
                        couponUsed: couponSelect ? couponSelect.couponIDs : undefined,
                        orderItem: OrderItem,
                        parkId: getLocalStorage("parkId"),
                        customerId: companyId,
                    };
                }
                const parm = yield call(myOrderService.post, params);
                callback(parm);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *apppay({ message, paytype, payway, order, weakthis }, { call, select }) {
            try {
                const state = yield select((state) => state[Namespaces.positionorder]);
                let OrderItem: any = [],
                    loyaltyDeu = order.loyaltyDeu,
                    selectDucType = state!.selectDucType,
                    couponSelect = state!.couponSelect || [];
                if (order) {
                    let itm = {
                        content: `${formatDateTime(order.serviceStartDate, "yyyy-MM-dd")}-${formatDateTime(order.serviceEndDate, "yyyy-MM-dd")}`,
                        pcs: order.quantity,
                        unitPrice: order.price,
                        unit: PriceUnitNameEnum[order.priceUnit],
                    };
                    OrderItem.push(itm);
                }
                const deductionItems = getDeductionItems(couponSelect, selectDucType, loyaltyDeu);

                OrderItem = OrderItem.concat(deductionItems);

                let params = {
                    id: order.id,
                    bindTableId: `${order.id}`,
                    bindTableName: IParkBindTableNameEnum.order,
                    totalAmount: order.totalAmount,
                    paymentType: PaymentTypeEnum.app,
                    subject: order.subject,
                    orderNo: order.orderNo,
                    orderType: getOrderType(order.orderSubType),
                    items: OrderItem,
                };
                let result;
                if (payway === PayWayEnum.alipay) {
                    try {
                        result = yield call(aliPay, params, paytype, payway);
                        // yield call(cashAliPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
                        weakthis.goTo(`resourcePaySucceed/${result.id}?bindTableId=${result.id}&payWay=${result.payWay}`);
                    } catch (e) {
                        if (e && e.id) {
                            weakthis.goTo(`resourcePayErr/${e.id}/err`);
                        } else if (e.errmsg) {
                            message?.error(e.errmsg);
                        }
                    }
                } else if (payway === PayWayEnum.wechat) {
                    try {
                        result = yield call(wechatPay, params, paytype, payway);
                        // yield call(wechatPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
                        weakthis.goTo(`resourcePaySucceed/${result.id}?bindTableId=${result.id}&payWay=${result.payWay}`);
                    } catch (e) {
                        if (e && e.id) {
                            weakthis.goTo(`resourcePayErr/${e.id}/err`);
                        } else if (e.errmsg) {
                            message?.error(e.errmsg);
                        }
                    }
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(positionorderModel);
