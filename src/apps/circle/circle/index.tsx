import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";
import { accountInfoIparkWhiteRoutes } from "@reco-m/ipark-white-account";
import { loginRoutes } from "@reco-m/ipark-auth-login";
import {deleteDataRoutes} from "@reco-m/ipark-common-page"
import { Circle } from "./circle"
import { CircleList } from "./circle.list"
import { CircleAdd } from "./circle.add"
import { CircleDetails } from "./circle.details"
import { SelectCircle } from "./select.circle"
import { TopicDetails } from "./topic.details";
import { CircleMyTrend } from "./circle.mytrends";
import {CircleMyTopic} from "./circle.mytopic"
import {CircleMyFollow} from "./circle.myfollow"
import {CircleMyFans} from "./circle.myfans"
import {CircleReport} from "./circle.Report"
import {AccountViewHome} from "./account.home"
import {Bigpictur} from "./big.pictur"
import {newesttopicdetails} from "./newest.topic.details"
export { Circle, CircleList, CircleAdd, CircleDetails, SelectCircle, CircleMyTrend, CircleMyTopic, CircleMyFollow,
    CircleMyFans, TopicDetails, CircleReport, AccountViewHome, Bigpictur,
    newesttopicdetails
};

export function circleListRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/circlelist`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={CircleList.Page} />
                    {circleDetailsRoutes(match)}
                    {circleAddRoutes(match)}
                    {loginRoutes(match)}
                </>
            )}
        />
    );
}
export function circleDetailsRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/circleDetail/:id`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={CircleDetails.Page} />
                    {circleDetailstopicRoutes(match)}
                    {accountHomeWhiteRoutes(match)}
                    {loginRoutes(match)}
                    {circleAddRoutes(match)}
                   
                </>
            )}
        />
    );
}
export function circleDetailstopicRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/topic/:topicID`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={TopicDetails.Page} />
                    {accountHomeWhiteRoutes(match)}
                    {circleReportRoutes(match)}
                    {loginRoutes(match)}
                    {deleteDataRoutes(match)}
                </>
            )}
        />
    );
}
export function circleAddRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/add`}
            component={CircleAdd.Page}
        />
    );
}
export function circleReportRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/report`}
            component={CircleReport.Page}
        />
    );
}
export function accountHomeWhiteRoutes(match: router.match) {
    return (
        <Route
            key="accounthome"
            path={`${match.path}/home/:userID`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={AccountViewHome.Page} />
                    {circleDetailstopicRoutes(match)}
                    {accountInfoIparkWhiteRoutes(match)}
                    {circleDetailsRoutes(match)}
                    {accountHomeWhiteRoutes(match)}
                </>
            )}
        />
    );
}
