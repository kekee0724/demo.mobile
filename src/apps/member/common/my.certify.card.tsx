import React from "react";

import { Button } from "antd-mobile-v2";

import { template, isAnonymous } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, CertifyStatusEnum, myCertifyModel } from "@reco-m/member-models";
export namespace MyCertifyCard {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, myCertifyModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.myCertify;

        getCertifyStatusEnum(currentMember: any): React.ReactNode {
            if ((currentMember && currentMember.status === CertifyStatusEnum.nocertify) || !currentMember || !currentMember.id) {
                return this.renderCertificationImmediately();
            } else if (currentMember && currentMember.status === CertifyStatusEnum.noConfim) {
                return this.renderAudit();
            } else if (currentMember && currentMember.status === CertifyStatusEnum.allow) {
                return null;
            } else if (currentMember && currentMember.status === CertifyStatusEnum.bounced) {
                return this.renderBackAudit();
            } else {
                return null;
            }
        }

        clickCertify(currentMember: any) {
            !currentMember || !currentMember.id
                ? this.goTo("certify")
                : currentMember.status === CertifyStatusEnum.nocertify
                ? this.goTo("certify")
                : this.goTo(`certifyDetail/${currentMember.id}`);
        }
        // 未认证
        renderCertificationImmediately(): React.ReactNode {
            const { state } = this.props,
                member = state!.member;
            return (
                <div className="authenticate">
                    <div className="authenticate-wd" style={{ backgroundImage: "url(assets/images/white/authen-bg1.png)" }}>
                        <div className="size-16 gray-color">未认证</div>
                        <div className="size-12 gray-three-color margin-top-sm">完成会员认证，享受更全面的服务</div>
                        <div className="authen-btn">
                            <Button inline onClick={() => this.clickCertify(member)}>
                                立即认证
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
        // 待审核
        renderAudit(): React.ReactNode {
            const { state } = this.props,
                member = state!.member;
            return (
                <div className="authenticate">
                    <div className="authenticate-wd" style={{ backgroundImage: "url(assets/images/white/authen-bg2.png)" }}>
                        <div className="size-16 gray-color">待审核</div>
                        <div className="size-12 gray-three-color margin-top-sm">您的认证已提交，请耐心等候。</div>
                        <div className="authen-btn">
                            <Button inline onClick={() => this.clickCertify(member)}>
                                立即查看
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        // 已退回
        renderBackAudit(): React.ReactNode {
            const { state } = this.props,
                member = state!.member;
            return (
                <div className="authenticate">
                    <div className="authenticate-wd" style={{ backgroundImage: "url(assets/images/white/authen-bg3.png)" }}>
                        <div className="size-16 gray-color">已退回</div>
                        <div className="size-12 gray-three-color margin-top-sm">您的认证已退回，请重新提交。</div>
                        <div className="authen-btn">
                            <Button inline onClick={() => this.clickCertify(member)}>
                                立即查看
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
        render(): React.ReactNode {
            const { state } = this.props,
                member = state!.member;

            return isAnonymous() ? null : this.getCertifyStatusEnum(member);
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myCertify]);
}
