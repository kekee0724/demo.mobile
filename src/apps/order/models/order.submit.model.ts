import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { aliPay, wechatPay, PayWayEnum, PaymentTypeEnum, IParkBindTableNameEnum, TradeStatusEnum } from "@reco-m/ipark-common";

import { Namespaces, getOrderType, SkuTypeEnum, isRoom } from "./common";
import { myOrderService } from "@reco-m/order-service";
import { cashPayService } from "@reco-m/invoice-service";
let time;
export namespace orderSubmitModel {
    export const namespace = Namespaces.ordersubmit;

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
        *clearTime() {
            clearInterval(time);
            time = null;
        },
        *apppay({ message, payway, paytype, order, weakthis }, { call }) {
            try {
                if (!order?.orderItem) {
                    order = yield call(myOrderService.get, order.id);
                }

                let OrderItem: any = [];

                const resourceItems = order?.orderItem?.filter((x) => x.skuType === SkuTypeEnum.goods) || [];
                const loyaltys = order?.orderItem?.filter((x) => x.skuType === SkuTypeEnum.intergral) || [];
                const coupons = order?.orderItem?.filter((x) => x.skuType === SkuTypeEnum.coupon) || [];

                let resourceOrderItem = [];
                let loyaltysItem = [];
                let couponItem = [];

                if (isRoom(order?.orderSubType)) {
                    resourceOrderItem = resourceItems.map((x) => ({ content: x.skuName, pcs: x.quantity, unitPrice: x.price, unit: x.priceUnitName }));
                } else {
                    resourceOrderItem = resourceItems.length && [
                        { content: resourceItems[0].skuName, pcs: resourceItems.length, unitPrice: resourceItems[0].price, unit: resourceItems[0].priceUnitName },
                    ];
                }

                loyaltysItem = loyaltys.map((x) => ({ content: x.skuName, pcs: x.quantity, unitPrice: 0 - x.price, unit: x.priceUnitName }));
                couponItem = coupons.map((x) => ({ content: x.skuName, pcs: 1, unitPrice: 0 - x.totalAmount, unit: "元" }));

                OrderItem = [...resourceOrderItem, ...loyaltysItem, ...couponItem];

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
                        result = yield call(aliPay, params, payway);
                    } catch (e) {
                        if (e.errmsg) {
                            message?.error(e.errmsg);
                        }
                    }
                } else if (payway === PayWayEnum.wechat) {
                    try {
                        result = yield call(wechatPay, params, paytype, payway);
                    } catch (e) {
                        if (e.errmsg) {
                            message!.error(`${e?.errmsg || e}`);
                        }
                    }
                }
                time = setInterval(() => {
                    cashPayService.getCashPay(result.pay.id).then((d) => {
                        if (d.tradeStatus === TradeStatusEnum.success || d.tradeStatus === TradeStatusEnum.finished) {
                            weakthis.goTo(`resourcePaySucceed/${result.id}?bindTableId=${result.id}&payWay=${result.payWay}`);
                        } else if (d.tradeStatus === TradeStatusEnum.closed || d.tradeStatus === TradeStatusEnum.pending) {
                            weakthis.goTo(`resourcePayErr/${result.id}/err`);
                        }
                    });
                }, 3000);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`apppay=${e?.errmsg || e}`);
            }
        },
    };
}

app.model(orderSubmitModel);
