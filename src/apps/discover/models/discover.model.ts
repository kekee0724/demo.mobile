import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { tagService } from "@reco-m/tag-service";

import { appModuleService } from "@reco-m/service-service";

import { setMapScript } from "@reco-m/ipark-common";

import { Namespaces } from "./common";
export namespace discoverhomeModel {
    export const namespace = Namespaces.discoverhome;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            activityselecticon: {},
            articleselecticon: {},
            cirecleselecticon: {}
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: "getMapConfig", message });
                yield put({ type: `getTags`, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getTags({ message }, { call, put }) {
            try {
                const tags = yield call(tagService.getTagByTagClasses, {
                    tagClass: "ACTIVITY/HUODLX,CIRCLE/quanzfl,ARTICLE/ZIXLB",
                });
                if (tags) {
                    yield put({
                        type: "input",
                        data: { activitytag: tags["ACTIVITY/HUODLX"], cirecletag: tags["CIRCLE/quanzfl"], articletag: tags["ARTICLE/ZIXLB"] },
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getMapConfig({ message}, { call, put}) {
            try {
                const result = yield call(appModuleService.getConfig);
                if (result?.gaudes?.h5?.key) {
                    // 设置h5定位key配置
                    setMapScript(result?.gaudes?.h5?.key)
                    client.openMapLocation = true;
                }
                yield put({ type: "input", data: { mapConfig: result } });
            } catch (e) {
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(discoverhomeModel);
