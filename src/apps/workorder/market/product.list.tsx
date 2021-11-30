import React from "react";

import { Tabs, List, Flex, Card, WhiteSpace, Modal } from "antd-mobile-v2";

import { template, formatDateTime, getLocalStorage } from "@reco-m/core";
import { ListComponent, ImageAuto, setEventWithLabel, popstateHandler, Container } from "@reco-m/core-ui";
import { Namespaces, productListModel, MyProductTabEnum, MyMarketinStatusEnum, MarketTypeEnum } from "@reco-m/workorder-models";
import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace ProductList {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, productListModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        headerContent = "产品发布";
        scrollable = false;
        bodyClass = "container-height apply-container";
        status = 0;
        namespace = Namespaces.productList;
        institutionID: any;

        componentDidMount() {
            setEventWithLabel(statisticsEvent.onShelfProductBrowse);
            this.institutionID = this.props.match!.params.institutionID;

            this.dispatch({ type: `initPage`, data: { institutionID: this.institutionID } });
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        // 获取数据
        getData(productTab, data?: any) {
            this.dispatch({
                type: "getProductList",
                data: {
                    orderBy: "",
                    parkId: getLocalStorage("parkId"),
                    institutionId: this.institutionID,
                    ...data,
                },
                productTab: productTab,
            });
        }

        componentReceiveProps(nextProps: IProps) {
            const { state } = this.props,
                productTab = state!.productTab;
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.getData(productTab, { pageIndex: 1 });
            }
        }

        // 刷新列表
        pullToRefresh() {
            const { state } = this.props,
                productTab = state!.productTab;
            this.getData(productTab, { pageIndex: 1 });
        }

        // 上拉刷新
        onEndReached() {
            const { state } = this.props,
                productTab = state!.productTab;
            this.getData(productTab, { pageIndex: (state!.currentPage || 0) + 1 });
        }

        // 切换tab
        changeTab(tab) {
            this.dispatch({ type: "input", data: { productTab: tab.value } });
            setTimeout(() => {
                this.getData(tab.value, { pageIndex: 1 });
            }, 100);
            if (tab.isValid) setEventWithLabel(statisticsEvent.onShelfProductBrowse);
            else setEventWithLabel(statisticsEvent.offShelfProductBrowse);
        }

        // 上架下架时的提示窗
        validModal(valid, item) {
            if (valid) setEventWithLabel(statisticsEvent.offShelfProduct);
            else setEventWithLabel(statisticsEvent.onShelfProduct);
            let modal = Modal.alert(`${valid ? "下架提示" : "上架提示"}`, `您确定要${valid ? "下架" : "上架"}？`, [
                {
                    text: "取消",
                    onPress: () => {
                        popstateHandler.removePopstateListener();
                    },
                },
                {
                    text: "确认",
                    onPress: () => {
                        popstateHandler.removePopstateListener();
                        this.serviceProductValid(valid, item);
                    },
                },
            ]);
            popstateHandler.popstateListener(() => {
                modal.close();
            });
        }
        // 取消审核时的提示窗
        cancelAuditModal(item) {
            const { state } = this.props,
                productTab = state!.productTab;
            Modal.alert(`操作提示`, `您确定要取消审核？`, [
                {
                    text: "取消",
                    onPress: () => {},
                },
                {
                    text: "确认",
                    onPress: () => {
                        this.dispatch({
                            type: "cancelAudit",
                            id: item.id,
                            callback: () => this.getData(productTab, { pageIndex: 1 }),
                        });
                    },
                },
            ]);
        }
        // 上架 下架
        serviceProductValid(valid, item) {
            const { state } = this.props,
                productTab = state!.productTab;
            this.dispatch({
                type: "serviceProductValid",
                id: item.id,
                isOnService: !valid,
                callback: () => this.getData(productTab, { pageIndex: 1 }),
            });
        }

        renderHeaderRight(): React.ReactNode {
            return <i className="icon icon-jiahao" onClick={() => this.goTo(`productadd?institutionID=${this.institutionID}`)} />;
        }

        // 产品标签
        renderTag(str: string): React.ReactNode {
            let strs = str.split(",");

            return (
                <>
                    {strs && strs.map((item, i) => <div key={i}>{i <= 2 && <span className="tag-state state-notbkg">{item}</span>}</div>)}
                    {strs.length > 3 && <span>...</span>}
                </>
            );
        }
        renderItemsContentBody(item: any): React.ReactNode {
            return (
                <Card.Body>
                    <List.Item align="top" thumb={<ImageAuto.Component cutWidth="104" cutHeight="91" src={item.pictureUrlList ? item.pictureUrlList[0] : ""} width="25vw" height="22vw" radius="8px" />}>
                        <div className="omit omit-1 omit-flex  flex-service-clim">{item.serviceName}</div>
                        <WhiteSpace size="sm" />
                        <div>
                            <Flex>{this.renderTag(item.serviceCategory)}</Flex>
                        </div>
                        <WhiteSpace size="sm" />
                        <div className="size-14">
                            <Flex>
                                <div className="omit omit-1 omit-flex ">
                                    <span className="color-orange">
                                        {+item.chargeModeValue === MarketTypeEnum.chargFree
                                            ? "免费"
                                            : +item.chargeModeValue === MarketTypeEnum.chargDiscuss
                                            ? "面议"
                                            : `${item.chargeMinPrice}-${item.chargeMaxPrice}${item.chargeUnit}`}
                                    </span>
                                </div>
                            </Flex>

                            <Flex>
                                <div className="omit omit-1 omit-flex ">
                                    <div className="text-right">申请量：{item.applyNumber || 0}次</div>
                                </div>
                            </Flex>
                        </div>
                    </List.Item>
                </Card.Body>
            );
        }
        renderItemContentButton(item): React.ReactNode {
            return item.status === MyMarketinStatusEnum.pass ? (
                item.isOnService ? (
                    <span className="tag-state pull-right tag-hui" onClick={() => this.validModal(true, item)}>
                        下架
                    </span>
                ) : (
                    <span className="tag-state pull-right tag-lan" onClick={() => this.validModal(false, item)}>
                        上架
                    </span>
                )
            ) : item.status === MyMarketinStatusEnum.bounced ? (
                <span className="tag-state pull-right tag-hui" onClick={() => this.goTo(`productadd/${item.id}?institutionID=${this.institutionID}`)}>
                    编辑
                </span>
            ) : item.status === MyMarketinStatusEnum.cancel ? (
                <span className="tag-state pull-right tag-hui" onClick={() => this.goTo(`productadd/${item.id}?institutionID=${this.institutionID}`)}>
                    重新提交
                </span>
            ) : (
                <span className="tag-state pull-right tag-hui" onClick={() => this.cancelAuditModal(item)}>
                    取消审核
                </span>
            );
        }
        renderItemsContentFooter(item: any): React.ReactNode {
            return (
                <Card.Footer
                    content={
                        <div className="padding-top-sm padding-bottom-sm">
                            <Flex>
                                <Flex.Item>
                                    <span>
                                        {item.status === MyMarketinStatusEnum.pass ? (item.isOnService ? "上架时间" : "下架时间") : "提交时间"}：
                                        {item.status === MyMarketinStatusEnum.pass
                                            ? formatDateTime(item.onServiceDate, "yyyy-MM-dd hh:mm")
                                            : formatDateTime(item.inputTime, "yyyy-MM-dd hh:mm")}
                                    </span>
                                </Flex.Item>
                                {this.renderItemContentButton(item)}
                            </Flex>
                            {item.status === MyMarketinStatusEnum.bounced && (
                                <Flex className="mt15">
                                    <Flex.Item>
                                        <span>退回原因：</span>
                                        <span className="color-4">{item.returnReason || "暂无原因"}</span>
                                    </Flex.Item>
                                </Flex>
                            )}
                        </div>
                    }
                />
            );
        }
        renderItemsContent(item: any): React.ReactNode {
            return (
                <>
                    <WhiteSpace size="md" />
                    <Card className="card-bank-list not-card-border margin-h-sm" key={item.id}>
                        {this.renderItemsContentBody(item)}
                        {this.renderItemsContentFooter(item)}
                    </Card>
                </>
            );
        }
        getTabs() {
            const { state } = this.props,
                validTotal = state!.validTotal,
                unvalidTotal = state!.unvalidTotal,
                shTotal = state!.shTotal,
                thTotal = state!.thTotal,
                qxTotal = state!.qxTotal;

            const tabs = [
                { title: `已上架（${validTotal || 0}）`, value: MyProductTabEnum.sj },
                { title: `已下架（${unvalidTotal || 0}）`, value: MyProductTabEnum.xj },
                { title: `待审核（${shTotal || 0}）`, value: MyProductTabEnum.sh },
                { title: `已退回（${thTotal || 0}）`, value: MyProductTabEnum.th },
                { title: `已取消（${qxTotal || 0}）`, value: MyProductTabEnum.qx },
            ];
            return tabs;
        }
        renderBody(): React.ReactNode {
            const showList = this.props.state!.showList,
                tabs = this.getTabs();
            return (
                <Container.Component fill scrollable className="container-hidden">
                    <Container.Component className="container-body apply-container">
                        <Tabs
                            tabs={tabs}
                            renderTabBar={(props) => (
                                <div>
                                    <Tabs.DefaultTabBar {...props} page={3.5} />
                                </div>
                            )}
                            swipeable={false}
                            initialPage={0}
                            animated={true}
                            useOnPan={false}
                            onChange={(tab) => {
                                this.dispatch({ type: "input", data: { showList: false } });
                                this.changeTab(tab);
                            }}
                        >
                            <div className="tabs-list-body">{showList ? this.getListView() : null}</div>
                        </Tabs>
                    </Container.Component>
                </Container.Component>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.productList]);
}
