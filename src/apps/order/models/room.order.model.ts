import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, formatDateTime, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { resourceService, myOrderService } from "@reco-m/order-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { integralConfigHttpService, integralintegralHttpService } from "@reco-m/member-service";
import { Namespaces as memberNamespaces, MemberTypeEnum } from "@reco-m/member-models";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { Namespaces as invoiceNamespace } from "@reco-m/invoice-models";

import { Namespaces } from "./common";

export namespace roomorderModel {
    export const namespace = Namespaces.roomorder;

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
        *initPage({ data, message }, { put, select }) {
            put({ type: "showLoading" });
            const invoiceTitleEdit: any = yield select((state) => state[invoiceNamespace.invoiceTitleEdit]);

            try {
                yield put({
                    type: `input`,
                    data: {
                        totalPrice: 0,
                        totalHour: 0,
                        startTime: null,
                        endTime: null,
                        resourceOrder: null,
                        message: null,
                        isAdd: false,
                        invoice: null,
                        selectDucType: 0,
                        invoiceTitleEdit,
                    },
                    message,
                });
                yield put({ type: `getResourceRoomDetailAction`, id: data.detailid, props: data.props, message });
                yield put({ type: `getResourceConfig`, id: data.detailid, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *initPageDetail({ message, data }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `input`, data: data.initparam });
                yield put({ type: `getResourceRoomDetailAction`, id: data.detailid, props: data.props, message });
                yield put({ type: `getResourceConfig`, id: data.detailid, message });
                yield put({ type: `loyalGetConfig`, message });
                yield put({ type: `getUserLoyal`, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getResourceRoomDetailAction({ message, id }, { call, put, select }) {
            try {
                const reslut = yield call(resourceService.getResourceDetail, id);
                let open, close;
                reslut &&
                    reslut.price &&
                    reslut.price.forEach((item, i) => {
                        if (i === 0) {
                            open = item.startTime;
                            close = item.endTime;
                        } else {
                            if (open > item.startTime) {
                                open = item.startTime;
                            }
                            if (close < item.endTime) {
                                close = item.endTime;
                            }
                        }
                    });
                let openTime = open ? open : null;
                let closeTime = close ? close : null;

                // if (openTime) {
                // }

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    currentMember = memberState.member;
                yield put({
                    type: "update",
                    data: {
                        currentUser,
                        currentMember: currentMember,
                        openTime: openTime,
                        closeTime: closeTime,
                        roomdetail: reslut,
                        showloading: false,
                        name: currentUser.name,
                        detail: reslut.Resource ? reslut.Resource : {},
                        company: currentMember.companyName,
                        companyId:  currentMember.companyId,
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
        *getResourceConfig({ message, id }, { call, put }) {
            try {
                const reslut = yield call(resourceService.getResourceConfig, id);
                yield put({
                    type: "input",
                    data: {
                        resourceConfigure: reslut
                    },
                });
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
                    let totalJiFen = 0, totalJiFen2 = 0;

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
        *roomSubmitAction({ message, state, id, successcallback }, { call, put }) {

            try {
                let name = state!.name;
                let mobile = state!.mobile;
                let company = state!.company;
                let companyId = state!.companyId;
                let startTime = state!.startTime;
                let roomdetail = state!.roomdetail;
                let endTime = state!.endTime;
                let selectDucType = state!.selectDucType;

                let invoice = state!.invoice;
                let email = state!.email;
                let orderRemark = state!.orderRemark;
                let DeductionIntegral = state!.DeductionIntegral;
                let check = state!.check;
                let couponSelect = state!.couponSelect;


                let OrderItem: any = [];
                roomdetail.service &&
                    roomdetail.service.forEach((item) => {
                        if (item) {
                            let itm = {
                                skuId: item.id,
                                skuName: item.serviceName,
                                skuType: 3,
                                quantity: 1,
                                price: item.price,
                                priceUnitName: item.priceUnitName,
                            };
                            OrderItem.push(itm);
                        }
                    });
                let params;
                if (invoice) {
                    invoice = { ...invoice };
                    delete invoice.id;
                    invoice.bindTableName = IParkBindTableNameEnum.order;
                }
                if (selectDucType !== 0) {
                    params = {
                        resourceId: id,
                        contactPerson: name,
                        contactMobile: mobile && mobile.replace(" ", ""),
                        contactEmail: email,
                        customerName: company,
                        remarks: orderRemark,
                        serviceStartDate: formatDateTime(startTime, "yyyy-MM-ddThh:mm:ss"),
                        serviceEndDate: formatDateTime(endTime, "yyyy-MM-ddThh:mm:ss"),
                        isCashPay: check,
                        invoice: invoice || null,
                        integralType: selectDucType,
                        integralUsed: DeductionIntegral,
                        couponUsed: couponSelect && couponSelect.couponIDs,
                        // orderItem: OrderItem,
                        parkId: getLocalStorage("parkId"),
                        customerId: companyId
                    };
                } else {
                    params = {
                        resourceId: id,
                        contactPerson: name,
                        contactMobile: mobile && mobile.replace(" ", ""),
                        contactEmail: email,
                        customerName: company,
                        remarks: orderRemark,
                        serviceStartDate: formatDateTime(startTime, "yyyy-MM-ddThh:mm:ss"),
                        serviceEndDate: formatDateTime(endTime, "yyyy-MM-ddThh:mm:ss"),
                        isCashPay: check,
                        invoice: invoice || null,
                        couponUsed: couponSelect && couponSelect.couponIDs,
                        // orderItem: OrderItem,
                        parkId: getLocalStorage("parkId"),
                        customerId: companyId
                    };
                }

                const result = yield call(myOrderService.post, params);
                yield put({ type: "input", data: { orderResult: result } });
                successcallback(result);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        // *apppay({ message, paytype, payway, order, weakthis }, { call, select }) {
        //     try {
        //         const state = yield select((state) => state[Namespaces.roomorder]);
        //         let OrderItem: any = [],
        //             meetingItems = order.meetingItems,
        //             loyaltyDeu = order.loyaltyDeu,
        //             // roomdetail = state!.roomdetail || {},
        //             // devices = roomdetail.service || [],
        //             selectDucType = state!.selectDucType,
        //             couponSelect = state!.couponSelect || [],
        //             startDate = state!.startDate;

        //         const meetingItemsWithPrice = (meetingItems?.length && meetingItems.filter((x) => x.price)) || [];

        //         if (meetingItemsWithPrice?.length) {
        //             meetingItemsWithPrice.forEach((item) => {
        //                 let itm = {
        //                     content: `${startDate && formatDateTime(startDate, "yyyy-MM-dd")} ${item.start}-${item.end}`,
        //                     pcs: item.pcs,
        //                     unitPrice: item.price,
        //                     unit: item.unitText,
        //                 };
        //                 OrderItem.push(itm);
        //             });
        //         }

        //         // devices.forEach((item) => {
        //         //     if (item.selecCount && item.selecCount > 0 && item.price > 0) {
        //         //         let itm = {
        //         //             content: item.serviceName,
        //         //             pcs: item.selecCount,
        //         //             unitPrice: item.price,
        //         //             unit: item.priceUnitName,
        //         //         };
        //         //         OrderItem.push(itm);
        //         //     }
        //         // });

        //         const deductionItems = getDeductionItems(couponSelect, selectDucType, loyaltyDeu);

        //         OrderItem = OrderItem.concat(deductionItems);

        //         let params = {
        //             id: order.id,
        //             bindTableId: `${order.id}`,
        //             bindTableName: IParkBindTableNameEnum.order,
        //             totalAmount: order.totalAmount,
        //             paymentType: PaymentTypeEnum.app,
        //             subject: order.subject,
        //             orderNo: order.orderNo,
        //             orderType: getOrderType(order.orderSubType),
        //             items: OrderItem,
        //         };
        //         let result;

        //         if (payway === PayWayEnum.alipay) {
        //             try {
        //                 result = yield call(aliPay, params, payway);
        //                 // yield call(cashAliPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
        //                 weakthis.goTo(`resourcePaySucceed/${result.id}?bindTableId=${result.id}&payWay=${result.payWay}`);
        //             } catch (e) {
        //                 if (e && e.id) {
        //                     weakthis.goTo(`resourcePayErr/${e.id}/err`);
        //                 } else if (e.errmsg) {
        //                     message?.error(e.errmsg);
        //                 }
        //             }
        //         } else if (payway === PayWayEnum.wechat) {
        //             try {
        //                 result = yield call(wechatPay, params, paytype, payway);
        //                 // yield call(wechatPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
        //                 weakthis.goTo(`resourcePaySucceed/${result.id}?bindTableId=${result.id}&payWay=${result.payWay}`);
        //             } catch (e) {
        //                 if (e && e.id) {
        //                     weakthis.goTo(`resourcePayErr/${e.id}/err`);
        //                 } else if (e.errmsg) {
        //                     message!.error(`resourcePayErr=${e?.errmsg || e}`)
        //                 }
        //             }
        //         }
        //     } catch (e) {
        //         console.log('catcherror', e?.errmsg||e);
        //         message!.error(`apppay=${e?.errmsg || e}`)
        //     }
        // },
    };
}

app.model(roomorderModel);
