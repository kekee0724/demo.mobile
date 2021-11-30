import React from "react";

import { List, Modal, Radio, WhiteSpace, Flex, NavBar } from "antd-mobile-v2";

import { template, browser, setLocalStorage, getLocalStorage } from "@reco-m/core";
import { ViewComponent, Container, setEventWithLabel, callModal } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, closest, homeModel } from "@reco-m/home-models";

import { synchronousSerial } from "@reco-m/ipark-common";

export namespace HomePick {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, homeModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.home;
        showloading = false;
        hasloadPark = false;
        componentReceiveProps(nextProps) {
            if (nextProps.state!.parks && !this.hasloadPark && client.openMapLocation) {
                this.hasloadPark = true;

                synchronousSerial(() => {
                    this.loadPark();
                });
            }
        }
        componentWillUnmount() {
            this.dispatch({ type: "input", data: { showParkPicker: false } });
        }
        loadPark() {
            const { state } = this.props,
                parks = state!.parks;

            this.dispatch({
                type: "loadPark",
                callback: () => {
                    // 本地没有选择园区时
                    this.refreshHomeData();

                    this.dispatch({
                        type: "getUserLocation",
                        parks: parks,
                        callback: (result) => {
                            callModal(
                                `定位到您在${result.parkName}, 是否进行切换?`,
                                () => {
                                    setLocalStorage("parkId", result.id);
                                    setLocalStorage("parkName", result.parkName);
                                    setLocalStorage("hasGetNearPark", "1");
                                    this.refreshHomeData();
                                },
                                () => {
                                    setLocalStorage("parkId", state!.parks[0].id);
                                    setLocalStorage("parkName", state!.parks[0].parkName);
                                    setLocalStorage("hasGetNearPark", "1");
                                    this.refreshHomeData();
                                },
                                null,
                                "切换",
                                "不切换"
                            );
                        },
                    });
                },
            });
        }
        refreshHomeData() {
            this.dispatch({
                type: "refreshHomeData",
                key: this.getSearchParam("key"),
            });
        }
        onWrapTouchStart(e: any) {
            if (!(browser.versions.iPhone || browser.versions.iPad)) {
                return;
            }
            const pNode = closest(e.target, ".am-modal-content");
            if (!pNode) {
                e.preventDefault();
            }
        }

        config(parkId: any, parkName: any) {
            this.dispatch({ type: "config", parkName, parkId });
        }

        changePark(park: any) {
            setEventWithLabel(statisticsEvent.parkSwitch);

            setLocalStorage("parkId", park.id);
            setLocalStorage("parkName", park.parkName);

            this.dispatch({ type: "input", data: { showParkPicker: false } });
            this.refreshHomeData();
        }

        renderParkList(): React.ReactNode {
            const { state } = this.props;
            return state!.parks.map((park, i) => {
                return (
                    <Radio.RadioItem key={i} checked={getLocalStorage("parkId") === park.id} onClick={() => this.changePark(park)}>
                        {park.parkName}
                    </Radio.RadioItem>
                );
            });
        }

        renderModalContent(): React.ReactNode {
            const { state } = this.props;
            return (
                <Container.Component fill direction={"column"}>
                    <NavBar className="park-nav">选择园区</NavBar>
                    <WhiteSpace className="back" />
                    {client!.openMapLocation && (
                        <List>
                            <List.Item>
                                <Flex>
                                    <i className="icon icon-newadds mr5 size-18 color-orange margin-right-sm" />
                                    <div className="max-indicators margin-right-sm size-14">{state!.userLocation ? state!.userLocation : "定位失败"}</div>
                                </Flex>
                            </List.Item>
                        </List>
                    )}
                    <Container.Component scrollable>
                        <List className="park-list">{this.renderParkList()}</List>
                    </Container.Component>
                </Container.Component>
            );
        }

        render(): React.ReactNode {
            const { state } = this.props;
            return state!.parks ? (
                <Modal
                    visible={state!.showParkPicker}
                    popup
                    animationType="slide-up"
                    maskClosable={true}
                    className="full-screen"
                    closable={true}
                    onClose={() => this.dispatch({ type: "input", data: { showParkPicker: false } })}
                    wrapProps={{ onTouchStart: this.onWrapTouchStart }}
                >
                    {this.renderModalContent()}
                </Modal>
            ) : (
                <div />
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.home]);
}
