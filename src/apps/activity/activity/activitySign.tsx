import React from "react";

import { Button, Toast } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { Namespaces, ActivityTypeEnum, ReviewTypeEnum, activityDetailModel } from "@reco-m/activity-models";

import { ActivitySigned } from "./activity.signed";
export namespace ActivitySign {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isRegisted?: any;
        activityDetailData?: any;
        currentUser?: any;
    }

    export interface IState extends ViewComponent.IState, activityDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.activityDetail;

        signUpSuccess(e: any) {
            e &&
                Toast.success("提交成功!", 1, () => {
                    this.goTo("sresult");
                });

            this.dispatch({ type: "activityDetail/getActivityDetail", data: this.props.match!.params.id });
        }

        renderSignUp(activityVM): React.ReactNode {
            // 已经报名 && 活动报名中
            if (activityVM.applyExamineStatus === ReviewTypeEnum.reviewNotPass && activityVM.isApply && activityVM.isApplyAudit) {
                return <Button disabled>您已经报名(审核退回)</Button>;
            } else if (activityVM.applyExamineStatus === ReviewTypeEnum.toBeReview && activityVM.isApply && activityVM.isApplyAudit) {
                return <Button disabled>您已经报名(待审核)</Button>;
            } else {
                return <Button disabled>您已经报名</Button>;
            }
        }
        renderOnGoing(activityVM, isRegisted, activityDetailData): React.ReactNode {
            if (activityVM.applyExamineStatus === ReviewTypeEnum.reviewNotPass && activityVM.isApply && activityVM.isApplyAudit) {
                return <Button disabled>您已经报名(审核退回)</Button>;
            } else if (activityVM.applyExamineStatus === ReviewTypeEnum.toBeReview && activityVM.isApply && activityVM.isApplyAudit) {
                return <Button disabled>您已经报名(待审核)</Button>;
            } else {
                return this.renderEmbeddedView(ActivitySigned.Page as any, {
                    isRegisted: isRegisted,
                    activityDetailData: activityDetailData,
                });
            }
        }
        renderNoSign(): React.ReactNode {
            return (
                <Button
                    type={"primary"}
                    onClick={() => {
                        this.goTo("sign");
                    }}
                >
                    立即报名
                </Button>
            );
        }
        renderRegisterState(isRegisted: any, activityDetailData: any): React.ReactNode {
            const { activityVM = {} } = activityDetailData || {};

            if (isRegisted && activityVM.status === ActivityTypeEnum.signUp) {
                return this.renderSignUp(activityVM);
            } else if (isRegisted && activityVM.status === ActivityTypeEnum.onGoing) {

                return this.renderOnGoing(activityVM, isRegisted, activityDetailData);
            } else if (!isRegisted) {
                return this.renderNoSign();
            } else {
                return null;
            }
        }

        renderRegisterButton(isRegisted: any, activityDetailData: any, _userId?: string): React.ReactNode {
            return <span>{this.renderRegisterState(isRegisted, activityDetailData)}</span>;
        }

        render(): React.ReactNode {
            const { isRegisted, activityDetailData } = this.props;
            return <span>{this.renderRegisterButton(isRegisted, activityDetailData)}</span>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.activityDetail]);
}
