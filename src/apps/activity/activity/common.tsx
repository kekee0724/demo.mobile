import React from "react";

import { Badge } from "antd-mobile-v2";

import { ActivityTypeEnum, BadgeEnum } from "@reco-m/activity-models";

export function renderBadge(data: any) {
  return data && data.status === ActivityTypeEnum.signUp ? (
    <Badge style={{ background: "#ff9a1b" }} className="badge-parkRight" text={<span>{BadgeEnum.registration}</span>} />
  ) : data && data.status === ActivityTypeEnum.onGoing ? (
    <Badge className="badge-parkRight" text={<span>{BadgeEnum.equal}</span>} />
  ) : data && data.status === ActivityTypeEnum.finish ? (
    <Badge style={{ background: "#ccc" }} className="badge-parkRight" text={<span>{BadgeEnum.over}</span>} />
  ) : data && data.isValid === false ? (
    <Badge style={{ background: "#ccc" }} className="badge-parkRight" text={<span>{BadgeEnum.released}</span>} />
  ) : null;
}
export function renderBadgetext(data: any) {
  return data && data.status === ActivityTypeEnum.signUp ? (
    <span className={"activity-tag type1"}>{BadgeEnum.registration}</span>
  ) : data && data.status === ActivityTypeEnum.onGoing ? (
    <span className={"activity-tag type2"}>{BadgeEnum.equal}</span>
  ) : data && data.status === ActivityTypeEnum.finish ? (
    <span className={"activity-tag type3"}>{BadgeEnum.over}</span>
  ) : data && data.isValid === false ? (
    <span className={"activity-tag type3"}>{BadgeEnum.released}</span>
  ) : null;
}
export const tabs = [
  { title: <Badge>全部</Badge>, status: "" },
  { title: <Badge>待参加</Badge>, status: ActivityTypeEnum.signUp },
  { title: <Badge>待审核</Badge>, status: ActivityTypeEnum.onGoing },
  { title: <Badge>待支付</Badge>, status: ActivityTypeEnum.signUp },
  { title: <Badge>已取消</Badge>, status: ActivityTypeEnum.onGoing },
  { title: <Badge>已结束</Badge>, status: ActivityTypeEnum.finish },
];
