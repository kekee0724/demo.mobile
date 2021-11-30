import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { getFileService } from "@reco-m/files-manage-service";

import { Namespaces, FileListTypeEnum, FileTypeEnum } from "./common";
// import { dataSources } from "./utils";

export namespace fileSubPageModel {
    export const namespace = Namespaces.filessubpage;

    export const state = freeze(
        {
            ...CoreState,
            isAll: true,
        },
        !0
    );

    export type StateType = typeof state;

    let fileLists: any = [];

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *getFilesAction({ message, data }, { call, put }) {
            // console.log('name', data);
            try {
                yield put({ type: "showLoading" });
                const filessubpage = yield call(getFileService.getFileList, {...data, accessTypeList: [FileListTypeEnum.fileControl, FileListTypeEnum.fileDownload, FileListTypeEnum.fileUpload, FileListTypeEnum.fileView]});
                if (data.fileFlag === FileTypeEnum.no && filessubpage) {
                    let items = filessubpage.items.filter((item) => {
                        return item.attachList && item.attachList.length === 0;
                    });
                    filessubpage.items = items;
                } else if (data.fileFlag === FileTypeEnum.yes && filessubpage) {
                    let items = filessubpage.items.filter((item) => {
                        return item.attachList && item.attachList.length > 0;
                    });
                    filessubpage.items = items;
                }
                fileLists = filessubpage.currentPage <= 1 ? filessubpage.items : fileLists.concat(filessubpage.items);


                yield put({ type: "input", data: { [`${data.parentId}`]: {...filessubpage, items: fileLists} } });
                // dataSources.forEach((d: any, i) => {
                //     if (d.id === data.parentId) {
                //         index = i;
                //     }
                // });
                // let source = fileLists;
                // if (index > -1) {
                //     dataSources[index].dataSource = source;
                //     dataSources[index].data = fileLists;
                // } else {
                //     dataSources.push({ id: data.parentId, data: fileLists, dataSource: source });
                // }

            } catch (e) {
                message!.error(e.errmsg||e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(fileSubPageModel);
