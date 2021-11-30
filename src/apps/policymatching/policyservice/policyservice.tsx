import React from "react";
import moment from "moment";
import { Flex, Tabs, List, WhiteSpace, WingBlank, Button, Drawer, NavBar, SearchBar, DatePicker, Icon } from "antd-mobile-v2";

import { template, formatDateTime, getDate, formatDateTimeSend } from "@reco-m/core";

import { SuspendButton, setNavTitle } from "@reco-m/core-ui";

import { policyserviceModel, Namespaces, CashTypeValueEnum, PolicyTabIndex, getPolicyDeadline, PolicyDeclareModeEnum } from "@reco-m/policymatching-models";

import { WBFormViewComponent } from "@reco-m/ipark-common-page";

import { synchronousSerial } from "@reco-m/ipark-common";

import {goToCompatibleWxmini} from "@reco-m/h5home-models";

import { PolicyMatchService } from "./policyservice.match";

import { PolicyComputerService } from "./policyservice.computer";


export namespace PolicyService {
    export interface IProps<S extends IState = IState> extends WBFormViewComponent.IProps<S> {}

    export interface IState extends WBFormViewComponent.IState, policyserviceModel.StateType {
        tabsIndex?: any;
        sValue?: any;
        accordion?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends WBFormViewComponent.Component<P, S> {
        namespace = Namespaces.policyservice;
        showloading = false;
        headerContent = "政策服务";
        hasConfirm = false;
        hasModel = false;
        showAllCompany = false;
        showAllPerson = false;
        time;

        componentDidMount() {
            setNavTitle.call(this, this.headerContent);
            this.setState({
                tabsIndex: +this.getSearchParam("tabsIndex")
            });
            this.initData();

        }

        componentWillUnmount() {
            this.dispatch({ type: "init"});
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, this.headerContent, nextProps);
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && this.props.location!.pathname!.length > nextProps.location!.pathname!.length) {
                this.initData();
            }
        }
        initData() {
            this.dispatch({ type: `initPage` });
            this.pullToRefresh();
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
                // zhengclb = state!.zhengclb,
                zhengcjbSelect = state!.zhengcjbSelect || {},
                zhengclbSelect = state!.zhengclbSelect || [],
                deadlineDate = state!.deadlineDate,
                key = state!.key;

            let policyTypeValueList: any = [];
            zhengclbSelect.forEach((element) => {
                policyTypeValueList.push(element.tagValue);
            });

            this.dispatch({
                type: "getPolicy",
                pageIndex: pageIndex,
                param: {
                    key: key,
                    policyTypeValueList: policyTypeValueList,
                    policyRankValueList: zhengcjbSelect.tagValue ? [zhengcjbSelect.tagValue] : [],
                    declareEndTime: deadlineDate ? formatDateTimeSend(moment(deadlineDate).endOf("month").toDate()) : null,
                },
            });
        }

        renderHeader(headerContent?: any): React.ReactNode {
            const data = ["政策申报", "政策匹配", "政策计算器"];
            return (
                <>
                    {super.renderHeader(headerContent)}
                    <WingBlank>
                        <Flex className="padding-v tabs-card">
                            {data.map((item, i) => {
                                return (
                                    <Flex.Item key={i}>
                                        <div
                                            className={this.state.tabsIndex === i ? "tabs-tag active" : "tabs-tag"}
                                            onClick={() => {
                                                this.dispatch("input", { showComputerResult: false });
                                                this.setState({ tabsIndex: i });
                                                this.getCalculateTags(i);
                                                this.getMatchDatas(i);
                                            }}
                                        >
                                           <span> {item}</span>
                                        </div>
                                    </Flex.Item>
                                );
                            })}
                        </Flex>
                    </WingBlank>

                </>
            );
        }
        getCalculateTags(index) {
            if (index === PolicyTabIndex.count) {
                this.dispatch({ type: `getCalculateTags` });
            }
        }
        getMatchDatas(index) {
            if (index === PolicyTabIndex.match) {
                this.dispatch({ type: `getMatchDatas` });
            }
            if (index === PolicyTabIndex.count) {
                this.dispatch({ type: `getMatchDatas`, isCalculate: true});
            }
        }
        /*——————————————————————————————政策申报start——————————————————————————————*/

