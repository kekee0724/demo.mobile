import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { activityDetailRoutes } from "@reco-m/activity";

import { articleDetailRoutes } from "@reco-m/article";

import { marketDetailRoutes, productDetailRoutes } from "@reco-m/workorder-market";

import { postionDetailsRoutes, roomDetailSpaceRoutes } from "@reco-m/order";

// import { policyMatchingDetailRoutes } from "@reco-m/policymatching-policymatching";

import { circleDetailstopicRoutes } from "@reco-m/ipark-white-circle";

import {  policyserviceDetailsRoutes, policyserviceoriginaldetailsRoutes} from "@reco-m/policyservice";

import { Favorites } from "./favorites";

export { Favorites };

export function favoritesRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/favorites`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Favorites.Page} />
                    {activityDetailRoutes(match)}
                    {articleDetailRoutes(match)}
                    {marketDetailRoutes(match)}
                    {/* {policyMatchingDetailRoutes(match)} */}
                    {postionDetailsRoutes(match)}
                    {roomDetailSpaceRoutes(match)}
                    {productDetailRoutes(match)}
                    {circleDetailstopicRoutes(match)}
                    {policyserviceDetailsRoutes(match)}
                    {policyserviceoriginaldetailsRoutes(match)}
                </>
            )}
        />
    );
}
