import React from "react";

import { WingBlank, TextareaItem, Button, Toast, Flex } from "antd-mobile-v2";

import { template, Validators, getLocalStorage } from "@reco-m/core";
import { ViewComponent, setEventWithLabel, Picture, androidExit } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, AddTypeEnum, circleAddModel } from "@reco-m/ipark-white-circle-models";

import { IParkBindTableNameEnum, ServiceSourceEnum, ServiceSourceTextEnum } from "@reco-m/ipark-common";

import { SelectCircle } from "./select.circle";
export namespace CircleAdd {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, circleAddModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        ceshiref;
        showloading = false;
        headerContent = "发表动态";
        namespace = Namespaces.circleAdd;

        componentDidMount() {
            this.dispatch({ type: `initPage`, data: { id: this.props.match!.params.id } });
        }
        componentWillUnmount() {
            this.dispatch({ type: "init" });
            this.dispatch({ type: "input", data: { circleOpen: false } });
        }
        onChange = (files) => {
            this.dispatch({ type: "input", data: { files: files } });
        };
        selectCircle() {
            const { state } = this.props;
            this.onOpenChange(!state!.circleOpen);
        }
        // 检查
        validator() {
            let { state } = this.props;
            const content = state!.content,
                { required, requiredTrue, composeControl, ValidatorControl } = Validators;
            return ValidatorControl(
                composeControl([required], {
                    value: content,
                    name: "帖子内容",
                }),
                composeControl([requiredTrue], {
                    value: !this.attachIsInProgress(),
                    name: "",
                    errors: {
                        required: "图片上传中,请稍后再试",
                    },
                })
            );
        }
        // 发帖提交
        handleSubmit(circle) {
            let { state } = this.props;
            const content = state!.content;
            const msg = this.validator()!();

            if (msg) {
                Toast.fail(msg.join(), 1.5);
                return;
            }

            this.dispatch({
                type: "submitTopic",
                data: {
                    topicId: circle.id,
                    title: "",
                    postContent: content.replace(/\n/g, "<br>"),
                    source: ServiceSourceTextEnum.app,
                    sourceValue: ServiceSourceEnum.app,
                    parkId: getLocalStorage("parkId"),
                    parkName: getLocalStorage("parkName"),
                    addType: AddTypeEnum.add,
                },
                callback: (result) => {
                    setEventWithLabel(statisticsEvent.parkCircleAdd);
                    this.saveAttach(result);
                    Toast.success("提交成功", 2, () => {
                        this.props.match!.params.id &&
                            this.dispatch({
                                type: "circleDetail/initPage",
                                data: { id: this.props.match!.params.id, datas: { IsParkAccount: false, pageIndex: 1, pageSize: 10 } },
                            });
                        this.goBack();
                        window.scroll(0, 0);
                    });
                },
            });
        }
        // 返回
        onOpenChange = (bool: boolean) => {
            this.dispatch({ type: "input", data: { circleOpen: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { circleOpen: false } });
            androidExit(bool, callback);
        };
        renderBody(): React.ReactNode {
            const state = this.props.state,
                circleOpen = state!.circleOpen,
                selectedCircle = state!.selectedCircle || {},
                circleProps: any = {
                    isOpen: () => circleOpen,
                    close: () => {
                        this.selectCircle();
                    },
                    selectedcall: (data: any) => {
                        this.dispatch("input", { selectedCircle: data });
                    },
                    confirmSelect: (data: any) => {
                        this.dispatch("input", { selectedCircle: data, circleOpen: false });
                        this.onOpenChange(false);
                    },
                    item: selectedCircle,
                    onRef: (ref) => {
                        this.ceshiref = ref;
                    },
                };
            return (
                <>
                    <TextareaItem placeholder="写些什么和大家分享..." rows={7} count={500} onChange={(e) => this.dispatch({ type: "input", data: { content: e } })} />
                    <WingBlank>
                        <div className="circle-imagePicker mt20">
                            <Picture.Component
                                fileNumLimit={9}
                                customType={0}
                                tableName={IParkBindTableNameEnum.post}
                                multiple={true}
                            />
                        </div>
                    </WingBlank>
                    {this.renderEmbeddedView(SelectCircle.Page as any, { ref: "selectCircle", ...circleProps })}
                    <Flex className="ph15">
                        <Flex.Item></Flex.Item>
                        <div className="topic-block" onClick={this.selectCircle.bind(this)}>
                            <i className="icon icon-huihua"></i>同步至
                            {selectedCircle.topicName ? <span style={{ color: "orange" }}> {selectedCircle.topicName}</span> : "话题"}
                        </div>
                    </Flex>
                </>
            );
        }
        renderFooter(): React.ReactNode {
            const { state } = this.props,
                selectedCircle = state!.selectedCircle || {};
            return (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button type="primary" onClick={() => this.handleSubmit(selectedCircle)}>
                            确定发布
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.circleAdd]);
}
