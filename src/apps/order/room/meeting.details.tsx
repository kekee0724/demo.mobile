import React from "react";
import { Carousel, List, WhiteSpace, Flex, Icon, Button, Badge, DatePicker, NoticeBar } from "antd-mobile-v2";
import { template, formatDate, formatNow, getSetDateStr, formatDateTime, getDate, getLocalStorage } from "@reco-m/core";
import { ImageAuto, ViewComponent, getSharePicture, Container, androidExit, HtmlContent, setEventWithLabel, shareType, share, Mobclick } from "@reco-m/core-ui";
import { roomdetailModel, Namespaces, getPriceUnit, getResourceTitle, MeetingStatusEnum, BookDayUnitEnum, MaxDayBookingTypeEnum } from "@reco-m/order-models";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { FavoritesLink } from "@reco-m/favorites-common";
import { callTel, IParkBindTableNameEnum, ResourceTypeEnum, synchronousSerial, htmlContentTreatWord, htmlContentTreatFormat } from "@reco-m/ipark-common";
import { Namespaces as iparkCommonNameSpace } from "@reco-m/ipark-common-models";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";
import { CouponGet } from "@reco-m/coupon-common";
import { InvoiceEnum } from "@reco-m/invoice-models";

import { RoomDetailComment } from "./room.detail.comment";

