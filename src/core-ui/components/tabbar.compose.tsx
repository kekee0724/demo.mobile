import React from "react";

import { Popup, TabBar } from "antd-mobile";

import { getObjectProp } from "@reco-m/core";

import { ViewComponent } from "../container";

export namespace TabbarCompose {
    export interface IProps extends ViewComponent.IProps {
        type: string;
        items?: RECO.Mobile.Config.Client.TabBar.Item[];
        isActive?: RECO.Mobile.Config.Client.TabBar.isActive;
        component?: any;
        modalPage?: any;
    }

    export interface IState extends ViewComponent.IState {
        modal?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        state = {
            modal: false,
        } as S;

        items: RECO.Mobile.Config.Client.TabBar.Item[];
        isActive: RECO.Mobile.Config.Client.TabBar.isActive;
        modalAnimationType: string;
        modalClassName: string;
        modalPage: any;

        constructor(props: P, context?: any) {
            super(props, context);

            this.items = getObjectProp(client, "tabBar.items", []);
            this.isActive = getObjectProp(client, "tabBar.isActive", (type, item) => type === item.type);
            this.modalAnimationType = getObjectProp(client, "tabBar.modalAnimationType", "slide-up");
            this.modalClassName = getObjectProp(client, "tabBar.modalClassName", "fade-box");
        }

        showModal = (e) => {
            e.preventDefault(); // 修复 Android 上点击穿透

            this.setState({
                modal: !this.state.modal,
            });

            setTimeout(() => {
                if (this.state.modal === true) {
                    $(".am-modal-mask").hide();
                    $(".am-modal-wrap-popup").css({ height: "auto", bottom: "0" });
                    $(".view").addClass("filter");
                    $(".am-modal-content").css({ background: "none" });
                } else {
                    $(".am-modal-wrap-popup").animate({ opacity: 0 });
                }
            }, 100);
        };

        hideModal = () => {
            this.setState({
                modal: false,
            });

            $(".view").removeClass("filter");
        };

        renderItem(item): React.ReactNode {
            return <TabBar.Item key={item.key} icon={(active: boolean) => active ? <i className={`${item.icon}_on`}/> : <i className={`${item.icon}`}/>} title={item.title} />;
        }

        getItems(hasMore: boolean) {
            const { items = this.items } = this.props;

            return this.attachMoreItem(items, hasMore);
        }

        getMoreItem(hasMore: boolean): RECO.Mobile.Config.Client.TabBar.Item | null {
            return hasMore
                ? ({
                      icon: [
                          <div className="apply-box" onClick={this.showModal} key={"a"}>
                              <i className={this.state.modal === false ? "iconoa icon-jia-oa" : "iconoa icon-jia-oa tel-l"} />
                          </div>,
                          <div key={"b"} className="back-xs" />,
                      ],
                      selectedIcon: (
                          <div className="apply-box">
                              <i className="iconoa icon-jia-oa" />
                          </div>
                      ),
                      type: "apply",
                  } as any)
                : null;
        }

        attachMoreItem(items: RECO.Mobile.Config.Client.TabBar.Item[], hasMore: boolean) {
            const moreItem = this.getMoreItem(hasMore),
                item = moreItem && (items[2] || (items[2] = moreItem));

            if (moreItem) {
                item!.type === moreItem.type ? (items[2] = moreItem) : items.splice(2, 0, moreItem);
            }

            return items;
        }

        renderItems(hasMore = false): React.ReactNode {
            return this.getItems(hasMore).map((item) => this.renderItem(item));
        }

        render(): React.ReactNode {
            const { modalPage, children, history, location, match, staticContext, wrap } = this.props as any,
                child = typeof children === "function" ? (children as any)(this) : children;

            return (
                <TabbarModalContext.Consumer>
                    {(ModalPage: any) => {
                        ModalPage = modalPage || ModalPage || this.modalPage;
                        return ModalPage ? (
                            <div>
                                <TabBar activeKey={location.pathname} onChange={(e) => this.goTo(e)}>
                                    {this.renderItems(!0)}
                                </TabBar>
                                {child}
                                <Popup style={{ height: "100%" }} visible={this.state.modal!} afterClose={this.hideModal} className={this.modalClassName}>
                                    <ModalPage
                                        history={history}
                                        location={location}
                                        match={match}
                                        staticContext={staticContext}
                                        showModal={this.showModal}
                                        hideModal={this.hideModal}
                                        wrap={wrap}
                                    />
                                </Popup>
                            </div>
                        ) : (
                            <>
                                <TabBar activeKey={location.pathname} onChange={(e) => e != location.pathname && this.goTo(e)}>
                                    {this.renderItems()}
                                </TabBar>
                                {child}
                            </>
                        );
                    }}
                </TabbarModalContext.Consumer>
            );
        }
    }
}

export const TabbarContext = React.createContext(TabbarCompose.Component);

export const TabbarModalContext = React.createContext(null as any);
