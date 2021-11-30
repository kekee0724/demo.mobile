import React from "react";

import { router} from "dva";

import { Route } from "@reco-m/core-ui";

import { Infoset } from "./infoset";

export { Infoset };

export function infosetRoutes(match: router.match) {
    return <Route path={`${match.path}/infoset`} component={Infoset.Page} />;
}
