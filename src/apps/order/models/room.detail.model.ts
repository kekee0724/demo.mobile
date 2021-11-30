import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, formatDate, getLocalStorage, getDate } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { resourceService, myOrderService } from "@reco-m/order-service";

import { newCouponHttpService } from "@reco-m/coupon-service";

import {IParkBindTableNameEnum, ResourceTypeEnum} from "@reco-m/ipark-common"
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Namespaces, OrderStatusEnum, MaxDayBookingTypeEnum } from "./common";

export namespace roomdetailModel {

  export const namespace = Namespaces.roomdetail;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message, callback }, { put }) {
      put({ type: "showLoading" });
      try {
        if (Number(data.resourceType) === ResourceTypeEnum.meeting || Number(data.resourceType) === ResourceTypeEnum.square) {
          yield put({
            type: `getResourceRoomDetailAction`,
            data: data.detailid,
            params: {
              startDay: data.startDay,
              resourceType: data.resourceType,
            },
            callback,
            message
          });
        }
        if (Number(data.resourceType) === ResourceTypeEnum.meeting) {
          yield put({
            type: `couponGetPage`,
            data: {
              status: 1,
              sceneValueList: ["meetingRoom", "all"],
              pageSize: 3,
              parkId: getLocalStorage("parkId"),
            }, message
          });
        } else if (Number(data.resourceType) === ResourceTypeEnum.square) {
          yield put({
            type: `couponGetPage`,
            data: {
              status: 1,
              couponCode: "yard",
              pageSize: 3,
              parkId: getLocalStorage("parkId"),
            }, message
          });
        }
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      }
    },

    *getResourceRoomDetailAction({ message, data, params, callback }, { call, put, select }) {
      try {

        yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
        const memberState: any = yield select((state) => state[memberNamespaces.member]),
            currentMember = memberState.member;

        const project = yield call(resourceService.getResourceDetail, data);
        if (!project) {
          location.href = `${location.href.split("?")[0]}/deleteData`
          return
      }
        let minpriceData: any = {}, maxpriceData: any = {}, roomPrice: any = {};
        if (project && project.price && project.price.length > 0) {
          roomPrice = project.price[0]
          minpriceData = project.price[0],
          maxpriceData = project.price[0];
          project.price.forEach(item => {
            if (roomPrice.price === 0) {
              roomPrice = item
            } else if (item.price < roomPrice.price && item.price !== 0) {
              roomPrice = item
            }
            if (item.price < minpriceData.price) {
              minpriceData = item
            }
            if (item.price > minpriceData.price) {
              maxpriceData = item
            }
          })
          project.price.forEach(p => (p.startTimeT = getDate('1998-01-01 ' + p.startTime), p.endTimeT = getDate('1998-01-01 ' + p.endTime)));
          project.price.sort((a, b) => a.startTimeT.getTime() - b.startTimeT.getTime())
        }

        yield put({ type: "input", data: { roomdetail: project, roomPrice: roomPrice, currentMember, minpriceData,  maxpriceData} });
        yield put({
          type: "getResourceStatusAction",
          params: {
            startDate: params.startDay + "T00:00:00",
            endDate: params.startDay + "T23:59:59",
            resourceType: params.resourceType,
            roomId: project && project.resource && [project.resource.roomId]
          },
          maxDayBookingType: project.config.maxDayBookingType,
          detailid: data,
          callback
        })
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *couponGetPage({ message, data }, { call, put }) {
      try {
        const reslut = yield call(newCouponHttpService.getMyCoupon, data);
        yield put({ type: "input", data: { couponData: reslut } });
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      }
    },

    *getResourceStatusAction({ message, params, callback, detailid, maxDayBookingType }, { call, put, select }) {
      try {
        const reslut = yield call(resourceService.getResourceStatus, params);


        yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
        const memberState: any = yield select((state) => state[memberNamespaces.member]),
            currentMember = memberState.member;


        let datas = {
          bindTableId: detailid,
          bindTableName: IParkBindTableNameEnum.resource,
          startDate: params.startDate,
          endDate: params.endDate,
          orderStatus: [OrderStatusEnum.unpaid, OrderStatusEnum.check, OrderStatusEnum.unapproval, OrderStatusEnum.refund]
        } as any;

        if (maxDayBookingType === MaxDayBookingTypeEnum.person) {

          datas.inputerId = currentMember.accountId;
        } else if (maxDayBookingType === MaxDayBookingTypeEnum.company) {
          datas.customerId = currentMember.companyId;
        }

        const todayRemainingTime = yield call(myOrderService.todayRemainingTime, datas);
        
        let resultArr = reslut.items.length > 0 ? reslut.items[0] : [];

        
        let startDate = formatDate(params.startDate, "yyyy-MM-dd") + "T23:30:00";
        let endDate = formatDate(params.startDate, "yyyy-MM-dd") + "T23:59:59";

        resultArr.items && resultArr.items.push({
          endTime: endDate,
          itemCode: formatDate(params.startDate, "yyyy-MM-dd") + " 23:59:00",
          startTime: startDate,
          status: 0,
          time: formatDate(params.startDate, "yyyy-MM-dd")
        })
        yield put({
          type: "update",
          data: {
            resourceStatus: resultArr,
            todayRemainingTime: todayRemainingTime,
            maxDayBookingType
          },
        });
        if (callback) {
          yield call(callback, resultArr)
        }
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`);
      }
    },
  };

}

app.model(roomdetailModel);
