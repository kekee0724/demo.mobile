import React from "react";

import {  router} from "dva";
import { Route } from "@reco-m/core-ui";

import { routes as workorderRoutes } from "@reco-m/workorder";

import { SpaceDetail } from "@reco-m/space";
import { ImpressionWhite } from "./impression.white";
import { postionDetailsRoutes, roomDetailSpaceRoutes } from "@reco-m/order";

import { certifyRoutes } from "@reco-m/member-certify";
import { loginRoutes } from "@reco-m/ipark-auth-login";
import { applyDetailRoutes } from "@reco-m/workorder-apply";
export { ImpressionWhite };

export function impressionRoutes(match: router.match) {
    return (
        <Route path={`${match.path}/impression`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={ImpressionWhite.Page} />
                    <Route
                        path={`${match.path}/spacedetail/:id`}
                        render={({ match }) => (
                            <>
                                <Route path={match.path} component={SpaceDetail.Page} />
                                {postionDetailsRoutes(match)}
                                {roomDetailSpaceRoutes(match)}
                                {certifyRoutes(match)}
                                {workorderRoutes(match)}
                                {loginRoutes(match)}
                            </>
                        )}
                    />
                    {workorderRoutes(match)}
                    {loginRoutes(match)}
                    {applyDetailRoutes(match)}
                </>
            )}
        />
    )
};
