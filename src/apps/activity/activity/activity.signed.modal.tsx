import React from "react";

import { Modal, WingBlank, Button, List, WhiteSpace, InputItem } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { Namespaces, ActivityModeEnum, activityDetailModel } from "@reco-m/activity-models";

export namespace ActivitySignedUpModal {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isOpen: () => boolean;
        close: () => void;
        confirmSelect: (data: any) => void;
    }

    export interface IState extends ViewComponent.IState, activityDetailModel.StateType {
        countDown: number;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.activityDetail;
        time;
        interval;

        getQueryString(name) {
            const result = location.href.match(new RegExp("[?&]" + name + "=([^&]+)", "i"));
            if (result == null || result.length < 1) return "";
            return result[1];
        }

        componentDidMount() {}

        protected clearInterval() {
            this.interval && clearInterval(this.interval);
            this.props.close();
        }

        /**
         * 签到
         */
        signIn(activityID: any) {
            this.dispatch({
                type: "activitySignIn",
                activityID: activityID,
                callback: () => {
                    this.dispatch({ type: "input", data: { isSignedSuccess: true } });
                    this.interval = setInterval(() => {
                        const { countDown } = this.state;

                        if (countDown > 0) this.setState({ countDown: countDown - 1 });
                        else this.clearInterval();
                    }, 1000);
                },
            });
        }

        /**
         * 渲染签到
         */
        renderSign(applyDetail, activityVM): React.ReactNode {
            return (
                <WingBlank>
                    <WhiteSpace size={"lg"} />
                    <WhiteSpace />
                    <div className="text-center color-black size-18">活动签到</div>
                    <WhiteSpace size={"lg"} />
                    <List className="authentication-list">
                        <InputItem labelNumber={3} placeholder="请输入" value={applyDetail && applyDetail.userName} editable={false}>
                            姓名
                        </InputItem>
                        <InputItem labelNumber={3} placeholder="请输入" value={applyDetail && applyDetail.mobile} editable={false}>
                            手机
                        </InputItem>
                    </List>
                    <Button
                        onClick={() => {
                            this.signIn(activityVM.id);
                        }}
                        className="radius-button"
                        type="primary"
                    >
                        一键签到
                    </Button>
                    <WhiteSpace size={"lg"} />
                </WingBlank>
            );
        }
        /**
         * 签到成功
         */
        renderSignedSuccess(activityVM, countDown): React.ReactNode {
            return (
                <div className="pay-content new">
                    <WingBlank>
                        <div className="pay-icon ">
                            <i className={"icon icon-duihao"} />
                        </div>
                        <WhiteSpace />
                        <div className="pay-state color-black">您已签到成功！</div>
                        <WhiteSpace />
                        {activityVM.activityModeValue === ActivityModeEnum.online ? <span>线上直播：{activityVM.address}</span> : <span>活动地点：{activityVM.address}</span>}
                        <WhiteSpace size={"lg"} />
                        <Button
                            onClick={() => {
                                this.props.close();
                            }}
                            className="radius-button"
                            type="primary"
                        >
                            {`${countDown}秒后自动关闭`}
                        </Button>
                    </WingBlank>
                    <WhiteSpace size={"lg"} />
                </div>
            );
        }
        setStopPropagetion() {
            if (this.props.isOpen()) {
                clearTimeout(this.time);
                this.time = setTimeout(() => {
                    $(".am-modal")
                        .on("touchstart", (e) => {
                            e.stopPropagation();
                        })
                        .on("touchend", (e) => {
                            e.stopPropagation();
                        })
                        .on("touchmove", (e) => {
                            e.stopPropagation();
                        });
                }, 500);
            }
        }
        render(): React.ReactNode {
            const { state } = this.props,
                isSignedSuccess = state!.isSignedSuccess,
                applyDetail = state!.applyDetail,
                activityDetail = state!.activityDetail;
            const { countDown } = this.state;
            const { activityVM = {} } = activityDetail || {};

            this.setStopPropagetion();
            return (
                <Modal
                    popup
                    style={{ height: isSignedSuccess ? 400 : "auto" }}
                    visible={this.props.isOpen()}
                    maskClosable={true}
                    animationType="slide-up"
                    className="radius-modal"
                    onClose={() => {
                        this.props.close();
                    }}
                >
                    {!isSignedSuccess ? this.renderSign(applyDetail, activityVM) : this.renderSignedSuccess(activityVM, countDown)}
                </Modal>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.activityDetail]);
}
