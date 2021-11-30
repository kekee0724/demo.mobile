import React from "react";

import { Carousel, Accordion, Tabs, List, Flex, Toast, WhiteSpace, Button } from "antd-mobile-v2";

import { template, transformAssetsUrl, isAnonymous, removeHtmlTag, Validators, setLocalStorage, getLocalStorage } from "@reco-m/core";
import { ViewComponent, ImageAuto, share, shareType, Mobclick, getSharePicture, GDMap, HtmlContent, setEventWithLabel, gotoMap } from "@reco-m/core-ui";
import { callTel } from "@reco-m/ipark-common";
import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models"
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { SpaceWhite } from "@reco-m/ipark-white-space";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { impressionModel, Namespaces, ImpressionTabIndexEnum } from "@reco-m/park-models";
import { MyApplyTabTypeEnum } from "@reco-m/workorder-models";


const tabs = [
  { title: "园区概况", sub: "1" },
  { title: "空间展示", sub: "2" },
];
export namespace ImpressionWhite {
  export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

  let thirdShareconfig = false;

  export interface IState extends ViewComponent.IState, impressionModel.StateType { }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
    namespace = Namespaces.impression;
    headerContent = "园区印象";
    showloading = false;
    tabindx;
    scrollView;
    bodyClass = "container-hidden";
    componentMount() {
      let parkId = this.getSearchParam("parkId");
      if (parkId) {
        setLocalStorage("parkId", parkId)
      }
      this.tabindx = this.getSearchParam("tabindx") ? this.getSearchParam("tabindx") : "0";
      setEventWithLabel(statisticsEvent.impressionView);
      setEventWithLabel(statisticsEvent.seeImpression);
      this.dispatch({ type: `initPage`, parkId: getLocalStorage("parkId") });
    }

    componentReceiveProps(nextProps: Readonly<IProps>): void {
      let locationChanged = nextProps.location !== this.props.location;
      if (locationChanged && nextProps.location!.pathname === "/index/impression") {
        if (this.isAuth()) {
          this.dispatch({ type: "getByUser" });
        }
      }
    }

    // 验证
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

    shareImpree() {
      const { state } = this.props,
        parkImpressionDetailData = state!.parkImpressionDetailData;

      const parkPictureAsync = state!.parkPictureAsync || [];

      let imageUrl = parkPictureAsync && parkPictureAsync[0] ? parkPictureAsync[0].filePath : "";

      let detail = removeHtmlTag(parkImpressionDetailData.summary)!;

      const result = share(
        parkImpressionDetailData.spaceName || parkImpressionDetailData.shortName,
        detail?.substring(0, 40),
        getSharePicture(transformAssetsUrl(imageUrl), null, ""),
        window.location.href + "?parkid=" + getLocalStorage("parkId") + "&tabindx=" + this.tabindx
      );
      result!.then((data) => {
        this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
        data === shareType.qq
          ? setEventWithLabel(statisticsEvent.parkHeadlineQQShare)
          : data === shareType.weixin
            ? setEventWithLabel(statisticsEvent.parkHeadlineWeChatShare)
            : data === shareType.weibo
              ? setEventWithLabel(statisticsEvent.parkHeadlineWeiboShare)
              : data === shareType.qqspace && setEventWithLabel(statisticsEvent.parkHeadlineSpaceShare);
      });
      Mobclick().onEventWithLabel("thirdShare", "第三方分享");
    }

    renderHeaderRight(): React.ReactNode {
      return <i className="icon icon-share" onClick={() => this.shareImpree()}></i>;
    }

