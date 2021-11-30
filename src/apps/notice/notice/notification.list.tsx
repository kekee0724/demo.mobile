import React from "react";

import { List, WingBlank, SwipeAction, Card, Modal, Toast } from "antd-mobile-v2";

import { template, friendlyTime } from '@reco-m/core';
import { HtmlContent, ListComponent, setEventWithLabel, callModal } from "@reco-m/core-ui";
import { Namespaces, notificationModel, getParam } from "@reco-m/notice-models";


import { statisticsEvent } from "@reco-m/ipark-statistics";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace NotificationList {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, notificationModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        headerContent = "";
        scrollable = false;
        bodyClass = "container-height";
        namespace = Namespaces.notification;

        title: any;
        type: any;


        componentDidMount() {
            const { type } = this.props.match!.params,
                { state } = this.props;
            const param = {
                pageSize: 15,
                sceneId: [type],
                key: state!.key || "",
                pageIndex: 1,
            };
            this.dispatch({ type: "initPageList", param });

            this.title = decodeURI(this.getSearchParam("title") as string);
            this.type = type;
            this.title === "服务通知"
                ? setEventWithLabel(statisticsEvent.serviceNotificationListBrowse)
                : this.title === "互动消息"
                    ? setEventWithLabel(statisticsEvent.interactiveMessageBrowse)
                    : this.title === "园区推送" && setEventWithLabel(statisticsEvent.parkPushMessageBrowse);
        }
        renderHeaderContent(): React.ReactNode {
            let title = this.getSearchParam("title") ? decodeURI(this.getSearchParam("title") as string) : "";
            return <span>{title}</span>;
        }
        componentWillUnmount(): void {
            this.dispatch({ type: "input", data: { key: "" } });
        }
        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.getData({ pageIndex: 1 });
                this.dispatch({ type: "getMember" });
            }
        }
        goWothParam(url) {
            if (url.indexOf("?") > -1) {
                this.goTo(`${url}&title=${this.title}&notificationType=${this.type}`);
            } else {
                this.goTo(`${url}?title=${this.title}&notificationType=${this.type}`);
            }
        }
        // 进入详情
        goDetail(data: any) {

            this.title === "服务通知"
                ? setEventWithLabel(statisticsEvent.serviceNoticeDetailView)
                : this.title === "互动消息"
                    ? setEventWithLabel(statisticsEvent.interactiveNewsDetailView)
                    : this.title === "园区推送" && setEventWithLabel(statisticsEvent.parkPushDetailView);

            this.dispatch({ type: "readNotificationAction", detailID: data.delivery.id });
            let tableName = data.message && data.message.bindTableName,
                tableId = data.message && data.message.bindTableId,
                externalurl = (data.message && data.message.externalUrl) || "";
            // // 问卷填写和填写详情、活动详情特殊处理
            if (tableName) {
                if (tableName.indexOf(IParkBindTableNameEnum.biserviceauditrecord) > -1) {
                    this.goWothParam(`marketInDetail`);
                } else if (tableName.indexOf(IParkBindTableNameEnum.stdinforeachobjectlog) > -1) {
                    let hash = location.hash.split("#/")[1].split("?")[0]
                    let param = externalurl.split("?")[1]

                    this.goTo(`msgreach?${param}&bindTableName=${externalurl.split("/")[1]}&bindTableId=${externalurl.split("/")[2]}&noticelist=${hash}`)
                } else if (tableName.indexOf(IParkBindTableNameEnum.certify) > -1) {
                    const { state } = this.props,
                        member = state!.member || {};
                    if (externalurl.indexOf(IParkBindTableNameEnum.memberAudit) > -1) {
                        this.goWothParam(`member/sliderCertify?id=${externalurl.split("?id=")[1]}`)
                    } else {
                        !member.id ? this.goWothParam("certify") : this.goWothParam(`certifyDetail/${tableId}`);
                    }
                } else if (tableName.indexOf(IParkBindTableNameEnum.stdfollow) > -1) {
                    this.goWothParam(`home/${externalurl.split("?userId=")[1]}`);
                } else if (tableName.indexOf(IParkBindTableNameEnum.post) > -1) {
                    this.goWothParam(`topic/${externalurl.split("?id=")[1]}`);
                } else if (tableName.indexOf(IParkBindTableNameEnum.comment) > -1) {
                    if (externalurl.indexOf(IParkBindTableNameEnum.post) > -1) {
                        this.goWothParam(`topic/${getParam(externalurl, "bindTableId")}`);
                    } else if (externalurl.indexOf(IParkBindTableNameEnum.article) > -1) {
                        this.goWothParam(`articleDetail/${getParam(externalurl, "bindTableId")}`);
                    } else if (externalurl.indexOf(IParkBindTableNameEnum.activity) > -1) {
                        this.goWothParam(`activityDetail/${getParam(externalurl, "bindTableId")}`);
                    }
                } else if (tableName.indexOf(IParkBindTableNameEnum.stdFlowState) > -1 || tableName.indexOf(IParkBindTableNameEnum.biWorkOrderLog) > -1) {
                    this.goWothParam(`workorder/slider/${externalurl.split("?id=")[1]}`);
                } else if (tableName.indexOf(IParkBindTableNameEnum.businessBill) > -1) {
                    this.goWothParam(`billdetails?id=${tableId}`);
                } else if (tableName.indexOf(IParkBindTableNameEnum.policyService) > -1) {
                    this.goTo(`policyservicedetails/${tableId}`);
                } else if (tableName.indexOf(IParkBindTableNameEnum.policy) > -1) {
                    this.goTo(`policyserviceoriginaldetails/${tableId}`);
                }
            } else if (externalurl) {
                if (externalurl && externalurl.indexOf("resource_order") > -1) {
                    this.goWothParam(`resource_order/order/${externalurl.split("?id=")[1]}`);
                } else {
                    this.goWothParam(data.message.externalUrl.replace(":", ""));
                }
            }

        }
        getData(data?: any) {
            const { type } = this.props.match!.params,
                { state } = this.props;

            this.dispatch({
                type: "getNotificationList",
                param: {
                    pageSize: 15,
                    sceneId: [type],
                    key: state!.key || "",
                    ...data
                },
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getData({ pageIndex: 1 });
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getData({ pageIndex: (state!.currentPage || 0) + 1 });
        }
        // 全部已读
        readAllNotif() {
            const { type } = this.props.match!.params;

            this.dispatch({ type: "readAllNotification", param: { sceneId: type } });

            this.title === "服务通知"
                ? setEventWithLabel(statisticsEvent.serviceNotifMessagesAllRead)
                : this.title === "互动消息"
                    ? setEventWithLabel(statisticsEvent.interactiveMessagesAllRead)
                    : this.title === "园区推送" && setEventWithLabel(statisticsEvent.parkPushMessagesSentAllRead);
        }
        // 删除通知消息
        showDeleteModal(item: any) {
            Modal.alert("确定删除？", "", [
                { text: "取消" },
                {
                    text: "确认",
                    onPress: () =>
                        this.dispatch({
                            type: "deleteNotification",
                            data: item.delivery.id,
                            callback: () => {
                                Toast.success("已删除", 1, () => {
                                    this.getData({ pageIndex: 1 });
                                });
                            },
                        }),
                },
            ]);
        }
        renderHeaderRight(): React.ReactNode {
            return (
                <span className="size-15" style={{ color: "#868686" }} onClick={() => callModal("确定要将全部消息标为已读吗？", this.readAllNotif.bind(this))}>
                    全部已读
                </span>
            );
        }

        renderItemsContent(item: any, i: any): React.ReactNode {
            const { message, content } = item;
            return <WingBlank>
            <List className="notice-list not-footer" renderHeader={friendlyTime(message.sendTime)} key={i}>
                <SwipeAction
                    style={{ backgroundColor: "gray" }}
                    autoClose
                    right={[
                        {
                            text: "取消",
                            onPress: () => console.log("cancel"),
                            style: { backgroundColor: "#ddd", color: "white", width: 60 },
                        },
                        {
                            text: "删除",
                            onPress: () => this.showDeleteModal(item),
                            style: { backgroundColor: "#F4333C", color: "white", width: 60 },
                        },
                    ]}
                    onOpen={() => console.log("global open")}
                    onClose={() => console.log("global close")}
                >
                    <Card onClick={() => this.goDetail(item)} className="notice-list">
                        <Card.Header
                            title={
                                <div className="size-16 omit omit-2" style={{ color: "#000", lineHeight: 1.4 }}>
                                    {" "}
                                    {!item.delivery.isRead ? <i className="icon icon-dian color-red"></i> : ""}
                                    {message.subject}
                                </div>
                            }
                        />
                        <Card.Body>
                            <HtmlContent.Component className="gray-three-color" html={content.summary}></HtmlContent.Component>
                        </Card.Body>
                    </Card>
                </SwipeAction>
            </List>
        </WingBlank>;
        }
        renderBody(): React.ReactNode {
            return this.getListView();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.notification]);
}
