import React from "react";

import { Modal, NavBar, Radio, Flex, Button, SearchBar } from "antd-mobile-v2";

import { template, Validators, getLocalStorage } from "@reco-m/core";
import { ListComponent, Loading, Container } from "@reco-m/core-ui";

import { Namespaces, selectCircleModel } from "@reco-m/ipark-white-circle-models";
import { SelectCircleItem } from './select.circle.item';
export namespace SelectCircle {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
        isOpen: () => boolean;
        close: () => void;
        selectedcall: (data: any) => void;
        confirmSelect: (data: any) => void;
        item?: any;
        onRef: (ref: any) => void;
    }

    export interface IState extends ListComponent.IState, selectCircleModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.selectCircle;
        componentDidMount() {
            const datas = {
                parkId: getLocalStorage("parkId"),
                pageIndex: 1,
                pageSize: 20,
                publishStatus: 1,
                isValid: true
            };
            this.props.onRef(this);
            this.dispatch({ type: `initPage`, datas });
        }

        componentReceiveProps(nextProps: P) {
            this.shouldUpdateData(nextProps.state);
        }

        onEndReached() {
            let { state } = this.props,
                key = state!.key,
                { isBind } = state as any;
            this.getData((state!.currentPage || 0) + 1, isBind, key);
        }

        pullToRefresh() {
            let { state } = this.props,
                key = state!.key,
                { isBind } = state as any;
            this.getData(1, isBind, key);
        }

        getData(index: number, _: any, key?: string) {
            const datas = {
                parkId: getLocalStorage("parkId"),
                pageIndex: index,
                pageSize: 20,
                isValid: true,
                publishStatus: 1,
                key: key
            };
            this.dispatch({
                type: "getCircleData",
                datas
            });
        }

        check() {
            let { item } = this.props;
            const { composeControl, requiredTrue, ValidatorControl } = Validators;

            return ValidatorControl(
                composeControl([requiredTrue], {
                    value: item!.id ? true : false,
                    name: "",
                    errors: {
                        required: "至少选择一项，否则无法操作！"
                    }
                })
            );
        }

        confirm() {
            const { item } = this.props;

            this.props.confirmSelect(item);
            this.dispatch({ type: "input", data: { key: "" } });
            this.getData(1, "", "");
        }
        renderItemsContent(customer?: any, _?: any, i?: number): React.ReactNode {
            if (customer.isSubscribe) {
                return (
                    this.renderEmbeddedView(SelectCircleItem.Page as any, {
                        key: i, onClick: () => {
                            this.props.selectedcall(customer);
                            this.dispatch("input", { item: customer });
                        }, customer: customer
                    })
                );
            } else {
                return (
                    null
                )
            }
        }

        getButton(): React.ReactNode {
            let { isBind, data } = this.props.state as any;
            let index = (data && data.length) || 0;
            if (isBind) {
                return (
                    <Flex className="flex-collapse row-collapse">
                        <Flex.Item>
                            <Button
                                onClick={() => {
                                    this.dispatch({ type: "input", data: { key: "" } });
                                    this.getData(1, isBind, "");
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
                                    this.dispatch({ type: "input", data: { key: "" } });
                                    this.getData(1, isBind, "");
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

        getCircle(): React.ReactNode {
            let { state } = this.props,
                { isBind } = state as any,
                key = state!.key;
            const { item } = this.props;
            return (
                <Container.Component direction="column" fill>
                    {client.showheader && <NavBar className="park-nav">同步至话题</NavBar>}
                    <SearchBar
                        placeholder="搜索"
                        value={key}
                        onCancel={() => {
                            this.dispatch({ type: "input", data: { key: "" } });
                            this.getData(1, isBind, "");
                        }}
                        onChange={value => {
                            this.dispatch({ type: "input", data: { key: value } });
                            this.getData(1, isBind, value);
                        }}
                    />
                    <Container.Component fill scrollable className="container-hidden">
                        {!this.props.match!.params.id && <Radio.RadioItem
                            checked={!item!.id}
                            onClick={() => {
                                this.props.selectedcall(null);
                                this.dispatch("input", { item: null })
                            }}
                        >
                            不选择话题
                    </Radio.RadioItem>}
                        {this.getListView()}
                    </Container.Component>
                    {this.getButton()}
                </Container.Component>
            );
        }

        render(): React.ReactNode {
            let { isLoading } = this.props.state as any;
            return (
                <Modal popup visible={this.props.isOpen()} maskClosable={false} animationType="slide-up" className="model-height">
                    {isLoading && <Loading.Component />}
                    {this.getCircle()}
                </Modal>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.selectCircle]);
}
