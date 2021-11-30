import React from "react";

import Rater from "react-rater";

import { Modal, Toast, Flex, Steps, Card, List, WhiteSpace, Button, NavBar, Icon } from "antd-mobile-v2";

import { template, formatDateTime, formatDate, friendlyTime } from "@reco-m/core";

import { ViewComponent, HtmlContent } from "@reco-m/core-ui";

import { Namespaces, PayWayEnum, OrderStatusEnum, isRoom, isPosition, getHour, ResourceOrderTypeEnum, myorderrefundorderdetailModel } from "@reco-m/order-models";

import { getRefundStatus, getCommentAuditStatus } from "@reco-m/order-common";

import { InvoiceEnum, InvoiceTypeEnum } from "@reco-m/invoice-models";
import { CommentAuditStatusEnum } from "@reco-m/ipark-common";
import { MyOrderCountDown } from "./my.order.countdown";

export namespace RefundOrderDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, myorderrefundorderdetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.myorderrefundorderdetail;
        showloading = false;

        componentMount(): void {
            this.refreshData();
        }

        refreshData() {
            let id = this.getSearchParam("id") ? this.getSearchParam("id") : this.props.match!.params.detailid;
            this.dispatch({ type: `initPage`, data: { id } });
        }

        renderHeader(): React.ReactNode {
            return (
                <NavBar className="park-nav" icon={<Icon type="left" />} onLeftClick={() => this.goBack()}>
                    我的订单详情
                </NavBar>
            );
        }

        renderHeaderView(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                order && (
                    <List>
                        <List.Item extra={<div>{getRefundStatus(order.orderStatus)}</div>} align="top" wrap>
                            订单编号：{order.orderNo}
                            <List.Item.Brief>
                                <div className="size-14">
                                    <span className="margin-right-sm">
                                        <i className="icon icon-shijian1 size-14" /> <span>{formatDateTime(order.inputTime)}</span>
                                    </span>
                                    <i className="icon icon-gerenzhongxin size-14" /> <span>{order.contactPerson}</span>
                                </div>
                            </List.Item.Brief>
                        </List.Item>
                    </List>
                )
            );
        }

        timeBack(t: any) {
            this.dispatch({ type: "input", data: { time: t } });
        }

        /**
         * 倒计时结束
         */
        timeDownOver() {
            this.refreshData();
        }

        /**
         * 倒计时
         */
        renderPaidTimeView(): React.ReactNode {
            let { state } = this.props;
            const order = state!.order;
            return this.renderEmbeddedView(MyOrderCountDown.Page as any, {
                order: order,
                timeBack: this.timeBack.bind(this),
                timeDownOver: this.timeDownOver.bind(this)
            });
        }

        renderOrderItem(title: string, content: any): React.ReactNode {
            return (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm gray-two-color feedback-details-name">{title}</span>
                        <Flex.Item className="no-omit">{content}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        renderOrderTime(order: any): React.ReactNode {
            if (isRoom(order.orderSubType)) {
                return this.renderOrderItem("预订时长", `${getHour(order.serviceStartDate, order.serviceEndDate)}小时`);
            } else if (isPosition(order.orderSubType)) {
                return this.renderOrderItem("预订个数", order.quantity);
            }
            return "" as any;
        }

        renderOrderDate(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return order && (order.orderSubType === ResourceOrderTypeEnum.meetingType || order.orderSubType === ResourceOrderTypeEnum.squareType) ? (
                this.renderOrderItem("预订日期", formatDate(order.serviceStartDate))
            ) : (
                    <div>
                        {
                            this.renderOrderItem(
                                "开始时间",
                                order.orderSubType === ResourceOrderTypeEnum.workingType || order.orderSubType === ResourceOrderTypeEnum.advertisementType
                                    ? formatDate(order.serviceStartDate)
                                    : formatDateTime(order.serviceStartDate)
                            )!
                        }
                        {
                            this.renderOrderItem(
                                "结束时间",
                                order.orderSubType === ResourceOrderTypeEnum.workingType || order.orderSubType === ResourceOrderTypeEnum.advertisementType
                                    ? formatDate(order.serviceEndDate)
                                    : formatDateTime(order.serviceEndDate)
                            )!
                        }
                    </div>
                );
        }

        renderOrderDetailView(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                order && (
                    <List className="width-span" renderHeader={() => "预订信息" as any}>
                        {this.renderOrderItem("预订资源", order.subject)!}
                        {this.renderOrderItem("订单金额", `${order.totalAmount}元`)!}
                        {order.OriginalPrice && this.renderOrderItem("原金额", `${order.originalPrice}元`)!}
                        {order.OriginalPrice && this.renderOrderItem("原金额", `${order.originalPrice}元`)!}
                        {this.renderOrderTime(order)!}
                        {this.renderOrderDate()!}
                        {order.remarks &&
                            this.renderOrderItem("备注留言", <HtmlContent.Component className="html-details resource-color" html={order.remarks.replace(/\n/g, "<br>")} />)!}
                    </List>
                )
            );
        }
        readerBadgeText(invoiceStatusID: number) {
            if (invoiceStatusID === +InvoiceTypeEnum.regist) {
                return "预登记";
            } else if (invoiceStatusID === +InvoiceTypeEnum.billWait) {
                return "待开票";
            } else if (invoiceStatusID === +InvoiceTypeEnum.cancelBill) {
                return "开票取消";
            } else if (invoiceStatusID === +InvoiceTypeEnum.billSuccess) {
                return "已开票";
            } else {
                return "";
            }
        }
        readerInvoiceType(InvoiceType: number) {
            if (InvoiceType === InvoiceEnum.generalInvoice) {
                return "增值税普通发票";
            } else if (InvoiceType === InvoiceEnum.specialInvoice) {
                return "增值税专用发票";
            } else if (InvoiceType === InvoiceEnum.personalInvoice) {
                return "个人普通发票";
            } else {
                return "";
            }
        }
        /**
         * 渲染发票信息
         */
        renderInvoiceMessage(): React.ReactNode {
            const { state } = this.props,
                invoiceMessage = state!.invoiceMessage;

            return invoiceMessage ? (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List className="width-span" renderHeader={"开票信息"}>
                        {this.renderOrderItem("发票主体", invoiceMessage.invoiceType === InvoiceEnum.personalInvoice ? "个人" : "公司")!}
                        {this.renderOrderItem("开票状态", this.readerBadgeText(invoiceMessage.invoiceStatus))}
                        {invoiceMessage.invoiceNo && this.renderOrderItem("发票编号", invoiceMessage.invoiceNo)!}
                        {this.renderOrderItem("发票类型", this.readerInvoiceType(invoiceMessage.invoiceType))}
                        {this.renderOrderItem("发票抬头", invoiceMessage.title)!}
                        {invoiceMessage.taxId && this.renderOrderItem("纳税识别号", invoiceMessage.taxId)}
                        {this.renderOrderItem("开票金额", `${invoiceMessage.totalAmount}元`)!}
                        {invoiceMessage.updateTime &&
                            this.renderOrderItem("开票时间", friendlyTime(invoiceMessage.updateTime && invoiceMessage.updateTime.split(".")[0]))!}
                    </List>
                </>
            ) : null;
        }

        /**
         * 渲染个人信息
         */
        renderPersonMessage(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                order && (
                    <List className="width-span" renderHeader={() => "个人信息" as any}>
                        {this.renderOrderItem("姓名", order.contactPerson)!}
                        {this.renderOrderItem("手机号码", order.contactMobile)!}
                        {this.renderOrderItem("邮箱", order.contactEmail)!}
                        {this.renderOrderItem("公司名称", order.customerName)!}
                    </List>
                )
            );
        }

        /**
         * 支付信息
         */
        renderPayDetailView(): React.ReactNode {
            const { state } = this.props,
                paymessage = state!.paymessage;

            return paymessage && paymessage.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List className="width-span" renderHeader={"支付信息"}>
                        {
                            this.renderOrderItem(
                                "支付方式",
                                (paymessage[0] && paymessage[0].tradeChannel) === PayWayEnum.alipay ? "支付宝" : paymessage[0].tradeChannel === PayWayEnum.wechat ? "微信" : "其他"
                            )!
                        }
                        {this.renderOrderItem("支付金额", <span
                            style={{ color: "orange" }}>￥{paymessage[0] && paymessage[0].totalAmount}&nbsp; 元</span>)!}
                    </List>
                </>
            ) : null;
        }

        renderCommentView(): React.ReactNode {
            const { state } = this.props,
                comments = state!.comments;

            return (
                comments &&
                comments.length > 0 &&
                comments[0] && (
                    <List className="width-span" renderHeader={<div>评价信息{comments[0].auditStatus !== CommentAuditStatusEnum.pass && (
                        <span className={`margin-left-xs size-12 color-${getCommentAuditStatus(comments[0].auditStatus, "class")}`}>
                            {getCommentAuditStatus(comments[0].auditStatus)}
                        </span>
                    )}</div>}>
                        {this.renderOrderItem("评价级别", <Rater total={5} rating={comments[0].score} interactive={false} />)!}
                        {this.renderOrderItem("评价内容", comments[0].rateContent)!}
                    </List>
                )
            );
        }

        renderOrderLogListItem(item: any, key: number): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return order && key === 0 ? (
                <Steps.Step key={key} title={item.operate} status={"process"} icon={<Icon type={"check-circle-o"} size={"xs"} />} description={formatDateTime(item.inputTime)} />
            ) : (
                    <Steps.Step
                        key={key}
                        title={item.operate}
                        status={"wait"}
                        icon={<i className="steps-icon icon icon-webtubiaozhengli20 size-14" />}
                        description={formatDateTime(item.inputTime)}
                    />
                );
        }

        renderOrderLogList(): React.ReactNode {
            const { state } = this.props,
                logs = state!.logs;

            if (logs) {
                let logList = [...logs];
                return logList && logList.length > 0 ? (
                    <List className="margin-bottom-sm" renderHeader={() => "处理进度" as any}>
                        <Card full>
                            <Card.Body>
                                <Steps size="small">
                                    {logList.map((item, i) => {
                                        return this.renderOrderLogListItem(item, i);
                                    })}
                                </Steps>
                            </Card.Body>
                        </Card>
                    </List>
                ) : (
                        null
                    );
            }

            return null;
        }

        /**
         * 重新预订
         */
        renderRerefundApplyButtonModal(order) {
            Modal.alert(
                "退款提示",
                <div>
                    本次申请退款金额为<span style={{ color: "red" }}>￥{order.totalAmount}</span>,是否继续？
                </div>,
                [
                    {
                        text: "取消"
                    },
                    {
                        text: "确定",
                        onPress: () => {
                            this.dispatch({ type: "reRefundOrder", rerefund: { id: order.id } });
                            Toast.success("您已重新提交退款申请成功。", 1, () => {
                                this.goBack();
                            });
                        }
                    }
                ]
            );
        }
        renderRerefundApplyButton(order: any): React.ReactNode {
            if (order.orderStatus === OrderStatusEnum.refundFaild) {
                return (
                    <Flex.Item className="margin-0">
                        <Button
                            type={"primary"}
                            style={{ width: "100%" }}
                            inline
                            onClick={() => {
                                this.renderRerefundApplyButtonModal(order);
                            }}
                        >
                            重新申请
                        </Button>
                    </Flex.Item>
                );
            }

            return null;
        }

        /**
         * 待退款取消
         */
        renderCancelrefundApplyButtonModal(order) {
            Modal.alert("操作提示", "取消后管理员将无法收到此退款申请，是否确认取消申请？", [
                {
                    text: "取消"
                },
                {
                    text: "确定",
                    onPress: () => {
                        this.dispatch({ type: "cancelRefundOrder", cancelrefund: { id: order.id } });
                        Toast.success("退款申请已取消成功。", 1, () => {
                            this.goBack();
                        });
                    }
                }
            ]);
        }
        renderCancelrefundApplyButton(order: any): React.ReactNode {
            if (order.orderStatus === OrderStatusEnum.unrefund) {
                return (
                    <Button
                        type="primary"
                        style={{ width: "100%", borderRadius: "30px" }}
                        inline
                        onClick={() => {
                            this.renderCancelrefundApplyButtonModal(order);
                        }}
                    >
                        取消申请
                    </Button>
                );
            }

            return null;
        }

        /**
         * 退款申请
         */
        renderRefundApplyButtonModal(order) {
            Modal.alert(
                "退款提示",
                <div>
                    本次申请退款金额为<span style={{ color: "red" }}>￥{order.totalAmount}</span>,是否继续？
                </div>,
                [
                    {
                        text: "取消"
                    },
                    {
                        text: "确定",
                        onPress: () => {
                            this.dispatch({ type: "cancelOrder", cancel: { id: order.id } });
                            Toast.success("您已提交退款申请成功。", 1, () => {
                                this.goBack();
                            });
                        }
                    }
                ]
            );
        }
        renderRefundApplyButton(order: any): React.ReactNode {
            if (order.orderStatus === OrderStatusEnum.unapproval) {
                return (
                    <Button
                        type={"primary"}
                        style={{ width: "100%", borderRadius: "30px" }}
                        inline
                        onClick={() => {
                            this.renderRefundApplyButtonModal(order);
                        }}
                    >
                        申请退款
                    </Button>
                );
            }

            return null;
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                order &&
                order.serviceStartDate && (
                    <Flex className="flex-collapse">
                        {this.renderRerefundApplyButton(order)}
                        {this.renderCancelrefundApplyButton(order)}
                        {this.renderRefundApplyButton(order)}
                    </Flex>
                )
            );
        }

        renderBody(): React.ReactNode {
            return (
                <>
                    {this.renderHeaderView()}
                    {this.renderPaidTimeView()}
                    {this.renderOrderDetailView()}
                    {this.renderInvoiceMessage()}
                    {this.renderPersonMessage()}
                    {this.renderPayDetailView()}
                    {this.renderCommentView()}
                    {this.renderOrderLogList()}
                    <WhiteSpace />
                </>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.myorderrefundorderdetail]);
}
