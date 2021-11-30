import React from "react";

import { Tabs, List, Flex, Button } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";
import { ListComponent, ImageAuto } from "@reco-m/core-ui";

import { Namespaces, CertifyStatusEnum, staffmanagerApprovalModel } from "@reco-m/member-models";


import { getStatus, tabs } from "./common";

export namespace StaffmanagerApproval {

    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, staffmanagerApprovalModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "员工认证审核";
        scrollable = false;
        bodyClass = "container-height";
        status = CertifyStatusEnum.noConfim;
        namespace = Namespaces.staffmanagerApproval;

        componentMount() {
            this.dispatch({
                type: `initPage`, data: {
                    status: this.status
                }
            });
        }

        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.getData(1);
            }
        }

        getData(pageIndex?: any) {
            this.dispatch({
                type: "getStaffmanagerApproval",
                pageIndex: pageIndex,
                status: this.status
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getData(1);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;

            this.getData((state!.currentPage || 0) + 1);
        }

        renderApprovalButton(item: any): React.ReactNode {

            return item.status === CertifyStatusEnum.noConfim ? (
                <div className="my-apply-btn">
                    <Button type="primary" size="small" inline onClick={() => this.goTo(`detail/${item.accountId}`)}>
                        <span> 去审核</span>
                    </Button>
                </div>
            ) : (
                    null
                );
        }

        renderItemsContent(item: any, i: any): React.ReactNode {

            return <List className="line-border-no my-apply-list" key={i}>
            <List.Item wrap multipleLine>
                <div
                    className="my-order-flex"
                    onClick={() => {
                        this.goTo(`detail/${item.accountId}`);
                    }}
                >
                    <ImageAuto.Component cutWidth="80" cutHeight="80" src={item.avatar ? item.avatar : "assets/images/zwtx.png"} height="80px" width="80px" />
                    <div className="flex1">
                        <Flex align="start">
                            <Flex.Item>
                                <div className="omit omit-2">{item.realName}</div>
                            </Flex.Item>
                            <div className="size-14">{getStatus(item.status)}</div>
                        </Flex>
                        <div className="margin-top-xs">
                            <span className="size-14 gray-four-color">
                                <i className="icon icon-newpel size-14 margin-right-xs" />
                                {item.mobile ? item.mobile : ""}
                            </span>
                        </div>
                        {item.inputTime && <div className="gray-four-color size-14">
                            <i className="icon icon-shijian size-15 margin-right-xs" />
                            <span>{formatDateTime(item.inputTime)}</span>
                        </div>}
                    </div>
                </div>
                <div key={"b"}>{this.renderApprovalButton(item)}</div>
            </List.Item>
        </List>;
        }

        renderBody(): React.ReactNode {
            const showList = this.props.state!.showList;
            return (
                <div className="container-body apply-container">
                    <Tabs
                        tabs={tabs()}
                        initialPage={1}
                        swipeable={false}
                        onChange={tab => {
                            this.dispatch({ type: "input", data: { showList: false } });
                            this.status = tab.Status;
                            this.getData(1);
                        }}
                    >
                        {showList ? this.getListView() : null}
                    </Tabs>
                </div>
            );
        }
    }

    export const Page = template(
        Component,
        state => state[Namespaces.staffmanagerApproval]
    );
}
