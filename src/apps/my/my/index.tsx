import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { aboutRoutes } from "@reco-m/system-about";
import { filesRoutes } from "@reco-m/files-manage";
import { accountInfoRoutes, pChangePasswordRoutes } from "@reco-m/auth-account";

import { accountSafeRoutes } from "@reco-m/auth-account";

import {signatureRoutes} from "@reco-m/signature-signature"

import { My } from "./my";

import { MyCompany } from "./my.company";

import { IparkTestForm } from "./test.form";

export { My, MyCompany, IparkTestForm };

export const routes = ({ match }, renderRoutes?: (match: router.match) => React.ReactNode) => {
    renderRoutes = typeof renderRoutes === "function" ? renderRoutes : () => null;
    return (
        <>
            <Route path={match.path} component={My.Page} />
            <Route path={`${match.path}/company`} component={MyCompany.Page} />
            {aboutRoutes(match)}
            {accountInfoRoutes(match)}
            {accountSafeRoutes(match)}
            {renderRoutes!(match)}
            {filesRoutes(match)}
            {testFormRoutes(match)}
            {signatureRoutes(match)}
            {pChangePasswordRoutes(match)}
        </>
    );
};
export function testFormRoutes(match) {
    return <Route path={`${match.path}/form`} component={IparkTestForm.Page} />;
}

