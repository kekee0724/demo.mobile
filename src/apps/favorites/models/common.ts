import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export enum Namespaces {
  favorites = "favorites",
  favoritesCount = "favoritesCount",
  favoritesButton = "favoritesButton"
}

/**
 * 园区侧边栏
 */
export const menuList = [
  { tagName: "政策", bindTableName: IParkBindTableNameEnum.policy },
  { tagName: "活动", bindTableName: IParkBindTableNameEnum.activity },
  { tagName: "动态", bindTableName: IParkBindTableNameEnum.post },
  { tagName: "资讯", bindTableName: IParkBindTableNameEnum.article },
  { tagName: "机构", bindTableName: IParkBindTableNameEnum.institution },
  { tagName: "产品", bindTableName: IParkBindTableNameEnum.product },
  { tagName: "资源", bindTableName: IParkBindTableNameEnum.resource }
];


/**
 * 判断返回收藏类型
 */
export function checkFollowType(item) {
  let type = "";
  if (item.bindTableName === IParkBindTableNameEnum.activity) {
    type = "活动";
  } else if (item.bindTableName === IParkBindTableNameEnum.institution) {
    type = "机构";
  } else if (item.bindTableName === IParkBindTableNameEnum.article) {
    type = "资讯";
  } else if (item.bindTableName === IParkBindTableNameEnum.product) {
    type = "产品";
  } else if (item.bindTableName === IParkBindTableNameEnum.policy) {
    type = "政策";
  } else if (item.bindTableName === IParkBindTableNameEnum.post) {
    type = "动态";
  } else if (item.bindTableName === IParkBindTableNameEnum.policyService) {
    type = "政策细则";
  } else {
    type = "资源";
  }
  return type;
}


