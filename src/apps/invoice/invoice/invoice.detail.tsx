import React from "react";

import { List, Flex, WhiteSpace } from "antd-mobile-v2";

import { template, friendlyTime } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { invoiceDetailModel, Namespaces, InvoiceEnum } from "@reco-m/invoice-models";
import { readerBadgeText, readerInvoiceType } from "./common"

export namespace InvoiceDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, invoiceDetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "发票详情";
        namespace = Namespaces.invoiceDetail;

        componentDidMount() {
            setEventWithLabel(statisticsEvent.invoiceDetailView)
            const { id } = this.props.match!.params;

            this.dispatch({ type: `initPage`, data: id });
        }

        renderInvoiceStatus(invoiceDetail: any): React.ReactNode {
            return (
                <List style={{ marginTop: "1rem" }}>
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm  gray-two-color">
                                <span>开票状态</span>
                            </span>
                            <Flex.Item className="no-omit">{readerBadgeText(invoiceDetail.invoiceStatus)}</Flex.Item>
                        </Flex>
                    </List.Item>
                </List>
            );
        }

        renderInvoiceUpdateTime(invoiceDetail: any): React.ReactNode {
            return (
                <List>
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm gray-two-color label-name">
                                <i className="icon icon-ic_alarm_on_px size-18" style={{ marginRight: "5px" }} />
                                <span>开票时间</span>
                            </span>
                            <Flex.Item className="no-omit">{friendlyTime(invoiceDetail.updateTime && invoiceDetail.updateTime.split(".")[0])}</Flex.Item>
                        </Flex>
                    </List.Item>
                </List>
            );
        }

        renderOpenBank(invoiceDetail): React.ReactNode {
            return (
                invoiceDetail.bankName && (
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm  gray-two-color label-name">
                                <span>开户银行</span>
                            </span>
                            <Flex.Item className="no-omit">{invoiceDetail.bankName}</Flex.Item>
                        </Flex>
                    </List.Item>
                )
            );
        }

        renderAccountBank(invoiceDetail): React.ReactNode {
            return (
                invoiceDetail.bankAccount && (
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm  gray-two-color label-name">
                                <span>银行账号</span>
                            </span>
                            <Flex.Item className="no-omit">{invoiceDetail.bankAccount}</Flex.Item>
                        </Flex>
                    </List.Item>
                )
            );
        }

        renderInvoicePank(invoiceDetail): React.ReactNode {
            return (
                <>
                    {this.renderOpenBank(invoiceDetail)}
                    {this.renderAccountBank(invoiceDetail)}
                </>
            );
        }

        renderInvociceTitle(invoiceDetail): React.ReactNode {
            return invoiceDetail.title ? (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm  gray-two-color label-name">
                            <span>{invoiceDetail.invoiceType === InvoiceEnum.personalInvoice ? "发票抬头" : "公司名称"}</span>
                        </span>
                        <Flex.Item className="no-omit">{invoiceDetail.title}</Flex.Item>
                    </Flex>
                </List.Item>
            ) : null;
        }

        renderInvociceNumber(invoiceDetail): React.ReactNode {
            return (
                invoiceDetail.taxId && (
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm  gray-two-color label-name">
                                <span>纳税人识别号</span>
                            </span>
                            <Flex.Item className="no-omit">{invoiceDetail.taxId}</Flex.Item>
                        </Flex>
                    </List.Item>
                )
            );
        }
        renderInvociceAddress(invoiceDetail): React.ReactNode {
            return (
                invoiceDetail.registerAddress && (
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm  gray-two-color label-name">
                                <span>注册地址</span>
                            </span>
                            <Flex.Item className="no-omit">{invoiceDetail.registerAddress}</Flex.Item>
                        </Flex>
                    </List.Item>
                )
            );
        }
        renderInvocicePhone(invoiceDetail): React.ReactNode {
            return (
                invoiceDetail.registerTel && (
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm  gray-two-color label-name">
                                <span>注册电话</span>
                            </span>
                            <Flex.Item className="no-omit">{invoiceDetail.registerTel}</Flex.Item>
                        </Flex>
                    </List.Item>
                )
            );
        }

        renderInvoice(invoiceDetail): React.ReactNode {
            return (
                <List renderHeader="发票抬头信息">
                    {this.renderInvociceTitle(invoiceDetail)!}
                    {this.renderInvociceNumber(invoiceDetail)!}
                    {this.renderInvociceAddress(invoiceDetail)!}
                    {this.renderInvocicePhone(invoiceDetail)!}
                    {this.renderInvoicePank(invoiceDetail)!}
                </List>
            );
        }

        renderInvoiceTime(invoiceDetail): React.ReactNode {
            return (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm  gray-two-color label-name">{invoiceDetail.updateTime ? <span>开票时间</span> : <span>申请时间</span>}</span>
                        <Flex.Item className="no-omit">
                            {invoiceDetail.updateTime
                                ? invoiceDetail.updateTime &&
                                invoiceDetail.updateTime.split(".")[0]
                                    .split("T")
                                    .join(" ")
                                : invoiceDetail.inputTime &&
                                invoiceDetail.inputTime.split(".")[0]
                                    .split("T")
                                    .join(" ")}
                        </Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        refScroll(el) {
            if ($('html').hasClass('theme-white')) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents('.container-page').find('#nav_box_Shadow').length <= 0 && $(this).prevAll('.am-navbar').append('<span id="nav_box_Shadow"></span>')
            $(this).parents('.container-page').find("#nav_box_Shadow").css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`
            });
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                invoiceDetail = state!.invoiceDetail || {};
            return (
                invoiceDetail && (
                    <div>
                        {this.renderInvoiceStatus(invoiceDetail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List renderHeader="开票信息">
                            {this.renderInvoiceTime(invoiceDetail)!}
                            <List.Item>
                                <Flex>
                                    <span className="margin-right-sm  gray-two-color label-name">{invoiceDetail.invoiceType && <span>发票主体</span>}</span>
                                    <Flex.Item className="no-omit">{invoiceDetail.invoiceType === InvoiceEnum.personalInvoice ? "个人" : "公司"}</Flex.Item>
                                </Flex>
                            </List.Item>
                            <List.Item>
                                <Flex>
                                    <span className="margin-right-sm  gray-two-color label-name">
                                        <span>发票类型</span>
                                    </span>
                                    <Flex.Item className="no-omit">{readerInvoiceType(invoiceDetail.invoiceType)}</Flex.Item>
                                </Flex>
                            </List.Item>
                            <List.Item>
                                <Flex>
                                    <span className="margin-right-sm  gray-two-color label-name">
                                        <span>发票内容</span>
                                    </span>
                                    <Flex.Item className="no-omit">{invoiceDetail.subject}</Flex.Item>
                                </Flex>
                            </List.Item>
                            <List.Item>
                                <Flex>
                                    <span className="margin-right-sm  gray-two-color label-name">
                                        <span>价税合计</span>
                                    </span>
                                    <Flex.Item className="no-omit">{invoiceDetail.totalAmount}元</Flex.Item>
                                </Flex>
                            </List.Item>
                        </List>
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderInvoice(invoiceDetail)}
                    </div>
                )
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.invoiceDetail]);
}
