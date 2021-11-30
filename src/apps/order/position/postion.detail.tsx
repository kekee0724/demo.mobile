

import React from "react";

import { List, Flex, Button, Carousel, Badge, WhiteSpace } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";

import { FavoritesLink } from "@reco-m/favorites-common";

import { Namespaces, getResourceTitle, isPosition, isRoom, PriceUnitEnum, positiondetailModel, RoomTypeEnum, ResourceOrderTypeEnum } from "@reco-m/order-models";

import { CouponGet } from "@reco-m/coupon-common";

import { ViewComponent, ImageAuto, Container, androidExit, HtmlContent, share, Mobclick, setEventWithLabel, shareType, getSharePicture } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";
import { IParkBindTableNameEnum, callTel, ResourceTypeEnum, htmlContentTreatWord, htmlContentTreatFormat } from "@reco-m/ipark-common";
import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { PositionDetailComment } from "./postion.detail.comment";

export namespace PositionDetail {
    let thirdShareconfig = false;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, positiondetailModel.StateType {
        open?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = true;
        namespace = Namespaces.positiondetail;
        bodyClass = "oldForm";

        componentDidMount() {
            this.initPage();
        }

        componentReceiveProps(nextProps: IProps) {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.initPage();
            }
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "init" });
        }

        share() {
            const { state } = this.props,
                details = state!.roomdetail,
                detail = details && details.resource,
                pictureSrc = details && details.coverUrl,
                pictures = (details && details.imageUrl) || [],
                { resourceType } = this.props.match!.params;

            const contentHTML = detail.summary ? htmlContentTreatWord(detail.summary) : "",
                shareContent = contentHTML ? contentHTML.substring(0, 40) : "";

            Number(resourceType) === RoomTypeEnum.workingType ? setEventWithLabel(statisticsEvent.serviceStationShare) : setEventWithLabel(statisticsEvent.serviceAdvertisingShare);
            let result = share(
                `${getResourceTitle(resourceType)}详情`,
                shareContent,
                getSharePicture(pictureSrc && String(pictureSrc).indexOf("Assets") > -1 ? pictureSrc : pictures && pictures[0], contentHTML, client.thirdshareLogo),
                window.location.href + `?parkId=${getLocalStorage("parkId")}`
            );
            result!.then((data) => {
                this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                Number(resourceType) === RoomTypeEnum.workingType
                    ? data === shareType.qq
                        ? setEventWithLabel(statisticsEvent.serviceStationQQShare)
                        : data === shareType.weixin
                        ? setEventWithLabel(statisticsEvent.serviceStationWeChatShare)
                        : data === shareType.weibo
                        ? setEventWithLabel(statisticsEvent.serviceStationWeiboShare)
                        : data === shareType.qqspace && setEventWithLabel(statisticsEvent.serviceStationSpaceShare)
                    : data === shareType.qq
                    ? setEventWithLabel(statisticsEvent.serviceAdvertisingQQShare)
                    : data === shareType.weixin
                    ? setEventWithLabel(statisticsEvent.serviceAdvertisingWeChatShare)
                    : data === shareType.weibo
                    ? setEventWithLabel(statisticsEvent.serviceAdvertisingWeiboShare)
                    : data === shareType.qqspace && setEventWithLabel(statisticsEvent.serviceAdvertisingSpaceShare);
            });
            Mobclick().onEventWithLabel("thirdShare", "第三方分享");
        }

        initPage() {
            let { resourceType, detailid, roomid } = this.props.match!.params;
            this.dispatch({ type: `initPage`, data: { resourceType, detailid, roomid } });
        }

        renderPics(pictures): React.ReactNode {
            return pictures.map((item, i) => {
                return (
                    <div key={i}>
                        <ImageAuto.Component cutWidth="384" cutHeight="233" src={item} />
                    </div>
                );
            });
        }

        renderPictureScroll(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const pictures = (roomdetail && roomdetail.imageUrl) || [];
            return (
                pictures &&
                pictures.length > 0 && (
                    <Carousel dots autoplay infinite className="parkImpression" style={{ width: "auto" }}>
                        {pictures.map((item, i) => {
                            return (
                                <div key={i}>
                                    <ImageAuto.Component cutWidth="414" cutHeight="233" height="calc(56.25vw)" src={item} />
                                </div>
                            );
                        })}
                    </Carousel>
                )
            );
        }

        getPriceUnit(detail: any) {
            let resourceType = this.props.match!.params.resourceType;
            if (Number(resourceType) === ResourceTypeEnum.working) {
                return detail && (detail.price ? `${detail.price}${detail.priceUnit === +PriceUnitEnum.perDay ? "元/个/天" : "元/个/月"}` : "免费");
            } else if (Number(resourceType) === ResourceTypeEnum.advertisement) {
                return detail && (detail.price ? `${detail.price}${detail.priceUnit === +PriceUnitEnum.perDay ? "元/个/天" : "元/个/月"}` : "免费");
            }
        }

        renderResourceDetailContactView(detail: any): React.ReactNode {
            return (
                <List renderHeader="联系方式" className="border-none">
                    <List.Item
                        onClick={() => callTel(detail.contactMobile ? detail.contactMobile : "")}
                        arrow="horizontal"
                        extra={
                            <span className="size-16" style={{ color: "#02b8cd" }}>
                                <i className="icon icon-newpel size-14 margin-right-xs" />
                                {detail.contactMobile ? detail.contactMobile : ""}
                            </span>
                        }
                    >
                        {detail.contactPerson}
                    </List.Item>
                </List>
            );
        }

        renderSummaryView(detail: any): React.ReactNode {
            let resourceType = this.props.match!.params.resourceType;

            if (isPosition(resourceType) && detail.summary) {
                return (
                    <List renderHeader={`${getResourceTitle(resourceType)}详情`} className="border-none">
                        <List.Item>
                            <HtmlContent.Component className="html-details resource-color" html={detail.summary} />
                        </List.Item>
                    </List>
                );
            }
            return null;
        }

        renderResourceRoomDetailView(detail: any): React.ReactNode {
            let resourceType = this.props.match!.params.resourceType;
            if (isRoom(resourceType)) {
                return (
                    <List renderHeader={`${getResourceTitle(resourceType)}详情`} className="border-none">
                        <List.Item>
                            <HtmlContent.Component className="html-details resource-color" html={detail.summary} />
                        </List.Item>
                    </List>
                );
            }
            return null;
        }

        renderResourceRemarkView(detail: any): React.ReactNode {
            return (
                <List renderHeader={"预订须知"} className="border-none">
                    <List.Item>
                        <HtmlContent.Component className="html-details resource-color" html={htmlContentTreatFormat(detail.remarks)} />
                    </List.Item>
                </List>
            );
        }

        renderCouponSim(): React.ReactNode {
            let { state } = this.props;
            let couponData = state!.couponData;
            if (couponData && couponData.items) {
                return couponData.items.map((item, i) => {
                    if (i < 2) {
                        return <Badge key={i} text={item.name} className="margin-right-xs" />;
                    }
                });
            }
        }

        discounts(): React.ReactNode {
            let { state } = this.props;
            let allCouponCount = state!.allCouponCount;
            return allCouponCount ? (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List renderHeader={"优惠活动"} className="border-none">
                        <List.Item thumb={<div>领券</div>} align={"middle"} arrow={"horizontal"} onClick={() => this.onOpenChange(true)}>
                            <Container.Component direction={"row"} align={"center"}>
                                {this.renderCouponSim()}
                                <i className="" />
                            </Container.Component>
                        </List.Item>
                    </List>
                </>
            ) : null;
        }

        showCoupon() {
            this.dispatch({ type: "input", data: { couponOpen: true } });
        }

        /**
         * 使用优惠卷
         */
        onOpenChange = (bool: boolean) => {
            this.dispatch({ type: "input", data: { discountsOpen: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { discountsOpen: false } });
            androidExit(bool, callback, 1);
        };

        renderCouponModal(): React.ReactNode {
            let resourceType = this.props.match!.params.resourceType;
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const detail = roomdetail && roomdetail.resource;
            const discountsOpen = state!.discountsOpen;
            let invoiceProps: any = {};
            if (detail) {
                invoiceProps = {
                    isOpen: () => (discountsOpen ? discountsOpen : false),
                    close: () => {
                        this.onOpenChange(false);
                        this.dispatch({ type: "input", data: { discountsOpen: !discountsOpen, couponSelect: null } });
                    },
                    selectedcallback: (data: any) => {
                        this.onOpenChange(false);
                        this.dispatch({ type: "input", data: { couponSelect: data, discountsOpen: false } });
                    },
                    sceneCode: Number(resourceType) === ResourceTypeEnum.working ? "station" : "adsense",
                    resourceName: detail.RoomName,
                    resourceCode: IParkBindTableNameEnum.resource,
                    resourceID: detail.id,
                    bindTableData: {
                        bindTableId: detail?.id,
                        bindTableName: IParkBindTableNameEnum.resource,
                        bindTableValue: detail?.resourceName,
                    },
                };
            }
            return detail && this.renderEmbeddedView(CouponGet.Page as any, { ref: "selectInvoice", ...invoiceProps });
        }

        renderResourceDetailView(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const detail = roomdetail && roomdetail.resource,
                pictureSrc = roomdetail && roomdetail.coverUrl,
                pictures = (roomdetail && roomdetail.imageUrl) || [],
                resourceType = this.props.match!.params.resourceType;

            const contentHTML = detail && htmlContentTreatWord(detail.summary),
                shareContent = contentHTML ? contentHTML.substring(0, 40) : "";

            if (detail && pictureSrc && pictures && !thirdShareconfig) {
                thirdShareconfig = true;

                this.dispatch({
                    type: `${iparkCommonNameSpace.wechat}/thirdShare`,
                    title: `${getResourceTitle(resourceType)}详情`,
                    img: getSharePicture(pictureSrc && String(pictureSrc).indexOf("Assets") > -1 ? pictures && pictures[0] : pictureSrc, contentHTML, client.thirdshareLogo),
                    desc: shareContent,
                    wx: wx,
                });
            }

            return (
                detail && (
                    <>
                        {this.renderPictureScroll()}
                        {this.orderDetail()}
                        {this.discounts()}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderCouponModal()}
                        {this.renderResourceDetailContactView(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderSummaryView(detail)}
                        {this.renderResourceRoomDetailView(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderResourceRemarkView(detail)}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {this.renderEmbeddedView(PositionDetailComment.Page, {
                            id: this.props.match!.params.detailid,
                            title: detail && detail.resourceName,
                        } as any)}
                    </>
                )
            );
        }

        renderHeaderRight(): React.ReactNode {
            return window.location.href.indexOf("IPark_Share") > -1 ? null : <i className="icon icon-share" onClick={this.share.bind(this)} />;
        }

        orderDetail(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const detail = roomdetail && roomdetail.resource;
            return (
                detail && (
                    <List className="border-none">
                        <List.Item>
                            <div className="pv3 size-18">{detail && detail.resourceName}</div>
                            <div className="pv3">
                                <span className="size-14 gray-three-color mr15">收费单价</span>
                                <span className="size-14 color-red">{this.getPriceUnit(detail)}</span>
                            </div>
                            <div className="pv3">
                                {detail && detail.resourceType === ResourceOrderTypeEnum.workingType ? (
                                    <>
                                        <span className="size-14 gray-three-color mr15">工位总数</span>
                                        <span className="size-14">{detail && detail.items}个</span>
                                    </>
                                ) : detail && detail.resourceType === ResourceOrderTypeEnum.advertisementType ? null : (
                                    <Flex>
                                        {detail && +detail.estimateArea > 0 ? (
                                            <Flex.Item>
                                                <span className="size-14 gray-three-color mr15">占地面积</span>
                                                <span className="size-14">{detail && detail.estimateArea}㎡</span>
                                            </Flex.Item>
                                        ) : (
                                            ""
                                        )}
                                        <Flex.Item>
                                            <span className="size-14 gray-three-color mr15">容纳人数</span>
                                            <span className="size-14">{detail && detail.items}人</span>
                                        </Flex.Item>
                                    </Flex>
                                )}
                            </div>
                            <div className="pv3">
                                <span className="size-14 gray-three-color mr15">位置信息</span>
                                <span className="size-14">{detail && detail.address}</span>
                            </div>
                        </List.Item>
                    </List>
                )
            );
        }

        renderHeader(): React.ReactNode {
            return <div className="banner-head">{super.renderHeader()}</div>;
        }

        refScroll(el) {
            $(".icon-share").hide();
            el &&
                $(el).on("scroll", function () {
                    const top = $(this).scrollTop() || 0;
                    $(el)
                        .prev()
                        .find(".am-navbar-title,.am-navbar-right")
                        .css({
                            opacity: top * 0.009 < 1 ? top * 0.009 : 1,
                        });
                    if (top === 0 && el) {
                        $(".icon-share").hide();
                    } else {
                        $(".icon-share").show();
                    }
                    $(el)
                        .prev()
                        .css({
                            background: `rgba(255,255,255,${top * 0.009 < 0.1 ? top * 0.009 : 1})`,
                        });
                    $(this).prevAll(".banner-head").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".banner-head").append('<span id="nav_box_Shadow"></span>');
                    $(this)
                        .prevAll(".banner-head")
                        .find("#nav_box_Shadow")
                        .css({
                            background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                                top * 0.001 < 0.1 ? top * 0.001 : 0.1
                            }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                        });
                });
        }

        renderHeaderContent(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const detail = roomdetail && roomdetail.resource;
            return <div className="max-title">{detail && detail.resourceName}</div>;
        }

        renderOrderButton() {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const detail = roomdetail && roomdetail.resource,
                { resourceType } = this.props.match!.params;
            let freeItems = this.props.location!.state ? this.props.location!.state.freeItems : 1;

            return freeItems === 0 ? (
                <Flex.Item>
                    <Button disabled>不可预订</Button>
                </Flex.Item>
            ) : (
                <Flex.Item>
                    <Button
                        type={"primary"}
                        onClick={() => {
                            Number(resourceType) === RoomTypeEnum.workingType
                                ? setEventWithLabel(statisticsEvent.serviceStationReservation)
                                : setEventWithLabel(statisticsEvent.serviceAdvertisingReservation);
                            if (this.isAuth()) {
                                this.goTo(`order/${detail.priceUnit}/${detail.roomId}`);
                            } else {
                                this.goTo("login");
                            }
                        }}
                    >
                        我要预订
                    </Button>
                </Flex.Item>
            );
        }
        renderFooter(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const detail = roomdetail && roomdetail.resource,
                { resourceType } = this.props.match!.params;
            let resourceName = detail && detail.resourceName;
            return (
                detail && (
                    <footer className="ft-detail">
                        <Flex className="flex-collapse white">
                            <Flex.Item className="tag-ft-btn">
                                <Button
                                    onClick={() => {
                                        Number(resourceType) === RoomTypeEnum.workingType
                                            ? setEventWithLabel(statisticsEvent.serviceStationConsultation)
                                            : setEventWithLabel(statisticsEvent.serviceAdvertisingConsultation);
                                        callTel(detail.contactMobile);
                                    }}
                                    className="food-text-color zx-icon"
                                >
                                    <span>咨询</span>
                                </Button>
                            </Flex.Item>
                            {client.isBiParkApp && (
                                <Flex.Item className="tag-ft-btn">
                                    {this.renderEmbeddedView(FavoritesLink.Page, {
                                        bindTableName: IParkBindTableNameEnum.resource,
                                        bindTableId: this.props.match!.params.detailid,
                                        bindTableValue: resourceName,
                                        favoriteSuccess: () => {
                                            Number(resourceType) === RoomTypeEnum.workingType
                                                ? setEventWithLabel(statisticsEvent.serviceStationCollection)
                                                : setEventWithLabel(statisticsEvent.serviceAdvertisingCollection);
                                        },
                                    } as any)}
                                </Flex.Item>
                            )}
                            {this.renderOrderButton()}
                        </Flex>
                    </footer>
                )
            );
        }

        renderBody() {
            return this.renderResourceDetailView();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.positiondetail]);
}
