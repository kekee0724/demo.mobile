import React from "react";

import { Route } from "@reco-m/core-ui";

import { h5Home } from "@reco-m/h5home-h5home";
import { applyRoutes, myVisitorRoutes, marketServiceApplyRoutes, applyDetailRoutes } from "@reco-m/workorder-apply";
import { routes as workorderRoutes } from "@reco-m/workorder";
import { policyserviceRoutes, policyserviceDetailsRoutes, policyserviceoriginaldetailsRoutes, policyserviceMysRoutes, policyserviceOrderRoutes } from "@reco-m/policyservice";
import { productRoutes, marketRoutes } from "@reco-m/workorder-market";
export const routes = ({ match }) => (
    <>
        <Route path={match.path} component={h5Home.Page} />
        {/* 工单 */}
        {applyRoutes(match)}
        {myVisitorRoutes(match)}
        {marketServiceApplyRoutes(match)}
        {workorderRoutes(match)}
        {applyDetailRoutes(match)}

        {/* 政策服务 */}
        {policyserviceRoutes(match)}
        {policyserviceDetailsRoutes(match)}
        {policyserviceoriginaldetailsRoutes(match)}
        {policyserviceMysRoutes(match)}
        {policyserviceOrderRoutes(match)}

        {/* 服务产品 */}
        {productRoutes(match)}
        {/* 服务机构 */}
        {marketRoutes(match)}
    </>
);
