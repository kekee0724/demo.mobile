import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { About } from "./about";

import { AboutVersion } from "./about.version";

export { About, AboutVersion };

export function aboutRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/about`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={About.Page} />
                    <Route path={`${match.path}/version`} component={AboutVersion.Page} />
                </>
            )}
        />
    );
}
