import React from "react";

import { isEqual } from "lodash";
import { PullToRefresh, List, InfiniteScroll, Loading, Empty } from "antd-mobile";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { Container } from "../components";

import { shake } from "../utils";

import { ViewComponent } from "./view";

export namespace ListComponent {
    export interface IProps<S = any> extends ViewComponent.IProps<S> {
        middle?: boolean;
        scroll?: any;
    }

    export interface IState extends ViewComponent.IState {
        items?: any[];
        hasMore?: boolean;
        down?: boolean;
        refreshing?: boolean;
        pageSize?: number;
        currentPage?: number;
        key?: string;
    }

    export abstract class Base<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        static defaultProps = {
            ...ViewComponent.Base.defaultProps,
            classPrefix: "list",
        } as any;

        listView;
        private _pullTimeout;
        private __state: any;

        protected middle = false;
        protected NoDataText = "暂无数据";
        protected loadingOptimize = false;
        protected listMode = "default";

        shouldUpdateData(state: any) {
            const { items } = state;
            if (!isEqual(state, this.__state)) {
                this.__state = state;
                this.setState({ items: items ? items : [] });
            }
        }

        renderBody(): React.ReactNode {
            return this.getListView();
        }

        /**
         * 默认骨架屏渲染
         */
        renderSkeleton(): React.ReactNode {
            return (
                <SkeletonTheme baseColor={"#efefef"} highlightColor={"#f7f7f7"}>
                    <Skeleton count={3} height={30} />
                </SkeletonTheme>
            );
        }

        getListView(_middle: boolean = false): React.ReactNode {
            const state = this.getPageData();
            const { items } = this.state || ({} as any);
            const onRefresh = this.pullToRefresh.bind(this);

            const statusRecord = this.renderPullToRefreshIndicator();
            const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }) => {
                return this.renderListFooter(hasMore);
            };

            if (!items) {
                // 骨架屏渲染
                return this.renderSkeleton();
            } else {
                return items.length ? (
                    <PullToRefresh
                        onRefresh={async () => {
                            onRefresh();
                        }}
                        renderText={(status) => {
                            return <div>{statusRecord[status]}</div>;
                        }}
                    >
                        <List mode={this.listMode as any}>
                            {items.map((item, key) => (
                                <>{this.renderItemsContent(item, key)}</>
                            ))}
                        </List>
                        <InfiniteScroll loadMore={this.onEndReached.bind(this)} hasMore={getResolveData(state, "hasMore")}>
                            <InfiniteScrollContent hasMore={getResolveData(state, "hasMore")} />
                        </InfiniteScroll>
                    </PullToRefresh>
                ) : (
                    <Container.Component range="center">
                        <Empty description={<div>暂无数据</div>} />
                    </Container.Component>
                );
            }
        }

        protected getPageData(): S {
            return this.props.state as any;
        }

        abstract renderItemsContent(data?: any, i?: number);

        /**
         * 下拉刷新
         * @param onRefresh 刷新回调
         */
        renderPullToRefresh(onRefresh?: () => void): React.ReactNode {
            this._pullTimeout && (clearTimeout(this._pullTimeout), (this._pullTimeout = null));

            return (
                <PullToRefresh
                    pullingText={this.renderPullToRefreshIndicator() as any}
                    headHeight={40}
                    threshold={50 as any}
                    onRefresh={async () =>
                        typeof onRefresh === "function" &&
                        (this.setState({ refreshing: !0 }),
                        onRefresh(),
                        (this._pullTimeout = setTimeout(() => ((this._pullTimeout = null), this.setState({ refreshing: !1 })))),
                        shake())
                    }
                />
            );
        }

        abstract pullToRefresh(...args);

        abstract onEndReached();

        /**
         * 列表顶部
         */
        renderPullToRefreshIndicator() {
            return {
                canRelease: iconSvg("松手刷新"),
                pulling: iconSvg("下拉刷新"),
                refreshing: iconSvg("刷新中...", "1"),
                complete: iconSvg("更新完成"),
            };
        }

        /**
         * 列表底部
         */
        renderListFooter(hasMore) {
            return (
                <>
                    {hasMore ? (
                        <>
                            <span>正在加载...</span>
                            <Loading />
                        </>
                    ) : (
                        <span>- 没有更多内容了 -</span>
                    )}
                </>
            );
        }
    }
}

export function getResolveData(state: any, object: any) {
    return state && state[`${object}`];
}

export function iconSvg(text, _animation?) {
    return (
        <svg
            width="40px"
            height="35px"
            style={{ marginTop: "-10px" }}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
        >
            <g transform="translate(0, -25)">
                <g transform="rotate(0 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(30 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(60 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(90 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(120 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(150 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(180 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(210 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(240 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(270 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(300 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite" />
                    </rect>
                </g>
                <g transform="rotate(330 50 50)">
                    <rect x="47.5" y="24" rx="4.75" ry="2.4" width="5" height="12" fill="#cccccc">
                        <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite" />
                    </rect>
                </g>
            </g>
            <text x="8" y="80" fontSize="20" fill="#333333">
                {text}
            </text>
        </svg>
    );
}
