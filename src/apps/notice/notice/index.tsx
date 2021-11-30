import React from "react";
import { router } from "dva";
import { Route } from "@reco-m/core-ui";
import { articleDetailNotificationRoutes, articleDetailRoutes } from "@reco-m/article";
import { activityDetailNotificationRoutes, activityDetailRoutes } from "@reco-m/activity";
import { policyserviceoriginaldetailsRoutes, policyserviceDetailsRoutes } from "@reco-m/policyservice";
import { orderDetailNotificationRoutes } from "@reco-m/order";
import { applyDetailNotificationRoutes } from "@reco-m/workorder-apply";
import { certifyDetailNotificationRoutes, certifyRoutes, certifyDetailRoutes } from "@reco-m/member-certify";

import { marketInDetailRoutes } from "@reco-m/workorder-market";
import { approvalDetailNotificationRoutes } from "@reco-m/member-manager";
import { msgReachRoutes } from "@reco-m/msgreach-msgreach";
import { surveyFormNoticeRoutes } from "@reco-m/survey";
import { accountHomeWhiteRoutes, circleDetailstopicRoutes } from "@reco-m/ipark-white-circle";
import { busynessBillDetailRoutes } from "@reco-m/busynessbill";
import { Notification } from "./notification";

import { NotificationList } from "./notification.list";

import { MyNotificationCountWhite } from "./my.notification.count.white";
import { NoticeList } from "./notice.list";
import { NoticeError } from "./notice.error";
export { Notification, NotificationList, MyNotificationCountWhite, NoticeList, NoticeError };

export function notificationRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/notification`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Notification.Page} />
                    <Route
                        path={`${match.path}/list/:type`}
                        render={({ match }) => (
                            <>
                                <Route path={match.path} component={NotificationList.Page} />
                                <router.Switch>
                                    {/* 信息触达 */}
                                    {msgReachRoutes(match)}
                                    {/* 订单 */}
                                    {orderDetailNotificationRoutes(match)}
                                    {/* 工单 */}
                                    {applyDetailNotificationRoutes(match)}
                                    {/* 资讯 */}
                                    {articleDetailRoutes(match)}
                                    {articleDetailNotificationRoutes(match)}
                                    {/* 活动 */}
                                    {activityDetailNotificationRoutes(match)}
                                    {activityDetailRoutes(match)}
                                    {/* 政策 */}
                                    {policyserviceoriginaldetailsRoutes(match)}
                                    {policyserviceDetailsRoutes(match)}
                                    {/* 认证 */}
                                    {certifyDetailNotificationRoutes(match)}
                                    {approvalDetailNotificationRoutes(match)}
                                    {certifyDetailRoutes(match)}
                                    {certifyRoutes(match)}
                                    {/* 入驻申请 */}
                                    {/* {myCheckInNotificationRoutes(match)} */}
                                    {/* 服务机构入驻 */}
                                    {marketInDetailRoutes(match)}
                                    {/* 个人主页 */}
                                    {accountHomeWhiteRoutes(match)}
                                    {/* {circleDetailsRoutes(match)} */}
                                    {/* 圈子动态详情 */}
                                    {circleDetailstopicRoutes(match)}
                                    {/* 问卷 */}
                                    {surveyFormNoticeRoutes(match)}
                                    {/* 企业账单*/}
                                    {busynessBillDetailRoutes(match)}
                                    {errorRoutes(match)}
                                </router.Switch>
                            </>
                        )}
                    />
                </>
            )}
        />
    );
}
export function errorRoutes(match: router.match) {
    return <Route path={`${match.path}/*`} component={NoticeError.Page} />;
}
export function noticeListRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/noticelist`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={NoticeList.Page} />
                    {articleDetailRoutes(match)}
                </>
            )}
        />
    );
}
