import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { myMarketInHttpService, serviceProductService } from "@reco-m/workorder-service";

import { Namespaces } from "./common";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace marketDetailModel {

  export const namespace = Namespaces.marketDetail;

  export type StateType = typeof state;

  export const state: any = freeze({
    tagShow: false
  }, !0);

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
        yield put({ type: `getMarketDetail`, data: data.id, message });
        yield put({
          type: `getPictures`,
          bindTableId: data.id, message
        });
        yield put({ type: `getProducts`, institutionID: data.id, message });

      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },

    *getMarketDetail({ message, data }, { call, put }) {
      try {
        const marketDetail = yield call(myMarketInHttpService.get, data);

        yield put({ type: "input", data: { detail: marketDetail } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getPictures({ bindTableId, message }, { call, put }) {
      try {
        const pictureData = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.institution, bindTableId: bindTableId, customType: 3 });
        const pictures = yield call(pictureService.getPictureUrls, { bindTableName: IParkBindTableNameEnum.institution, bindTableId: bindTableId, customType: 1 });

        yield put({
          type: "input",
          data: {
            pictureData: pictureData,
            pictures: pictures && pictures.length ? pictures[0] : ""
          }
        });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *getProducts({ institutionID, message }, { call, put }) {
      try {
        const prodcts = yield call(serviceProductService.getPaged, { 
          institutionId: institutionID,
          pageSize: 600,
          parkId: getLocalStorage("parkId"),
          isOnService: true
        });
        if (prodcts) {
          yield put({
            type: "input",
            data: {
              prodcts: prodcts.items
            }
          });
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },

  };

}

app.model(marketDetailModel);
