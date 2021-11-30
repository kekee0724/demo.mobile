import React from "react";

import Swiper from "swiper/swiper-bundle.js";

import { List, WhiteSpace, Badge, Tabs, Popover, Flex, Tag } from "antd-mobile-v2";

import { template, isAnonymous } from "@reco-m/core";

import { ViewComponent, ImageAuto, HtmlContent, share, gotoMap, Mobclick, getSharePicture, setEventWithLabel, shareType, NoData } from "@reco-m/core-ui";

import { marketDetailModel, Namespaces, MarketTypeEnum } from "@reco-m/workorder-models";

import { PicturePreview } from "@reco-m/workorder-common";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { callTel, htmlContentTreatWord } from "@reco-m/ipark-common";

import {Namespaces as iparkCommonNameSpace} from "@reco-m/ipark-common-models"
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { MarketDetailFooter } from "./market.detail.footer";

export namespace MarketDetail {
    let thirdShareconfig = false;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, marketDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = true;
        headerContent = "机构详情";
        bodyClass = "oldForm";
        namespace = Namespaces.marketDetail;
        id: any;
        swiper: any;

        componentDidMount() {
            this.id = this.props.match!.params.id;

            this.dispatch({ type: `initPage`, data: { id: this.id } });
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            nextProps.location!.pathname!.indexOf("productdetail") === -1 &&
                nextProps.location !== this.props.location &&
                this.dispatch({
                    type: "getMarketDetail",
                    data: this.id,
                });
        }

        apply() {
            const { state } = this.props,
                detail = state!.detail;

            if (isAnonymous()) {
                this.goTo("/login");
                return;
            }

            const val = detail && detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.institutionName;
            let FWLBval = "",
                FWLBValue = "";
            detail &&
                detail.serviceInstitutionCategoryDetailVMList &&
                detail &&
                detail.serviceInstitutionCategoryDetailVMList.forEach((item, index) => {
                    if (index < detail.serviceInstitutionCategoryDetailVMList.length - 1) {
                        FWLBval = FWLBval + item.serviceCategory + ",";
                        FWLBValue = FWLBValue + item.serviceCategoryValue + ",";
                    } else {
                        FWLBval = FWLBval + item.serviceCategory;
                        FWLBValue = FWLBValue + item.serviceCategoryValue;
                    }
                });

            this.goTo(
                `create/fuwsl?principalUserId=${
                    detail && detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.handlerId
                }&bindTableName=bi_service_institution&bindTableId=${detail && detail.contactPersonalCommonVM && detail.contactPersonalCommonVM.bindTableId}&SSJG=${encodeURI(
                    val
                )}&FWLB=${encodeURI(FWLBval)}&FWLBValue=${encodeURI(FWLBValue)}`
            );
        }

        /**
         * 分享
         */
        share() {
            const { state } = this.props,
                detail = state!.detail;

            const contentHTML = detail && detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.detail;
            const pictureUrlList = (detail && detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.pictureUrlList) || [];
            let articleContent = htmlContentTreatWord(contentHTML),
                sharearticleDetailContent = articleContent ? articleContent.substring(0, 40) : "";
            setEventWithLabel(statisticsEvent.marketDetailShare);
            let result = share(
                detail.serviceInstitutionBasicFormVM.institutionName,
                sharearticleDetailContent,
                getSharePicture(pictureUrlList[0], contentHTML, client.thirdshareLogo),
                window.location.href
            );

            result!.then((data) => {
                this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                data === shareType.qq
                    ? setEventWithLabel(statisticsEvent.marketDetailQQShare)
                    : data === shareType.weixin
                    ? setEventWithLabel(statisticsEvent.marketDetailWeChatShare)
                    : data === shareType.weibo
                    ? setEventWithLabel(statisticsEvent.marketDetailWeiboShare)
                    : data === shareType.qqspace && setEventWithLabel(statisticsEvent.marketDetailSpaceShare);
            });

            Mobclick().onEventWithLabel("thirdshare", "第三方分享");
        }

        /**
         * 去地图
         */
        goMap(address: string, OrganizationName: string) {
            address && gotoMap(OrganizationName, address);
        }