import { isCertifyMeeting } from "./common";
export namespace RoomDetail {
    let thirdShareconfig = false;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, roomdetailModel.StateType {
        open?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = true;
        bodyClass = "oldForm";
        namespace = Namespaces.roomdetail;
        headerContent = "预订详情";
        timeData;
        timeValues = [] as any;
        /**
         * 可选择时间段
         */
        sectionData: any = [];
        finishData = {} as any;
        sectionDataTwo = [] as any;
        gotoLogin = false;
        componentDidMount() {
            if (!this.isAuth()) {
                this.gotoLogin = true;
                synchronousSerial(() => {
                    this.goTo("login");
                }, 500);
                return;
            }
            this.initData();
        }
        initData() {
            let { resourceType, detailid } = this.props.match!.params;
            const startDay = (this.props.location!.state && this.props.location!.state.startDay) || formatDate(new Date());
            this.dispatch({
                type: `initPage`,
                data: {
                    detailid: detailid,
                    resourceType: resourceType,
                    startDay: startDay,
                },
                callback: (data) => {
                    this.timeData = data;
                    this.timeValues = data && data.items && data.items.map((t) => t.itemCode && formatDateTime(t.itemCode, "hh:mm"));
                    this.sliderRang();
                    this.checkRmainingTime();
                    this.dispatch({ type: "input", i: new Date() });
                },
            });
            this.dispatch({ type: "input", data: { startDay: startDay } });
            thirdShareconfig = false;
        }
        componentReceiveProps(nextProps: Readonly<P>): void {
            if (nextProps.location!.pathname!.length < this.props.location!.pathname!.length) {
                if (!this.isAuth()) {
                    this.gotoLogin = true;
                    synchronousSerial(() => {
                        this.goTo("login");
                    }, 300);
                } else {
                    if (this.gotoLogin) {
                        this.initData();
                        this.gotoLogin = false;
                    }
                }
            }
        }
        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }
        getOrderTime(startDay) {
            if (formatNow() === formatDate(startDay, "yyyy-MM-dd")) {
                return `${formatDate(startDay, "yyyy-MM-dd")}, 今天`;
            } else if (getSetDateStr(formatNow(), 1) === formatDate(startDay, "yyyy-MM-dd")) {
                return `${formatDate(startDay, "yyyy-MM-dd")}, 明天`;
            } else if (getSetDateStr(formatNow(), 2) === formatDate(startDay, "yyyy-MM-dd")) {
                return `${formatDate(startDay, "yyyy-MM-dd")}, 后天`;
            } else {
                return formatDate(startDay, "yyyy-MM-dd");
            }
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
        /**
         * 计算最大可预订时长
         */
        getMaxBookingTimeReal() {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                maxSingleBooking = config.maxSingleBooking, // 单次预订最大时长(小时)
                maxDayBooking = config.maxDayBooking,
                remainingTime = config.maxDayBooking - state!.todayRemainingTime;

            let maxBookingTime;
            if (!maxSingleBooking) {
                // 没设置maxSingleBooking就不限制预订最大
                if (!maxDayBooking) {
                    // 没设置maxDayBooking就不限制预订最大
                    maxBookingTime = undefined;
                } else {
                    // 赋值当日剩余可预订
                    maxBookingTime = remainingTime;
                }
            } else {
                if (!maxDayBooking) {
                    // 没设置maxDayBooking就设置为单次最大可预订
                    maxBookingTime = maxSingleBooking;
                } else {
                    maxBookingTime = maxSingleBooking > remainingTime ? remainingTime : maxSingleBooking;
                }
            }
            return maxBookingTime;
        }
        /**
         * 计算最大可预订时长并且保证最大可预订时长不会小与最小预订时长,防止插件拖动会小于最小预订时长
         */
        getMaxBookingTime() {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                minBookingInterval = config.minBookingInterval; // 最小预订时段间隔(小时);

            let maxBookingTime = this.getMaxBookingTimeReal();

            if (maxBookingTime < minBookingInterval) {
                maxBookingTime = minBookingInterval;
            }

            return maxBookingTime;
        }
        /**
         * 初始化选择过的时间段
         */
        initChangePrirce(initform, initto) {
            const { state } = this.props,
                startDay = state!.startDay,
                resourceStatus = state!.resourceStatus || {},
                statusList = resourceStatus && resourceStatus.items;
            const maxBookingTime = this.getMaxBookingTime();
            if (!this.checkBoundary({ from: initform, to: initto })) {
                return false;
            }

            if (statusList) {
                let startTime = startDay + " " + (statusList[initform].itemCode && formatDateTime(statusList[initform].itemCode, "hh:mm:ss")),
                    endTime = startDay + " " + (statusList[initto].itemCode && formatDateTime(statusList[initto].itemCode, "hh:mm:ss"));
                this.dispatch({
                    type: "input",
                    data: { startTime: startTime, endTime: endTime, indexForm: initform, indexTo: initto },
                });
            }
            const update = $(".js-range-slider") && $(".js-range-slider").data("ionRangeSlider");

            update &&
                update.update({
                    from: initform,
                    to: initto,
                    max_interval: maxBookingTime * 2,
                });
        }
        /**
         * 选择起始位置超过数组界限
         */
        checkBoundary(data) {
            const { state } = this.props,
                resourceStatus = state!.resourceStatus || {},
                statusList = resourceStatus && resourceStatus.items;

            // console.log("checkBoundary", statusList, data, this.finishData);
            if (statusList && this.finishData && this.finishData.from === data.from && this.finishData.to === data.to && data.to === statusList.length - 1) {
                // 已经达到今日可预订最大时间
                return false;
            }

            if (statusList && (!statusList[data.from] || !statusList[data.to]) /*  || statusList.length - 1 === data.to */) {
                return false; // 选择起始位置超过数组界限
            } else {
                return true;
            }
        }
        /**
         * 处理选择过的时间段
         */
        changePrirce(data) {
            const { state } = this.props,
                startDay = state!.startDay,
                resourceStatus = state!.resourceStatus || {},
                statusList = resourceStatus && resourceStatus.items;

            if (!this.checkBoundary(data)) {
                return false;
            }
            let startTime = startDay + " " + (statusList[data.from].itemCode && formatDateTime(statusList[data.from].itemCode, "hh:mm:ss")),
                endTime = startDay + " " + (statusList[data.to].itemCode && formatDateTime(statusList[data.to].itemCode, "hh:mm:ss"));
            this.dispatch({
                type: "input",
                data: { startTime: startTime, endTime: endTime, indexForm: data.from, indexTo: data.to },
            });
            return true;
        }

        /**
         * 过滤已经添加过该范围的数据
         */
        filterSectionData(sectionData) {
            let list: any = [];
            let maxlist: any = [];
            sectionData &&
                sectionData.forEach((t) => {
                    if (maxlist.indexOf(t.maxLine) === -1) {
                        list.push(t);
                        maxlist.push(t.maxLine);
                    }
                });
            return list;
        }

        /**
         * 计算是否已经超出范围
         */
        checkCliderRang(data) {
            let isError = 0;

            for (let i = data.from; i < data.to; i++) {
                if (!this.sectionData.find((t) => t.minLine === i)) {
                    isError = isError + 1;
                }
            }

            if (!isError) {
                $(".range-slider-box").removeClass("error");

                this.dispatch({ type: "input", data: { isSelectTime: true } });
                this.changePrirce(data);
                return false; // 未超出范围
            } else {
                $(".range-slider-box").addClass("error");
                this.dispatch({ type: "input", data: { isSelectTime: false } });
                this.changePrirce(data);
                return true; // 超出范围
            }
        }
        /**
         * 检测当日是否可以继续预订
         */
        checkTodaySingleBooking(data) {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                remainingTime = config.maxDayBooking - state!.todayRemainingTime;

            if (data.to - data.from >= remainingTime * 2 && ((this.finishData.from && this.finishData.from === data.from) || !this.finishData.from)) {
                return false;
            }
            return true;
        }
        /**
         * 检测今日预订时间是否已经最大及最小预订时长和您的单日预订上限冲突
         */
        checkRmainingTime() {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                minBookingInterval = config.minBookingInterval, // 最小预订时段间隔(小时)
                maxDayBooking = config.maxDayBooking,
                remainingTime = maxDayBooking - state!.todayRemainingTime,
                maxSingleBooking = config.maxSingleBooking,
                maxDayBookingType = state!.maxDayBookingType;

            let tip, tipConflict;
            if (maxDayBookingType === MaxDayBookingTypeEnum.person) {
                tip = `很抱歉，您的预订已至单日上限: ${config.maxDayBooking}小时`;
                tipConflict = `很抱歉，系统最小预订时长和您的单日预订上限：${config.maxDayBooking}小时冲突，无法预订`;
            } else {
                tip = `很抱歉，您所在企业的预订已至单日上限: ${config.maxDayBooking}小时`;
                tipConflict = `很抱歉，系统最小预订时长和您所在企业单日预订上限：${config.maxDayBooking}小时冲突，无法预订`;
            }

            const maxBookingTime = this.getMaxBookingTimeReal();

            if (maxBookingTime <= 0) {
                this.dispatch({ type: "input", data: { errorTip: tip, isRmainingSelectTime: false } });
                return false;
            } else if (remainingTime < minBookingInterval) {
                this.dispatch({
                    type: "input",
                    data: { errorTip: remainingTime < 0 ? tip : tipConflict, isRmainingSelectTime: false },
                });
                return false;
            }
            if (maxSingleBooking < minBookingInterval) {
                this.dispatch({
                    type: "input",
                    data: { errorTip: `该会议室单次预订最大时长${maxSingleBooking}小时与最小时间间隔${minBookingInterval}小时冲突,无法预订`, isRmainingSelectTime: false },
                });
                return false;
            }
            this.dispatch({
                type: "input",
                data: { isRmainingSelectTime: true },
            });
            return true;
        }

        /**
         * 检测该时段是否可用及单次可预订最大时长判断
         */
        maxSingleBookingCheck(data) {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                minBookingInterval = config.minBookingInterval, // 最小预订时段间隔(小时)
                maxSingleBooking = config.maxSingleBooking, // 单次预订最大时长(小时)
                remainingTime = config.maxDayBooking - state!.todayRemainingTime;

            // 检测今日预订时间是否已经最大及最小预订时长和您的单日预订上限冲突
            if (!this.checkRmainingTime()) {
                return false;
            }
            // 选择起始位置超过数组界限
            if (!this.checkBoundary(data)) {
                return false;
            }

            // 检测该时段是否可用
            if (this.checkCliderRang(data)) {
                this.dispatch({ type: "input", data: { errorTip: `该时间段不可预订!` } });
                return false;
            }

            let check = true; // 检测通过
            // 检测当日是否可以继续预订
            if (!this.checkTodaySingleBooking(data)) {
                this.dispatch({ type: "input", data: { errorTip: `今日剩余可预订时长为${remainingTime}小时` } });
                check = false;
            } else if (data.to - data.from >= maxSingleBooking * 2 && ((this.finishData.from && this.finishData.from === data.from) || !this.finishData.from)) {
                // 可继续预订此次拖拽已是最大值 && 防止拖动时也提示
                if (maxSingleBooking === minBookingInterval) {
                    this.dispatch({ type: "input", data: { errorTip: `单次最小及最大可预订时长均为${minBookingInterval}小时` } });
                } else {
                    this.dispatch({ type: "input", data: { errorTip: `单次最大可预订时长为${maxSingleBooking}小时` } });
                }
                check = false;
            }

            this.finishData = {
                from: data.from,
                to: data.to,
            };
            if (check) {
                this.dispatch({ type: "input", data: { errorTip: null } });
            }

            return check;
        }

        /**
         * 检测该时段是否可用及单次可预订最小时长判断
         */
        minSingleBookingCheck() {
            const { state } = this.props,
                indexForm = state!.indexForm,
                indexTo = state!.indexTo,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                maxSingleBooking = config.maxSingleBooking * 2,
                minBookingInterval = config.minBookingInterval ? config.minBookingInterval * 2 : 1; // 最小预订时段间隔(小时)

            // 检测今日预订时间是否已经最大及最小预订时长和您的单日预订上限冲突
            if (!this.checkRmainingTime()) {
                return false;
            }

            if (indexForm === indexTo - minBookingInterval) {
                // 最小间隔不能少于半小时
                if (maxSingleBooking === minBookingInterval) {
                    this.dispatch({ type: "input", data: { errorTip: `单次最小及最大可预订时长均为${config.minBookingInterval}小时` } });
                    return false;
                }
                this.dispatch({ type: "input", data: { errorTip: `单次最小可预订时长为${config.minBookingInterval}小时` } });
                return false;
            }
            return true;
        }

        /**
         * 点击加号或者减号时处理
         */
        changeSliderRang(isAdd) {
            const { state } = this.props,
                indexForm = state!.indexForm,
                indexTo = state!.indexTo,
                resourceStatus = state!.resourceStatus || {},
                statusList = resourceStatus && resourceStatus.items;

            if (
                isAdd &&
                !this.maxSingleBookingCheck({
                    from: indexForm,
                    to: indexTo,
                })
            ) {
                // 超过最大单次预订时长
                return;
            }

            if (!isAdd) {
                if (!this.minSingleBookingCheck()) {
                    return;
                }
            }

            if (statusList.length - 1 !== indexTo || !isAdd) {
                this.dispatch({ type: "input", data: { indexForm: indexForm, indexTo: isAdd ? indexTo + 1 : indexTo - 1 } });
            }
            synchronousSerial(() => {
                this.sliderRang();
            });
        }

        getSectionData() {
            for (let i = 0; i < (this.timeData && this.timeData.items && this.timeData.items.length); i++) {
                let isAdd = false;
                for (let j = i + 1; j < (this.timeData && this.timeData.items && this.timeData.items.length); j++) {
                    if (this.timeData.items[i].status === MeetingStatusEnum.free) {
                        if ((this.timeData.items[j].status !== MeetingStatusEnum.free && !isAdd) || (j === this.timeData.items.length - 1 && !isAdd)) {
                            this.sectionData.push({ minLine: i, maxLine: j });
                            isAdd = true;
                        }
                    }
                }
            }

            this.sectionDataTwo = this.filterSectionData(this.sectionData); // 去重
        }

        getInitSection() {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                minBookingInterval = config.minBookingInterval; // 最小预订时段间隔(小时);
            let initSection = this.sectionDataTwo ? this.sectionDataTwo[0] : [];
            for (let i = 0; i < this.sectionDataTwo.length; i++) {
                let item = this.sectionDataTwo[i];
                if (item.maxLine - item.minLine >= minBookingInterval * 2) {
                    initSection = item;
                    break;
                }
            }
            return initSection;
        }
        /**
         * 文档地址 http://ionden.com/a/plugins/ion.rangeSlider/demo.html
         * 滑块选择时间范围组件
         */
        sliderRang() {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                config = roomdetail.config || {},
                indexForm = state!.indexForm,
                indexTo = state!.indexTo,
                minBookingInterval = config.minBookingInterval; // 最小预订时段间隔(小时);

            this.getSectionData();

            let initSection = this.getInitSection();

            let initform = indexForm ? indexForm : initSection?.minLine || 0; // 初始选择起点
            let initto = indexTo ? indexTo : minBookingInterval ? initform + minBookingInterval * 2 : initform + 1; // 初始选择终点
            // let initform //= indexForm ? indexForm : (this.sectionData && this.sectionData[0] && this.sectionData[0].minLine) || 0; // 初始选择起点
            // let initto //= indexTo ? indexTo : minBookingInterval ? initform + minBookingInterval * 2 : initform + 1; // 初始选择终点

            this.initChangePrirce(initform, initto); // 初始化选择时间

            const barNumber = 8; /*每一格为半小时， 5格为2.5小时，进入界面可选范围为2.5小时*/
            const bodyWidth = $(window).width() as any;
            const barWidth = bodyWidth / barNumber;
            const boxWidth = barWidth * 48;
            const maxBookingTime = this.getMaxBookingTime();

            $(".range-slider-box").width(boxWidth);

            if (initto > 48) {
                initform = initform - initto + 48;
                initto = 48;
            }

            ($(".js-range-slider") as any).ionRangeSlider({
                type: "double",
                grid: true,
                to: initto,
                drag_interval: true,
                from: initform,
                values: this.timeValues,
                force_edges: false,
                min_interval: minBookingInterval * 2,
                max_interval: maxBookingTime * 2,
                from_shadow: true,
                onStart: (data) => {
                    // console.log(data, "onStart");
                    this.calculateScroll(data, barWidth, barNumber);
                    this.checkCliderRang(data);
                },
                onChange: (data) => {
                    this.checkCliderRang(data);
                    this.sectionDataTwo.forEach((e, i) => {
                        this.notMeeting(e.minLine, e.maxLine, i);
                    });
                },
                onFinish: (data) => {
                    // console.log(data, "onFinish");
                    // 滚动到选择位置
                    this.calculateScroll(data, barWidth, barNumber);
                    // 最大单次时长检测
                    if (this.maxSingleBookingCheck(data)) {
                        this.minSingleBookingCheck();
                    }
                },
                onUpdate: (data) => {
                    // console.log(data, "onUpdate");
                    this.checkCliderRang(data);
                    // 滚动到选择位置
                    this.calculateScroll(data, barWidth, barNumber);
                    // 最大单次时长检测
                    if (this.maxSingleBookingCheck(data)) {
                        this.minSingleBookingCheck();
                    }
                },
            });

            this.sectionDataTwo.forEach((e, i) => {
                this.notMeeting(e.minLine, e.maxLine, i);
            });
            $(".irs-grid-pol").each((i, e) => {
                if (i % 2 !== 0) {
                    $(e).addClass("odd");
                }
            });
        }

        /**
         * 计算不能预订范围
         */
        notMeeting(min, max, nb) {
            $(".irs-grid").append("<div class='select-box' id=meeting" + nb + "></div>");
            $(".irs-grid-pol").each((i, e) => {
                if (i === min) {
                    const left = $(e).css("left");

                    $("#meeting" + nb).css("left", left);
                }
                if (i === max) {
                    const right = $(e).css("right");
                    $("#meeting" + nb).css("right", Number(right.slice(0, -2)) + 1 + "px");
                }
            });
        }

        /**
         * 计算滚动距离
         */
        calculateScroll(e, bw, nb) {
            if (e.to_pretty >= nb - 1) {
                $(".range-scroll").animate({ scrollLeft: (e.to_pretty - (nb - 3)) * bw + bw });
            } else if (e.from <= nb) {
                $(".range-scroll").animate({ scrollLeft: 0 });
            }
        }

        // 滑块选择时间范围组件-end

        /**
         * 使用优惠卷
         */
        onOpenChange = (bool: boolean) => {
            this.dispatch({ type: "input", data: { discountsOpen: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { discountsOpen: false } });
            androidExit(bool, callback, 1);
        };

        share() {
            const { state } = this.props;
            const roomdetail = state!.roomdetail,
                detail = roomdetail && roomdetail.resource,
                pictureSrc = roomdetail && roomdetail.coverUrl,
                pictures = (roomdetail && roomdetail.imageUrl) || [],
                { resourceType } = this.props.match!.params;

            const contentHTML = detail.summary ? htmlContentTreatWord(detail.summary) : "",
                shareContent = contentHTML ? contentHTML.substring(0, 40) : "";

            Number(resourceType) === ResourceTypeEnum.meeting ? setEventWithLabel(statisticsEvent.serviceMeetingShare) : setEventWithLabel(statisticsEvent.serviceSiteShare);
            let result = share(
                `${getResourceTitle(resourceType)}详情`,
                shareContent,
                getSharePicture(pictureSrc && String(pictureSrc).indexOf("Assets") > -1 ? pictureSrc : pictures && pictures[0], contentHTML, client.thirdshareLogo),
                window.location.href + `?parkId=${getLocalStorage("parkId")}`
            );
            result!.then((data) => {
                this.dispatch({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "ThirdShare" });
                Number(resourceType) === InvoiceEnum.personalInvoice
                    ? data === shareType.qq
                        ? setEventWithLabel(statisticsEvent.serviceMeetingQQShare)
                        : data === shareType.weixin
                        ? setEventWithLabel(statisticsEvent.serviceMeetingWeChatShare)
                        : data === shareType.weibo
                        ? setEventWithLabel(statisticsEvent.serviceMeetingWeiboShare)
                        : data === shareType.qqspace && setEventWithLabel(statisticsEvent.serviceMeetingSpaceShare)
                    : data === shareType.qq
                    ? setEventWithLabel(statisticsEvent.serviceSiteQQShare)
                    : data === shareType.weixin
                    ? setEventWithLabel(statisticsEvent.serviceSiteWeChatShare)
                    : data === shareType.weibo
                    ? setEventWithLabel(statisticsEvent.serviceSiteWeiboShare)
                    : data === shareType.qqspace && setEventWithLabel(statisticsEvent.serviceSiteSpaceShare);
            });
            Mobclick().onEventWithLabel("thirdShare", "第三方分享");
        }

        /**
         * 时间改变时
         */
        onConfirm(date) {
            const { state } = this.props,
                roomdetail = state!.roomdetail || {},
                resource = roomdetail.resource || {};
            let { resourceType } = this.props.match!.params;
            let startDate = formatDate(date, "yyyy-MM-dd") + "T00:00:00";
            let endDate = formatDate(date, "yyyy-MM-dd") + "T23:59:59";

            this.dispatch({
                type: "getResourceStatusAction",
                params: {
                    startDate: startDate,
                    endDate: endDate,
                    resourceType: resourceType,
                    roomId: [resource.roomId],
                },
                detailid: this.props.match!.params.detailid,
                callback: (data) => {
                    this.timeData = data;
                    this.timeValues = data && data.items && data.items.map((t) => t.itemCode && formatDateTime(t.itemCode, "hh:mm"));
                    this.sectionData = [];
                    this.dispatch({ type: "input", data: { indexForm: 0, indexTo: 0 } });

                    synchronousSerial(() => {
                        this.sliderRang();
                    });
                },
            });
            this.dispatch({ type: "input", data: { startDay: formatDate(date, "yyyy/MM/dd") } });
        }

        renderHeader(): React.ReactNode {
            return <div className="banner-head">{super.renderHeader()}</div>;
        }

        renderHeaderRight(): React.ReactNode {
            return window.location.href.indexOf("IPark_Share") > -1 ? null : <i className="icon icon-share" onClick={this.share.bind(this)} />;
        }

        renderBody(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail,
                roomPrice = state!.roomPrice,
                currentMember = state!.currentMember;
            const detail = (roomdetail && roomdetail.resource) || {},
                pictureSrc = roomdetail && roomdetail.coverUrl,
                pictures = (roomdetail && roomdetail.imageUrl) || [],
                resourceType = this.props.match!.params.resourceType;

            const contentHTML = detail && htmlContentTreatWord(detail.summary),
                shareContent = contentHTML ? contentHTML.substring(0, 40) : "";

            // 扫码跳转到其他未认证园区资源处理
            if (roomdetail && roomdetail.resource && currentMember && !isCertifyMeeting(currentMember, getLocalStorage("parkName"))) {
                this.goTo("/index");
            }

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
                <>
                    {this.renderPictureScroll()}
                    {this.orderDetail()}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {roomPrice && roomPrice.price && roomPrice.price !== 0 && roomdetail.config.isCouponDeduction ? this.discounts() : null}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderMeetingReserve()}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {roomPrice && roomPrice.price && roomPrice.price !== 0 ? this.renderChargeStandard() : null}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderContact(detail)}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderResourceRemarkView(detail)}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderEmbeddedView(RoomDetailComment.Page, {
                        id: this.props.match!.params.detailid,
                        title: detail && detail.resourceName,
                    } as any)}
                    <WhiteSpace className="whitespace-gray-bg" />
                    {this.renderCouponModal()}
                </>
            );
        }

        /**
         * 预订须知
         */
        renderResourceRemarkView(detail: any): React.ReactNode {
            return (
                <List renderHeader={"预订须知"} className="border-none">
                    <List.Item>
                        <HtmlContent.Component className="html-details resource-color" html={htmlContentTreatFormat(detail.remarks)} />
                    </List.Item>
                </List>
            );
        }

        /**
         * 收费标准
         */
        renderChargeStandard(): React.ReactNode {
            let { state } = this.props;
            let roomdetail = state!.roomdetail;
            return <List renderHeader={() => "收费标准" as any}>{this.renderChargeStandardMap(roomdetail)!}</List>;
        }

        /**
         * 收费标准列表
         */
        renderChargeStandardMap(roomdetail): React.ReactNode {
            return (
                roomdetail.price &&
                roomdetail.price.map((item, i) => {
                    return (
                        <List.Item key={i}>
                            <Flex className="bd size-14">
                                <Flex.Item className="omit omit-1 not-notice-bar-style">
                                    <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                        {item.timeInterval}
                                    </NoticeBar>
                                </Flex.Item>
                                <Flex.Item>{item.price === 0 || item.price === undefined ? `${item.startTime}-${item.endTime}` : `${item.startTime}-${item.endTime}`}</Flex.Item>
                                <Flex.Item className="text-right color-orange">
                                    {item.price === 0 || item.price === undefined ? `免费` : `${item.price}${getPriceUnit(item.priceUnit)}`}
                                </Flex.Item>
                            </Flex>
                        </List.Item>
                    );
                })
            );
        }

        /**
         * 详情图片
         */
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

        /**
         * 头部数据
         */
        orderDetail(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail,
                resource = roomdetail && roomdetail.resource,
                service = roomdetail && roomdetail.service,
                minpriceData = state!.minpriceData,
                maxpriceData = state!.maxpriceData;

            return (
                <List>
                    <List.Item wrap>
                        <div className="pv3 size-17 meeting-title">
                            <div>{resource && resource.resourceName}</div>
                            {minpriceData && maxpriceData && maxpriceData.price ? (
                                <div>
                                    <span className="size-14">
                                        {minpriceData.price === maxpriceData.price ? `${minpriceData.price}` : `${minpriceData.price}~${maxpriceData.price}`}
                                    </span>
                                    <span className="gray-three-color size-13">{getPriceUnit(maxpriceData.priceUnit)}</span>
                                </div>
                            ) : (
                                <span className="size-14">免费</span>
                            )}
                        </div>
                        <div className="pv3">
                            <span className="size-14 gray-three-color mr15">
                                {(resource && resource.items) || 0}个座位 | {resource && resource.address}
                            </span>
                        </div>
                        <div className="meeting-tag no-omit pv3">
                            {service &&
                                service.length > 0 &&
                                service.map((item) => {
                                    return <span key={item.id}>{item.serviceName}</span>;
                                })}
                        </div>
                    </List.Item>
                </List>
            );
        }

        getCanReserveTime() {
            const { state } = this.props;
            const roomdetail = state!.roomdetail,
                config = (roomdetail && roomdetail.config) || {};
            let maxDate = new Date();
            if (config.intendedScopeUnit === BookDayUnitEnum.day) {
                maxDate = maxDate.dateAdd("d", config.intendedScope); // 获取可预订日期
            } else if (config.intendedScopeUnit === BookDayUnitEnum.week) {
                maxDate = maxDate.dateAdd("w", config.intendedScope); // 获取可预订日期
            } else if (config.intendedScopeUnit === BookDayUnitEnum.month) {
                maxDate = maxDate.dateAdd("m", config.intendedScope); // 获取可预订日期
            } else if (config.intendedScopeUnit === BookDayUnitEnum.year) {
                maxDate = maxDate.dateAdd("y", config.intendedScope); // 获取可预订日期
            } else {
                maxDate = maxDate.dateAdd("y", 15); // 获取可预订日期
            }

            maxDate = new Date(maxDate.getTime() - 24 * 60 * 60 * 1000); //前一天

            return maxDate;
        }
        /**
         * 预订时间头部
         */
        renderMeetingReserveHeader(): React.ReactNode {
            const { state } = this.props;
            const startDay = state!.startDay || (this.props.location!.state && this.props.location!.state.startDay) || formatDate(new Date());
            const maxDate = this.getCanReserveTime();
            return (
                <Flex align={"center"}>
                    预订时间
                    <Flex.Item className="text-right">
                        <a className="size-14">
                            <Flex align={"center"} justify={"end"}>
                                <DatePicker mode="date" minDate={new Date()} value={getDate(startDay)} maxDate={maxDate} onOk={(v) => this.onConfirm(v)}>
                                    <Flex>
                                        <span className="primary-color">{this.getOrderTime(startDay)}</span>
                                        {/* <i className="icon icon-more size-12" /> */}
                                    </Flex>
                                </DatePicker>
                                <Icon type="right" />
                            </Flex>
                        </a>
                    </Flex.Item>
                </Flex>
            );
        }
        /**
         * 预订时间错误提示
         */
        renderErrorTip(): React.ReactNode {
            const { state } = this.props,
                errorTip = state!.errorTip;
            return (
                errorTip && (
                    <div className="color-red omit omit-3">
                        <Flex align={"start"}>
                            <i className="icon icon-point loading-color size-16" />
                            <Flex.Item>提示: {`${errorTip}`}</Flex.Item>
                        </Flex>
                    </div>
                )
            );
        }
        /**
         * 预订时间提示
         */
        renderMeetingReserveInfo(): React.ReactNode {
            return (
                <div className="meeting-state-box">
                    <Flex className="reserve-state" justify={"center"}>
                        <div className="yes">
                            <i className="state-box" />
                            可预订
                        </div>
                        <div className="not">
                            <i className="state-box" />
                            不可预订
                        </div>
                        <div className="end">
                            <i className="state-box" />
                            已选
                        </div>
                    </Flex>
                </div>
            );
        }
        /**
         * 预订时间
         */
        renderMeetingReserve(): React.ReactNode {
            const { state } = this.props;
            const isSelectTime = state!.isSelectTime,
                isRmainingSelectTime = state!.isRmainingSelectTime,
                startTime = state!.startTime,
                endTime = state!.endTime,
                roomdetail = state!.roomdetail,
                indexForm = state!.indexForm,
                resourceStatus = state!.resourceStatus || {},
                statusList = resourceStatus && resourceStatus.items,
                indexTo = state!.indexTo,
                config = (roomdetail && roomdetail.config) || {},
                minBookingInterval = config.minBookingInterval; // 最小预订时段间隔(小时)

            let initform = indexForm ? indexForm : (this.sectionData && this.sectionData[0] && this.sectionData[0].minLine) || 0; // 初始选择起点
            let initto = indexTo ? indexTo : minBookingInterval ? initform + minBookingInterval * 2 : initform + 1; // 初始选择终点

            let addDisable = false;
            if (statusList && statusList.length - 1 === initto) {
                addDisable = true;
            }

            return (
                <List renderHeader={this.renderMeetingReserveHeader()}>
                    {this.renderMeetingReserveInfo()}
                    <List.Item wrap>
                        <div className="range-scroll">
                            <div className="range-slider-box">
                                <div className="js-range-slider" />
                            </div>
                        </div>
                        <Flex className="margin-v margin-h-xl" align={"start"}>
                            <a
                                onClick={() => {
                                    this.changeSliderRang(false);
                                }}
                            >
                                <i className="icon icon-jinzhi size-28 gray-three-color" />
                            </a>
                            <Flex.Item className="text-center ml0">
                                <div>{isSelectTime && isRmainingSelectTime ? "可预订" : "不可预订"}</div>
                                <div className="gray-three-color size-14">
                                    {formatDateTime(startTime, "hh:mm")}-{formatDateTime(endTime, "hh:mm")}
                                </div>
                            </Flex.Item>
                            <a
                                onClick={() => {
                                    if (!addDisable) {
                                        this.changeSliderRang(true);
                                    }
                                }}
                            >
                                <i className="icon icon-tianjia size-28 gray-three-color" />
                            </a>
                        </Flex>
                        {this.renderErrorTip()}
                    </List.Item>
                </List>
            );
        }

        /**
         * 优惠券弹窗
         */
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
                    sceneCode: Number(resourceType) === ResourceTypeEnum.meeting ? "meetingRoom" : "yard",
                    resourceName: detail.resourceName,
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

        /**
         * 优惠券
         */
        discounts(): React.ReactNode {
            return (
                <List renderHeader={"优惠活动"} className="border-none">
                    <List.Item thumb={<div>领券</div>} align={"middle"} arrow={"horizontal"} onClick={() => this.onOpenChange(true)}>
                        <Container.Component direction={"row"} align={"center"}>
                            {this.renderCouponSim()}
                            <i className="" />
                        </Container.Component>
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

        /**
         * 联系方式
         */
        renderContact(detail): React.ReactNode {
            return (
                <List renderHeader={"联系方式"}>
                    <List.Item
                        extra={
                            <>
                                <i className="icon icon-newpel margin-right-xs size-16 primary-color"></i>
                                <span className="primary-color">{detail.contactMobile ? detail.contactMobile : ""}</span>
                            </>
                        }
                        arrow="horizontal"
                        onClick={() => callTel(detail.contactMobile ? detail.contactMobile : "")}
                    >
                        {detail.contactPerson}
                    </List.Item>
                </List>
            );
        }

        renderGoOrder(): React.ReactNode {
            let { state } = this.props,
                startTime = state!.startTime,
                endTime = state!.endTime,
                startDay = state!.startDay,
                isRmainingSelectTime = state!.isRmainingSelectTime, // 剩余可预订是否可预订
                isSelectTime = state!.isSelectTime; // 是否已经选择了正确的时间

            const { resourceType } = this.props.match!.params;

            return (
                <Flex.Item>
                    <Button
                        disabled={ !isSelectTime || !isRmainingSelectTime}
                        type={"primary"}
                        onClick={() => {
                            Number(resourceType) === ResourceTypeEnum.meeting
                                ? setEventWithLabel(statisticsEvent.serviceMeetingReservation)
                                : setEventWithLabel(statisticsEvent.serviceSiteReservation);
                            if (this.isAuth()) {
                                this.goTo({
                                    pathname: `details`,
                                    state: {
                                        startTime: startTime,
                                        endTime: endTime,
                                        startDay: startDay,
                                    },
                                });
                            } else {
                                this.gotoLogin = true;
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
                resourceType = this.props.match!.params.resourceType;
            let resourceName = detail && detail.resourceName;

            return (
                detail && (
                    <div className="ft-detail">
                        <Flex className="flex-collapse white">
                            <Flex.Item className="tag-ft-btn">
                                <Button
                                    onClick={() => {
                                        Number(resourceType) === ResourceTypeEnum.meeting
                                            ? setEventWithLabel(statisticsEvent.serviceMeetingConsultation)
                                            : setEventWithLabel(statisticsEvent.serviceSiteConsultation);
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
                                            Number(resourceType) === ResourceTypeEnum.meeting
                                                ? setEventWithLabel(statisticsEvent.serviceMeetingCollection)
                                                : setEventWithLabel(statisticsEvent.serviceSiteCollection);
                                        },
                                    } as any)}
                                </Flex.Item>
                            )}
                            {this.renderGoOrder()}
                        </Flex>
                    </div>
                )
            );
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.roomdetail]);
}
