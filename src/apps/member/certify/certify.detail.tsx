import React from "react";

import { Button, List, WhiteSpace, Steps, Flex, Modal, Toast } from "antd-mobile-v2";

import { template, multiLineText } from "@reco-m/core";
import { ViewComponent, HtmlContent, Picture, setEventWithLabel, popstateHandler } from "@reco-m/core-ui";

import { Namespaces, CertifyStatusEnum, certifyDetailModel } from "@reco-m/member-models";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { SelectCompanyUser } from "./certify.detail.user.select";

export namespace CertifyDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, certifyDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "企业认证";
        showloading = false;
        namespace = Namespaces.certifyDetail;
        certifyID;

        componentDidMount() {
            setEventWithLabel(statisticsEvent.authenticationInformationView);
            const id = this.getSearchParam("id");
            this.certifyID = id ? id : this.props.match!.params.id;
            this.loadAttach(this.certifyID);
            this.dispatch({ type: `initPage`, params: this.certifyID });
        }

        componentReceiveProps(nextProps: Readonly<P>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.dispatch({ type: "getCertify", params: this.certifyID });
                this.loadAttach(this.certifyID);
            }
        }

        unbindError(count) {
            let modal = Modal.alert(
                "操作提示",
                <div style={{ textAlign: "left", fontSize: "14px" }}>
                    您为该企业(共有<span style={{ color: "orange" }}>{count}</span>位认证用户)的唯一管理员，无法进行解绑，需设置其他用户为管理员后，将自动完成企业解绑~
                </div>,
                [
                    {
                        text: "取消",
                        onPress: () => {
                            popstateHandler.removePopstateListener();
                        },
                    },
                    {
                        text: "去设置",
                        onPress: () => {
                            popstateHandler.removePopstateListener();
                            this.dispatch({ type: "input", data: { companyOpen: true } });
                        },
                    },
                ]
            );
            popstateHandler.popstateListener(() => {
                modal.close();
            });
        }
        unbindClickModel() {
            const { state } = this.props,
                detail = state!.certifyDetail;

            let modal = Modal.alert(
                "操作提示",
                <div style={{ textAlign: "left", fontSize: "14px" }}>
                    解绑后，您将会：
                    <ul style={{ paddingLeft: "20px" }}>
                        <li>
                            <i style={{ fontSize: "18px", fontStyle: "inherit", marginRight: "5px" }}></i>由【{detail.companyUserTypeName}】转变为【普通用户】
                        </li>
                        <li style={{ lineHeight: "30px", marginBottom: "10px" }}>
                            <i style={{ fontSize: "18px", fontStyle: "inherit", marginRight: "5px" }}></i>企业权限提供的功能将无法使用
                        </li>
                    </ul>
                    确认继续解绑吗？
                </div>,
                [
                    {
                        text: "取消",
                        onPress: () => {
                            popstateHandler.removePopstateListener();
                        },
                    },
                    {
                        text: "确定",
                        onPress: () => {
                            popstateHandler.removePopstateListener();
                            this.dispatch({
                                type: "unBindCompany",
                                id: detail.accountId,
                                callback: () => {
                                    Toast.success("解绑成功", 2, this.goBack.bind(this));
                                },
                                errorback: (count) => {
                                    this.unbindError(count);
                                },
                            });

                            setEventWithLabel(statisticsEvent.enterpriseInformationUnbund);
                        },
                    },
                ]
            );
            popstateHandler.popstateListener(() => {
                modal.close();
            });
        }


        renderCertifyStep(detail: any): React.ReactNode {
            const { status: detailsstatus } = detail;

            let status = 1;

            if (detailsstatus === CertifyStatusEnum.noConfim || detailsstatus === CertifyStatusEnum.bounced) {
                status = 1;
            } else {
                status = 2;
            }

            return (
                <List key={"a"}>
                    <List.Item className="padding-v-sm">
                        <Steps current={status} direction="horizontal" size="small">
                            <Steps.Step title={detail.isNewCompanyAuthentication ? "提交企业信息" : "未认证"} />
                            <Steps.Step title={detailsstatus === CertifyStatusEnum.bounced ? "已退回" : detail.isNewCompanyAuthentication ? "审核处理" : "待审核"} />
                            <Steps.Step title={detail.isNewCompanyAuthentication ? "成为管理员" : "已认证"} />
                        </Steps>
                    </List.Item>
                </List>
            );
        }

        renderItem(title: string, content: string): React.ReactNode {
            return (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm gray-two-color">{title}</span>
                        <Flex.Item className="no-omit">{content}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        // 认证信息
        renderCertifyInfo(detail: any): React.ReactNode {
            return (
                <List key={"b"} className="width-span" renderHeader="认证信息">
                    {this.renderItem("认证园区", detail.parkName)!}
                    {!detail.isNewCompanyAuthentication && this.renderItem("认证类型", detail.companyUserTypeName)!}
                    {this.renderItem("认证企业", detail.companyName)!}
                    {detail.isNewCompanyAuthentication && this.renderItem("统一信用码", detail.creditCode)!}
                    {detail.isNewCompanyAuthentication && this.renderItem("经营地址", detail.address)!}
                    {this.renderItem("真实姓名", detail.realName)!}
                    {this.renderItem("手机号码", detail.mobile)!}
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm gray-three-color">证明材料</span>
                        </Flex>
                        <Picture.Component tableName={IParkBindTableNameEnum.certify} customType={1} readonly={true} />
                    </List.Item>
                </List>
            );
        }

        // 退回原因
        renderBackInfo(detail: any): React.ReactNode {
            return (
                <List key={"c"} className="width-span">
                    {detail && detail.rejectReason && detail.status === CertifyStatusEnum.bounced ? (
                        <List.Item>
                            <Flex>
                                <span className="margin-right-sm gray-three-color">退回原因</span>
                                <Flex.Item className="no-omit">
                                    <HtmlContent.Component className="html-details resource-color" html={multiLineText(detail.rejectReason)} />
                                </Flex.Item>
                            </Flex>
                        </List.Item>
                    ) : (
                        <div></div>
                    )}
                </List>
            );
        }
        renderButtonBounced(detail: any): React.ReactNode {
            const { status: detailsstatus, isNewCompanyAuthentication, companyId } = detail;
            return detailsstatus === CertifyStatusEnum.bounced ? (
                <Button
                    type={"primary"}
                    style={{ borderRadius: "30px" }}
                    onClick={() => {
                        this.dispatch("input", { isBack: true });
                        if (isNewCompanyAuthentication) {
                            // 企业认证被退回
                            this.goTo(`companycertify/${companyId}`);
                        } else {
                            // 会员认证被退回
                            this.goTo(`update/${detail.id}`);
                        }
                    }}
                >
                    重新提交
                </Button>
            ) : detailsstatus === CertifyStatusEnum.allow ? (
                <Button style={{ borderRadius: "30px" }} type="primary" onClick={this.unbindClickModel.bind(this)}>
                    企业解绑
                </Button>
            ) : (
                ""
            );
        }
        renderButtonNoConfim(detail: any): React.ReactNode {
            const { status: detailsstatus } = detail;
            return (
                detailsstatus === CertifyStatusEnum.noConfim && (
                    <Button
                        type="primary"
                        style={{ borderRadius: "30px" }}
                        onClick={() => {
                            Modal.alert("操作提示", "取消后，管理员将无法对您进行身份审核，是否确认取消？", [
                                { text: "取消", onPress: () => console.log("cancel") },
                                {
                                    text: "确认",
                                    onPress: () => {
                                        this.dispatch({
                                            type: "cancelBindCompany",
                                            id: detail.id,
                                            callback: () => {
                                                Toast.success("取消成功", 2, this.goBack.bind(this));
                                            },
                                        });
                                    },
                                },
                            ]);
                        }}
                    >
                        取消申请
                    </Button>
                )
            );
        }
        // 底部按钮
        renderButton(detail: any): React.ReactNode {
            return (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        {this.renderButtonBounced(detail)}

                        {this.renderButtonNoConfim(detail)}
                    </Flex.Item>
                </Flex>
            );
        }
        refScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this)
                .parents()
                .find(".am-navbar")
                .css({
                    boxShadow: `0 3px 4px rgba(0,0,0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1})`,
                });
        }

        selectCompanyUser() {
            (document.activeElement as any)!.blur();
            const { state } = this.props;
            this.dispatch({ type: "input", data: { companyOpen: !state!.companyOpen } });
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                detail = state!.certifyDetail,
                companyOpen = state!.companyOpen,
                company = state!.company || {},
                companyProps: any = {
                    isOpen: () => companyOpen,
                    close: () => {
                        this.selectCompanyUser();
                    },
                    selectedCall: (data: any) => this.dispatch("input", { selectedCompany: data }),
                    confirmSelect: (data: any) => {
                        this.dispatch("input", { companyUser: data, companyOpen: false });
                        this.dispatch({
                            type: "setUserManager",
                            companyUser: data,
                            member: detail,
                            callback: () => {
                                Toast.success("解绑成功", 2, this.goBack.bind(this));
                            },
                        });
                    },
                    item: company,
                };
            return (
                detail && (
                    <div>
                        {this.renderCertifyStep(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderCertifyInfo(detail)}
                        {this.renderBackInfo(detail)}
                        {this.renderEmbeddedView(SelectCompanyUser.Page as any, { ...companyProps })}
                    </div>
                )
            );
        }
        renderFooter(): React.ReactNode {
            const { state } = this.props,
                detail = state!.certifyDetail;
            return detail && this.renderButton(detail);
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.certifyDetail]);
}
