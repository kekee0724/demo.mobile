import React from "react";
import { Route } from "@reco-m/core-ui";
import { consultRoutes } from "@reco-m/workorder-consult";
import { surveyRoutes } from "@reco-m/survey";
import { policyListRoutes, policyMatchingDetailRoutes } from "@reco-m/policymatching-policymatching";
import { positionRoutes, roomRoutes } from "@reco-m/order";
import { certifyRoutes } from "@reco-m/member-certify";
import { marketRoutes, productRoutes, marketauthRoutes } from "@reco-m/workorder-market";
import { routes as workorderRoutes } from "@reco-m/workorder";
import { loginRoutes } from "@reco-m/ipark-auth-login";

import { applyDetailRoutes } from "@reco-m/workorder-apply";

import { policyserviceRoutes, policyserviceDetailsRoutes, policyserviceoriginaldetailsRoutes } from "@reco-m/policyservice";

import { ServiceHome } from "./serviceHome";

export { ServiceHome };

export * from "./common";

export const routes = ({ match }) => (
    <>
        <Route path={match.path} component={ServiceHome.Page} />
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
        {marketauthRoutes(match)}
        {applyDetailRoutes(match)}

        {/* 政策服务 */}
        {policyserviceRoutes(match)}
        {policyserviceDetailsRoutes(match)}
        {policyserviceoriginaldetailsRoutes(match)}
    </>
);
