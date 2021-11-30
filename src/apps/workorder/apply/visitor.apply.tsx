import React from "react";

import { Tabs, List, Flex, Button } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";
import { ListComponent, setEventWithLabel, setNavTitle } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, MyVisitorTypeEnum, myVisitorModel } from "@reco-m/workorder-models";

import {goToCompatibleWxmini} from "@reco-m/h5home-models";


import { myVisitorTypeEnumComponent, tabs } from "./common";

export namespace MyVisitor {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, myVisitorModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        headerContent = "访客预约审核";
        scrollable = false;
        bodyClass = "container-height";
        status = 0;
        namespace = Namespaces.myVisitor;
        loadingOptimize = true;

        companyId: any = "";

        componentDidMount() {
            setNavTitle.call(this, this.headerContent);
            setEventWithLabel(statisticsEvent.visitorsAppointmentBrowse);
            this.companyId = this.props.match!.params.companyId;
            this.getData({ pageIndex: 1 });

            setEventWithLabel(statisticsEvent.myVisitorAppReviewBrowse);
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, this.headerContent, nextProps);

            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.getData({ pageIndex: 1 });
            }
        }

        goDetail(data: any) {
            goToCompatibleWxmini(this, () => {
                this.goTo(`myVisitorDetail/${data.order.id}/${data.order.topicStatus}/1`);

                setEventWithLabel(statisticsEvent.workOrderDetailView);
            });
        }

        getData(data?: any) {
            this.dispatch({
                type: "getMyVisitorList",
                codes: "FKYY_fk,FKYY_sfz",
                status: this.status,
                companyId: this.companyId,
                params: data,
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

        renderSubjectStatus(order: any): React.ReactNode {
            return (
                <Flex
                    align="start"
                    onClick={() => {
                        this.goDetail(order);
                    }}
                >
                    <Flex.Item>
                        <div className="omit omit-2">{order.order.subject}</div>
                    </Flex.Item>
                    <div className="size-14 pl15">{myVisitorTypeEnumComponent(order.order.status)}</div>
                </Flex>
            );
        }

        renderInputTime(order: any): React.ReactNode {
            return (
                <List.Item.Brief>
                    <div
                        className="size-14"
                        onClick={() => {
                            this.goDetail(order);
                        }}
                    >
                        {" "}
                        <i className="icon icon-shijian size-14 margin-right-xs" />
                        {order.order.inputTime && formatDateTime(order.order.inputTime)}
                    </div>
                </List.Item.Brief>
            );
        }

        renderGoCheck(order: any): React.ReactNode {
            return (
                <div
                    className="visitor-chk-style"
                    onClick={() => {
                        this.goDetail(order);
                    }}
                >
                    <span />
                    {order.order.status === MyVisitorTypeEnum.wating && (
                        <div key={"b"} className="my-click text-right  padding-top-0">
                            <Button type="primary" inline size="small">
                                去审核
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        renderGoAccess(order: any): React.ReactNode {
            return (
                order.order.status === MyVisitorTypeEnum.finish && (
                    <Button type="primary" size="small" inline onClick={() => goToCompatibleWxmini(this, () => {
                        this.goTo("card");
                    })}>
                        <span>二维门禁卡</span>
                    </Button>
                )
            );
        }

        renderItemsContent(order: any, i): React.ReactNode {
            return (
                <List className="line-border-no my-apply-list" key={i}>
                    <List.Item align="top" multipleLine wrap>
                        {this.renderSubjectStatus(order)}
                        {this.renderInputTime(order)}

                        <div className="my-apply-btn">
                            {this.renderGoCheck(order)}
                            {this.renderGoAccess(order)}
                        </div>
                    </List.Item>
                </List>
            );
        }

        renderBody(): React.ReactNode {
            const showList = this.props.state!.showList;
            return (
                <div className="container-body apply-container">
                    <Tabs
                        tabs={tabs()}
                        initialPage={1}
                        swipeable={false}
                        onChange={(tab) => {
                            this.dispatch({ type: "input", data: { showList: false } });
                            this.status = tab.status === "" ? MyVisitorTypeEnum.allBack : tab.status;
                            setTimeout(() => {
                                this.getData({ status: tab.status });
                            }, 100);
                            setEventWithLabel(statisticsEvent.myVisitorAppReviewBrowse);
                        }}
                    >
                        {showList ? this.getListView() : null}
                    </Tabs>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myVisitor]);
}