        renderHeaderRight(): React.ReactNode {
            return window.location.href.indexOf("IPark_Share") > -1 ? null : <i className="icon icon-share" onClick={() => this.share()} />;
        }
        // 标签
        renderLabelPop(policyDetails: any): React.ReactNode {
            const { state } = this.props,
                tagShow = state!.tagShow;
            return (
                <Popover
                    visible={tagShow}
                    placement="bottomLeft"
                    overlay={
                        <div className="padding-sm container-scrollable">
                            <Flex align={"center"} className="margin-bottom-xs">
                                <Flex.Item>
                                    {policyDetails.length > 0 &&
                                        policyDetails.slice(2).map((tag, index) => {
                                            return (
                                                <Tag key={index} small className="margin-right-xs tag-big mt10">
                                                    {tag.serviceCategory}
                                                </Tag>
                                            );
                                        })}
                                </Flex.Item>
                            </Flex>
                        </div>
                    }
                    onVisibleChange={() => this.dispatch({ type: "input", data: { tagShow: !tagShow } })}
                >
                    <span className={tagShow === true ? "pull-up on" : "pull-up"}>
                        <i className="icon icon-xia size-12" />
                    </span>
                </Popover>
            );
        }
        renderLabel(policyDetails: any): React.ReactNode {
            return (
                <span>
                    {policyDetails && policyDetails.length > 2 ? this.renderLabelPop(policyDetails) : ""}
                    <div className="pull-left">
                        {policyDetails &&
                            policyDetails.length > 0 &&
                            policyDetails.map((_, k) => {
                                return (
                                    <span key={k}>
                                        {k > 1 ? (
                                            ""
                                        ) : (
                                            <Tag small className="margin-right-xs tag-big margin-bottom-xs">
                                                {policyDetails[k].serviceCategory}
                                            </Tag>
                                        )}
                                    </span>
                                );
                            })}
                    </div>
                </span>
            );
        }

        renderMarketDetailTopView(detail: any): React.ReactNode {
            let picurl = detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.pictureUrlList && detail.serviceInstitutionBasicFormVM.pictureUrlList[0];
            return (
                detail && (
                    <List>
                        <List.Item
                            className="service-style-song"
                            align="top"
                            thumb={<ImageAuto.Component cutWidth="104" cutHeight="91" src={picurl ? picurl : ""} width="25vw" height="22vw" radius="8px" className="margin-v" />}
                            multipleLine
                        >
                            <div className="size-18">{detail.serviceInstitutionBasicFormVM.institutionName}</div>
                            {this.renderLabel(detail.serviceInstitutionCategoryDetailVMList)}
                        </List.Item>
                    </List>
                )
            );
        }

        renderMarketDetailContactView(detail: any): React.ReactNode {
            return (
                <List renderHeader="联系信息" className="border-none">
                    <List.Item wrap className="break-all">
                        <div className="size-14 pv3">
                            <span className="gray-three-color mr30">联系人</span>
                            <span className="gray-one-color">{detail.contactPersonalCommonVM.fullName}</span>
                        </div>
                        <div className="size-14 pv3">
                            <span className="gray-three-color mr15">联系电话</span>
                            <a onClick={() => callTel(detail.contactPersonalCommonVM.mobile)}>{detail.contactPersonalCommonVM.mobile}</a>
                        </div>
                        <div
                            className="size-14 pv3"
                            onClick={() => {
                                this.goMap(detail.contactPersonalCommonVM.address, detail.serviceInstitutionBasicFormVM.institutionName);
                            }}
                        >
                            <span className="gray-three-color mr15">公司地址</span>
                            <a>{detail.contactPersonalCommonVM.address}</a>
                        </div>
                    </List.Item>
                </List>
            );
        }

