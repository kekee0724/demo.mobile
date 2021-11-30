import React from "react";

import { Modal, List, Button, Toast } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ListComponent, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, invoiceTitleModel } from "@reco-m/invoice-models";

import { InvoiceTitleTypeEnum } from "@reco-m/ipark-common";
import { readerInvoiceType } from "./common"
export namespace InvoiceTitle {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
    }

    export interface IState extends ListComponent.IState, invoiceTitleModel.StateType {
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "发票抬头";
        scrollable = false;
        bodyClass = "container-height";
        status = null;
        namespace = Namespaces.invoiceTitle;

        componentDidMount() {
            this.getData({ pageIndex: 1 });
        }

        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.getData({ pageIndex: 1 });
            }
        }

        getData(data: any) {
            this.dispatch({
                type: "getInvoiceTitleList",
                invoice: data
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getData({ pageIndex: 1 });
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getData({ pageIndex: (state!.currentPage || 0) + 1 });
        }

        renderHeaderRight(): React.ReactNode {
            return (
                <i className="icon icon-jiahao" onClick={() => {
                    this.goTo("edit/0/1");
                }} />
            );
        }

        renderSpecialInvoice(invoiceTitle: any): React.ReactNode {
            return invoiceTitle.invoiceType === InvoiceTitleTypeEnum.speciallyInvoice ? (
                <List.Item.Brief>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">发票类型：</span>
                        <span style={{ color: "#02b8cd" }}>{readerInvoiceType(invoiceTitle.invoiceType)}</span>
                    </div>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">公司名称：</span>
                        {invoiceTitle.title}
                    </div>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">纳税标识：</span>
                        {invoiceTitle.taxId}
                    </div>
                </List.Item.Brief>
            ) : null;
        }

        renderCommenInvoice(invoiceTitle: any): React.ReactNode {
            return invoiceTitle.invoiceType === InvoiceTitleTypeEnum.commonInvoice ? (
                <List.Item.Brief>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">发票类型：</span>
                        <span style={{ color: "#02b8cd" }}>{readerInvoiceType(invoiceTitle.invoiceType)}</span>
                    </div>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">公司名称：</span>
                        {invoiceTitle.title}
                    </div>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">纳税标识：</span>
                        {invoiceTitle.taxId}
                    </div>
                </List.Item.Brief>
            ) : null;
        }

        renderPersonInvoice(invoiceTitle: any): React.ReactNode {
            return invoiceTitle.invoiceType === InvoiceTitleTypeEnum.personInvoice ? (
                <List.Item.Brief>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">发票类型：</span>
                        <span style={{ color: "#ffbf29" }}>{readerInvoiceType(invoiceTitle.invoiceType)}</span>
                    </div>
                    <div className="size-14 omit omit-1">
                        <span className="width-title">发票抬头：</span>
                        {invoiceTitle.title}
                    </div>
                </List.Item.Brief>
            ) : null;
        }

        renderItemsContent(invoiceTitle: any): React.ReactNode {
            return (
                <List className="list-item-no invoice-title-list my-apply-list">
                        <List.Item
                            extra={
                                <div>
                                    <div>{invoiceTitle.InvoiceStatus}</div>
                                </div>
                            }
                            align="top"
                            multipleLine
                        >
                            {this.renderSpecialInvoice(invoiceTitle)}
                            {this.renderCommenInvoice(invoiceTitle)}
                            {this.renderPersonInvoice(invoiceTitle)}
                            {this.renderItemFooter(invoiceTitle)}
                        </List.Item>
                    </List>
            );
        }

        deleteInvoiceBtn(invoiceTitle: any) {
            Modal.alert("操作提示" as any, `是否确认删除？` as any, [
                { text: "取消" },
                {
                    text: "确认",
                    onPress: () => {
                        this.dispatch({
                            type: "invoiceTitleDelete",
                            params: invoiceTitle.id,
                            callback: () => {
                                setEventWithLabel(statisticsEvent.invoiceRiseDelete)
                                Toast.success("已删除发票", 2, () => {
                                    this.getData({ pageIndex: 1 });
                                });
                            }
                        });
                    }
                }
            ]);
        }

        renderItemFooter(invoiceTitle: any): React.ReactNode {
            return (
                <div className="my-bottom">
                    <div className="my-apply-btn">
                        <Button
                            style={{ float: "right" }}
                            className="invoice-title-btn2"
                            size="small"
                            inline
                            onClick={e => {
                                e.stopPropagation();
                                this.deleteInvoiceBtn(invoiceTitle);
                            }}
                        >
                            <span>删除</span>
                        </Button>
                        <Button
                            style={{ float: "right", marginRight: "5px" }}
                            className="invoice-title-btn1"
                            size="small"
                            inline
                            onClick={e => {
                                e.stopPropagation();
                                this.goTo(`edit/${invoiceTitle.id}/1`);
                            }}
                        >
                            <span>修改</span>
                        </Button>
                    </div>
                </div>
            );
        }

        refScroll(el: any) {
            super.refScroll(el);
            $(el).find('.am-list-view-scrollview').off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(".am-navbar").css({
                boxShadow: `0 3px 4px rgba(0,0,0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1})`
            });
        }

        renderBody(): React.ReactNode {
            return <div className="container-body apply-container">
                {this.getListView()}
            </div>;
        }
    }

    export const Page = template(Component, state => state[Namespaces.invoiceTitle]);
}
