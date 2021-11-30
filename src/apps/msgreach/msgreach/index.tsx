import React from "react";

import { Route } from "@reco-m/core-ui";

import { loginRoutes } from "@reco-m/ipark-auth-login";

import { activityDetailRoutes } from "@reco-m/activity";

import { articleDetailRoutes } from "@reco-m/article";

import { policyMatchingDetailRoutes } from "@reco-m/policymatching-policymatching";

import { policyserviceoriginaldetailsRoutes, policyserviceDetailsRoutes } from "@reco-m/policyservice";

import { NoticeError } from "./error";

import { MsgReach } from "./msgreach";
import { surveyFormNoticeRoutes } from "@reco-m/survey";

export { MsgReach };

export const routes = ({ match }) => (
    <>
        <Route path={match.path} component={MsgReach.Page} />
        <Route path={`${match.path}/error`} component={NoticeError.Page} />
        {loginRoutes(match)}
        {/* 活动 */}
        {activityDetailRoutes(match)}
        {/* 资讯 */}
        {articleDetailRoutes(match)}
        {/* 政策 */}
        {policyMatchingDetailRoutes(match)}
        {policyserviceoriginaldetailsRoutes(match)}
        {policyserviceDetailsRoutes(match)}
        {/* 问卷 */}
        {surveyFormNoticeRoutes(match)}
    </>
);
export function msgReachRoutes(match) {
    return <Route path={`${match.path}/msgreach`} render={({ match }) => <Route path={match.path} component={MsgReach.Page} />} />;
}
