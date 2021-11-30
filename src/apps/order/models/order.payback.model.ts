import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { aliPay, wechatPay, PayWayEnum, PaymentTypeEnum, IParkBindTableNameEnum } from "@reco-m/ipark-common"

import { myOrderService } from "@reco-m/order-service";

import { Namespaces, getOrderType } from "./common";

export namespace orderPaybackModel {

  export const namespace = Namespaces.orderPayback;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state;
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getOrderDetailAction`, id: data.id, message });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getOrderDetailAction({ message, id }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const result = yield call(myOrderService.get, id);
        yield put({ type: "input", data: { order: result } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`getOrderDetailAction=${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *apppay({ paytype, payway, order, paysuccess, payerr, message }, { call }) {
      try {
        let params = {
          id: order.id,
          bindTableId: `${order.id}`,
          bindTableName: IParkBindTableNameEnum.order,
          totalAmount: order.totalAmount,
          paymentType: PaymentTypeEnum.app,
          subject: order.subject,
          orderNo: order.orderNo,
          orderType: getOrderType(order.orderSubType)
        };
        let result;
        if (payway === PayWayEnum.alipay) {
          try {
            result = yield call(aliPay, params, payway);
            // yield call(cashAliPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
            paysuccess && paysuccess(`resourcePaySucceed/${result.id}?bindTableId=${result.id}&payWay=${result.payWay}`);
          } catch (e) {
            if (e && e.id && payerr) {
              payerr(`resourcePayErr/${e.id}/err`);
            } else if (e.errmsg) {
              message?.error(e.errmsg);
            }
          }
        } else if (payway === PayWayEnum.wechat) {
          try {
            result = yield call(wechatPay, params, paytype, payway);
            // yield call(wechatPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
            paysuccess && paysuccess(`resourcePaySucceed/${result.id}?bindTableId=${result.id}&payWay=${result.payWay}`);
          } catch (e) {
            if (e && e.id && payerr) {
              payerr(`resourcePayErr/${e.id}/err`);
            } else if (e.errmsg) {
              message?.error(e.errmsg);
            }
          }
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    }
  };

}

app.model(orderPaybackModel);
