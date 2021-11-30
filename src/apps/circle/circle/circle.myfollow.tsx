import React from "react";

import { List, SwipeAction } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";
import { ListComponent, ImageAuto, callModal, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
import { myFollowModel, Namespaces } from "@reco-m/ipark-white-circle-models";

export namespace CircleMyFollow {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, myFollowModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        bodyClass = "white-bg circle-body";
        namespace = Namespaces.myFollow;
        view;
        showheader = false;
        userID = "";

        componentDidMount() {
            this.userID = this.props.match!.params.userID;
            this.initPage();
        }

        initPage() {
            this.dispatch({
                type: `initPage`,
                params: {
                    pageIndex: 1,
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    inputerId: this.userID,
                    parkId: getLocalStorage("parkId"),
                },
            });
        }
        // 重写list渲染方法start
        getPageData(): S {
            return this.props.state![`datas${this.userID}`];
        }
        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state![`datas${this.userID}`] || {});
        }
        // 重写list渲染方法end
        onEndReached() {
            const { state } = this.props;
            this.getData((state!.CurrentPage || 0) + 1);
        }

        pullToRefresh() {
            this.getData(1);
        }

        getData(index: number) {
            this.dispatch({
                type: "getUserFollow",
                params: {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    inputerId: this.userID,
                    parkId: getLocalStorage("parkId"),
                    pageIndex: index,
                },
            });
        }
        cancelFollow(e, item) {
            callModal("确认要取消关注吗?", () => {
                this.dispatch({
                    type: "cancelFollow",
                    id: item.userId,
                    callback: () => {
                        setEventWithLabel(statisticsEvent.parkCircleCancelfollowUser);
                        this.getData(1);
                        // 刷新我的关注数量和粉丝列表
                        this.dispatch({
                            type: "accountHome/getReleventNum",
                            userID: this.props.match!.params.userID,
                        });
                        this.dispatch({
                            type: "myFans/getUserFollow",
                            params: {
                                pageIndex: 1,
                                bindTableName: IParkBindTableNameEnum.sysaccount,
                                bindTableId: this.props.match!.params.userID,
                                parkId: getLocalStorage("parkId"),
                            },
                        });
                    },
                });
            });

            e.stopPropagation();
        }
        follow(e, item) {
            this.dispatch({
                type: "follow",
                data: {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: item.userId,
                },
                callback: () => {
                    setEventWithLabel(statisticsEvent.parkCirclefollowUser);
                    this.getData(1);
                    // 刷新我的关注数量和粉丝列表
                    this.dispatch({
                        type: "accountHome/getReleventNum",
                        userID: this.props.match!.params.userID,
                    });
                    this.dispatch({
                        type: "myFans/getUserFollow",
                        params: {
                            bindTableName: IParkBindTableNameEnum.sysaccount,
                            bindTableId: this.props.match!.params.userID,
                            parkId: getLocalStorage("parkId"),
                            pageIndex: 1,
                        },
                    });
                },
            });
            e.stopPropagation();
        }
        renderItemFollow(item): React.ReactNode {
            return item.status ? (
                <div
                    className="tag type2 my-home-follow"
                    onClick={(e) => {
                        this.cancelFollow(e, item);
                    }}
                >
                    取消关注
                </div>
            ) : (
                <div
                    className="tag type1 my-home-follow"
                    onClick={(e) => {
                        this.follow(e, item);
                    }}
                >
                    关注
                </div>
            );
        }
        renderItemNotCurrentUser(item): React.ReactNode {
            const { state } = this.props,
                swipeActionOpen = state!.swipeActionOpen;
            return (
                <List.Item
                    wrap
                    align="middle"
                    onClick={(e) => {
                        if (swipeActionOpen !== true) {
                            this.goTo(`home/${item.userId}`);
                        }
                        e.stopPropagation();
                    }}
                    thumb={
                        <ImageAuto.Component
                            cutWidth="38"
                            cutHeight="38"
                            className="mv18"
                            width="38px"
                            height="38px"
                            radius="38px"
                            src={item.profilePath || "assets/images/myBackgroundview1.png"}
                        />
                    }
                >
                    <div className="omit omit-1 size-16" style={{ width: "84%" }}>
                        {item.userName}
                    </div>
                    <div className="omit omit-1 size-12 gray-three-color">{item.companyName}</div>
                </List.Item>
            );
        }
        renderItemCurrentUser(item): React.ReactNode {
            const { state } = this.props,
                swipeActionOpen = state!.swipeActionOpen;
            return <SwipeAction
            key={`${item.userId}${item.status}`}
            style={{ backgroundColor: "gray" }}
            autoClose
            disabled={item.status}
            right={[
                {
                    text: "取消",
                    style: { backgroundColor: "#ddd", color: "white" },
                },
                {
                    text: "删除",
                    onPress: () => {
                        callModal("删除后，该用户将从您的关注列表中移除，是否确认删除？", () => {
                            this.dispatch({
                                type: "deleteFollow",
                                id: item.id,
                                callback: () => {
                                    this.getData(1);
                                },
                            });
                        });
                    },
                    style: { backgroundColor: "#F4333C", color: "white" },
                },
            ]}
            onOpen={() => {
                this.dispatch({ type: "input", data: { swipeActionOpen: true } });
            }}
            onClose={() => {
                setTimeout(() => {
                    this.dispatch({ type: "input", data: { swipeActionOpen: null } });
                }, 1000);
            }}
        >
            <List.Item
                wrap
                align="middle"
                onClick={(e) => {
                    if (swipeActionOpen !== true) {
                        this.goTo(`home/${item.userId}`);
                    }
                    e.stopPropagation();
                }}
                thumb={
                    <ImageAuto.Component
                        cutWidth="38"
                        cutHeight="38"
                        className="mv18"
                        width="38px"
                        height="38px"
                        radius="38px"
                        src={item.profilePath || "assets/images/myBackgroundview1.png"}
                    />
                }
            >
                <div className="omit omit-1 size-16" style={{ width: "84%" }}>
                    {item.userName}
                </div>
                <div className="omit omit-1 size-12 gray-three-color">{item.companyName}</div>
                {this.renderItemFollow(item)}
            </List.Item>
        </SwipeAction>
        }
        renderItemsContent(item: any, _?: any): React.ReactNode {
            const { state } = this.props,
                isNotCurrentUser = state![`isNotCurrentUser${this.userID}`];
            return isNotCurrentUser ? (
                this.renderItemNotCurrentUser(item)
            ) : (
                this.renderItemCurrentUser(item)
            );
        }
        render(): React.ReactNode {
            return this.getListView();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myFollow]);
}
