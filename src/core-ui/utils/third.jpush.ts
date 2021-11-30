import { browser } from "@reco-m/core";

import { postBridgeMessage, webkitPostMessage } from "./browser";

export function jpush(flag) {
    postBridgeMessage("jpush", flag);
}

export function jpushRegister(name) {
    postBridgeMessage("jpushRegister", name);
}

export function jpushRegisterTag(tag) {
    postBridgeMessage("jpushRegisterTag", tag);
}

export function jpushRemove() {
    postBridgeMessage("jpushRemove");
}

export function getNoticationStatus() {
    if (browser.versions.android) {
        localStorage.notificationStatus = 1;
    } else if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) {
        webkitPostMessage("giveNotificationStatus", "推送");
    }
}
