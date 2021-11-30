import React from "react";

import { Card, Icon, List, NavBar, WingBlank } from "antd-mobile-v2";

import { friendlyTime, getLocalStorage, template } from "@reco-m/core";
import { ListComponent, setEventWithLabel } from "@reco-m/core-ui";

import { htmlContentTreatWord } from "@reco-m/ipark-common";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { Namespaces, noticeWhiteModel } from "@reco-m/notice-models";

export namespace NoticeList {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
    }

    export interface IState extends ListComponent.IState, noticeWhiteModel.StateType {
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.noticeWhite;
        key: any;
        headerContent = "通知公告";
        scrollable = false;
        bodyClass = "container-hidden"
        componentDidMount() {
            setEventWithLabel(statisticsEvent.noticeListBrowse);
            this.key = this.getSearchParam("key");
            this.dispatch({
                type: `initPage`,
                data: {
                    pageIndex: 1,
                    isPublish: true,
                    parkId: getLocalStorage("parkId"),
                    catalogueCode: "TZTG",
                    key: this.key && decodeURI(this.key)
                }
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        pullToRefresh() {
            this.getnoticeList(1);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            console.log("state", state);

            this.getnoticeList((state!.currentPage || 0) + 1);
        }

        getnoticeList(pageIndex: number) {
            this.key = this.getSearchParam("key");
            const data = {
                pageIndex: pageIndex,
                parkId: getLocalStorage("parkId"),
                catalogueCode: "TZTG",
                isPublish: true,
                key: this.key && decodeURI(this.key)
            };
            this.dispatch({ type: "getnoticeList", data });
        }

        /**
         * 增加阅读次数
         */
        addViewCounts(noticeId: number) {
            this.goDetail(noticeId);
        }

        goDetail(noticeId: number) {
            this.goTo(`articleDetail/${noticeId}?type=通告详情`);
        }

        renderItemsContent(data: any, _: any, i: number): React.ReactNode {
            return <WingBlank>
            <List className="notice-list" key={i} renderHeader={friendlyTime(data.PublishTime)}>
                <Card>
                    <Card.Header
                    className="notice-header"
                        title={
                            <div className="size-16 omit omit-2" style={{ color: "#05b8cd", lineHeight: "1.4" }} onClick={() => {
                                this.addViewCounts(data.id);
                            }}>
                                {data.title}
                            </div>
                        }
                    />
                    <Card.Body>
                        <div className="gray-three-color omit omit-3">{htmlContentTreatWord(data.content)}</div>
                    </Card.Body>
                    <Card.Footer
                        content={
                            <div
                                onClick={() => {
                                    this.addViewCounts(data.id);
                                }}
                            >
                                查看详情
        </div>
                        }
                    ></Card.Footer>
                </Card>
            </List>
        </WingBlank>;
        }

        renderHeader(): React.ReactNode {
            return <NavBar

                className="park-nav"
                icon={<Icon type="left" />}
                onLeftClick={() => this.goBack()}
            >
                通知公告
      </NavBar>
        }
        refScroll(el) {
            super.refScroll(el);
            $(el).find('.am-list-view-scrollview').off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents('.container-page').find('#nav_box_Shadow').length <= 0 && $(this).parents('.body').prevAll('.am-navbar').append('<span id="nav_box_Shadow"></span>')
            $(this).parents('.container-page').find('#nav_box_Shadow').css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`
            });
        }
        renderBody(): React.ReactNode {
            return this.getListView()
        }
    }

    export const Page = template(Component, state => state[Namespaces.noticeWhite]);
}
