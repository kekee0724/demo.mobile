import React from "react";

import { Button, Drawer, Flex, List, Icon, NavBar, SearchBar, WhiteSpace, Tag, WingBlank, Tabs, Calendar, DatePicker } from "antd-mobile-v2";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { template, formatDate, formatDateTime, getDate, getLocalStorage } from "@reco-m/core";

import { Container, ListComponent, ImageAuto } from "@reco-m/core-ui";

import { roomModel, Namespaces, getPriceUnit, MeetingStatusEnum, getResourceTitle } from "@reco-m/order-models";

export namespace Room {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, roomModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        bodyClass = "oldForm";
        namespace = Namespaces.room;
        key: any;

        componentDidMount() {
            this.key = this.getSearchParam("key");
            let params = this.getDataListParams(1);

            this.dispatch({ type: "initPage", datas: params });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && this.props.location!.pathname!.length > nextProps.location!.pathname!.length) {
                this.pullToRefresh();
            }
        }

        componentWillUnmount() {
            this.dispatch({
                type: "init",
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getDataList(1);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            let { state } = this.props;
            this.getDataList((state!.currentPage || 0) + 1);
        }

        getDataListParams(pageIndex: number, start?: any, end?: any) {
            let params = {
                resourceType: this.props.match!.params.resourceType,
                pageIndex,
                start,
                end,
            };
            return params;
        }

        getDataList(pageIndex: number, start?: any, end?: any) {
            let params = this.getDataListParams(pageIndex, start, end);
            this.dispatch({ type: "getResourceAction", datas: params });
        }

        getTabs() {
            const { state } = this.props,
                startDay = state!.startDay,
                startTime = state!.startTime,
                isSelectDate = state!.isSelectDate;
            return [
                { title: "今天", value: { startDay: formatDate(new Date()), endDay: formatDate(new Date()) } },
                {
                    title: "明天",
                    value: {
                        startDay: formatDate(new Date(new Date(new Date().format("yyyy/MM/dd")).getTime() + 24 * 60 * 60 * 1000)),
                        endDay: formatDate(new Date(new Date(new Date().format("yyyy/MM/dd")).getTime() + 24 * 60 * 60 * 1000)),
                    },
                },
                { title: isSelectDate ? formatDate(getDate(startDay + startTime)!, "MM月dd日") : "选择日期", value: null },
            ];
        }

        renderHeader(): React.ReactNode {
            const { state } = this.props,
                startDay = state!.startDay,
                endDay = state!.endDay,
                visible = state!.visible;
            const tabs = this.getTabs();
            return (
                <>
                    <NavBar leftContent={<Icon type="left" onClick={() => this.goBack()} />} rightContent={this.renderHeaderRight()}>
                        {getResourceTitle(this.props.match!.params.resourceType)}
                    </NavBar>
                    <div className="date-select-box">
                        <Tabs
                            tabs={tabs}
                            initialPage={0}
                            onTabClick={(e) => {
                                this.tabsClick(e);
                            }}
                        ></Tabs>
                        <Calendar
                            defaultValue={[new Date(startDay), new Date(endDay)]}
                            minDate={new Date()}
                            prefixCls={"am-calendar calendar-box"}
                            visible={visible}
                            onCancel={() => this.dispatch({ type: "input", data: { visible: false } })}
                            onConfirm={this.onConfirm}
                            type={"one"}
                        />
                    </div>
                </>
            );
        }

        tabsClick(tab) {
            if (!tab.value) {
                this.dispatch({ type: "input", data: { visible: true } });
            } else {
                this.dispatch({ type: "input", data: { ...tab.value, isSelectDate: false, isLoading: true } });
                this.getDataList(1, tab.value.startDay, tab.value.endDay);
            }
        }

        onConfirm = (e) => {
            this.dispatch({
                type: "input",
                data: {
                    visible: false,
                    startDay: formatDate(e),
                    endDay: formatDate(e),
                    isSelectDate: true,
                },
            });
            this.getDataList(1, formatDate(e), formatDate(e));
        };

        renderHeaderRight(): React.ReactNode {
            return <Icon type="search" onClick={() => this.dispatch({ type: "input", data: { open: true } })} />;
        }

        /**
         * 侧边栏标签变化
         * @param isChecked 是否多选
         */
        onModelChange(item: any, valueMap: string, isChecked?: boolean) {
            const { state } = this.props,
                selectedTags = JSON.parse(JSON.stringify(state![valueMap] || []));
            if (isChecked) {
                if (this.isChecked(selectedTags, item.tagValue)) {
                    let filter = selectedTags.filter((x) => x !== item.tagValue);
                    this.dispatch({ type: "input", data: { [valueMap]: filter, random: Math.random() } });
                } else {
                    selectedTags.push(item.tagValue);
                    this.dispatch({ type: "input", data: { [valueMap]: selectedTags, random: Math.random() } });
                }
            } else {
                if (this.isChecked(selectedTags, item.tagValue)) {
                    this.dispatch({ type: "input", data: { [valueMap]: [], random: Math.random() } });
                } else {
                    this.dispatch({ type: "input", data: { [valueMap]: [item.tagValue], random: Math.random() } });
                }
            }
        }

        /**
         * 侧边栏标签是否选择
         */
        isChecked = (arr, value) => {
            let filter = arr && arr.length > 0 && arr.find((x) => x === value);
            return filter;
        };

        /**
         * 侧边栏标签
         * @param isChecked 是否多选
         */
        renderAccordionItem(mapList, title, valueMap, isChecked?): React.ReactNode {
            const { state } = this.props,
                selectedTags = state![valueMap] || [];
            return (
                <List renderHeader={title}>
                    <List.Item wrap>
                        {(mapList || []).map((tag, i) => {
                            return (
                                <Tag
                                    selected={this.isChecked(selectedTags, tag.tagValue)}
                                    onChange={() => this.onModelChange(tag, valueMap, isChecked)}
                                    key={i}
                                    data-seed="logId"
                                    className="mr6 mb6"
                                >
                                    {tag.tagName}
                                </Tag>
                            );
                        })}
                    </List.Item>
                </List>
            );
        }
        /**
         * 物业项目
         */
        renderProjectsMap(mapList, title, valueMap): React.ReactNode {
            const { state } = this.props,
                selectedTags = state![valueMap] || [];
            return (
                <List renderHeader={title}>
                    <List.Item wrap>
                        {(mapList || []).map((tag, i) => {
                            return (
                                <Tag
                                    selected={this.isChecked(selectedTags, tag.tagValue)}
                                    onChange={() => {
                                        this.onModelChange(tag, valueMap);
                                        this.dispatch({ type: "getBuildsAction", parmas: { parkId: getLocalStorage("parkId"), spaceTypeList: 4, spaceIdList: tag.spaceId } });
                                        this.dispatch({ type: "input", data: { buildingItem: null } });
                                    }}
                                    key={i}
                                    data-seed="logId"
                                    className="mr6 mb6"
                                >
                                    {tag.tagName}
                                </Tag>
                            );
                        })}
                    </List.Item>
                </List>
            );
        }
        changeStartTime(e) {
            this.dispatch({ type: "input", data: { startTime: formatDateTime(e, " hh:mm:ss") } });
        }
        changeEndTime(e) {
            this.dispatch({ type: "input", data: { endTime: formatDateTime(e, " hh:mm") + ":00" } });
        }
        renderSelectTime(): React.ReactNode {
            const { state } = this.props,
                startDay = state!.startDay,
                endDay = state!.endDay,
                startTime = state!.startTime,
                endTime = state!.endTime;
            return (
                <List renderHeader={"可预订时间"}>
                    <List.Item wrap>
                        <Flex>
                            <DatePicker mode="time" maxDate={getDate(endDay + endTime)} value={getDate(startDay + startTime)} onChange={(e) => this.changeStartTime(e)}>
                                <div className="sidebar-tag">{formatDateTime(getDate(startDay + startTime)!, "hh:mm")}</div>
                            </DatePicker>
                            <WingBlank size="md">~</WingBlank>
                            <DatePicker mode="time" minDate={getDate(startDay + startTime)} value={getDate(endDay + endTime)} onChange={(e) => this.changeEndTime(e)}>
                                <div className="sidebar-tag">{formatDateTime(getDate(endDay + endTime)!, "hh:mm")}</div>
                            </DatePicker>
                        </Flex>
                    </List.Item>
                </List>
            );
        }
        renderSideBar(): React.ReactNode {
            const { state } = this.props,
                key = state!.key,
                projectsData = state!.projectsData,
                buildingsData = state!.buildingsData,
                capacityTags = state!.capacityTags,
                equipmentTags = state!.equipmentTags;

            return (
                <div className="drawer-detail">
                    <div className="container-column container-fill">
                        <NavBar className="park-nav">筛选</NavBar>
                        <SearchBar
                            placeholder="搜索"
                            value={key || this.key !== null ? key || this.key : ""}
                            onChange={(value) => {
                                this.dispatch({ type: "input", data: { key: value } });
                            }}
                        />
                        <WhiteSpace />
                        <div className="container-fill container-scrollable">
                            {projectsData && this.renderProjectsMap(projectsData, "项目物业", "projectsItem")}
                            {buildingsData && this.renderAccordionItem(buildingsData, "所属楼宇", "buildingItem", false)}
                            {this.renderAccordionItem(capacityTags, "容纳人数", "capacityTag", false)}
                            {this.renderSelectTime()}
                            {this.renderAccordionItem(equipmentTags, "提供设备", "equipmentTag", true)}
                        </div>
                        <Flex className="flex-collapse row-collapse">
                            <Flex.Item>
                                <Button
                                    onClick={() => {
                                        this.dispatch({
                                            type: "input",
                                            data: {
                                                key: "",
                                                capacityTag: null,
                                                equipmentTag: null,
                                                buildingItem: null,
                                                projectsItem: null,
                                                buildingsData: null,
                                                startTime: " 00:00:00",
                                                endTime: " 23:59:59",
                                            },
                                        });
                                        this.key = "";
                                    }}
                                >
                                    重置
                                </Button>
                            </Flex.Item>
                            <Flex.Item>
                                <Button
                                    type={"primary"}
                                    onClick={() => {
                                        $(".am-list-view-scrollview").animate({ scrollTop: 0 });
                                        this.dispatch({ type: "input", data: { open: false } });
                                        this.getDataList(1);
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
        renderItemAm(item): React.ReactNode {
            return (
                <Flex className="meeting-view" align={"start"}>
                    <Flex.Item>
                        <Flex>
                            {item.status &&
                                item.status.items &&
                                item.status.items.map((t, i) => {
                                    return (
                                        i <= 23 && (
                                            <Flex.Item key={i}>
                                                <span className={t.status !== MeetingStatusEnum.free ? "active" : ""}>
                                                    <em>{i % 2 === 0 && getDate(t.itemCode)!.getHours()}</em>
                                                </span>
                                            </Flex.Item>
                                        )
                                    );
                                })}
                            <Flex.Item>
                                <span>
                                    <em>12</em>
                                </span>
                            </Flex.Item>
                        </Flex>
                    </Flex.Item>
                    <div className="text">
                        <em>AM</em>
                    </div>
                </Flex>
            );
        }
        renderItemPm(item): React.ReactNode {
            return (
                <Flex className="meeting-view2" align={"start"}>
                    <div className="text">
                        <em>PM</em>
                    </div>
                    <Flex.Item>
                        <Flex>
                            {item.status &&
                                item.status.items &&
                                item.status.items.map((t, i) => {
                                    return (
                                        i >= 24 && (
                                            <Flex.Item key={i}>
                                                <span className={t.status !== MeetingStatusEnum.free ? "active" : ""}>
                                                    <em>{i % 2 === 0 && getDate(t.itemCode)!.getHours()}</em>
                                                </span>
                                            </Flex.Item>
                                        )
                                    );
                                })}
                            <Flex.Item>
                                <span>
                                    <em>24</em>
                                </span>
                            </Flex.Item>
                        </Flex>
                    </Flex.Item>
                </Flex>
            );
        }
        /**
         * 资源服务
         */
        renderService(item): React.ReactNode {
            return (
                item.service &&
                item.service.map((t) => {
                    return <span key={t.id}>{t.serviceName}</span>;
                })
            );
        }
        getPriceRange(item) {
            let minpriceData: any = {},
                maxpriceData: any = {};
            if (item && item.price && item.price.length > 0) {
                (minpriceData = item.price[0]), (maxpriceData = item.price[0]);
                item.price.forEach((item) => {
                    if (item.price < minpriceData.price) {
                        minpriceData = item;
                    }
                    if (item.price > minpriceData.price) {
                        maxpriceData = item;
                    }
                });
            }

            return {
                minpriceData,
                maxpriceData,
            };
        }
        /**
         * 渲染Items的内容
         */
        renderItemsContent(item?: any, _?: any, i?: number): React.ReactNode {
            const { state } = this.props,
                startDay = state!.startDay;
            let priceRange = this.getPriceRange(item);
            let minpriceData: any = priceRange.minpriceData,
                maxpriceData: any = priceRange.maxpriceData;
            return (
                <WingBlank key={i}>
                    <li
                        onClick={() => {
                            this.goTo({
                                pathname: `detail/${item.resource.id}`,
                                state: {
                                    startDay: startDay,
                                },
                            });
                        }}
                    >
                        <Flex align={"start"}>
                            <Flex.Item>
                                <div className="title">{item.resource && item.resource.resourceName}</div>
                                <WhiteSpace />
                                <div className="content">
                                    {minpriceData && maxpriceData && maxpriceData.price ? (
                                        <span className="margin-right-lg">
                                            <span className="size-16 color-5">
                                                {minpriceData.price === maxpriceData.price ? `${minpriceData.price}` : `${minpriceData.price}~${maxpriceData.price}`}
                                            </span>
                                            {getPriceUnit(maxpriceData && maxpriceData.priceUnit)}
                                        </span>
                                    ) : (
                                        <span className="margin-right-lg">免费</span>
                                    )}
                                    <span>{item.resource.items}个座位</span>
                                </div>
                                <WhiteSpace />
                                <div className="meeting-tag">{this.renderService(item)}</div>
                            </Flex.Item>
                            <ImageAuto.Component cutWidth="110" cutHeight="80" width={110} src={item && item.coverUrl} />
                        </Flex>
                        {this.renderItemAm(item)}
                        {this.renderItemPm(item)}
                        <WhiteSpace />
                    </li>
                </WingBlank>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props;
            return <>{state!.refreshing !== false ? this.renderSkeletons(3) : this.getListView()}</>;
        }

        getCountArr(count) {
            let items: any = [];
            for (let i = 0; i < count; i++) {
                items.push(1);
            }
            return items;
        }

        /**
         * 骨架屏
         */
        renderSkeletons(count): React.ReactNode {
            let items = this.getCountArr(count);
            return items.map((_, i) => (
                <List.Item key={i} wrap>
                    <SkeletonTheme color={"#F0F0F0"} highlightColor={"f5f5f5"}>
                        <li style={{ backgroundColor: "#fff" }}>
                            <Flex align={"start"}>
                                <Flex.Item>
                                    <div className="title">
                                        <Skeleton count={1} height={40} width={"70%"} />
                                    </div>
                                    <div className="content">
                                        <span className="margin-right-lg">
                                            <Skeleton count={1} height={19} width={90} />
                                        </span>
                                        <Skeleton count={1} height={19} width={40} />
                                    </div>
                                    <Skeleton count={2} height={21} width={55} />
                                </Flex.Item>
                                <Skeleton count={1} height={80} width={110} />
                            </Flex>
                            <Skeleton count={1} height={40} />
                            <Skeleton count={1} height={35} />
                            <WhiteSpace />
                        </li>
                    </SkeletonTheme>
                </List.Item>
            ));
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
                        this.getDataList(1);
                        this.dispatch({ type: "input", data: { open: false } });
                    }}
                    position="right"
                >
                    <Container.Component direction={"column"}>
                        {this.renderHeader()}
                        <div className="container container-fill container-column  meeting-list">
                            <ul className="container-fill container-scrollable">{this.renderBody()}</ul>
                        </div>
                    </Container.Component>
                    {/* {this.renderLoading()} */}
                </Drawer>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.room]);
}
