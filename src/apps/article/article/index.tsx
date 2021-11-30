import React from "react";
import { router} from "dva";
import { Route } from "@reco-m/core-ui";
import { loginRoutes } from "@reco-m/ipark-auth-login";
import {deleteDataRoutes} from "@reco-m/ipark-common-page"
import { certifyDetailRoutes, certifyRoutes } from "@reco-m/member-certify";

import { Article } from "./article";

import { ArticleDetail } from "./article.detail";

import { ArticleHome } from "./article.home";


export { Article, ArticleDetail, ArticleHome };

export function articleRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/article`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={Article.Page} />
          {articleDetailRoutes(match)}
        </>
      )}
    />
  );
}

export function articleHomeRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/articleHome`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={ArticleHome.Page} />
          {articleDetailRoutes(match)}
        </>
      )}
    />
  );
}

export function articleDetailRoutes(match: router.match) {
  return (
    <Route
      path={`${match.path}/articleDetail/:id`}
      render={({ match }) => (
        <>
          <Route path={match.path} component={ArticleDetail.Page} />
          {loginRoutes(match)}
          {certifyRoutes(match)}
          {certifyDetailRoutes(match)}
          {deleteDataRoutes(match)}
        </>
      )}
    />
  );
}

export function articleDetailNotificationRoutes(match: router.match) {
  return <Route path={`${match.path}/article/slider`} component={ArticleDetail.Page} />;
}
