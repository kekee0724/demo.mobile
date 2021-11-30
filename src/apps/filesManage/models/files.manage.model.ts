import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { getFileService } from "@reco-m/files-manage-service";

import { Namespaces, FileTypeEnum, FileListTypeEnum } from "./common";

export namespace fileManageModel {
    export const namespace = Namespaces.filesmanage;

    export const state = freeze({
        ...CoreState,
        isAll: true,
        showloading: true
    }, !0);

    export type StateType = typeof state;

    let changeCounter = 0;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        filesmanagePage(state, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;
            data = { ...data, refreshing: false };
            return produce(state, (draft) => {
                Object.assign(draft, data, { items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items] });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *fileinput({ message, data }, { put }) {
            try {
                yield put({ type: "input", data: data });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getFilesAction({ message, data, typed }, { call, put }) {
            try {
                const thisChangeId = ++changeCounter;
                const filesmanage = yield call(getFileService.getFileList, {...data, accessTypeList: [FileListTypeEnum.fileControl, FileListTypeEnum.fileDownload, FileListTypeEnum.fileUpload, FileListTypeEnum.fileView]});
                if (data.fileFlag === FileTypeEnum.no && filesmanage) {
                    let items = filesmanage.items.filter((item) => {
                        return item.attachList && item.attachList.length === 0;
                    });
                    filesmanage.items = items;
                } else if (data.fileFlag === FileTypeEnum.yes && filesmanage) {
                    let items = filesmanage.items.filter((item) => {
                        return item.attachList && item.attachList.length > 0;
                    });
                    filesmanage.items = items;
                }
                yield put({
                    type: "filesmanagePage",
                    typed: typed,
                    data: filesmanage,
                    id: data.parentId,
                    thisChangeId: thisChangeId,
                });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(fileManageModel);
