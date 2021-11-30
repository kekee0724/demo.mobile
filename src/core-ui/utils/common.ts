import { transformAssetsUrl, getAssetsUrl, setLocalStorage } from "@reco-m/core";

import { postBridgeMessage } from "./bridge";

/**
 * 拉起原生分享
 */
export function share(title: string, content: string, logo: string, url?: string) {
    return postBridgeMessage("share", { title, content, logo, url });
}
/**
 * 获取版本号
 */
export const appVersion = {
    version: "",
    hotUpdateVersion: "",
};
/**
 * 调用方法getVersionBefore后才能返回壳子版本号
 */
export function getVersion() {
    return appVersion.version;
}
/**
 * 调用方法getHotUpdateVersionBefore后才能返回热更新版本号
 */
export function getHotUpdateVersion() {
    return appVersion.hotUpdateVersion;
}
/**
 * 拉起原生获取热更新
 */
export function getHotUpdateVersionBefore() {
    let result = postBridgeMessage("getHotUpdateVersion", "获取热更新版本号");
    if (result) {
        return result.then((data: string) => {
            if (typeof data === "string") {
                return (appVersion.hotUpdateVersion = data);
            }
        });
    }
}
/**
 * 拉起原生获取壳子版本号
 */
export function getVersionBefore() {
    let result = postBridgeMessage("getVersion", "获取版本号");
    if (result) {
        return result.then((data: string) => {
            if (typeof data === "string") {
                return (appVersion.version = data);
            }
        });
    }
}
/**
 * 检测版本更新
 */
export function checkNewVersion() {
    return postBridgeMessage("checkNewVersion", "版本更新");
}
/**
 * 壳子设置键盘高度
 */
window["setHeight"] = function (height) {
    setLocalStorage("height", `${height}`)
};

/**
 * 跳转地图
 */
export function gotoMap(name: string, address: string) {
    return postBridgeMessage("gotoMap", { name, address });
}
/**
 * 复制到剪贴板
 */
export function stringCopy(data: string) {
    return postBridgeMessage("stringCopy", data);
}
/**
 * 扫一扫
 */
export function scan() {
    return postBridgeMessage("scan");
}
/**
 * 扫一扫壳子直接返回结果
 */
export function scanToreactapp() {
    return postBridgeMessage("scanToreactapp");
}
/**
 * 苹果短暂震动
 */
export function shake() {
    return postBridgeMessage("shake");
}
/**
 * 增强屏幕亮度
 */
export function addBrightness() {
    return postBridgeMessage("addBrightness");
}
/**
 * 恢复屏幕亮度
 */
export function resetBrightness() {
    return postBridgeMessage("resetBrightness");
}
export function setScrollViewZoomOpen() {
    return postBridgeMessage("setScrollViewZoomOpen", "开启");
}

export function setScrollViewZoomClose() {
    return postBridgeMessage("setScrollViewZoomClose", "关闭");
}

export function commentShow(isShow: boolean) {
    return postBridgeMessage("commentShow", isShow);
}

/**
 * 打开手势密码
 */
export function gesture(isShow: boolean) {
    return postBridgeMessage("gesture", isShow);
}

/**
 * 修改手势密码
 */
export function modifyGesture() {
    return postBridgeMessage("modifyGusture");
}

/**
 * 手势密码是否已经开启
 */
 export const gusture = {
    isGusture: 0,
};
export function isGesture() {
    let result = postBridgeMessage("isGesture", "获取手势密码是否开启");
    if (result) {
        return result.then((data: number) => {
            return (gusture.isGusture = data);
        });
    }
}

/**
 * 清除缓存
 */
export function clearCache() {
    return postBridgeMessage("clearCache");
}

/**
 * 获取定位信息
 */
export function getLocation(key?: string) {
    return postBridgeMessage("getLocation", key);
}

/**
 * 设置状态栏为白色
 */
export function setStutasWhite() {
    return postBridgeMessage("setStutasWhite");
}

/**
 * 设置状态栏为黑色
 */
 export function setStutasBlack() {
    return postBridgeMessage("setStutasBlack");
}
/**
 * 跳转微信小程序
 */
 export function openMiniProgram(UserName:string, path:string) {
    return postBridgeMessage("openMiniProgram", {UserName, path});
}

/**
 * 启动指纹/面容识别
 */
//  0:当前设备不支持指纹/面容
//  1:指纹/,面容不正确
//  2:多次错误，指纹/面容ID已被锁定，请到手机解锁界面输入密码
//  3:认证成功
 export function authVerification() {
    return postBridgeMessage("authVerification");
}

/**
 * 设置匿名token
 */
export function postBridgeSetAnonymousToken(token?: string) {
    return new Promise((resolve, reject) => {
        (token ? Promise.resolve(token) : (typeof window["getAnonymousToken"] === "function" && window["getAnonymousToken"]()) || Promise.reject(token)).then((d) => {
            d ? postBridgeMessage("setToken", d).then(resolve, reject) : reject();
        }, reject);
    });
}

/**
 * 设置app未读消息角标
 */
export function noReadCount(count: string) {
    return postBridgeMessage("noReadCount", Number.parseInt(count, 0));
}

/**
 * 应用内打开url
 */
 export function openUrlAPP(url: string) {
    return postBridgeMessage("openUrlAPP", url);
}
/**
 * 浏览器打开url
 */
export function openUrlBrowser(url: string) {
    return postBridgeMessage("openUrlBrowser", url);
}

/**
 * android下载/IOS预览附件
 */
export function download(url: string) {
    if (url.startsWith("~")) {
        url = url.replace(/\*/g, "/").replace("~", "");
        url = url.slice(1);
        url = server.url + url;
    }
    return postBridgeMessage("download", url);
}

/**
 * 获取扫码名片
 */
export function sweepCodeCard() {
    // 正式获取扫码图片
    return postBridgeMessage("scanBusinessCard").then(({ data }) => data);
}

export function getSharePicture(cover?: any, content?: any, icon?: any) {
    if (cover) {
        return transformAssetsUrl(cover);
    } else if (content) {
        const $html = $(`<div>${content}</div>`),
            baseUrl = getAssetsUrl(),
            imgSrc: any = ($html.find("img[src]:first").get(0) as any)?.src;

        return imgSrc && (imgSrc.startsWith("./") || imgSrc.startsWith("~/")) ? baseUrl + imgSrc.substr(1) : icon;

    }
    return icon;
}

/**
 * 即时通讯登录
 */
export function jMessageLogin(data: any) {
    return postBridgeMessage("jMessageLogin", data);
}
/**
 * 调用即时通讯发送消息
 */
export function jMessageSendToUsername(data: any) {
    return postBridgeMessage("jMessageSendToUsername", data);
}
/**
 * 调用即时通讯群组
 */
export function jMessageGroup(data: any) {
    return postBridgeMessage("jMessageGroup", data);
}
/**
 * 调用即时通讯会话
 */
export function jMessageConversation(data: any) {
    return postBridgeMessage("jMessageConversation", data);
}
/**
 * 调用传群组添加列表数据
 */
export function jMessageAddGroupList(data: any) {
    return postBridgeMessage("jMessageAddGroupList", data);
}
