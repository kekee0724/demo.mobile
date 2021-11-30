import React from "react";

import { Result, Icon, Button, NavBar } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent, Container } from "@reco-m/core-ui";

import { Namespaces } from "@reco-m/survey-models";

export namespace SurveyFormSuccess {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "问卷调查";
        namespace = Namespaces.surveyFormSuccess;
        scrollable = false;
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
        }
        renderHeader(): React.ReactNode {
            return (
                <NavBar className="park-nav back-none new-bg-opcity1" leftContent={this.renderHeaderLeft()} rightContent={this.renderHeaderRight()}>
                    {this.renderHeaderContent()}
                </NavBar>
            );
        }
        renderHeaderLeft(): React.ReactNode {
            return (
                null
            );
        }
        renderHeaderright(): React.ReactNode {
            return (
                null
            );
        }
        renderHeaderContent(): React.ReactNode {
            return (
                <div
                    className="max-title"
                    style={{ color: "black" }}
                >
                    问卷调查
                </div>
            )
        }
        renderBody(): React.ReactNode {
            return (
                <Container.Component direction={"column"} fill align={"center"} justify={"center"}>
                    <div>
                        <div key={"a"} className="result-icon">
                            <Result img={<Icon type="check-circle" className="full" />} title="" className='padding-v-0 margin-top-0' />
                        </div>
                        <div key={"b"} className="success-tips padding-bottom">
                            <p>谢谢您参与调研</p>
                            <p>您的支持就是我们园区进步的动力</p>
                        </div>
                        <div className='text-center margin-top'>
                            {
                                this.isAuth() &&
                                <Button inline className="primary-back-color white-color button-round" style={{ width: 200 }} onClick={() => this.goTo(`/`)}>返回首页</Button>
                            }
                        </div>
                    </div>
                </Container.Component>
            );
        }
        renderFooter(): React.ReactNode {
            return (
                null

            )
        }
    }

    export const Page = template(Component, state => state[Namespaces.surveyFormSuccess]);
}
