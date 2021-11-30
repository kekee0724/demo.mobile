import React from "react";

import { Route } from "@reco-m/core-ui";

import { h5Home } from "./h5.home";



export { h5Home };

export const routes = ({ match }) => (
  <>
    <Route path={match.path} component={h5Home.Page} />
    
  </>
);
