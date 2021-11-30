import React from "react";

import { Route } from "@reco-m/core-ui";

import { searchRoutes } from "@reco-m/search";
import { contactRoutes } from "@reco-m/contact";
import { certifyRoutes, certifyDetailRoutes, certifyDetailNotificationRoutes } from "@reco-m/member-certify";
import { notificationRoutes, noticeListRoutes } from "@reco-m/notice-notice";

import { articleHomeRoutes, articleDetailRoutes, articleDetailNotificationRoutes } from "@reco-m/article";

import { activityDetailRoutes, activityDetailNotificationRoutes } from "@reco-m/activity";
import { consultRoutes } from "@reco-m/workorder-consult";
import { surveyRoutes } from "@reco-m/survey";
import { positionRoutes, roomRoutes, roomDetailHomeRoutes } from "@reco-m/order";

import { marketRoutes, productRoutes } from "@reco-m/workorder-market";
import { routes as workorderRoutes } from "@reco-m/workorder";

import { policyListRoutes, policyMatchingDetailNotificationRoutes } from "@reco-m/policymatching-policymatching";

import { approvalDetailNotificationRoutes } from "@reco-m/member-manager";

import { loginRoutes } from "@reco-m/ipark-auth-login";

import { impressionRoutes } from "@reco-m/ipark-white-impression";

import { policyMatchingDetailRoutes } from "@reco-m/policymatching-policymatching";

import { policyserviceRoutes, policyserviceDetailsRoutes, policyserviceoriginaldetailsRoutes } from "@reco-m/policyservice";

import { applyDetailRoutes } from "@reco-m/workorder-apply";

import { HomeNew } from "./home.white";

import { HomeNewbanner } from "./Home.banner.white";

export { HomeNew, HomeNewbanner };

export const routes = ({ match }) => (
    <>
        <Route path={match.path} component={HomeNew.Page} />
        {contactRoutes(match)}
        {searchRoutes(match)}

        {certifyRoutes(match)}
        {certifyDetailRoutes(match)}
        {consultRoutes(match)}
        {surveyRoutes(match)}
        {positionRoutes(match)}
        {roomRoutes(match)}
        {roomDetailHomeRoutes(match)}
        {marketRoutes(match)}
        {productRoutes(match)}
        {workorderRoutes(match)}
        {impressionRoutes(match)}
        {policyListRoutes(match)}
        {applyDetailRoutes(match)}
        {/* 工单 */}
        {articleHomeRoutes(match)}
        {/* 资讯 */}
        {articleDetailRoutes(match)}
        {/* 资讯 */}
        {articleDetailNotificationRoutes(match)}
        {activityDetailRoutes(match)}
        {activityDetailNotificationRoutes(match)}
        {policyMatchingDetailNotificationRoutes(match)}

        {certifyDetailNotificationRoutes(match)}
        {approvalDetailNotificationRoutes(match)}
        {loginRoutes(match)}

        {/* 我的消息 */}
        {notificationRoutes(match)}
        {/* 政策详情 */}
        {policyMatchingDetailRoutes(match)}
        {/* 通知 */}
        {noticeListRoutes(match)}

        {/* 政策服务 */}
        {policyserviceRoutes(match)}
        {policyserviceDetailsRoutes(match)}
        {policyserviceoriginaldetailsRoutes(match)}
    </>
);
