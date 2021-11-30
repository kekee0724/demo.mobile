import React from "react";

import { Button } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ImageAuto, ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace Access {
    export interface IProps extends ViewComponent.IProps { }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "门禁卡";
        showloading = false;
        componentMount() {
            setEventWithLabel(statisticsEvent.access);
        }

        renderBody(): React.ReactNode {
            return (
                <div className="container-column container-fill container-justify-center container-align-center">
                    <div className="middle-box">
                        <div className="margin-bottom-lg">
                            <ImageAuto.Component src="assets/images/icon-mjk.png" width="200px" height="205px" />
                        </div>
                        <Button type={"primary"} onClick={() => this.goTo("accessCard")}>
                            此园区暂未开通
                        </Button>
                        <div className="agree-box">
                            点击开通即同意<a>《门禁卡许可及服务协议》</a>
                        </div>
                    </div>
                </div>
            );
        }
    }

    export const Page = template(Component);
}
