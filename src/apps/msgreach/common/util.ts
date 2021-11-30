
import { transformAssetsUrl, getLocalStorage } from "@reco-m/core";

const ddkit = window["dd"];
/**
 * 分享内容配置
 */
export function msgDingTalkConfigShare() {
    if (ddkit && (getLocalStorage("shareTitle") || getLocalStorage("shareContent"))) {
        ddkit.biz.util.share({
            type: 0, // 分享类型，0:全部组件 默认；1:只能分享到钉钉；2:不能分享，只有刷新按钮
            url: getLocalStorage("shareLink"),
            title: getLocalStorage("shareTitle"),
            content: getLocalStorage("shareContent"),
            image: (getLocalStorage("shareImage") && transformAssetsUrl(getLocalStorage("shareImage") || "")) || (server.h5url + "/assets/images/msg_logo.png"),
            onSuccess: function () {
                // onSuccess将在调起分享组件成功之后回调
            },
            onFail: function (err) {
                console.log(err);
            }
        });
    }
}
