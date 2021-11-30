import React from "react";

import { Icon, WhiteSpace, Tabs, Card, Flex, WingBlank, NoticeBar, Tag } from "antd-mobile-v2";

import { template, isAnonymous, getLocalStorage } from "@reco-m/core";
import { ListComponent, Container, setEventWithLabel, setNavTitle } from "@reco-m/core-ui";
import QueueAnim from "rc-queue-anim";

import { Namespaces, policymatchinglistModel, PolicyTabIndexEnum } from "@reco-m/policymatching-models";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { Circle } from "rc-progress";

export namespace PolicyList {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, policymatchinglistModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        bodyClass = "container-hidden policy-wite";
        headerContent = "政策";
        namespace = Namespaces.policymatchinglist;
        key;
        number;
        timeout;
        setInterval;
        view;
        hidden;
        scrollable = false;
        isGlobalSearch: boolean;
        tabindex;

        componentDidMount() {
            setEventWithLabel(statisticsEvent.parkPolicyListBrowse);
            setNavTitle.call(this, "政策");
            this.dispatch({ type: "input", data: { showMatch: true } });

            this.tabindex = this.getSearchParam("tabindex") ? this.getSearchParam("tabindex") : "0";

            this.key = this.getSearchParam("key") ? this.getSearchParam("key") : "";
            this.isGlobalSearch = true;
            this.number = this.getSearchParam("number") ? this.getSearchParam("number") : this.props.match!.params.number;
            this.dispatch({
                type: `initPage`,
                data: {
                    key: this.key,
                    isGlobalSearch: this.isGlobalSearch,
                    callback: () => {
                        this.dispatch({ type: "input", data: { showMatch: true } });
                    },
                    applyTagsCallback: (ApplyTags) => {
                        if (ApplyTags && this.tabindex) {
                            let tabs =
                                ApplyTags &&
                                ApplyTags.map((item) => {
                                    return { id: item && item.id, title: item && item.tagName, sub: item && item.id };
                                });
                            this.tabChange(tabs[+this.tabindex]);
                        }
                    },
                },
            });
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, "政策", nextProps);
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.pullToRefresh();
            }
        }

        GetRecommandPolicyData(pageIndex: Number, key?: any) {
            this.dispatch({
                type: "GetRecommandPolicyPaged",
                data: { parkId: getLocalStorage("parkId"), pageIndex: pageIndex, key: key },
                callback: () => {
                    this.dispatch({ type: "input", data: { showMatch: true } });
                },
            });
        }

        getPolicyData(pageIndex: any, key?: any) {
            this.dispatch({
                type: "getPolicy",
                pageIndex: pageIndex,
                key: key,
                searchParamkey: this.key,
            });
        }

        componentWillUnmount() {
            clearTimeout(this.timeout);
            clearTimeout(this.hidden);
            this.dispatch({ type: "input", data: { key: "" } });
        }

        renderHeaderRight() {
            return <Icon type="search" onClick={() => this.goTo(`matchsearch`)} />;
        }

        onEndReached() {
            let { state } = this.props;
            const key = state!.key as any;

            if ((key && key) || (this.key && this.key)) {
                if (key.sub === "0" && !this.isGlobalSearch) {
                    this.GetRecommandPolicyData((state!.CurrentPage || 0) + 1);
                } else {
                    this.getPolicyData((state!.CurrentPage || 0) + 1, key && key.id);
                }
            } else {
                this.GetRecommandPolicyData((state!.CurrentPage || 0) + 1);
            }
        }

        pullToRefresh() {
            let { state } = this.props;
            clearTimeout(this.hidden);
            const key = state!.key as any;

            if ((key && key) || (this.key && this.key)) {
                if (key && key.sub === "0" && !this.isGlobalSearch) {
                    this.GetRecommandPolicyData(1);
                } else {
                    this.getPolicyData(1, key && key.id);
                }
            } else {
                this.GetRecommandPolicyData(1);
            }
        }

        renderTag(data): React.ReactNode {
            const applyTags = data && data.applyTags;
            let { state } = this.props,
                tabiindex = state!.tabiindex;
            return (
                applyTags &&
                applyTags.map((item, t) => {
                    if (tabiindex === item.tagId) {
                        return (
                            <Tag small className="margin-right-xs tag-big" key={t}>
                                {item.tagName}
                            </Tag>
                        );
                    }
                    return (
                        t < 3 && (
                            <Tag small className="margin-right-xs tag-big" key={t}>
                                {item.tagName}
                            </Tag>
                        )
                    );
                })
            );
        }

        renderItemsContent(data: any, i: number): React.ReactNode {
            let { state } = this.props,
                tabiindex = state!.tabiindex;

            return (
                <WingBlank size="md" key={"a"}>
                    <Card
                        key={i}
                        onClick={() => {
                            this.goTo(`policydetail/${data.id}`);
                            clearTimeout(this.timeout);
                        }}
                    >
                        <Card.Body>
                            <Flex align={"center"}>
                                <Flex.Item>
                                    <div className="size-15 omit omit-2" style={{ lineHeight: "1.6", fontWeight: 400 }}>
                                        {data && data.title}
                                    </div>
                                    <WhiteSpace size={"sm"} />
                                    {this.renderTag(data)}
                                </Flex.Item>
                                {tabiindex === "0" && data.Match !== 0 && !this.isGlobalSearch && (
                                    <div className="circle-percent margin-right-0">
                                        <Circle
                                            percent={[data && data.Match, 100]}
                                            strokeWidth={6}
                                            strokeLinecap="round"
                                            strokeColor={[
                                                {
                                                    "0%": "#108ee9",
                                                    "100%": "#87d068",
                                                },
                                                "#f7f7f7",
                                            ]}
                                        />
                                        <div className="circle-percent-text">
                                            <div className={`color-${Math.floor(Math.random() * 10)} size-14`}>{data && data.Match}%</div>
                                            <div>匹配度</div>
                                        </div>
                                    </div>
                                )}
                            </Flex>
                        </Card.Body>
                    </Card>
                    <WhiteSpace />
                </WingBlank>
            );
        }

        renderRemind(num) {
            let { state } = this.props,
                showMatch = state!.showMatch,
                certify = state!.certify;

            const number = this.number ? this.number : 0;

            return (
                certify &&
                certify[0] &&
                certify[0].IsValid &&
                !this.isGlobalSearch &&
                showMatch && (
                    <QueueAnim>
                        <NoticeBar
                            key="a"
                            icon={null as any}
                            marqueeProps={{ loop: false }}
                            onClick={() => {
                                this.dispatch({ type: "input", data: { showMatch: false } });
                            }}
                        >
                            {this.number ? (
                                <div>
                                    根据您的<span className="s1">标签</span>推荐<span className="s2">{`${number}`}</span>条相关政策
                                    <a
                                        onClick={() => {
                                            isAnonymous() ? this.goTo("login") : this.goTo("matching");
                                            setEventWithLabel(statisticsEvent.policyMatchAgain);
                                        }}
                                    >
                                        匹配政策
                                    </a>
                                </div>
                            ) : (
                                <div>
                                    根据您的<span className="s1">标签</span>推荐<span className="s2">{`${num && num ? num : 0}`}</span>条相关政策
                                    <a
                                        onClick={() => {
                                            isAnonymous() ? this.goTo("login") : this.goTo("matching");
                                            setEventWithLabel(statisticsEvent.policyMatchAgain);
                                        }}
                                    >
                                        匹配政策
                                    </a>
                                </div>
                            )}
                        </NoticeBar>
                    </QueueAnim>
                )
            );
        }
        tabChange(tab) {
            // 解决相邻切换数据闪屏
            this.dispatch({ type: "input", data: { tabiindex: tab.sub, key: tab && tab } });
            if (tab && tab.sub === "0" && !this.isGlobalSearch) {
                setTimeout(() => {
                    this.GetRecommandPolicyData(1);
                }, 100);
            } else {
                setTimeout(() => {
                    this.getPolicyData(1, tab && tab.id);
                }, 100);
            }
        }
        renderBody(): React.ReactNode {
            let { state } = this.props;
            const ApplyTags = state!.ApplyTags,
                tabiindex = state!.tabiindex,
                num = state!.num,
                showList = state!.showList;

            let tabs =
                ApplyTags &&
                ApplyTags.map((item) => {
                    return { id: item && item.id, title: item && item.tagName, sub: item && item.id };
                });

            return (
                <div className="container-body apply-container">
                    <Tabs
                        swipeable={false}
                        tabs={tabs}
                        renderTabBar={(props) => (
                            <div className="policyListTab">
                                <Tabs.DefaultTabBar {...props} page={4} />
                            </div>
                        )}
                        onTabClick={(tab) => {
                            this.dispatch({ type: "input", data: { showList: false } });
                            this.tabChange(tab);
                        }}
                        initialPage={+this.tabindex}
                    >
                        <Container.Component direction={"column"} fill>
                            {tabiindex && +tabiindex === PolicyTabIndexEnum.policyMatch ? this.renderRemind(num && num) : ""}
                            <WhiteSpace className="whitespace-gray-bg" />
                            <div className="container-fill container-column apply-container">{showList ? this.getListView() : null}</div>
                        </Container.Component>
                    </Tabs>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policymatchinglist]);
}
