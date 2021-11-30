import React from "react";

import { NavBar, List, Flex, Button, Drawer, Icon, Tabs, WhiteSpace } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";

import { ListComponent, Container, setEventWithLabel, ImageAuto, androidExit, resolveDataBlob, SuspendButton, setNavTitle } from "@reco-m/core-ui";

import { Namespaces, tabs, MyApplyTopicStatusEnum, applyModel, WorkOrderTriggerEnum, ImagesCategoryEnum, MyApplyTabTypeIndexEnum } from "@reco-m/workorder-models";

import { SideBarContent } from "@reco-m/workorder-common";

import { ApprovalStateSubmit } from "@reco-m/approval-approval";

import { OrderEvaluate } from "@reco-m/comment-evaluate";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import {goToCompatibleWxmini} from "@reco-m/h5home-models";


import { isEqual } from "lodash";

import { renderTabsLabel, renderAllTabsLabel, tabsStatisticsEvent, repairFlowCode, repairWaitConfirm } from "./common";

export namespace Apply {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, applyModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        showheader = false;
        namespace = Namespaces.apply;
        status: any = tabs[this.props.match!.params.status];
        code: any = "";
        key?: any;
        private _state: any;
        triggerCodes = [
            WorkOrderTriggerEnum.workOrderRepairCancelTrigger,
            WorkOrderTriggerEnum.workOrderRepairContinueTrigger,
            WorkOrderTriggerEnum.workOrderRepairSuccessTrigger,
            WorkOrderTriggerEnum.workOrderRepairFailTrigger,
            WorkOrderTriggerEnum.workOrderCancelTrigger,
            WorkOrderTriggerEnum.workOrderResubmitTrigger,
        ];

