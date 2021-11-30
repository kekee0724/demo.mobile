import React from "react";
import { browser, getObjectProp, attachService } from "@reco-m/core";
import { download } from "./common";
import {ToastInfo} from "./utils"
const ddkit = window["dd"];

/**
 * 获取附件的uploadId
 */
 export function guid() {
    let counter = 0;

    return (prefix?: string) => {
        let uid = (+new Date()).toString(32),
            i = 0;

        for (; i < 5; i++) {
            uid += Math.floor(Math.random() * 65535).toString(32);
        }

        return (prefix || "wu_") + uid + (counter++).toString(32);
    };
}
/**
 * 跳转预览文件
 * @param item 文件信息
 */
export function goToPreview(_this, item: any) {
    _this.goTo({
        pathname: "preview",
        state: {
            url: item.filePath,
            title: item.fileName,
        },
    });
}
/**
 * 获取预览文件
 * @param item 文件信息
 */
export async function getPreviewUrl(item: any) {
    const uid = guid()("uploader")
    return await attachService.getPreviewUrl(item.sid || item.id, uid)
}

/**
 * 判断跳转预览文件页面还是打开永中平台新页面展示
 * @param item 文件信息
 */
export function isOnlineDoc(_this, item: any) {
    const onlineDoc = getObjectProp(client, "plugins.attach.onlineDoc", false);
    if (onlineDoc) {
        if(item.previewUrl){
            if(browser.versions.weChatMini){
               wx.miniProgram.navigateTo({url: "/apps-preview/apps-preview/apps-preview?path=" + server.previewUrl + item.previewUrl})
            }else{
                window.open(server.previewUrl + item.previewUrl)
            }
        }else{
            getPreviewUrl(item).then((url)=>{
                if(browser.versions.weChatMini){
                wx.miniProgram.navigateTo({url: "/apps-preview/apps-preview/apps-preview?path=" + url})
                }else{
                    window.open(url)
                }
            }).catch((e) => {
                ToastInfo(e?.errmsg || "附件获取失败")
            })
        }
    } else {
        _this.goToPreview(item)
    }
}
/**
 * 预览文件
 * @param item 文件信息
 */
export function previewFile(_this, item: any) {
    if (browser.versions.weChatMini) {
        isOnlineDoc(_this, item)
    } else if ((ddkit && ddkit.env.platform !== "notInDingTalk") || browser.versions.weChat) {
        window.open(item.filePath);
    } else if (browser.versions.android) {
        isOnlineDoc(_this, item)
    } else if (browser.versions.ios) {
        download(item.filePath);
        // goToPreview(_this, item)
    } else {
        goToPreview(_this, item)
    }
}
// 钉钉预览图片处理
export function previewFileC(url, callback: () => void) {
    if (browser.versions.weChatMini || browser.versions.weChat || (ddkit && ddkit.env.platform !== "notInDingTalk")) {
        window.open(url);
    } else {
        callback();
    }
}

// 钉钉设置导航栏右侧工具
export function ddNavRightOne(icon, callback) {
    return (
        <div
            className="btn-edit-form"
            onClick={() => {
                callback && callback();
            }}
        >
            {icon}
        </div>
    );
}

// 钉钉设置页面标题处理
export function setNavTitle(title: string, nextProps?) {
    let locationChanged = nextProps ? nextProps.location !== this.props.location : null;
    // 没传nextProps或者页面是从子路由返回时设置title
    if ((locationChanged && nextProps.location!.pathname.length < this.props.location!.pathname!.length) || !nextProps) {
        if (ddkit && !(ddkit.env.platform === "notInDingTalk")) {
            ddkit.biz.navigation.setTitle({
                title: title,
            });
        } else {
            !client.showheader && (document.title = title);
        }
    }
}
