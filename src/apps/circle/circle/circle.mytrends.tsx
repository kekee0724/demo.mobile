import React from "react";

import { Flex, List } from "antd-mobile-v2";

import { template, isAnonymous, friendlyTime, transformImageUrl } from "@reco-m/core";
import { ListComponent, ImageAuto, setEventWithLabel, shake, callModal } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces as commentNamespaces } from "@reco-m/comment-models";
import { myTrendModel, Namespaces } from "@reco-m/ipark-white-circle-models";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace CircleMyTrend {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, myTrendModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        bodyClass = "white-bg circle-body";
        namespace = Namespaces.myTrend;
        view;
        showheader = false;
        scrollable = false;
        pagesize = 5;
        userID = "";
        componentDidMount() {
            this.userID = this.props.match!.params.userID;
            this.dispatch({
                type: "initPage",
                data: {
                    id: this.userID,
                    datas: { pageIndex: 1 },
                },
            });
        }
        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state);
        }
        onEndReached() {
            const { state } = this.props;
            this.getData((state!.currentPage || 0) + 1);
        }

        pullToRefresh() {
            this.getData(1);
        }

        getData(index: number) {
            const data = { pageIndex: index };
            const id = this.props.match!.params.userID;
            this.dispatch({
                type: "getCircleTopic",
                data,
                id,
            });
        }
        renderItemDelet(item): React.ReactNode {
            const { state } = this.props,
                isNotCurrentUser = state![`isNotCurrentUser${this.userID}`];
            return isNotCurrentUser ? null : (
                <div
                    className="tag type2"
                    onClick={(e) => {
                        callModal("确认要删除吗?", () => {
                            this.dispatch({
                                type: "delTopic",
                                id: item.id,
                                callback: () => {
                                    this.getData(1);
                                    this.dispatch({
                                        type: "accountHome/getReleventNum",
                                        userID: this.props.match!.params.userID,
                                    });
                                },
                            });
                        });
                        e.stopPropagation();
                    }}
                >
                    删除
                </div>
            );
        }
        renderItemImages(item): React.ReactNode {
            return item.pictureUrlList && item.pictureUrlList.length === 1 ? (
                <ImageAuto.Component cutWidth="384" cutHeight="233" src={item.pictureUrlList[0]} />
            ) : item.pictureUrlList && item.pictureUrlList.length === 2 ? (
                <Flex>
                    {item.pictureUrlList.map((item, i) => {
                        return (
                            <Flex.Item key={i}>
                                <ImageAuto.Component cutHeight="100" src={item} width="100%" height="100px" />
                            </Flex.Item>
                        );
                    })}
                </Flex>
            ) : (
                <div className="grid-img">
                    {item.pictureUrlList &&
                        item.pictureUrlList.map((item, i) => {
                            return (
                                <div className="rows" key={i}>
                                    <ImageAuto.Component cutHeight="90" src={item} width="100%" height="90px" />
                                </div>
                            );
                        })}
                </div>
            );
        }
        renderItemsContent(item: any, _?: any, i?: number): React.ReactNode {
            return (
                <List.Item wrap onClick={() => this.goTo(`topic/${item.id}?commentNum=${item.commentNum}`)} key={i}>
                    <Flex className="mt7">
                        <div className="circle-user-img">
                            <img src={item.avatarPictureUrl ? transformImageUrl(item.avatarPictureUrl, 35, 35) : "assets/images/myBackgroundview1.png"}></img>
                        </div>
                        <Flex.Item>
                            <div className="title omit omit-1 size-13">{item.publisher}</div>
                            <div className="title omit omit-1 size-13 gray-three-color">{item.companyName}</div>
                        </Flex.Item>
                        {this.renderItemDelet(item)}
                    </Flex>
                    <div className="pt10 pb5 omit omit-6" style={{ whiteSpace: "pre-wrap" }}>
                        {item.postContent && item.postContent.replace(/<br\/>/g, "\n").replace(/<br>/g, "\n")}
                    </div>
                    {this.renderItemImages(item)}
                    <Flex className="mt10 size-14 mb6">
                        <Flex.Item>
                            <span className="color-c">{friendlyTime(item.publishTime)}</span>
                        </Flex.Item>
                        <Flex.Item className="text-right">
                            <span className="color-e">
                                <i className="icon icon-huifu size-12 color-d mr5"></i>
                                {item.commentNum || 0}
                            </span>
                            <span
                                className="color-e ml20"
                                onClick={(e) => {
                                    shake();
                                    isAnonymous()
                                        ? this.goTo("login")
                                        : this.dispatch({
                                              type: `${commentNamespaces.comment}/likeComment`,
                                              bindTableName: IParkBindTableNameEnum.post,
                                              comment: { isAgreed: item.agree, id: item.id },
                                              likecallback: () => {
                                                  if (!item.agreeNum) {
                                                      setEventWithLabel(statisticsEvent.parkCircleDynamicPraise);
                                                  }
                                                  this.getData(1);
                                              },
                                          });
                                    e.stopPropagation();
                                }}
                            >
                                <i className="icon icon-newzan size-12 mr5" style={{ color: item.agree ? "#05b8cd" : "" }}></i>
                                {item.agreeNum || 0}
                            </span>
                        </Flex.Item>
                    </Flex>
                </List.Item>
            );
        }
        render(): React.ReactNode {
            return <div className="circle-list">{this.getListView()}</div>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myTrend]);
}
