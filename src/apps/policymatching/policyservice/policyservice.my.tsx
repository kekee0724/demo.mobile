import React from "react";

import { Flex, Tabs, List, WhiteSpace, Button, Drawer, NavBar, SearchBar, DatePicker } from "antd-mobile-v2";

import { template, formatDateTime, getDate } from "@reco-m/core";
import { SuspendButton, setNavTitle } from "@reco-m/core-ui";

import { policyserviceMyModel, Namespaces, mytabs, mysimtabs, PolicyDeclareModeEnum, getStatusText } from "@reco-m/policymatching-models";

import { WBFormViewComponent } from "@reco-m/ipark-common-page";

import { synchronousSerial } from "@reco-m/ipark-common";

export namespace PolicyServiceMy {
    export interface IProps<S extends IState = IState> extends WBFormViewComponent.IProps<S> {}

    export interface IState extends WBFormViewComponent.IState, policyserviceMyModel.StateType {
        tabsIndex?: any;
        sValue?: any;
        accordion?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends WBFormViewComponent.Component<P, S> {
        namespace = Namespaces.policyserviceMy;
        showloading = true;
        headerContent = "政策申报";
        hasConfirm = false;
        hasModel = false;
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, this.headerContent, nextProps);
            this.shouldUpdateData(nextProps.state);
        }
        componentDidMount() {
            setNavTitle.call(this, this.headerContent);
            this.initData();
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        initData() {
            this.dispatch({
                type: "initPage",
                callBack: () => {
                    synchronousSerial(() => {
                        this.pullToRefresh();
                    }, 200);
                },
            });
        }
        onEndReached() {
            let { state } = this.props;
            this.getPolicyData((state!.currentPage || 0) + 1);
        }

        pullToRefresh() {
            this.getPolicyData(1);
        }
        getPolicyData(pageIndex: any) {
            let { state } = this.props,
                { tabItem, key, year } = state as any;
            this.dispatch({
                type: "getDatas",
                param: {
                    pageIndex,
                    pageSize: 15,
                    stateTagValue: tabItem.stateTagValue,
                    exceptStateTagValues: -5,
                    orderBy: "id desc",
                    key,
                    year: formatDateTime(year, "yyyy"),
                },
            });
        }
        getStateClass(item) {
            if (item.stateTagName === "已退回") {
                return "error-color";
            } else {
                return "primary-color";
            }
        }
        renderItemsContent(item: any): React.ReactNode {
            let { state } = this.props,
                { declareMode } = state as any;
            return declareMode === PolicyDeclareModeEnum.complex ? (
                <List.Item>
                    <div className="omit omit-1 size-16">{item.projectName}</div>
                    <div className="omit omit-1 mt10 size-14">
                        <div>
                            <span className="gray-three-color">当前状态：</span>
                            <span className={this.getStateClass(item)}>{item.stateTagName}</span>
                        </div>
                    </div>
                    <div className="omit omit-1 mt10 size-14">
                        <div>
                            <span className="gray-three-color">申报时间：</span>
                            <span>{formatDateTime(item.updateTime)}</span>
                        </div>
                    </div>
                </List.Item>
            ) : (
                <List.Item>
                    <div className="omit omit-1 size-16">{item.policyImplementationDetailTitle}</div>
                    <div className="omit omit-1 mt10 size-14">
                        <div>
                            <span className="gray-three-color">当前状态：</span>
                            <span className={this.getStateClass(getStatusText(item.status))}>{getStatusText(item.status)}</span>
                        </div>
                    </div>
                    <div className="omit omit-1 mt10 size-14">
                        <div>
                            <span className="gray-three-color">申报时间：</span>
                            <span>{formatDateTime(item.inputTime)}</span>
                        </div>
                    </div>
                </List.Item>
            );
        }
        renderBody(): React.ReactNode {
            let { state } = this.props,
                { showList, declareMode } = state as any;

            let tabs = [] as any;
            if (declareMode === PolicyDeclareModeEnum.complex) {
                tabs = mytabs;
            } else {
                tabs = mysimtabs;
            }
            return (
                <Tabs
                    tabs={tabs}
                    swipeable={false}
                    initialPage={parseInt(this.props.match!.params.index, 10)}
                    onTabClick={(tab) => {
                        this.dispatch("input", { tabItem: tab, showList: false });
                        synchronousSerial(() => {
                            this.getPolicyData(1);
                        });
                    }}
                >
                    {showList ? (
                        <>
                            <WhiteSpace />
                            <List.Item wrap>
                                <Flex>
                                    <i className="icon icon-zhishichanquan highlight-color" />
                                    <Flex.Item>
                                        <div className="omit omit-2 size-12 highlight-color">仅展示当前申报状态,在线申报或详情查看请至web端</div>
                                    </Flex.Item>
                                </Flex>
                            </List.Item>
                            <WhiteSpace />
                            {this.getListView()}
                        </>
                    ) : null}
                </Tabs>
            );
        }
        renderSideBarBody() {
            const { state } = this.props,
                key = state!.key,
                year = state!.year;
            return (
                <>
                    <NavBar className="park-nav">筛选</NavBar>
                    <SearchBar
                        placeholder="搜索"
                        value={key || ""}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { key: value } });
                        }}
                    />
                    <WhiteSpace />
                    <div className="container-fill container-scrollable">
                        <List renderHeader={"申报年份"}>
                            <List.Item wrap>
                                <DatePicker
                                    mode="year"
                                    value={getDate(year)!}
                                    onOk={(v) => {
                                        this.dispatch({ type: "input", data: { year: v } });
                                    }}
                                >
                                    <div className="sidebar-tag">
                                        <div style={{ fontSize: "15px" }}>{year ? formatDateTime(year, "yyyy") : "申报年份"}</div>
                                    </div>
                                </DatePicker>
                            </List.Item>
                        </List>
                    </div>
                </>
            );
        }
        renderSideBar(): React.ReactNode {
            return (
                <div className="drawer-detail">
                    <div className="container-column container-fill">
                        {this.renderSideBarBody()}
                        <Flex className="flex-collapse row-collapse">
                            <Flex.Item>
                                <Button
                                    onClick={() => {
                                        this.dispatch({ type: "input", data: { key: "", zhengclbSelect: null, deadlineDate: null, year: null } });
                                    }}
                                >
                                    重置
                                </Button>
                            </Flex.Item>
                            <Flex.Item>
                                <Button
                                    type={"primary"}
                                    onClick={() => {
                                        this.dispatch({ type: "input", data: { open: false } });
                                        this.pullToRefresh();
                                    }}
                                >
                                    确定
                                </Button>
                            </Flex.Item>
                        </Flex>
                    </div>
                </div>
            );
        }
        renderHeaderRight(): React.ReactNode {
            return client!.showheader && <i className="icon icon-sousuo" onClick={() => this.dispatch({ type: "input", data: { open: true } })} />;
        }
        render(): React.ReactNode {
            const sidebar = this.renderSideBar() as any;
            const { state } = this.props,
                open = state!.open;
            return (
                <Drawer
                    sidebar={sidebar}
                    docked={false}
                    open={open}
                    onOpenChange={() => {
                        this.dispatch({ type: "update", data: { open: false } });
                    }}
                    position="right"
                >
                    <div className="container container-fill container-column">
                        {this.renderHeader()}
                        <div className="container container-fill container-body container-scrollable body-transparency">{this.renderBody()}</div>
                    </div>
                    {this.renderLoading()}
                    {!client.showheader && (
                        <SuspendButton.Component>
                            <a className="suspend-button" onClick={() => this.dispatch({ type: "input", data: { open: true } })}>
                                <i className="icon icon-sousuo" />
                            </a>
                        </SuspendButton.Component>
                    )}
                </Drawer>
            );
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.policyserviceMy]);
}
