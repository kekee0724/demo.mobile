import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, formatNow, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { resourceService } from "@reco-m/order-service";

import { tagService } from "@reco-m/tag-service";

import { Namespaces, MAX_CAPACITY } from "./common";
export namespace roomModel {
    export const namespace = Namespaces.room;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            startDay: formatNow(),
            endDay: formatNow(),
            startTime: " 00:00:00",
            endTime: " 23:59:59",
            visible: false, // 是否显示选择日期
            open: false, // 是否打开筛选页面
        },
        !0
    );

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
        *initPage({ message, datas }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: "input", data: { startDay: formatNow(), endDay: formatNow() } });
                yield put({ type: "getProjectsAction", param: { spaceIdList: getLocalStorage("parkId"), spaceTypeList: 2 }, message });
                yield put({ type: "getTagByTagClassAction", data: { tagClass: "ROOM/huiyskrnrs", parkId: getLocalStorage("parkId") }, map: "capacityTags", message });
                yield put({ type: "getTagByTagClassAction", data: { tagClass: "ROOM/tigsb", parkId: getLocalStorage("parkId") }, map: "equipmentTags", message });
                yield put({ type: "getResourceAction", datas: datas });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getProjectsAction({ message, param }, { call, put }) {
            try {
                let project = yield call(resourceService.getResourceSpace, param);
                project &&
                    project.forEach((t) => {
                        t.tagName = t.spaceName;
                        t.tagValue = t.spaceId;
                    });
                yield put({ type: "input", data: { projectsData: project } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getBuildsAction({ message, parmas }, { call, put }) {
            try {
                const build = yield call(resourceService.getResourceSpace, parmas);
                build &&
                    build.forEach((t) => {
                        t.tagName = t.spaceName;
                        t.tagValue = t.spaceId;
                    });
                yield put({ type: "input", data: { buildingsData: build } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getResourceAction({ message, datas }, { call, put, select }) {
            try {
                const resource = yield select((state) => state[Namespaces.room]);
                let projectsItem = resource!.projectsItem,
                    buildingItem = resource!.buildingItem,
                    key = resource!.key,
                    capacityTag = resource!.capacityTag,
                    equipmentTag = resource!.equipmentTag,
                    startDay = resource!.startDay,
                    endDay = resource!.endDay,
                    startTime = resource!.startTime,
                    endTime = resource!.endTime;
                let resourceType = datas.resourceType;

                let params = {
                    resourceType: resourceType,
                    startDate: datas.start ? datas.start + startTime : startDay + startTime,
                    endDate: datas.end ? datas.end + endTime : endDay + endTime,
                    pageIndex: datas.pageIndex,
                    key: key && key !== "null" ? key : "",
                    parkId: getLocalStorage("parkId"),
                    orderBy: "sequence asc,id desc",
                    isFilterEffective: true,
                };

                if (equipmentTag) {
                    params = Object.assign(params, { serviceCode: equipmentTag });
                }
                if (capacityTag && capacityTag.length > 0 && capacityTag.length <= MAX_CAPACITY.length) {
                    let capacity = MAX_CAPACITY[capacityTag[0]];
                    params = Object.assign(params, { maxItems: capacity["maxCapacity"], minItems: capacity["minCapacity"] });
                }
                if (projectsItem && projectsItem.length > 0) {
                    params = Object.assign(params, { projectId: projectsItem[0] });
                }
                if (buildingItem && buildingItem.length > 0) {
                    params = Object.assign(params, { buildingId: buildingItem[0] });
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
        *getTagByTagClassAction({ message, data, map }, { call, put }) {
            try {
                let result = yield call(tagService.getTagByTagClass, data);
                yield put({ type: "input", data: { [map]: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(roomModel);
