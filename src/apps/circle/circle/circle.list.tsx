import React from "react";

import { Flex, List } from "antd-mobile-v2";

import { template, isAnonymous, getLocalStorage } from "@reco-m/core";
import { ListComponent, ImageAuto, Container, setEventWithLabel, callModal } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, circleListModel } from "@reco-m/ipark-white-circle-models";

import {debounce} from '@reco-m/ipark-common'
export namespace CircleList {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, circleListModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.circleList;
        headerContent = "全部话题";
        middle = true;
        key: any;
        debounceJoinCircle = debounce(this.joinCircle.bind(this), 2000);
        debounceOutCircle = debounce(this.outCircle.bind(this), 2000);
        componentDidMount() {
            setEventWithLabel(statisticsEvent.parkCircleList);
            this.key = this.getSearchParam("key");
            const data = {
                parkId: getLocalStorage("parkId"),
                pageIndex: 1,
                pageSize: 10,
                isValid: true,
                key: this.key && decodeURI(this.key),
            };
            this.dispatch({ type: "initPage", data: { datas: data } });
        }
        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state);
            if (nextProps.location!.pathname !== this.props.location!.pathname) {
                this.getDatas();
            }
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
                pageSize: 10,
                isValid: true,
                key: this.key && decodeURI(this.key),
            };
            this.dispatch({
                type: "getCircleData",
                data,
            });
        }
        getDatas() {
            const { state } = this.props,
                pageIndex = state!.pageIndex;
            const data = {
                parkId: getLocalStorage("parkId"),
                pageIndex: 1,
                pageSize: 10 * pageIndex,
                isValid: true,
                key: this.key && decodeURI(this.key),
            };
            this.dispatch({
                type: "getCircleDataTwo",
                data,
            });
        }
        outCircle(id) {
            this.dispatch({
                type: "outCircle",
                id: id,
                callback: () => {
                    setEventWithLabel(statisticsEvent.parkCancelPartakeCircle);
                    this.getDatas();
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
                    this.getDatas();
                },
            });
        }
        renderItemExtra(item): React.ReactNode {
            return (
                <>
                    <div className="ent-logo-box ml40">
                        <span className="circle-type">{item.CircleType}</span>
                        <ImageAuto.Component
                            cutWidth="78"
                            cutHeight="78"
                            src={item.pictureUrlList && item.pictureUrlList[0] ? item.pictureUrlList[0] : ""}
                            width="100%"
                            height="100%"
                        ></ImageAuto.Component>
                    </div>
                    {item.isSubscribe ? (
                        <div
                            className="tag type2 mt10 ml40 mr10 text-center"
                            onClick={(e) => {
                                isAnonymous()
                                    ? this.goTo("login")
                                    : callModal("确认要取消参与吗?", () => {
                                          this.debounceOutCircle(item && item.id); // this.outCircle(item && item.id);
                                      });
                                e.stopPropagation();
                            }}
                        >
                            已参与
                        </div>
                    ) : (
                        <div
                            className="tag type1 mt10 mr10"
                            onClick={(e) => {
                                isAnonymous() ? this.goTo("login") : this.debounceJoinCircle(item && item.id); // this.joinCircle(item && item.id);
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
                    <div className="size-17 omit omit-1">{item.topicName}</div>
                    <div className="mt8" style={{ minHeight: "59px" }}>
                        <div className="omit omit-2 size-13 gray-two-color ">{item.summary}</div>
                    </div>
                    <Flex className="size-14">
                        {item.isTop ? <span className="mr20 color-failure">置顶</span> : ""}
                        <>
                            <span className="mr5">成员</span>
                            <span className="primary-color mr15">{item.memberCount ? item.memberCount : 0}</span>
                        </>
                        <>
                            <span className="mr5">动态</span>
                            <span className="primary-color">{item.postCount ? item.postCount : 0}</span>
                        </>{" "}
                    </Flex>
                </List.Item>
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
            return <Container.Component body>{this.getListView()}</Container.Component>;
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.circleList]);
}
