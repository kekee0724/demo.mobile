import React from "react";

import { Route } from "@reco-m/core-ui";

import { settingWhiteRoutes } from "@reco-m/system-setting";
import { certifyRoutes, certifyDetailRoutes } from "@reco-m/member-certify";
import { integralRoutes } from "@reco-m/member-intergral";
import { myActivityRoutes } from "@reco-m/activity";
import { applyRoutes, myVisitorRoutes, marketServiceApplyRoutes } from "@reco-m/workorder-apply";
import { orderRoutes, refundorderRoutes } from "@reco-m/order";
import { surveyRoutes } from "@reco-m/survey";
import { favoritesRoutes } from "@reco-m/favorites";
import { accountSafeIparkWhiteRoutes } from "@reco-m/ipark-auth-account";
import { accountInfoIparkWhiteRoutes } from "@reco-m/ipark-white-account";
import { loginRoutes } from "@reco-m/ipark-auth-login";
import { invoiceRoutes } from "@reco-m/invoice";
import { mycouponRoutes } from "@reco-m/coupon-coupon";
import { produtListRoutes, marketInRoutes, marketInDetailRoutes } from "@reco-m/workorder-market";
import { staffmanagerListRoutes } from "@reco-m/member-manager";
import { contactRoutes } from "@reco-m/contact";
import { MyWhite } from "./my.white";
import { MyHeaderWhite } from "./my.header.white";
import { MyRoleFuncPage } from "./my.role.func";
import { notificationRoutes } from "@reco-m/notice-notice";
import { accountHomeWhiteRoutes } from "@reco-m/ipark-white-circle";
import { routes as workorderRoutes } from "@reco-m/workorder";
import { applyDetailRoutes } from "@reco-m/workorder-apply";
import { busynessBillRoutes } from "@reco-m/busynessbill"
import {policyserviceMysRoutes, policyserviceOrderRoutes} from "@reco-m/policyservice"

export { MyWhite, MyHeaderWhite, MyRoleFuncPage };

export const routes = ({ match }) => (
  <>
    <Route path={match.path} component={MyWhite.Page} />
    {settingWhiteRoutes(match)}
    {loginRoutes(match)}
    {myActivityRoutes(match)}
    {certifyRoutes(match)}
    {certifyDetailRoutes(match)}
    {favoritesRoutes(match)}
    {staffmanagerListRoutes(match)}
    {accountHomeWhiteRoutes(match)}
    {notificationRoutes(match)}
    {surveyRoutes(match)}
    {orderRoutes(match)}
    {refundorderRoutes(match)}
    {accountInfoIparkWhiteRoutes(match)}
    {accountSafeIparkWhiteRoutes(match)}
    {invoiceRoutes(match)}
    {mycouponRoutes(match)}
    {integralRoutes(match)}
    {contactRoutes(match)}
    {produtListRoutes(match)}
    {marketInRoutes(match)}
    {marketInDetailRoutes(match)}
    {applyRoutes(match)}
    {myVisitorRoutes(match)}
    {marketServiceApplyRoutes(match)}
    {workorderRoutes(match)}
    {applyDetailRoutes(match)}
    {busynessBillRoutes(match)}
    {policyserviceMysRoutes(match)}
    {policyserviceOrderRoutes(match)}
  </>
);
