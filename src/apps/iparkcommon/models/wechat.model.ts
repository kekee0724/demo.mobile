import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { wechatMPJSService } from "@reco-m/ipark-common-service";

import { Namespaces } from "./common";

export namespace activityDetailModel {
    export const namespace = Namespaces.wechat;

    export type StateType = typeof state;

    export const state: any = freeze(
        {},
        !0
    );

    export const ddkit = window["dd"];

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *thirdShare({ title, img, desc, wx }, { call }) {
            try {
                // yield put({ type: "showLoading" });
                const url = location.href.split("#")[0];
                const d = yield call(wechatMPJSService.getConfig, { url: url });
                wx.config(
                    Object.assign(d, {
                        jsApiList: ["checkJsApi", "onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone", "openLocation"],
                    })
                );
                wx.ready(function () {
                    wx.onMenuShareAppMessage({
                        title: title, // 分享标题
                        imgUrl: img, // 分享图标
                        desc: desc || "", // 分享内容
                    });
                    wx.onMenuShareTimeline({
                        title: title,
                        desc: desc || "",
                        imgUrl: img, // 自定义图标
                    });
                    wx.onMenuShareQQ({
                        title: title,
                        desc: desc || "",
                        imgUrl: img, // 自定义图标
                    });
                    wx.onMenuShareWeibo({
                        title: title,
                        desc: desc || "",
                        imgUrl: img, // 自定义图标
                    });
                    wx.onMenuShareQZone({
                        title: title,
                        desc: desc || "",
                        imgUrl: img, // 自定义图标
                    });
                    // alert(
                    //   `${JSON.stringify({
                    //     title: title, // 分享标题
                    //     imgUrl: img, // 分享图标
                    //     desc: desc || "" // 分享图标
                    //   })}`
                    // );
                });
                // wx.error(function(res) {
                //   // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                //   alert(`error: ${res}`);
                // });
            } catch (e) {
                // yield call(message!.error, e.errmsg);
            }
        }
    };
}

app.model(activityDetailModel);
