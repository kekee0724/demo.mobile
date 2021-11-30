import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { Flex, List } from "antd-mobile-v2";

import { template, isAnonymous, friendlyTime, transformImageUrl } from "@reco-m/core";
import { ListComponent, ImageAuto, setEventWithLabel, shake, callModal } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces as commentNamespaces } from "@reco-m/comment-models";
import { Namespaces, NewesttopicdetailsModel } from "@reco-m/ipark-white-circle-models";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
export namespace newesttopicdetails {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        clickNum?: any;
    }

    export interface IState extends ListComponent.IState, NewesttopicdetailsModel.StateType {
        scroll?: any;
        hasMore?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = this.props.clickNum ? true : false;
        bodyClass = "white-bg circle-body";
        namespace = Namespaces.newesttopicdetails;
        view;
        showheader = false;
        middle = true;
        scrollable = false;
        componentMount() {
            this.dispatch({ type: "init" });
        }
        componentWillUnmount() {
            this.dispatch({ type: "input", data: { refreshing: null, title: "全部动态" } });
        }
        componentDidMount() {
            setEventWithLabel(statisticsEvent.parkCircleDynamicView);
            this.dispatch({
                type: "initPage",
                data: {
                    datas: {
                        pageIndex: 1,
                        pageSize: 5,
                    },
                    refreshing: null,
                },
            });
        }
        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state);
        }
        onEndReached() {
            const { state } = this.props,
                isMyFollow = state!.isMyFollow;
            if (isMyFollow) {
                this.getData((state!.pageIndex || 0) + 1, { isMyFollow: true });
            } else {
                this.getData((state!.pageIndex || 0) + 1);
            }
        }

        pullToRefresh() {
            this.getData(1);
        }
        renderPullToRefresh() {
            return null;
        }
        getData(index: number, isMyFollowData?) {
            const { state } = this.props,
            categoryValue = state!.categoryValue;
            const data = {
                pageIndex: index,
                pageSize: 5,
                categoryValue,
                ...isMyFollowData,
            };
            this.dispatch({
                type: "getCircleTopic",
                data,
            });
            this.dispatch({ type: "input", data: { pageIndex: index } });
        }

        getDatas() {
            this.dispatch({
                type: "getCircleTopicTwo",
            });
        }
        renderFollow(item): React.ReactNode {
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
                            <img
                                src={
                                    item.avatarPictureUrl && item.avatarPictureUrl.length
                                        ? `${transformImageUrl(item.avatarPictureUrl, 70, 70)}`
                                        : "assets/images/myBackgroundview1.png"
                                }
                            ></img>
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
                        {this.renderFollow(item)}
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
                                {item.commentNum || 0}
                            </span>
                            <span
                                className="color-e ml20"
                                onClick={(e) => {
                                    this.itemLikeClick(e, item);
                                }}
                            >
                                <i className="icon icon-newzan size-12 mr5" style={{ color: item.agree ? "#05b8cd" : "" }} />
                                {item.agreeNum ? item.agreeNum : 0}
                            </span>
                        </Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        /** 骨架屏 */
        renderSkeletons(count) {
            let items: any = [];
            for (let i = 0; i < count; i++) {
                items.push(1);
            }

            return this.props.clickNum
                ? null
                : items.map((_, i) => (
                      <List.Item key={i}>
                          <SkeletonTheme color={"#F0F0F0"} highlightColor={"f5f5f5"}>
                              <div className="mt7">
                                  <Skeleton circle={true} height={25} width={25} />
                                  <span className="ml5">
                                      <Skeleton count={1} height={25} width={100} />
                                  </span>
                                  <span className="pull-right">
                                      <Skeleton count={1} height={25} width={50} />
                                  </span>
                              </div>
                              <div className="pt10 pb5">
                                  <Skeleton count={1} height={30} />
                              </div>
                              <div className="mt10 mb7">
                                  <Skeleton count={1} height={15} width={70} />
                                  <span className="pull-right">
                                      <Skeleton count={1} height={15} width={50} />
                                      <span className="ml5">
                                          <Skeleton count={1} height={15} width={50} />
                                      </span>
                                  </span>
                              </div>
                          </SkeletonTheme>
                      </List.Item>
                  ));
        }

        render(): React.ReactNode {
            const { state } = this.props,
                show = state!.show,
                title = state!.title,
                top = state!.top;
            return (
                <List
                    renderHeader={
                        <div className="infor-popver">
                            <span
                                className="title"
                                onClick={() => {
                                    this.dispatch({ type: "input", data: { show: !show, top: !top } });
                                }}
                            >
                                {title}
                            </span>
                            <i className={"triangle " + (top ? "active" : "")}></i>
                            <div className={"bd " + (show ? "show" : "")}>
                                <i></i>
                                <span
                                    className={title === "全部动态" ? "active" : ""}
                                    onClick={() => {
                                        setEventWithLabel(statisticsEvent.parkCircleDynamicView);
                                        this.dispatch({ type: "input", data: { show: false, top: false, title: "全部动态", isMyFollow: false } });
                                        this.getData(1);
                                    }}
                                >
                                    全部动态
                                </span>
                                <span
                                    className={title === "我关注的" ? "active" : ""}
                                    onClick={() => {
                                        setEventWithLabel(statisticsEvent.parkCircleMyfollowDynamicView);
                                        this.dispatch({ type: "input", data: { show: false, top: false, title: "我关注的", isMyFollow: true } });
                                        this.getData(1, { isMyFollow: true });
                                    }}
                                >
                                    我关注的
                                </span>
                            </div>
                        </div>
                    }
                    className="circle-list"
                >
                    {state!.refreshing !== false ? this.renderSkeletons(5) : this.getListView(true)}
                </List>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.newesttopicdetails]);
}
