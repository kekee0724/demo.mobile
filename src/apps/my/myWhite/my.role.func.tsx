import React from "react";

import { WhiteSpace, Flex, Button, Badge, Modal } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, CertifyStatusEnum, myCertifyModel } from "@reco-m/member-models";
import { MemberTypeEnum } from "@reco-m/member-models";
import { MyMarketinStatusEnum } from "@reco-m/workorder-models";
import { MyApplyTabTypeEnum } from "@reco-m/workorder-models";
import { CertifyEnum } from "@reco-m/ipark-common";
import SwiperCore, { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
SwiperCore.use([Autoplay]);

export namespace MyRoleFuncPage {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, myCertifyModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.myCertify;
        swiper: any;

        componentMount() {
            if (this.isAuth()) {
                this.dispatch({ type: "getByUser" });
            }
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && nextProps.location!.pathname === "/my") {
                if (this.isAuth()) {
                    this.dispatch({ type: "getByUser" });
                }
            }
        }

        isVisitorCertify(permission: any) {
            for (let i = 0; i < permission.length; i++) {
                if (permission[i].id === CertifyEnum.businessAdmin || permission[i].id === CertifyEnum.admin) {
                    return true;
                }
            }
            return false;
        }

        getCertifyTitle(permission: any) {
            for (let i = 0; i < permission.length; i++) {
                if (permission[i].id === CertifyEnum.businessAdmin || permission[i].id === CertifyEnum.admin) {
                    return "管理员";
                }
            }
            return "员工";
        }

        isStaffCertify(permission: any) {
            for (let i = 0; i < permission.length; i++) {
                if (permission[i].id === CertifyEnum.companyStaff || permission[i].id === CertifyEnum.companyStaff) {
                    return true;
                }
            }
            return false;
        }

        isAdminCertify(permission: any) {
            for (let i = 0; i < permission.length; i++) {
                if (permission[i].id === CertifyEnum.admin) {
                    return true;
                }
            }
            return false;
        }

        clickCertify(currentMember: any) {
            !currentMember || !currentMember.id
                ? this.goTo("certify")
                : currentMember.status === CertifyStatusEnum.bounced || currentMember.status === CertifyStatusEnum.nocertify
                ? this.goTo("certify")
                : this.goTo(`certifyDetail/${currentMember.id}`);
        }
        rendeMarketService(): React.ReactNode {
            const { state } = this.props;
            let serviceCount = state!.serviceCount;

            let institution = state!.institution;
            const { serviceInstitutionBasicFormVM: insBasic = {}, contactPersonalCommonVM: perCommon = {} } = institution || {};
            return +insBasic.companyId && insBasic.status === MyMarketinStatusEnum.pass && insBasic.isConfirmed ? (
                <>
                    <Flex.Item
                        onClick={() => {
                            this.goTo(`marketserviceapply/0/0?code=fuwsl,fuwcp&institutionID=${perCommon && perCommon.bindTableId}`);
                        }}
                    >
                        {serviceCount ? (
                            <>
                                <Badge dot className="myRoleFuncBadge">
                                    <svg className="iconew size-24" aria-hidden="true">
                                        <use xlinkHref="#icon-myicon3"></use>
                                    </svg>
                                    <WhiteSpace size="sm" />
                                </Badge>
                                <div>服务受理</div>
                            </>
                        ) : (
                            <>
                                <svg className="iconew size-24" aria-hidden="true">
                                    <use xlinkHref="#icon-myicon3"></use>
                                </svg>
                                <WhiteSpace size="sm" />
                                <div>服务受理</div>
                            </>
                        )}
                    </Flex.Item>
                    <Flex.Item
                        onClick={() => {
                            this.goTo(`serviceProductList/${perCommon && perCommon.bindTableId}`);
                        }}
                    >
                        <svg className="iconew size-24" aria-hidden="true">
                            <use xlinkHref="#icon-myicon4"></use>
                        </svg>
                        <WhiteSpace size="sm" />
                        <div>产品发布</div>
                    </Flex.Item>
                </>
            ) : null;
        }
        marketinClick() {
            const { state } = this.props;
            let member = state!.member;

            let institution = state!.institution;
            const { serviceInstitutionBasicFormVM: insBasic = {} } = institution || {};
            if (insBasic.status === MyMarketinStatusEnum.wait || insBasic.status === MyMarketinStatusEnum.pass || insBasic.status === MyMarketinStatusEnum.bounced) {
                // 已提交表单
                this.goTo(`marketInDetail`);
            } else {
                Modal.alert(
                    "操作提示",
                    <div style={{ textAlign: "left", fontSize: "14px" }}>
                        是否关联您当前已认证的企业？
                        <div>关联后，认证企业的成立时间和联系人信息将自动带入，提交申请的机构信息将和企业绑定关系~</div>
                    </div>,
                    [
                        {
                            text: "不关联",
                            onPress: () => {
                                this.goTo("marketIn/0");
                            },
                        },
                        {
                            text: "关联",
                            onPress: () => {
                                this.goTo(`marketIn/${member.companyId}`);
                            },
                        },
                    ]
                );
            }
        }
        renderMarketin(): React.ReactNode {
            const { state } = this.props;

            let institution = state!.institution;
            const { serviceInstitutionBasicFormVM: insBasic = {} } = institution || {};
            return +insBasic.companyId ? (
                <Flex.Item
                    onClick={() => {
                        this.marketinClick();
                    }}
                >
                    <svg className="iconew size-24" aria-hidden="true">
                        <use xlinkHref="#icon-myicon7"></use>
                    </svg>
                    <WhiteSpace size="sm" />
                    <div>服务入驻</div>
                </Flex.Item>
            ) : null;
        }
        renderCompanyViewAdminItem() {
            const { state } = this.props;
            let member = state!.member,
                rzsqOrder = state!.rzsqOrder,
                staffManagerCount = state!.staffManagerCount,
                visitorCount = state!.visitorCount;
            return (
                <Flex className="my-nav mt12" wrap="wrap">
                    <Flex.Item
                        onClick={() => {
                            this.goTo(`staffmanager`);
                        }}
                    >
                        {staffManagerCount ? (
                            <>
                                <Badge dot className="myRoleFuncBadge">
                                    <svg className="iconew size-24" aria-hidden="true">
                                        <use xlinkHref="#icon-myicon5"></use>
                                    </svg>
                                    <WhiteSpace size="sm" />
                                </Badge>
                                <div>员工管理</div>
                            </>
                        ) : (
                            <>
                                <svg className="iconew size-24" aria-hidden="true">
                                    <use xlinkHref="#icon-myicon5"></use>
                                </svg>
                                <WhiteSpace size="sm" />
                                <div>员工管理</div>
                            </>
                        )}
                    </Flex.Item>
                    <Flex.Item
                        onClick={() => {
                            this.goTo(`visitor/${member.companyId}`);
                        }}
                    >
                        {visitorCount ? (
                            <>
                                <Badge dot className="myRoleFuncBadge">
                                    <svg className="iconew size-24" aria-hidden="true">
                                        <use xlinkHref="#icon-myicon6"></use>
                                    </svg>
                                    <WhiteSpace size="sm" />
                                </Badge>
                                <div>访客审核</div>
                            </>
                        ) : (
                            <>
                                <svg className="iconew size-24" aria-hidden="true">
                                    <use xlinkHref="#icon-myicon6"></use>
                                </svg>
                                <WhiteSpace size="sm" />
                                <div>访客审核</div>
                            </>
                        )}
                    </Flex.Item>
                    {this.rendeMarketService()}
                    <Flex.Item
                        onClick={() => {
                            this.goTo("contact");
                        }}
                    >
                        <svg className="iconew size-24" aria-hidden="true">
                            <use xlinkHref="#icon-tongxunlu1"></use>
                        </svg>
                        <WhiteSpace size="sm" />
                        <div>通讯录</div>
                    </Flex.Item>
                    <Flex.Item
                        onClick={() => {
                            this.goTo("busynessbill");
                        }}
                    >
                        <svg className="iconew size-24" aria-hidden="true">
                            <use xlinkHref="#icon-myicon7"></use>
                        </svg>
                        <WhiteSpace size="sm" />
                        <div>企业账单</div>
                    </Flex.Item>
                    <Flex.Item
                        onClick={() => {
                            rzsqOrder && rzsqOrder.checkOrderId && MyApplyTabTypeEnum.cancel !== rzsqOrder.checkStatus
                                ? this.goTo(`applyDetail/${rzsqOrder.checkOrderId}/${rzsqOrder.topicStatus}`)
                                : this.goTo("create/ruzsq");
                        }}
                    >
                        <svg className="iconew size-24" aria-hidden="true">
                            <use xlinkHref="#icon-shengqing"></use>
                        </svg>
                        <WhiteSpace size="sm" />
                        <div>入驻申请</div>
                    </Flex.Item>
                    {this.renderMarketin()}
                </Flex>
            );
        }
        renderCompanyViewAdmin(): React.ReactNode {
            const { state } = this.props;
            let member = state!.member;

            return (
                <div className="authenticate">
                    <div className="authenticate-wd">
                        <div className="size-16 gray-color">
                            <Flex>
                                <Flex.Item className="omit omit-1" style={{ lineHeight: 1.4 }} onClick={() => this.clickCertify(member)}>
                                    {member.companyName}
                                </Flex.Item>
                                <div className="authen-tag" onClick={() => this.clickCertify(member)}>
                                    <span>
                                        <em className="primary-color">{member.companyUserTypeName}</em>
                                    </span>
                                </div>
                            </Flex>
                        </div>
                        {this.renderCompanyViewAdminItem()}
                    </div>
                </div>
            );
        }
        renderCompanyViewStaff(): React.ReactNode {
            const { state } = this.props;
            let member = state!.member;
            return (
                <div className="authenticate">
                    <div className="authenticate-wd" style={{ backgroundImage: "url(assets/images/white/authen-bg3.png)" }}>
                        <div className="size-16 gray-color">
                            <Flex>
                                <Flex.Item className="omit omit-1" onClick={() => this.clickCertify(member)}>
                                    {member.companyName}
                                </Flex.Item>
                            </Flex>
                            <div className="authen-tag mt10" onClick={() => this.clickCertify(member)}>
                                <span>
                                    <em className="primary-color">{member.companyUserTypeName}</em>
                                </span>
                            </div>
                        </div>
                        <div className="authen-btn">
                            <Button
                                inline
                                onClick={() => {
                                    this.goTo("contact");
                                }}
                            >
                                查看企业通讯录
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
        renderCompanyView(): React.ReactNode {
            const { state } = this.props;
            let member = state!.member;
            if (member && member.status === CertifyStatusEnum.allow && member.companyUserTypeName === MemberTypeEnum.admin) {
                return this.renderCompanyViewAdmin();
            } else if (member && member.status === CertifyStatusEnum.allow) {
                return this.renderCompanyViewStaff();
            } else {
                return null;
            }
        }
        renderInstitutionView(): React.ReactNode {
            const { state } = this.props;
            let member = state!.member;
            let institution = state!.institution;
            let serviceCount = state!.serviceCount;
            const { serviceInstitutionBasicFormVM: insBasic = {}, contactPersonalCommonVM: perCommon = {} } = institution || {};

            return (
                member && (
                    <div className="authenticate">
                        <div className="authenticate-wd">
                            <div className="size-16 gray-color">
                                <Flex>
                                    <Flex.Item className="omit omit-1" style={{ lineHeight: 1.4 }}>
                                        {insBasic.institutionName}
                                    </Flex.Item>
                                </Flex>
                            </div>
                            <Flex className="my-nav mt12" wrap="wrap">
                                {insBasic.status === MyMarketinStatusEnum.pass && insBasic.isConfirmed  &&  (
                                    <Flex.Item
                                        onClick={() => {
                                            this.goTo(`marketserviceapply/0/0?code=fuwsl,fuwcp&institutionID=${perCommon && perCommon.bindTableId}`);
                                        }}
                                    >
                                        {serviceCount ? (
                                            <>
                                                <Badge dot className="myRoleFuncBadge">
                                                    <svg className="iconew size-24" aria-hidden="true">
                                                        <use xlinkHref="#icon-myicon3"></use>
                                                    </svg>
                                                    <WhiteSpace size="sm" />
                                                </Badge>
                                                <div>服务受理</div>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="iconew size-24" aria-hidden="true">
                                                    <use xlinkHref="#icon-myicon3"></use>
                                                </svg>
                                                <WhiteSpace size="sm" />
                                                <div>服务受理</div>
                                            </>
                                        )}
                                    </Flex.Item>
                                )}
                                {insBasic.status === MyMarketinStatusEnum.pass && insBasic.isConfirmed && (
                                    <Flex.Item
                                        onClick={() => {
                                            this.goTo(`serviceProductList/${perCommon && perCommon.bindTableId}`);
                                        }}
                                    >
                                        <svg className="iconew size-24" aria-hidden="true">
                                            <use xlinkHref="#icon-myicon4"></use>
                                        </svg>
                                        <WhiteSpace size="sm" />
                                        <div>产品发布</div>
                                    </Flex.Item>
                                )}
                                <Flex.Item
                                    onClick={() => {
                                        this.marketinClick();
                                    }}
                                >
                                    <svg className="iconew size-24" aria-hidden="true">
                                        <use xlinkHref="#icon-myicon7"></use>
                                    </svg>
                                    <WhiteSpace size="sm" />
                                    <div>服务入驻</div>
                                </Flex.Item>
                            </Flex>
                        </div>
                    </div>
                )
            );
        }
        render(): React.ReactNode {
            const { state } = this.props;
            let member = state!.member;
            let institution = state!.institution;

            const { serviceInstitutionBasicFormVM: insBasic = {} } = institution || {};


            if (
                !+insBasic.companyId && // 未关联公司  机构认证已经同归  认证管理员并通过
                ( insBasic.status === MyMarketinStatusEnum.pass || insBasic.status === MyMarketinStatusEnum.wait || insBasic.status === MyMarketinStatusEnum.bounced) &&
                member &&
                member.status === CertifyStatusEnum.allow &&
                member.companyUserTypeName === MemberTypeEnum.admin
            ) {
                return (
                    member &&
                    institution && (
                      <div className="my-swiper">
                        <Swiper pagination={{ clickable: true }}  slidesPerView={1} autoplay={{ delay: 5000 }}>
                          <SwiperSlide>{this.renderCompanyView()}</SwiperSlide>
                          <SwiperSlide>{this.renderInstitutionView()}</SwiperSlide>
                          <div className="swiper-pagination"></div>
                        </Swiper>
                      </div>
                    )
                );
            } else {
                return this.renderCompanyView();
            }
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.myCertify]);
}
