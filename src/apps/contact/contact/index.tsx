import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";

import { certifyRoutes } from "@reco-m/member-certify";

import { callTel } from "./common";

import { Contact } from "./contact";

import { ContactDetail } from "./contact.detail";

export { Contact, ContactDetail, callTel };

export function contactRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/contact`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Contact.Page} />
                    {certifyRoutes(match)}
                    <Route path={`${match.path}/contactDetail/:id`} component={ContactDetail.Page} />
                </>
            )}
        />
    );
}
