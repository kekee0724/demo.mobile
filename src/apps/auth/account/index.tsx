import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { gesturesRoutes } from "@reco-m/auth-gestures";

import { AccountInfo } from "./account.info";
import { AccountSafe } from "./account.safe";
import { AccountChangeMobile } from "./account.mobile";
import { AccountSocial } from "./account.social";
import { AccountChangePassword } from "./account.password";
import { AccountBindMobile } from "./account.bind.mobile";

import { ChangePassword } from "./change.password";

export { AccountSafe, AccountChangeMobile, AccountSocial, AccountChangePassword, AccountBindMobile, ChangePassword, AccountInfo };

export * from "./common";
export function accountSafeRoutes(match: router.match, children?: (match: router.match) => React.ReactNode) {
    return (
        <Route
            path={`${match.path}/safe`}
            render={({ match }) => (
                <>
                    <Route  path={match.path} component={AccountSafe.Page} />
                    {changePasswordRoutes(match)}
                    <Route path={`${match.path}/changeMobile`} component={AccountChangeMobile.Page} />
                    <Route path={`${match.path}/social`} component={AccountSocial.Page} />
                    <router.Switch>
                        {gesturesRoutes(match)}
                        {children ? children(match) : null}
                    </router.Switch>
                </>
            )}
        />
    );
}

export function changePasswordRoutes(match: router.match) {
    return <Route path={`${match.path}/changePassword/:type`} component={AccountChangePassword.Page} />;
}

export function pChangePasswordRoutes(match: router.match) {
    return <Route path={`${match.path}/pchangePassword/:type`} component={ChangePassword.Page} />;
}

export function changeBindMobileRoutes(match: router.match) {
    return <Route path={`${match.path}/accountbindmobile`} component={AccountBindMobile.Page} />;
}
export function accountInfoRoutes(match: router.match) {
    return <Route path={`${match.path}/info`} component={AccountInfo.Page} />;
}

