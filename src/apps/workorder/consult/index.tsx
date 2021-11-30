import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";

import { routes as workorderRoutes } from "@reco-m/workorder";

import { Consult } from "./consult";

import { ConsultLoadAll } from "./consult.loadAll";

export { Consult, ConsultLoadAll };

export function consultRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/consult`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={Consult.Page} />
          
          {workorderRoutes(match)}
        </>
      )}
    />
  );
}
