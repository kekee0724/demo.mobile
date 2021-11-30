import React from "react";

import { TextareaItem, Flex, Toast, Modal, Checkbox } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import Rater from "react-rater";

import "react-rater/lib/react-rater.css";

import { evaluateModel, Namespaces } from "@reco-m/comment-models";

export namespace OrderEvaluate {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        evaluateTagClassCode: string;
        bindTable: any;
        title?: any;
        cancel: () => void;
        success: () => void;
        bindTableValue?: any;
    }

    export interface IState extends ViewComponent.IState, evaluateModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.evaluate;

        componentDidMount(): void {
            this.dispatch({ type: `initPage`, evaluateTagClassCode: this.props.evaluateTagClassCode });
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "init" });
        }

        // 匿名处理
        nickNameHandle(currentUser: any, IsAnonymous: any) {
            let Inputer = "",
                nickName = currentUser.nickName || currentUser.LoginName;

            if (IsAnonymous) {
                if (nickName && nickName.length > 1) {
                    Inputer = nickName.substr(0, 1) + "****" + nickName.substr(nickName.length - 1, 1);
                } else if (nickName && nickName.length === 1) {
                    Inputer = nickName + "*";
                } else {
                    Inputer = "网站会员";
                }
            } else {
                Inputer = nickName;
            }
            return Inputer;
        }

        check() {
            const { state } = this.props;

            const content = state!.content,
                { required, composeControl, ValidatorControl } = Validators;

            return ValidatorControl(composeControl([required], { value: content, name: "评论内容" }));
        }

        submit() {
            const { state } = this.props,
                content = state!.content,
                selectTags = state!.selectTags || [],
                { title, bindTable, bindTableValue } = this.props;

            if (!content && !selectTags.length) {
                Toast.info("请评价标签或填写评论!");
                return;
            }

            this.dispatch({
                type: `evaluateAction`,
                title,
                bindTable,
                bindTableValue,
                callback: e => {
                    Toast.success(e);
                    this.props.success();
                }
            });
        }

        onHandleRate(rating: any) {
            this.dispatch({ type: "input", data: { satisfaction: rating.rating, selectTags: [] } });
        }
        renderTags(): React.ReactNode {
            const { state } = this.props,
            satisfaction = state!.satisfaction,
            evaluateTags: any[] = state!.evaluateTags || [],
            tag = evaluateTags.find(x => x.tagValue === satisfaction + "" && x.layer === 0),
            tags = tag ? evaluateTags.filter(s => s.parentId === tag.id) : [],
            selectTags: any[] = state!.selectTags ? [...state!.selectTags] : [];

            return tags.map((s, i) => (
                <div
                    key={i}
                    className={"tag-item" + (selectTags.findIndex(x => x.id === s.id) > -1 ? " active" : "")}
                    onClick={() => {
                        const tag = selectTags.find(x => x.id === s.id);

                        if (tag) {
                            selectTags.remove(tag);
                        } else {
                            selectTags.push(s);
                        }

                        this.dispatch({ type: "input" }, { selectTags, t: new Date() });
                    }}
                >
                    <span>{s.tagName}</span>
                </div>
            ))
        }
        render(): React.ReactNode {
            const { state } = this.props,
                content = state!.content,
                satisfaction = state!.satisfaction;
            return (
                <Modal
                    className="apply-modal"
                    title={this.props.title || "评价"}
                    visible={true}
                    transparent
                    maskClosable={false}
                    onClose={this.props.cancel}
                    footer={[
                        { text: "取消", onPress: this.props.cancel },
                        {
                            text: "确定",
                            onPress: this.submit.bind(this)
                        }
                    ]}
                >
                    <div className="am-modal-propmt-content modal-activity-sign">
                        <div className="bd">
                            <div className="apply-modal-tips gray-three-color">请对我们的服务做出评价</div>
                            <div className="sheet-ray size-26">
                                <Rater total={5} rating={satisfaction} onRate={this.onHandleRate.bind(this)} />
                            </div>
                            <Flex className="apply-modal-tag" wrap="wrap">
                                {this.renderTags()}
                            </Flex>

                            <TextareaItem
                                value={content}
                                placeholder="填写更多评价"
                                data-seed="logId"
                                name="content"
                                rows={3}
                                autoHeight
                                onChange={e => {
                                    this.dispatch({ type: "input", data: { content: e } });
                                }}
                            />
                            <Checkbox.CheckboxItem
                                className="checkbox-small"
                                data-seed="logId"
                                onChange={e => this.dispatch({ type: "input", data: { IsAnonymous: e.target.checked } })}
                            ><span className="size-15 gray-three-color">匿名评价</span>
                    </Checkbox.CheckboxItem>
                        </div>
                    </div>
                </Modal>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.evaluate]);
}
