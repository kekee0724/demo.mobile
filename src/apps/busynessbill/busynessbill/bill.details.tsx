import React from "react";
import { List, WhiteSpace, Flex /*Steps , Button */ } from "antd-mobile-v2";

import { template, formatDateTime, formatDate } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";

import { Namespaces, billDetailsModel, dateDifference, BusinessBillPaymentStatusEnum, getStatusText } from "@reco-m/busynessbill-models";

// const Step = Steps.Step;
export namespace BillDetails {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        clickNum?: any;
    }
    export interface IState extends ViewComponent.IState, billDetailsModel.StateType {
        isSideOpen?: any;
    }
    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.billDetails;
        headerContent = "账单详情";
        viewRef;
        get id(): number {
            return this.getSearchParam("id") ? this.getSearchParam("id") : this.props.match!.params.id;
        }
        componentDidMount() {
            this.dispatch({
                type: `initPage`,
                id: this.id,
            });
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                details = state!.details,
                config = state!.config;
            const days = dateDifference(formatDateTime(details?.payDeadlineDate, "yyyy-MM-dd"), formatDate(new Date()), false);
            let chargingMonth = details?.chargingMonth + "";

            return (
                <>
                    <List className="list-no-border">
                        <List.Item>
                            <div className="text-center">
                                <div>{details?.customerName}</div>
                                <WhiteSpace />
                                <div className="size-32 highlight-color">¥{details?.actualAmount}</div>
                                <WhiteSpace />
                                {chargingMonth !== "undefined" && (
                                    <div className="size-14">
                                        <span className="gray-two-color">
                                            {chargingMonth.substr(0, 4)}年{chargingMonth.substr(4, 6)}月账单
                                        </span>
                                        {/* {days > 0 && details?.paymentStatus !== BusinessBillPaymentStatusEnum.PAID && <span className="color-red margin-left-xs">已经逾期</span>} */}
                                        <span style={{ fontSize: "14px", display: "inline-block" }} className="ml5">{getStatusText(details?.paymentStatus)}</span>
                                    </div>
                                )}
                            </div>
                        </List.Item>
                    </List>
                    <WhiteSpace className="dark" />
                    <List>
                        <List.Item>
                            <List.Item.Brief>
                                合同编号：<span className="black-color">{details?.billNumber}</span>
                            </List.Item.Brief>
                            {details?.roomFullNames && (
                                <List.Item.Brief>
                                    物业位置：<span className="black-color">{details?.roomFullNames || "-"}</span>
                                </List.Item.Brief>
                            )}
                            <List.Item.Brief>
                                付款截止：
                                <span className="black-color">
                                    {formatDateTime(details?.payDeadlineDate, "yyyy-MM-dd")}
                                    {days > 0 && details?.paymentStatus !== BusinessBillPaymentStatusEnum.PAID && (
                                        <span className="color-red" style={{ margin: "8px" }}>{`(已逾期${days}天)`}</span>
                                    )}
                                </span>
                            </List.Item.Brief>
                        </List.Item>
                    </List>
                    <WhiteSpace className="dark" />
                    <List renderHeader="缴费须知" className="bill-list">
                        {details?.items?.map((item, i) => {
                            return (
                                <List.Item key={i} wrap extra={<span className="highlight-color">¥{item?.actualAmount}</span>} align="top" multipleLine>
                                    <div className="title margin-bottom-sm">
                                        <i className="icon icon-tag icon-radius small primary-back-color" />
                                        {item?.subjectName}
                                    </div>
                                    <List.Item.Brief>
                                        计费周期：{formatDateTime(item?.startDate, "yyyy-MM-dd")}~{formatDateTime(item?.endDate, "yyyy-MM-dd")}
                                    </List.Item.Brief>
                                </List.Item>
                            );
                        })}
                    </List>
                    <WhiteSpace className="dark" />
                    <List renderHeader={"缴费须知"}>
                        <List.Item wrap>
                            <div className="highlight-color size-14">根据贵司与我方签订的合同条款约定，请贵司务必在付款日期结束前将上述应付款缴付至以下账户</div>
                        </List.Item>
                        <List.Item>
                            <Flex>
                                <div className="label-name gray-two-color">开户名</div>
                                <Flex.Item>{config?.accountName}</Flex.Item>
                            </Flex>
                        </List.Item>
                        <List.Item>
                            <Flex>
                                <div className="label-name gray-two-color">开户行</div>
                                <Flex.Item>{config?.bankName}</Flex.Item>
                            </Flex>
                        </List.Item>
                        <List.Item>
                            <Flex>
                                <div className="label-name gray-two-color">账号</div>
                                <Flex.Item>{config?.accountNumber}</Flex.Item>
                            </Flex>
                        </List.Item>
                        <List.Item>
                            <Flex>
                                <div className="label-name gray-two-color">联系人</div>
                                <Flex.Item>{config?.contactPerson}</Flex.Item>
                            </Flex>
                        </List.Item>
                        <List.Item>
                            <Flex>
                                <div className="label-name gray-two-color">联系电话</div>
                                <Flex.Item>{config?.contactNumber}</Flex.Item>
                            </Flex>
                        </List.Item>
                        <List.Item wrap>
                            <div className="label-name gray-two-color">备注</div>
                            <div className="size-16 margin-top-xs">{config?.remarks} </div>
                        </List.Item>
                    </List>
                    <WhiteSpace className="dark" />
                    {/* <List className="list-no-border" renderHeader={"处理进度"}>
          <List.Item>
            <Steps size="small" current={1}>
              <Step title="您的订单已取消成功。" description="2020/07/15 15:22:25" />
              <Step title="您的订单已提交成功，请尽快前往支付。" description="2020/07/15 08:52:25" />
            </Steps>
          </List.Item>
        </List> */}
                </>
            );
        }

        // renderFooter(): React.ReactNode {
        //   return <Flex className="flex-collapse">
        //     <Flex.Item>
        //       <Button
        //         type={"primary"}
        //       >
        //         去支付
        //       </Button>
        //     </Flex.Item>
        //   </Flex>
        // }
    }

    export const Page = template(Component, (state) => state[Namespaces.billDetails]);
}
