import React from "react";

import Rater from "react-rater";

import { List, WhiteSpace, TextareaItem, Checkbox, WingBlank, Button, Flex, Toast } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { evaluateModel, Namespaces } from "@reco-m/comment-models";

import "react-rater/lib/react-rater.css";

export namespace Evaluate {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, evaluateModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "评价";
        namespace = Namespaces.evaluate;

        componentDidMount(): void {
            let { evaluateTagClassCode } = this.props.location!.state;
            this.dispatch({ type: `initPage`, evaluateTagClassCode });
        }
        componentWillUnmount(): void {
            this.dispatch({ type: "init" });
        }
        check() {
            const { state } = this.props;

            const content = state!.content,
                { required, composeControl, ValidatorControl } = Validators;

            return ValidatorControl(composeControl([required], { value: content, name: "评论内容" }));
        }

        submit() {
            const msg = this.check()!();

            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }

            let { title, bindTable, bindTableValue } = this.props.location!.state;

            this.dispatch({
                type: `evaluateAction`,
                title,
                bindTable,
                bindTableValue,
                callback: (e) => {
                    Toast.success(e);
                    if (window.location.href.indexOf("Detail") !== -1 || window.location.href.indexOf("ticket_gdgl") !== -1) {
                        history.go(-2);
                    } else {
                        this.goBack();
                    }

                    window.location.href.indexOf("apply") !== -1 && setEventWithLabel(statisticsEvent.evaluationRepairOrder);
                    window.location.href.indexOf("order") !== -1 && setEventWithLabel(statisticsEvent.evaluatePendingOrders);
                },
            });
        }

        onHandleRate(rating: any) {
            this.dispatch({ type: "input", data: { satisfaction: rating.rating, selectTags: [] } });
        }
        renderTags(): React.ReactNode {
            const { state } = this.props,
                satisfaction = state!.satisfaction || 0,
                evaluateTags: any[] = state!.evaluateTags || [],
                tag = evaluateTags.find((x) => x.tagValue === satisfaction + "" && x.layer === 0),
                tags = tag ? evaluateTags.filter((s) => s.parentId === tag.id) : [],
                selectTags: any[] = state!.selectTags ? [...state!.selectTags] : [];
            return tags.map((s, i) => (
                <div
                    key={i}
                    className={"tag-item" + (selectTags.findIndex((x) => x.id === s.id) > -1 ? " active" : "")}
                    onClick={() => {
                        const tag = selectTags.find((x) => x.id === s.id);

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
            ));
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                content = state!.content,
                satisfaction = state!.satisfaction || 0;
            let { title } = this.props.location!.state;

            return (
                <>
                    <List>
                        <List.Item>{title}</List.Item>
                    </List>
                    <WhiteSpace />
                    <List className="evaluate-list">
                        <List.Item>
                            <Flex>
                                <span className="gray-two-color">满意度：</span>
                                <Flex.Item>
                                    <Rater total={5} rating={satisfaction} onRate={this.onHandleRate.bind(this)} />
                                </Flex.Item>
                            </Flex>
                            <Flex className="apply-modal-tag" wrap="wrap">
                                {this.renderTags()}
                            </Flex>
                        </List.Item>
                        <TextareaItem
                            value={content}
                            placeholder="写下您的评价吧"
                            data-seed="logId"
                            name="content"
                            rows={5}
                            autoHeight
                            onChange={(e) => {
                                this.dispatch({ type: "input", data: { content: e } });
                            }}
                        />
                        <div className="checkbox-right">
                            <Checkbox.CheckboxItem
                                className="checkbox-small"
                                data-seed="logId"
                                onChange={(e) => this.dispatch({ type: "input", data: { IsAnonymous: e.target.checked } })}
                            >
                                匿名评价
                            </Checkbox.CheckboxItem>
                        </div>
                    </List>
                    <WingBlank>
                        <WhiteSpace />
                        <Button type="primary" onClick={this.submit.bind(this)}>
                            确认提交
                        </Button>
                        <WhiteSpace />
                    </WingBlank>
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.evaluate]);
}
