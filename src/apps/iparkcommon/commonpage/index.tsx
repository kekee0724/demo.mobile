import React from "react";
import { Route } from "@reco-m/core-ui";
import {DeleteData} from "./deleteData"
import { IparkTest } from "./test";
import { IparkTestForm } from "./test.form";

export * from "./form";
export * from "./deleteData"

export function deleteDataRoutes(match) {
    return <Route path={`${match.path}/deleteData`} component={DeleteData.Page} />;
}
/******************************************测试页面******************************************/
export const testRoutes = ({ match }) => (
    <Route
        path={`${match.path}`}
        render={({ match }) => (
            <>
                {iparkTestRoutes(match)}
                {iparkTestFormRoutes(match)}
            </>
        )}
    />
);

export function iparkTestRoutes(match) {
    return <Route path={`${match.path}`} component={IparkTest.Page} />;
}
export function iparkTestFormRoutes(match) {
    return <Route path={`${match.path}/form`} component={IparkTestForm.Page} />;
}

