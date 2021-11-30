import React from "react";
import "react-rater/lib/react-rater.css";
import { List, InputItem, Flex, Button, Toast, Modal } from "antd-mobile-v2";
import { template, Validators } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";
import { Namespaces, marketInDetailModel } from "@reco-m/workorder-models";
import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace MarketInDetailModify {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, marketInDetailModel.StateType {
        show?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.marketInDetail;
        bodyClass = "tabs-auto";
        scrollable = true;
        submitPage: any;
        swiper: any;
        pcadd: any;

        json: any = {};

        componentDidMount() {
            setEventWithLabel(statisticsEvent.marketInBrowse);
            this.dispatch({
                type: "marketInModifyInit",
                callback: (personCommon) => {
                    this.loadAttach(personCommon.bindTableId);
                },
                errorcall: () => {
                    Toast.fail("机构信息不存在", 1, () => this.goBack());
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            if (nextProps.location !== this.props.location) {
                this.dispatch({
                    type: "getMarketInInit",
                    callback: (personCommon) => {
                        this.loadAttach(personCommon.bindTableId);
                    },
                    errorcall: () => {
                        Toast.fail("机构信息不存在", 1, () => this.goBack());
                    },
                });
            }
        }

        renderHeaderContent(): React.ReactNode {
            return "联系信息";
        }

        renderInputItem(placeholder: string, type: any, name: string, value: string, must?: Boolean): React.ReactNode {
            return (
                <InputItem
                    placeholder={`请输入${placeholder}`}
                    type={type}
                    value={value}
                    onChange={(e) =>
                        this.dispatch({
                            type: "input",
                            data: {
                                [name]: e,
                                isEdit: true,
                            },
                        })
                    }
                >
                    {placeholder}
                    {must && <span className="color-red">*</span>}
                </InputItem>
            );
        }

        renderBasicInfo(): React.ReactNode {
            const { state } = this.props;
            return (
                <List className="my-list invoice">
                    {this.renderInputItem("联系人", "text", "contactPerson", state!.contactPerson || "", true) || null}
                    {this.renderInputItem("手机号码", "number", "mobile", state!.mobile || "", true) || null}

                </List>
            );
        }

        /**
         * 表单部分
         */
        renderForm(): React.ReactNode {
            return <div>{this.renderBasicInfo()}</div>;
        }

        refScroll(el) {
            $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $("#nav_box_Shadow").css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
            });
        }

        renderBody(): React.ReactNode {
            return <div className="container-fill container-scrollable">{this.renderForm()}</div>;
        }

        // 验证
        check() {
            const { state } = this.props,
                { cellphone, required, composeControl, ValidatorControl } = Validators;
            return ValidatorControl(
                composeControl([required], { value: state!.contactPerson, name: "联系人" }),
                composeControl([required, cellphone], { value: state!.mobile, name: "手机号码" }),
            );
        }

        resubmit() {
            const msg = this.check()!();

            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            Modal.alert("操作提示", <div style={{ textAlign: "left", fontSize: "14px" }}>联系人信息变更后，将发送短信至新联系人，是否确认？</div>, [
                {
                    text: "取消",
                    onPress: () => {
                        return;
                    },
                },
                {
                    text: "确认",
                    onPress: () => {
                        this.dispatch({
                            type: "modifyContact",
                            callback: (id) => {
                                this.saveAttach(id);
                                Toast.success("提交成功", 3, this.goBack.bind(this));
                            },
                        });
                    },
                },
            ]);
        }

        renderFooter(): React.ReactNode {
            return <Flex className="flex-collapse">
            <Flex.Item>
                <Button type="primary" onClick={() => this.resubmit()}>
                    保存
                </Button>
            </Flex.Item>
        </Flex>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.marketInDetail]);
}