        renderMarketDetailSummaryView(detail: any): React.ReactNode {
            return (
                <HtmlContent.Component
                    className="html-details padding-h"
                    html={
                        detail.serviceInstitutionBasicFormVM.detail &&
                        detail.serviceInstitutionBasicFormVM.detail.replace(/href=\"\/\//g, 'href="http://').replace(/src=\"\/\//g, 'src=" http://')
                    }
                />
            );
        }

        onImageClick(imgs: any, index: number) {
            if (imgs[0]) {
                this.dispatch({ type: "input", data: { openImg: true, imgs: imgs } });

                setTimeout(() => {
                    this.swiper = new Swiper(".swiper-container", {
                        initialSlide: index,
                        zoom: true,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        pagination: {
                            el: ".swiper-pagination",
                        },
                    });
                }, 100);
            }
        }

        renderImages(pic): React.ReactNode {
            return (
                pic &&
                pic.map((item, i) => {
                    return (
                        <div className="padding" key={i} onClick={() => this.onImageClick(pic, i)}>
                            <ImageAuto.Component cutWidth="384" cutHeight="233" key={i} radius="6px" src={item.filePath} />
                            <div className="padding-top-sm">{item.fileName && item.fileName.split(".png")[0].split(".jpg")[0]}</div>
                        </div>
                    );
                })
            );
        }

        renderOneItemContent(item: any): React.ReactNode {
            return (
                <>
                    <div className="omit omit-1  flex-service-clim">{item.serviceName}</div>
                    <div className="color-orange click-color-orange">
                        {item.serviceCategory &&
                            item.serviceCategory.split(",").map((item, i) => {
                                if (i < 3) {
                                    return <Badge text={item} key={i} className="badge-box" />;
                                }
                            })}
                    </div>
                    <div className="gray-three-color size-14 margin-top-xs flex-service-sub">
                        <div className="omit omit-1 margin-right-sm">
                            {+item.chargeModeValue === MarketTypeEnum.chargFree ? "免费" : +item.chargeModeValue === MarketTypeEnum.chargDiscuss ? "面议" : `${item.chargeMinPrice}-${item.chargeMaxPrice}${item.chargeUnit}`}
                        </div>
                    </div>
                </>
            );
        }

        renderProduct(prodcts): React.ReactNode {
            return (
                <List>
                    {prodcts.map((item, index) => {
                        let picurl = item.pictureUrlList && item.pictureUrlList[0];
                        return (
                            <List.Item
                                key={index}
                                onClick={() => {
                                    this.goTo(`productdetail/${item!.id}`);
                                }}
                                extra={<div />}
                                align="top"
                                thumb={<ImageAuto.Component cutWidth="124" cutHeight="91" src={picurl ? picurl : ""} width="30vw" height="22vw" radius="8px" />}
                                multipleLine
                            >
                                {this.renderOneItemContent(item)}
                            </List.Item>
                        );
                    })}
                </List>
            );
        }

        renderTabChange(): React.ReactNode {
            const { state } = this.props,
                pictureData = state!.pictureData,
                prodcts = state!.prodcts,
                detail = state!.detail;
            const tabs = [{ title: "机构详情" }, { title: "机构资质" }, { title: "服务产品" }];
            return (
                <div className="integral-tabs">
                    <Tabs
                        tabs={tabs}
                        initialPage={0}
                        swipeable={false}
                        onChange={(e) => {
                            if (e.title === "机构资质") setEventWithLabel(statisticsEvent.marketQualificationView);
                            else if (e.title === "服务产品") setEventWithLabel(statisticsEvent.marketProductView);
                        }}
                    >
                        <div>
                            {detail && detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.detail && detail.serviceInstitutionBasicFormVM.detail.length ? (
                                this.renderMarketDetailSummaryView(detail)
                            ) : (
                                <NoData.Component />
                            )}
                        </div>
                        <div>{pictureData && pictureData.length ? this.renderImages(pictureData) : <NoData.Component />}</div>
                        <div>{prodcts && prodcts.length ? this.renderProduct(prodcts) : <NoData.Component />}</div>
                    </Tabs>
                </div>
            );
        }
        setThirdShare() {
            const { state } = this.props,
                detail = state!.detail,
                pictures = state!.pictures || [];
            if (detail && pictures && pictures.length && !thirdShareconfig) {
                const contentHTML = detail && detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.detail;
                let articleContent = htmlContentTreatWord(contentHTML),
                    sharearticleDetailContent = articleContent ? articleContent.substring(0, 40) : "";
                thirdShareconfig = true;
                this.dispatch({
                    type: `${iparkCommonNameSpace.wechat}/thirdShare`,
                    title: detail.serviceInstitutionBasicFormVM.institutionName,
                    img: getSharePicture(pictures[0], contentHTML, client.thirdshareLogo),
                    desc: sharearticleDetailContent,
                    wx: wx,
                });
            }
        }
        renderMarketDetailView(): React.ReactNode {
            const { state } = this.props,
                detail = state!.detail;
            this.setThirdShare();

            return (
                detail && (
                    <div>
                        {this.renderMarketDetailTopView(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderMarketDetailContactView(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderTabChange()}
                    </div>
                )
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                detail = state!.detail,
                companyprops = {
                    apply: () => this.apply(),
                    detail: detail,
                };
            return <div>{this.renderEmbeddedView(MarketDetailFooter.Page as any, companyprops)}</div>;
        }

        refScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents(".container-page").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $(this)
                .parents(".container-page")
                .find("#nav_box_Shadow")
                .css({
                    background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                        top * 0.001 < 0.1 ? top * 0.001 : 0.1
                    }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                });
        }

        renderBody(): React.ReactNode {
            const { state } = this.props;
            return (
                <div>
                    {this.renderMarketDetailView()}
                    <PicturePreview.Component openImg={state!.openImg} imgs={state!.imgs || []} changeState={this.dispatch.bind(this)} />
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.marketDetail]);
}
