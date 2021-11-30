import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";

import { routes as workorderRoutes } from "@reco-m/workorder";
import { loginRoutes } from "@reco-m/ipark-auth-login";

import { PolicyMatchingDetail } from "./policy.matching.detail";

import { PolicyList } from "./policy.matching.list";

import { PolicyMatchingSearch } from "./policy.matching.search";

import { certifyDetailRoutes, certifyRoutes } from "@reco-m/member-certify";

export { PolicyMatchingDetail, PolicyList, PolicyMatchingSearch };

export function policyListRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/policyList`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={PolicyList.Page} />
          {policyMatchingDetailRoutes(match)}
          {loginRoutes(match)}
          {policyMatchSearchRoutes(match)}

        </>
      )}
    />
  );
}


export function policyMatchingDetailRoutes(match) {
  return (
    <Route
      path={`${match.path}/policydetail/:id`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={PolicyMatchingDetail.Page} />
          {workorderRoutes(match)}
          {certifyRoutes(match)}
          {certifyDetailRoutes(match)}
          {loginRoutes(match)}
        </>
      )}
    />
  );
}

export function policyMatchSearchRoutes(match) {
  return (
    <Route
      path={`${match.path}/matchsearch`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={PolicyMatchingSearch.Page} />
          {policyMatchingDetailRoutes(match)}
        </>
      )}
    />
  );
}

export function policyMatchingDetailNotificationRoutes(match) {
  return (
    <Route
      path={`${match.path}/policy/slider`}
      render={({ match }) => (
        <Route path={match.path} component={PolicyMatchingDetail.Page} />
      )}
    />
  );
}
