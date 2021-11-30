import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { interactiveTopicHttpService, circleService } from "@reco-m/ipark-white-circle-service";
import { Namespaces } from "./common";

export namespace circleAddModel {

  export const namespace = Namespaces.circleAdd;

  export type StateType = typeof state;

  export const state: any = freeze({
    circle: {},
    selectedCircle: {},
    circleDetail: {},
    circleOpen: false
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state
    }
  };


  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message, data }, { put }) {
      put({ type: "showLoading" });
      try {

        yield put({ type: "input", data: { content: "", title: "", files: [] } });

        yield put({ type: "getCircleData", id: data.id, message });
        yield put({ type: "input", data: { circle: {}, selectedCircle: {}, circleDetail: {} }, message });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getCircleData({ id, message }, { call, put }) { // 获取是否有参与的话题
      try {
        yield put({ type: "showLoading" });
        const data = yield call(circleService.getPaged, {
          parkId: getLocalStorage("parkId"),
          pageIndex: 1,
          pageSize: 199,
          postIsPublic: true,
          publishStatus: 1,
          isValid: true
        })
        let attentItem = (data.items && data.items.length > 0) && data.items.find(item => item.isSubscribe)
        const circleDetail = attentItem ? attentItem : null;

        if (circleDetail) { // 当前用户参与话题中取第一个
          if (id) {
            yield put({ type: "getCircleDatas", id: id, message });
          } else {
            yield put({ type: "input", data: { selectedCircle: circleDetail } });
            yield put({ type: "selectCircle/input", data: { item: circleDetail } });
          }
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getCircleDatas({ message, id }, { call, put }) {
      try {
        const circleDetail = yield call(circleService.get, id);
        yield put({ type: "input", data: { selectedCircle: circleDetail } });
        yield put({ type: "selectCircle/input", data: { item: circleDetail } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *submitTopic({ message, data, callback }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const result = yield call(interactiveTopicHttpService.post, data);
        yield put({ type: "input", data: { result: result } });
        if (result) {
          yield call(callback!, result);
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    }
  };


}







app.model(circleAddModel);
