import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { certifyRoutes, certifyDetailRoutes } from "@reco-m/member-certify";
import { AccountViewEditInput, AccountViewWhite } from "@reco-m/ipark-white-account";
import { AccountSocial } from "@reco-m/auth-account";
import { discoverHomeRoutes } from "@reco-m/discover";
import { surveyRoutes } from "@reco-m/survey";
import { positionRoutes, roomRoutes, orderRoutes } from "@reco-m/order";
import { routes } from "@reco-m/workorder";
import { productRoutes, marketRoutes } from "@reco-m/workorder-market";
import { applyRoutes, applyDetailRoutes } from "@reco-m/workorder-apply";

import { impressionRoutes } from "@reco-m/ipark-white-impression";

import { Intergral } from "./intergral";

import { IntergralTab } from "./intergral.tab";

import { IntergralHelp } from "./intergral.help";

export * from "./common";

export { Intergral, IntergralTab, IntergralHelp };

export function integralRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/integral`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Intergral.Page} />
                    {integralHelpRoutes(match)}
                    {/* 会员认证 */}
                    {certifyRoutes(match)}
                    {certifyDetailRoutes(match)}
                    {/* 活动、资讯、圈子 */}
                    {discoverHomeRoutes(match)}
                    {/* 问卷 */}
                    {surveyRoutes(match)}
                    {/* 会议室、场地 */}
                    {roomRoutes(match)}
                    {/* 工位、广告位 */}
                    {positionRoutes(match)}
                    {/* 修改个人信息 */}
                    <Route
                        key="modifyPersonInfo"
                        path={`${match.path}/modifyPersonInfo`}
                        render={({ match }) => (
                            <>
                                <Route path={match.path} component={AccountViewWhite.Page} />
                                <Route path={`${match.path}/edit/:type/:name`} component={AccountViewEditInput.Page} />
                            </>
                        )}
                    />
                    {/* 绑定社交账号 */}
                    <Route path={`${match.path}/social`} component={AccountSocial.Page} />

                    {/* 工单 */}
                    {routes(match)}
                    {/* 服务产品 */}
                    {productRoutes(match)}
                    {/* 服务机构 */}
                    {marketRoutes(match)}
                    {/* 园区印象 */}
                    {impressionRoutes(match)}
                    {/* 订单 */}
                    {orderRoutes(match)}
                    {/* 工单 */}
                    {applyRoutes(match)}
                    {applyDetailRoutes(match)}
                </>
            )}
        />
    );
}

export function integralHelpRoutes(match: router.match) {
    return <Route path={`${match.path}/help`} component={IntergralHelp.Page} />;
}
