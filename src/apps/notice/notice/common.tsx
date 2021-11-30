import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export function getStyle(colorValue) {
    let value = colorValue % 4,
        color = value === 0 ? "#478ee6" : value === 1 ? "#f86c51" : "#27c0dc",
        style = { background: color };
    return style;
}

export function titleText(arr: any[] = [], sceneName) {
    let text;
    arr.forEach(s => {
        if (s.sceneName === sceneName) {
            text = s.sceneName;
        }
    });
    return text;
}

export function iconFont(data, id) {
    let icon = "icon icon-duanxin";
    data.forEach(s => {
        if (s.id === id) {
            icon = s.iconUrl;
        }
    });
    return icon + " backs";
}

export function goDetail(item) {
    let path;
    if (item.message && item.message.bindTableName === IParkBindTableNameEnum.activity) {
        /**
         * 活动
         */
        path = "activityDetail/" + item.message.bindTableId;
    } else if (item.message && item.message.bindTableName === IParkBindTableNameEnum.article) {
        path = "articleDetail/" + item.message.bindTableId;
    } else if (item.message && item.message.bindTableName === IParkBindTableNameEnum.policy) {
        path = "policyDetail/" + item.message.bindTableId;
    } else if (item.message.bindTableName === IParkBindTableNameEnum.order) {
        /**
         * 订单
         */
        if (item.message.subject.includes("企业")) {
            path = "certify/detail/" + item.message.bindTableId;
        } else if (item.message.subject.indexOf("员工") > -1) {
            if (item.message.subject.indexOf("退回") > -1 || item.message.subject.indexOf("成功") > -1) {
                /**
                 * 退回
                 */
                path = "certify/progress/" + item.message.bindTableId;
            } else {
                path = "approval/detail/" + item.message.bindTableId;
            }
        } else {
            path = "applyDetail/" + item.message.bindTableId + "/0";
        }
    }
    return path;
}
