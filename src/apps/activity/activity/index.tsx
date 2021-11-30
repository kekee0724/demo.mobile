import React from "react";

import { router} from "dva";

import { Route } from "@reco-m/core-ui";

import { loginRoutes } from "@reco-m/ipark-auth-login";
import {deleteDataRoutes} from "@reco-m/ipark-common-page"

import { ActivityDetail } from "./activity.detail";

import { ActivitySign } from "./activitySign";

import { ActivitySigned } from "./activity.signed";

import { MyActivity } from "./my.activity";

import { ActivityDetailSignResult } from "./activity.detail.sign.result"

import { ActivitySignSignModal } from "./activitySign.registerModal"

import { ActivitySignOrderModal } from "./activitySign.orderModal"

import { certifyDetailRoutes, certifyRoutes } from "@reco-m/member-certify";

export { ActivityDetail, ActivitySign, ActivitySigned, MyActivity, ActivityDetailSignResult, ActivitySignSignModal, ActivitySignOrderModal };
export * from "./common"

export function activityDetailRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/activityDetail/:id`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={ActivityDetail.Page} />
          {loginRoutes(match)}
          {activityDetailSignRoutes(match)}
          {certifyRoutes(match)}
          {certifyDetailRoutes(match)}
          {activityDetailSignResultRoutes(match)}
          {deleteDataRoutes(match)}
        </>
      )}
    />
  );
}

export function activityDetailSignRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/sign`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={ActivitySignSignModal.Page} />
          {activityDetailSignOrderRoutes(match)}
          {activityDetailSignResultRoutes(match)}
        </>
      )}
    />
  );
}
export function activityDetailSignOrderRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/signOrder`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={ActivitySignOrderModal.Page} />
          {activityDetailSignResultRoutes(match)}
        </>
      )}
    />
  );
}
export function activityDetailSignResultRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/sresult`}
      component={ActivityDetailSignResult.Page}
    />
  );
}

export function activityDetailNotificationRoutes(match: router.match) {
  return <Route path={`${match.path}/activity/slider`} component={ActivityDetail.Page} />;
}

export function myActivityRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/myActivity`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={MyActivity.Page} />
          <Route path={`${match.path}/myActivityDetail/:id/:ismyactivity`} component={ActivityDetail.Page} />
        </>
      )}
    />
  );
}
