import React from "react";

import { Button } from "antd-mobile";

import { PureComponent, browser } from "@reco-m/core";

const ddkit = window["dd"];
export namespace DeletData {
    export interface IProps extends PureComponent.IProps {
        title?: any;
        text?: any;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            title: "内容不存在",
            text: "内容已被删除或者下架",
        };

        render(): React.ReactNode {
            const { title, text } = this.props;
            return (
                <div>
                    <div className="pay-content">
                        <div className="pay-icon " style={{ color: "red" }}>
                            <i className="icon icon-cuo" />
                        </div>
                        <div className="pay-state">{title}</div>
                        <div className="pay-tips">{text}</div>
                    </div>
                    <div
                        className="pay-button"
                        onClick={() => {

                            if (ddkit && ddkit.env.platform !== "notInDingTalk") {
                                alert(JSON.stringify(ddkit))
                                ddkit.biz.navigation.close({
                                    onSuccess : function() {

                                    },
                                    onFail : function() {
                                    }
                                })
                            } else if (browser.versions.weChatMini) {
                                (wx["miniProgram"] as any).redirectTo({ url: "/pages/index/index/index" });
                            } else {
                                history.go(-2);
                            }
                        }}
                    >
                        <Button type="button">{browser.versions.weChatMini ? "返回首页" : "返回上一页"}</Button>
                    </div>
                </div>
            );
        }
    }
}
