import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { policyService } from "@reco-m/policymatching-service";


import { Namespaces } from "./common";


export namespace policymatchingdetailModel {

  export const namespace = Namespaces.policymatchingdetail;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, message, callback }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getPolicyDetailAction`, message, data });
        callback && callback()
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getPolicyDetailAction({ message, data }, { call, put }) {
      try {
        const policyDetail = yield call(policyService.get, data);
        // console.log(policyDetail);
        if (policyDetail) {
          let policyRead = (policyDetail.KeyWords || "").split(",");
          let arr = [] as any;
          policyDetail.applyTags && policyDetail.applyTags.forEach((item) => {
            let temp = {} as any;
            arr = arr.filter(itm => {
              if (itm.tagClassCode === item.tagClassCode) {
                temp = itm;
                return false;
              }
              return true;
            })
            if (!temp.tagClassCode) {
              temp.tagClassCode = item.tagClassCode;
              temp.tagClass = item.tagClass;
              temp.arr = [item]
            } else {
              temp.arr.push(item);
            }
            arr.push(temp)
          })
          yield put({
            type: "input",
            data: { ...policyDetail, policyRead: policyRead, ApplyTags: policyDetail.applyTags, policyTags: arr }
          });
        }
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      }
    },
    // *getApplyTags({ message, ApplyTags }, { call, put }) {
    //     try {
    //         if (ApplyTags) {
    //             // let applytag = ApplyTags;
    //             const result = yield call(policyService.getApplyTags, { ApplyTagFlags: [1] });
    //             // let policyTagClasses: any = [];
    //             // result &&
    //             //     result.Policy.map(item => {
    //             //         // console.log(item.FitTags);
    //             //         item.FitTags.map(tag => {  ApplyTags &&   ApplyTags.map(data => {
    //             //                     if (tag.id === data.id) {
    //             //                         policyTagClasses.push(tag);
    //             //                     }
    //             //                 });
    //             //         });
    //             //     });
    //             yield put({ type: "input", data: { policyTag: result.Policy } });
    //         }
    //     } catch (e) {
    //         yield call(message!.error, e.errmsg);
    //     }
    // },

    // *addPolicyView({ message, data }, { call }) {
    //   try {
    //     yield call(policyService.addPolicyView, data);
    //   } catch (e) {
    //     console.log('catcherror', e?.errmsg||e);
    //     message!.error(`${e?.errmsg || e}`)
    //   }
    // },

    // *shareSuccess({ message, id }, { call, put, select }) {
    //   try {
    //     const state = yield select(state => state[Namespaces.policymatchingdetail]);
    //     const title = state!.title;
    //     const data = {
    //       bindTableId: id,
    //       bindTableName: "BIPolicy",
    //       bindTableValue: title
    //     };
    //     const shareResult = yield call(IntergralMemberService.getThirdShare, data);

    //     yield put({ type: "input", data: { shareResult: shareResult } });

    //     let shareSuccessData = {
    //       bindTableId: id,
    //       bindTableName: "BIPolicy",
    //       ViewName: "政策分享",
    //       ViewCode: "Policy_Share"
    //     };

    //     yield call(operationService.share, shareSuccessData);
    //   } catch (e) {
    //      console.log('catcherror', e?.errmsg||e);
    //      message!.error(`${e?.errmsg || e}`)
    //   }
    // },
  };

}

app.model(policymatchingdetailModel);
