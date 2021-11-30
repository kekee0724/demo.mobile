import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { serviceProductService } from "@reco-m/workorder-service";

import { Namespaces, MyMarketinStatusEnum, MyProductTabEnum } from "./common";

export namespace productListModel {
    export const namespace = Namespaces.productList;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            show: false,
            isValid: true,
            pageSize: 15,
            productTab: MyProductTabEnum.sj,
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        productListPage(state: any, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;
            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({
                    type: `getProductList`,
                    data: {
                        pageIndex: 1,
                        orderBy: "",
                        parkId: getLocalStorage("parkId"),
                        institutionId: data.institutionID,
                    },
                    productTab: MyProductTabEnum.sj,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getProductList({ message, data, productTab }, { call, put }) {
            try {

                const thisChangeId = ++changeCounter;

                const num = yield call(serviceProductService.serviceNum,{
                    institutionId: data.institutionId,
                    parkId: data.parkId
                });
                
                let status =
                    productTab === MyProductTabEnum.sj
                        ? MyMarketinStatusEnum.pass
                        : productTab === MyProductTabEnum.xj
                        ? MyMarketinStatusEnum.pass
                        : productTab === MyProductTabEnum.sh
                        ? MyMarketinStatusEnum.wait
                        : productTab === MyProductTabEnum.th
                        ? MyMarketinStatusEnum.bounced
                        : productTab === MyProductTabEnum.qx
                        ? MyMarketinStatusEnum.cancel
                        : null;
                let isOnService = productTab === MyProductTabEnum.sj
                ? true
                : productTab === MyProductTabEnum.xj
                ? false
                : null

               const result = yield call(serviceProductService.getPaged, {
                    ...data,
                    status: status,
                    isOnService
                });        

                const validResult = num ? num.find((itm) => itm.status === MyMarketinStatusEnum.pass && itm.isOnService === true) : {number: 0};
                const unvalidResult = num ? num.find((itm) => itm.status === MyMarketinStatusEnum.pass && itm.isOnService === false) : {number: 0};
                const shResult = num ? num.find((itm) => itm.status === MyMarketinStatusEnum.wait ) : {number: 0};
                const thResult = num ? num.find((itm) => itm.status === MyMarketinStatusEnum.bounced ) : {number: 0};
                const qxResult = num ? num.find((itm) => itm.status === MyMarketinStatusEnum.cancel ) : {number: 0};

                
                yield put({ type: "productListPage", data: result, thisChangeId });
                yield put({
                    type: "input",
                    data: {
                        showList: true,
                        validTotal: validResult?.number || 0,
                        unvalidTotal: unvalidResult?.number || 0,
                        shTotal: shResult?.number || 0,
                        thTotal: thResult?.number || 0,
                        qxTotal: qxResult?.number || 0,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *serviceProductValid({ message, id, isOnService, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const result = yield call(serviceProductService.onService, id, isOnService);

                callback(result);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *cancelAudit({ message, id, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(serviceProductService.cancelProductAudit, id);
                callback(result);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        }
    };
}

app.model(productListModel);
