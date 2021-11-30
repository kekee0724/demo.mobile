import React from "react";

import { Button, Flex, Toast, Tag, Modal } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent, Container, Loading } from "@reco-m/core-ui";

import { accountEditModel, Namespaces } from "@reco-m/ipark-auth-models";

let tempGetTagApplyInfos: any;
export namespace AccountViewInterest {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isOpen: () => boolean;
        close: () => void;
        confirmSelect: (data: any) => void;
        item?: any;
        filterMyConpany?: any;
        onRef: (ref: any) => void;
    }

    export interface IState extends ViewComponent.IState, accountEditModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.accountEdit;
        scrollable = false;
        userID = "";
        confirm() {
            let { state } = this.props,
                getTagApplyInfos = state!.getTagApplyInfos || [];
            tempGetTagApplyInfos = getTagApplyInfos;
            this.props.confirmSelect(getTagApplyInfos);
        }
        getButton(): React.ReactNode {
            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                this.dispatch({ type: "input", data: { getTagApplyInfos: tempGetTagApplyInfos, random: Math.random() } });
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
        }

        selected(data) {
            let { state } = this.props;
            let getTagApplyInfos = state!.getTagApplyInfos || [];

            let filter = getTagApplyInfos && getTagApplyInfos.find((t: any) => +t.tagValue === +data.tagValue);

            return filter;
        }
        onChange(data) {
            let { state } = this.props,
                indterestMaxCount = state!.indterestMaxCount,
                getTagApplyInfos = state!.getTagApplyInfos || [];
            getTagApplyInfos = [...getTagApplyInfos];

            if (this.selected(data)) {
                let filter =
                    getTagApplyInfos &&
                    getTagApplyInfos.filter((t) => {
                        return +t.tagValue !== +data.tagValue;
                    });

                this.dispatch({ type: "input", data: { getTagApplyInfos: filter, random: Math.random() } });
            } else {
                if (getTagApplyInfos && getTagApplyInfos.length >= indterestMaxCount) {
                    Toast.fail(`最多选${indterestMaxCount}个哦～`);
                    // 解决蚂蚁默认选中
                    $(`.logId${data.tagValue}`).removeClass("am-tag-active").addClass("am-tag-normal");
                    this.dispatch({ type: "input", data: { random: Math.random() } });

                    return;
                }
                getTagApplyInfos && getTagApplyInfos.push(data);

                this.dispatch({ type: "input", data: { getTagApplyInfos: getTagApplyInfos, random: Math.random() } });
            }
        }

        renderTag(xingqArr): React.ReactNode {
            return (
                xingqArr &&
                xingqArr.map((item, i) => {
                    return (
                        <li className="pull-left" style={{ width: "25%" }} key={i}>
                            <Tag
                                selected={this.selected(item)}
                                onChange={() => {
                                    this.onChange(item);
                                }}
                                onClose={() => {}}
                                data-seed={`logId${item.tagValue}`}
                                className={`matching logId${item.tagValue}`}
                            >
                                {item.tagName}
                            </Tag>
                        </li>
                    );
                })
            );
        }
        getTagArr() {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                getTagApplyInfos = state!.getTagApplyInfos;
            let xingqArrs = personInfoDic && personInfoDic["ACCOUNT/xingqah"];
            let xingqArr = xingqArrs && xingqArrs.filter((item) => item.layer === 0);
            if (getTagApplyInfos && !tempGetTagApplyInfos) {
                tempGetTagApplyInfos = [...getTagApplyInfos];
            }
            return xingqArr;
        }
        renderCompany(): React.ReactNode {
            const { state } = this.props,
                indterestMaxCount = state!.indterestMaxCount,
                xingqArr = this.getTagArr();
            return (
                <Container.Component direction="column" fill>
                    <Container.Component fill scrollable>
                        <div className="size-20 mt40 text-center like-title">找到更多志同道合的小伙伴</div>
                        <div className="text-center bank-text">
                            <span>最多选{indterestMaxCount}个哦</span>
                        </div>
                        <div className="tag-content ml0">
                            <ul>{this.renderTag(xingqArr)}</ul>
                        </div>
                    </Container.Component>
                    {this.getButton()}
                </Container.Component>
            );
        }
        renderHeaderRight(): React.ReactNode {
            return <span className="hand">保存</span>;
        }
        render(): React.ReactNode {
            let { isLoading } = this.props.state as any;

            return (
                <Modal popup visible={this.props.isOpen()} maskClosable={false} animationType="slide-up" className="model-height">
                    {isLoading && <Loading.Component />}
                    {this.renderCompany()}
                </Modal>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.accountEdit]);
}
