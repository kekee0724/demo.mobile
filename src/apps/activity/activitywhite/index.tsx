import React from "react";

import { ActivityDiscover } from './activity.white'

import { ActivityHome } from './activity.home.white'

import { router} from "dva";

import { Route } from "@reco-m/core-ui";

import { activityDetailRoutes } from "@reco-m/activity";

export { ActivityDiscover, ActivityHome };

export function activityRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/activity`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={ActivityDiscover.Page} />
                    {activityDetailRoutes(match)}
                </>
            )}
        />
    );
}
