import React from "react";

import { List, Carousel, WhiteSpace, Flex, NoticeBar, Button, Modal, WingBlank } from "antd-mobile-v2";

import { template, formatDateTime, transformUrl } from "@reco-m/core";

import { ViewComponent, ImageAuto, HtmlContent, gotoMap, GDMap, setEventWithLabel, getSharePicture, download, popstateHandler, setNavTitle } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, ActivityTypeEnum, ActivityModeEnum, SignTypeEnum, activityDetailModel, ReviewTypeEnum } from "@reco-m/activity-models";

import { FavoritesLink } from "@reco-m/favorites-common";

import { CommentInput, CommentList } from "@reco-m/comment";

import { openAddress, isDingding, IParkBindTableNameEnum, htmlContentTreatWord } from "@reco-m/ipark-common";

import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models";

import { MsgReachAuthBindModal } from "@reco-m/msgreach-common";

import { AuthBindModal } from "@reco-m/ipark-white-login";

import { MsgReachViewLimitEnum } from "@reco-m/msgreach-models";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { ActivitySign } from "./activitySign";
import { ActivitySignedUpModal } from "./activity.signed.modal";
export namespace ActivityDetail {
  let thirdShareconfig = false;

  export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

  export interface IState extends ViewComponent.IState, activityDetailModel.StateType { }

  const ddkit = window["dd"];

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
    showloading = true;
    headerContent = "活动详情";
    bodyClass = "activity-new";
    namespace = Namespaces.activityDetail;
    id: any;
    time;
    ispreview;
    /**
     * 信息触达传递权限
     */
    viewRange = this.getSearchParam("viewRange");

    componentDidMount() {
      setNavTitle.call(this, this.headerContent);

      setEventWithLabel(statisticsEvent.parkActivityDetailView);
      thirdShareconfig = false;

      this.id = this.getSearchParam("id") || this.props.match!.params.id;
      this.ispreview = this.getSearchParam("ispreview");

      this.dispatch({
        type: `initPage`,
        id: this.id,
        callback: () => {
          if (!client.isBiParkApp) {
            // 不在ipark的app中
            // 微信和其他浏览器
            if (!this.isAuth()) {
              this.dispatch({ type: "input", data: { authBindOpen: true } });
            } else {
              client.openMapLocation && this.getGdLocation();
            }
          }

          if (isDingding() && !this.viewRange) {
            this.dingdingShare();
          }
        },
      });
      this.loadAttach(this.id);
    }

    componentReceiveProps(nextProps): void {
      setNavTitle.call(this, this.headerContent, nextProps);
    }

    getGdLocation() {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {} } = activityDetail || {},
        address = activityVM.address;

