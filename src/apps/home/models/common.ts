export enum Namespaces {
    home = "home"
}

export function closest(el, selector) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

export const data = [
    {
        icon: "icon icon-saomiao",
        text: "扫一扫",
        route: "saoyisao"
    },
    {
        icon: "icon icon-qiahaoshezhi",
        text: "一卡通",
        route: "card"
    },
    {
        icon: "icon icon-door_03",
        text: "门禁卡",
        route: "access"
    },
    {
        icon: "icon icon-tongxunlu",
        text: "通讯录",
        route: "contact"
    }
];

export const servicedata = [
    {
        iconUrl: "icon icon-gongweiyuding color-1",
        moduleName: "工位预订",
        routeKey: "reservation"
    },
    {
        iconUrl: "icon  icon-huiyishi color-2",
        moduleName: "会议室预订",
        routeKey: "reservation"
    },
    {
        iconUrl: "icon  icon-guanggao color-3",
        moduleName: "广告位预订",
        routeKey: "reservation"
    },
    {
        iconUrl: "icon icon-changdiyuding color-4",
        moduleName: "场地预订",
        routeKey: "reservation"
    },
    {
        iconUrl: "icon icon-tingcheyuyue color-5",
        moduleName: "停车预约"
    },
    {
        iconUrl: "icon icon-yonghu color-8",
        moduleName: "访客预约",
        routeKey: "visitor"
    },
    {
        iconUrl: "icon  icon-baoxiu color-7",
        moduleName: "物业报修",
        routeKey: "repair"
    },
    {
        iconUrl: "icon icon-qita color-0",
        moduleName: "更多",
        routeKey: "service"
    }
];

export function config(parkId, parkName) {
    let data = {
        memberRoleId: 1,
        memberRole: "公众会员",
        accountId: this.props.state.currentUser.id,
        currentParkName: parkName,
        currentParkId: parkId,
        memberRoleTagValue: 1
    };
    this.props.config(data);
}
