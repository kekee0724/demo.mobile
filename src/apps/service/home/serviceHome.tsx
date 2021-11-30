import React from "react";

import { NavBar, WhiteSpace, Toast } from "antd-mobile-v2";

import Skeleton from "react-loading-skeleton";

import QueueAnim from "rc-queue-anim";

import { template, browser, setLocalStorage, getStorageObject } from "@reco-m/core";

import { ViewComponent, TabbarContext, openUrlAPP, openUrlBrowser, setEventWithLabel, NoData, setNavTitle } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { isCertify } from "@reco-m/member-common";

import { Namespaces, iparkServiceHomeModel } from "@reco-m/service-models";
import { MyApplyTabTypeEnum } from "@reco-m/workorder-models";

import { OpenTypeEnum } from "@reco-m/ipark-common";

import Sortable from "sortablejs";

import { isEqual } from "./common";

export namespace ServiceHome {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, iparkServiceHomeModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "服务";
        namespace = Namespaces.serviceHome;
        componentMount() {
            this.dispatch({ type: `input`, data: { modules: null, isEdit: false } });
            this.setState = () => false;
        }
        componentDidMount() {
            setNavTitle.call(this, client.title);
            let parkId = this.getSearchParam("parkId");
            if (parkId) {
                setLocalStorage("parkId", parkId);
            }
            this.dispatch({ type: `initPage` });
            this.goCertify = this.goCertify.bind(this);
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, client.title, nextProps);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && nextProps.location!.pathname === "/service") {
                if (this.isAuth()) {
                    this.dispatch({ type: "getByUser" });
                    this.dispatch({
                        type: "getCertifyMember",
                    });
                }
            }
        }

        goCertify() {
            this.goTo("certify");
        }

        itemClick(item) {
            const { state } = this.props,
                menus = state!.menus,
                isEdit = state!.isEdit,
                rzsqOrder = state!.rzsqOrder,
                currentMember = state!.member;

            if (isEdit) {
                this.dispatch({
                    type: "itemClick",
                    params: {
                        menus: menus,
                        item: item,
                    },
                });
            } else {
                if (isCertify(currentMember, item.moduleName, this.goCertify)) {
                    if (item.openType === OpenTypeEnum.h5App) {
                        if (item.routeKey === `create/ruzsq`) {
                            rzsqOrder && rzsqOrder.checkOrderId && MyApplyTabTypeEnum.cancel !== rzsqOrder.checkStatus
                                ? this.goTo(`applyDetail/${rzsqOrder.checkOrderId}/${rzsqOrder.topicStatus}`)
                                : this.goTo(item.routeKey);
                        } else {
                            this.goTo(item.routeKey);
                        }
                    } else if (item.openType === OpenTypeEnum.native) {
                        openUrlBrowser(item.routeKey);
                    } else if (item.openType === OpenTypeEnum.broswer) {
                        openUrlAPP(item.routeKey);
                    }
                }
            }
        }

        renderServiceItemView(item: any, i): React.ReactNode {
            const { state } = this.props,
                isEdit = state!.isEdit,
                menus = state!.menus;

            return (
                <div
                    key={i}
                    onClick={() => {
                        // 问卷可以匿名
                        if (!this.isAuth() && item.routeKey === "survey/0" && !client.isBiParkApp) {
                            this.goTo("/surveyanonymity");
                            return;
                        }
                        // 服务机构和服务产品不需要登录
                        if (this.isAuth() || (item.routeKey && (item.routeKey.indexOf("market") !== -1 || item.routeKey.indexOf("serviceProduct") !== -1))) {
                            this.itemClick(item);
                        } else {
                            this.goTo("login");
                        }
                    }}
                    className="rows"
                >
                    <div className={isEdit ? "addcut-box show-type" : "addcut-box"}>
                        <i className={isEdit && isEqual(item, menus) > -1 ? "icon icon icon-smalljian type-cut-off" : "icon icon-smalladd type-add"} />
                    </div>
                    <div className="bd">
                        <i className={item.iconUrl} />
                        <WhiteSpace size="sm" />
                        <span>{item.moduleName}</span>
                    </div>
                </div>
            );
        }

        renderServiceView(data): React.ReactNode {
            return (
                <div className="grid-box">
                    {data &&
                        data.map((item, i) => {
                            return this.renderServiceItemView(item, i);
                        })}
                </div>
            );
        }

        renderTopHomeMenus(): React.ReactNode {
            const { state } = this.props,
                menus = state!.menus || [];
            return (
                menus &&
                menus.map((menu, i) => {
                    return i < 5 ? (
                        <span key={i}>
                            <i className={menu.iconUrl} />
                        </span>
                    ) : null;
                })
            );
        }
        topHomeItemClick() {
            const { state } = this.props,
                isEdit = state!.isEdit,
                menus = state!.menus || [],
                currentMember = state!.member || {};
            if (this.isAuth()) {
                this.dispatch({
                    type: "edit",
                    params: {
                        isEdit: isEdit,
                        menus: menus,
                        currentMember: currentMember,
                    },
                });
                setEventWithLabel(statisticsEvent.customSetting);
            }
        }
        renderTopHomeItem(): React.ReactNode {
            const { state } = this.props,
                isEdit = state!.isEdit;
            if (this.isAuth()) {
                return (
                    <div className="sever-box">
                        <span className="tit">首页应用</span>
                        <div className={isEdit ? "bd animated-fast slideOutDown" : "bd"}>
                            {this.renderTopHomeMenus()}
                            <span>
                                <i className="icon icon-qita gray-three-color" />
                            </span>
                        </div>
                        <span
                            className="sever-btn"
                            onClick={() => {
                                this.topHomeItemClick();
                            }}
                        >
                            {isEdit ? "确定" : "编辑"}
                        </span>
                    </div>
                );
            }
        }

        renderTopView(): React.ReactNode {
            const { state } = this.props,
                isEdit = state!.isEdit;
            return (
                <div className="sever-top">
                    <div className={isEdit ? "animated-fast slideInUp" : ""}>{this.renderSelectedView()}</div>
                </div>
            );
        }
        selectedItemClick(item) {
            const { state } = this.props,
                menus = state!.menus;
            if (menus.length > 1) {
                this.dispatch({
                    type: "removeItem",
                    params: {
                        item: item,
                        menus: menus || [],
                    },
                });
            } else {
                Toast.fail("请至少选择一个!", 1);
            }
        }
        renderSelectedItemView(item: any): React.ReactNode {
            return (
                <div
                    key={item.id}
                    className="rows"
                    id={item.id}
                    onClick={() => {
                        this.selectedItemClick(item);
                    }}
                >
                    <div className="addcut-box show-type">
                        <i className="icon icon icon-smalljian type-cut" />
                    </div>
                    <div className="bd">
                        <i className={item.iconUrl} />
                        <WhiteSpace size="sm" />
                        <span>{item.moduleName}</span>
                    </div>
                </div>
            );
        }

        sortableGroupDecorator = (componentBackingInstance) => {
            if (componentBackingInstance && !browser.versions.android) {
                let options = {
                    draggable: ".rows",
                    animation: "150",
                    onEnd: (evt) => {
                        let children = evt.to.children;
                        this.dispatch({
                            type: "sortItem",
                            children,
                        });
                    },
                };
                Sortable.create(componentBackingInstance, options);
            }
        };

        renderSelectedView() {
            const { state } = this.props,
                isEdit = state!.isEdit,
                menus = state!.menus;
            if (isEdit) {
                return (
                    <QueueAnim animConfig={[{ opacity: [1, 0] }, { opacity: [1, 0] }]}>
                        <div className="grid-box" ref={this.sortableGroupDecorator}>
                            {menus &&
                                menus.map((item) => {
                                    return this.renderSelectedItemView(item);
                                })}
                        </div>
                    </QueueAnim>
                );
            }
        }

        renderHeader(): React.ReactNode {
            const { state } = this.props;
            let modules = state!.modules;

            if (!modules) {
                return (
                    <div className="sever-head">
                        <NavBar className="park-nav">服务</NavBar>
                    </div>
                );
            }

            if (modules.length === 0 && getStorageObject("servicecacheModules")) {
                modules = getStorageObject("servicecacheModules");
            }
            return modules.length ? (
                <div className="sever-head">
                    <NavBar className="park-nav">服务</NavBar>
                    {this.renderTopHomeItem()}
                    {this.renderTopView()}
                </div>
            ) : null;
        }

        renderModulesMap(): React.ReactNode {
            const { state } = this.props;
            let modules = state!.modules || [];
            if (modules.length === 0 && getStorageObject("servicecacheModules")) {
                modules = getStorageObject("servicecacheModules");
            }
            return modules.map((module, i) => (
                <div key={i}>
                    <div className="tit">{module.moduleName}</div>
                    <WhiteSpace />
                    <div key={"c"}>
                        {this.renderServiceView(
                            module.children &&
                                module.children.filter((item) => {
                                    if (item.moduleName === "停车预约" || !item.isValid) {
                                        // 隐藏模块
                                        return false;
                                    } else {
                                        return true;
                                    }
                                })
                        )}
                    </div>
                </div>
            ));
        }
        getCountArr(count) {
            let items: any = [];

            for (let i = 0; i < count; i++) {
                items.push(1);
            }

            return items;
        }
        renderSkeletonsRow(count): React.ReactNode {
            const items = this.getCountArr(count);
            return items.map((_, i) => {
                return (
                    <div key={i} className="rows">
                        <div className="bd">
                            <Skeleton circle={true} height={40} width={40} />
                            <WhiteSpace size="sm" />
                            <span>
                                <Skeleton count={1} height={20} width={50} />
                            </span>
                        </div>
                    </div>
                );
            });
        }

        /**
         * 骨架屏
         */
        renderSkeletons(count): React.ReactNode {
            let items = this.getCountArr(count);

            return items.map((_, i) => (
                <div key={i}>
                    <div className="tit">
                        <Skeleton count={1} height={20} width={200} />
                    </div>
                    <WhiteSpace />
                    <div key={"c"}>
                        <div className="grid-box">{this.renderSkeletonsRow(8)}</div>
                    </div>
                </div>
            ));
        }
        renderBody(): React.ReactNode {
            const { state } = this.props;
            let modules = state!.modules;

            if (!modules) {
                return (
                    <div className="service">
                        <WhiteSpace className="back " />
                        <div className="service-main">{this.renderSkeletons(3)}</div>
                        <WhiteSpace />
                    </div>
                );
            }

            return modules.length ? (
                <>
                    <div className="service">
                        <WhiteSpace className="back " />
                        <div className="service-main">{this.renderModulesMap()}</div>
                        <WhiteSpace />
                    </div>
                </>
            ) : (
                <NoData.Component text="暂无服务"></NoData.Component>
            );
        }

        renderFooter(): React.ReactNode {
            return <TabbarContext.Consumer>{(Tabbar) => <Tabbar {...this.props} type={"service"} />}</TabbarContext.Consumer>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.serviceHome]);
}
