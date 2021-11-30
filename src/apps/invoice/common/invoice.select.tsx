import React from "react";

import { Flex, Modal, NavBar, SearchBar, Button, Toast } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";

import { ListComponent, Container } from "@reco-m/core-ui";

import { invoiceSelectModel, Namespaces } from "@reco-m/invoice-models";

import { InvoiceSelectButton } from "./invoice.select.button";

export namespace InvoiceSelect {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        isOpen: () => boolean;
        close: () => void;
        selectedcallback: (data: any) => void;
        goAdd: () => void;
        invoiceType?: any;
    }

    export interface IState extends ListComponent.IState, invoiceSelectModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.invoiceSelect;

        componentReceiveProps(nextProps: Readonly<P>): void {
            this.shouldUpdateData(nextProps.state);
        }

        componentMount() {
            this.getData(1, this.props.invoiceType, "");
        }

        componentDidMount() {
            this.pullToRefresh();
        }

        componentWillUnmount() {
            this.dispatch({ type: "input", data: { invoiceType: "", key: "" } });
        }

        getData(index: number, invoiceType: any, key) {
            this.dispatch({
                type: "invoiceTitleGetPaged",
                index,
                key,
                invoiceType
            });
        }

        onEndReached() {
            const { state } = this.props;

            this.getData((state!.currentPage || 0) + 1, this.props.invoiceType, state!.key);
        }

        pullToRefresh() {
            const { state } = this.props;
            this.getData(1, this.props.invoiceType, state!.key);
        }

        check() {
            const { state } = this.props;
            const item = state!.item,
                { composeControl, requiredTrue, ValidatorControl } = Validators;

            return ValidatorControl(
                composeControl([requiredTrue], {
                    value: item ? true : false,
                    name: "",
                    errors: {
                        required: "至少选择一项，否则无法操作！"
                    }
                })
            );
        }

        confirm(isConfirm) {
            let { state } = this.props;
            if (isConfirm) {
                const msg = this.check()!();
                if (msg) {
                    Toast.fail(msg.join(), 1);
                    return;
                }
                this.props.selectedcallback(state!.item);
            } else {
                // 新增
                this.props.close();
                this.props.goAdd();
            }
        }

        renderItemsContent(invoice?: any, i?: any) {
            return this.renderEmbeddedView(InvoiceSelectButton.Page as any, { key: i, title: invoice.title, invoice: invoice });
        }

        renderButton(): React.ReactNode {
            return (
                <Flex className="flex-collapse tiled-btn">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                this.props.close();
                                this.dispatch({ type: "input", data: { key: "" } });
                            }}
                        >
                            取消
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button onClick={this.confirm.bind(this, false)}>新增</Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button onClick={this.confirm.bind(this, true)} type={"primary"}>
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        getCompany(): React.ReactNode {
            const { state } = this.props;

            return (
                <Container.Component direction="column" fill>
                    {client.showheader && <NavBar className="park-nav">选择发票抬头</NavBar>}
                    <SearchBar
                        placeholder="搜索"
                        value={state!.key ? state!.key : ""}
                        onCancel={() => {
                            this.dispatch({ type: "input", data: { key: "" } });
                            this.getData(1, this.props.invoiceType, "");
                        }}
                        onChange={value => {
                            this.dispatch({ type: "input", data: { key: value } });
                            this.getData(1, this.props.invoiceType, value);
                        }}
                    />
                    <Container.Component fill scrollable>
                        {this.getListView()}
                    </Container.Component>
                    {this.renderButton()}
                </Container.Component>
            );
        }

        render(): React.ReactNode {
            return (
                <Modal popup visible={this.props.isOpen()} maskClosable={false} animationType="slide-up" className="model-height">
                    {this.getCompany()}
                </Modal>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.invoiceSelect]);
}
