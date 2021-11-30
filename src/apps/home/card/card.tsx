import React from "react";

import { Button, WingBlank} from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ImageAuto, ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace Card {
    export interface IProps extends ViewComponent.IProps { }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "一卡通";
        showloading = false;
        bodyClass = "white-container"
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
          }
        componentMount() {
            setEventWithLabel(statisticsEvent.card);
        }

        renderBody(): React.ReactNode {
            return (
                <div className="container-column container-fill container-justify-center container-align-center">
                    <div className="middle-box">
                        <div className="margin-bottom-lg">
                            <ImageAuto.Component src="assets/images/icon-ykt.png" width="200px" height="205px" />
                        </div>
                      <WingBlank>
                        <Button type="primary" className="default-btn" disabled >此园区暂未开通</Button>
                      </WingBlank>
                        <div className="agree-box">
                            点击开通即同意<a>《一卡通许可及服务协议》</a>
                        </div>
                    </div>
                </div>
            );
        }
    }

    export const Page = template(Component);
}
