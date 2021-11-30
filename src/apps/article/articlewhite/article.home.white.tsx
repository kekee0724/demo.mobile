import React from "react";

import { List, Flex } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";

import { ViewComponent, ImageAuto, setEventWithLabel, NoData } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import Skeleton from "react-loading-skeleton";

import { articleModel, Namespaces } from "@reco-m/article-models";
export namespace ArticleHomeWhite {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        scroll?: any;
        hideHeader?: any;
    }

    export interface IState extends ViewComponent.IState, articleModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.article;
        showheader = false;
        scrollTop = -1;
        middle = true;
        key: any;

        componentDidMount() {
            this.key = this.getSearchParam("key");
            this.dispatch({
                type: `initPage`,
                data: {
                    pageIndex: 1,
                    key: this.key,
                    parkId: getLocalStorage("parkId"),
                    catalogueCode: "DTZX",
                },
            });
            setEventWithLabel(statisticsEvent.parkHeadlineListBrowse);
        }
        /** 骨架屏 */
        renderSkeletons(count): React.ReactNode {
            let items: any = [];
            for (let i = 0; i < count; i++) {
                items.push(1);
            }
            return items.map((_, i) => (
                <div className="rows" key={i}>
                    <Skeleton height={90} />
                    <div className="title">
                        <Skeleton count={1} height={20} />
                    </div>
                </div>
            ));
        }
        renderArticleSrollImage(articleListhome): React.ReactNode {
            return articleListhome && articleListhome.length ? (
                articleListhome.map((item, i) => {
                    return (
                        <div className="rows" onClick={() => this.goTo(`articleDetail/${item.id}`)} key={i}>
                            <ImageAuto.Component
                                cutWidth="155"
                                cutHeight="87"
                                width="155px"
                                height="87px"
                                radius="6px"
                                src={item && item.coverUrl ? item.coverUrl : item.pictureUrlList && item.pictureUrlList[0] ? item.pictureUrlList[0] : ""}
                            />
                            <div className="title">{item && item.title}</div>
                        </div>
                    );
                })
            ) : (
                <NoData.Component></NoData.Component>
            );
        }
        renderArticleSroll(articleListhome): React.ReactNode {
            return articleListhome ? (
                <div className="view-scroll">{this.renderArticleSrollImage(articleListhome)}</div>
            ) : (
                <div className="view-scroll">{this.renderSkeletons(5)}</div>
            );
        }
        render(): React.ReactNode {
            const { state } = this.props,
                articleListhome = state!.articleListhome;
            return (
                <List
                    className="hot-active"
                    renderHeader={
                        <Flex>
                            <span className="tit">微头条</span>
                            <Flex.Item></Flex.Item>
                            <span className="morelink" onClick={() => this.goTo("/discover/2")}>
                                更多
                            </span>
                        </Flex>
                    }
                >
                    {this.renderArticleSroll(articleListhome)}
                </List>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.article]);
}
