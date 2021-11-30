import React from "react";

import { Button } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ImageAuto, ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";
export namespace AccessCard {
    export interface IProps extends ViewComponent.IProps { }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "二维门禁卡";
        showloading = false;

        renderBody(): React.ReactNode {
            setEventWithLabel(statisticsEvent.QrCodeAccessCard);
            return (
                <div className="container-column container-fill container-justify-center container-align-center">
                    <div className="middle-box">
                        <div className="margin-bottom-lg">
                            <ImageAuto.Component src="assets/images/WeChat.png" width="200px" height="205px" />
                            <div style={{ textAlign: "center", marginTop: "18px" }}>瑞谷拜特动态门禁二维码</div>
                        </div>
                        <Button type={"primary"}>重新生成</Button>
                        <div className="agree-box">将二维码置于门禁设备上识别即可开门；同一动态二维码不能重复使用，当再次开门时，需重新获取二维码。</div>
                    </div>
                </div>
            );
        }
    }

    export const Page = template(Component);
}
