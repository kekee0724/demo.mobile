import React from "react";
import { NavBar, List, Flex, Card, SearchBar, Button, Tag, DatePicker, WingBlank, Drawer, Tabs, WhiteSpace } from "antd-mobile-v2";

import { template, formatDateTime, formatDate, getDate } from "@reco-m/core";
import { ListComponent, Container, androidExit } from "@reco-m/core-ui";

import { Namespaces, billModel, tabs, dateDifference, getStatusText, BusinessBillPaymentStatusEnum } from "@reco-m/busynessbill-models";

export namespace Bill {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        clickNum?: any;
    }

    export interface IState extends ListComponent.IState, billModel.StateType {
        isSideOpen?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.bill;
        headerContent = "企业账单";
        viewRef;

        componentDidMount() {
            this.dispatch({
                type: `initPage`,
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
            if (nextProps.location !== this.props.location) {
                this.getData();
            }
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        getData(data?: any) {
            const { state } = this.props;
            this.dispatch({
                type: "getData",
                params: {
                    pageIndex: 1,
                    paymentStatus: state?.status,
                    key: state!.searchKey,
                    subjectCode: state!.subjectCode,
                    chargingMonthBegin: formatDate(state!.startDay, "yyyyMM"),
                    chargingMonthEnd: formatDate(state!.endDay, "yyyyMM"),
                    ...data,
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

        reset() {
            this.dispatch("input", { searchKey: "", subjectCode: [], startDay: "", endDay: "" });
        }

        sureSearch() {
            this.setState({
                isSideOpen: false,
            });
            this.onOpenChange();
            this.getData();
        }

        onOpenChange = () => {
            const { state } = this.props,
                openChange = state!.open;
            this.dispatch({ type: "input", data: { open: !openChange } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { open: false } });
            androidExit(!openChange, callback);
        };

        renderHeaderRight(): React.ReactNode {
            return (
                <i
                    className="icon icon-sousuo"
                    onClick={() => {
                        this.setState({
                            isSideOpen: true,
                        });
                    }}
                ></i>
            );
        }

        /**
         * 时间改变时
         */
        onConfirm(date) {
            this.dispatch({ type: "input", data: { startDay: formatDate(date, "yyyy/MM/dd") } });
        }

        renderSliderHeader(): React.ReactNode {
            const { state } = this.props,
                key = state!.searchKey || "";
            return (
                <>
                    <NavBar>筛选</NavBar>
                    <SearchBar
                        placeholder="账单编号"
                        className="consultsearch"
                        value={key}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { searchKey: e } });
                        }}
                    />
                    <WhiteSpace />
                </>
            );
        }

        renderBillMonth(): React.ReactNode {
            const { state } = this.props,
                startDay = state!.startDay,
                endDay = state!.endDay;
            return (
                <List renderHeader={"账单月份"}>
                    <List.Item wrap>
                        <Flex>
                            <Flex.Item>
                                <DatePicker
                                    mode="month"
                                    title="开始时间"
                                    extra="Optional"
                                    value={getDate(startDay)}
                                    maxDate={getDate(endDay)}
                                    onOk={(v) => {
                                        this.dispatch({ type: "input", data: { startDay: formatDate(v, "yyyy/MM/dd") } });
                                    }}
                                >
                                    <div className="sidebar-tag">{startDay ? formatDate(startDay, "yyyyMM") : "不限"}</div>
                                </DatePicker>
                            </Flex.Item>
                            <Flex.Item>
                                <DatePicker
                                    mode="month"
                                    title="结束时间"
                                    extra="Optional"
                                    minDate={getDate(startDay)}
                                    value={getDate(endDay)}
                                    onOk={(v) => {
                                        this.dispatch({ type: "input", data: { endDay: formatDate(v, "yyyy/MM/dd") } });
                                    }}
                                >
                                    <div className="sidebar-tag">{endDay ? formatDate(endDay, "yyyyMM") : "不限"}</div>
                                </DatePicker>
                            </Flex.Item>
                        </Flex>
                    </List.Item>
                </List>
            );
        }
        onModelChange(item: any) {
            const { state } = this.props,
                selectedTags = JSON.parse(JSON.stringify(state!["subjectCode"] || []));
            if (this.isChecked(selectedTags, item["tagValue"])) {
                let filter = selectedTags.filter((x) => x !== item["tagValue"]);
                this.dispatch({ type: "input", data: { subjectCode: filter } });
            } else {
                selectedTags.push(item["tagValue"]);
                this.dispatch({ type: "input", data: { subjectCode: selectedTags } });
            }
        }
        /**
         * 侧边栏标签是否选择
         */
        isChecked = (arr, value) => {
            let filter = arr && arr.length > 0 && arr.find((x) => x === value);
            return filter;
        };
        renderBillProject(): React.ReactNode {
            const { state } = this.props,
                data = state!.bills,
                subjectCode = state!.subjectCode;
            return (
                <List renderHeader={"费用项目"}>
                    <List.Item wrap>
                        {data &&
                            data.map((item, i) => {
                                return (
                                    <Tag
                                        key={i}
                                        selected={this.isChecked(subjectCode, item.tagValue)}
                                        data-seed="logId"
                                        className="mr6 mb6"
                                        onChange={() => {
                                            this.onModelChange(item)
                                        }}
                                    >
                                        {item.tagName}
                                    </Tag>
                                );
                            })}
                    </List.Item>
                </List>
            );
        }

        renderSliderContent(): React.ReactNode {
            return (
                <Container.Component body scrollable>
                    {this.renderBillMonth()}
                    {this.renderBillProject()}
                </Container.Component>
            );
        }

        renderSliderFooter(): React.ReactNode {
            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.reset();
                            }}
                        >
                            重置
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button type="primary" onClick={this.sureSearch.bind(this)}>
                            确认
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        renderSlider() {
            return (
                <div className="drawer-detail">
                    <Container.Component direction="column" fill>
                        {this.renderSliderHeader()}
                        {this.renderSliderContent()}
                        {this.renderSliderFooter()}
                    </Container.Component>
                </div>
            );
        }

        renderItemsContent(item: any, i: any): React.ReactNode {
            let subjectName = "";
            ([...item.items] || []).map((item) => {
                subjectName = subjectName + item?.subjectName + "，";
            });
            const days = dateDifference(formatDateTime(item?.payDeadlineDate, "yyyy-MM-dd"), formatDate(new Date()), false);
            let chargingMonth = item?.chargingMonth + "";
            return (
                <WingBlank size={"md"}>
                    <Card onClick={() => this.goTo(`billdetails?id=${item?.id}`)} className="bill-card" key={i}>
                        <Card.Header
                            title={
                                <div className="title">
                                    <Flex>
                                        <Flex.Item style={{ fontSize: "14px" }}>
                                            <i className="icon icon-tag icon-radius" />
                                            {chargingMonth?.substr(0, 4)}年{chargingMonth?.substr(4, 6)}月账单
                                            <span className="size-12 gray-three-color" style={{ margin: "6px" }}>
                                                {item?.billNumber}
                                            </span>
                                        </Flex.Item>
                                        <span className="color-red" style={{ fontSize: "14px" }}>
                                            {getStatusText(item?.paymentStatus)}
                                        </span>
                                    </Flex>
                                </div>
                            }
                        />
                        <Card.Body>
                            {item?.roomFullNames && (
                                <>
                                    <div className="omit omit-1 gray-two-color">物业位置：{item?.roomFullNames || "-"}</div>
                                    <WhiteSpace />
                                </>
                            )}
                            <div className="omit omit-1 gray-two-color">费用项目：{subjectName?.substr(0, subjectName?.length - 1)}</div>
                            <WhiteSpace />
                            <div className="omit omit-1 gray-two-color">应收金额：¥{item?.actualAmount?.toFixed(2)}</div>
                            <WhiteSpace />
                            <div className="omit omit-1 gray-two-color">
                                付款截止：{formatDateTime(item?.payDeadlineDate, "yyyy-MM-dd")}
                                {days > 0 && item?.paymentStatus !== BusinessBillPaymentStatusEnum.PAID && (
                                    <span className="color-red" style={{ margin: "8px" }}>{`(已逾期${days}天)`}</span>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </WingBlank>
            );
        }

        renderTabs(): React.ReactNode {
            const { state } = this.props,
                showList = state!.showList,
                status = state!.status;
            return (
                <Tabs
                    swipeable={false}
                    tabs={tabs}
                    initialPage={parseInt(status, 10)}
                    onChange={(tab) => {
                        this.dispatch({ type: "input", data: { status: tab.status, showList: false } });
                        this.getData({ paymentStatus: tab.status });
                    }}
                >
                    {showList ? this.getListView() : null}
                </Tabs>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <Container.Component fill scrollable className="container-hidden">
                    <Container.Component className="container-body apply-container">{this.renderTabs()}</Container.Component>
                </Container.Component>
            );
        }

        render(): React.ReactNode {
            return (
                <Drawer
                    className="my-drawer"
                    sidebar={this.renderSlider()}
                    docked={false}
                    open={this.state.isSideOpen}
                    position="right"
                    onOpenChange={() =>
                        this.setState({
                            isSideOpen: false,
                        })
                    }
                >
                    <Container.Component key="l" fill direction="column">
                        {this.renderHeader()}
                        <div className="container container-fill container-body container-scrollable body-transparency">{this.renderBody()}</div>
                    </Container.Component>
                    {this.renderLoading()}
                </Drawer>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.bill]);
}
