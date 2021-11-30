import React from "react";

import { Route } from "@reco-m/core-ui";
import { router } from "dva";
import { Signature } from "./signature"
export { Signature }

export function signatureRoutes(match: router.match) {
    return <Route path={`${match.path}/signature`} component={Signature.Page} />;
}