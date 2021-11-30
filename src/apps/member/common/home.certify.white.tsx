import React from "react";
import { Carousel, WingBlank } from "antd-mobile-v2";
import { template, isAnonymous } from "@reco-m/core";
import { ViewComponent, ImageAuto } from "@reco-m/core-ui";
import { Namespaces, CertifyStatusEnum, myCertifyModel } from "@reco-m/member-models";
import Swiper from "swiper/swiper-bundle.js";
export namespace HomeCertify {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, myCertifyModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.myCertify;
        swiper: any;
        slide: any;
        componentWillUnmount() {
            this.dispatch({ type: `input`, data: { member: null } });
        }
        componentDidMount() {
            this.isAuth() && this.dispatch({ type: `getMember` });
        }

        getCertifyStatusEnum(currentMember: any): React.ReactNode {
            if ((currentMember && currentMember.status === CertifyStatusEnum.nocertify) || !currentMember || !currentMember.id) {
                // 未认证
                return this.rendernoCertify();
            } else if (currentMember && currentMember.status === CertifyStatusEnum.noConfim) {
                // 待确认
                return this.renderCertifying();
            } else if (currentMember && currentMember.status === CertifyStatusEnum.allow) {
                // 已通过
                return this.renderCertify();
            } else if (currentMember && currentMember.status === CertifyStatusEnum.bounced) {
                // 已退回
                return this.rendernoCertify();
            }
            return null;
        }

        clickCertify() {
            const { state } = this.props,
                currentMember = state!.member;

            !currentMember || !currentMember.id
                ? this.goTo("certify")
                : currentMember.status === CertifyStatusEnum.nocertify
                ? this.goTo("certify")
                : this.goTo(`certifyDetail/${currentMember.id}`);
        }

        refSwiper() {
            !this.swiper &&
                (this.swiper = new Swiper(".swiper-container", {
                    direction: "vertical",
                    followFinger: false,
                    speed: 800,
                    mousewheel: true,
                    pagination: {
                        el: ".swiper-pagination",
                    },
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false,
                    },
                }));
        }

        // 已认证
        renderCertify(): React.ReactNode {
            this.swiper && this.swiper.autoplay.stop();
            $(".little-item").attr("style", "");
            this.swiper = null;
            return (
                <WingBlank>
                    <div className="blank10" />
                    <div className="little-banner">
                        <div className="little-item" onClick={() => this.goTo("impression")}>
                            <ImageAuto.Component height="86px" radius="6px" src="assets/images/white/renzbg2.png" />
                        </div>
                    </div>
                </WingBlank>
            );
        }
        // 待审核
        renderCertifying(): React.ReactNode {
            return (
                <WingBlank>
                    <Carousel className="little-banner" autoplay infinite cellSpacing={10} autoplayInterval={5000}>
                        <div className="little-item" onClick={() => this.clickCertify()}>
                            <ImageAuto.Component height="86px" radius="6px" src="assets/images/white/renzbg.png" />
                            <span style={{ marginBottom: "6px" }}>查看进度</span>
                        </div>
                        <div className="little-item" onClick={() => this.goTo("impression")}>
                            <ImageAuto.Component height="86px" radius="6px" src="assets/images/white/renzbg2.png" />
                        </div>
                    </Carousel>
                </WingBlank>
            );
        }
        // 未认证
        rendernoCertify(): React.ReactNode {
            return (
                <WingBlank>
                    <Carousel className="little-banner" autoplay infinite cellSpacing={10} autoplayInterval={5000}>
                        <div className="little-item" onClick={() => this.clickCertify()}>
                            <ImageAuto.Component height="86px" radius="6px" src="assets/images/white/renzbg.png" />
                            <span style={{ marginBottom: "6px" }}>马上认证</span>
                        </div>
                        <div className="little-item" onClick={() => this.goTo("impression")}>
                            <ImageAuto.Component height="86px" radius="6px" src="assets/images/white/renzbg2.png" />
                        </div>
                    </Carousel>
                </WingBlank>
            );
        }
        render(): React.ReactNode {
            let { state } = this.props,
                member = state!.member;

            return  (isAnonymous() ? this.renderCertify() : this.getCertifyStatusEnum(member)) ;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myCertify]);
}
