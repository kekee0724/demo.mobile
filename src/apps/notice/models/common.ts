import { browser } from "@reco-m/core";

/**
 * 消息类型
 */
export enum NotificationTypesEnum {
    unRead = "1", // 通知
    todo = "2"  // 待办
}

export enum MailBoxTypeEnum {
    mailBox = 2
}

export enum Namespaces {
    notification = "notification",
    notificationCount = "notificationCount",
    assistant = "assistant",
    noticesetting = "noticesetting",
    noticeWhite = "noticeWhite"
}
/**
 * 消息开关状态
 */
export enum NotificationStateEnum {
    /**
     * 关
     */
    close = 0,
    /**
     * 开
     */
    open = 1
}
/**
 * 系统类型
 */
export enum SystemTypeEnum {
    /**
     * 安卓
     */
    android = 1,
    /**
     * iOS
     */
    ios = 2
}
export function getDeviceStatus() {
    if (browser.versions.android) {
        return 1;
    } else if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) {
        return 2;
    }
}

export const SceneCodes = ["WORKORDER", "ParkPush", "InteractiveMessage"];
