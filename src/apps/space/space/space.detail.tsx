import React from "react";

import ReactDOM from "react-dom";

import { Flex, WhiteSpace, Toast, List, Badge, Button, WingBlank, Carousel } from "antd-mobile-v2";

import { template, isAnonymous, Validators, removeHtmlTag, transformAssetsUrl, getLocalStorage, getDate } from "@reco-m/core";

import { ViewComponent, ImageAuto, NoData, setEventWithLabel, Mobclick, share, shareType, getSharePicture } from "@reco-m/core-ui";

import { callTel, OrderStatusEnum, IParkResourceTypeEnum } from "@reco-m/ipark-common";

import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, spacedetailModel } from "@reco-m/space-models";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { isCertify } from "@reco-m/member-common";

import { ResourceTypeNameEnum, CurrentTabIndexEnum, DayPriceTypeEnum, SpaceResouceTypeEnum } from "@reco-m/space-models";
import { getPriceUnit, MeetingStatusEnum } from "@reco-m/order-models";

import { ResourceTypeEnum } from "@reco-m/ipark-common";
export namespace SpaceDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}
    let thirdShareconfig = false;

    export interface IState extends ViewComponent.IState, spacedetailModel.StateType {
        spaceDetailData?: any;
        isLoading?: boolean;
        show?: boolean;
        num?: number;
        roomData?: any[];
        roomType?: number;
    }

    const data = [
        {
            icon: "icon icon-huiyishiyuding",
            title: ResourceTypeNameEnum.meettingRoom,
            roomId: IParkResourceTypeEnum.meetingRoom,
        },
        {
            icon: "icon icon-gongweiyuding",
            title: ResourceTypeNameEnum.workStation,
            roomId: IParkResourceTypeEnum.cubicleRoom,
        },
        {
            icon: "icon icon-changdiyuding",
            title: ResourceTypeNameEnum.spaceRoom,
            roomId: IParkResourceTypeEnum.venue,
        },
        {
            icon: "icon icon-guanggaoweiyuding",
            title: ResourceTypeNameEnum.adStation,
            roomId: IParkResourceTypeEnum.advertisingSpace,
        },
    ];
    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "空间展示";
        showloading = false;
        namespace = Namespaces.spacedetail;
        CurrentTabIndexEnum = 0;
        refcomponents;

        componentMount() {
            setEventWithLabel(statisticsEvent.spaceDetailView);
            this.dispatch({ type: `initPage`, id: this.props.match!.params.id });

            this.goCertify = this.goCertify.bind(this);
        }

        showMoreText(el) {
            this.refcomponents = el;
            let txtHeight = $(".more-box").outerHeight();
            if ((txtHeight as any) > 69) {
                $(".shrink-icon").show();
            } else {
                $(".shrink-icon").hide();
            }
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "init" });
        }
        renderHeaderRight(): React.ReactNode {
            return <i className="icon icon-share" onClick={() => this.shareImpree()}></i>;
        }
        shareImpree() {
            const { state } = this.props,
                spaceDetailData = state!.spaceDetailData,
                imgUrl = state!.imgUrl || {};

            let detail = removeHtmlTag(spaceDetailData.summary)!;

            const result = share(
                spaceDetailData.spaceName,
                (detail && detail.substring(0, 40)) || "空间展示",
                getSharePicture(transformAssetsUrl(imgUrl.filePath), null, ""),
                window.location.href + "?parkid=" + getLocalStorage("parkId")
            );
            result!.then((data) => {
                this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                data === shareType.qq
                    ? setEventWithLabel(statisticsEvent.myActivityQQShare)
                    : data === shareType.weixin
                    ? setEventWithLabel(statisticsEvent.myActivityWeChatShare)
                    : data === shareType.weibo
                    ? setEventWithLabel(statisticsEvent.myActivityWeiboShare)
                    : data === shareType.qqspace && setEventWithLabel(statisticsEvent.myActivitySpaceShare);
            });
            Mobclick().onEventWithLabel("thirdShare", "第三方分享");
        }
        check(calltel: any) {
            const { composeControl, requiredTrue, ValidatorControl } = Validators;
            return ValidatorControl(
                composeControl([requiredTrue], {
                    value: calltel && calltel ? true : false,
                    name: "",
                    errors: {
                        required: "电话号码不存在",
                    },
                })
            );
        }

        renderCallTel(calltel: any) {
            const msg = this.check(calltel)!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
        }
        selectText() {
            $(".more-text").each(function () {
                let hg = $(this).find("span").height() as any;
                if (hg > 70) {
                    $(this).addClass("active");
                }
            });
        }

        showMore() {
            let temp = ReactDOM.findDOMNode(this.refcomponents) as any;
            if ($(temp).hasClass("showText")) {
                $(temp).removeClass("showText");
            } else {
                $(temp).addClass("showText");
            }
        }

        select(e) {
            this.dispatch({ type: "input", data: { selectType: e } });
        }
        /**
         * 获取资源列表
         */
        getRoomList(roomType) {
            this.dispatch({
                type: "getSpaceRoomAction",
                roomType: roomType,
                id: this.props.match!.params.id,
            });
        }
        goCertify() {
            this.goTo("certify");
        }
        /**
         * 跳转详情
         */
        goDetail(id: number, RoomTypeID: any) {
            const { state } = this.props,
                currentMember = state!.currentMember || {};
            if (RoomTypeID === IParkResourceTypeEnum.meetingRoom || RoomTypeID === IParkResourceTypeEnum.venue) {
                if (RoomTypeID === IParkResourceTypeEnum.meetingRoom) {
                    if (isCertify(currentMember, "会议室预订", this.goCertify)) {
                        setEventWithLabel(statisticsEvent.parkMeetingDetailView);
                        this.goTo(`resource/room/${RoomTypeID}/detail/${id}`);
                    }
                } else {
                    setEventWithLabel(statisticsEvent.parkSitemDetailView);
                    this.goTo(`resource/room/${RoomTypeID}/detail/${id}`);
                }
            } else if (RoomTypeID === IParkResourceTypeEnum.cubicleRoom || RoomTypeID === IParkResourceTypeEnum.advertisingSpace) {
                if (RoomTypeID === IParkResourceTypeEnum.cubicleRoom) {
                    if (isCertify(currentMember, "工位预订", this.goCertify)) {
                        setEventWithLabel(statisticsEvent.parkStationDetailView);
                        this.goTo(`resource/position/` + RoomTypeID + "/detail/" + id);
                    }
                } else {
                    setEventWithLabel(statisticsEvent.parkAdvertisingDetailView);
                    this.goTo(`resource/position/` + RoomTypeID + "/detail/" + id);
                }
            }
        }

        renderPrice(item) {
            if (this.CurrentTabIndexEnum === CurrentTabIndexEnum.one) {
                return <div />;
            } else if (this.CurrentTabIndexEnum === CurrentTabIndexEnum.two) {
                return (
                    <Badge className="badge-parkRight2" text={item.DayPrice ? item.DayPrice + (item.DayPriceType === DayPriceTypeEnum.day ? "元/个/天" : "元/个/月") : "免费"} />
                );
            } else if (this.CurrentTabIndexEnum === CurrentTabIndexEnum.three) {
                return (
                    <Badge className="badge-parkRight2" text={item.DayPrice ? item.DayPrice + (item.DayPriceType === DayPriceTypeEnum.day ? "元/个/天" : "元/个/月") : "免费"} />
                );
            } else if (this.CurrentTabIndexEnum === CurrentTabIndexEnum.four) {
                return <div />;
            }
        }
        /**
         * 资源服务
         */
        renderService(item): React.ReactNode {
            return (
                item.service &&
                item.service.map((t) => {
                    return <span key={t.id}>{t.serviceName}</span>;
                })
            );
        }
        renderItemAm(item): React.ReactNode {
            return (
                <Flex className="meeting-view" align={"start"}>
                    <Flex.Item>
                        <Flex>
                            {item.status &&
                                item.status.items &&
                                item.status.items.map((t, i) => {
                                    return (
                                        i <= 23 && (
                                            <Flex.Item key={i}>
                                                <span className={t.status !== MeetingStatusEnum.free ? "active" : ""}>
                                                    <em>{i % 2 === 0 && getDate(t.itemCode)!.getHours()}</em>
                                                </span>
                                            </Flex.Item>
                                        )
                                    );
                                })}
                            <Flex.Item>
                                <span>
                                    <em>12</em>
                                </span>
                            </Flex.Item>
                        </Flex>
                    </Flex.Item>
                    <div className="text">
                        <em>AM</em>
                    </div>
                </Flex>
            );
        }
        renderItemPm(item): React.ReactNode {
            return (
                <Flex className="meeting-view2" align={"start"}>
                    <div className="text">
                        <em>PM</em>
                    </div>
                    <Flex.Item>
                        <Flex>
                            {item.status &&
                                item.status.items &&
                                item.status.items.map((t, i) => {
                                    return (
                                        i >= 24 && (
                                            <Flex.Item key={i}>
                                                <span className={t.status !== MeetingStatusEnum.free ? "active" : ""}>
                                                    <em>{i % 2 === 0 && getDate(t.itemCode)!.getHours()}</em>
                                                </span>
                                            </Flex.Item>
                                        )
                                    );
                                })}
                            <Flex.Item>
                                <span>
                                    <em>24</em>
                                </span>
                            </Flex.Item>
                        </Flex>
                    </Flex.Item>
                </Flex>
            );
        }
        renderTabMeetingDetail(item, i): React.ReactNode {
            if ((item.resource && item.resource.resourceType) === ResourceTypeEnum.meeting || (item.resource && item.resource.resourceType) === ResourceTypeEnum.square) {
                let price = item.price || [];
                return (
                    <WingBlank key={i}>
                        <li
                            onClick={() => {
                                this.goDetail(item.resource && item.resource.id, item.resource && item.resource.resourceType)
                            }}
                        >
                            <Flex align={"start"}>
                                <Flex.Item>
                                    <div className="title">{item.resource && item.resource.resourceName}</div>
                                    <WhiteSpace />
                                    <div className="content">
                                        {price && price.length > 0 && price[0].price ? (
                                            <span className="margin-right-lg">
                                                <span className="size-18 color-5">¥{price[0].price}</span>
                                                {getPriceUnit(price[0] && price[0].priceUnit)}
                                            </span>
                                        ) : null}
                                        <span>{item.resource.items}个座位</span>
                                    </div>
                                    <WhiteSpace />
                                    <div className="meeting-tag">{this.renderService(item)}</div>
                                </Flex.Item>
                                <ImageAuto.Component cutWidth="110" cutHeight="80" width={110} src={item && item.coverUrl} />
                            </Flex>
                            {this.renderItemAm(item)}
                            {this.renderItemPm(item)}
                            <WhiteSpace />
                        </li>
                    </WingBlank>
                );
            }
        }
        renderTabPositionDetail(item, i): React.ReactNode {

            return (
                <div key={i}>
                    <List>
                        <List.Item wrap>
                            <div onClick={() => this.goDetail(item.resource && item.resource.id, item.resource && item.resource.resourceType)}>
                                <ImageAuto.Component cutWidth="384" cutHeight="233" src={item && item.coverUrl ? item.coverUrl : "assets/images/error.png"}></ImageAuto.Component>
                            </div>
                            <div className="park-title" onClick={() => this.goDetail(item.resource && item.resource.id, item.resource && item.resource.resourceType)}>
                                {item.resource && item.resource.resourceName}
                            </div>
                            <Flex>
                                <Flex.Item>
                                    {(item.resource && item.resource.resourceType) === ResourceTypeEnum.meeting ||
                                    (item.resource && item.resource.resourceType) === ResourceTypeEnum.square ? (
                                        <div className="size-12 color-minor omit omit-1">
                                            <span>
                                                <i className="icon icon-yonghu size-12" /> {item.resource && item.resource.estimateArea}㎡ | 可容纳
                                                {item.resource && item.resource.items}人
                                            </span>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    {item.resource && item.resource.address ? (
                                        <div className="size-12 color-minor omit omit-1">
                                            <i className="icon icon-newadds size-12" /> {item.resource.address}
                                        </div>
                                    ) : null}
                                </Flex.Item>
                            </Flex>
                        </List.Item>
                    </List>
                    <WhiteSpace></WhiteSpace>
                </div>
            );
        }

        setThirdShare() {
            const { state } = this.props;
            const spaceDetailData = state!.spaceDetailData,
                imgUrl = state!.imgUrl || {};
            if (spaceDetailData && !thirdShareconfig) {
                let detail = removeHtmlTag(spaceDetailData.remarks)!;

                thirdShareconfig = true;
                this.dispatch({
                    type: `${iparkCommonNameSpace.wechat}/thirdShare`,
                    title: spaceDetailData.spaceName,
                    img: getSharePicture(transformAssetsUrl(imgUrl.filePath), null, client.thirdshareLogo),
                    desc: detail && detail.substring(0, 40),
                    wx: wx,
                });
            }
        }
        renderSpaceList(): React.ReactNode {
            const { state } = this.props;
            const roomData = state!.roomData,
                selectType = state!.selectType;

            if (roomData && roomData.length === 0) {
                return <NoData.Component />;
            }
            if (selectType === SpaceResouceTypeEnum.meeting || selectType === SpaceResouceTypeEnum.spaceRoom) {
                return (
                    <div className="container container-fill container-column  meeting-list">
                        <ul className="container-fill">
                            {roomData &&
                                roomData.map((item, i) => {
                                    return this.renderTabMeetingDetail(item, i);
                                })}
                        </ul>
                    </div>
                );
            } else {
                return (
                    roomData &&
                    roomData.map((item, i) => {
                        return <div key={i}>{this.renderTabPositionDetail(item, i)}</div>;
                    })
                );
            }
        }
        renderSpaceTab(): React.ReactNode {
            const { state } = this.props;
            const selectType = state!.selectType;
            return (
                <List ref={() => this.selectText()} className="border-none" renderHeader="配套资源">
                    <List.Item wrap>
                        <div className="impression-Gird">
                            <ul>
                                {data.map((data, i) => {
                                    return (
                                        <li
                                            key={i}
                                            className={selectType === i ? "active " : ""}
                                            onClick={() => {
                                                this.select(i);
                                                this.getRoomList(data.roomId);
                                                this.CurrentTabIndexEnum = i;
                                            }}
                                        >
                                            <i className={data.icon}></i>
                                            <div>{data.title}</div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </List.Item>
                </List>
            );
        }
        /**
         * 空间详情入口
         */

        renderBody(): React.ReactNode {
            const { state } = this.props;
            const spaceDetailData = state!.spaceDetailData,
                showTexts = state!.showTexts,
                imgUrls = state!.imgUrls || [];
            this.setThirdShare();
            return (
                <div className="container-fill container-scrollable impression-list" style={{ backgroundColor: "#f4f4f4" }}>
                    <List ref={() => this.selectText()} className="border-none">
                        <List.Item wrap>
                        <Carousel dots autoplay={true} infinite>
                            {imgUrls && imgUrls.map((imgUrl) => {
                                return <ImageAuto.Component autoplay={true} infinite key={imgUrl.filePath} cutWidth="384" cutHeight="233" src={imgUrl.filePath}></ImageAuto.Component>
                            })}
                            </Carousel>
                             <div className="impression-head-infos">
                                <div className="size-16 pb5 mt15">{spaceDetailData && spaceDetailData.spaceName}</div>
                                <div className="size-13 pv3">
                                    <span className="gray-three-color mr15">地址</span>
                                    <span>{spaceDetailData && spaceDetailData.address}</span>
                                </div>
                                <div className="size-13 pv3">
                                    <span className="gray-three-color mr15">总建筑面积</span>
                                    {(spaceDetailData && spaceDetailData.totalArea) || "--"}㎡
                                </div>
                                <div className="size-13 pv3">
                                    <span className="gray-three-color mr15">总停车位</span> {(spaceDetailData && spaceDetailData.parkingSpaceCount) || "--"}个
                                </div>
                            </div>
                        </List.Item>
                    </List>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List ref={() => this.selectText()} className="border-none" renderHeader={"空间介绍"}>
                        <List.Item wrap>
                            <div className="impression-head-infos">
                                <p ref={(el) => this.showMoreText(el)} className={"text more-text omit " + (showTexts ? "" : "omit-3")}>
                                    {" "}
                                    {/* omit-3 */}
                                    <span className="more-box"> {spaceDetailData && spaceDetailData.summary}</span>
                                    <a className="shrink-icon" onClick={() => this.showMore()}>
                                        <i className="icon icon-xia3"></i>
                                    </a>
                                </p>
                            </div>
                        </List.Item>
                    </List>
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderSpaceTab()}
                    <div style={{ backgroundColor: "#fff" }}>{this.renderSpaceList()}</div>
                </div>
            );
        }
        getProjectState() {
            const { state } = this.props;
            const projectItems = state!.projectItems;

            let status = projectItems && projectItems[0] && projectItems[0].Order && projectItems[0].Order.Status;
            return status;
        }
        renderFooter(): React.ReactNode {
            const { state } = this.props,
                parkImpressionDetailData = state!.parkImpressionDetailData || {},
                ServiceTel = parkImpressionDetailData && parkImpressionDetailData.customerServicePhonenumber;
            const projectItems = state!.projectItems;
            let checkOrderID =
                projectItems &&
                projectItems[0] &&
                projectItems[0].Order &&
                projectItems[0].Order.Status !== undefined &&
                projectItems[0].Order.Status !== OrderStatusEnum.cancel &&
                projectItems[0].Order.Status !== OrderStatusEnum.bounced &&
                projectItems[0].Order.id;
            let status = this.getProjectState();
            return (
                <Flex className="flex-collapse impression-footer">
                    <i
                        className="icon icon-yuanquxiaomishu consult-tag mr40"
                        onClick={() => {
                            setEventWithLabel(statisticsEvent.parkConsult);
                            ServiceTel ? callTel(ServiceTel) : this.renderCallTel(ServiceTel);
                        }}
                    ></i>
                    <Flex.Item>
                        <Flex className="row-collapse">
                            <Flex.Item>
                                <Button
                                    onClick={() => {
                                        isAnonymous() ? this.goTo("login") : this.goTo(`create/yykf`);
                                        setEventWithLabel(statisticsEvent.parkViewRoom);
                                    }}
                                >
                                    预约看房
                                </Button>
                            </Flex.Item>
                            <Flex.Item>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        // this.goTo(`checkin?impressin=1`)
                                        isAnonymous() ? this.goTo("login") : !checkOrderID ? this.goTo("create/ruzsq") : this.goTo(`applyDetail/${checkOrderID}/${status}`);
                                        setEventWithLabel(statisticsEvent.parkCheckin);
                                    }}
                                >
                                    入驻申请
                                </Button>
                            </Flex.Item>
                        </Flex>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.spacedetail]);
}
