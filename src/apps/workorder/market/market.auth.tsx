import React from "react";
import * as QrCode from "qrcode.react";
import { WingBlank, WhiteSpace, List, InputItem, Icon, Button, Drawer, Flex, Toast } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent, Countdown } from "@reco-m/core-ui";

import { marketauthModel, Namespaces } from "@reco-m/workorder-models";

export namespace MarketAuth {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, marketauthModel.StateType {
        open?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.marketauth;
        institutionId;
        id;
        componentDidMount() {
            this.institutionId = this.getSearchParam("institutionId");
            this.id = this.getSearchParam("id");
            this.dispatch({ type: `initPage`, data: { institutionId: this.institutionId, id: this.id } });
        }

        submitVerification() {
            const { state } = this.props,
                marketPersonDetail = state!.marketPersonDetail,
                code = state!.code;

            if (!state!.code) {
                Toast.fail("请输入验证码");
                return;
            }
            this.dispatch({
                type: "submitVerification",
                data: { mobile: marketPersonDetail.currentContactPersonMobile, id: this.id, code },
                institutionId: this.institutionId,
                callback: (result) => {
                    if (result) {
                        this.setState({ open: true });
                    } else {
                        Toast.fail("验证码错误!");
                    }
                },
            });
        }
        sendVerifyCode(delay: Function) {
            const { state } = this.props,
                marketPersonDetail = state!.marketPersonDetail;
            this.dispatch({
                type: "sendVerifyCode",
                data: { mobile: marketPersonDetail.currentContactPersonMobile, id: this.id },
                delay,
            });
        }
        renderSideBar(): React.ReactNode {
            return (
                <div className="authentication-drawer-detail">
                    <WingBlank>
                        <div className="container-column container-fill">
                            <Flex justify="center">
                                <div className="text-center">
                                    <p>
                                        {" "}
                                        <Icon size={"lg"} className="color-blue" type={"check-circle"} />
                                    </p>
                                    <p className="size-26">身份验证成功</p>
                                    <p className="gray-three-color text">{` 恭喜您完成身份验证！您可下载并登录"${server["appname"]}",至“我的”中进行相关产品的发布和服务受理~`}</p>
                                    <WhiteSpace size={"lg"} />
                                    <p className="gray-three-color">{server["appname"]}下载二维码</p>
                                    <QrCode size={150} value={server["appdownload"]} />
                                    <WhiteSpace size={"lg"} />
                                    <WhiteSpace size={"lg"} />
                                    <Button onClick={this.onOpenChange} className="radius-button" type="primary">
                                        知道啦
                                    </Button>
                                </div>
                            </Flex>
                        </div>
                    </WingBlank>
                </div>
            );
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                marketPersonDetail = state!.marketPersonDetail || {},
                marketDetail = state!.marketDetail;
            const { serviceInstitutionBasicFormVM: insBasic = {} } = marketDetail || {};
            return (
                <Drawer sidebar={this.renderSideBar()} docked={false} open={this.state.open} onOpenChange={this.onOpenChange} position="bottom">
                    <div className={"text-center"}>
                        <WhiteSpace size={"lg"} />
                        <p className="size-16">亲爱的小主</p>
                        <p>为了保证您所在机构的服务安全性</p>
                        <p>请完成身份验证</p>
                        <WhiteSpace size={"lg"} />
                    </div>
                    <WingBlank>
                        <List className="authentication-list">
                            <InputItem placeholder="自动带入" value={insBasic.institutionName} editable={false}>
                                机构名称
                            </InputItem>
                            <InputItem placeholder="请输入" value={marketPersonDetail.currentContactPerson} editable={false}>
                                真实姓名
                            </InputItem>
                            <InputItem placeholder="请输入" value={marketPersonDetail.currentContactPersonMobile} editable={false}>
                                手机号码
                            </InputItem>
                            <InputItem
                                extra={<Countdown.Component start={this.sendVerifyCode.bind(this)} content="获取验证码" type="marketauth" />}
                                placeholder="请输入"
                                onChange={(code) => this.dispatch({ type: "input", data: { code } })}
                            >
                                验证码
                            </InputItem>
                        </List>
                        <Button onClick={() => this.submitVerification()} className="radius-button" type="primary">
                            完成验证
                        </Button>
                    </WingBlank>
                </Drawer>
            );
        }

        onOpenChange = () => {
            this.setState({ open: !this.state.open });
            this.goTo("/")
        };
    }

    export const Page = template(Component, (state) => state[Namespaces.marketauth]);
}
