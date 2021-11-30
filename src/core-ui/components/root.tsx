import React from "react";

import { PureComponent } from "@reco-m/core";

import { Container } from "./container";

export class RootComponent extends PureComponent.Base {
    render() {
        return <Container.Component direction="column">{this.props.children}</Container.Component>;
    }
}
