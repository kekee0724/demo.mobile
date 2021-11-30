import React from "react";

import { WhiteSpace, WingBlank, Button, Flex, Tabs, Icon, Modal } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";

import { ViewComponent, ImageAuto, setEventWithLabel, popstateHandler } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { accountHomeModel, Namespaces } from "@reco-m/ipark-white-circle-models";

import { CircleMyTrend } from "./circle.mytrends";
import { CircleMyTopic } from "./circle.mytopic";
import { CircleMyFollow } from "./circle.myfollow";
import { CircleMyFans } from "./circle.myfans";

export namespace AccountViewHome {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, accountHomeModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.accountHome;
        scrollable = false;
        bodyClass = "mypage-tabs container-hidden";
        userID = "";
        componentDidMount() {
            setEventWithLabel(statisticsEvent.parkUserHomeView);
            setEventWithLabel(statisticsEvent.myDynamicView);
            this.userID = this.props.match!.params.userID;

            this.dispatch({ type: "initPage", userID: this.userID });
            setTimeout(() => {
                let data = {};
                data[`time${this.userID}`] = true;
                this.dispatch({ type: "input", data: data });
            }, 300);
        }
        componentReceiveProps(nextProps: Readonly<P>): void {
            let npath = nextProps.location,
                tpath = this.props.location;
            if (npath!.pathname!.length < tpath!.pathname!.length) {
                this.receivePropsRefresh();
            }
        }
        receivePropsRefresh() {
            this.dispatch({
                type: "receivePropsRefresh",
                userID: this.userID,
                myTrendData: {
                    id: this.props.match!.params.userID,
                    datas: { pageIndex: 1, pageSize: 9999 },
                },
                myTopicData: {
                    parkId: getLocalStorage("parkId"),
                    pageIndex: 1,
                    pageSize: 9999,
                    topicUserId: this.props.match!.params.userID,
                },
                myFollowData: {
                    pageIndex: 1,
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: this.userID,
                    parkId: getLocalStorage("parkId"),
                },
                myFansData: {
                    pageIndex: 1,
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: this.userID,
                    parkId: getLocalStorage("parkId"),
                },
            });
            let data = {};
            data[`time${this.userID}`] = true;
            this.dispatch({ type: "input", data: data });
        }
        componentWillUnmount() {
            this.dispatch("init");
            let data = {};
            data[`time${this.userID}`] = false;
            this.dispatch({ type: "input", data: data });
        }

        renderHeaderContent(): React.ReactNode {
            return <span></span>;
        }
        renderHeaderRight(): React.ReactNode {
            const { state } = this.props,
                isNotCurrentUser = state![`isNotCurrentUser${this.userID}`],
                isFollow = state![`isFollow${this.userID}`];
            return !isNotCurrentUser ? (
                <div
                    style={{ fontSize: "15px" }}
                    onClick={() => {
                        this.goTo("info");
                    }}
                >
                    编辑
                </div>
            ) : isFollow ? (
                <Icon onClick={() => this.onClose(true)} type="ellipsis" />
            ) : null;
        }
        onClose(e) {
            this.dispatch({ type: "input", data: { modalState: e } });
        }

