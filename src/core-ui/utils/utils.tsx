import React from "react";
import { Toast } from "antd-mobile";
import { ExclamationOutline } from "antd-mobile-icons";
import { browser } from "@reco-m/core";

/**
 * 深度拷贝
 */
export function deepClone(obj) {
    let _obj = JSON.stringify(obj);
    return JSON.parse(_obj);
}
/**
 * 分享枚举
 */
export enum shareType {
    weibo = 0,
    qq = 24,
    qqspace = 6,
    weixin = 22,
}

/**
 * 获取当前手机型号枚举值
 */
export enum OSVersionType {
    android = 1,
    ios = 2,
    iosAfter = 3,
}

export function getPhone() {
    if (browser.versions.android) {
        return OSVersionType.android;
    } else if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) {
        return OSVersionType.ios;
    }
    return OSVersionType.iosAfter;
}
/**
 * 数组去重
 * @param a：原数组
 * @param b：对比数组（如果只想原数组去重，则b传空数组[]）
 */
export function distinct(a: any[], b: any[]) {
    let arr = a.concat(b);
    let result: any[] = [];
    let obj = {};
    for (let i of arr) {
        if (!obj[i]) {
            result.push(i);
            obj[i] = 1;
        }
    }
    return result;
}

/**
 * 将对象转换为字符串
 * @param obj：原对象
 * @param symbol：连接符号，默认为","
 */
export function transObjToString(obj: object, symbol: string = ",") {
    if (!obj) return;
    let string = "";
    Object.keys(obj).forEach((key) => {
        string = key + "=" + obj[key] + symbol;
    });
    return string;
}

/**
 * 判断数组中的对象的某个属性是否有重复，并返回对象
 * @param arr：原数组
 * @param key：判断重复的属性名
 * @returns 返回一个对象{ isRepeat, value }，其中，
 *          isRepeat：是否重复，
 *          value：如果有重复，则返回该值
 */
export function isExistInObj(arr: any[], key) {
    let isRepeat = false;
    let value;

    let hash = {},
        len = arr.length;
    while (len) {
        len--;
        if (hash[arr[len][key]]) {
            value = arr[len][key];
            isRepeat = true;
            break;
        } else {
            hash[arr[len][key]] = arr[len][key];
        }
    }
    return { isRepeat, value };
}

/**
 * 截取至限制字数
 * @param str 需要去除属性的字符串
 * @param limitNum 限制字数
 * @param isRemoveHtml 控制是否去除html属性(默认为true)
 */
export function getLimitSummary(str: string, limitNum?: number, isRemoveHtml: boolean = true) {
    let summary = isRemoveHtml ? removeHtmlAttribute(str) : str;

    if (!limitNum) return summary;

    if (limitNum) {
        if (summary.length <= limitNum) return summary;
        else {
            summary = summary.slice(0, limitNum - 3);
            return summary + "······";
        }
    }
}
/**
 * html相关属性去除
 * @param str 需要去除属性的字符串
 */
export function removeHtmlAttribute(str: string) {
    if (str == null || str === undefined) {
        return "";
    } else {
        const tem = str
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&nbsp;/g, "")
            .replace(/<\/?.+?\/?>/g, "")
            .replace(/<[^>]+>/g, "");

        return tem;
    }
}

/**
 * 多行文本提交前将回车转换为<br/>
 * @param commentContent 多行文本
 */
export function formatTextareaContent(commentContent: string) {
    if (!commentContent) return "";

    commentContent = commentContent.replace(/[\n]{1,}/g, "<br/>").replace(/\s*/g, "");

    while (commentContent.indexOf("<br/>") === 0) {
        commentContent = commentContent.replace("<br/>", "");
    }

    return commentContent;
}

/** 数组转换为树结构，
 * @param arr：原数组
 * @param idMap：树数组中的ID 在原数组中的属性名，默认为ID，
 * @param labelMap： 树数组中的label 在原数组中的属性名，默认为TagName，
 * @param valueMap： 树数组中的value 在原数组中的属性名，默认为TagValue，
 * @param parentidMap： 寻找父对象的属性名，默认为ParentID
 */
export function arrToTree(arr: any[], idMap: string = "id", labelMap: string = "tagName", valueMap: string = "tagValue", parentidMap: string = "parentId") {
    let result: any = [];

    if (!Array.isArray(arr)) {
        return result;
    }

    let map = {};

    arr.forEach((item) => {
        delete item.children;
        map[item[idMap]] = item;
        item.label = item[labelMap];
        item.value = item[valueMap];
    });

    arr.forEach((item) => {
        let parent = map[item[parentidMap]];
        if (parent) {
            (parent.children || (parent.children = [])).push(item);
        } else {
            result.push(item);
        }
    });

    return result;
}
/**
 * 自定义Toast弹出框,默认是感叹号+1秒停留
 */
 export function ToasSuccess(content, duration = 1000, icon?: "success" | "fail" | "loading" | React.ReactNode, success?: () => void) {
    Toast.show({
        icon: icon || "success",
        content: <div className="size-15 mt10 mb5 ml5 mr5">{content}</div>,
        duration,
        afterClose: success,
    });
}

/**
 * 自定义Toast弹出框,默认是感叹号+1秒停留
 */
export function ToastInfo(content, duration = 1000, icon?: "success" | "fail" | "loading" | React.ReactNode, success?: () => void) {
    Toast.show({
        icon: icon || <ExclamationOutline />,
        content: <div className="size-15 mt10 mb5 ml5 mr5">{content}</div>,
        duration,
        afterClose: success,
    });
}

export function getSlots(props: any = {}) {
    const slots = {};
    if (!props) return slots;
    const children = props.children;

    if (!children || children.length === 0) {
        return slots;
    }

    function addChildToSlot(name, child) {
        if (!slots[name]) slots[name] = [];
        slots[name].push(child);
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (!child) return;
            const slotName = (child.props && child.props.slot) || "default";
            addChildToSlot(slotName, child);
        });
    } else {
        let slotName = "default";
        if (children.props && children.props.slot) slotName = children.props.slot;
        addChildToSlot(slotName, children);
    }

    return slots;
}

export function getExtraAttrs(props = {}) {
    const extraAttrs = {};
    Object.keys(props).forEach((key) => {
        if (key.indexOf("data-") === 0 || key.indexOf("aria-") === 0 || key === "role") {
            extraAttrs[key] = props[key];
        }
    });
    return extraAttrs;
}
