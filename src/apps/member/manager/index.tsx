import React from "react";
import { router } from "dva";
import { Route } from "@reco-m/core-ui";
import { Staffmanager } from "./staffmanager.list";

import { StaffmanagerDetail } from "./staffmanager.detail";

import { StaffmanagerApproval } from "./staffmanager.approval";

import { StaffmanagerApprovalDetail } from "./staffmanager.approval.detail";

export { Staffmanager, StaffmanagerDetail, StaffmanagerApproval, StaffmanagerApprovalDetail };

export function staffmanagerListRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/staffmanager`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Staffmanager.Page} />
                    {approvalRoutes(match)}
                    <Route path={`${match.path}/staffdetail/:id`} component={StaffmanagerDetail.Page} />
                </>
            )}
        />
    );
}

export const approvalRoutes: (match: { path: string }) => React.ReactNode = match => (
    <Route
        path={`${match.path}/approval`}
        render={({ match }) => (
            <>
                <Route path={match.path} component={StaffmanagerApproval.Page} />
                <Route path={`${match.path}/detail/:id`} component={StaffmanagerApprovalDetail.Page} />
            </>
        )}
    />
);

export const approvalDetailNotificationRoutes: (match: { path: string }) => React.ReactNode = match => (
    <Route path={`${match.path}/member/sliderCertify`} component={StaffmanagerApprovalDetail.Page} />
);