      new AMap.plugin("AMap.Geocoder", () => {
        let geocoder = new AMap.Geocoder();
        geocoder.getLocation(address, (status: any, result: any) => {

          if (status === "complete" && result.geocodes.length) {
            let lnglat = result.geocodes[0].location;
            this.dispatch({ type: "input", data: { lng: lnglat.lng, lat: lnglat.lat } });
          }
        });
      });
    }

    componentWillUnmount() {
      this.dispatch({ type: "init" });
      this.dispatch({ type: "input", data: { authBindOpen: false } });
    }

    dingdingShare() {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {}, activityDetailVM = {} } = activityDetail || {},
        title = activityVM.activityName;

      const contentHTML = activityDetailVM.activityContent;
      let activityContent = htmlContentTreatWord(contentHTML),
        shareActivityContent = activityContent ? activityContent.substring(0, 40) : "",
        img = getSharePicture(
          activityVM.coverUrl ? activityVM.coverUrl : activityVM.pictureUrlList[0],
          contentHTML,
          client.thirdshareLogo
        );

      ddkit.biz.navigation.setRight({
        show: true, // 控制按钮显示， true 显示， false 隐藏， 默认true
        control: true, // 是否控制点击事件，true 控制，false 不控制， 默认false
        text: "", // 控制显示文本，空字符串表示显示默认文本
        onSuccess: function () {
          ddkit.biz.util.share({
            type: 0, // 分享类型，0:全部组件 默认；1:只能分享到钉钉；2:不能分享，只有刷新按钮
            url: location.href,
            title: title,
            content: shareActivityContent,
            image: img,
            onSuccess: function () {
              // onSuccess将在调起分享组件成功之后回调
              /**/
              // alert("success");
            },
            onFail: function () {
              // alert(JSON.stringify(err));
            },
          });
        },
      });
    }

    shareActivity() {
      this.dispatch({
        type: "startShareActivity",
        id: this.id,
        callback: () => {
          this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
        },
      });

      setEventWithLabel(statisticsEvent.myActivityShare);
    }

    renderHeaderRight(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {} } = activityDetail || {};
      return activityVM.isValid ? (
        <i
          className="icon icon-share"
          onClick={() => {
            this.shareActivity();
          }}
        />
      ) : null;
    }

    renderScrollPicture(pictures: any): React.ReactNode {
      // 滚动播放所有的图片
      return (
        pictures &&
        (pictures.length > 1 ? (
          <div className="carousel-box" onTouchStart={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} onTouchEnd={(e) => e.preventDefault()}>
            <Carousel dots autoplay infinite>
              {pictures.map((item, i) => (
                <ImageAuto.Component radius={6} cutWidth="384" cutHeight="233" key={i} src={item} />
              ))}
            </Carousel>
          </div>
        ) : pictures.length === 1 ? (
          <div className="carousel-box">
            <ImageAuto.Component radius={6} cutWidth="384" cutHeight="233" src={pictures[0]} />
          </div>
        ) : (
          <div className="carousel-box">
            <ImageAuto.Component radius={6} cutWidth="384" cutHeight="233" src="" />
          </div>
        ))
      );
    }

    renderHostUnit(hostUnit: string): React.ReactNode {
      return hostUnit ? (
        <Flex className="size-14" align="center">
          <span className="gray-three-color">
            <i className="icon icon-baoming2 size-16" />
          </span>
          <Flex.Item>
            <span>{hostUnit}</span>
          </Flex.Item>
        </Flex>
      ) : null;
    }

    renderActivityTime(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {} } = activityDetail || {},
        startTime = activityVM.startTime,
        endTime = activityVM.endTime;
      setEventWithLabel(statisticsEvent.parkActivityTime);
      return (
        <Flex className="size-14" align="center">
          <span className="gray-three-color">
            <i className="icon icon-huabanfuben size-16" />
          </span>
          <Flex.Item>
            {formatDateTime(startTime, "yyyy-MM-dd hh:mm")}
            &nbsp;至&nbsp;
            {formatDateTime(endTime, "yyyy-MM-dd hh:mm")}
          </Flex.Item>
        </Flex>
      );
    }
    goAddress(activityVM, address, title) {
      const { state } = this.props,
        lng = state!.lng,
        lat = state!.lat;

      if (activityVM.activityModeValue !== ActivityModeEnum.online) {
        if (client.isBiParkApp) {
          address && gotoMap(title, address);
        } else {
          address && openAddress(lat, lng, address);
        }
      }
    }
    renderActivityAddress(title: string, address: string): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {} } = activityDetail || {};
      return (
        <Flex className="size-14" align="center">
          <span className="gray-three-color">
            <i className="icon icon-newadds size-16" />
          </span>
          <Flex.Item
            className={activityVM.activityModeValue === ActivityModeEnum.online ? "not-notice-bar-style" : "primary-color not-notice-bar-style"}
            onClick={() => {
              this.goAddress(activityVM, address, title);
            }}
          >
            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
              {activityVM.activityModeValue === ActivityModeEnum.online ? "线上直播" : address}
            </NoticeBar>
          </Flex.Item>
        </Flex>
      );
    }

    renderActivityCharge(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {} } = activityDetail || {},
        isApplyCharge = activityVM.isApplyCharge,
        isApply = activityVM.isApply,
        applyCharge = activityVM.applyCharge;
      return (
        <Flex>
          <Flex.Item className="primary-color size-24">{isApplyCharge && isApply ? `¥${applyCharge}` : "免费"}</Flex.Item>
        </Flex>
      );
    }

    renderActivityApplyState(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {}, applyNumber } = activityDetail || {},
        applyMaxNumber = activityVM.applyMaxNumber;

      return (
        <Flex className="size-14" align="center">
          <span className="gray-three-color">
            <i className="icon icon-zu size-16" />
          </span>
          <Flex.Item>
            已报名<span className="color-orange">&nbsp;{applyNumber}&nbsp;</span>人
            {applyMaxNumber !== 0 && (
              <span>
                &nbsp;/&nbsp;限额
                <span className="color-orange">&nbsp;{applyMaxNumber}&nbsp;</span>人
              </span>
            )}
          </Flex.Item>
        </Flex>
      );
    }
    renderAttach(activityVM, attachSrcArr): React.ReactNode {
      return (
        activityVM.isSupportAttachDownload &&
        attachSrcArr &&
        attachSrcArr.map((item, index) => {
          return (
            <div key={index}>
              <Flex>
                <i className="icon icon-fujian2 size-14 margin-right-xs gray-three-color"></i>
                <Flex.Item
                  className="ml0 not-notice-bar-style "
                  onClick={() => {
                    if (!client.isBiParkApp) {
                      location.href = transformUrl(item.filePath) as any;
                    } else {
                      download(item.filePath);
                    }
                  }}
                >
                  <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                    <a> {item.fileName}</a> <span className="margin-left">{item.fileSize / 1000}kb</span>
                  </NoticeBar>
                </Flex.Item>
              </Flex>
              <WhiteSpace size={"lg"} />
            </div>
          );
        })
      );
    }
    renderActivityDescription(): React.ReactNode {
      const { state } = this.props,
        attachSrcArr = state!.attachSrcArr,
        activityDetail = state!.activityDetail;
      const { activityVM = {}, activityDetailVM = {} } = activityDetail || {},
        activityContent = activityDetailVM.activityContent;
      return (
        <List renderHeader="活动介绍" className="border-none">
          <WingBlank>
            <HtmlContent.Component className="html-details" html={activityContent} />
            {this.renderAttach(activityVM, attachSrcArr)}
          </WingBlank>
        </List>
      );
    }

    renderCommentInputPage(id, title): React.ReactNode {
      return this.renderEmbeddedView(CommentInput.Page as any, {
        bindTableName: IParkBindTableNameEnum.activity,
        bindTableId: id,
        title: title,
        commentSuccess: () => {
          setEventWithLabel(statisticsEvent.myActivityComments);
        },
      });
    }

    renderCommentInput(title: string): React.ReactNode {
      return (
        <div className="acti_comment mb10">
          {this.id && !this.ispreview && this.renderCommentInputPage(this.id, title)}
          <List ref="scrollTop" className="comment-list">
            {this.renderCommentList()}
          </List>
        </div>
      );
    }

    delCommentSuccess() {
      setEventWithLabel(statisticsEvent.myActivityDeleteComment);
    }

    replyCommentSuccess() {
      setEventWithLabel(statisticsEvent.myActivityReplyComments);
    }

    /**
     * 获取评论列表
     */
    renderCommentList() {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {} } = activityDetail || {},
        title = activityVM.activityName;
      const tprops = {
        bindTableName: IParkBindTableNameEnum.activity,
        bindTableId: this.id,
        scroll: this.scroll,
        scrollTop: this.refs.scrollTop,
        replyCommentSuccess: () => setEventWithLabel(statisticsEvent.parkHeadlineReplyComments),
        delCommentSuccess: () => setEventWithLabel(statisticsEvent.parkHeadlineDeleteComment),
        deleteCommentReplySuccess: () => { },
        title: title,
      };
      return this.id && this.renderEmbeddedView(CommentList.Page as any, { ...tprops });
    }

    setThirdShare() {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {}, activityDetailVM = {} } = activityDetail || {},
        title = activityVM.activityName;

      const contentHTML = activityDetailVM.activityContent;
      let activityContent = htmlContentTreatWord(contentHTML),
        shareActivityContent = activityContent ? activityContent.substring(0, 40) : "";

      if (title && !thirdShareconfig && !this.viewRange) {
        thirdShareconfig = true;
        this.dispatch({
          type: `${iparkCommonNameSpace.wechat}/thirdShare`,
          title: title,
          img: getSharePicture(
            activityVM.coverUrl ? activityVM.coverUrl : activityVM.pictureUrlList[0],
            contentHTML,
            client.thirdshareLogo
          ),
          desc: shareActivityContent,
          wx: wx,
        });
      }
    }
    renderActivityDetailMessage(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {}, activityDetailVM = {} } = activityDetail || {},
        title = activityVM.activityName,
        address = activityVM.address,
        organizerHost = activityDetailVM.organizerHost;
      this.setThirdShare();
      return (
        <>
          <List>
            <WingBlank>{this.renderScrollPicture(activityVM!.pictureUrlList)}</WingBlank>
            <div className="activity-text">
              <List.Item wrap className="border-none">
                <div className="pv3">{title && <div className="list-title margin-0 size-18">{title}</div>}</div>
                <WhiteSpace />
                <div className="pv3">{this.renderActivityCharge()}</div>
                <WhiteSpace />
                <div className="pv3">{this.renderActivityTime()}</div>
                <WhiteSpace />
                <div className="pv3">{this.renderActivityAddress(title, address)}</div>
                <WhiteSpace />
                <div className="pv3">{this.renderActivityApplyState()}</div>
                <WhiteSpace />
                <div className="pv3">{this.renderHostUnit(organizerHost)}</div>
                <WhiteSpace />
              </List.Item>
            </div>
          </List>
          <WhiteSpace className="whitespace-gray-bg" />
          {this.renderActivityDescription()}
          {address && activityVM.activityModeValue === ActivityModeEnum.offline && client.openMapLocation && (
            <>
              <WhiteSpace className="back" />
              <div className="map-box pb10">
                <GDMap.Component title={"活动地图"} address={address} />
              </div>
            </>
          )}
          <WhiteSpace className="whitespace-gray-bg" />
          {this.renderCommentInput(title)}
        </>
      );
    }

    refScroll(el) {
      super.refScroll(el);
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
          background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1
            }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
        });
      $(".am-notice-bar-marquee").addClass("scroll");
      clearTimeout(this.time);
      this.time = setTimeout(() => $(".am-notice-bar-marquee").removeClass("scroll"), 1000);
    }

    checkSignState() {
      const { state } = this.props,
        hasLimits = state!.hasLimits,
        mobile = state!.mobile,
        userId = state!.userId,
        activityDetail = state!.activityDetail;

      const { activityVM = {} } = activityDetail || {},
        signInStatus = activityVM!.signInStatus,
        isRegisted = activityVM.isApplied;

      if (hasLimits && !isRegisted && (activityVM.status === ActivityTypeEnum.signUp || activityVM.status === ActivityTypeEnum.onGoing)) {
        // 未报名 && (活动报名中 || 活动进行中)
        // this.goTo("sign") // 自动跳转报名
      } else if (
        isRegisted &&
        activityVM.status === ActivityTypeEnum.onGoing &&
        signInStatus === SignTypeEnum.waitSignIn
        && (activityVM.applyExamineStatus === ReviewTypeEnum.reviewPass || !(activityVM.isApply && activityVM.isApplyAudit)) // 审核通过或者不需要审核
      ) {
        // 已经报名 && 活动进行中 && 活动待签到
        this.dispatch({
          type: "getApplyDetail",
          activityID: this.id,
          datas: {
            activityId: this.id,
            inputId: userId,
            mobile: mobile,
            pageSize: 1,
          },
        });
        this.dispatch({ type: "input", data: { signUpOpen: true } }); // 自动弹出签到
      }
    }

    renderMsgReachAuthBindModal(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail,
        { parkVMList = [] } = activityDetail || {},
        authBindOpen = state!.authBindOpen,
        authBindProps: any = {
          viewRange: this.viewRange,
          parkList: parkVMList,
          isOpen: () => authBindOpen,
          close: () => { },
          confirmSelect: () => {
            if (this.viewRange.toString() !== MsgReachViewLimitEnum.registerAndCertify.toString()) {
              this.dispatch({
                type: `initPage`,
                id: this.id,
                callback: () => {
                  this.checkSignState();
                },
              });
            }
            this.dispatch({ type: "input", data: { authBindOpen: false } });
          },
        };
      return !this.ispreview && this.renderEmbeddedView(MsgReachAuthBindModal.Page, { ref: "msgReachAuthBindModal", ...authBindProps });
    }

    renderAuthUpModal(): React.ReactNode {
      const { state } = this.props,
        authBindOpen = state!.authBindOpen,
        authBindProps: any = {
          isOpen: () => authBindOpen,
          close: () => { },
          confirmSelect: () => {
            this.dispatch({
              type: `initPage`,
              id: this.id,
              callback: () => {
                this.checkSignState();
              },
            });
            this.dispatch({ type: "input", data: { authBindOpen: false } });
          },
        };
      return !this.ispreview && this.renderEmbeddedView(AuthBindModal.Page, { ref: "authBindModal", ...authBindProps });
    }

    renderSignUpModal(): React.ReactNode {
      const { state } = this.props,
        signUpOpen = state!.signUpOpen,
        signUpProps: any = {
          isOpen: () => signUpOpen,
          close: () => {
            this.dispatch({ type: "input", data: { signUpOpen: false } });
            this.dispatch({ type: "getActivityDetail", data: this.id });
          },
          confirmSelect: () => {
            setEventWithLabel(statisticsEvent.modifyRegistrationInformation);
          },
        };
      return this.renderEmbeddedView(ActivitySignedUpModal.Page as any, { ref: "signUpModal", ...signUpProps });
    }

    renderBody(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {}, activityDetailVM = {}, parkVMList = [] } = activityDetail || {};

      return activityVM && (activityVM.isValid || this.ispreview) ? (
        <>
          {/* {isDingding() && <i className="icon icon-share share-icon" onClick={() => (this.viewRange ? msgDingTalkConfigShare() : this.dingdingShare())}></i>} */}
          {this.renderActivityDetailMessage()}
          {this.viewRange ? parkVMList.length > 0 && this.renderMsgReachAuthBindModal() : this.renderAuthUpModal()}
          {this.renderSignUpModal()}
        </>
      ) : activityDetail ? (
        <div style={{ height: "100%" }}>
          <div className="pay-content" style={{ height: "100%" }}>
            <div className="pay-icon " style={{ color: "red" }}>
              <i className="icon icon-cuo" />
            </div>
            <div className="pay-state">操作失败</div>
            <div className="pay-tips" style={{ fontSize: "12px" }}>
              当前活动信息已过期，若有疑问，请联系主办方
            </div>
            <div className="pay-tips" style={{ fontSize: "12px" }}>
              主办单位：{activityDetailVM && activityDetailVM.organizerHost ? activityDetailVM.organizerHost : ""}
            </div>
          </div>
        </div>
      ) : null;
    }

    renderHasLimits(activityVM, applyNumber, applyMaxNumber, activityDetail): React.ReactNode {
      // 报名人数未满 && 该活动支持报名 && (活动报名中 || 活动进行中)
      if (
        (applyNumber < applyMaxNumber || applyMaxNumber === 0 || activityVM.isApplied) &&
        (activityVM.status === ActivityTypeEnum.signUp || activityVM.status === ActivityTypeEnum.onGoing)
      ) {
        return this.renderEmbeddedView(ActivitySign.Page as any, {
          isRegisted: activityVM.isApplied,
          activityDetailData: activityDetail,
        });
      } else if (activityVM.status === ActivityTypeEnum.finish) {
        return <Button disabled>活动已结束</Button>;
      } else if (activityVM.status === ActivityTypeEnum.unPublish) {
        return <Button disabled>未发布</Button>;
      } else if (applyNumber >= applyMaxNumber) {
        return <Button disabled>已满</Button>;
      } else {
        return null;
      }
    }
    renderNoLimits(activityVM, applyNumber, applyMaxNumber, memberRoleName): React.ReactNode {
      // 没有权限时
      if (
        (applyNumber <= applyMaxNumber || applyMaxNumber === 0) &&
        activityVM.isApply &&
        (activityVM.status === ActivityTypeEnum.signUp || activityVM.status === ActivityTypeEnum.onGoing)
      ) {
        return (
          <Button
            type={"primary"}
            onClick={() => {
              let modal = Modal.alert("操作提示", `Sorry，当前活动仅对“${memberRoleName}”开放哦~`, [
                {
                  text: "知道啦",
                  onPress: () => {
                    popstateHandler.removePopstateListener();
                  },
                },
              ]);
              popstateHandler.popstateListener(() => {
                modal.close();
              });
            }}
          >
            立即报名
          </Button>
        );
      } else if (activityVM.status === ActivityTypeEnum.finish) {
        return <Button disabled>活动已结束</Button>;
      } else if (activityVM.status === ActivityTypeEnum.unPublish) {
        return <Button disabled>未发布</Button>;
      } else if (applyNumber > applyMaxNumber) {
        return <Button disabled>已满</Button>;
      } else {
        return null;
      }
    }
    renderRegisterButton(): React.ReactNode {
      const { state } = this.props,
        memberRoleName = state!.memberRoleName,
        hasLimits = state!.hasLimits,
        activityDetail = state!.activityDetail;

      const { activityVM = {}, applyNumber = 0 } = activityDetail || {},
        applyMaxNumber = activityVM.applyMaxNumber;

      if (!this.isAuth()) {
        if (client.isBiParkApp) {
          return (
            <Button
              type="primary"
              onClick={() => {
                this.goTo("login");
              }}
            >
              立即报名
            </Button>
          );
        } else {
          return <Button disabled>未登录</Button>;
        }
      }
      // 是否有报名权限
      if (hasLimits) {
        return this.renderHasLimits(activityVM, applyNumber, applyMaxNumber, activityDetail);
      } else {
        return this.renderNoLimits(activityVM, applyNumber, applyMaxNumber, memberRoleName);
      }
    }

    initChangeData() {
      const data = {
        showSignUpModal: false,
        userName: "",
        mobile: "",
        email: "",
        remarks: "",
        activityRegistDetailData: null,
      };

      this.dispatch({ type: "input", data: data });
    }

    renderFavoritesLinkPage(id, title): React.ReactNode {
      return id
        ? this.renderEmbeddedView(FavoritesLink.Page as any, {
          bindTableName: IParkBindTableNameEnum.activity,
          bindTableId: id,
          bindTableValue: title,
          favoriteSuccess: () => {
            setEventWithLabel(statisticsEvent.parkCircleDynamicfollow);
            this.favoritesSuccess();
          },
          unFavoriteSuccess: () => { },
        })
        : null;
    }

    favoritesSuccess() {
      setEventWithLabel(statisticsEvent.collectionActivities);
    }

    renderFooter(): React.ReactNode {
      const { state } = this.props,
        activityDetail = state!.activityDetail;
      const { activityVM = {} } = activityDetail || {},
        isValid = activityVM.isValid,
        id = activityVM!.id,
        title = activityVM!.activityName;

      return isValid && !this.ispreview ? (
        <div>
          <Flex className="flex-collapse white">
            {client.isBiParkApp && <Flex.Item className="tag-ft-btn">{this.renderFavoritesLinkPage(id, title)}</Flex.Item>}
            <Flex.Item>{this.renderRegisterButton()}</Flex.Item>
          </Flex>
        </div>
      ) : null;
    }
  }

  export const Page = template(Component, (state) => state[Namespaces.activityDetail]);
}
