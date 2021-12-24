import React from "react";

import { template } from "@reco-m/core";
import { ViewComponent, getPhone, OSVersionType, HtmlContent, Container } from "@reco-m/core-ui";

import { Namespaces, aboutVersionModel, editionTypeEnum, updateTypeEnum } from "@reco-m/system-models";
import { Empty } from "antd-mobile";

export namespace AboutVersion {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, aboutVersionModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "新功能介绍";
        namespace = Namespaces.aboutversion;

        componentMount() {
            let type = getPhone();
            if (type === OSVersionType.ios) {
                type = OSVersionType.iosAfter;
            }
            this.dispatch({
                type: "getNewAppVersion",
                data: { deviceTypeId: type, editionTypeId: editionTypeEnum.service },
            });
            this.dispatch({
                type: "getNewHotAppVersion",
                data: { editionTypeId: editionTypeEnum.service, updateTypeId: updateTypeEnum.hotUpdate },
            });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                hotversion = state!.hotversion;

            return hotversion && hotversion ? (
                <HtmlContent.Component html={hotversion.remark ? hotversion.remark : ""} />
            ) : (
                <Container.Component range="center">
                    <Empty description={<div>暂无数据</div>} />
                </Container.Component>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.aboutversion]);
}
