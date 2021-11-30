import { ResourceTypeEnum } from "@reco-m/ipark-common";
/**
 * 服务菜单改为在后台配置
 */
export const DATA = [
    {
        icon: "icon icon-shenqing color-0",
        text: `入驻申请`,
        route: `checkin`
    },
    {
        icon: "icon icon-gongweiyuding color-1",
        text: `工位预订`,
        route: `advertising`
    },
    {
        icon: "icon  icon-huiyishi color-2",
        text: `会议室预订`,
        route: `resource/room/${ResourceTypeEnum.meeting}`
    },
    {
        icon: "icon  icon-guanggao color-3",
        text: `广告位预订`,
        route: `advertising`
    },
    {
        icon: "icon icon-changdiyuding color-4",
        text: `场地预订`,
        route: `resource/room/${ResourceTypeEnum.square}`
    },
    {
        icon: "icon icon-huiyishiyuding color-5",
        text: `停车位申请`,
        route: `parking/apply`
    },
    {
        icon: "icon  icon-tingcheyuyue color-6",
        text: `停车预约`,
        route: `parking/order`
    },
    {
        icon: "icon  icon-baoxiu color-7",
        text: `物业报修`,
        route: "repair"
    },
    {
        icon: "icon icon-yonghu color-8",
        text: `访客预约`,
        route: "visitor"
    },
    {
        icon: "icon icon-zhengce color-9",
        text: `政策解读`,
        route: `policy`
    },
    {
        icon: "icon  icon-ruzhu1 color-10",
        text: `服务机构入驻`,
        route: `marketIn`
    },
    {
        icon: "icon icon-svg08 color-5",
        text: `园区咨询`,
        route: "consult"
    },
    {
        icon: "icon icon-tijiao color-6",
        text: `需求提报`,
        route: "demand"
    },
    {
        icon: "icon  icon-wenjuan color-7",
        text: `问卷调研`,
        route: `survey/${0}`
    },
    {
        icon: "icon icon-more color-8",
        text: `物业投诉`,
        route: "complain"
    }
];

export const SERVICE_MARKET_ICONS = [
    "icon-yongzhang color-10",
    "icon-Ts color-7",
    "icon-falv color-6",
    "icon-peixun color-5",
    "icon-icon1222 color-4",
    "icon-chuangyi color-3",
    "icon-zhishi color-2",
    "icon-gengduo1 color-1"
];

// 可编辑的Item最大数
export const MAX_ITEM_NUM = 7;

export function isEqual(menu: any, menus: any[]) {
  return menus.find((m) => m.id === menu.id) ? 0 : -1
}

export function handleModule(modules: any) {
  let data = [{
    iconUrl: '',
    moduleName: '',
    routeKey: '',
    id: "",
    openType: ""
  }];
  data.pop()
  for (let i = 0; i < modules.length; i++) {
    let module = modules[i];
    data.push({
      iconUrl: module.iconUrl,
      moduleName: module.moduleName,
      routeKey: module.routeKey,
      id: module.id,
      openType: module.openType
    })
  }
  return data;
}

