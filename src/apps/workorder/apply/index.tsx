import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { routes } from "@reco-m/workorder";
import { Evaluate } from "@reco-m/comment-evaluate";

import {cardRoutes} from "@reco-m/home-card"

import { Apply } from "./apply";

import { ApplyDetail } from "./apply.detail";

import { MarketApply } from "./market.apply";

import { MarketApplyDetail } from "./market.apply.detail";

import { MyVisitor } from "./visitor.apply";

import { VisitorApplyDetail } from "./visitor.apply.detail";

export { Apply, ApplyDetail, MyVisitor };

export * from "./common";

export function applyRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/apply/:order/:status`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Apply.Page} />
                    {routes(match)}
                    {applyDetailRoutes(match)}
                    {evaluateRoutes(match)}
                </>
            )}
        />
    );
}

export function applyDetailNotificationRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/workorder/slider/:id`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={ApplyDetail.Page} />
                    {routes(match)}
                    {evaluateRoutes(match)}
                </>
            )}
        />
    );
}

export function applyDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/applyDetail/:id/:topicStatus`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={ApplyDetail.Page} />
                    {routes(match)}
                    {evaluateRoutes(match)}
                </>
            )}
        />
    );
}

export function evaluateRoutes(match: router.match) {
    return <Route path={`${match.path}/evaluate/:orderId/:type/:title`} component={Evaluate.Page} />;
}

// 访客预约
export function myVisitorRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/visitor/:companyId`}
            render={({ match }) => (
                <>
                    <Route key={1} path={match.path} component={MyVisitor.Page} />
                    <Route key={2} path={`${match.path}/myVisitorDetail/:id/:status/:isVisitor`} component={VisitorApplyDetail.Page} />
                    {cardRoutes(match)}
                </>
            )}
        />
    );
}

// 服务机构
export function marketServiceApplyRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/marketserviceapply/:order/:status`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={MarketApply.Page} />
                    {marketserviceApplyDetailRoutes(match)}
                </>
            )}
        />
    );
}

export function marketserviceApplyDetailRoutes(match: router.match) {
    return <Route path={`${match.path}/marketserviceapplyDetail/:id/:topicStatus`} component={MarketApplyDetail.Page} />;
}
