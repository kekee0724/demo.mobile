import React from "react";

import { Modal, NavBar, Flex, Button, Toast, SearchBar } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";
import { ListComponent, Loading, Container } from "@reco-m/core-ui";
import { Namespaces, selectCompanyUserModel } from "@reco-m/member-models";

import { SelectCompanyUserButton } from "./certify.detail.user.select.button"

export namespace SelectCompanyUser {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        isOpen: () => boolean;
        close: () => void;
        selectedCall: (data: any) => void;
        confirmSelect: (data: any) => void;
        item?: any;
        filterMyConpany?: any;
        onRef: (ref: any) => void;
    }

    export interface IState extends ListComponent.IState, selectCompanyUserModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.selectCompanyUser;
        time;
        componentDidMount() {
            this.dispatch({ type: `initPage` });
        }

        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state);
        }

        onEndReached() {
            let { state } = this.props,
                { isBind } = state as any,
                key = state!.key;
            this.getData((state!.currentPage || 0) + 1, isBind, key);
        }

        pullToRefresh() {
            let { state } = this.props,
                { isBind } = state as any,
                key = state!.key;
            this.getData(1, isBind, key);
        }

        getData(index: number, _: any, key?: string) {
            let { state } = this.props,
                companyId = state!.companyId;
            this.dispatch({
                type: "getCustomer",
                index,
                key,
                companyId: companyId
            });
        }

        check() {
            const { state } = this.props,
                selectitem = state!.selectitem || {}
            const { composeControl, requiredTrue, ValidatorControl } = Validators;

            return ValidatorControl(
                composeControl([requiredTrue], {
                    value: selectitem!.accountId ? true : false,
                    name: "",
                    errors: {
                        required: "至少选择一项，否则无法操作！"
                    }
                })
            );
        }

        confirm() {
            const msg = this.check()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            const { state } = this.props,
                selectitem = state!.selectitem || {}

            this.props.confirmSelect(selectitem);
        }

        renderItemsContent(customer?: any, _?: any, i?: number): React.ReactNode {
            return this.renderEmbeddedView(SelectCompanyUserButton.Page as any, {
                key: i, onClick: () => {
                    this.props.selectedCall(customer);
                }, customer: customer
            });
        }
        getButton(): React.ReactNode {
            let { isBind, data } = this.props.state as any;
            let index = (data && data.length) || 0;
            const { item } = this.props;

            if (isBind) {
                return (
                    <Flex className="flex-collapse row-collapse">
                        <Flex.Item>
                            <Button
                                onClick={() => {
                                    this.dispatch({ type: "input", data: { selectitem: item } });
                                    this.props.close();
                                }}
                            >
                                取消
                            </Button>
                        </Flex.Item>
                        <Flex.Item>
                            <Button onClick={this.confirm.bind(this)} type={"primary"}>
                                确定
                            </Button>
                        </Flex.Item>
                    </Flex>
                );
            } else {
                return (
                    <Flex className="flex-collapse row-collapse">
                        <Flex.Item>
                            <Button
                                onClick={() => {
                                    this.dispatch({ type: "input", data: { selectitem: item } });
                                    this.props.close();
                                }}
                            >
                                取消
                            </Button>
                        </Flex.Item>
                        <Flex.Item>
                            <Button onClick={this.confirm.bind(this, index > 0 ? true : false)} type="primary">
                                确定
                            </Button>
                        </Flex.Item>
                    </Flex>
                );
            }
        }

        getCompany(): React.ReactNode {
            let { state } = this.props,
                { isBind, key } = state as any;
            return <Container.Component fill direction={"column"}>
            {client.showheader && <NavBar className="park-nav">选择用户</NavBar>}
            <SearchBar
                value={key}
                placeholder="搜索"
                onChange={value => {
                    this.dispatch({ type: "input", data: { key: value } });
                    this.getData(1, isBind, value);
                }}
            />
            <Container.Component scrollable>
                {this.getListView()}
            </Container.Component>
            {this.getButton()}
        </Container.Component>;
        }
        setStopPropagation() {
            if (this.props.isOpen()) {
                clearTimeout(this.time);
                this.time = setTimeout(() => {
                    $('.am-modal').on('touchstart', (e) => {
                        e.stopPropagation();
                    }).on('touchend', (e) => {
                        e.stopPropagation();
                    }).on('touchmove', (e) => {
                        e.stopPropagation();
                    })
                }, 500)
            }
        }
        render(): React.ReactNode {
            let { isLoading } = this.props.state as any;
            this.setStopPropagation();
            return (
                <Modal popup visible={this.props.isOpen()} maskClosable={false} animationType="slide-up" className="model-height">
                    {isLoading && <Loading.Component />}
                    {this.getCompany()}
                </Modal>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.selectCompanyUser]);
}
