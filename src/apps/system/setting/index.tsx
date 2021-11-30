import React from "react";

import { router } from "dva";

import { Route } from "@reco-m/core-ui";

import { infosetRoutes } from "@reco-m/notice-setting";

import { aboutRoutes } from "@reco-m/system-about";

import { routes } from "@reco-m/workorder";

import { accountSafeIparkWhiteRoutes } from "@reco-m/ipark-auth-account";

import { accountInfoIparkWhiteRoutes } from "@reco-m/ipark-white-account";

import { Setting } from "./setting";

export { Setting };

export function settingWhiteRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/setting`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Setting.Page} />
                    {accountInfoIparkWhiteRoutes(match)}
                    {accountSafeIparkWhiteRoutes(match)}
                    {infosetRoutes(match)}
                    {routes(match)}
                    {aboutRoutes(match)}
                </>
            )}
        />
    );
}
