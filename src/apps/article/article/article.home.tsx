import React from "react";
import { template } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { articleModel, Namespaces } from "@reco-m/article-models";

import { Article } from "./article";

export namespace ArticleHome {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        scroll?: any;
        hideHeader?: any;
    }

    export interface IState extends ViewComponent.IState, articleModel.StateType {
        viewRef?: any;
    }
    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.article;
        key: any;
        headerContent = "资讯";
        showheader = this.props.hideHeader ? false : true;
        scrollable = false;
        showloading = true;

        renderArticleList(): React.ReactNode {
            return this.renderEmbeddedView(Article.Page as any, { scroll: null, hideHeader: this.props.hideHeader });
        }
        renderBody(): React.ReactNode {
            if (this.props.hideHeader) {
                return this.renderArticleList();
            }
            return this.renderArticleList();
        }
    }

    export const Page = template(Component, state => state[Namespaces.article]);
}
