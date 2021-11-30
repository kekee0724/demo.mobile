import React from "react";
import { Route } from "@reco-m/core-ui";
import { DiscoverHome } from "./discover";
import { policyListRoutes } from "@reco-m/policymatching-policymatching";
import { activityDetailRoutes } from "@reco-m/activity";
import { articleDetailRoutes } from "@reco-m/article";
import { policyMatchingDetailRoutes } from "@reco-m/policymatching-policymatching"
import { loginRoutes } from "@reco-m/ipark-auth-login";

import { circleDetailsRoutes, circleDetailstopicRoutes, circleListRoutes, circleAddRoutes, accountHomeWhiteRoutes } from "@reco-m/ipark-white-circle";
import { searchRoutes } from "@reco-m/search";


export { DiscoverHome };

export const routes = ({ match }) => (
  <>
    <Route root path={`${match.path}`} component={DiscoverHome.Page} />
    {searchRoutes(match)}
    {policyListRoutes(match)}
    {activityDetailRoutes(match)}
    {articleDetailRoutes(match)}
    {policyMatchingDetailRoutes(match)}
    {circleListRoutes(match)}
    {circleDetailsRoutes(match)}
    {circleDetailstopicRoutes(match)}
    {accountHomeWhiteRoutes(match)}
    {loginRoutes(match)}
    {circleAddRoutes(match)}
  </>
);
export function discoverHomeRoutes(match) {
  return (
    <Route
      path={`${match.path}/discover/:tabID`}
      render={({ match }) => (
        <>
          <Route root path={`${match.path}`} component={DiscoverHome.Page} />
          {/* {searchRoutes(match)} */}
          {policyListRoutes(match)}
          {activityDetailRoutes(match)}
          {articleDetailRoutes(match)}
          {policyMatchingDetailRoutes(match)}
          {circleListRoutes(match)}
          {circleDetailsRoutes(match)}
          {circleDetailstopicRoutes(match)}
          {accountHomeWhiteRoutes(match)}
          {loginRoutes(match)}
          {circleAddRoutes(match)}
        </>
      )}
    />
  );
}
