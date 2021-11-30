import React from "react";
import { List, Tag, WhiteSpace, SearchBar, Flex, Card, WingBlank } from "antd-mobile-v2";
import { template } from "@reco-m/core";
import { ListComponent, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { Namespaces, policymatchingsearchModel } from "@reco-m/policymatching-models";

export namespace PolicyMatchingSearch {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, policymatchingsearchModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "政策查询";
        namespace = Namespaces.policymatchingsearch;

        componentDidMount(): void {
            this.dispatch({ type: `initPage` });
        }

        componentWillUnmount(): void {
            this.dispatch({
                type: "input",
                data: {
                    key: "",
                    items: "",
                    showList: false,
                },
            });
            this.GetRecommandPolicyData(1, "");
        }

        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
        }

        onEndReached() {
            let { state } = this.props;
            this.GetRecommandPolicyData((state!.CurrentPage || 0) + 1, state!.key);
        }

        pullToRefresh() {
            let { state } = this.props;
            this.GetRecommandPolicyData(1, state!.key);
        }

        GetRecommandPolicyData(pageIndex: Number, key?: any) {
            this.dispatch({
                type: "getPolicy",
                pageIndex: pageIndex,
                // key: key,
                searchParamkey: key,
                callback: () => { },
            });
        }

        renderTag(data): React.ReactNode {
            const applyTags = data && data.applyTags;
            let policyRead = ((data && data.keyWords) || "").split(",");
            return (
                <>
                    {policyRead &&
                        policyRead.length > 0 &&
                        policyRead[0] !== "" &&
                        policyRead.map((item, k) => {
                            return (
                                <Tag small className="margin-right-xs tag-big" key={k}>
                                    {item}
                                </Tag>
                            );
                        })}
                    {applyTags &&
                        applyTags.map((item, t) => {

                            return (
                                t < 2 && (
                                    <Tag small className="margin-right-xs tag-big" key={t}>
                                        {item.tagName}
                                    </Tag>
                                )
                            );
                        })}
                </>
            );
        }
        renderItemsContent(data: any, i: number): React.ReactNode {
            return (
                <WingBlank size="md" key={"a"}>
                <Card
                    key={i}
                    onClick={() => {
                        this.goTo(`policydetail/${data.id}`);
                    }}
                >
                    <Card.Body>
                        <Flex align={"center"}>
                            <Flex.Item>
                                <div className="size-15 omit omit-2" style={{ lineHeight: "1.6", fontWeight: 400 }}>
                                    {data && data.title ? data.title : data.shortName}
                                </div>
                                <WhiteSpace size={"sm"} />
                                {this.renderTag(data)}
                            </Flex.Item>
                        </Flex>
                    </Card.Body>
                </Card>
                <WhiteSpace />
            </WingBlank>
            );
        }
        renderHistory(): React.ReactNode {
            let { state } = this.props;
            const searchHistory = state!.searchHistory;
            return (
                searchHistory &&
                searchHistory.map((item: any, i) => {
                    return (
                        i < 9 && (
                            <Tag className="tag-type2">
                                <div
                                    onClick={() => {
                                        this.dispatch({ type: "input", data: { key: item.key, showList: true } });
                                        this.GetRecommandPolicyData(1, item.key);
                                        this.dispatch({ type: "addSearchHistory", key: item.key });
                                    }}
                                >
                                    {item.key}
                                </div>
                            </Tag>
                        )
                    );
                })
            );
        }

        renderSearchBody(): React.ReactNode {
            let { state } = this.props;
            const showList = state!.showList;

            if (showList && showList) {
                return this.getListView();
            } else {
                return (
                    <List>
                        <List.Item wrap>
                            <Flex justify="between">
                                <span>历史搜索</span>
                                <i
                                    className="icon icon-lajitong"
                                    onClick={() => {
                                        this.dispatch({ type: "removeAll" });
                                    }}
                                />
                            </Flex>
                            <WhiteSpace />
                            <div className="tag-content">{this.renderHistory()}</div>
                            <WhiteSpace />
                        </List.Item>
                    </List>
                );
            }
        }

        renderBody(): React.ReactNode {
            let { state } = this.props;
            const key = state!.key;
            return (
                <div className="container-prop container-column container-fill">
                    <SearchBar
                        placeholder="请输入政策标题关键字查询"
                        maxLength={15}
                        value={key !== null ? key : ""}
                        onBlur={() => {
                            if (key !== "" && typeof key !== "undefined") {
                                this.dispatch({ type: "addSearchHistory", key });
                            }
                        }}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { key: value, showList: true } });
                            this.GetRecommandPolicyData(1, value);
                        }}
                        onSubmit={(value) => {
                            setEventWithLabel(statisticsEvent.parkPolicySearch);
                            this.dispatch({ type: "input", data: { key: value, showList: true } });
                            this.GetRecommandPolicyData(1, value);
                        }}
                        onCancel={() => {
                            this.dispatch({ type: "input", data: { key: "", showList: false } });
                            this.GetRecommandPolicyData(1, "");
                        }}
                    />
                    <WhiteSpace className="white-space" />
                    {this.renderSearchBody()}
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policymatchingsearch]);
}
