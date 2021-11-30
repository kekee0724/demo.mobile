import React from "react";

import { Flex, List } from "antd-mobile-v2";

import { template, isAnonymous, getLocalStorage } from "@reco-m/core";
import { ListComponent, ImageAuto, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { myTopicModel, Namespaces } from "@reco-m/ipark-white-circle-models";

export namespace CircleMyTopic {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, myTopicModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        bodyClass = "white-bg circle-body";
        namespace = Namespaces.myTopic;
        view;
        showheader = false;
        userID = "";
        componentDidMount() {
            this.userID = this.props.match!.params.userID;
            const data = {
                parkId: getLocalStorage("parkId"),
                pageIndex: 1,
                topicUserId: this.props.match!.params.userID,
            };
            this.dispatch({ type: "initPage", data: { datas: data, userID: this.userID } });
        }
        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state);
        }
        onEndReached() {
            let { state } = this.props,
                { isBind } = state as any;
            this.getData((state!.currentPage || 0) + 1, isBind);
        }

        pullToRefresh() {
            let { state } = this.props,
                { isBind } = state as any;
            this.getData(1, isBind);
        }

        getData(index: number, _: any) {
            const data = {
                parkId: getLocalStorage("parkId"),
                pageIndex: index,
                pageSize: 9999,
                topicUserId: this.props.match!.params.userID,
            };
            this.dispatch({
                type: "getCircleData",
                data,
            });
        }

        outCircle(id) {
            this.dispatch({
                type: "outCircle",
                id: id,
                callback: () => {
                    setEventWithLabel(statisticsEvent.parkCancelPartakeCircle);
                    this.dispatch({
                        type: "getCircleData",
                        data: {
                            parkId: getLocalStorage("parkId"),
                            pageIndex: 1,
                            pageSize: 10,
                            topicUserId: this.props.match!.params.userID,
                        },
                    });
                    // // 刷新我的关注数量和粉丝列表
                    this.dispatch({
                        type: "accountHome/getReleventNum",
                        userID: this.props.match!.params.userID,
                    });
                },
            });
        }
        joinCircle(id) {
            if (!this.isAuth()) {
                this.goTo(`/login`);
                return;
            }
            this.dispatch({
                type: "joinCircle",
                id: id,
                callback: () => {
                    setEventWithLabel(statisticsEvent.parkPartakeCircle);
                    this.dispatch({
                        type: "getCircleData",
                        data: {
                            parkId: getLocalStorage("parkId"),
                            pageIndex: 1,
                            pageSize: 9999,
                            topicUserId: this.props.match!.params.userID,
                        },
                    });
                },
            });
        }
        renderItemExtra(item): React.ReactNode {
            const { state } = this.props,
                isNotCurrentUser = state![`isNotCurrentUser${this.userID}`];
            let imgurl = item.pictureUrlList && item.pictureUrlList[0];
            return isNotCurrentUser ? (
                <div className="ent-logo-box ml40">
                    <ImageAuto.Component cutWidth="76" cutHeight="76" src={imgurl} width="100%" height="100%"></ImageAuto.Component>
                </div>
            ) : (
                <>
                    <div className="ent-logo-box ml40">
                        <ImageAuto.Component cutWidth="76" cutHeight="76" src={imgurl} width="100%" height="100%"></ImageAuto.Component>
                    </div>
                    {item.isSubscribe ? (
                        <div
                            className="tag type2 mt10 ml40 mr10 text-center"
                            onClick={(e) => {
                                isAnonymous() ? this.goTo("login") : this.outCircle(item && item.id);
                                e.stopPropagation();
                            }}
                        >
                            已参与
                        </div>
                    ) : (
                        <div
                            className="tag type1 mt10 mr10"
                            onClick={(e) => {
                                isAnonymous() ? this.goTo("login") : this.joinCircle(item && item.id);
                                e.stopPropagation();
                            }}
                        >
                            参与
                        </div>
                    )}
                </>
            );
        }
        renderItemsContent(item: any, _?: any, i?: number): React.ReactNode {
            return (
                <List.Item multipleLine onClick={() => this.goTo(`circleDetail/${item.id}`)} align="top" key={i} wrap extra={this.renderItemExtra(item)}>
                    <div className="size-16 omit omit-1">{item.topicName}</div>
                    <div className="omit omit-3  size-13 gray-two-color mt8" style={{ minHeight: 60 }}>
                        {item.summary}
                    </div>
                    <Flex>
                        <Flex.Item>
                            <span className="mr5 size-14">成员</span>
                            <span className="color-a">{item.memberCount || 0}</span>
                        </Flex.Item>
                        <Flex.Item>
                            <span className="mr5 size-14">动态</span>
                            <span className="color-a">{item.postCount || 0}</span>
                        </Flex.Item>{" "}
                    </Flex>
                </List.Item>
            );
        }
        render(): React.ReactNode {
            return this.getListView();
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.myTopic]);
}
