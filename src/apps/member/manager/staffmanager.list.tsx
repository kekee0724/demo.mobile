import React from "react";

import { ActionSheet, List, SearchBar, NoticeBar, Toast, Modal, SwipeAction, Flex } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ListComponent, ImageAuto, setEventWithLabel, Container } from "@reco-m/core-ui";

import { Namespaces, MemberTypeEnum, staffmanagerListModel } from "@reco-m/member-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { callTel } from "@reco-m/ipark-common"
export namespace Staffmanager {

    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, staffmanagerListModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "员工管理";
        scrollable = false;
        bodyClass = "container-height";
        status = null;
        namespace = Namespaces.staffmanagerList;

        componentDidMount() {
            this.dispatch({ type: `initPage` });

            setEventWithLabel(statisticsEvent.managerBrowse);
        }

        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location!.pathname!.length < this.props.location!.pathname!.length;
            if (locationChanged) {
                this.dispatch({ type: `initPage`, props: this.props });
            }
        }

        /**
         * 获取最新数量
         */
        getCount() {
            this.dispatch({
                type: "getApprovalCount"
            });
        }

        getData(data?: any, key?: any) {
            this.dispatch({
                type: "getstaffmanagerList",
                key,
                pageIndex: data ? data.pageIndex : 1
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            const { state } = this.props;
            this.getData({ pageIndex: 1 }, state!.key);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getData({ pageIndex: (state!.currentPage || 0) + 1 }, state!.key);
        }

        /**
         * 提交认证
         */
        confirmBtn(item?: any) {
            // 判断是否有证明材料
            Modal.alert("操作提示", `解绑后，【${item.realName}】将无法使用企业服务，确定继续解绑吗？`, [
                {
                    text: "取消",
                    onPress: () => { }
                },
                {
                    text: "确认",
                    onPress: () => {
                        this.dispatch({
                            type: "unBindComPany",
                            params: { ...item },
                            callback: () => {
                                Toast.success("已解绑", 2, () => {
                                    this.getData();
                                });
                            }
                        });
                    }
                }
            ]);
        }

        changeInfo(item?: any) {
            const { state } = this.props,
                usertypeNames = state!.usertypeNames;

            ActionSheet.showActionSheetWithOptions(
                {
                    options: usertypeNames,
                    cancelButtonIndex: usertypeNames.length - 1,
                    message: "请选择角色权限",
                    maskClosable: true
                },
                buttonIndex => {
                    this.dispatch({
                        type: "changeCetifyInfo",
                        buttonIndex,
                        item,
                        usertypeNames,
                        callback: () => {
                            Toast.success("修改成功", 2, () => {
                                this.getData();
                            });
                        }
                    });
                }
            );
        }

        renderSwipeActionContent(item: any): React.ReactNode {
            return (
                <List.Item
                    wrap={true}
                    multipleLine={true}
                    onClick={() => this.goTo(`staffdetail/${item.accountId}`)}
                    thumb={
                        item.avatar ? (
                            <ImageAuto.Component cutWidth="45" cutHeight="45" height="45px" width="45px" radius="45px" src={`${item.avatar}`} />
                        ) : (
                                <ImageAuto.Component width="45px" height="45px" radius="45px" src="assets/images/zwtx.png" />
                            )
                    }
                >
                    <div className="bd">
                        <div className="word">
                            <Flex className="tit">
                                <Flex.Item>
                                    <span className="name">{item.realName}</span>
                                </Flex.Item>
                                <em className={item.companyUserTypeName === MemberTypeEnum.admin ? "type2" : "type1"}>{item.companyUserTypeName}</em>
                            </Flex>
                            <div
                                className="phone"
                                style={{ width: "40%" }}
                                onClick={e => {
                                    callTel(item.mobile);
                                    e.stopPropagation();
                                }}
                            >
                             {item.mobile}
                            </div>
                        </div>
                    </div>
                </List.Item>
            );
        }

        renderItemsContent(item: any, i: any): React.ReactNode {
            return (
                <SwipeAction
                        key={i}
                        className="staff-list"
                        autoClose
                        right={[
                            {
                                text: "企业解绑",
                                onPress: () => this.confirmBtn(item),
                                style: { backgroundColor: "#ff9802", color: "white" }
                            },
                            {
                                text: "修改角色",
                                onPress: () => this.changeInfo(item),
                                style: { backgroundColor: "#ff2500", color: "white" }
                            }
                        ]}
                    >
                        {this.renderSwipeActionContent(item)}
                    </SwipeAction>
            );
        }

        goToApproval() {
            this.goTo(`approval`);

            setEventWithLabel(statisticsEvent.certificationAudit);
        }

        renderBaner(): React.ReactNode {
            const { state } = this.props;
            let approvalCount = state!.approvalCount;
            return +approvalCount ? (
                <NoticeBar marqueeProps={{ loop: false, style: { padding: "0 7.5px" } }} mode="link" onClick={() => this.goToApproval()}>
                {`您有${approvalCount ? approvalCount : ""}个员工认证申请待审核`}
            </NoticeBar>
            ) : (
                <NoticeBar marqueeProps={{ loop: false, style: { padding: "0 7.5px" } }} mode="link" onClick={() => this.goToApproval()}>
                {`员工认证审核请点此进入`}
            </NoticeBar>
                );
        }

        renderHeader(): React.ReactNode {
            return (
                <>
                    {super.renderHeader()}
                    <SearchBar
                        className="autoFocus"
                        placeholder="搜索"
                        onChange={value => {
                            this.dispatch({ type: "input", data: { key: value } });
                            this.getData({ pageIndex: 1 }, value);
                        }}
                    />
                    {this.renderBaner()}
                </>
            );
        }

        renderBody(): React.ReactNode {
            return <Container.Component body className="staffmanager-contant">{this.getListView()}</Container.Component>;
        }
    }

    export const Page = template(
        Component,
        state => state[Namespaces.staffmanagerList]
    );
}
