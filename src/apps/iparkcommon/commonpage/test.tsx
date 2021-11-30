import React from "react";

import { template, clearStorage } from "@reco-m/core";

import { ViewComponent, callModal } from "@reco-m/core-ui";

import {Namespaces, testModel} from "@reco-m/ipark-common-models"
export namespace IparkTest {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, testModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        isRoot = true;
        showloading = false;
        headerContent = "常用调试";
        namespace = Namespaces.iparktest;
        view;
        showback = false;
        componentDidMount() {

        }
        renderBody() {
            return (
                <div>
                    <div
                        style={{ margin: "15px", textAlign: "center", lineHeight: "2", border: "1px solid", fontSize: "15px" }}
                        onClick={() => {
                            callModal(`清除本地缓存?`, () => {
                                clearStorage();
                                localStorage.clear();
                            });
                        }}
                    >
                        清除本地缓存
                    </div>
                    <div
                        style={{ margin: "15px", textAlign: "center", lineHeight: "2", border: "1px solid", fontSize: "15px" }}
                        onClick={() => {
                            callModal(`移动端本地调试?`, () => {
                                window["eruda"] && window["eruda"].init();
                                setTimeout(() => {
                                    this.goTo("/index");
                                }, 600);
                            });
                        }}
                    >
                        移动端本地调试
                    </div>
                    <div
                        style={{ margin: "15px", textAlign: "center", lineHeight: "2", border: "1px solid", fontSize: "15px" }}
                        onClick={() => {
                            this.goTo("form");
                        }}
                    >
                        表单快捷实例
                    </div>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.iparktest]);
}
