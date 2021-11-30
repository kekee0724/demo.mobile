import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, transformAssetsUrl } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { Namespaces } from "./common";
import { supportTypes } from "./utils";

export namespace filePreviewModel {
    export const namespace = Namespaces.filespreview;

    export const state = freeze(
        {
            ...CoreState,
            previewUrl: "",
            showloading: true,
        },
        !0
    );

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, url }, { put }) {
            try {
                let urls = url.split(".");
                if (urls.length > 0) {
                    let supports = supportTypes.filter((i) => i.toLocaleLowerCase() === urls[urls.length - 1].toLocaleLowerCase());

                    if (supports.length > 0) {
                        yield put({ type: "preview", data: url });
                    } else {
                        yield put({ type: "input", data: { showloading: false } });
                    }
                } else {
                    yield put({ type: "input", data: { showloading: false } });
                }
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *preview({ message, data }, { put }) {
            try {
                yield put({ type: "showLoading" });
                yield put({
                    type: "input",
                    data: { previewUrl: transformAssetsUrl(data), showloading: false },
                });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({
                    type: "input",
                    data: { showloading: false },
                });
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(filePreviewModel);
