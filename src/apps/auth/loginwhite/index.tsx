import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";
import { changeBindMobileRoutes } from "@reco-m/auth-account";
import { AgreementIparkComponent } from "./login.agreement";
import {TacticsComponent} from "./login.tactics";
import { LoginWhite } from "./loginwhite";
import { Code } from "./code";
import { Phone } from "./phone";
import { AccountChangePasswordWhite } from "./account.password.white"
import { AccountChangeMobileWhite } from "./account.mobile.white"
import {Countdownauto} from "./countdownauto"
import { AuthBindModal } from "./auth.bind.modal"
import { ChangePasswordIpark} from "./change.password"
export * from "./common"
export { LoginWhite, Code, Phone, AccountChangeMobileWhite, AgreementIparkComponent, TacticsComponent, Countdownauto, AuthBindModal };

export const routes = ({ match }, renderRoutes?: (match: router.match) => JSX.Element | JSX.Element[] | null) => {
    renderRoutes = typeof renderRoutes === "function" ? renderRoutes : () => null;
    return (
        <>
            <Route path={match.path} component={LoginWhite.Page} />
            <router.Switch>
                <Route path={`${match.path}/agreement`} component={AgreementIparkComponent} />
                <Route path={`${match.path}/tactics`} component={TacticsComponent} />
                <Route
                    path={`${match.path}/find`}
                    render={({ match }) => (
                        <router.Switch>
                            {changePasswordWhiteRoutes(match)}
                            <Route path={match.path} component={Phone.Page} />
                        </router.Switch>
                    )}
                />
                {renderRoutes(match)}
                {changeBindMobileRoutes(match)}
                {pChangePasswordRoutes(match)}
                <Route path={`${match.path}/code`} component={Code.Page} />
                <Route path={`${match.path}/phone`} component={Phone.Page} />
            </router.Switch>
        </>
    );
};
export function pChangePasswordRoutes(match: router.match) {
    return <Route path={`${match.path}/pchangePassword/:type`} component={ChangePasswordIpark.Page} />;
}

export const authChangeBindMobileRoutes = ({ match }) => (
    <Route
      path={`${match.path}/authBind`}
      render={({ match }) => (
        <Route path={match.path} component={AuthBindModal.Page} />
      )}
    />
  );

export function changePasswordWhiteRoutes(match: router.match) {0
    return <Route path={`${match.path}/changePassword/:type`} component={AccountChangePasswordWhite.Page} />;
}
