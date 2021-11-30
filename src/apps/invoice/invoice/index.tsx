import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";
import { orderDetailsRoutes } from "@reco-m/order";

import { InvoiceEdit } from "@reco-m/invoice-common";

import { Invoice } from "./invoice";

import { InvoiceDetail } from "./invoice.detail";

import { InvoiceTitle } from "./invoice.title";

export { Invoice, InvoiceDetail, InvoiceTitle };

export function invoiceRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/invoice`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Invoice.Page} />
                    <Route path={`${match.path}/invoiceDetail/:id`} component={InvoiceDetail.Page} />
                    <Route
                        path={`${match.path}/title`}
                        render={({ match }) => (
                            <>
                                <Route path={match.path} component={InvoiceTitle.Page} />
                                <Route path={`${match.path}/edit/:id/:intype`} component={InvoiceEdit.Page} />
                            </>
                        )}
                    />
                    {orderDetailsRoutes(match)}
                </>
            )}
        />
    );
}
