import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";

import { postionDetailsRoutes, roomDetailSpaceRoutes } from "@reco-m/order";

import { certifyRoutes } from "@reco-m/member-certify";

import { loginRoutes } from "@reco-m/ipark-auth-login";

import { SpaceDetail } from "./space.detail";

export { SpaceDetail };

export function spaceRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/space`}
            render={({ match }) => (
                <>
                    <Route
                        path={`${match.path}/spacedetail/:id`}
                        render={({ match }) => (
                            <>
                                <Route path={match.path} component={SpaceDetail.Page} />
                                {postionDetailsRoutes(match)}
                                {roomDetailSpaceRoutes(match)}
                                {certifyRoutes(match)}
                            </>
                        )}
                    />
                    {loginRoutes(match)}
                </>
            )}
        />
    );
}
