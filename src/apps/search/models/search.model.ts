import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage, setStorageObject, getStorageObject, removeStorage} from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { searchService } from "@reco-m/favorites-service";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";
import { deepClone} from "@reco-m/ipark-common"
import { Namespaces } from "./common";

export namespace searchModel {

  export const namespace = Namespaces.search;

  export type StateType = typeof state;

  export const state: any = freeze({
    datas: null,
    searchHistory: []
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,
    init() {
      return state;
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ message }, { put }) {

      try {
        yield put({ type: `input`, data: { key: "" } });
        yield put({ type: "getSearchHistory" });
        put({ type: "getGlobalSearch", data: "" });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getGlobalSearch({ message, data }, { put }) {
      try {
        if (!data) {
          yield put({ type: "input", data: { datas: null } });
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *getGlobalSearchDetail({ message, data }, { call, put, select }) {
      yield put({ type: "showLoading" });
      try {
        if (data) {
          yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
          const memberState: any = yield select(state => state[memberNamespaces.member]),
            member = memberState.member;
          yield put({ type: "update", data: { currentMember: member } });

          const globalDataDetail = yield call(searchService.getSearchData, {
            key: data,
            // unitId: getLocalStorage("unitId"),
            parkId: getLocalStorage("parkId"),
            pageSize: 2
          });
          yield put({ type: "input", data: { datas: globalDataDetail, searchfinish: true } });
        } else {
          yield put({ type: "input", data: { datas: null } });
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getSearchHistory({ message }, { put }) {
      try {
        let data = getStorageObject("HotSearchHistory");
        if (data) yield put({ type: "input", data: { searchHistory: data } });
        else yield put({ type: "input", data: { searchHistory: [] } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *addSearchHistory({ message, tip, key }, { put }) {JSON.parse

      try {
        let data = getStorageObject("HotSearchHistory");
        if (data) {
          let history = deepClone(data);
          // console.log(history, tip, key);

          if (history && !history.some(d => d.key === key)) {
            history.unshift({ tip: tip, key: key });
            if (history.length > 6) {
              history.pop();
            }
            setStorageObject("HotSearchHistory", [...history]);
          }
          yield put({ type: "input", data: { searchHistory: history } });
        } else {
          setStorageObject("HotSearchHistory", [{ tip: tip, key: key }]);
          yield put({ type: "input", data: { searchHistory: [{ tip: tip, key: key }] } });
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *removeSearchHistory({ message, item, searchHistory }, { put }) {
      try {
        let filter = searchHistory.filter(data => data.key !== item.key);
        setStorageObject("HotSearchHistory", filter);
        yield put({ type: "input", data: { searchHistory: filter } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },
    *removeAllSearchHistory({ message }, { put }) {
      try {
        removeStorage("HotSearchHistory");
        yield put({ type: "input", data: { searchHistory: "" } });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    }
  };
}

app.model(searchModel);
