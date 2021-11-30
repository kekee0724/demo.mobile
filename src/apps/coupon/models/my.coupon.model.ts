import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { newCouponHttpService } from "@reco-m/coupon-service";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { memberCompanyHttpService } from "@reco-m/member-service";
import { Namespaces } from "./common";

export namespace mycouponModel {
    export const namespace = Namespaces.mycoupon;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            selectID: {},
            selectCouponTypeID: [],
        },
        !0
    );

    let changeCounter = 0;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },

        getmycouponListPage(state, { couponList, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, couponList, {
                    items: couponList.currentPage <= 1 ? couponList.items : [...draft.items, ...couponList.items],
                    refreshing: false,
                    hasMore: couponList.currentPage < couponList.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `input`, data: { couponState: 1 } });
                yield put({ type: `mycouponGetListPage`, message, data });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *initGiftPage({ message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getstaffmanagerList` });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *mycouponGetListPage({ message, data }, { call, put }) {
            try {
                let thisChangeId = ++changeCounter,
                    couponList = yield call(newCouponHttpService.getMyCoupon, data);

                couponList && couponList.items && couponList.items.forEach((x) => (x.tabIndex = data.status));

                yield put({ type: "getmycouponListPage", couponList, thisChangeId });
                yield put({ type: "input", data: { showList: true } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getstaffmanagerList({ message }, { call, put, select }) {
            try {
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState = yield select((state) => state[memberNamespaces.member]),
                    certify = memberState.member;
                let cmpanyid = certify.companyId;
                let params = {
                    pageIndex: 1,
                    pageSize: 1000,
                    companyId: cmpanyid,
                    isIncludeQygly: true,
                };
                const data = yield call(memberCompanyHttpService.userPage, params);
                let certifyMember: any = [],
                    certigyMemberName: any = [],
                    certifyMemberArr: any = [];

                let items = data && data.items;

                if (items) {
                    items.forEach((item, i) => {
                        let dic = {};
                        dic["label"] = item.realName;
                        dic["value"] = item.accountId;

                        if (dic["value"] !== certify.accountId) {
                            if (i === 0) {
                                certigyMemberName.push(item.accountId);
                            }
                            certifyMemberArr.push(dic);
                        }
                    });
                }

                certifyMember.push(certifyMemberArr);

                yield put({ type: "input", data: { certifyMember, certigyMemberName, certifyMemberArr } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *givenCoupon({ message, id, data, successCall }, { call }) {
            try {
                yield call(newCouponHttpService.givenCoupon, id, data);
                successCall();
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(mycouponModel);
