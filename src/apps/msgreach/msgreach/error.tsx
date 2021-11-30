import React from "react";

import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { msgreachModel, Namespaces } from "@reco-m/msgreach-models";
import { WhiteSpace } from "antd-mobile-v2";

export namespace NoticeError {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, msgreachModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.msgreach;
        scrollable = false;

        renderBody() {
            return (
                <div>
                    <div className="pay-content">
                        <div className="pay-icon " style={{ color: "red" }}>
                            <i className="icon icon-cuo" />
                        </div>
                        <div className="pay-state">页面读取失败!</div>
                        <div className="error-center-left">
                            <WhiteSpace />
                            <div className="">可能的原因</div>
                            <WhiteSpace />
                            <div className="">1、发布者已将页面删除</div>
                            <WhiteSpace />
                            <div className="">2、你点击的链接已过期</div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.msgreach]);
}
