
import React from "react";

import { NavBar, List, Radio, Flex, Drawer, Icon, SearchBar, Accordion, SwipeAction, Modal, Toast, WhiteSpace } from "antd-mobile-v2";

import { template, formatDate } from "@reco-m/core";

import { ListComponent, Container, setEventWithLabel, androidExit } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { SearchFooter } from "@reco-m/workorder-common";

import { checkFollowType, favoritesModel, menuList, Namespaces } from "@reco-m/favorites-models";
import { IParkResourceTypeEnum } from "@reco-m/ipark-common";
import { resourceService } from "@reco-m/order-service";

export namespace Favorites {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, favoritesModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.favorites;
        showheader = false;

        componentDidMount() {
            this.dispatch({
                type: `initPage`,
                data: {
                    pageIndex: 1,
                },
            });
            this.setState({ pageSize: 25 });
        }

        componentReceiveProps(nextProps: Readonly<P>) {
            this.shouldUpdateData(nextProps.state);
            this.props.location !== nextProps.location && this.getData(1);
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        getData(pageIndex: number = 1) {
            const { state } = this.props,
                key = state!.key,
                bindTableName = state!.bindTableName;
            this.dispatch({
                type: `getUserFollow`,
                data: {
                    bindTableName,
                    key: key && decodeURI(key),
                    pageIndex: pageIndex
                },
            });
        }

        onRefresh() {
            this.getData(1);
        }
        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getData(1);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getData((state!.currentPage || 0) + 1);
        }
        onOpenChange = () => {
            const { state } = this.props,
                openChange = state!.open;
            this.dispatch({ type: "input", data: { open: !openChange } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { open: false } });
            androidExit(!openChange, callback);
        };
        renderFollowHeader(): React.ReactNode {
            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    onLeftClick={() => this.goBack()}
                    rightContent={<Icon type="search" onClick={() => this.onOpenChange()} />}
                >
                    我的收藏
                </NavBar>
            );
        }

        reset() {
            this.dispatch("input", { key: "", bindTableName: "", tagName: "" });
        }

        sureSearch() {
            this.onOpenChange();
            this.dispatch("input", { open: false });
            this.getData();
            setEventWithLabel(statisticsEvent.myCollectSearch);
        }

        renderLX(): React.ReactNode {
            const { state } = this.props,
                bindTableName = state!.bindTableName;

            return (
                <List>
                    {menuList.map((item) => (
                        <Radio.RadioItem
                            key={item.bindTableName}
                            checked={bindTableName === item.bindTableName}
                            onChange={() => this.dispatch("input", { bindTableName: item.bindTableName, tagName: item.tagName })}
                        >
                            <div className="gray-three-color">{item.tagName}</div>
                        </Radio.RadioItem>
                    ))}
                </List>
            );
        }

        renderSliderContent(): React.ReactNode {
            const { state } = this.props,
                tagName = state!.tagName;

            return (
                <Container.Component scrollable fill>
                    <Accordion accordion defaultActiveKey="0" className="collect-accordion">
                        <Accordion.Panel
                            header={
                                <Flex>
                                    <Flex.Item>收藏类型</Flex.Item>
                                    <span className="accordion-result">{tagName}</span>
                                </Flex>
                            }
                        >
                            {this.renderLX()}
                        </Accordion.Panel>
                    </Accordion>
                </Container.Component>
            );
        }

        goToSpaceDetail(item: any) {
            let roomId = item && item!.bindTableId;

            let data = resourceService.getResourceDetail(roomId, {})
            data.then((result) => {
                let resourceType = result && result.resource && result.resource.resourceType
                if (resourceType === IParkResourceTypeEnum.meetingRoom || resourceType === IParkResourceTypeEnum.venue) {
                    this.goTo(`resource/room/${resourceType}/detail/${roomId}`);
                } else if (resourceType === IParkResourceTypeEnum.cubicleRoom || resourceType === IParkResourceTypeEnum.advertisingSpace) {
                    this.goTo(`resource/position/` + resourceType + "/detail/" + roomId);
                }
            })
        }

        /**
         * 跳转收藏详情
         */
        goDetail(item: any) {
            const type = checkFollowType(item);
            type === "资讯"
                ? this.goTo(`articleDetail/${item.bindTableId}`)
                : type === "活动"
                    ? this.goTo(`activityDetail/${item.bindTableId}`)
                    : type === "机构"
                        ? this.goTo(`detail/${item.bindTableId}/1`)
                        : type === "动态"
                            ? this.goTo(`topic/${item.bindTableId}`)
                            : type === "资源"
                                ? this.goToSpaceDetail(item)
                                : type === "政策"
                                    ? this.goTo(`policyserviceoriginaldetails/${item.bindTableId}`)
                                    : type === "政策细则" ? this.goTo(`policyservicedetails/${item.bindTableId}`)
                                    : this.goTo(`productdetail/${item.bindTableId}/1`);

            setEventWithLabel(statisticsEvent.myCollectionDetailView);
        }

        renderFollowItem(item: any, i: number): React.ReactNode {
            const type = checkFollowType(item);
            let text = item?.bindTableValue;
            if (type === "资源") {
                const textArr = item?.bindTableValue.split(",") || [];
                text = textArr?.length > 0 ? textArr[0] : "";
            }
            return (
                <List.Item key={i} onClick={() => this.goDetail(item)}>
                    <div className="list-title-one ">{text}</div>
                    <List.Item.Brief>
                        <Flex>
                            <Flex.Item>{checkFollowType(item)}</Flex.Item>
                            <span>{formatDate(item && item.inputTime)}</span>
                        </Flex>
                    </List.Item.Brief>
                </List.Item>
            );
        }

        /**
         * 弹出取消收藏对话框
         */
        showUnFollowModal(item: any) {
            Modal.alert("确定删除该收藏？", "", [{ text: "取消" }, { text: "确认", onPress: () => this.unFollowItem(item) }]);
        }

        /**
         * 取消收藏
         */
        unFollowItem(item: any) {
            this.dispatch({
                type: "unFollow",
                data: {
                    bindTableName: item.bindTableName,
                    bindTableId: item.bindTableId,
                },
                callback: () => {
                    this.unFollowSuccess();
                },
            });
        }

        unFollowSuccess() {
            Toast.success("取消收藏成功！", 1);
            this.getData(1);

            setEventWithLabel(statisticsEvent.myCancelCollection);
        }

        renderItemsContent(item: any, i: number): React.ReactNode {
            return (
                <SwipeAction
                    autoClose
                    right={[
                        {
                            text: "删除",
                            onPress: () => this.showUnFollowModal(item),
                            style: { backgroundColor: "#F4333C", color: "white" },
                        },
                    ]}
                >
                    {this.renderFollowItem(item, i)}
                </SwipeAction>
            );
        }

        renderSlider(): React.ReactNode {
            const { state } = this.props,
                key = state!.key;
            return (
                <div className="drawer-detail">
                    <Container.Component direction="column" fill>
                        {client.showheader && <NavBar>筛选</NavBar>}
                        <SearchBar
                            placeholder="搜索"
                            maxLength={8}
                            value={key}
                            onChange={(e) => {
                                this.dispatch("input", { key: e });
                            }}
                        />
                        <WhiteSpace />
                        {this.renderSliderContent()}
                        <SearchFooter.Component reset={this.reset.bind(this)} sureSearch={this.sureSearch.bind(this)} />
                    </Container.Component>
                </div>
            );
        }

        render(): React.ReactNode {
            const { state } = this.props;
            return (
                <Drawer sidebar={this.renderSlider()} docked={false} open={state!.open} onOpenChange={() => this.onOpenChange()} position="right">
                    <div className="container-column container-fill">
                        {this.renderFollowHeader()}
                        <div className="container-column container-fill">{this.getListView()}</div>
                    </div>
                </Drawer>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.favorites]);
}
