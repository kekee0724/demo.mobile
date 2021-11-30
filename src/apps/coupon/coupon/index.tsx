import React from "react";

import { router} from "dva";
import { Route } from "@reco-m/core-ui";

import { positionRoutes, roomRoutes } from "@reco-m/order";

import { ArticleDetail, ArticleHome } from "@reco-m/article";
import { CouponChoice } from "@reco-m/coupon-common";

import { Coupon } from "./coupon";

import { MyCoupon } from "./my.coupon";

import { CouponGift } from "./coupon.gift";

export { Coupon, MyCoupon, CouponGift };

export function couponRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/coupon`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Coupon.Page} />
                    <router.Switch>
                        {roomRoutes(match)}
                        {positionRoutes(match)}
                        <Route
                            path={`${match.path}/service`}
                            render={({ match }) => (
                                <>
                                    <Route path={match.path} component={ArticleHome.Page} />
                                    <Route path={`${match.path}/article/articleDetail/:id`} component={ArticleDetail.Page} />
                                </>
                            )}
                        />
                        {mycouponRoutes(match)}
                        <Route path={`${match.path}/choice`} component={CouponChoice.Page} />
                    </router.Switch>
                </>
            )}
        />
    );
}
export function mycouponRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/mine`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={MyCoupon.Page} />
                    <>
                        {roomRoutes(match)}

                        {positionRoutes(match)}
                        {couponRoutes(match)}
                        <Route path={`${match.path}/gift`} component={CouponGift.Page} />
                    </>
                </>
            )}
        />
    );
}
