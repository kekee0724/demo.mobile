
import React from "react";

import Rater from "react-rater";

import { List, Flex, Steps, Button, WhiteSpace, Icon, Card, Modal, Toast } from "antd-mobile-v2";

import { template, formatDateTime, friendlyTime, formatDate, multiLineText } from "@reco-m/core";

import { ViewComponent, HtmlContent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { EvaluateStatusEnum, Namespaces, OrderStatusEnum, SkuTypeEnum, isRoom, isPosition, getHour, PayWayEnum, ResourceOrderTypeEnum, myorderdetailModel } from "@reco-m/order-models";

import { appPaySheet, /* getCancelTimed, */ getStatus, getCommentAuditStatus } from "@reco-m/order-common";

import { InvoiceEnum, InvoiceTypeEnum } from "@reco-m/invoice-models";

import { IParkBindTableNameEnum, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { MyOrderCountDown } from "./my.order.countdown";

export namespace MyOrderDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, myorderdetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "我的订单详情";
        namespace = Namespaces.myorderdetail;
        id: any = "";

        componentDidMount(): void {
            setEventWithLabel(statisticsEvent.invoiceOrderView);
            this.refreshData();
        }

        componentReceiveProps(nextProps: IProps) {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.refreshData();
            }
        }
        componentWillUnmount() {
            this.dispatch({ type: "input", data: { order: null } });
        }

        refreshData() {
            const id = this.getSearchParam("id");
            this.id = id ? id : this.props.match!.params.detailid;
            this.dispatch({ type: `initPage`, data: { id: this.id } });
        }

        renderHeaderView(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                order && (
                    <List className="extra-auto">
                        <List.Item align={"top"} extra={<div>{getStatus(order.orderStatus, order.commentStatus)}</div>} wrap>
                            <div>订单编号：{order.orderNo}</div>
                            <List.Item.Brief>
                                <span className="size-14 margin-right">
                                    <i className="icon icon-shijian1 size-14" /> {formatDateTime(order.inputTime)}
                                </span>
                                <span className="size-14">
                                    <i className="icon icon-gerenzhongxin size-14" /> {order.contactPerson}
                                </span>
                            </List.Item.Brief>
                        </List.Item>
                    </List>
                )
            );
        }
        /**
         * 倒计时结束
         */
        timeDownOver() {
            let params = {
                id: this.id,
                summary: "",
            };
            params = Object.assign(params, { orderStatus: "32", operate: "您的订单取消成功。" });

            this.dispatch({
                type: "orderOperateAction",
                params,
                callBack: () => {
                    Toast.success("您的订单已自动取消成功，欢迎再次预订。", 1, () => {
                        if (this.props.location!.pathname!.indexOf("resourceSubmitSucceed") !== -1 || this.props.location!.pathname!.indexOf("resourcePaySucceed") !== -1) {
                            history.go(-4);
                        } else {
                            this.goBack();
                        }
                    });
                },
            });
        }

        /**
         * 倒计时
         */
        renderPaidTimeView() {
            const { state } = this.props,
                order = state!.order;

            return this.renderEmbeddedView(MyOrderCountDown.Page as any, {
                order: order,
                timeBack: () => {},
                timeDownOver: this.timeDownOver.bind(this),
            });
        }

        renderOrderTime(order: any): React.ReactNode {
            return isRoom(order.orderSubType) ? (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm gray-two-color feedback-details-name">预订时长</span>
                        <Flex.Item className="no-omit">{getHour(order.serviceStartDate, order.serviceEndDate)}小时</Flex.Item>
                    </Flex>
                </List.Item>
            ) : isPosition(order.orderSubType) ? (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm gray-two-color feedback-details-name">预订个数</span>
                        <Flex.Item className="no-omit">{order.quantity}</Flex.Item>
                    </Flex>
                </List.Item>
            ) : null;
        }

        renderDetailItem(title: string, content: any): React.ReactNode {
            return (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm gray-two-color feedback-details-name">{title}</span>
                        <Flex.Item className="no-omit">{content}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        renderOrderDate(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;
            return (
                (order && (order.orderSubType === ResourceOrderTypeEnum.meetingType || order.orderSubType === ResourceOrderTypeEnum.squareType) ? (
                    this.renderDetailItem("预订日期", formatDate(order.serviceStartDate, "yyyy/MM/dd hh:mm") + "~" + formatDate(order.serviceEndDate, "hh:mm"))
                ) : (
                        <div>
                            {this.renderDetailItem(
                                "开始时间",
                                order.orderSubType === ResourceOrderTypeEnum.workingType || order.orderSubType === ResourceOrderTypeEnum.advertisementType
                                    ? formatDate(order.serviceStartDate)
                                    : formatDateTime(order.serviceStartDate)
                            )}
                            {this.renderDetailItem(
                                "结束时间",
                                order.orderSubType === ResourceOrderTypeEnum.workingType || order.orderSubType === ResourceOrderTypeEnum.advertisementType
                                    ? formatDate(order.serviceEndDate)
                                    : formatDateTime(order.serviceEndDate)
                            )}
                        </div>
                    )) || null
            );
        }

        renderOrderDetailView(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                order && (
                    <>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List className="width-span" renderHeader={"预订信息"}>
                            {this.renderDetailItem("预订资源", order.subject)!}
                            {order.totalAmount ? this.renderDetailItem("订单金额", `${order.totalAmount}元`)! : null}
                            {(order.originalAmount && order.totalAmount && order.originalAmount > order.totalAmount ? this.renderDetailItem("原金额", <s style={{ color: "lightgray" }}>{order.originalAmount}元</s>) : null)!}
                            {this.renderOrderTime(order)!}
                            {this.renderOrderDate()!}
                            {
                                (!!order.remarks &&
                                    this.renderDetailItem("备注留言", <HtmlContent.Component className="html-details resource-color" html={multiLineText(order.remarks)} />))!
                            }
                        </List>
                    </>
                )
            );
        }

        renderRoomItems(order: any): React.ReactNode {
            let reg = /.*[(](.*)[)]$/g;

            return (
                order &&
                order.orderItem &&
                order.orderItem.map((item: any, i: number) => {
                    if (item.skuType === SkuTypeEnum.goods) {
                        return (
                            <div key={i} className="row">
                                <span>{item.skuName.replace(reg, "$1")}</span>
                                <span>¥{item.totalAmount.toFixed(2)}</span>
                            </div>
                        );
                    }
                })
            );
        }

        renderRoomConfigureItems(order: any): React.ReactNode {
            return (
                order &&
                order.orderItem &&
                order.orderItem.map((item: any, i: number) => {
                    return item.skuType === SkuTypeEnum.service && (
                        <div key={i} className="row">
                            <span>{item.skuName}</span>
                            <span>{item.quantity}</span>
                            <span>¥{item.totalAmount.toFixed(2)}</span>
                        </div>
                    );
                })
            );
        }

        hasRoomConfigure(order: any) {
            let totalPrice = 0;

            order &&
                order.orderItem &&
                order.orderItem.forEach((item: any) => {
                    if (item.skuType === SkuTypeEnum.service) {
                        totalPrice = totalPrice + item.totalAmount
                    }
                });

            return totalPrice;
        }

        getRoomConfigureTotalPrice(order: any) {
            let totalPrice = 0;

            order &&
                order.orderItem &&
                order.orderItem.forEach((item) => {
                    if (item.skuType === SkuTypeEnum.service) {
                        totalPrice = totalPrice + item.totalAmount;
                    }
                });

            return totalPrice;
        }

        renderRoomDetailView(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                (order && order.totalAmount) ? (
                    <>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List className="room-details" renderHeader={() => "结算详情" as any}>
                            <List.Item>
                                <div className="bd">
                                    <div className="tit">
                                        <span>时段</span>
                                        <span>总价</span>
                                    </div>
                                    {this.renderRoomItems(order)}
                                </div>
                            </List.Item>
                        </List>
                    </>
                ) : null
            )
        }

        hasDeducterConfigure(order: any) {
            return order.couponAmount + order.integralAmount;
        }


        getALLCouponItems(order: any) {
            let totalPrice = 0;

            order &&
                order.Coupons &&
                order.Coupons.forEach((item) => {
                    totalPrice = totalPrice - item.Price;
                });

            return totalPrice;
        }

        getALLTotalWithDeducterItems(order: any) {
            let totalPrice = 0;

            order &&
                order.OrderItem &&
                order.OrderItem.forEach((item) => {
                    totalPrice = totalPrice + item.TotalPrice;
                });

            return totalPrice + this.getALLCouponItems(order);
        }

        renderDeducterView(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;
            return order && this.hasDeducterConfigure(order) ? (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List className="width-span" renderHeader={"订单总额"}>
                        {this.renderDetailItem("资源总价", `${order.originalAmount}元`)}
                        {this.renderDetailItem("优惠券抵扣", `${order.couponAmount > order.originalAmount ? order.originalAmount: order.couponAmount}元`)}
                        {this.renderDetailItem("积分抵扣", `${order.integralAmount}元`)!}
                        {this.renderDetailItem("订单总计", `${order && order.totalAmount && order.totalAmount.toFixed(2)}元`)!}
                    </List>
                </>
            ) : null;
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
        // 渲染发票信息
        renderInvoiceMessage(): React.ReactNode {
            const { state } = this.props,
                invoiceMessage = state!.invoiceMessage;
            return invoiceMessage ? (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List className="width-span" renderHeader={"开票信息"}>
                        {this.renderDetailItem("发票主体", invoiceMessage.invoiceType === InvoiceEnum.personalInvoice ? "个人" : "公司")!}
                        {this.renderDetailItem("开票状态", this.readerBadgeText(invoiceMessage.invoiceStatus))}
                        {invoiceMessage.invoiceNo && this.renderDetailItem("发票编号", invoiceMessage.invoiceNo)!}
                        {this.renderDetailItem("发票类型", this.readerInvoiceType(invoiceMessage.invoiceType))}
                        {this.renderDetailItem("发票抬头", invoiceMessage.title)!}
                        {invoiceMessage.taxId && this.renderDetailItem("纳税识别号", invoiceMessage.taxId)}
                        {this.renderDetailItem("开票金额", `${invoiceMessage.totalAmount}元`)!}
                        {invoiceMessage.updateTime && this.renderDetailItem("开票时间", friendlyTime(invoiceMessage.updateTime && invoiceMessage.updateTime.split(".")[0]))!}
                    </List>
                </>
            ) : null;
        }

        /**
         * 渲染个人信息
         */
        renderPersonMessage(): React.ReactNode {
            let { state } = this.props;
            let order = state!.order;
            return (
                order && (
                    <>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List className="width-span" renderHeader={"个人信息"}>
                            {this.renderDetailItem("姓名", order.contactPerson)!}
                            {this.renderDetailItem("手机号码", order.contactMobile)!}
                            {this.renderDetailItem("邮箱", order.contactEmail)!}
                            {this.renderDetailItem("公司名称", order.customerName)!}
                        </List>
                    </>
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
                            this.renderDetailItem(
                                "支付方式",
                                (paymessage[0] && paymessage[0].tradeChannel) === PayWayEnum.alipay ? "支付宝" : paymessage[0].tradeChannel === PayWayEnum.wechat ? "微信" : "其他"
                            )!
                        }
                        {this.renderDetailItem("支付金额", <span style={{ color: "orange" }}>￥{paymessage[0] && paymessage[0].totalAmount}&nbsp; 元</span>)!}
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
                    <>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List className="width-span" renderHeader={<div>评价信息{comments[0].auditStatus !== CommentAuditStatusEnum.pass && (
                                        <span className={`margin-left-xs size-12 color-${getCommentAuditStatus(comments[0].auditStatus, "class")}`}>
                                            {getCommentAuditStatus(comments[0].auditStatus)}
                                        </span>
                                    )}</div>}>
                            {this.renderDetailItem("评价级别", <Rater total={5} rating={comments[0].score} interactive={false} />)!}
                            <List.Item>
                                <Flex>
                                    <span className="margin-right-sm gray-two-color feedback-details-name">评价内容</span>
                                    <Flex.Item className="no-omit">
                                        <HtmlContent.Component className="html-details" html={comments[0].rateContent} />
                                    </Flex.Item>
                                </Flex>
                            </List.Item>
                        </List>
                    </>
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
                    <>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List className="margin-bottom-sm" renderHeader={"处理进度"}>
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
                    </>
                ) : null;
            }

            return null;
        }

        renderModal(params: any, type: string) {
            return Modal.alert("操作提示", "确认取消订单？", [
                {
                    text: "取消",
                },
                {
                    text: "确定",
                    onPress: () => {
                        this.dispatch({
                            type: type,
                            params: params,
                            callBack: () => {
                                Toast.success("您的订单已取消成功，欢迎再次预订。", 1, () => {
                                    if (
                                        this.props.location!.pathname!.indexOf("resourceSubmitSucceed") !== -1 ||
                                        this.props.location!.pathname!.indexOf("resourcePaySucceed") !== -1
                                    ) {
                                        history.go(-4);
                                    } else {
                                        this.goBack();
                                    }
                                });

                                params.OrderStatus === "Closed"
                                    ? setEventWithLabel(statisticsEvent.cancelOrderPendingPayment)
                                    : params.OrderStatus !== "Unrefunded" && setEventWithLabel(statisticsEvent.cancelPendingOrder);
                            },
                        });
                    },
                },
            ]);
        }

        renderCancelButton(order: any): React.ReactNode {
            const status = order.orderStatus;

            return status === OrderStatusEnum.unpaid /* || (status === OrderStatusEnum.complete && getCancelTimed(order.serviceStartDate, order.orderSubType) > 0 )*/ ? (
                <Flex.Item className="margin-0">

                    <Button type="primary" onClick={() => this.renderModal({ id: order.id }, "cancelOrder")}>
                        取消订单
                    </Button>
                </Flex.Item>
            ) : null;
        }

        goOrderPage(order: any) {
            console.log("order", order);


            order && order.orderSubType === ResourceOrderTypeEnum.meetingType
                ? this.goTo({ pathname: `orderRoomDetail/${order.bindTableId}/${order.orderSubType}` })
                : order && order.orderSubType === ResourceOrderTypeEnum.squareType
                    ? this.goTo({
                        // 场地预订
                        pathname: `orderRoomDetail/${order.bindTableId}/${order.orderSubType}`,
                    })
                    : this.goTo({
                        pathname: `orderPositionDetail/${order.bindTableId}/${order.roomId}/${order.priceUnit}/${order.orderSubType}`,
                    });

            setEventWithLabel(statisticsEvent.reorderCancelled);
        }

        /**
         * 重新预订
         */
        renderReOrderButton(order: any): React.ReactNode {

            const status = order.orderStatus;

            return status === OrderStatusEnum.cancel || status === OrderStatusEnum.checkFaild ? (
                <Flex.Item className="margin-0">
                        <Button type={"primary"} onClick={() => this.goOrderPage(order)}>
                            重新预订
                        </Button>
                    </Flex.Item>
            ) : status === OrderStatusEnum.complete && !(order.commentStatus === Number(EvaluateStatusEnum.evaluate)) ? (
                <Flex.Item className="margin-0">
                    <Button type={"primary"} onClick={() => this.goOrderPage(order)}>
                        再次预订
                    </Button>
                </Flex.Item>
            ) : null;
        }

        payOrder() {
            const { state } = this.props,
                order = state!.order;

            appPaySheet(order, this, false);
        }

        renderPayButton(order: any): React.ReactNode {
            return order.orderStatus === OrderStatusEnum.unpaid ? (
                <Flex.Item className="margin-0">
                    <Button type={"primary"} onClick={() => this.payOrder()}>
                        去付款
                    </Button>
                </Flex.Item>
            ) : null;
        }

        renderEvaluateButton(order: any): React.ReactNode {
            return order.orderStatus === OrderStatusEnum.complete && order.commentStatus === EvaluateStatusEnum.evaluate ? (
                <Flex.Item className="margin-0">
                    <Button
                        type="primary"
                        onClick={() => {
                            this.goTo({
                                pathname: `evaluate`,
                                state: {
                                    bindTable: [
                                        {
                                            bindTableId: order.id,
                                            bindTableName: IParkBindTableNameEnum.order,
                                            bindTableValue: order.subject
                                        },
                                        {
                                            bindTableId: order.bindTableId,
                                            bindTableName: order.bindTableName,
                                        },
                                    ],
                                    title: order.subject,
                                    bindTableValue: order.subject
                                },
                            });
                        }}
                    >
                        评价
                    </Button>
                </Flex.Item>
            ) : null;
        }

        /**
         * 退款申请
         */
        renderRefundButton(order: any): React.ReactNode {
            // let noResponCancelTime = order.noResponCancelTime,
            //     millisecond = noResponCancelTime * 60 * 1000;
            const status = order.orderStatus;
            return status === OrderStatusEnum.check ||
                ((status === OrderStatusEnum.unapproval || status === OrderStatusEnum.using) && order.totalAmount === 0 /* && getCancelTimed(order.serviceStartDate, order.orderSubType) > millisecond */) ? (
                    <Flex.Item className="margin-0">
                        <Button type="primary" onClick={() => this.renderModal({ id: order.id }, "cancelOrder")}>
                            取消订单
                    </Button>
                    </Flex.Item>
                ) : null;
        }

        renderFooterView(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;
            if (order) {
                const status = order.orderStatus;
                // 如果不是已取消(两个样式特殊)并且有两个Flex.item添加按钮样式
                setTimeout(() => {

                    if ($(".orderdetail.flex-collapse").children(".am-flexbox-item.margin-0").length === 2 && status !== OrderStatusEnum.cancel) {
                        $(".orderdetail.flex-collapse").addClass("row-collapse");
                    }
                    if ($(".orderdetail.flex-collapse").children(".am-flexbox-item.margin-0").length === 0) {
                        $(".orderdetail.flex-collapse").removeClass("flex-collapse");
                    }
                }, 100);
            }

            return (
                order &&
                order.serviceStartDate && (
                    <Flex className="orderdetail flex-collapse white">
                        {/* 取消订单和申请退款都调用取消订单 */}
                        {this.renderCancelButton(order)}
                        {this.renderRefundButton(order)}
                        {this.renderReOrderButton(order)}
                        {this.renderPayButton(order)}
                        {this.renderEvaluateButton(order)}
                    </Flex>
                )
            );
        }

        renderFooter(): React.ReactNode {
            return this.renderFooterView();
        }

        refScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $("#nav_box_Shadow").length <= 0 && $(this).parents(".container-page").find(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $("#nav_box_Shadow").css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
            });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                order = state!.order;

            return (
                <>
                    {this.renderHeaderView()}
                    {this.renderPaidTimeView()}
                    {this.renderOrderDetailView()}
                    {order && (order.orderSubType === ResourceOrderTypeEnum.meetingType || order.orderSubType === ResourceOrderTypeEnum.squareType) && this.renderRoomDetailView()}
                    {this.renderDeducterView()}
                    {this.renderInvoiceMessage()}
                    {this.renderPersonMessage()}
                    {order && order.orderStatus && order.orderStatus !== OrderStatusEnum.unpaid ? this.renderPayDetailView() : ""}
                    {this.renderCommentView()}
                    {this.renderOrderLogList()}
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myorderdetail]);
}
