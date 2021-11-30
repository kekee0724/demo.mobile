import React from "react";

import { router } from "dva";

import { Route } from "@reco-m/core-ui";

import { BillDetails } from "./bill.details";
import { Bill } from "./bill.list";
import { MyBillDetails } from "./my.bill.details";

export { Bill };

export function busynessBillRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/busynessbill`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Bill.Page} />
                    <Route path={`${match.path}/mydetails`} component={MyBillDetails.Page} />
                    {busynessBillDetailRoutes(match)}
                </>
            )}
        />
    );
}
export function busynessBillDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/billdetails`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={BillDetails.Page} />
                </>
            )}
        />
    );
}
