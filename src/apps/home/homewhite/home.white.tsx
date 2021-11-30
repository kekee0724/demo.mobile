import React from "react";

import { NavBar, Flex } from "antd-mobile-v2";

import { template, getCurrentToken, setLocalStorage, getLocalStorage } from "@reco-m/core";

import { ViewComponent, TabbarContext, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { homeModel, Namespaces } from "@reco-m/home-models";

import { HomeService, HomePick } from "@reco-m/home";

import { Assistantwhite } from "@reco-m/notice-assistant";

import { ActivityHome } from "@reco-m/ipark-white-activity";

import { ArticleHomeWhite } from "@reco-m/ipark-white-article";

import { PolicyServiceHome } from "@reco-m/policyservice";

import { HomeCertify } from "@reco-m/member-common";

import { MyNotificationCountWhite } from "@reco-m/notice-notice";
import { Namespaces as policyNamespaces } from "@reco-m/policymatching-models";
import { Namespaces as noticeNamespaces } from "@reco-m/notice-models";

// import {ToastInfo} from "@reco-m/ipark-common"

import { HomeNewbanner } from "./Home.banner.white";
export namespace HomeNew {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, homeModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        isRoot = true;
        showloading = false;
        headerContent = "首页";
        bodyClass = "white-bg";
        namespace = Namespaces.home;
        view;
        showback = false;


        componentDidMount() {
            let parkId = this.getSearchParam("parkId");
            if (parkId) {
                setLocalStorage("parkId", parkId);
                setLocalStorage("hasGetNearPark", "1");
            }
            // this.dispatch({ type: `initPage` });


            this.dispatch({ type: `getMapConfig`, callback: () => {
                this.dispatch({ type: `initPage` });
            } });

            // let player = new Aliplayer({
            //     "id": "player-con",
            //     "source": "http://down.live.bitech.cn/bitech/77.m3u8?auth_key=1618297411-0-0-a4d135991fb344fbf645d1949393e277",
            //     "width": "100%",
            //     "height": "500px",
            //     "autoplay": true,
            //     "isLive": true,
            //     "rePlay": false,
            //     "playsinline": true,
            //     "preload": true,
            //     "controlBarVisibility": "hover",
            //     "useH5Prism": true
            //   }, function (player) {
            //       console.log("The player is created", player);
            //     }
            //   );;
            // console.log(player);
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && nextProps.location!.pathname === "/index") {
                // 从首页进入登录页面返回后刷新服务快捷配置
                const data = {
                    pageIndex: 1,
                    parkId: getLocalStorage("parkId"),
                    catalogueCode: "TZTG",
                };
                this.dispatch({ type: `${noticeNamespaces.assistant}/getnoticeList`, data });

                if (this.isAuth()) {
                    this.dispatch({ type: `${noticeNamespaces.notificationCount}/getNotificationCount` });
                }
                this.dispatch({
                    type: "getUserProfile",
                    params: {
                        ownerId: getLocalStorage("parkId") ? getLocalStorage("parkId") : 1,
                        ownerType: 3,
                        areaCode: "IPARK",
                    },
                });
                this.dispatch({
                    type: `${policyNamespaces.policymatchinglist}/GetRecommandPolicyPagedHome`,
                    data: { parkId: getLocalStorage("parkId"), pageIndex: 1, key: "" },
                    callback: () => {},
                });
                this.dispatch({ type: `myCertify/getMember` });
                this.dispatch({ type: "input", data: { stopautostate: true } });
            }
            if (locationChanged && nextProps.location!.pathname !== "/index") {
                // 进入子页面
                this.dispatch({ type: "input", data: { stopautostate: false } });
            }
        }
        renderHeaderLeft(): React.ReactNode {
            return (
                <i
                    className="icon icon-sys"
                    onClick={() => {
                        if (this.isAuth()) {
                            setEventWithLabel(statisticsEvent.scan);
                            this.dispatch({ type: "scancall" });
                            this.dispatch({ type: "setAnonymousToken", tokens: getCurrentToken() });
                        } else {
                            this.goTo("login");
                        }
                    }}
                />
            );
        }

        renderHeaderRight(): React.ReactNode {
            return (
                <div className="flex-center">
                    {this.isAuth() && this.renderEmbeddedView(MyNotificationCountWhite.Page as any, {})}
                    <i
                        className={this.isAuth() ? "icon icon-newsel" : "icon icon-newsel size-18"}
                        onClick={() => {
                            this.goTo(`search`);
                        }}
                    />
                </div>
            );
        }

        renderHeaderContent(): React.ReactNode {
            const { state } = this.props;

            if (state!.parks) {
                return state!.parks.length > 0 ? (
                    <div
                        className="max-title"
                        onClick={() => {
                            this.dispatch({ type: "input", data: { showParkPicker: true } });
                        }}
                    >
                        <Flex>
                            <Flex.Item className="ellipsis-1">{getLocalStorage("parkName")}</Flex.Item>
                            <i className="icon icon-xia size-12"></i>
                        </Flex>
                    </div>
                ) : null;
            } else {
                return null;
            }
        }

        renderHeader(): React.ReactNode {
            return (
                <NavBar className="park-nav back-none new-bg-opcity1 top-back" leftContent={this.renderHeaderLeft()} rightContent={this.renderHeaderRight()}>
                    {this.renderHeaderContent()}
                </NavBar>
            );
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            if (top <= 0) {
                $(".back-none").addClass("top-back");
            } else {
                $(".back-none").removeClass("top-back");
            }
            $(".back-none").css({
                backgroundColor: `rgba(255, 255, 255, ${top * 0.01})`,
                color: top < 40 ? "#fff" : `rgba(0, 0, 0, ${top * 0.01})`,
                boxShadow: `0 0 4px rgba(0,0,0, ${top * 0.001 < 0.7 ? top * 0.001 : 0.7})`,
            });
        }

        refScroll(e) {
            $(e).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }

        renderBody(): React.ReactNode {
            return (
                <>

                    {this.renderEmbeddedView(HomePick.Page as any, {})}
                    {this.renderEmbeddedView(HomeNewbanner.Page as any, {})}
                    {this.renderEmbeddedView(Assistantwhite.Page as any, {})}
                    {this.renderEmbeddedView(HomeService.Page as any, {})}
                    {this.renderEmbeddedView(HomeCertify.Page as any, {})}
                  {this.renderEmbeddedView(PolicyServiceHome.Page as any, {})}
                    {this.renderEmbeddedView(ArticleHomeWhite.Page as any, {})}
                    {this.renderEmbeddedView(ActivityHome.Page as any, {})}
                </>
            );
        }

        renderFooter(): React.ReactNode {
            return <TabbarContext.Consumer>{(Tabbar) => <Tabbar {...this.props} type={"home"} />}</TabbarContext.Consumer>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.home]);
}
