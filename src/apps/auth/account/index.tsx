import React from "react";

import {router} from "dva";
import { Route } from "@reco-m/core-ui";

import { changePasswordRoutes, AccountChangeMobile, AccountSocial } from "@reco-m/auth-account";

import { gesturesRoutes } from "@reco-m/auth-gestures";

import {changePasswordWhiteRoutes, AccountChangeMobileWhite} from "@reco-m/ipark-white-login"

import { AccountSafe } from "./account.safe";


export { AccountSafe };

export function accountSafeIparkRoutes(match: router.match, children?: (match: router.match) => JSX.Element | JSX.Element[]) {
    return (
        <Route
            path={`${match.path}/safe`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={AccountSafe.Page} />
                    {changePasswordRoutes(match)}
                    <Route path={`${match.path}/changeMobile`} component={AccountChangeMobile.Page} />
                    <Route path={`${match.path}/social`} component={AccountSocial.Page} />;
                    <router.Switch>
                        {gesturesRoutes(match)}
                        {children ? children(match) : null}
                    </router.Switch>
                </>
            )}
        />
    );
}
export function accountSafeIparkWhiteRoutes(match: router.match, children?: (match: router.match) => JSX.Element | JSX.Element[]) {
    return (
        <Route
            path={`${match.path}/safe`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={AccountSafe.Page} />
                    {changePasswordWhiteRoutes(match)}
                    <Route path={`${match.path}/changeMobile`} component={AccountChangeMobileWhite.Page} />
                    <Route path={`${match.path}/social`} component={AccountSocial.Page} />;
                    <router.Switch>
                        {gesturesRoutes(match)}
                        {children ? children(match) : null}
                    </router.Switch>
                </>
            )}
        />
    );
}
