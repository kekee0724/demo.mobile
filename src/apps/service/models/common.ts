import { ResourceTypeEnum } from "@reco-m/ipark-common";
export enum Namespaces {
  serviceHome = "iparkserviceHome"
}

export const SERVICE_DATAS = [
  {
    iconUrl: "icon icon-yonghu color-0",
    moduleName: `访客预约`,
    routeKey: `visitor`,
    openType: 0,
    id: 14
  },
  {
    iconUrl: "icon icon-huiyishiyuding color-1",
    moduleName: `停车位申请`,
    routeKey: `parking/apply`,
    openType: 0,
    id: 11
  },
  {
    iconUrl: "icon  icon-huiyishi color-2",
    moduleName: `会议室预订`,
    routeKey: `resource/room/${ResourceTypeEnum.meeting}`,
    openType: 0,
    id: 8
  },
  {
    iconUrl: "icon  icon-gongweichuzu color-3",
    moduleName: `工位预订`,
    routeKey: `resource/position/${ResourceTypeEnum.working}`,
    openType: 0,
    id: 7
  },
  {
    iconUrl: "icon icon-guanggaoweiyuding color-4",
    moduleName: `广告位`,
    routeKey: `resource/position/${ResourceTypeEnum.advertisement}`,
    openType: 0,
    id: 9
  },
  {
    iconUrl: "icon icon-tingcheyuyue color-5",
    moduleName: `停车预约`,
    routeKey: `parking/order`,
    openType: 0,
    id: 12
  },
  {
    iconUrl: "icon  icon-shenqing color-6",
    moduleName: `入驻申请`,
    routeKey: `checkin`,
    openType: 0,
    id: 6
  },
  {
    iconUrl: "icon icon-qita color-0",
    moduleName: `更多`,
    route: "service"
  }
];

export function isEqual(menu: any, menus: any[]) {
  return menus.find((m) => m.id === menu.id) ? 0 : -1
}

// 可编辑的Item最大数
export const MAX_ITEM_NUM = 7
