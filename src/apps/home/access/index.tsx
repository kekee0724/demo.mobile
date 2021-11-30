import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";
import "@reco-m/my-models";

import { Access } from "./access";

import { AccessCard } from "./access.card";

export { Access, AccessCard };

export function accessRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/access`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Access.Page} />
                    <Route path={`${match.path}/accessCard`} component={AccessCard.Page} />
                </>
            )}
        />
    );
}
