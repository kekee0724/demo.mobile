import React from "react";

import { List, WhiteSpace, Flex, Button, Modal, Toast } from "antd-mobile-v2";

import { template, formatDateTime, getLocalStorage } from "@reco-m/core";

import { ListComponent, ImageAuto, setEventWithLabel, popstateHandler, Container } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, ActivityTypeEnum, ReviewTypeEnum, SignTypeEnum, ActivityModeEnum, myActivityModel } from "@reco-m/activity-models";

import { renderBadge, renderBadgetext } from "./common";
export namespace MyActivity {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, myActivityModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "我的活动";
        bodyClass = "container-height";
        status = null;
        namespace = Namespaces.myActivity;

        componentMount() {
            const data = {
                pageIndex: 1,
                isMyActivity: true,
                isValid: true,
                parkId: getLocalStorage("parkId"),
            };
            this.dispatch({ type: `initPage`, data });

            setEventWithLabel(statisticsEvent.myActivitiesBrowse);
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
        }

        getData(data?: any) {
            const { state } = this.props,
                status = state!.tabStatus;
            this.dispatch({
                type: "getMyActivity",
                data: {
                    pageIndex: 1,
                    isMyActivity: true,
                    isValid: true,
                    parkId: getLocalStorage("parkId"),
                    status,
                    ...data,
                },
            });
        }
        /**
         * 取消报名
         */
        unResignActivity(data: any) {
            let modal = Modal.alert("操作提示", "确认取消报名？", [
                {
                    text: "取消",
                    onPress: () => {
                        popstateHandler.removePopstateListener();
                    },
                },
                {
                    text: "确认",
                    onPress: () => {
                        popstateHandler.removePopstateListener();
                        this.dispatch({
                            type: "unRigistActivity",
                            params: { activityID: data.id },
                            callback: () => {
                                Toast.success("已取消报名", 2, () => {
                                    this.getData();
                                });

                                setEventWithLabel(statisticsEvent.cancelEventRegistration);
                            },
                        });
                    },
                },
            ]);
            popstateHandler.popstateListener(() => {
                modal.close();
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getData();
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getData({
                pageIndex: (state!.CurrentPage || 0) + 1,
            });
        }

        // 图片显示
        renderImageItem(data: any): React.ReactNode {
            const url = data.coverPictureUrl ? data.coverPictureUrl : data.pictureUrlList && data.pictureUrlList.length ? data.pictureUrlList[0] : "";
            return (
                <div onClick={() => this.goTo(`myActivityDetail/${data.id}/1`)}>
                    <ImageAuto.Component cutWidth="384" cutHeight="233" src={url}>
                        {renderBadge(data)}
                    </ImageAuto.Component>
                </div>
            );
        }
        renderApplyState(data): React.ReactNode {
            if (data.applyExamineStatus === ReviewTypeEnum.reviewNotPass) {
                return "报名审核退回";
            } else if (data.applyExamineStatus === ReviewTypeEnum.toBeReview) {
                return "报名待审核";
            } else {
                return "已报名";
            }
        }
        renderFooterTag(data) {
            let activityTagArr = data.activityTag ? data.activityTag.split(",") : [];
            return (
                activityTagArr &&
                activityTagArr.map((item, i) => {
                    return (
                        <span className="size-12 mr5" key={i} style={{ color: "#02b8cd" }}>
                            #{item}
                        </span>
                    );
                })
            );
        }
        // renderFooterContent(data: any): React.ReactNode {
        //     return (
        //         <Flex.Item onClickdiv={() => this.goTo(`myActivityDetail/${data.id}/1`)} className="margin-right-sm">
        //             <div className="mt5 omit omit-1">
        //                 <span className="size-12 mr5" style={{ color: "#02b8cd" }}>
        //                     #{data.activityType}
        //                 </span>
        //                 {this.renderFooterTag(data)}
        //             </div>
        //             <div className="size-12 color-minor omit omit-1">
        //                 <span>
        //                     <i className="icon icon-yonghu size-12" />
        //                     &nbsp;
        //                     <span className="color-qs">
        //                         已报名{data && data.applyNumber}人
        //                         {data.applyMaxNumber !== 0 && (
        //                             <span>
        //                                 &nbsp;/&nbsp;限额
        //                                 <span>&nbsp;{data.applyMaxNumber}&nbsp;</span>人
        //                             </span>
        //                         )}
        //                     </span>
        //                 </span>
        //             </div>
        //             <div className="size-12 color-minor omit omit-1">
        //                 <span>
        //                     <i className="icon icon-newtime size-12" />
        //                     &nbsp;
        //                     <span className="color-qs">
        //                         {formatDateTime(data.startTime, "yyyy-MM-dd hh:mm")} ~ {formatDateTime(data.endTime, "yyyy-MM-dd hh:mm")}
        //                     </span>
        //                 </span>
        //             </div>
        //             {data.activityModeValue === ActivityModeEnum.offline && (
        //                 <div className="size-12 color-minor omit omit-1">
        //                     <i className="icon icon-newadds size-12" />
        //                     &nbsp;{data.activityAddress}
        //                 </div>
        //             )}
        //             {data.examineExplain && data.applyExamineStatus === ReviewTypeEnum.reviewNotPass && (
        //                 <div className="size-12 omit omit-1" style={{ color: "red" }}>
        //                     <i className="icon icon-point size-12" />
        //                     &nbsp;{data.examineExplain}
        //                 </div>
        //             )}
        //         </Flex.Item>
        //     );
        // }

        renderCancelButton(data): React.ReactNode {
            return data.status === ActivityTypeEnum.signUp ? (
                <div className="my-apply-btn">
                    <Button
                        type="primary"
                        size="small"
                        inline
                        onClick={(e) => {
                            this.unResignActivity(data);
                            e.stopPropagation();
                        }}
                    >
                        取消报名
                    </Button>
                </div>
            ) : null;
        }
        renderSignButton(data): React.ReactNode {
            return data.status === ActivityTypeEnum.onGoing && data.applyExamineStatus === ReviewTypeEnum.reviewPass ? (
                data.signInStatus === SignTypeEnum.waitSignIn ? (
                    <div className="my-apply-btn">
                        <Button
                            type="primary"
                            size="small"
                            inline
                            onClick={() => {
                                this.dispatch({
                                    type: "activitySignIn",
                                    activityID: data.id,
                                    callback: () => {
                                        this.getData({});
                                    },
                                });
                            }}
                        >
                            去签到
                        </Button>
                    </div>
                ) : (
                    <div className="my-apply-btn">
                        <Button size="small" inline onClick={() => {}}>
                            已签到
                        </Button>
                    </div>
                )
            ) : null;
        }

        // 列表底部文字显示
        renderItemFooter(data: any): React.ReactNode {
            return (
                <>
                    {this.renderCancelButton(data)}
                    {this.renderSignButton(data)}
                </>
            );
        }

        // renderItemsContent(item: any, i: number): React.ReactNode {
        //     return (
        //         <>
        //             <WhiteSpace className="back" />
        //             <List key={i} className="activity-list">
        //                 <List.Item wrap>
        //                     {this.renderImageItem(item)}
        //                     {this.renderItemFooter(item)}
        //                 </List.Item>
        //             </List>
        //         </>
        //     );
        // }

        renderItemTag(item) {
            let activityTagArr = item.activityTag ? item.activityTag.split(",") : [];
            return (
                activityTagArr &&
                activityTagArr.map((item, index) => {
                    return (
                        <span key={index} className="size-12 mr5" style={{ color: "#02b8cd" }}>
                            #{item}
                        </span>
                    );
                })
            );
        }

        /**
         * 渲染每一条新闻内容
         */
        renderItemsContent(item: any, i: number): React.ReactNode {
            const url = item.coverPictureUrl ? item.coverPictureUrl : item.pictureUrlList && item.pictureUrlList.length ? item.pictureUrlList[0] : "";

            return (
                <div className="hot-active">
                    <List.Item
                        wrap
                        key={i}
                        onClick={() => {
                            this.goTo(`myActivityDetail/${item.id}/1`);
                        }}
                    >
                        <WhiteSpace />
                        <div className="img">
                            <ImageAuto.Component cutWidth="384" cutHeight="233" src={url} />
                            {renderBadgetext(item)}
                        </div>
                        <div className="omit omit-1 size-17 mt14">{item.activityName}</div>
                        <div className="omit omit-1 mt5">
                            <span className="primary-color size-12 mr5">#{item.activityType}</span>
                            {this.renderItemTag(item)}
                        </div>
                        <Flex className="mt5">
                            <Flex.Item>
                                <div className="gray-three-color size-12">
                                    <i className="icon size-13 mr5 gray-four-color icon-newtime" />
                                    {formatDateTime(item.startTime, "yyyy-MM-dd hh:mm")} ~ {formatDateTime(item.endTime, "yyyy-MM-dd hh:mm")}
                                </div>
                            </Flex.Item>
                            <div className="gray-three-color size-12">
                                <i className="icon size-13 mr5 gray-four-color icon-newren1" />
                                <span className="color-3">{item.applyNumber ? item.applyNumber : 0}</span>人报名
                            </div>
                        </Flex>
                        {item.activityModeValue === ActivityModeEnum.offline && (
                            <div className="gray-three-color size-12 mt3 omit omit-1">
                                <i className="icon size-13 mr5 gray-four-color icon-newadds" />
                                {item.activityAddress}
                            </div>
                        )}
                        {item.examineExplain && item.applyExamineStatus === ReviewTypeEnum.reviewNotPass && (
                            <div className="error-color size-12 mt3 omit omit-1">
                                退回原因: {item.examineExplain}
                            </div>
                        )}
                        <WhiteSpace size={"sm"} />
                        {this.renderItemFooter(item)}
                    </List.Item>
                </div>
            );
        }

        refScroll(el) {
            super.refScroll(el);
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents(".container-page").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $(this)
                .parents(".container-page")
                .find("#nav_box_Shadow")
                .css({
                    background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                        top * 0.001 < 0.1 ? top * 0.001 : 0.1
                    }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                });
        }

        renderBody(): React.ReactNode {
            // const { state } = this.props,
            // showList = state!.showList || true;
            // return (
            // <div className="container-body apply-container">
            //   <Tabs
            //     tabs={tabs}
            //     swipeable={false}
            //     initialPage={parseInt(this.props.match!.params.index, 10)}
            //     onTabClick={(tab) => {
            //       console.log(tab)
            //       // 解决切换数据闪屏
            //       this.dispatch({ type: "input", data: { showList: false } });
            //       // 解决切换数据闪屏
            //       setTimeout(() => {
            //         this.dispatch({ type: "input", data: { tabStatus: tab.status } });
            //         this.getData({ status: tab.status });
            //       }, 100);
            //       // myOrderTabsStatistics(tab.status);
            //     }}
            //   >
            //     {(showList ? this.getListView() : null)}
            //   </Tabs>
            // </div>
            // )
            return <Container.Component body>{this.getListView()}</Container.Component>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myActivity]);
}
