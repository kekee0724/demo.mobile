import React from "react";
import { connect } from "dva";

import { freeze } from "immer";

import { CoreComponent } from "../container/core-component";

const pageMapping = new Map<any, any>();

export function replacePage<P extends CoreComponent.IProps, C = React.ComponentType<P>>(original: C, target: C): void {
    pageMapping.set(original, target);
}

export function template<P extends CoreComponent.IProps, R = any, C = React.ComponentType<P>>(
    component: C,
    mapStateToProps: (state: any) => R = (state: any) => state,
    getPrimaryReducer?: (state: R) => any
): C {
    return ((props: P) => {
        (component as any).$$component ??= connect2(component, mapStateToProps, getPrimaryReducer);

        return React.createElement((component as any).$$component, props);
    }) as any;
}

function connect2<P extends CoreComponent.IProps, R = any, C = React.ComponentType<P>>(
    component: C,
    mapStateToProps: (state: any) => R = (state: any) => state,
    getPrimaryReducer?: (state: R) => any
): C {
    return connect((state: any) => {
        const nextState = mapStateToProps(state),
            primaryReducer = typeof getPrimaryReducer === "function" && getPrimaryReducer(nextState);

        return { state: freeze(primaryReducer ? { ...primaryReducer, ...nextState } : nextState) };
    })(pageMapping.get(component) ?? (component as any)) as any;
}
