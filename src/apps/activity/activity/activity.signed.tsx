import React from "react";

import { Button, Toast, Modal } from "antd-mobile-v2";

import { template, isAnonymous } from "@reco-m/core";

import { ViewComponent, setEventWithLabel, download, popstateHandler } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, SignTypeEnum, ActivityModeEnum, activityDetailModel } from "@reco-m/activity-models";

export namespace ActivitySigned {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isRegisted?: any;
        activityDetailData?: any;
        userId?: any;
        buttonType?: any;
    }

    export interface IState extends ViewComponent.IState, activityDetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.activityDetail;

        signInSuccess(e: any) {
            e && Toast.success(e, 1);
            this.dispatch({ type: "activityDetail/getActivityDetail", data: this.props.match!.params.id });
        }

        /**
         * 签到
         */
        signIn(activityID: any, _userId: any) {
            isAnonymous()
                ? this.goTo("login")
                : this.dispatch({
                    type: "activitySignIn",
                    activityID: activityID,
                    callback: e => {
                        this.signInSuccess(e);
                        setEventWithLabel(statisticsEvent.activitiesSignin);
                        this.onlineAlert(true);
                    }
                });
        }
        onlineAlert(isSign = false) {
            const { activityDetailData } = this.props;
            const { activityVM = {} } = activityDetailData || {} as any;

            if (activityVM.activityModeValue === ActivityModeEnum.online) {
                let modal = Modal.alert("温馨提示", <div>该活动为线上活动，您可点击下方链接进入：
                <span className={"primary-color"} onClick={() => {
                        if (!client.isBiParkApp) {
                            activityVM.address && (location.href = activityVM.address);
                        } else {
                            activityVM.address && download(activityVM.address)
                        }
                    }}>
                        {activityVM.address}
                    </span>
                </div>, [
                    {
                        text: "知道啦",
                        onPress: () => {
                            popstateHandler.removePopstateListener().then(() => {
                                if (activityVM.isApplyMarketing && isSign) {
                                    this.goTo("sresult");
                                }
                            });
                        }
                    }
                ]);
                popstateHandler.popstateListener(() => {
                    modal.close();
                })
            } else {
                if (activityVM.isApplyMarketing) {
                    this.goTo("sresult");
                }
            }
        }
        renderSignedState(activityVM): React.ReactNode {
            if (activityVM.activityModeValue === ActivityModeEnum.online) {
                return <Button type="primary" onClick={() => {
                    this.onlineAlert(true);
                }}> 立即查看</Button>
            } else {
                return <Button disabled> 已签到</Button>
            }
        }

        renderSignedButton(activityDetailData: any, userId?: string): React.ReactNode {

            const { activityVM = {} } = activityDetailData || {};

            return activityVM!.signInStatus === SignTypeEnum.signIn ? (
                this.renderSignedState(activityVM)
            ) : activityVM!.signInStatus === SignTypeEnum.waitSignIn ? (
                <Button type="primary" onClick={() => this.signIn(activityVM.id, userId)}>
                    立即签到
                </Button>
            ) : null;
        }

        render(): React.ReactNode {
            const { activityDetailData } = this.props;

            return <span>{this.renderSignedButton(activityDetailData)}</span>;
        }
    }

    export const Page = template(Component, state => state[Namespaces.activityDetail]);
}