        renderSideBarBody() {
            const { state } = this.props,
                key = state!.key,
                deadlineDate = state!.deadlineDate,
                zhengclb = state!.zhengclb;
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
                        <List renderHeader={"按申报截止月"}>
                            <List.Item wrap>
                                <DatePicker
                                    mode="month"
                                    // minDate={new Date()}
                                    value={getDate(deadlineDate)!}
                                    onOk={(v) => {
                                        this.dispatch({ type: "input", data: { deadlineDate: v } });
                                    }}
                                >
                                    <div className="sidebar-tag">
                                        <div style={{ fontSize: "15px" }}>{deadlineDate ? formatDateTime(deadlineDate, "yyyy-MM") : "请选择截止月"}</div>
                                    </div>
                                </DatePicker>
                            </List.Item>
                        </List>
                        <List renderHeader={"政策类别"}>
                            {this.renderTags({
                                stateKey: "zhengclbSelect",
                                tagsData: zhengclb,
                                multiple: true,
                                tagLabelKey: "tagName",
                                tagValueKey: "tagValue",
                                maxSelectError: () => {
                                    console.log("最多选择两个!!");
                                },
                            })}
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
                                        this.dispatch({ type: "input", data: { key: "", zhengclbSelect: null, deadlineDate: null } });
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
        renderItemsContent(item: any): React.ReactNode {

            let { state } = this.props,
                { declareMode } = state as any;
            const keywords = item.keywords,
                keywordsArr = keywords && keywords.split(",");

            return (
                <List.Item
                  wrap
                    onClick={() => {
                        goToCompatibleWxmini(this, () => {
                            this.goTo(`policyservicedetails/${item.id}`);
                        })
                    }}
                >
                    <div className="omit omit-2 size-14 ">{item.implementationDetailTitle}</div>
                    <div className="omit omit-1 mt10">
                        <Flex align={"end"} className=" size-14">
                            <Flex.Item>
                                <span className="gray-three-color">扶持力度：</span>
                                {item.cashTypeValue === CashTypeValueEnum.amountSubsidy ? (
                                    <span className="highlight-color">最高{item.amountSubsidy}万元</span>
                                ) : (
                                    <span className="highlight-color">{item.qualificationIdentification}</span>
                                )}
                            </Flex.Item>
                            {declareMode !== PolicyDeclareModeEnum.none && getPolicyDeadline(item.declareStartTime, item.declareEndTime)}
                        </Flex>
                        {keywordsArr && (
                            <div className="omit omit-1 mt10">
                                <Flex align={"end"} className=" size-14">
                                    {keywordsArr.map((item, index) => {
                                        return (
                                            <div className="default-tag mr10" key={index}>
                                                {item}
                                            </div>
                                        );
                                    })}
                                </Flex>
                            </div>
                        )}
                    </div>
                </List.Item>
            );
        }
        renderPolicyDeclare() {
            const { state } = this.props,
                zhengcjb = state!.zhengcjb;
            let tabs =
                zhengcjb &&
                zhengcjb.map((item) => {
                    return { id: item && item.id, title: item && item.tagName, tagValue: item && item.tagValue };
                });
            return (
                <Tabs
                    tabs={tabs}
                    renderTabBar={(props) => <Tabs.DefaultTabBar {...props} page={4} />}
                    onChange={(tab) => {
                        this.dispatch("update", { zhengcjbSelect: tab });
                        synchronousSerial(() => {
                            this.pullToRefresh();
                        });
                    }}
                >
                    <List className="list-card not-card-border" style={{ height: "100%" }}>
                        <WhiteSpace className="dark" />
                        {this.getListView()}
                    </List>
                </Tabs>
            );
        }

        renderBody(): React.ReactNode {
            return this.state.tabsIndex === 0
                ? this.renderPolicyDeclare()
                : this.state.tabsIndex === 1
                ? this.renderEmbeddedView(PolicyMatchService.Page as any, {
                      initData: () => {
                          this.initData();
                      },
                      setTabsIndex: (index) => {
                          this.setState({ tabsIndex: index });
                      },
                  })
                : this.renderEmbeddedView(PolicyComputerService.Page as any, {
                      initData: () => {
                          this.initData();
                      },
                  });
        }

        render(): React.ReactNode {
            const sidebar = this.renderSideBar() as any;
            const formsidebar = this.renderFormSideBar() as any;
            const { state } = this.props,
                open = state!.open;

            if (this.state.tabsIndex === 0) {
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
                        <div className="container container-fill container-column body-transparency">
                            {this.renderHeader()}
                            <div className="container container-fill container-body container-scrollable body-transparency">{this.renderBody()}</div>
                            {this.renderFooter()}
                            {!client.showheader && <SuspendButton.Component>
                                <a
                                    className='suspend-button'
                                    onClick={() => this.dispatch({ type: "input", data: { open: true } })}
                                >
                                    <Icon type="search"/>
                                </a>
                            </SuspendButton.Component>}
                        </div>
                    </Drawer>
                );
            } else {
                return (
                    <Drawer
                        sidebar={formsidebar}
                        docked={false}
                        open={open}
                        onOpenChange={() => {
                            this.dispatch({ type: "update", data: { open: false } });
                        }}
                        position="right"
                    >
                        <div className="container container-fill container-column body-transparency">
                            {this.renderHeader()}
                            <div className="container container-fill container-body container-scrollable body-transparency">{this.renderBody()}</div>
                            {this.renderFooter()}
                        </div>
                    </Drawer>
                );
            }
        }
        renderHeaderRight(): React.ReactNode {
            return this.state.tabsIndex === 0 &&  <Icon type="search" onClick={() => this.dispatch({ type: "input", data: { open: true } })} />;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policyservice]);
}
