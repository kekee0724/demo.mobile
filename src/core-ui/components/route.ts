import React from "react";
import ReactDOM from "react-dom";
import { __RouterContext, matchPath } from "react-router";
import { router } from "dva";

import { URLSearchParams } from "@reco-m/core";

import { PageWrap, domNode } from "./page.wrap";

export type match = router.match & { isExact?: boolean; params?: any; path?: string; url?: string; searchParams?: URLSearchParams };

export type RouteProps = router.RouteProps & { root?: boolean; onTouch?: boolean; computedMatch?: any };

export class Route<P extends RouteProps = RouteProps> extends router.Route<P> {
    readonly props: Readonly<P> & Readonly<{ children?: React.ReactNode }>;

    render(): React.ReactNode {
        const { component, location: cLocation, root, onTouch, computedMatch, path } = this.props;

        if (component) {
            return React.createElement(__RouterContext.Consumer, null, ({ history, location, match, staticContext }) => {
                location = cLocation || location;
                match = computedMatch ? computedMatch : path ? matchPath(location.pathname, this.props) : match;

                if (match && !component.hasOwnProperty("ignore")) {
                    const reactNode = React.createElement(PageWrap.Component as any, { match, location, history, staticContext, component, root, onTouch });

                    return ReactDOM.createPortal(reactNode, domNode);
                }

                return super.render();
            });
        }

        return super.render();
    }
}
