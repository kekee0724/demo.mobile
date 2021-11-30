import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { workQuestionService } from "@reco-m/workorder-service";

import { tagService } from "@reco-m/tag-service";

import { parkService } from "@reco-m/park-service";

import { Namespaces } from "./common";

export namespace consultModel {
    export const namespace = Namespaces.consult;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            items: [],
            open: false,
            redio1CheckTagName: "",
            redio1CheckTagId: null,
            redio1CheckIndex: null,
            searchKey: "",
            selectIndex: -1,
            selectedItems: [],
            activeKey: 0,
            pageSize: 20
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        getConsultListPage(state: any, { data, thisChangeId }) {
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
        *initPage({ data, message, params }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `getConsultList`, params, message });
                yield put({ type: `getTagByTagClass`, data, message });
                yield put({ type: "getParkDetailAction", message, inpree: getLocalStorage("parkId") });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getParkDetailAction({ message, inpree }, { call, put }) {
            try {
                const data = yield call(parkService.getParkDetail, inpree);
                yield put({
                    type: "update",
                    data: {
                        parkImpressionDetailData: data || {}
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getConsultList({ message, params }, { call, select, put }) {
            try {
                const state = yield select((state) => state[Namespaces.consult]);

                let questionType = state!.redio1CheckTagName,
                    question = state!.searchKey,
                    key = state!.searchKey;

                let pageIndex = params!.pageIndex,
                    pageSize = params!.pageSize,
                    isValid = params!.isValid,
                    parkId = params!.parkId;

                const thisChangeId = ++changeCounter;

                let data;

                if (!questionType && !key) data = yield call(workQuestionService.getPaged, { pageIndex, pageSize, isValid, parkId });

                if (questionType && !key) data = yield call(workQuestionService.getPaged, { pageIndex, pageSize, isValid, parkId, questionType });

                if (!questionType && key) data = yield call(workQuestionService.getPaged, { pageIndex, pageSize, isValid, parkId, key: question || decodeURI(question) });

                if (questionType && key) data = yield call(workQuestionService.getPaged, { pageIndex, pageSize, isValid, parkId, key, questionType });

                if (params.pageIndex === 1) {
                    const selectedItems: any = [];
                    for (let i = 0; i < data.totalItems; i++) {
                        selectedItems[i] = true;
                    }
                    yield put({ type: "input", data: { call, selectedItems: selectedItems } });
                }

                yield put({ type: "getConsultListPage", data, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getTagByTagClass({ message, data }, { call, put }) {
            try {
                const tags = yield call(tagService.getTagByTagClass, data);

                yield put({ type: "input", data: { consultTag: tags } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(consultModel);
