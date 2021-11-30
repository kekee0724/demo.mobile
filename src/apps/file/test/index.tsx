import React from "react";

import { router } from "dva";

import { Route } from "@reco-m/core-ui";

import { AttachTest } from "./attach";

import { PictureTest } from "./picture";

export { AttachTest, PictureTest };

export const routes = ({ match }) => (
    <router.Switch>
        <Route path={`${match.path}/attach`} component={AttachTest.Page} />
        <Route path={`${match.path}/picture`} component={PictureTest.Page} />
    </router.Switch>
);