    renderPictureScroll(): React.ReactNode {
      const { state } = this.props;
      const parkPictureAsync: any = state!.parkPictureAsync || [];
      return parkPictureAsync ? (
        parkPictureAsync.length > 1 ? (
          <div
            style={{ position: "relative", overflow: "hidden" }}
            onTouchStart={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onTouchEnd={(e) => e.preventDefault()}
          >
            <Carousel dots autoplay infinite>
              {parkPictureAsync.length > 0 &&
                parkPictureAsync.map((item: any, i: any) => <ImageAuto.Component key={i} cutWidth="384" cutHeight="233" src={item.filePath || ""} />)}
            </Carousel>
          </div>
        ) : parkPictureAsync.length === 1 ? (
          <ImageAuto.Component cutWidth="384" cutHeight="233" src={parkPictureAsync[0].filePath || ""} />
        ) : (
          <ImageAuto.Component cutWidth="384" cutHeight="233" src="" />
        )
      ) : (
        <ImageAuto.Component cutWidth="384" cutHeight="233" src="" />
      );
    }

    renderParkData(parkImpressionDetailData, calltel): React.ReactNode {
      return (
        <List.Item>
          {this.renderPictureScroll()!}
          <div className="impression-head-infos">
            <div className="size-18 pb10 mt15">{parkImpressionDetailData.shortName || "--"}</div>
            <div className="size-13 mb10">
              <span className="gray-three-color mr15">园区地址</span>
              <span
                onClick={() => {
                  if (parkImpressionDetailData.address) gotoMap(parkImpressionDetailData.shortName, parkImpressionDetailData.address);
                }}
              >
                <a>{parkImpressionDetailData.address || "--"}</a>
              </span>
            </div>
            <div className="size-13 mb10 omit omit-1">
              <span className="gray-three-color mr15">联系信息</span>
              {parkImpressionDetailData.contactPerson || "--"}
              &nbsp;
              <span style={{ color: "#999" }}>/</span>
              &nbsp;
              <a
                className="color-default"
                onClick={() => {
                  setEventWithLabel(statisticsEvent.ParkPhoneCall);
                  calltel ? callTel(calltel) : this.renderCallTel(calltel);
                }}
              >
                {calltel ? calltel : ""} <i className="icon icon-newpel size-14" />
              </a>
            </div>
            <Accordion className="impressopm-accordion">
              <Accordion.Panel
                header={
                  <div className="size-13 mb10">
                    <span className="gray-three-color mr15">建筑面积</span>
                    {parkImpressionDetailData.totalArea || "--"}㎡<span className="gray-three-color ml15 mr15">绿化面积</span>
                    {parkImpressionDetailData.greenArea || "--"}㎡
                  </div>
                }
              >
                <div className="size-13 mb10">
                  <span className="gray-three-color mr15">绿化率</span>
                  {`${parkImpressionDetailData.greeningRate || 0}%`}
                  <span className="gray-three-color mr15 ml15">容积率</span>
                  {`${parkImpressionDetailData.planningFloorAreaRatio || 0}%`}
                </div>
                <div className="size-13 mb10">
                  <span className="gray-three-color mr15">得房率</span>
                  {`${parkImpressionDetailData.houseEfficientRate || 0}%`}
                </div>
                <div className="size-13 mb10">
                  <span className="gray-three-color mr15">停车位</span>
                  {parkImpressionDetailData.parkingSpaceCount || parkImpressionDetailData.parkingSpaceCount === 0
                    ? parkImpressionDetailData.parkingSpaceCount
                    : "--"}
                  个
                </div>
              </Accordion.Panel>
            </Accordion>
          </div>
        </List.Item>
      );
    }

    refScroll(el) {
      this.scrollView = el;
      el &&
        $(el)
          .find(".am-tabs-pane-wrap, .am-list-view-scrollview")
          .on("scroll", function () {
            const top = $(this).scrollTop() || 0;
            $(this).parents(".container-page").find("#nav_box_Shadow").length <= 0 &&
              $(this).parents(".container-page").find(".am-tabs-tab-bar-wrap").append('<span id="nav_box_Shadow"></span>');
            $(this)
              .parents(".container-page")
              .find("#nav_box_Shadow")
              .css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1
                  }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
              });
          });
    }

    renderBody(): React.ReactNode {
      const { state } = this.props,
        parkImpressionDetailData = state!.parkImpressionDetailData || {},
        address = parkImpressionDetailData && parkImpressionDetailData.address,
        calltel = parkImpressionDetailData && parkImpressionDetailData.contactPhonenumber;
      const parkPictureAsync = state!.parkPictureAsync || [];
      if (parkPictureAsync.length && parkPictureAsync.length > 0 && parkImpressionDetailData && !thirdShareconfig) {
        let detail = removeHtmlTag(parkImpressionDetailData.summary)!;

        thirdShareconfig = true;
        this.dispatch({
          type: `${iparkCommonNameSpace.wechat}/thirdShare`,
          title: parkImpressionDetailData.spaceName || parkImpressionDetailData.shortName,
          img: getSharePicture(transformAssetsUrl(parkPictureAsync[0].filePath), null, client.thirdshareLogo),
          desc: detail?.substring(0, 40),
          wx: wx,
        });
      }
      return <div className="container-fill container-hidden impression-list">
        <Tabs
          tabs={tabs}
          initialPage={+this.tabindx}
          usePaged={false}
          animated={false}
          onChange={(_, index) => {
            if (index === ImpressionTabIndexEnum.spaceView) {
              setEventWithLabel(statisticsEvent.spaceView);
            } else if (index === ImpressionTabIndexEnum.seeImpression) {
              setEventWithLabel(statisticsEvent.seeImpression);
            }
            this.tabindx = index;
            $("#nav_box_Shadow").attr("style", "");
          }}
        >
          <>
            <List className="border-none">{this.renderParkData(parkImpressionDetailData, calltel)}</List>
            <WhiteSpace className="whitespace-gray-bg" />
            <List className="border-none" renderHeader="园区介绍">
              <List.Item wrap>
                {/* <p className="text"> */}
                <HtmlContent.Component className="text" html={parkImpressionDetailData.summary} />
                {/* </p> */}
              </List.Item>
            </List>
            <WhiteSpace className="whitespace-gray-bg" />
            {address && client.openMapLocation && <GDMap.Component title={"园区位置"} address={address} mapStyle={""} titleStyle={""} />}
          </>
          {this.renderEmbeddedView(SpaceWhite.Page)}
        </Tabs>
      </div>;
    }

    renderFooter(): React.ReactNode {
      const { state } = this.props,
        parkImpressionDetailData = state!.parkImpressionDetailData || {},
        rzsqOrder = state!.rzsqOrder,
        ServiceTel = parkImpressionDetailData && parkImpressionDetailData.customerServicePhonenumber;

      return (
        <Flex className="flex-collapse impression-footer">
          <i
            className="icon icon-yuanquxiaomishu consult-tag mr40"
            onClick={() => {
              setEventWithLabel(statisticsEvent.parkConsult);
              ServiceTel ? callTel(ServiceTel) : this.renderCallTel(ServiceTel);
            }}
          />
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
                    isAnonymous()
                      ? this.goTo("login")
                      : rzsqOrder && rzsqOrder.checkOrderId && MyApplyTabTypeEnum.cancel !== rzsqOrder.checkStatus
                        ? this.goTo(`applyDetail/${rzsqOrder.checkOrderId}/${rzsqOrder.topicStatus}`)
                        : this.goTo("create/ruzsq");
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
  export const Page = template(Component, (state) => state[Namespaces.impression]);
}
