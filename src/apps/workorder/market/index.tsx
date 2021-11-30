import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { routes as workorderRoutes } from "@reco-m/workorder";

import { loginRoutes } from "@reco-m/ipark-auth-login";

import { Market } from "./market";

import { MarketDetail } from "./market.detail";

import { MarketDetailFooter } from "./market.detail.footer";

import { MarketSearch } from "./market.searh";

import { Product } from "./product";

import { ProductSearch } from "./product.search";

import { ProductDetail } from "./product.detail";

import { ProductDetailFooter } from "./product.detail.footer";


import { ProductList } from "./product.list";

import { ProductAdd } from "./product.add";

import { MarketAgreement } from "./market.agree";
import { ProductAgreement } from "./product.agree";

import { MarketIn } from "./marketIn";
import { MarketInDetail } from "./marketIn.detail";

import { MarketAuth } from "./market.auth";
import { MarketInDetailModify } from "./marketIn.detail.modify";

export {
    Market,
    MarketDetail,
    MarketDetailFooter,
    MarketSearch,
    Product,
    ProductSearch,
    ProductDetail,
    ProductDetailFooter,
    ProductList,
    ProductAdd,
    MarketAgreement,
};
export const routes = ({ match }) => (
    <Route
            path={`${match.path}`}
            render={({ match }) => (
                <Route
                    path={`${match.path}`}
                    render={({ match }) => (
                        <Route path={`${match.path}`} component={MarketAuth.Page} />
                    )}
                />
            )}
        />
);

export function marketauthRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/marketauth`}
            render={({ match }) => (
                <Route
                    path={`${match.path}`}
                    render={({ match }) => (
                        <Route path={`${match.path}`} component={MarketAuth.Page} />
                    )}
                />
            )}
        />
    );
}
export function marketRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/market`}
            render={({ match }) => (
                <Route
                    path={`${match.path}/:tagId`}
                    render={({ match }) => (
                        <>
                            <Route path={`${match.path}`} component={Market.Page} />
                            {marketInRoutes(match)}
                            {marketInUpdateRoutes(match)}
                            {marketInDetailRoutes(match)}
                            {markeSearchRoutes(match)}
                            {marketDetailRoutes(match)}
                            {loginRoutes(match)}
                        </>
                    )}
                />
            )}
        />
    );
}
export function marketInDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/marketInDetail`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={MarketInDetail.Page} />
                    {modifyContact(match)}
                    {marketInUpdateRoutes(match)}
                </>
            )}
        />
    );
}
export function modifyContact(match: router.match) {
    return (
        <Route
            path={`${match.path}/modify`}
            render={({ match }) => (
                <Route path={`${match.path}`} component={MarketInDetailModify.Page} />
            )}
        />
    );
}
export function marketInUpdateRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/marketUpdataIn/:companyId/:isupdate`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={MarketIn.Page} />
                    <Route path={`${match.path}/marketagree`} component={MarketAgreement.Page} />
                </>
            )}
        />
    );
}
export function marketInRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/marketIn/:companyId`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={MarketIn.Page} />
                    <Route path={`${match.path}/marketagree`} component={MarketAgreement.Page} />
                </>
            )}
        />
    );
}
export function markeSearchRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/search`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={MarketSearch.Page} />
                    {marketDetailRoutes(match)}
                    {loginRoutes(match)}
                </>
            )}
        />
    );
}

export function marketDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/detail/:id/:tId`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={MarketDetail.Page} />
                    {productDetailRoutes(match)}
                    {workorderRoutes(match)}
                </>
            )}
        />
    );
}


export function productRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/serviceProduct`}
            render={({ match }) => (
                <Route
                    path={`${match.path}/:tagId`}
                    render={({ match }) => (
                        <>
                            <Route path={`${match.path}`} component={Product.Page} />
                            {productSearchRoutes(match)}
                            {productDetailRoutes(match)}
                            {loginRoutes(match)}
                        </>
                    )}
                />
            )}
        />
    );
}

export function productSearchRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/search`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={ProductSearch.Page} />
                    {productDetailRoutes(match)}
                    {loginRoutes(match)}
                </>
            )}
        />
    );
}
export function productDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/productdetail/:productId`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={ProductDetail.Page} />
                    {workorderRoutes(match)}
                </>
            )}
        />
    );
}

export function produtListRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/serviceProductList/:institutionID`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={ProductList.Page} />
                    <Route
                        path={`${match.path}/productadd/:productId?`}
                        render={({ match }) => (
                            <>
                                <Route path={`${match.path}`} component={ProductAdd.Page} />
                                <Route path={`${match.path}/productaddagree`} component={ProductAgreement.Page} />
                            </>
                        )}
                    />
                    <Route path={`${match.path}/productadd/productaddagree`} component={ProductAgreement.Page} />
                </>
            )}
        />
    );
}