        modalFooter() {
            const { state } = this.props,
                modalState = state!.modalState || false;
            return (
                <Modal wrapClassName="myfooter-modal" popup visible={modalState} onClose={() => this.onClose(false)} animationType="slide-up">
                    <WingBlank>
                        <WhiteSpace size="lg" />
                        <Button
                            onClick={() => {
                                this.onClose(false);
                                let modal = Modal.alert("操作提示", `您确定要取消关注吗？`, [
                                    {
                                        text: "取消",
                                        onPress: () => {
                                            popstateHandler.removePopstateListener();
                                        },
                                    },
                                    {
                                        text: "确认",
                                        onPress: () => {
                                            this.dispatch({
                                                type: "cancelFollow",
                                                id: this.userID,
                                                callback: () => {
                                                    setEventWithLabel(statisticsEvent.parkCircleCancelfollowUser);
                                                    // this.getData(1);
                                                    this.dispatch({
                                                        type: `myFans/getUserFollow`,
                                                        params: {
                                                            pageIndex: 1,
                                                            bindTableName: IParkBindTableNameEnum.sysaccount,
                                                            bindTableId: this.userID,
                                                            parkId: getLocalStorage("parkId"),
                                                        },
                                                    });
                                                    this.dispatch({ type: "getUserInfo", userID: this.userID });
                                                    this.dispatch({ type: "getUserFollow", userID: this.userID });
                                                },
                                            });
                                            popstateHandler.removePopstateListener();
                                        },
                                    },
                                ]);
                                popstateHandler.popstateListener(() => {
                                    modal.close();
                                });
                            }}
                        >
                            取消关注
                        </Button>
                        <WhiteSpace size="lg" />
                        <Button onClick={() => this.onClose(false)}>取消</Button>
                        <WhiteSpace size="lg" />
                    </WingBlank>
                </Modal>
            );
        }
        renderHeaderFollow() {
            const { state } = this.props,
                isFollow = state![`isFollow${this.userID}`],
                isNotCurrentUser = state![`isNotCurrentUser${this.userID}`];
            return isNotCurrentUser ? (
                isFollow ? (
                    <div
                        className="tag type2 mt10"
                        onClick={(e) => {
                            this.onClose(true);
                            e.stopPropagation();
                        }}
                    >
                        已关注
                    </div>
                ) : (
                    <div
                        className="tag type1 mt10"
                        onClick={(e) => {
                            this.dispatch({
                                type: "follow",
                                data: {
                                    bindTableName: IParkBindTableNameEnum.sysaccount,
                                    bindTableId: this.userID,
                                },
                                callback: () => {
                                    setEventWithLabel(statisticsEvent.parkCirclefollowUser);
                                    this.dispatch({
                                        type: `myFans/getUserFollow`,
                                        params: {
                                            pageIndex: 1,
                                            bindTableName: IParkBindTableNameEnum.sysaccount,
                                            bindTableId: this.userID,
                                            parkId: getLocalStorage("parkId"),
                                        },
                                    });
                                    this.dispatch({ type: "getUserInfo", userID: this.userID });
                                    this.dispatch({ type: "getUserFollow", userID: this.userID });
                                },
                            });
                            e.stopPropagation();
                        }}
                    >
                        关注
                    </div>
                )
            ) : null;
        }
        renderHeader(): React.ReactNode {
            const { state } = this.props,
                currentCompany = state![`currentCompany${this.userID}`],
                nickName = state![`nickName${this.userID}`],
                realName = state![`realName${this.userID}`],
                province = state![`province${this.userID}`],
                city = state![`city${this.userID}`],
                idiograph = state![`idiograph${this.userID}`],
                thumb = state![`thumb${this.userID}`];
            return (
                <div className="my-homepage">
                    {super.renderHeader()}
                    <div className="mypage" onClick={() => {}}>
                        <Flex>
                            <ImageAuto.Component
                                cutWidth="59"
                                cutHeight="59"
                                className="mr7"
                                width="59px"
                                height="59px"
                                radius="59px"
                                src={(thumb && thumb.filePath) || "assets/images/myBackgroundview1.png"}
                            />
                            <Flex.Item>
                                <div className="size-18 white-color">{nickName || realName}</div>
                                <div className="size-14 blue-primary-color mt8">{currentCompany ? currentCompany : ""}</div>
                            </Flex.Item>
                            {this.renderHeaderFollow()}
                        </Flex>
                        <div className="gray-four-color size-14 pv10">{idiograph || ""}</div>
                        {province && (
                            <div className="size-14 pt5">
                                <span className="blue-primary-color">家乡：</span>
                                <span className="white-color">{`${province}${city ? city : ""}`}</span>
                            </div>
                        )}
                        <div className="blank20" />
                    </div>
                </div>
            );
        }
        getTabs() {
            const { state } = this.props,
                releventNum = state![`releventNum${this.userID}`];
            const tabs = [
                {
                    title: (
                        <div className="mypage-tabs-rows">
                            <span>{releventNum ? releventNum.post : ""}</span>
                            <em>动态</em>
                        </div>
                    ),
                    sub: "1",
                },
                {
                    title: (
                        <div className="mypage-tabs-rows">
                            <span>{releventNum ? releventNum.topic : ""}</span>
                            <em>话题</em>
                        </div>
                    ),
                    sub: "2",
                },
                {
                    title: (
                        <div className="mypage-tabs-rows">
                            <span>{releventNum ? releventNum.follow : ""}</span>
                            <em>关注</em>
                        </div>
                    ),
                    sub: "3",
                },
                {
                    title: (
                        <div className="mypage-tabs-rows">
                            <span>{releventNum ? releventNum.fans : ""}</span>
                            <em>粉丝</em>
                        </div>
                    ),
                    sub: "4",
                },
            ];
            return tabs;
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                time = state![`time${this.userID}`];
                const tabs = this.getTabs();
            return (
                <>
                    {time && (
                        <Tabs
                            tabs={tabs}
                            initialPage={0}
                            swipeable={false}
                            onChange={(e) => {
                                if (e.sub === "1") setEventWithLabel(statisticsEvent.myDynamicView);
                                else if (e.sub === "2") setEventWithLabel(statisticsEvent.myCircleView);
                                else if (e.sub === "3") setEventWithLabel(statisticsEvent.myFollowView);
                                else if (e.sub === "4") setEventWithLabel(statisticsEvent.myfansView);
                            }}
                        >
                            {this.renderEmbeddedView(CircleMyTrend.Page as any)}
                            {this.renderEmbeddedView(CircleMyTopic.Page as any)}
                            {this.renderEmbeddedView(CircleMyFollow.Page as any)}
                            {this.renderEmbeddedView(CircleMyFans.Page as any)}
                        </Tabs>
                    )}
                    {this.modalFooter()}
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.accountHome]);
}
