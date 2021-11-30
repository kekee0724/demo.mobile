import React from "react";

import { Route } from "@reco-m/core-ui";

import { WorkOrderCreate } from "./wrokorder.create";
import { WorkorderVisitor } from "./workorder.fkyy";

export { WorkOrderCreate, WorkorderVisitor  };

export const routes = (match) => {
    const path = match.path ? match.path : match.match.path;
    return (
        <>
            <Route path={`${path}/create/:code`} component={WorkOrderCreate.Page} />
            <Route path={`${path}/edit/:id/:flowProjectId/:routeId`} component={WorkOrderCreate.Page} />
            <Route path={`${path}/workorder/visitor`} component={WorkorderVisitor.Page} />
            {workOrderRouteEditRoutes({ path })}
        </>
    );
};

// 工单操作--全屏输入
export function workOrderRouteEditRoutes(match) {
    return <Route path={`${match.path}/routeEdit/:id/:flowProjectId/:routeID`} component={WorkOrderCreate.Page} />;
}
