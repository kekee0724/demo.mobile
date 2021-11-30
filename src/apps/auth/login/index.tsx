import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { changePasswordRoutes, changeBindMobileRoutes, pChangePasswordRoutes } from "@reco-m/auth-account";

import { Login } from "./login";

import { AgreementComponent } from "./login.agreement";

import { RepasswordBefore } from "./login.repassword.before";

export { Login, AgreementComponent, RepasswordBefore };

export const routes = ({ match }, renderRoutes?: (match: router.match) => React.ReactNode) => {
    renderRoutes = typeof renderRoutes === "function" ? renderRoutes : () => null;
    return (
        <>
            <Route path={match.path} component={Login.Page} />
            <router.Switch>
                <Route path={`${match.path}/agreement`} component={AgreementComponent} />
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
