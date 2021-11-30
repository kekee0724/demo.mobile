import { EffectsMapObject } from "dva";
import { ReducersMapObject } from "redux";
import { freeze } from "immer";
import { CoreEffects, CoreReducers } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { Namespaces } from "./common";
import { consumerService } from "@reco-m/ipark-common-service";

export namespace consumerCommonModel {
    export const namespace = Namespaces.consumerCommon;

    export const state: any = freeze({}, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,

        /**
         * 获取当前个人用户信息
         * @param { isRefreshConsumer 是否刷新企业信息 }
         * @param { select, put, call }
         */
        *getCurrentConsumer({ message, isRefreshConsumer }, { put, call, select }) {
            try {
                const state = yield select((state) => state[Namespaces.consumerCommon]);

                let consumerDetail = isRefreshConsumer ? null : state!.consumerDetail;

                if (!consumerDetail) {
                    consumerDetail = yield call(consumerService.getCurrentConsumer);

                    if (!consumerDetail || !Object.keys(consumerDetail)?.length) {
                        consumerDetail = null;
                    }
                }
                yield put({ type: "input", data: { consumerDetail } });
            } catch (e) {
                yield call(message!.error, "getCurrentConsumer：" + e.errmsg);
            }
        },

        /**
         * 清除企业信息
         * @param {}
         * @param { put }
         */
        *cleanConsumer({}, { put }) {
            yield put({ type: "input", data: { certifyDetail: null } });
        },

        /**
         * 清除
         * @param {}
         * @param { put }
         */
        *clean({}, { put }) {
            yield put({ type: "cleanConsumer" });
        },
    };
}

app.model(consumerCommonModel);
