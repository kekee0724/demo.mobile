import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";

import "@reco-m/my-models";

import { Card } from "./card";

export { Card };

export function cardRoutes(match: router.match) {
    return <Route path={`${match.path}/card`} component={Card.Page} />;
}
