import React from "react";
import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { loginRoutes } from "@reco-m/ipark-auth-login";
import { certifyCompanyFormRoutes, certifyDetailRoutes } from "@reco-m/member-certify";
import { routes as workorderRoutes } from "@reco-m/workorder";
import { PolicyService } from "./policyservice";
import { PolicyServiceHome } from "./policyservice.home";
import { PolicyserviceDetails } from "./policyservice.detail";
import { PolicyserviceOriginalDetails } from "./policyservice.original.detail";
import {PolicyServiceMy} from "./policyservice.my"
import {PolicyServiceOrder} from "./policyservice.order"
import {PolicyServiceOrderManager} from "./policyservice.order.manager"

export { PolicyService, PolicyServiceHome, PolicyserviceDetails, PolicyserviceOriginalDetails, PolicyServiceMy };

export function policyserviceRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/policyservice`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PolicyService.Page} />
                    {policyserviceDetailsRoutes(match)}
                    {loginRoutes(match)}
                    {certifyCompanyFormRoutes(match)}
                    {certifyDetailRoutes(match)}
                    {workorderRoutes(match)}
                </>
            )}
        />
    );
}
export function policyserviceDetailsRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/policyservicedetails/:id`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PolicyserviceDetails.Page} />

                    {policyserviceoriginaldetailsRoutes(match)}
                    {loginRoutes(match)}
                </>
            )}
        />
    );
}
export function policyserviceoriginaldetailsRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/policyserviceoriginaldetails/:policyId`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PolicyserviceOriginalDetails.Page} />
                    {loginRoutes(match)}
                    {workorderRoutes(match)}
                </>
            )}
        />
    );
}
export function policyserviceMysRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/policyservicemy`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PolicyServiceMy.Page} />
                </>
            )}
        />
    );
}
export function policyserviceOrderRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/policyserviceorder`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PolicyServiceOrder.Page} />
                    {policyserviceOrderManagerRoutes(match)}
                    {policyserviceoriginaldetailsRoutes(match)}
                    {policyserviceDetailsRoutes(match)}
                </>
            )}
        />
    );
}
export function policyserviceOrderManagerRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/policyserviceordermanager`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PolicyServiceOrderManager.Page} />
                </>
            )}
        />
    );
}
