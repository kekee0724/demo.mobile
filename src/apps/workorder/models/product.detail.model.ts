import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService} from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { myMarketInHttpService, serviceProductService } from "@reco-m/workorder-service";

// import { operationService } from "@reco-m/auth-service";

import { Namespaces } from "./common";


import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace productDetailModel {

  export const namespace = Namespaces.productDetail;

  export type StateType = typeof state;

  export const state: any = freeze({
    tagShow: false,
    detail: {}
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state;
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ id, message }, {put }) {
      put({ type: "showLoading" });
      try {
        yield put({ type: `getProductDetail`, id, message });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getProductDetail({ message, id }, { call, put }) {
      try {
        const productDetail = yield call(serviceProductService.get, id);
        const pict = yield call(pictureService.getPictureList, {
          bindTableName: IParkBindTableNameEnum.product,
          bindTableId: id,
          customType: 0
        });

        yield put({ type: "input", data: { detail: productDetail, pictures: pict, singlePicture: pict ? pict[0] : "" } });

        yield put({ type: "getMarketDetail", institutionId: productDetail.serviceProductBasicFormVM.institutionId, message });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getMarketDetail({ message, institutionId }, { call, put }) {
      try {

        let id = institutionId;
        const marketDetail = yield call(myMarketInHttpService.get, id);

        yield put({ type: "input", data: { marketDetail: marketDetail } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
  };

}

app.model(productDetailModel);
