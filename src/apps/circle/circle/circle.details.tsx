import React from "react";

import { Flex, NavBar, List, Icon } from "antd-mobile-v2";

import { template, isAnonymous, friendlyTime, transformImageUrl } from "@reco-m/core";
import { ListComponent, ImageAuto, setEventWithLabel, shake, callModal } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces as commentNamespaces } from "@reco-m/comment-models";
import { Namespaces, circleDetailModel } from "@reco-m/ipark-white-circle-models";
import { IParkBindTableNameEnum, debounce } from "@reco-m/ipark-common";

export namespace CircleDetails {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, circleDetailModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        isRoot = true;
        showloading = true;
        bodyClass = "white-bg circle-body";
        namespace = Namespaces.circleDetail;
        view;
        showback = false;
        debounceJoinCircle = debounce(this.joinCircle.bind(this), 2000);
        debounceOutCircle = debounce(this.outCircle.bind(this), 2000);

        componentDidMount() {
            setEventWithLabel(statisticsEvent.parkCircleDetailView);
            this.dispatch({
                type: "initPage",
                data: { id: this.props.match!.params.id, datas: { pageIndex: 1, pageSize: 10 } },
            });
        }
        addPostView(id) {
            this.dispatch({ type: "addPostView", id: id });
        }
        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && this.props.location!.pathname!.length > nextProps.location!.pathname!.length) {
                this.pullToRefresh();
            }
        }

        onEndReached() {
            let { state } = this.props,
                { isBind } = state as any;
            this.getData((state!.pageIndex || 0) + 1, isBind);
        }

        pullToRefresh() {
            let { state } = this.props,
                { isBind } = state as any;
            this.getData(1, isBind);
        }

        getData(index: number, _: any) {
            const data = { pageIndex: index, pageSize: 10 };
            const id = this.props.match!.params.id;
            this.dispatch({
                type: "getCircleTopic",
                data,
                id,
            });
            this.dispatch({ type: "input", data: { pageIndex: index } });
        }

        getDatas() {
            const { state } = this.props,
                pageIndex = state!.pageIndex;
            const data = { pageIndex: 1, pageSize: pageIndex * 10 };
            const id = this.props.match!.params.id;
            this.dispatch({
                type: "getCircleTopicTwo",
                data,
                id,
            });
        }

        renderHeaderLeft(): React.ReactNode {
            return <Icon type="left" onClick={() => this.goBack()} />;
        }

        outCircle(id) {
            this.dispatch({
                type: "outCircle",
                id: id,
                callback: () => {
                    setEventWithLabel(statisticsEvent.parkCancelPartakeCircle);
                    this.dispatch({ type: "getCircleData", id: this.props.match!.params.id });
                },
            });
        }

        joinCircle(id) {
            if (!this.isAuth()) {
                this.goTo(`login`);
                return;
            }
            this.dispatch({
                type: "joinCircle",
                id: id,
                callback: () => {
                    setEventWithLabel(statisticsEvent.parkPartakeCircle);
                    this.dispatch({ type: "getCircleData", id: this.props.match!.params.id });
                },
            });
        }
        renderItemFollow(item): React.ReactNode {
            const { state } = this.props,
                user = state!.user,
                currentUser = user && user.currentUser;
            return item.publisherId !== (currentUser && currentUser.id) ? (
                item.follow ? (
                    <div
                        className="tag type2"
                        onClick={(e) => {
                            isAnonymous()
                                ? this.goTo("login")
                                : callModal("确认要取消关注吗?", () => {
                                      this.dispatch({
                                          type: "cancelFollow",
                                          id: item.publisherId,
                                          callback: () => {
                                              setEventWithLabel(statisticsEvent.parkCircleCancelfollowUser);
                                              this.getDatas();
                                          },
                                      });
                                  });
                            e.stopPropagation();
                        }}
                    >
                        已关注
                    </div>
                ) : (
                    <div
                        className="tag type1 "
                        onClick={(e) => {
                            isAnonymous()
                                ? this.goTo("login")
                                : this.dispatch({
                                      type: "follow",
                                      data: {
                                          bindTableName: "sys_account",
                                          bindTableId: item.publisherId,
                                      },
                                      callback: () => {
                                          setEventWithLabel(statisticsEvent.parkCirclefollowUser);
                                          this.getDatas();
                                      },
                                  });
                            e.stopPropagation();
                        }}
                    >
                        关注
                    </div>
                )
            ) : (
                ""
            );
        }
        renderItemImage(item): React.ReactNode {
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
        itemLikeClick(e, item) {
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
                          this.getDatas();
                      },
                  });
            e.stopPropagation();
        }
        renderItemsContent(item: any, _?: any, i?: number): React.ReactNode {
            return (
                <List.Item onClick={() => this.goTo(`topic/${item.id}?commentNum=${item.commentNum}`)} key={i} wrap>
                    <Flex className="mt7">
                        <div
                            className="circle-user-img"
                            onClick={(e) => {
                                this.goTo(`home/${item.publisherId}`);
                                e.stopPropagation();
                            }}
                        >
                            <img src={item.avatarPictureUrl ? transformImageUrl(item.avatarPictureUrl, 35, 35) : "assets/images/myBackgroundview1.png"}></img>
                        </div>
                        <Flex.Item>
                            <div className="title omit omit-1 size-13">
                                <span
                                    onClick={(e) => {
                                        this.goTo(`home/${item.publisherId}`);
                                        e.stopPropagation();
                                    }}
                                >
                                    {item.publisher}
                                </span>
                            </div>
                            <div className="title omit omit-1 size-13 gray-three-color">{item.companyName}</div>
                        </Flex.Item>
                        {this.renderItemFollow(item)}
                    </Flex>
                    <div className="pt10 margin-bottom-xs omit omit-3" style={{ whiteSpace: "pre-wrap", fontWeight: 400 }}>
                        {item.postContent.replace(/<br\/>/g, "\n").replace(/<br>/g, "\n")}
                    </div>
                    {this.renderItemImage(item)}
                    <Flex className="mt10 size-14 mb6">
                        <Flex.Item>
                            <span className="color-c">{friendlyTime(item.publishTime)}</span>
                        </Flex.Item>
                        <Flex.Item className="text-right">
                            <span className="color-e">
                                <i className="icon icon-huifu size-12 color-d mr5" />
                                {item.commentNum}
                            </span>
                            <span
                                className="color-e ml20"
                                onClick={(e) => {
                                    this.itemLikeClick(e, item);
                                }}
                            >
                                <i className="icon icon-newzan size-12 mr5" style={{ color: item.agree ? "#05b8cd" : "" }} />
                                {item.agreeNum ? item.agreeNum : ""}
                            </span>
                        </Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        renderHeader(): React.ReactNode {
            const { state } = this.props,
                circleDetail = state!.circleDetail,
                picurl = circleDetail && circleDetail.pictureUrlList && circleDetail.pictureUrlList[0];

            return (
                <>
                    <NavBar className="park-nav back-none new-bg-opcity1" leftContent={this.renderHeaderLeft()} rightContent={this.renderHeaderRight()}></NavBar>
                    <div className="header-banner discover-details-img">
                        <List.Item
                            multipleLine
                            align="top"
                            wrap
                            extra={
                                circleDetail && circleDetail.isSubscribe ? (
                                    <span
                                        className="tag type2" // "discover-details-tag mt15"
                                        onClick={() => {
                                            isAnonymous()
                                                ? this.goTo("login")
                                                : callModal("确认要取消参与吗?", () => {
                                                      this.debounceOutCircle(circleDetail && circleDetail.id); // this.outCircle(circleDetail && circleDetail.id);
                                                  });
                                        }}
                                    >
                                        已参与
                                    </span>
                                ) : (
                                    <span
                                        className="tag type1" // "discover-details-tag mt15"
                                        onClick={() => {
                                            isAnonymous() ? this.goTo("login") : this.debounceJoinCircle(circleDetail && circleDetail.id); // this.joinCircle(circleDetail && circleDetail.id);
                                        }}
                                    >
                                        参与
                                    </span>
                                )
                            }
                            thumb={<ImageAuto.Component cutWidth="55" cutHeight="55" height="55px" width="55px" radius="8px" src={picurl}></ImageAuto.Component>}
                        >
                            <div className="size-18 white-color omit omit-1">{circleDetail && circleDetail.topicName}</div>
                            <Flex className="size-17 mt5">
                                <Flex.Item>
                                    <span className="color-a ">{circleDetail && circleDetail.memberNumber ? circleDetail.memberNumber : 0}</span>
                                    <span className="size-12 color-b"> / 成员</span>
                                </Flex.Item>
                                <Flex.Item>
                                    <span className="color-a">{circleDetail && circleDetail.postNumber ? circleDetail.postNumber : 0}</span>
                                    <span className="size-12 color-b"> / 动态</span>
                                </Flex.Item>
                            </Flex>
                        </List.Item>
                        <ImageAuto.Component width="100%" cutWidth="384" cutHeight="233" src={picurl} />
                    </div>
                </>
            );
        }

        renderBody(): React.ReactNode {
            return <div className="circle-list">{this.getListView()}</div>;
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                circleDetail = state!.circleDetail;
            return circleDetail && circleDetail.isSubscribe ? (
                <div
                    className="btn-edit"
                    onClick={() => {
                        isAnonymous() ? this.goTo("login") : this.goTo("add");
                    }}
                >
                    <i className="icon icon-jiahao"></i>
                </div>
            ) : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.circleDetail]);
}
