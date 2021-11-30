import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { Gestures } from "./gestures";

export { Gestures };

export function gesturesRoutes(match: router.match) {
    return <Route path={`${match.path}/gestures`} component={Gestures.Page} />;
}
