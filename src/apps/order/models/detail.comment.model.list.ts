import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { rateRateHttpService } from "@reco-m/comment-service";
import { CommentAuditStatusEnum } from "@reco-m/ipark-common";
import { Namespaces } from "./common";

export namespace detailcommentlistModel {
    export const namespace = Namespaces.detailcommentlist;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        resourcePaged(state: any, { data, thisChangeId }) {
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
                    type: `getCommentsDetailAction`,
                    params: { bindTableIdList: [data.id], pageIndex: 1, pageSize: 10, auditStatus: CommentAuditStatusEnum.pass, isShowWaitAudit: true },
                    message,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCommentsDetailAction({ message, params }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const thisChangeId = ++changeCounter,
                    projects = yield call(rateRateHttpService.getPaged, params);
                yield put({ type: "resourcePaged", data: projects, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(detailcommentlistModel);