        componentDidMount() {
            setNavTitle.call(this, "我的申请")
            const { state } = this.props,
                id = state!.id;

            this.key = this.getSearchParam("key");
            const codes = id ? id : "";
            this.dispatch({
                type: `initPage`,
                data: {
                    status: this.status.status,
                    topicStatus: this.status.topicStatus,
                    key: state!.searchKey || (this.key && decodeURI(this.key)),
                    codes: codes,
                    showHidCatalogs: false,
                },
            });
            setEventWithLabel(statisticsEvent.worksheetListBrowse);
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, "我的申请", nextProps)
            this.shouldUpdateData(nextProps.state);
            if (nextProps.location !== this.props.location) {
                this.getData();
            }
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        getData(data?: any) {
            const { state } = this.props,
                id = state!.id;

            const codes = id ? id : "";

            this.dispatch({
                type: "getByUser",
                params: {
                    pageIndex: 1,
                    status: this.status.status,
                    topicStatus: this.status.topicStatus,
                    key: state!.searchKey || (this.key && decodeURI(this.key)),
                    codes: codes,
                    showHidCatalogs: false,
                    ...data,
                },
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

        goDetail(data: any) {
            goToCompatibleWxmini(this, () => {
                this.goTo(`applyDetail/${data.order.id}/${data.order.topicStatus}`);
                setEventWithLabel(statisticsEvent.workOrderDetailView);
            })
        }

        // 评价按钮
        renderEvaluate(order: any): React.ReactNode {
            return (
                order &&
                order.topicStatus === Number(MyApplyTopicStatusEnum.topicStatus) && (
                    <div key="a" onClick={(e) => e.stopPropagation()} className="my-apply-btn">
                        <Button type="primary" size="small" inline onClick={() => this.dispatch({ type: "input" }, { evaluateModal: true, selectOrder: order })}>
                            <span>去评价</span>
                        </Button>
                    </div>
                )
            );
        }

        renderModal(): React.ComponentElement<OrderEvaluate.IProps, OrderEvaluate.Component> {
            const evaluateModal = this.props.state!.evaluateModal,
                order = this.props.state!.selectOrder;

            return (
                evaluateModal &&
                order &&
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
                            bindTableId: order.bindTableId,
                            bindTableName: order.bindTableName,
                        },
                        {
                            bindTableId: order.id,
                            bindTableName: IParkBindTableNameEnum.workorder,
                            bindTableValue: order.subject,
                        },
                    ] as any,
                })
            );
        }

        getDefaultImg(item) {
            for (let key in ImagesCategoryEnum) {
                if (item === ImagesCategoryEnum[key]) {
                    return key;
                }
            }
        }

        renderItemsContent(item: any, i: any): React.ReactNode {
            let triggerCodes = [...this.triggerCodes];
            if (item.state?.flow?.flowCode === repairFlowCode && item.state?.currentNode?.nodeName === repairWaitConfirm) {
                triggerCodes.add(WorkOrderTriggerEnum.workOrderFinishTrigger);
            }
            const submitProps: any = {
                taskId: item.state?.task?.id,
                triggerCodes: triggerCodes,
                isAutoSubmit: true,
                isEdit: true,
                operationComplete: this.getData.bind(this),
                stateData: item.state,
                flowProjectId: item.order.flowStateId,
                isButton: false,
                autoTriggerCodes: [WorkOrderTriggerEnum.workOrderResubmitTrigger],
                autoOperation: (_c, _d, route) => {
                    goToCompatibleWxmini(this, () => {
                        this.goTo(`edit/${item.order.id}/${item.state.project.id}/${route.routeId}?taskId=${item.state?.task?.id}`);
                    })

                },
                isList: true,
                routers: item.state?.flow?.process?.routes?.filter((d: any) => d.fromNodeId === item.state?.project?.currentNodeId),
            };
            return (
                <List className="my-apply-list my-sheet-list">
                    <List.Item
                        wrap
                        multipleLine
                        key={i}
                        onClick={() => {
                            this.goDetail(item);
                        }}
                    >
                        <Flex align="start">
                            <Flex.Item>
                                <div className="gray-three-color size-14 sheet-number">{item.order && item.order.orderNo}</div>
                            </Flex.Item>
                            <div className="size-14">{this.status.i === MyApplyTabTypeIndexEnum.all ? renderAllTabsLabel(item.order) : renderTabsLabel(item.order)}</div>
                        </Flex>
                        <WhiteSpace />
                        <Flex align="start">
                            <ImageAuto.Component
                                cutWidth="80"
                                cutHeight="80"
                                src={item.image ? item.image : "assets/images/workorder/" + this.getDefaultImg(item.order.catalogueName) + ".png"}
                                height="80px"
                                width="80px"
                            />
                            <Flex.Item>
                                <div className="omit omit-2">{item.order && item.order.subject}</div>
                                <WhiteSpace size="sm" />
                                <div className="gray-three-color size-14"> {item.order && item.order.inputTime && formatDateTime(item.order.inputTime)}</div>
                            </Flex.Item>
                        </Flex>
                        <Flex>
                            <Flex.Item>{this.renderEmbeddedView(ApprovalStateSubmit.Page, { ...submitProps })}</Flex.Item>
                            {item.order && item.order.topicStatus === Number(MyApplyTopicStatusEnum.topicStatus) && (
                                <div className="margin-left-xs">{this.renderEvaluate(item.order)}</div>
                            )}
                        </Flex>
                    </List.Item>
                </List>
            );
        }

        reset() {
            this.code = "";
            this.dispatch("input", { searchKey: "", catalogueName: "", id: "", selectedTagID: "" });
        }

        sureSearch() {
            this.onOpenChange();
            // this.dispatch("input", { open: false });
            this.getData();

            setEventWithLabel(statisticsEvent.workOrderSearch);
        }

        onOpenChange = () => {
            const { state } = this.props,
                openChange = state!.open;
            this.dispatch({ type: "input", data: { open: !openChange } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { open: false } });
            androidExit(!openChange, callback);
        };

        fwlxTagOnChange(data: any) {
            this.dispatch("input", {
                selectedTagID: data.i,
                catalogueName: data.tag.catalogueName,
                id: data.tag.id,
            });
        }

        shouldUpdateData<T>(state: T, getDataBlob: (state: T) => any[] = resolveDataBlob) {
            const { dataSource } = this.state;
            // console.log(this._state, state, isEqual(state, this._state));

            if (dataSource && !isEqual(state, this._state)) {
                const dataBlob = getDataBlob(state);
                this._state = state;
                this.setState({ dataSource: dataSource!.cloneWithRows(Array.isArray(dataBlob) ? dataBlob : []) });
            }
        }

        renderTabs(): React.ReactNode {
            const { status } = this.props.match!.params;
            const { state } = this.props,
                showList = state!.showList;
            return (
                <Tabs
                    swipeable={false}
                    tabs={tabs}
                    initialPage={parseInt(status, 10)}
                    onChange={(tab) => {
                        this.status = tab;
                        this.dispatch({ type: "input", data: { /* isLoading: true, */ showList: false } });
                        this.getData();
                        tabsStatisticsEvent(tab.i);
                    }}
                >
                    {showList ? this.getListView() : null}
                </Tabs>
            );
        }

        renderHeader(): React.ReactNode {
            const { state } = this.props,
                isMarket = state!.isMarket;
            return (
                client.showheader && (
                    <NavBar
                        className="park-nav"
                        icon={<Icon type="left" />}
                        onLeftClick={() => this.goBack()}
                        rightContent={<Icon type="search" onClick={() => this.onOpenChange()} />}
                    >
                        {isMarket === "true" ? "我的服务机构入驻" : "我的申请"}
                    </NavBar>
                )
            );
        }

        renderBody(): React.ReactNode {
            return (
                <Container.Component fill scrollable className="container-hidden">
                    <Container.Component className="container-body apply-container">{this.renderTabs()}</Container.Component>
                    {this.renderModal()}
                    {!client.showheader && (
                        <SuspendButton.Component>
                            <a className="suspend-button" onClick={() => this.onOpenChange()}>
                                <Icon type="search" />
                            </a>
                        </SuspendButton.Component>
                    )}
                </Container.Component>
            );
        }

        render(): React.ReactNode {
            const { state } = this.props,
                catalogs = state!.catalogs || [];

            return (
                <Drawer
                    className="my-drawer"
                    sidebar={
                        <SideBarContent.Component
                            searchKey={state!.searchKey}
                            typeTitle={"服务类型"}
                            rightTitle={state!.catalogueName}
                            tags={catalogs.map((s) => ({ catalogueName: s.catalogName, id: s.catalogCode }))}
                            selectedTagID={state!.selectedTagID}
                            onChange={this.dispatch.bind(this)}
                            resetSearch={this.reset.bind(this)}
                            sureSearch={this.sureSearch.bind(this)}
                            tagOnChange={this.fwlxTagOnChange.bind(this)}
                        />
                    }
                    open={state!.open}
                    onOpenChange={() => this.onOpenChange()}
                    position="right"
                >
                    <Container.Component direction={"column"} className="workorder-applylist">

                        {this.renderLoading()}
                        {this.renderHeader()}
                        {this.renderBody()}
                    </Container.Component>
                </Drawer>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.apply]);
}
