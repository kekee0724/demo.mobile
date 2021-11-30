import React from "react";

import { Button, List, Flex } from "antd-mobile-v2";

import { template, formatDate } from "@reco-m/core";

import { ListComponent, NoData, setNavTitle } from "@reco-m/core-ui";

import { Namespaces, policyserviceOrderModel } from "@reco-m/policymatching-models";

import {  IParkBindTableNameEnum} from "@reco-m/ipark-common";

import {goToCompatibleWxmini} from "@reco-m/h5home-models";

export namespace PolicyServiceOrder {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        selectTagtest?: any;
    }
    export interface IState extends ListComponent.IState, policyserviceOrderModel.StateType {}
    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        namespace = Namespaces.policyserviceOrder;
        headerContent = "政策订阅";
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, this.headerContent, nextProps);

            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && this.props.location!.pathname!.length > nextProps.location!.pathname!.length) {
                this.initData();
            }
        }
        initData() {
            this.dispatch({ type: `initPage`, pageIndex: 1 });
        }
        componentDidMount() {
            setNavTitle.call(this, this.headerContent);
            this.initData();
        }
        /**
         * 刷新列表
         */
        onRefresh() {}

        /**
         * 上拉刷新
         */
        pullToRefresh() {
            this.getData(1);
        }
        /**
         * 下拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getData((state!.currentPage || 0) + 1);
        }
        getData(_pageIndex?: number) {
            this.dispatch({ type: `getDatas`, pageIndex: _pageIndex });
        }
        renderItemsContent(_item: any, _i: number): React.ReactNode {
            return (
                <List className="list-item-no invoice-title-list my-apply-list policyservice-orderlist">
                    <List.Item
                        align="top"
                        wrap
                        multipleLine
                        onClick={() => {
                            if (_item.bindTabelName === IParkBindTableNameEnum.policyService) {
                                goToCompatibleWxmini(this, () => {
                                    _item.id && this.goTo(`policyservicedetails/${_item.id}`); // 细则

                                })
                            } else {

                                goToCompatibleWxmini(this, () => {
                                    _item.id && this.goTo(`policyserviceoriginaldetails/${_item.id}`); // 原文
                                })
                            }
                        }}
                    >
                        <List.Item.Brief>
                            <Flex className="size-14 title">
                                <Flex.Item className="omit omit-1">{_item.title}</Flex.Item>
                            </Flex>
                        </List.Item.Brief>
                        <List.Item.Brief>
                            <Flex className="size-12 date">
                                <Flex.Item className="omit omit-1">{formatDate(_item.inputTime)}</Flex.Item>
                            </Flex>
                        </List.Item.Brief>
                    </List.Item>
                </List>
            );
        }
        renderNoData() {
            return (
                <div style={{ height: "60%" }}>
                    <div style={{ height: "80%" }}>
                        <NoData.Component text={"您还没订阅过政策,快去订阅您想了解的政策,可在第一时间收到政策更新提醒哦~"} />
                    </div>

                    <div style={{ width: "80%", position: "absolute", left: "50%", marginLeft: "-40%" }}>
                        <Button
                            onClick={(_e) => {
                                goToCompatibleWxmini(this, () => {
                                    this.goTo("policyserviceordermanager");

                                })
                            }}
                            className="radius-button margin-right-xs"
                            type={"primary"}
                        >
                            立即订阅
                        </Button>
                    </div>
                </div>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props;
            const isSubscription = state!.isSubscription;
            if (isSubscription !== true && isSubscription !== false ) {
                return null
            }
            return <div className="container-body apply-container">{isSubscription ? this.getListView() : this.renderNoData()}</div>;
        }
        renderFooter() {
            const { state } = this.props;
            const isSubscription = state!.isSubscription;
            if (isSubscription !== true && isSubscription !== false ) {
                return null
            }
            return (
                isSubscription && (
                    <Flex className="flex-collapse">
                        <Flex.Item>
                            <Button
                                type={"primary"}
                                onClick={(_e) => {
                                    goToCompatibleWxmini(this, () => {
                                        this.goTo("policyserviceordermanager");
                                    })
                                }}
                            >
                                订阅管理
                            </Button>
                        </Flex.Item>
                    </Flex>
                )
            );
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.policyserviceOrder]);
}
