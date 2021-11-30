import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, formatDateTime, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { resourceService } from "@reco-m/order-service";

import { Namespaces } from "./common";

export namespace positionModel {
    export const namespace = Namespaces.position;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    let changeCounter = 0;

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
                yield put({ type: `input`, data: { startDate: data.startDate, endDate: data.endDate } });
                yield put({
                    type: `getResourceAction`,
                    pageIndex: 1,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    resourceType: data.resourceType,
                    searchParam: data.key,
                    message,
                });
                yield put({ type: `getProjectsAction`, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getProjectsAction({ message }, { call, put }) {
            try {
                let param = { spaceIdList: getLocalStorage("parkId"), spaceTypeList: 2 };
                const project = yield call(resourceService.getResourceSpace, param);
                yield put({ type: "input", data: { projectsData: project } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getBuildsAction({ message, parmas }, { call, put }) {
            try {
                const build = yield call(resourceService.getResourceSpace, parmas);
                yield put({ type: "input", data: { buildingsData: build } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getResourceAction({ message, pageIndex, startDate, endDate, resourceType, searchParam }, { call, put, select }) {
            try {
                // yield put({ type: "showLoading" });
                const state = yield select((state) => state[Namespaces.position]);
                const projectsItem = state!.projectsItem,
                    buildingItem = state!.buildingItem,
                    key = state!.key;
                let params;
                if (searchParam) {
                    params = {
                        resourceType: resourceType,
                        startDate: formatDateTime(startDate),
                        endDate: formatDateTime(endDate),
                        pageIndex: pageIndex,
                        key: searchParam,
                        parkId: getLocalStorage("parkId"),
                        orderBy: "sequence asc,id desc",
                    };
                } else {
                    params = {
                        resourceType: resourceType,
                        startDate: formatDateTime(startDate),
                        endDate: formatDateTime(endDate),
                        pageIndex: pageIndex,
                        key: key && key !== "null" ? key : "",
                        parkId: getLocalStorage("parkId"),
                        orderBy: "sequence asc,id desc",
                    };
                }
                if (projectsItem) {
                    params = Object.assign(params, { projectId: projectsItem.spaceId });
                }
                if (buildingItem) {
                    params = Object.assign(params, { buildingId: buildingItem.spaceId });
                }
                const thisChangeId = ++changeCounter,
                    data = yield call(resourceService.getResource, params);
                yield put({ type: "resourcePaged", data: data, thisChangeId: thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(positionModel);
