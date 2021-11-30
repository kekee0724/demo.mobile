import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { spaceProjectService } from "@reco-m/space-service";

import { Namespaces } from "./common";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace spaceModel {
    export const namespace = Namespaces.space;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        spacePage(state, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                data &&
                    data.items &&
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
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getSpaceListInterface`, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getSpaceListInterface({ message, param }, { call, put }) {
            try {
                let space = {
                    ...param,
                    parentIdList: getLocalStorage("parkId"),
                };
                const thisChangeId = ++changeCounter,
                    data = yield call(spaceProjectService.getProjectList, space),
                    dataList = data && data.items;
                if (dataList && dataList.length > 0) {
                    for (let item of dataList) {
                        const pic = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.space, bindTableId: item.id, customType: 0 }),
                            picData = pic && pic.length > 0 && pic[0];
                        item.coverPicUrl = picData;
                    }
                }
                yield put({ type: "spacePage", data: data, thisChangeId: thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(spaceModel);
