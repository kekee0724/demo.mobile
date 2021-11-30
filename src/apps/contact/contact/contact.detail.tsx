import React from "react";

import { List, Flex, Button, WhiteSpace } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent, ImageAuto, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";
import { callTel } from "@reco-m/ipark-common";
import { iparkContactDetailModel, Namespaces } from "@reco-m/contact-models";

export namespace ContactDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, iparkContactDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "个人资料";
        namespace = Namespaces.contactDetail;
        showloading = false;

        componentDidMount() {
            this.dispatch({ type: "input", data: { contactDetail: null } });
            setEventWithLabel(statisticsEvent.contactView);
            this.dispatch({ type: `initPage`, contactId: this.props.match!.params.id });
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                contact = state!.contactDetail;

            return (
                contact && (
                    <div>
                        <List key={"a"} className="line-border-no contactsdetails">
                            <List.Item
                                align="top"
                                thumb={
                                    <ImageAuto.Component
                                        cutWidth="60"
                                        cutHeight="60"
                                        radius="90"
                                        src={contact.avatar ? contact.avatar : "assets/images/zwtx.png"}
                                        height="60px"
                                        width="60px"
                                    />
                                }
                                multipleLine
                            >
                                <div className="omit omit-1 name">{contact.realName}</div>
                                <div className="omit omit-1 company">{contact.companyName}</div>
                                <div className="omit omit-1">
                                    <span className={"date " + (contact.companyUserTypeName === "企业员工" ? "yellow" : "")}>{contact.companyUserTypeName}</span>
                                </div>
                            </List.Item>
                        </List>
                        <WhiteSpace key={"c"} className="back" />
                        <List className="contactslist">
                            <List.Item>
                                <div className="omit omit-1">
                                    <i className="icon icon-newpel size-14" /> {contact.mobile}
                                </div>
                            </List.Item>
                            <List.Item>
                                <div className="omit omit-1">
                                    <i className="icon icon-youxiang size-14" /> {contact.email}
                                </div>
                            </List.Item>
                        </List>
                    </div>
                )
            );
        }

        renderButton(): React.ReactNode {
            const { state } = this.props,
                contact = state!.contactDetail;

            return (
                <Flex className="flex-collapse tiled-btn">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                setEventWithLabel(statisticsEvent.contactSMS);
                                window.location.href = `sms:${contact.mobile}`;
                            }}
                        >
                            发短信
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                setEventWithLabel(statisticsEvent.contactEmail);
                                window.location.href = `mailto:${contact.email}`;
                            }}
                        >
                            发邮件
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button
                            type={"primary"}
                            onClick={() => {
                                setEventWithLabel(statisticsEvent.contactPhoneCall);
                                callTel(contact.mobile);
                            }}
                        >
                            打电话
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        renderFooter() {
            return this.renderButton();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.contactDetail]);
}
