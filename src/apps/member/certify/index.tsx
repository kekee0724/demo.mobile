import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { CertifyCompanyForm } from "./certify.company.form";

import { CertifyForm } from "./certify.form";

import { CertifyDetail } from "./certify.detail";

export { CertifyForm, CertifyDetail, CertifyCompanyForm };

export function certifyRoutes(match: router.match) {
    return <Route path={`${match.path}/certify`} render={({ match }) => (
        <>
            <Route path={match.path} component={CertifyForm.Page} />
            {certifyCompanyFormRoutes(match)}
        </>
    )}/>;
}
export function certifyCompanyFormRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/companycertify`}
            component={CertifyCompanyForm.Page}
        />
    );
}
export function certifyCompanyFormUpdateRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/companycertify/:companyId`}
            component={CertifyCompanyForm.Page}
        />
    );
}
export function certifyDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/certifyDetail/:id`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={CertifyDetail.Page} />
                    {certifyDetailUpdateRoutes(match)}
                    {certifyCompanyFormUpdateRoutes(match)}
                </>
            )}
        />
    );
}

export function certifyDetailNotificationRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/member/slider`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={CertifyDetail.Page} />
                    {certifyDetailUpdateRoutes(match)}
                </>
            )}
        />
    );
}
export function certifyDetailUpdateRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/update/:memberID`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={CertifyForm.Page} />
                    <Route path={`${match.path}/companycertify`} component={CertifyCompanyForm.Page} />
                </>
            )}
        />
    );
}
