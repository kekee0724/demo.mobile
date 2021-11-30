import React from "react";

import { Button, List, Flex, WhiteSpace, Toast } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { Container, NoData } from "@reco-m/core-ui";

import { Namespaces, policyserviceOrderModel } from "@reco-m/policymatching-models";

import { WBFormViewComponent, tagTypeEnum } from "@reco-m/ipark-common-page";

export namespace PolicyServiceOrderManager {
    export interface IProps<S extends IState = IState> extends WBFormViewComponent.IProps<S> {
        selectTagtest?: any;
    }
    export interface IState extends WBFormViewComponent.IState, policyserviceOrderModel.StateType {}
    export class Component<P extends IProps = IProps, S extends IState = IState> extends WBFormViewComponent.Component<P, S> {
        showloading = false;
        namespace = Namespaces.policyserviceOrder;
        headerContent = "订阅管理";

        componentDidMount() {
            this.dispatch({ type: "getSubscription" });
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
            this.getData((state!.pageIndex || 0) + 1);
        }
        getData(_pageIndex?: number) {}
        renderNoData() {
            return (
                <div style={{ height: "60%" }}>
                    <div style={{ height: "80%" }}>
                        <NoData.Component text={"您还没订阅过政策,快去订阅您想了解的政策,可在第一时间收到政策更新提醒哦~"} />
                    </div>

                    <div style={{ width: "80%", position: "absolute", left: "50%", marginLeft: "-40%" }}>
                        <Button onClick={(_e) => {}} className="radius-button margin-right-xs" type={"primary"}>
                            立即订阅
                        </Button>
                    </div>
                </div>
            );
        }
        renderBody(): React.ReactNode {
            let { state } = this.props,
                { tagList = [] } = state as any;
            return (
                <Container.Component body>
                    <div className="policy-order-manager">
                        {tagList.map((item, index) => {
                            return (
                                <List renderHeader={item.title} key={index}>
                                    <WhiteSpace size={"lg"} />
                                    {this.renderTags({
                                        stateKey: item.map,
                                        tagsData: item.list,
                                        multiple: true,
                                        tagLabelKey: "label",
                                        tagValueKey: "value",
                                        tagType: tagTypeEnum.big, // 设置显示大标签
                                        foldnum: 5,
                                        filterKey: "label"
                                    })}
                                </List>
                            );
                        })}
                    </div>
                </Container.Component>
            );
        }
        /**
         * 重置
         */
        onReset() {
            this.dispatch({ type: "resetTag" });
        }
        /**
         * 确认
         */
        onConfirm() {
            this.dispatch({
                type: "subscription",
                callback: () => {
                    this.dispatch({ type: "getSubscription", message: this.message });
                    Toast.success("订阅成功", 2, () => {
                        this.goBack();
                    })
                },
            });
        }
        renderFooter() {
            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                this.onReset();
                            }}
                        >
                            重置
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button
                            type={"primary"}
                            onClick={() => {
                                this.onConfirm();
                            }}
                        >
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policyserviceOrder]);
}
