import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { workOrderService } from "@reco-m/workorder-service";

import { Namespaces } from "./common";
import { parkCateService } from "@reco-m/park-service";
import { Namespaces as memberNamespaces, CertifyStatusEnum } from "@reco-m/member-models";

export namespace wrokorderCreateModel {
    export const namespace = Namespaces.wrokorderCreate;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            isLoading: true,
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `input`, data: { flowId: null }, message });
                yield put({ type: `getUserInfo`, message });
                yield put({ type: `getCatalogDTO`, goBack: data.goBack, data: data.code, message });
            } catch (e) {
                e && message!.error(e?.errmsg);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *initVisitorPage({ callback, message, goBack, code }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getUserInfo`, message });
                yield put({ type: `getCertifyMember`, callback, message });
                if (code) yield put({ type: `getCatalogDTO`, goBack, message, data: code });
            } catch (e) {
                e && message!.error(e?.errmsg);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCatalogDTO({ data, message, goBack }, { call, put }) {
            try {
                if (data) {
                    const result = yield call(workOrderService.getCatalogDTO, data);
                    yield put({ type: "input", data: { flowId: result.flowId, catalogue: result.catalog } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                setTimeout(() => {
                    goBack!();
                }, 1000);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getCatalog({ data, message, map }, { call, put }) {
            try {
                const result = yield call(parkCateService.getCateByCode, data);
                yield put({ type: "input", data: { [map]: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getUserInfo({ message }, { select, put }) {
            try {
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo` });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    currentMember = memberState.member || {};
                if (CertifyStatusEnum.allow === currentMember.status) {
                    yield put({
                        type: "input",
                        data: currentMember,
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *submit({ data, message, callback }, { call }) {
            try {
                const result = yield call(workOrderService.post, data);

                result ? callback(result) : fail!(result.errmsg);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        }
    };
}

app.model(wrokorderCreateModel);
