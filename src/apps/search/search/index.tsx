import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import "@reco-m/search-models";

import { articleDetailRoutes, articleHomeRoutes } from "@reco-m/article";

import { activityDetailRoutes } from "@reco-m/activity";
import { activityRoutes } from "@reco-m/ipark-white-activity";

import { circleDetailsRoutes, circleListRoutes } from "@reco-m/ipark-white-circle";

import { policyMatchingDetailRoutes, policyListRoutes } from "@reco-m/policymatching-policymatching";

import { productRoutes, productDetailRoutes, marketDetailRoutes, marketRoutes } from "@reco-m/workorder-market";
import { applyRoutes } from "@reco-m/workorder-apply";
import { routes as workorderRoutes } from "@reco-m/workorder";

import { roomSearchDetailSpaceRoutes, roomRoutes, orderRoutes, postionSearchDetailsRoutes, positionRoutes } from "@reco-m/order";
import { notificationRoutes, noticeListRoutes } from "@reco-m/notice-notice";

import { certifyRoutes } from "@reco-m/member-certify";

import { loginRoutes } from "@reco-m/ipark-auth-login";

import { consultRoutes } from "@reco-m/workorder-consult";
import { surveyRoutes } from "@reco-m/survey";
import { policyserviceRoutes, policyserviceDetailsRoutes, policyserviceoriginaldetailsRoutes } from "@reco-m/policyservice";
import { Search } from "./search";

export { Search };

export function searchRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/search`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Search.Page} />
                    {circleDetailsRoutes(match)}
                    {articleDetailRoutes(match)}
                    {noticeListRoutes(match)}
                    {activityDetailRoutes(match)}
                    {policyMatchingDetailRoutes(match)}
                    {productRoutes(match)}
                    {marketRoutes(match)}
                    {marketDetailRoutes(match)}
                    {productDetailRoutes(match)}

                    {orderRoutes(match)}
                    {applyRoutes(match)}
                    {workorderRoutes(match)}
                    {roomSearchDetailSpaceRoutes(match)}
                    {postionSearchDetailsRoutes(match)}

                    {roomRoutes(match)}
                    {activityRoutes(match)}
                    {articleHomeRoutes(match)}
                    {policyListRoutes(match)}
                    {positionRoutes(match)}

                    {notificationRoutes(match)}
                    {loginRoutes(match)}
                    {circleListRoutes(match)}

                    {certifyRoutes(match)}

                    {consultRoutes(match)}

                    {surveyRoutes(match)}
                    {policyListRoutes(match)}
                    {policyMatchingDetailRoutes(match)}
                    {roomRoutes(match)}
                    {positionRoutes(match)}
                    {certifyRoutes(match)}

                    {marketRoutes(match)}

                    {productRoutes(match)}

                    {loginRoutes(match)}
                    {workorderRoutes(match)}

                    {/* 政策服务 */}
                    {policyserviceRoutes(match)}
                    {policyserviceDetailsRoutes(match)}
                    {policyserviceoriginaldetailsRoutes(match)}
                </>
            )}
        />
    );
}
