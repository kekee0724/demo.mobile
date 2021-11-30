import React from "react";

import Rater from "react-rater";

import "react-rater/lib/react-rater.css";

import { List, Flex, Button, Card, Steps, WhiteSpace, Tabs, Icon } from "antd-mobile-v2";

import { template, formatDate } from "@reco-m/core";
import { ViewComponent, ImageAuto, HtmlContent, setEventWithLabel, androidExit, setNavTitle } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, MyApplyTopicStatusEnum, applyDetailModel, WorkOrderTriggerEnum } from "@reco-m/workorder-models";
import { getCommentAuditStatus } from "@reco-m/workorder-common";
import { ApprovalStateSubmit, ApprovalStateDetail } from "@reco-m/approval-approval";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { OrderEvaluate } from "@reco-m/comment-evaluate";

import { callTel } from "@reco-m/contact";

import { deepClone, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { getStatusText, repairWaitConfirm, repairFlowCode } from "./common";

const Step = Steps.Step;

const tabs = [{ title: "工单进度" }, { title: "工单答复" }];

export namespace ApplyDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, applyDetailModel.StateType {
        show?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.applyDetail;
        bodyClass = "tabs-auto oldForm";
        scrollable = true;
        submitPage: any;
        stateDetail: any;

        discriptionName: any = ""; // 描述的Header

        public get isVisitor() {
            return !!this.props.match!.params.isVisitor;
        }

        triggerCodes = [
            WorkOrderTriggerEnum.workOrderRepairCancelTrigger,
            WorkOrderTriggerEnum.workOrderRepairContinueTrigger,
            WorkOrderTriggerEnum.workOrderRepairSuccessTrigger,
            WorkOrderTriggerEnum.workOrderRepairFailTrigger,
            WorkOrderTriggerEnum.workOrderCancelTrigger,
            WorkOrderTriggerEnum.workOrderResubmitTrigger,
            // WorkOrderTriggerEnum.workOrderFinishTrigger,
        ];

        url = this.props.match!.url;

        componentDidMount() {
            this.dispatch({ type: "input", data: { applyDetailData: null } });
            setEventWithLabel(statisticsEvent.myCheckinDetailView);
            const id = this.getSearchParam("id") ? this.getSearchParam("id") : this.props.match!.params.id;

            this.dispatch({ type: `initPage`, data: { id } });

            this.props.history!.listen((route) => {
                if (this.url === route.pathname) {
                    this.dispatch({ type: "input", data: { applyDetailData: null } });
                    this.dispatch({ type: "initPage", data: { id } });
                }
            });
        }

        componentWillUnmount() {
            this.dispatch("init");
        }

        renderHeaderContent(): React.ReactNode {
            const { state } = this.props,
                applyDetailData = state!.applyDetailData,
                { order = {} } = applyDetailData || {};
            if (!client!.showheader) {
                order.catalogueName && setNavTitle.call(this, order.catalogueName);
            }

            return <>{"我的" + (order.catalogueName || "工单")}</>;
        }

        renderHeaderView(order: any): React.ReactNode {
            return (
                order && (
                    <List className="my-sheet-list">
                        <List.Item wrap multipleLine>
                            <Flex align="start">
                                <Flex.Item>
                                    <div className="gray-three-color size-14 sheet-number">{order.orderNo}</div>
                                </Flex.Item>
                                <div className="size-14">
                                    <span>{getStatusText(order.status, order)}</span>
                                </div>
                            </Flex>
                            <Flex align="start">
                                <Flex.Item>
                                    <div className="omit omit-2 size-18">{order.subject}</div>
                                    <WhiteSpace size="sm" />
                                    <div className="gray-three-color size-14">{order.inputTime && formatDate(order.inputTime, "yyyy-MM-dd hh:mm:ss")}</div>
                                </Flex.Item>
                            </Flex>
                        </List.Item>
                    </List>
                )
            );
        }

        renderStep(item: any, i: number, className: string, content: string, type: any): React.ReactNode {
            return (
                <Steps.Step
                    key={i}
                    status={type}
                    icon={<i className={`steps-icon icon ${className}`} />}
                    title={
                        <Flex style={{ fontSize: "14px", width: "100%" }}>
                            <div className="color-time" style={{ marginLeft: "0px", maxWidth: "45%" }}>
                                {item.inputer}
                            </div>
                            <Flex.Item>{content}</Flex.Item>
                        </Flex>
                    }
                    description={item.inputTime ? `${item.inputTime.split("T")[0]} ${item.inputTime.split("T")[1].split(".")[0]}` : ""}
                />
            );
        }

        // 我的工单反馈
        renderApplyBack(applyBackData: any[], repairList: any[]) {
            let data = deepClone(applyBackData);

            if (repairList && repairList.length) {
                let sum = 0;
                repairList.forEach((r) => (sum += r.totalAmount));

                data.push({
                    inputTime: repairList[0].inputTime,
                    inputer: repairList[0].inputer,
                    Type: "费用评估",
                    remarks: `费用明细：<br /> ${repairList.map((r) => `${r.feeName}：材料*${r.number}、人工*${r.artificialNumber} =${r.totalAmount}元`).join("<br />")}
                          <br /> 合计：${sum}元`,
                });
            }

            return (
                (data && data.length > 0 && (
                    <Steps size="small">
                        {data.map((item: any, i: number) => {
                            return (
                                <Step
                                    key={i}
                                    icon={<Icon type={"check-circle-o"} size={"xs"} />}
                                    description={
                                        <>
                                            <div className="size-14 gray-three-color">
                                                {item.inputTime ? `${item.inputTime.split("T")[0]} ${item.inputTime.split("T")[1].split(".")[0]}` : ""}
                                            </div>
                                            <div className="size-14 primary-color">
                                                {item.inputer}:{item.Type || "工单反馈"}
                                            </div>
                                            <div className="size-14 gray-one-color">
                                                <HtmlContent.Component html={item.remarks}></HtmlContent.Component>
                                            </div>
                                        </>
                                    }
                                />
                            );
                        })}
                    </Steps>
                )) || (
                    <div className="text-center padding-sm">
                        <i className="icon icon-hour-glass gray-three-color" />
                        <WhiteSpace />
                        <div className="size-14 gray-three-color">当前工单暂无答复内容</div>
                        <div className="size-14 gray-three-color">您可以通过工单进度查看了解最新进展</div>
                    </div>
                )
            );
        }

        // 我的工单处理进度
        renderHandleStep(applyLogData: any) {
            return (
                applyLogData &&
                applyLogData.length > 0 && (
                    <Steps size="small">
                        {applyLogData.map((item: any, i: number) => {
                            return (
                                <Step
                                    key={i}
                                    icon={<Icon type={"check-circle-o"} size={"xs"} />}
                                    description={
                                        <>
                                            <div className="size-14 gray-three-color">
                                                {item.inputTime ? `${item.inputTime.split("T")[0]} ${item.inputTime.split("T")[1].split(".")[0]}` : ""}
                                            </div>
                                            <div className="size-14 primary-color">
                                                {item.inputer}:{item.description}
                                            </div>
                                            <div className="size-14 gray-one-color">
                                                <div>{item.remarks}</div>
                                            </div>
                                        </>
                                    }
                                />
                            );
                        })}
                    </Steps>
                )
            );
        }

        // 渲染评价
        renderEvaluate(commentData: any) {
            return (
                (commentData && commentData.items && commentData.items.length > 0 && (
                    <>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List
                            renderHeader={
                                <div>
                                    我的评价
                                    {commentData.items[0].auditStatus !== CommentAuditStatusEnum.pass && (
                                        <span className={`margin-left-xs size-12 color-${getCommentAuditStatus(commentData.items[0].auditStatus, "class")}`}>
                                            {getCommentAuditStatus(commentData.items[0].auditStatus)}
                                        </span>
                                    )}
                                </div>
                            }
                        >
                            <List.Item wrap={true} multipleLine={true}>
                                <Rater interactive={false} total={5} rating={commentData.items[0].score} />
                                <div className="size-14 gray-three-color">{commentData.items[0].inputTime && formatDate(commentData.items[0].inputTime, "yyyy-MM-dd hh:mm")}</div>
                                <HtmlContent.Component className="html-details size-14" html={commentData.items[0].rateContent} />
                            </List.Item>
                        </List>
                    </>
                )) ||
                this.renderTobeEvaluated()
            );
        }

        onOpenChange = (bool: boolean) => {
            this.dispatch({ type: "input", data: { evaluateModal: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { evaluateModal: false } });
            androidExit(bool, callback);
        };

        // 待评价
        renderTobeEvaluated() {
            const order = this.getOrderInfo();

            return (
                order &&
                order.topicStatus === Number(MyApplyTopicStatusEnum.topicStatus) && (
                    <>
                        <WhiteSpace className="whitespace-gray-bg" />
                        <List renderHeader={"我的评价"}>
                            <List.Item wrap={true} multipleLine={true}>
                                <div className="text-center">
                                    <div className="size-14 gray-three-color">
                                        <div>竭力为您提供五星服务</div>
                                        <div>诚邀您对我们的服务进行评价</div>
                                    </div>
                                    <WhiteSpace size="lg" />
                                    <Button style={{ borderRadius: "42px" }} type={"primary"} onClick={() => this.onOpenChange(true)}>
                                        立即评价
                                    </Button>
                                </div>
                            </List.Item>
                        </List>
                    </>
                )
            );
        }

        renderOrderBody(order: any): React.ReactNode {
            const { state } = this.props,
                applyDetailData = state!.applyDetailData,
                statedto = applyDetailData && applyDetailData.state;

            const isOrderView = this.props.state!.isOrderView;
            return !isOrderView ? (
                <div
                    className="check-more"
                    onClick={() => {
                        this.dispatch({ type: "input", data: { isOrderView: !isOrderView } });
                    }}
                >
                    展开工单详情
                    <i className="icon icon-sanjiao" />
                </div>
            ) : (
                <>
                    {order &&
                        order.flowStateId &&
                        this.renderEmbeddedView(ApprovalStateDetail.Page, {
                            taskId: statedto?.task?.id,
                            flowProjectId: order.flowStateId,
                            isEdit: false,
                            isHideButton: true,
                            showheader: false,
                            onRef: (e) => {
                                this.stateDetail = e;
                            },
                        } as any)}
                    <div className="check-more active" onClick={() => this.dispatch({ type: "input", data: { isOrderView: !isOrderView } })}>
                        收起工单详情
                        <i className="icon icon-sanjiao" />
                    </div>
                </>
            );
        }

        renderLogs() {
            const { state } = this.props,
                applyBackData: any[] = state!.applyBackData,
                repairList: any[] = state!.repairList,
                applyLogData = state!.applyLogData || [];

            return (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <Tabs tabs={tabs} initialPage={0}>
                        <div className="work-progress">
                            <Card full className="work-steps">
                                <Card.Body>
                                    {!applyLogData.length ? (
                                        <div className="text-center padding-sm">
                                            <i className="icon icon-hour-glass gray-three-color" />
                                            <WhiteSpace />
                                            <div className="size-14 gray-three-color">当前工单暂无进度内容</div>
                                        </div>
                                    ) : null}
                                    {this.renderHandleStep(applyLogData)}
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="work-Reply">
                            <Card full className="work-steps">
                                <Card.Body>{this.renderApplyBack(applyBackData, repairList)}</Card.Body>
                            </Card>
                        </div>
                    </Tabs>
                </>
            );
        }

        getOrderInfo() {
            const { state } = this.props,
                applyDetailData = state!.applyDetailData,
                { order = {} } = applyDetailData || {};
            return order;
        }

        renderReceiver() {
            const { state } = this.props,
                thumb = state!.thumb,
                applyDetailData = state!.applyDetailData,
                { receiver = undefined } = applyDetailData || {};

            return (
                <List renderHeader={"受理人信息"}>
                    {(!receiver && (
                        <List.Item wrap={true} multipleLine={true}>
                            <div className="size-14 gray-two-color">
                                <div>当前订单待指派受理人。</div>
                                <div>
                                    我们会尽快为您指派，如果您当前有紧急情况，可以拨打我们的紧急电话。
                                    <span className="primary-color" onClick={callTel.bind(this, server.userMobile.aboutUsMobile)}>
                                        {server.userMobile.aboutUsMobile}
                                    </span>
                                </div>
                            </div>
                        </List.Item>
                    )) ||
                        null}
                    {receiver && (
                        <List.Item
                            wrap={true}
                            multipleLine={true}
                            thumb={
                                <ImageAuto.Component
                                    cutWidth="60"
                                    cutHeight="60"
                                    width="60px"
                                    height="60px"
                                    radius="60px"
                                    src={thumb ? thumb.filePath : " assets/images/myBackgroundview1.png"}
                                />
                            }
                        >
                            <div className="size-15">{receiver.realName || receiver.nickName || receiver.userName}</div>
                            <div className="size-14 gray-three-color">电话：{receiver.mobile}</div>
                            <div onClick={callTel.bind(this, receiver.mobile)} className="officer-tag">
                                <Button inline>
                                    <i className="icon icon-newpel" />
                                    拨打电话
                                </Button>
                            </div>
                        </List.Item>
                    )}
                </List>
            );
        }
        renderModal(): React.ComponentElement<OrderEvaluate.IProps, OrderEvaluate.Component> {
            const evaluateModal = this.props.state!.evaluateModal,
                order = this.getOrderInfo();

            return (
                evaluateModal &&
                this.renderEmbeddedView(OrderEvaluate.Page as any, {
                    bindTableValue: order.subject,
                    title: "评价工单",
                    evaluateTagClassCode: "RATE/PINGJLX",
                    cancel: this.dispatch.bind(this, { type: "input", data: { evaluateModal: false } }),
                    success: () => {
                        this.componentDidMount();
                        this.dispatch({ type: "input" }, { evaluateModal: false });
                    },
                    bindTable: [
                        {
                            bindTableId: order.id,
                            bindTableName: IParkBindTableNameEnum.workorder,
                            bindTableValue: order.subject,
                        },
                    ] as any,
                })
            );
        }

        refScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents(".container-page").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $(this)
                .parents(".container-page")
                .find("#nav_box_Shadow")
                .css({
                    background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                        top * 0.001 < 0.1 ? top * 0.001 : 0.1
                    }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                applyDetailData = state!.applyDetailData,
                { order = {} } = applyDetailData || {},
                commentData = state!.commentData;

            return (
                <>
                    {this.renderHeaderView(order)}
                    {order && this.renderOrderBody(order)}
                    {this.renderLogs()}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderReceiver()}
                    {this.renderEvaluate(commentData)}
                    {this.renderModal()}
                </>
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                applyDetailData = state!.applyDetailData,
                isInputer = state!.isInputer,
                statedto = applyDetailData && applyDetailData.state;

            const props: any = {
                taskId: statedto?.task?.id,
                flowProjectId: statedto?.project?.id,
                autoOperation: (_c, _d, route) => {
                    this.goTo(`edit/${applyDetailData.order.id}/${statedto.project.id}/${route.routeId}?taskId=${statedto?.task?.id}`);
                },
            };
            if (this.stateDetail) {
                props.getDetailData = this.stateDetail.getDetailData.bind(this.stateDetail);
            }
            let triggerCodes = [...this.triggerCodes];
            if (applyDetailData && applyDetailData.state?.flow?.flowCode === repairFlowCode && applyDetailData.state?.currentNode?.nodeName === repairWaitConfirm) {
                triggerCodes.add(WorkOrderTriggerEnum.workOrderFinishTrigger);
            }
            return (
                statedto &&
                isInputer &&
                this.renderEmbeddedView(ApprovalStateSubmit.Page, {
                    triggerCodes: triggerCodes,
                    autoTriggerCodes: [WorkOrderTriggerEnum.workOrderResubmitTrigger],
                    isAutoSubmit: true,
                    isEdit: true,
                    isButton: true,
                    onRef: (ref) => {
                        this.submitPage = ref;
                    },
                    operationComplete: this.componentDidMount.bind(this),
                    ...props,
                } as any)
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.applyDetail]);
}
