import React from "react";

import { router} from "dva";

import { Route } from "@reco-m/core-ui";

import { AccountViewWhite } from "./account.view";

import { AccountViewEditInput } from "./account.edit";

import {AccountViewInterest} from "./account.interest"

export { AccountViewWhite, AccountViewEditInput, AccountViewInterest };

export function accountInfoIparkWhiteRoutes(match: router.match) {
    return (
        <Route
            key="info"
            path={`${match.path}/info`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={AccountViewWhite.Page} />
                    <Route path={`${match.path}/edit/:type/:name`} component={AccountViewEditInput.Page} />
                </>
            )}
        />
    );
}

