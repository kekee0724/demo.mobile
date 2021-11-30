import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { rateRateHttpService } from "@reco-m/comment-service";

import { cashPayService, cashInvoiceService } from "@reco-m/invoice-service";

import { myOrderService } from "@reco-m/order-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { aliPay, wechatPay, PayWayEnum, PaymentTypeEnum, IParkBindTableNameEnum, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { Namespaces, getOrderType } from "./common";

export namespace myorderdetailModel {
    export const namespace = Namespaces.myorderdetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getOrderDetailAction`, id: data.id, message });
                yield put({ type: `getOrderLogAction`, id: data.id, message });
                yield put({ type: `getCommentsAction`, id: data.id, message });
                yield put({ type: `getPayMessageAction`, id: data.id, message });
                yield put({ type: `getInvoiceMessageAction`, id: data.id, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getOrderDetailAction({ message, id }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(myOrderService.get, id);

                // console.log('result', result);
                yield put({ type: "input", data: { order: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getOrderLogAction({ message, id }, { call, put }) {
            try {
                const result = yield call(myOrderService.getOrderLog, id);
                // console.log('getOrderLogAction', result);
                yield put({ type: "input", data: { logs: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCommentsAction({ message, id }, { call, put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                let params = { /* bindTableName: IParkBindTableNameEnum.order, bindTableId: id, */ bindTableIdList: [id], inputerId: currentUser.id, auditStatus: CommentAuditStatusEnum.pass, isShowWaitAudit: true };
                const result = yield call(rateRateHttpService.getPaged, params);
                yield put({ type: "input", data: { comments: result.items } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getPayMessageAction({ message, id }, { call, put }) {
            try {
                let params = {
                    bindTableName: IParkBindTableNameEnum.order,
                    bindTableId: id,
                };
                const result = yield call(cashPayService.getPayMessage.bind(cashPayService, params));
                yield put({ type: "input", data: { paymessage: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *orderOperateAction({ message, params, callBack }, { call }) {
            try {
                const result = yield call(myOrderService.cancelOrder, params.id);
                if (result) {
                    callBack("取消订单成功");
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getInvoiceMessageAction({ message, id }, { call, put }) {
            try {
                let params = { bindTableName: IParkBindTableNameEnum.order, bindTableId: id, pageSize: 1 };
                const result = yield call(cashInvoiceService.getPaged, params);
                if (result && result.items && result.items.length) {
                    yield put({ type: "input", data: { invoiceMessage: result.items[0] } });
                } else {
                    yield put({ type: "input", data: { invoiceMessage: null } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *apppay({ message, paytype, payway, order, weakthis }, { call }) {
            try {
                let params = {
                    id: order.id,
                    bindTableId: `${order.id}`,
                    bindTableName: IParkBindTableNameEnum.order,
                    totalAmount: order.totalAmount,
                    paymentType: PaymentTypeEnum.app,
                    subject: order.subject,
                    orderNo: order.orderNo,
                    orderType: getOrderType(order.orderSubType),
                };
                let result;

                if (payway === PayWayEnum.alipay) {
                    try {
                        result = yield call(aliPay, params, payway);
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
        *cancelOrder({ message, params, callBack }, { call }) {
            try {
                const result = yield call(myOrderService.cancelOrder, params.id);
                if (result) {
                    callBack();
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(myorderdetailModel);
