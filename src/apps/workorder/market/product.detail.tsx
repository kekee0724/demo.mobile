import React from "react";

import Swiper from "swiper/swiper-bundle.js";

import { List, WhiteSpace, Badge, Tabs, Carousel, Flex } from "antd-mobile-v2";

import { template, isAnonymous, getLocalStorage } from "@reco-m/core";

import { ViewComponent, ImageAuto, HtmlContent, share, gotoMap, Mobclick, NoData, getSharePicture, setEventWithLabel, shareType } from "@reco-m/core-ui";

import { Namespaces, productDetailModel, MarketTypeEnum } from "@reco-m/workorder-models";

import { callTel, htmlContentTreatWord } from "@reco-m/ipark-common";

import {Namespaces as iparkCommonNameSpace} from "@reco-m/ipark-common-models"

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { ProductDetailFooter } from "./product.detail.footer";

export namespace ProductDetail {
    let thirdShareconfig = false;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, productDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = true;
        headerContent = "产品详情";
        bodyClass = "oldForm";
        namespace = Namespaces.productDetail;
        id: any;
        swiper: any;

        componentDidMount() {
            this.id = this.props.match!.params.productId;
            this.dispatch({ type: `initPage`, id: this.id });
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            nextProps.location !== this.props.location &&
                this.dispatch({
                    type: "getProductDetail",
                    id: this.id,
                });
        }
        apply() {
            const { state } = this.props,
                detail = state!.detail,
                marketDetail = state!.marketDetail;
            let FWLBval = "";
            marketDetail &&
                marketDetail.serviceInstitutionCategoryDetailVMList &&
                marketDetail &&
                marketDetail.serviceInstitutionCategoryDetailVMList.forEach((item, index) => {
                    if (index < marketDetail.serviceInstitutionCategoryDetailVMList.length - 1) {
                        FWLBval = FWLBval + item.serviceCategory + ",";
                    } else {
                        FWLBval = FWLBval + item.serviceCategory;
                    }
                });

            this.goTo(
                `create/fuwcp?principalUserId=${
                    detail && detail.serviceProductBasicFormVM && detail.serviceProductBasicFormVM.handlerId
                }&bindTableName=bi_service_product&bindTableId=${detail && detail.contactPersonalCommonVM && detail.contactPersonalCommonVM.bindTableId}&SSCP=${encodeURI(
                    detail && detail.serviceProductBasicFormVM && detail.serviceProductBasicFormVM.serviceName
                )}&FWLB=${encodeURI(FWLBval)}`
            );
        }

