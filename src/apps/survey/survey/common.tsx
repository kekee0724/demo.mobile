import React from "react";

import { Button } from "antd-mobile-v2";

export function renderSurveyButton(): React.ReactNode {
    return (
        <Button type={"primary"}>
            <span>参与调研</span>
        </Button>
    );
}

export function renderHasAnswareButton(): React.ReactNode {
    return (
        <Button type={"primary"}>
            <span className="gray-three-color">已回答</span>
        </Button>
    );
}

export function renderStatusButton(item): React.ReactNode {
    return (
        <Button type={"primary"}>
            <span className="gray-four-color">{item.Status}</span>
        </Button>
    );
}
