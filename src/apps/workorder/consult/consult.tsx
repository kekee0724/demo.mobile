// 园区咨询
import React from "react";

import { Button, NavBar, Icon, Drawer, Flex } from "antd-mobile-v2";

import { template, getLocalStorage, Validators } from "@reco-m/core";

import { ListComponent, setEventWithLabel, androidExit } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { consultModel, Namespaces } from "@reco-m/workorder-models";

import { SideBarContent } from "@reco-m/workorder-common";

import { callTel, ToastInfo } from "@reco-m/ipark-common";

import { ConsultLoadAll } from "./consult.loadAll";

export namespace Consult {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, consultModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        showheader = false;
        scrollable = false;
        namespace = Namespaces.consult;

        componentDidMount() {
            setEventWithLabel(statisticsEvent.parkConsultListBrowse);
            this.dispatch({
                type: "initPage",
                data: { tagClass: "service/wentlb" },
                params: {
                    pageIndex: 1,
                    pageSize: 20,
                    isValid: true,
                    parkId: getLocalStorage("parkId"),
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        getData(data?: any) {
            this.dispatch({
                type: "getConsultList",
                params: {
                    pageIndex: 1,
                    pageSize: 20,
                    isValid: true,
                    parkId: getLocalStorage("parkId"),
                    ...data,
                },
            });
        }

        pullToRefresh() {
            const { state } = this.props;
            this.getData({
                pageIndex: 1,
                questionTypeValue: state!.redio1CheckTagId || "",
                question: state!.searchKey || "",
            });
        }

        onEndReached() {
            const { state } = this.props;
            this.getData({ pageIndex: (state!.currentPage || 0) + 1 });
        }

        renderItemsContent(data: any, _e, i: number): React.ReactNode {
            return this.renderEmbeddedView(ConsultLoadAll.Page as any, { num: i, data: data });
        }
        /**
         * 渲染navbar
         */
        renderNavBar(): React.ReactNode {
            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    onLeftClick={() => this.goBack()}
                    rightContent={<Icon type="search" size={"md"} onClick={() => this.onOpenChange()} />}
                >
                    园区咨询
                </NavBar>
            );
        }

        /**
         * 清空筛选条件
         */
        resetSearch() {
            const data = {
                redio1CheckTagName: "",
                redio1CheckIndex: null,
                redio1CheckTagId: null,
                searchKey: "",
                questionTypeValue: null,
            };
            this.dispatch({ type: "input", data: data });
        }

        /**
         * 确认筛选
         */
        sureSearch() {
            const { state } = this.props;
            let redio1CheckIndex = state && state!.redio1CheckIndex;

            this.getData({
                pageIndex: 1,
                questionTypeValue: redio1CheckIndex + 1,
            });

            this.onOpenChange();
        }

        /**
         * 问题类型被选择
         */
        zclbTagOnChange(data: any) {
            this.dispatch({
                type: "input",
                data: {
                    redio1CheckTagName: data.tag.tagName,
                    redio1CheckTagId: data.tag.TagValue,
                    redio1CheckIndex: data.i,
                },
            });
        }
                // 验证
                check(calltel: any) {
                    const { composeControl, requiredTrue, ValidatorControl } = Validators;
                    return ValidatorControl(
                        composeControl([requiredTrue], {
                            value: calltel && calltel ? true : false,
                            name: "",
                            errors: {
                                required: "电话号码不存在",
                            },
                        })
                    );
                }

        renderCallTel(calltel: any) {
            const msg = this.check(calltel)!();
            if (msg) {
                ToastInfo(msg.join(), 1);
                return;
            }
        }
        renderConsultContent(): React.ReactNode {
            const { state } = this.props,
            parkImpressionDetailData = state!.parkImpressionDetailData || {},
            ServiceTel = parkImpressionDetailData && parkImpressionDetailData.customerServicePhonenumber;
            return (
                <div className="container-column container-fill">
                    {this.renderNavBar()}
                    <div className="container-column container-fill">{this.getListView()}</div>
                    <Flex className="flex-collapse impression-footer">
                        <i
                            className="icon icon-yuanquxiaomishu consult-tag mr40"
                            onClick={() => {
                                setEventWithLabel(statisticsEvent.parkConsult);
                                ServiceTel ? callTel(ServiceTel) : this.renderCallTel(ServiceTel);
                            }}
                        />
                        <Flex.Item>
                            <Button type={"primary"} onClick={() => this.goTo(`create/YQZX`)}>
                                我要咨询
                            </Button>
                        </Flex.Item>
                    </Flex>
                </div>
            );
        }

        onOpenChange = () => {
            const { state } = this.props,
                openChange = state!.open;
            this.dispatch({ type: "input", data: { open: !openChange } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { open: false } });
            androidExit(!openChange, callback);
        };
        render(): React.ReactNode {
            const { state } = this.props,
                open = state!.open,
                consultTag = state!.consultTag || [];
            return (
                <Drawer
                    sidebar={
                        <SideBarContent.Component
                            searchKey={state!.searchKey}
                            typeTitle={"问题类型"}
                            rightTitle={state!.redio1CheckTagName}
                            tags={consultTag}
                            selectedTagID={state!.redio1CheckIndex}
                            onChange={this.dispatch.bind(this)}
                            resetSearch={this.resetSearch.bind(this)}
                            sureSearch={this.sureSearch.bind(this)}
                            tagOnChange={this.zclbTagOnChange.bind(this)}
                        />
                    }
                    docked={false}
                    open={open}
                    onOpenChange={() => this.onOpenChange()}
                    position="right"
                >
                    {this.renderConsultContent()}
                </Drawer>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.consult]);
}
