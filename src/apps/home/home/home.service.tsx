import React from "react";

import { Grid } from "antd-mobile-v2";

import { template, getStorageObject } from "@reco-m/core";

import { ViewComponent, openUrlAPP, openUrlBrowser, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { homeModel, Namespaces } from "@reco-m/home-models";

import Skeleton from "react-loading-skeleton";

import { isCertify } from "@reco-m/member-common";

import { MyApplyTabTypeEnum } from "@reco-m/workorder-models";

import {OpenTypeEnum} from "@reco-m/ipark-common"

export namespace HomeService {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, homeModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.home;
        showloading = false;
        componentWillUnmount() {
            this.dispatch({ type: `input`, data: { userProfile: null } });
        }
        componentDidMount(): void {

            this.dispatch({ type: "initHomeService" });

            window["iOSReloadHome"] = () => {
                window["iOSReloadHome"] = null;
                this.dispatch({ type: `getMapConfig`, callback: () => {
                    this.dispatch({ type: `initPage` });
                } });
            };

        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && nextProps.location!.pathname === "/index") {
                if (this.isAuth()) {
                    this.dispatch({ type: "getByUser" });
                }
            }
        }

        goCertify() {
            this.goTo("certify");
        }

        topItemClick(item: any) {
            let { state } = this.props,
                currentMember = state!.currentMember,
                rzsqOrder = state!.rzsqOrder;
            if (this.isAuth()) {
                if (isCertify(currentMember, item.moduleName, this.goCertify.bind(this))) {
                    if (item.openType === OpenTypeEnum.h5App) {
                        if (item.routeKey === `create/ruzsq`) {
                            rzsqOrder && rzsqOrder.checkOrderId && MyApplyTabTypeEnum.cancel !== rzsqOrder.checkStatus
                                ? this.goTo(`applyDetail/${rzsqOrder.checkOrderId}/${rzsqOrder.topicStatus}`)
                                : this.goTo(item.routeKey);
                            return;
                        }
                        setEventWithLabel(statisticsEvent.highFrequencyApplicationClicks);
                        this.goTo(item.routeKey);
                    } else if (item.openType === OpenTypeEnum.native) {
                        openUrlBrowser(item.routeKey);
                    } else if (item.openType === OpenTypeEnum.broswer) {
                        openUrlAPP(item.routeKey);
                    }
                }
            } else {
                if (item.routeKey === "/service") {
                    this.goTo(item.routeKey);
                    return;
                }
                this.goTo("login");
            }
        }
        /** 骨架屏 */
        renderSkeletons(count) {
            let items: any = [];
            for (let i = 0; i < count; i++) {
                items.push(undefined);
            }
            return (
                <Grid
                    data={items}
                    hasLine={false}
                    square={false}
                    className="home-sever-icon"
                    renderItem={() => (
                        <div className="row">
                            <Skeleton circle={true} height={40} width={40} />
                            <span className="tit">
                                <Skeleton count={1} height={20} width={50} />
                            </span>
                        </div>
                    )}
                />
            );
        }
        render(): React.ReactNode {
            const { state } = this.props;
            let menus;
            if (state!.userProfile) {
                menus = state!.userProfile;
            }

            if (!menus) {
                menus = getStorageObject("homecacheService");
            }
            return menus && menus.length ? (
                <Grid
                    data={menus}
                    hasLine={false}
                    square={false}
                    className="home-sever-icon"
                    renderItem={(dataItem) => (
                        <div className="row" onClick={this.topItemClick.bind(this, dataItem)}>
                            <div className="icon-bg">
                                <i className={dataItem!.iconUrl} />
                            </div>
                            <span className="tit">{dataItem!.moduleName}</span>
                        </div>
                    )}
                />
            ) : (
                this.renderSkeletons(8)
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.home]);
}