        /**
         * 分享
         */
        share() {
            if (isAnonymous()) {
                this.goTo("/login");
                return;
            }

            const { state } = this.props,
                detail = state!.detail,
                singlePicture = state!.singlePicture;

            const contentHTML = detail && detail.serviceProductBasicFormVM && detail.serviceProductBasicFormVM.productIntroduce;
            let articleContent = htmlContentTreatWord(contentHTML),
                sharearticleDetailContent = articleContent && articleContent ? articleContent.substring(0, 40) : "";

            setEventWithLabel(statisticsEvent.productDetailShare);
            let result = share(
                (detail && detail.serviceProductBasicFormVM && detail.serviceProductBasicFormVM.serviceName) || "",
                sharearticleDetailContent,
                getSharePicture(singlePicture && singlePicture.filePath, contentHTML, client.thirdshareLogo),
                window.location.href + `?parkId=${getLocalStorage("parkId")}`
            );

            result!.then((data) => {
                this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                data === shareType.qq
                    ? setEventWithLabel(statisticsEvent.productDetailQQShare)
                    : data === shareType.weixin
                    ? setEventWithLabel(statisticsEvent.productDetailWeChatShare)
                    : data === shareType.weibo
                    ? setEventWithLabel(statisticsEvent.productDetailWeiboShare)
                    : data === shareType.qqspace && setEventWithLabel(statisticsEvent.productDetailSpaceShare);
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
        renderLabel(policyDetails: any): React.ReactNode {
            return policyDetails.length > 0 && (
                        <List>
                            <List.Item>标签信息</List.Item>
                            <List.Item>
                                {policyDetails.map((tag, k) => {
                                    return <Badge key={k} className="policyBadge" text={tag} />;
                                })}
                            </List.Item>
                        </List>
                    );
        }

        renderPictureScroll(): React.ReactNode {
            let { state } = this.props;
            const pictures = state!.pictures;

            return (
                pictures &&
                pictures.length > 0 && (
                    <Carousel dots autoplay infinite className="productDetailPic" style={{ width: "auto", borderRadius: "6px" }}>
                        {pictures.map((item, i) => {
                            return (
                                <div key={i}>
                                    <ImageAuto.Component cutWidth="385" cutHeight="233" height="calc(56.25vw)" src={item.filePath} />
                                </div>
                            );
                        })}
                    </Carousel>
                )
            );
        }

        renderMarketDetailTopView(detail: any): React.ReactNode {
            let { serviceProductBasicFormVM: product = {} } = detail;
            return (
                detail && (
                    <List className="border-none">
                        <List.Item className="service-style-song" align="top" multipleLine>
                            {this.renderPictureScroll()}
                            <div className="size-20">{product.serviceName && product.serviceName === undefined ? "" : product.serviceName}</div>
                            <div className="size-14">
                                {product.chargeModeValue === `${MarketTypeEnum.chargFree}` ? (
                                    <span className="highlight-color">免费</span>
                                ) : product.chargeModeValue === `${MarketTypeEnum.chargDiscuss}` ? (
                                    <span className="highlight-color">面议</span>
                                ) : product.chargeUnit ? (
                                    <div>
                                        <span className="highlight-color size-20">{`${product.chargeMinPrice}-${product.chargeMaxPrice}`}</span>&nbsp;&nbsp;
                                        {`${product.chargeUnit}`}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                            <Flex className="gray-three-color size-12">
                                <Flex.Item>
                                    <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{product.serviceObject}</div>
                                </Flex.Item>
                                <div>{product.applyNumber ? (product.applyNumber >= 1000 ? "999+" : product.applyNumber) : 0}人申请</div>
                            </Flex>
                        </List.Item>
                    </List>
                )
            );
        }

        renderMarketDetailContactView(detail: any): React.ReactNode {
            let { contactPersonalCommonVM: product = {} } = detail;
            return (
                <List renderHeader="联系信息" className="border-none">
                    <List.Item>
                        <div className="size-14 pv3">
                            <span className="gray-three-color mr30">联系人</span>
                            <span>{product && product.fullName}</span>
                        </div>
                        <div className="size-14 pv3">
                            <span className="gray-three-color mr15">联系电话</span>
                            <a onClick={() => callTel(product.mobile)}>{product.mobile}</a>
                        </div>
                        <div className="size-14 pv3">
                            <span className="gray-three-color mr15">电子邮箱</span>
                            <span>{product.email}</span>
                        </div>
                    </List.Item>
                </List>
            );
        }

        renderMarketDetailSummaryView(marketDetail: any): React.ReactNode {
            return (
                <div className="bd">
                    <HtmlContent.Component
                        className="html-details"
                        html={marketDetail.serviceInstitutionBasicFormVM.detail.replace(/href=\"\/\//g, 'href="http://').replace(/src=\"\/\//g, 'src=" http://')}
                    />
                </div>
            );
        }

        renderProductDetailSummaryView(detail: any): React.ReactNode {
            let { serviceProductBasicFormVM: product = {} } = detail;
            return (
                <div className="bd">
                    <HtmlContent.Component
                        className="html-details"
                        html={product.productIntroduce && product.productIntroduce.replace(/href=\"\/\//g, 'href="http://').replace(/src=\"\/\//g, 'src=" http://')}
                    />
                </div>
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

        renderOneItemContent(item: any): React.ReactNode {
            return (
                <>
                    <div className="omit omit-1  flex-service-clim">{item.productName}</div>
                    <div className="color-orange click-color-orange">
                        {item.serviceCatalogueNames &&
                            item.serviceCatalogueNames.split(",").map((item, i) => {
                                return <Badge text={item} key={i} className="badge-box" />;
                            })}
                    </div>
                    <div className="gray-three-color size-14 margin-top-xs flex-service-sub">
                        <div className="omit omit-1 margin-right-sm">
                            {item.ChargeMode === MarketTypeEnum.chargFree ? "免费" : item.ChargeMode === MarketTypeEnum.chargDiscuss ? "面议" : `${item.minPrice}-${item.maxPrice}${item.PriceUnit}`}
                        </div>
                    </div>
                </>
            );
        }

        renderTabChange(): React.ReactNode {
            const { state } = this.props,
                detail = state!.detail,
                marketDetail = state!.marketDetail;
            const tabs = [{ title: "产品详情" }, { title: "机构信息" }];

            return (
                <div style={{ backgroundColor: "white" }}>
                    <Tabs
                        tabs={tabs}
                        initialPage={0}
                        swipeable={false}
                        onChange={(e) => {
                            if (e.title === "机构信息") setEventWithLabel(statisticsEvent.productView);
                        }}
                    >
                        <div>
                            <div className="padding-h">{detail && detail.summary !== "" ? this.renderProductDetailSummaryView(detail) : <NoData.Component />}</div>
                        </div>
                        <div>
                            <div className="padding-h">
                                {marketDetail && marketDetail.serviceInstitutionBasicFormVM && marketDetail.serviceInstitutionBasicFormVM.detail !== "" ? (
                                    this.renderMarketDetailSummaryView(marketDetail)
                                ) : (
                                    <NoData.Component />
                                )}
                            </div>
                        </div>
                    </Tabs>
                </div>
            );
        }
        setThirdShare() {
            const { state } = this.props,
                detail = state!.detail,
                singlePicture = state!.singlePicture;

            if (detail && singlePicture && !thirdShareconfig) {
                const contentHTML = detail && detail.serviceProductBasicFormVM && detail.serviceProductBasicFormVM.productIntroduce;
                let articleContent = htmlContentTreatWord(contentHTML),
                    sharearticleDetailContent = articleContent ? articleContent.substring(0, 40) : "";
                thirdShareconfig = true;
                this.dispatch({
                    type: `${iparkCommonNameSpace.wechat}/thirdShare`,
                    title: detail && detail.serviceProductBasicFormVM && detail.serviceProductBasicFormVM.serviceName,
                    img: getSharePicture(singlePicture.filePath, contentHTML, client.thirdshareLogo),
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
                    <>
                        {detail && this.renderMarketDetailTopView(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {detail && this.renderMarketDetailContactView(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderTabChange()}
                    </>
                )
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                detail = state!.detail,
                companyprops = {
                    apply: () => this.apply(),
                    detail: detail && detail,
                };
            return <div>{this.renderEmbeddedView(ProductDetailFooter.Page as any, companyprops)}</div>;
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
            return this.renderMarketDetailView();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.productDetail]);
}
