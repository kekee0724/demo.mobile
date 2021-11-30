import React from "react";

import { Tabs, List, Button, Flex } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";

import { ListComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { invoiceModel, Namespaces } from "@reco-m/invoice-models";

import { tabs, readerBadge, readerInvoiceType } from "./common";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace Invoice {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, invoiceModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        headerContent = "开票记录";
        scrollable = false;
        bodyClass = "container-height";
        status = null;
        namespace = Namespaces.invoice;

        componentDidMount() {
            setEventWithLabel(statisticsEvent.invoiceView)
            this.dispatch({ type: `initPage`, params: { pageIndex: 1, pageSize: 15, invoiceStatus: this.status, bindTableName: IParkBindTableNameEnum.order, parkId: getLocalStorage("parkId") } });
        }

        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
        }

        getData(data: any, status?: any) {
            this.dispatch({
                type: "getInvoiceList",
                params: { pageIndex: data.pageIndex, pageSize: 15, invoiceStatus: (this.status === "" ? null : this.status), bindTableName: IParkBindTableNameEnum.order, ...data, ...status, parkId: getLocalStorage("parkId") }
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
                <i className="icon icon-gongdanliebiao" onClick={() => {
                    this.goTo("/my/invoice/title");
                }} />
            );
        }

        renderItemsContent(invoice: any): React.ReactNode {
            return (
                <List className="list-item-no invoice-title-list my-apply-list">
                        <List.Item
                            align="top"
                            wrap
                            multipleLine
                            onClick={() => {
                                this.goTo(`invoiceDetail/${invoice.id}`);
                            }}
                        >
                                {invoice.invoiceNo && (
                                  <List.Item.Brief>
                                    <div className="size-15 omit omit-1" style={{ color: "black", fontWeight: "bold" }}>
                                      <span className="width-title">发票编号：</span>
                                      {invoice.invoiceNo}
                                      <span style={{ float: "right" }}>{readerBadge(invoice.invoiceStatus)}</span>
                                    </div>
                                  </List.Item.Brief>

                                )}
                          <List.Item.Brief>
                            <Flex className="size-14">
                              <Flex.Item className="omit omit-1">
                                <span className="width-title">发票类型：</span>
                                {readerInvoiceType(invoice.invoiceType)}
                              </Flex.Item>
                              {!invoice.invoiceNo && <span>{readerBadge(invoice.invoiceStatus)}</span>}
                            </Flex>
                          </List.Item.Brief>
                          <List.Item.Brief>
                            <div className="size-14 omit omit-1">
                              <span className="width-title">发票抬头：</span>
                              {invoice.title}
                            </div>
                          </List.Item.Brief>
                          <List.Item.Brief>
                            <div className="size-14 omit omit-1">
                              <span className="width-title">发票内容：</span>
                              {invoice.subject}
                            </div>
                          </List.Item.Brief>
                          <List.Item.Brief>
                            <div className="size-14 omit omit-1">
                              <span className="width-title">发票合计：</span>
                              {invoice.totalAmount}元
                            </div>
                          </List.Item.Brief>
                            {this.renderItemFooter(invoice)}
                        </List.Item>
                    </List>
            );
        }

        renderItemFooter(invoice: any): React.ReactNode {
            return (
                <div className="my-bottom margin-top-sm">
                    {invoice.invoiceStatus === "开票失败" && <span style={{ color: "#f15141", marginLeft: "0.6rem" }}> 失败原因：订单已取消</span>}
                    <div className="my-apply-btn">
                        <Button type="primary" className="invoice-title-btn1" size="small" inline>
                            <span>发票明细</span>
                        </Button>
                        <Button
                            className="invoice-title-btn1"
                            type="primary"
                            size="small"
                            inline
                            onClick={e => {
                                this.goTo(`orderDetails/${invoice.bindTableId}`);
                                e.stopPropagation();
                            }}
                        >
                            <span>订单明细</span>
                        </Button>
                    </div>
                </div>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                showList = state!.showList;
            return (
                <div className="container-body apply-container">
                    <Tabs
                        tabs={tabs()}
                        initialPage={0}
                        swipeable={false}
                        onChange={tab => {
                            if (tab.status === "0") setEventWithLabel(statisticsEvent.invoiceRegisterView);
                            if (tab.status === "1") setEventWithLabel(statisticsEvent.invoiceStayView);
                            if (tab.status === "2") setEventWithLabel(statisticsEvent.invoiceAlreadyView);
                            if (tab.status === "-1") setEventWithLabel(statisticsEvent.invoiceCancelView);
                            this.dispatch({ type: "input", data: { showList: false } });
                            (this.status = tab.status);
                            this.getData({ pageIndex: 1 }, { invoiceStatus: tab.status === "" ? null : tab.status });
                        }}
                    >
                        {!showList ? null : this.getListView()}
                    </Tabs>
                </div>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.invoice]);
}
