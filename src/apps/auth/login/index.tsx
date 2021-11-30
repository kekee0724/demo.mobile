import React from "react";

import { router } from "dva";

import { Route } from "@reco-m/core-ui";

import { changePasswordRoutes, changeBindMobileRoutes } from "@reco-m/auth-account";

import { AgreementComponent, RepasswordBefore, Login } from "@reco-m/auth-login";

import { AgreementIparkComponent, TacticsComponent, LoginWhite, Code, Phone, changePasswordWhiteRoutes, pChangePasswordRoutes } from "@reco-m/ipark-white-login";

import "@reco-m/ipark-auth-models";

export { AgreementComponent, RepasswordBefore };

export const routes = ({ match }, renderRoutes?: (match: router.match) => JSX.Element | JSX.Element[] | null) => {
    renderRoutes = typeof renderRoutes === "function" ? renderRoutes : () => null;
    return (
        <>
            <Route path={match.path} component={Login.Page} />
            <router.Switch>
                <Route path={`${match.path}/agreement`} component={AgreementIparkComponent} />
                <Route path={`${match.path}/tactics`} component={TacticsComponent} />
                <Route
                    path={`${match.path}/find`}
                    render={({ match }) => (
                        <router.Switch>
                            {changePasswordRoutes(match)}
                            <Route path={match.path} component={RepasswordBefore.Page} />
                        </router.Switch>
                    )}
                />
                {renderRoutes(match)}
                {changeBindMobileRoutes(match)}
                {pChangePasswordRoutes(match)}
            </router.Switch>
        </>
    );
};

export function loginRoutes(match: router.match) {
    return  <Route
    path={`${match.path}/login`}
    render={({ match }) => (
        <>
            <Route path={match.path} component={LoginWhite.Page} />
            <Route path={`${match.path}/agreement`} component={AgreementIparkComponent} />
            <Route path={`${match.path}/tactics`} component={TacticsComponent} />
            <Route
                path={`${match.path}/find`}
                render={({ match }) => (
                    <>
                        {changePasswordWhiteRoutes(match)}
                        <Route path={match.path} component={Phone.Page} />
                    </>
                )}
            />
            {changeBindMobileRoutes(match)}
            {pChangePasswordRoutes(match)}
            <Route path={`${match.path}/code`} component={Code.Page} />
            <Route path={`${match.path}/phone`} component={Phone.Page} />
        </>
    )}
/>
}

