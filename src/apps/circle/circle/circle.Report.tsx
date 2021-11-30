import React from "react";

import { WhiteSpace, WingBlank, TextareaItem, Button, Toast } from "antd-mobile-v2";

import { template, Validators, getLocalStorage } from "@reco-m/core";
import { Picture, ViewComponent } from "@reco-m/core-ui";

import { Namespaces, circleTopicDetailModel } from "@reco-m/ipark-white-circle-models";

import {ServiceSourceEnum} from "@reco-m/ipark-common"
export namespace CircleReport {

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, circleTopicDetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        ceshiref
        showloading = false;
        headerContent = "举报"
        namespace = Namespaces.circleTopicDetail;

        componentDidMount() {
            this.dispatch({ type: `initPageReport` });
        }
        onChange = (files) => {
            this.dispatch({ type: "input", data: { files: files } });
        };
        selectCircle() {
            const { state } = this.props;
            this.dispatch({ type: "input", data: { circleOpen: !state!.circleOpen } });
        }
        // 检查
        validator() {
            let { state } = this.props;
            const content = state!.content,
                { required, composeControl, ValidatorControl } = Validators;
            return ValidatorControl(
                composeControl([required], {
                    value: content,
                    name: "帖子内容"
                })
            );
        }
        // 发帖提交
        handleSubmit() {
            let { state } = this.props;
            const content = state!.content,
                firstTopicComment = state!.firstTopicComment
            const msg = this.validator()!();
            if (msg) {
                Toast.fail(msg.join(), 1.5);
                return;
            }
            this.dispatch({
                type: "submitTopicReport",
                data: {
                    bindTableName: "",
                    bindTableId: firstTopicComment && firstTopicComment.id,
                    bindTableValue: firstTopicComment && firstTopicComment.ContentHTML,
                    parkId: getLocalStorage("parkId"),
                    source: ServiceSourceEnum.app,
                    reasonValue: content,
                    remarks: "举报描述",
                    reasonName: "举报原因"
                },
                callback: (result) => {
                    this.saveAttach(result);
                    Toast.success("提交成功", 1.5);
                    this.dispatch({ type: "input", data: { content: "", title: "", circle: "" } });
                    this.goBack();
                    window.scroll(0, 0);
                }
            });
        }
        renderBody(): React.ReactNode {
            return (
                <>
                    <TextareaItem placeholder="请填写举报原因，我们将尽快处理" rows={7} count={1000} onChange={(e) => this.dispatch({ type: "input", data: { content: e } })} />
                    <WingBlank>
                        <div className="circle-imagePicker mt20">
                            <Picture.Component fileNumLimit={9}
                                tableName=""
                                uploadSuccess={(_file, _data, _attachDataService) => {
                                    this.dispatch({
                                        type: "input",
                                        data: { fileIDs: _attachDataService!.addFileIds }
                                    });
                                }} />
                        </div>
                    </WingBlank>
                    <div style={{ color: "#999999", marginLeft: 15 }}>请上传图片证据（选填）</div>
                </>
            );
        }
        renderFooter(): React.ReactNode {
            return (
                <WingBlank>
                    <Button type="primary" onClick={() => this.handleSubmit()} >提交</Button>
                    <WhiteSpace />
                </WingBlank>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.circleTopicDetail]);
}
