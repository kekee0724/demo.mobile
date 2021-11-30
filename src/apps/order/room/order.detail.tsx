import React from "react";

import { Toast, NavBar, Modal, Icon, List, TextareaItem, Flex, Switch, InputItem, WhiteSpace, Button, Picker, Radio, NoticeBar } from "antd-mobile-v2";

import { template, getDate, formatDateTime, Validators } from "@reco-m/core";

import { ViewComponent, setEventWithLabel, androidExit } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, getResourceTitle, RoomTypeEnum, IntgralSelectEnum, PriceUnitEnum, roomorderModel } from "@reco-m/order-models";

import { comOrPerSubject, invoiceSubject } from "@reco-m/invoice-models";

import { InvoiceTitleTypeEnum, ComOrPerTitleTypeEnum, synchronousSerial, deepClone } from "@reco-m/ipark-common";

import { InvoiceSelect } from "@reco-m/invoice-common";

import { CouponChoice } from "@reco-m/coupon-common";

import { ResourceTypeEnum } from "@reco-m/ipark-common";

import { InvoiceEnum } from "@reco-m/invoice-models";

import { appPaySheet, appPaySheetClose } from "@reco-m/order-common";

export namespace RoomOrderDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, roomorderModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showheader = false;
        namespace = Namespaces.roomorder;
        totoalPrice: any;
        totoalRoomPrice: any;
        totoalRoomHours: any;
        freeze = true;

        componentMount() {
            let startTime = this.props.location!.state && this.props.location!.state.startTime,
                endTime = this.props.location!.state && this.props.location!.state.endTime,
                startDay = this.props.location!.state && this.props.location!.state.startDay;
            if (this.isAuth()) {
                this.dispatch({
                    type: `initPageDetail`,
                    data: {
                        detailid: this.props.match!.params.detailid,
                        props: this.props,
                        initparam: { startTime: startTime, endTime: endTime, startDay: startDay },
                    },
                });
            } else {
                this.goTo("login");
            }
        }
        componentWillUnmount() {
            this.dispatch({
                type: "couponchice/init",
            });
            this.dispatch({
                type: "init",
            });
            this.dispatch({
                type: "couponchice/input",
                data: { selectCouponTypeID: [], selectID: {} },
            });
            this.dispatch({ type: "invoiceTitleEdit/init" });
            appPaySheetClose(this);
        }
        getHoursInTime(startTime, endTime) {
            const { state } = this.props,
                startDay = state!.startDay;
            startTime = startDay.split(" ")[0] + " " + startTime;
            endTime = startDay.split(" ")[0] + " " + endTime;
            let start = getDate(startTime)!;
            let end = getDate(endTime)!;
            if (formatDateTime(end, "hh:mm") === "23:59") {
                let end2 = getDate(formatDateTime(end, "yyyy-MM-dd 00:00"))!.dateAdd("d", 1);
                end = end2;
            }
            let hour = end.dateDiffDecimals("h", start);
            return hour;
        }

        startEndTimeOne(startTime: any, endTime: any, item: any) {
            let start, end, hour, price, unit;
            start = startTime;
            end = endTime;
            hour = this.getHoursInTime(start, end);
            if (item.priceUnit === PriceUnitEnum.perHour) {
                unit = 1;
            } else if (item.priceUnit === PriceUnitEnum.halfHour) {
                unit = 2;
            }
            price = hour * item.price * unit;
            if (!item.price) {
                price = 0;
            }
            this.totoalRoomHours = this.totoalRoomHours + hour;
            this.totoalRoomPrice = this.totoalRoomPrice + price;
            return { start, end, price, hour, unit };
        }

        startEndTimeTwo(startTime: any, item: any) {
            let start, end, hour, price, unit;
            start = startTime;
            end = item.endTime;
            hour = this.getHoursInTime(start, end);
            if (item.priceUnit === PriceUnitEnum.perHour) {
                unit = 1;
            } else if (item.priceUnit === PriceUnitEnum.halfHour) {
                unit = 2;
            }
            price = hour * item.price * unit;
            if (!item.price) {
                price = 0;
            }
            this.totoalRoomHours = this.totoalRoomHours + hour;
            this.totoalRoomPrice = this.totoalRoomPrice + price;

            return { start, end, price, hour, unit };
        }

        startEndTimeThree(item: any, endTime: any) {
            let start, end, hour, price, unit;
            start = item.startTime;
            end = endTime;
            hour = this.getHoursInTime(start, end);
            if (item.priceUnit === PriceUnitEnum.perHour) {
                unit = 1;
            } else if (item.priceUnit === PriceUnitEnum.halfHour) {
                unit = 2;
            }
            price = hour * item.price * unit;
            if (!item.price) {
                price = 0;
            }
            this.totoalRoomHours = this.totoalRoomHours + hour;
            this.totoalRoomPrice = this.totoalRoomPrice + price;
            return { start, end, price, hour, unit };
        }

        startEndTimeFour(item: any) {
            let start, end, hour, price, unit;
            start = item.startTime;
            end = item.endTime;
            hour = this.getHoursInTime(start, end);
            if (item.priceUnit === PriceUnitEnum.perHour) {
                // 元/小时
                unit = 1;
            } else if (item.priceUnit === PriceUnitEnum.halfHour) {
                // 元/半小时
                unit = 2;
            }
            price = hour * item.price * unit;
            if (!item.price) {
                price = 0;
            }
            this.totoalRoomHours = this.totoalRoomHours + hour;
            this.totoalRoomPrice = this.totoalRoomPrice + price;
            return { start, end, price, hour, unit };
        }
        /**
         * 获取预订的时段数据
         * @param [isResetTotal] 是否需要重新计算总值
         * @returns
         */
        getMeetingItems(isResetTotal?) {
            const { state } = this.props,
                roomdetail = state!.roomdetail,
                startTime = state!.startTime,
                endTime = state!.endTime,
                startTimeTwo = startTime && formatDateTime(getDate(startTime) as any, "hh:mm"),
                endTimeTwo = startTime && formatDateTime(getDate(endTime) as any, "hh:mm");
            let meetingItems = [] as any;

            if (roomdetail && roomdetail.price) {
                roomdetail.price.forEach((item, i) => {
                    if (i === 0 && isResetTotal) {
                        this.totoalRoomPrice = 0;
                        this.totoalRoomHours = 0;
                    }

                    let param: any = {};

                    if (startTimeTwo <= item.startTime && endTimeTwo <= item.startTime) {
                        return "";
                    } else if (startTimeTwo >= item.endTime && endTimeTwo >= item.endTime) {
                        return "";
                    } else if (startTimeTwo >= item.startTime && startTimeTwo < item.endTime && endTimeTwo <= item.endTime) {
                        param = this.startEndTimeOne(startTimeTwo, endTimeTwo, item);
                    } else if (startTimeTwo >= item.startTime && startTimeTwo < item.endTime && endTimeTwo > item.endTime) {
                        param = this.startEndTimeTwo(startTimeTwo, item);
                    } else if (startTimeTwo <= item.startTime && endTimeTwo <= item.endTime) {
                        param = this.startEndTimeThree(item, endTimeTwo);
                    } else if (startTimeTwo <= item.startTime && endTimeTwo > item.endTime) {
                        param = this.startEndTimeFour(item);
                    }
                    meetingItems.push(param);
                });
            }

            return meetingItems;
        }
        renderMeetingItems(): React.ReactNode {
            const meetingItems = this.getMeetingItems(true);

            if (meetingItems?.length) {
                return meetingItems.map((item, i) => (
                    <div key={i} className="row">
                        <span>
                            {item.start}-{item.end}
                        </span>
                        <span>{item.hour && item.hour.toFixed(2)}小时</span>
                        <span>¥{item.price && item.price.toFixed(2)}</span>
                    </div>
                ));
            }
            return null;
        }
        renderFreeMeetingItems(): React.ReactNode {
            const meetingItems = this.getMeetingItems(true);

            if (meetingItems?.length) {
                return meetingItems.map((item, i) => (
                    <div key={i} className="row">
                        <span>
                            {item.start}-{item.end}
                        </span>
                        <span>{item.hour && item.hour.toFixed(2)}小时</span>
                    </div>
                ));
            }
            return null;
        }

        getSelecConfigureCount(roomdetail: any) {
            let count = 0;
            roomdetail &&
                roomdetail.service &&
                roomdetail.service.forEach((item) => {
                    if (item.selecCount && item.selecCount > 0) {
                        count = count + item.selecCount;
                    }
                });
            return count;
        }

        getSelecConfigurePrice(roomdetail: any) {
            let price = 0;
            roomdetail &&
                roomdetail.service &&
                roomdetail.service.forEach((item) => {
                    if (item.selecCount && item.selecCount > 0) {
                        price = price + item.selecCount * item.price;
                    }
                });
            return price;
        }

        /**
         * 备注
         */
        renderRemarkFormView(): React.ReactNode {
            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />
                    <List
                        className="room-16"
                        renderHeader={
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                备注留言
                            </NoticeBar>
                        }
                    >
                        <TextareaItem
                            placeholder="请输入备注留言"
                            data-seed="logId"
                            rows={3}
                            maxLength={200}
                            autoHeight
                            onChange={(e) => {
                                this.dispatch({ type: "input", data: { orderRemark: e } });
                            }}
                        />
                    </List>
                </>
            );
        }
        companyOrPersonOnChange(value) {
            this.dispatch({
                type: "invoiceSelect/Init",
            });
            this.dispatch({
                type: "input",
                data: { invoice: null, title: "", taxID: "", bankAccount: "", bankName: "" },
            });
            this.dispatch({ type: "invoiceTitleEdit/init" });
            if (value && value.length > 0)
                if (value[0] === undefined) {
                    this.dispatch({ type: "input", data: { comOrPerType: ComOrPerTitleTypeEnum.company } });
                } else {
                    if (value[0] === ComOrPerTitleTypeEnum.company) {
                        this.dispatch({ type: "input", data: { invoiceType: undefined } });
                    } else if (value[0] === ComOrPerTitleTypeEnum.person) {
                        this.dispatch({ type: "input", data: { invoiceType: InvoiceTitleTypeEnum.personInvoice } });
                    }
                    this.dispatch({ type: "input", data: { comOrPerType: value[0] } });
                }
        }
        renderCompanyOrPerson(): React.ReactNode {
            let { state } = this.props;
            const comOrPerType = state!.comOrPerType;
            const check = state!.check;
            const invoiceShow = state!.invoiceShow;
            let subject = comOrPerType ? comOrPerSubject.find((item) => item.value === comOrPerType)?.label : "";
            if (check) {
                return (
                    <div className="invoice">
                        <Picker
                            title="请选择发票主体"
                            data={comOrPerSubject}
                            value={[comOrPerType]}
                            cols={1}
                            visible={invoiceShow}
                            onVisibleChange={() => this.onOpenChangeThree(!invoiceShow)}
                            onChange={(value) => {
                                console.log("value", value);

                                this.companyOrPersonOnChange(value);
                            }}
                        >
                            <InputItem
                                clear
                                editable={false}
                                onClick={() => {
                                    (document.activeElement as any)!.blur();
                                    this.onOpenChangeThree(true);
                                }}
                                placeholder="请选择"
                                value={subject}
                            >
                                <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                    发票主体
                                </NoticeBar>
                            </InputItem>
                        </Picker>
                    </div>
                );
            }

            return null;
        }

        renderSpecialUse(invoice: any): React.ReactNode {
            return (
                <div>
                    {this.getMainInvoiceItemView()}
                    <InputItem
                        clear
                        editable={false}
                        placeholder="请选择"
                        onClick={this.showInvoice.bind(this, InvoiceTitleTypeEnum.speciallyInvoice)}
                        value={invoice && invoice.title}
                    >
                        <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                            发票抬头
                        </NoticeBar>
                    </InputItem>
                    <InputItem
                        clear
                        editable={false}
                        placeholder="请选择"
                        onClick={this.showInvoice.bind(this, InvoiceTitleTypeEnum.speciallyInvoice)}
                        value={invoice && invoice.taxId}
                    >
                        <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                            纳税识别号
                        </NoticeBar>
                    </InputItem>
                    {invoice && invoice.bankName && (
                        <InputItem
                            clear
                            editable={false}
                            onClick={() => {
                                (document.activeElement as any)!.blur();
                            }}
                            value={invoice && invoice.bankName}
                        >
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                开户银行
                            </NoticeBar>
                        </InputItem>
                    )}
                    {invoice && invoice.bankAccount && (
                        <InputItem
                            clear
                            editable={false}
                            onClick={() => {
                                (document.activeElement as any)!.blur();
                            }}
                            value={invoice && invoice.bankAccount}
                        >
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                开户账号
                            </NoticeBar>
                        </InputItem>
                    )}
                    {this.renderInvoice()}
                </div>
            );
        }

        renderCommon(invoice: any): React.ReactNode {
            return (
                <div>
                    {this.getMainInvoiceItemView()}
                    <InputItem
                        clear
                        editable={false}
                        placeholder="请选择"
                        onClick={this.showInvoice.bind(this, InvoiceTitleTypeEnum.commonInvoice)}
                        value={invoice && invoice.title}
                    >
                        <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                            发票抬头
                        </NoticeBar>
                    </InputItem>
                    <InputItem
                        clear
                        editable={false}
                        placeholder="请选择"
                        onClick={this.showInvoice.bind(this, InvoiceTitleTypeEnum.commonInvoice)}
                        value={invoice && invoice.taxId}
                    >
                        <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                            纳税识别号
                        </NoticeBar>
                    </InputItem>
                    {this.renderInvoice()}
                </div>
            );
        }

        getInvoiceFormView(): React.ReactNode {
            const { state } = this.props,
                comOrPerType = state!.comOrPerType,
                invoiceType = state!.invoiceType;
            let invoice = state!.invoice || {};
            invoice = { ...invoice };

            if (comOrPerType === ComOrPerTitleTypeEnum.company) {
                if (invoiceType === InvoiceTitleTypeEnum.speciallyInvoice) {
                    // 专用
                    return this.renderSpecialUse(invoice);
                } else if (invoiceType === InvoiceTitleTypeEnum.commonInvoice) {
                    // 普通
                    return this.renderCommon(invoice);
                } else {
                    return this.getMainInvoiceItemView();
                }
            } else if (comOrPerType === ComOrPerTitleTypeEnum.person) {
                return (
                    <div>
                        <InputItem
                            clear
                            editable={false}
                            placeholder="请选择"
                            onClick={this.showInvoice.bind(this, InvoiceTitleTypeEnum.personInvoice)}
                            value={invoice && invoice.title}
                        >
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                发票抬头
                            </NoticeBar>
                        </InputItem>
                        {this.renderInvoice()}
                    </div>
                );
            }

            return null;
        }

        getMainInvoiceItemView(): React.ReactNode {
            let { state } = this.props;
            const invoiceType = state!.invoiceType;
            const invoiceTypeShow = state!.invoiceTypeShow;
            let subject = invoiceType ? invoiceSubject.filter((item) => item.value === invoiceType)[0]?.label : "";
            return (
                <div className="invoice">
                    <Picker
                        title="请选择发票类型"
                        data={invoiceSubject}
                        value={[invoiceType]}
                        cols={1}
                        visible={invoiceTypeShow}
                        onVisibleChange={() => this.onOpenChangeFour(!invoiceTypeShow)}
                        onChange={(value) => {
                            this.dispatch({
                                type: "invoiceSelect/Init",
                            });
                            this.dispatch({
                                type: "input",
                                data: { invoice: null, title: "", taxID: "", bankAccount: "", bankName: "" },
                            });
                            this.dispatch({ type: "invoiceTitleEdit/init" });
                            if (value && value.length > 0)
                                if (value[0] === undefined) {
                                    this.dispatch({ type: "input", data: { invoiceType: InvoiceTitleTypeEnum.speciallyInvoice } });
                                } else {
                                    this.dispatch({ type: "input", data: { invoiceType: value[0] } });
                                }
                        }}
                    >
                        <InputItem
                            clear
                            editable={false}
                            onClick={() => {
                                (document.activeElement as any)!.blur();
                                this.onOpenChangeFour(true);
                            }}
                            placeholder="请选择"
                            value={subject}
                        >
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                发票类型
                            </NoticeBar>
                        </InputItem>
                    </Picker>
                </div>
            );
        }

        showInvoice() {
            (document.activeElement as any)!.blur();
            let { state } = this.props;
            let invoiceType = state!.invoiceType;
            this.dispatch({
                type: "invoiceSelect/invoiceTitleGetPaged",
                index: 1,
                key: "",
                invoiceType,
            });
            this.onOpenChangeFive(true);
        }

        showCoupon() {
            this.onOpenChange(true);
        }
        /**
         * 使用优惠卷
         */
        onOpenChange = (bool: boolean) => {
            this.dispatch({ type: "input", data: { couponOpen: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { couponOpen: false } });
            androidExit(bool, callback, 1);
        };
        /**
         * 积分优惠
         */
        onOpenChangeTwo = (bool: boolean) => {
            this.dispatch({ type: "input", data: { modal1: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { modal1: false } });
            androidExit(bool, callback, 2);
        };
        /**
         * 发票主体
         */
        onOpenChangeThree = (bool: boolean) => {
            this.dispatch({ type: "input", data: { invoiceShow: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { invoiceShow: false } });
            androidExit(bool, callback, 3);
        };
        /**
         * 发票类型
         */
        onOpenChangeFour = (bool: boolean) => {
            this.dispatch({ type: "input", data: { invoiceTypeShow: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { invoiceTypeShow: false } });
            androidExit(bool, callback, 4);
        };
        /**
         * 发票抬头
         */
        onOpenChangeFive = (bool: boolean) => {
            this.dispatch({ type: "input", data: { invoiceOpen: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { invoiceOpen: false } });
            androidExit(bool, callback, 5);
        };
        renderInvoiceFormView(): React.ReactNode {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const check = state!.check;
            return roomdetail && parseFloat(this.getTotalPrice()) > 0 ? (
                <>
                    <WhiteSpace className="default-gray-bg gray" />

                    <List
                        renderHeader={
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                发票信息
                            </NoticeBar>
                        }
                    >
                        <List.Item
                            extra={
                                <Switch
                                    checked={check}
                                    onClick={() => {
                                        this.dispatch({ type: "input", data: { check: !check, comOrPerType: null } });
                                    }}
                                    onChange={() => {
                                        this.dispatch({
                                            type: "input",
                                            data: { invoice: null, title: "", taxID: "", bankAccount: "", bankName: "" },
                                        });
                                        this.dispatch({ type: "invoiceTitleEdit/init" });
                                    }}
                                />
                            }
                        >
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                是否开发票
                            </NoticeBar>
                        </List.Item>
                        {this.renderCompanyOrPerson() || null}
                        {this.getInvoiceFormView() || null}
                    </List>
                </>
            ) : null;
        }

        /**
         * 订单总金额
         */
        getTotalPrice() {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            let total =
                parseFloat(this.getSelecConfigurePrice(roomdetail) ? this.getSelecConfigurePrice(roomdetail).toFixed(2) : "0") +
                parseFloat(this.totoalRoomPrice ? this.totoalRoomPrice.toFixed(2) : "0");
            this.totoalPrice = total.toFixed(2);
            return total.toFixed(2);
        }

        /**
         * 扣除积分后总金额
         */
        getTotalPrice2() {
            let { state } = this.props;
            const roomdetail = state!.roomdetail;
            const selectDucType = state!.selectDucType;
            let total = parseFloat(this.getSelecConfigurePrice(roomdetail).toFixed(2)) + parseFloat(this.totoalRoomPrice ? this.totoalRoomPrice.toFixed(2) : 0);
            this.totoalPrice = total.toFixed(2);
            if (selectDucType === IntgralSelectEnum.none) {
                return total.toFixed(2);
            } else if (selectDucType === IntgralSelectEnum.person) {
                return (Number(total.toFixed(2)) - Number(this.getPersonDeduction().totalPersonDeductPrice)).toFixed(2);
            } else if (selectDucType === IntgralSelectEnum.company) {
                return (Number(total.toFixed(2)) - Number(this.getCompanyDeduction().totalCompanyDeductPrice)).toFixed(2);
            }
            return total.toFixed(2);
        }

        onChange = (val) => {
            let DeductionIntegral: any = 0;
            if (val === IntgralSelectEnum.none) {
                DeductionIntegral = 0;
            } else if (val === IntgralSelectEnum.person) {
                DeductionIntegral! = this.getPersonDeduction().totalPersonDeductIntgral;
            } else if (val === IntgralSelectEnum.company) {
                DeductionIntegral! = this.getCompanyDeduction().totalCompanyDeductIntgral;
            }

            this.dispatch({ type: "input", data: { selectDucType: val, DeductionIntegral: DeductionIntegral } });
        };

        /**
         * 个人
         */
        getPersonDeduction() {
            let { state } = this.props,
                resourceConfigure = state!.resourceConfigure,
                IntegralWorth = state!.IntegralWorth,
                userIntergral = state!.userIntergral,
                roomdetail = state!.roomdetail,
                couponSelect = state!.couponSelect;
            let totalPrice: any = Number(this.getTotalPrice()); // 总价
            let couponDeduction = couponSelect ? (couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice) : 0; // 优惠券抵扣;
            // console.log(resourceConfigure, IntegralWorth, userIntergral, roomdetail, couponSelect, couponDeduction, totalPrice)
            if (roomdetail && userIntergral) {
                let maxDeductPrice = (+Number.parseFloat(`${totalPrice - couponDeduction.toFixed(2)}`).toFixed(2) * resourceConfigure.integralDeductRatio) / 100;
                let maxDeductIntegral = (IntegralWorth * Math.ceil(maxDeductPrice * 100)) / 100;
                //
                // console.log(maxDeductPrice, maxDeductIntegral, maxDeductPrice * 100,  Math.floor(maxDeductPrice * 100))
                if (userIntergral.personalAvailableIntegral > maxDeductIntegral) {
                    maxDeductPrice = Math.ceil(+Number.parseFloat(`${totalPrice - couponDeduction}`).toFixed(2) * resourceConfigure.integralDeductRatio) / 100;
                    maxDeductIntegral = IntegralWorth * maxDeductPrice;

                    return {
                        totalPersonDeductIntgral: parseInt(maxDeductIntegral.toFixed(2), 10),
                        totalPersonDeductPrice: maxDeductPrice,
                    };
                } else {
                    maxDeductPrice = Math.ceil((userIntergral.personalAvailableIntegral * 100) / IntegralWorth) / 100;
                    maxDeductIntegral = IntegralWorth * maxDeductPrice;
                    return {
                        totalPersonDeductIntgral: parseInt(maxDeductIntegral.toFixed(2), 10),
                        totalPersonDeductPrice: maxDeductPrice,
                    };
                }
            }
            return {};
        }

        /**
         * 公司
         */
        getCompanyDeduction() {
            let { state } = this.props,
                resourceConfigure = state!.resourceConfigure,
                IntegralWorth = state!.IntegralWorth,
                userIntergral = state!.userIntergral,
                roomdetail = state!.roomdetail,
                couponSelect = state!.couponSelect;
            let totalPrice: any = Number(this.getTotalPrice()); // 不算优惠券的总价
            let couponDeduction = couponSelect ? (couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice) : 0; // 优惠券抵扣;

            if (roomdetail && userIntergral) {
                let maxDeductPrice = (+Number.parseFloat(`${totalPrice - couponDeduction.toFixed(2)}`).toFixed(2) * resourceConfigure.integralDeductRatio) / 100;
                let maxDeductIntegral = (IntegralWorth * Math.floor(maxDeductPrice * 100)) / 100;
                if (userIntergral.companyAvailableIntegral > maxDeductIntegral) {
                    maxDeductPrice = Math.ceil(+Number.parseFloat(`${totalPrice - couponDeduction}`).toFixed(2) * resourceConfigure.integralDeductRatio) / 100;
                    maxDeductIntegral = IntegralWorth * maxDeductPrice;
                    return {
                        totalCompanyDeductIntgral: parseInt(maxDeductIntegral.toFixed(2), 10),
                        totalCompanyDeductPrice: maxDeductPrice,
                    };
                } else {
                    maxDeductPrice = Math.ceil((userIntergral.companyAvailableIntegral * 100) / IntegralWorth) / 100;
                    maxDeductIntegral = IntegralWorth * maxDeductPrice;
                    return {
                        totalCompanyDeductIntgral: parseInt(maxDeductIntegral.toFixed(2), 10),
                        totalCompanyDeductPrice: maxDeductPrice,
                    };
                }
            }
            return {};
        }

        getDeuExtra(selectDucType: number): React.ReactNode {
            if (selectDucType === IntgralSelectEnum.none) {
                return <span>不使用积分优惠</span>;
            } else if (selectDucType === IntgralSelectEnum.person) {
                return (
                    <span className="color-orange ">
                        可用<span className="ml5 mr5">{this.getPersonDeduction().totalPersonDeductIntgral}</span>积分，抵用
                        <span className="ml5 mr5">{this.getPersonDeduction().totalPersonDeductPrice}</span>元（个人）
                    </span>
                );
            } else if (selectDucType === IntgralSelectEnum.company) {
                return (
                    <span className="color-orange ">
                        可用<span className="ml5 mr5">{this.getCompanyDeduction().totalCompanyDeductIntgral}</span>积分，抵用
                        <span className="ml5 mr5">{this.getCompanyDeduction().totalCompanyDeductPrice}</span>元（企业）
                    </span>
                );
            }

            return null;
        }

        renderCouponDeduction(): React.ReactNode {
            let { state } = this.props,
                roomdetail = state!.roomdetail,
                couponSelect = state!.couponSelect;
            let totalPrice = this.getTotalPrice2(); // 不算优惠券的总价
            return (
                roomdetail.config.isCouponDeduction && (
                    <List.Item arrow="horizontal" onClick={this.showCoupon.bind(this)}>
                        <Flex>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                使用优惠券
                            </NoticeBar>
                            <Flex.Item className="omit omit-1 gray-four-color" style={{ textAlign: "right" }}>
                                <span>
                                    {couponSelect ? (
                                        <span className="color-orange">{`已选${couponSelect.couponNum}张优惠券，抵扣${
                                            couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice.toFixed(2)
                                        }元`}</span>
                                    ) : (
                                        "不使用优惠券"
                                    )}
                                </span>
                            </Flex.Item>
                        </Flex>
                    </List.Item>
                )
            );
        }
        renderIntegralDeduction(): React.ReactNode {
            let { state } = this.props,
                roomdetail = state!.roomdetail,
                selectDucType = state!.selectDucType;
            return (this.getPersonDeduction().totalPersonDeductPrice! >= 0.01 || this.getCompanyDeduction().totalCompanyDeductPrice! > 0.01) &&
                roomdetail.config.isIntegralDeduction ? (
                <List.Item
                    arrow="horizontal"
                    wrap
                    onClick={(e) => {
                        e.preventDefault(); // 修复 Android 上点击穿透
                        this.onOpenChangeTwo(true);
                    }}
                >
                    <Flex>
                        <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                            积分优惠
                        </NoticeBar>
                        <Flex.Item className="omit omit-1 gray-four-color" style={{ textAlign: "right" }}>
                            {this.getDeuExtra(selectDucType)}
                        </Flex.Item>
                    </Flex>
                </List.Item>
            ) : null;
        }
        /**
         * 优惠信息
         */
        renderPreferentialFormView(): React.ReactNode {
            let { state } = this.props,
                roomdetail = state!.roomdetail;

            if (roomdetail) {
                return roomdetail &&
                    parseFloat(this.getTotalPrice()) > 0 &&
                    (roomdetail.config.isCouponDeduction ||
                        (roomdetail.config.isIntegralDeduction &&
                            (this.getPersonDeduction().totalPersonDeductPrice! >= 0.01 || this.getCompanyDeduction().totalCompanyDeductPrice! > 0.01))) ? (
                    <>
                        <WhiteSpace className="default-gray-bg gray" />
                        <List
                            className="room-16 extra-auto"
                            renderHeader={
                                <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                    优惠信息
                                </NoticeBar>
                            }
                        >
                            {this.renderCouponDeduction()}
                            {this.renderIntegralDeduction()}
                        </List>
                    </>
                ) : null;
            }
            return null;
        }

        renderUserFormView(): React.ReactNode {
            let { state } = this.props;
            const name = state!.name,
                mobile = state!.mobile,
                email = state!.email,
                company = state!.company;
            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />

                    <List
                        renderHeader={
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                预订人信息
                            </NoticeBar>
                        }
                    >
                        <InputItem clear placeholder="请输入姓名" value={name} onChange={(value) => this.dispatch({ type: "input", data: { name: value } })}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                姓名<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                        <InputItem clear placeholder="请输入手机号码" value={mobile} type="number" onChange={(value) => this.dispatch({ type: "input", data: { mobile: value } })}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                手机号码<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                        <InputItem clear placeholder="请输入邮箱" value={email} onChange={(value) => this.dispatch({ type: "input", data: { email: value } })}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                邮箱<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                        <InputItem clear placeholder="请输入公司名称" value={company} onChange={(value) => this.dispatch({ type: "input", data: { company: value } })}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                公司名称<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                    </List>
                    <WhiteSpace className="default-gray-bg gray" />
                </>
            );
        }

        /**
         * 验证
         */
        check() {
            let { state } = this.props;
            const name = state!.name,
                mobile = state!.mobile,
                company = state!.company,
                Email = state!.email,
                startTime = state!.startTime,
                endTime = state!.endTime,
                { cellphone, required, composeControl, email, ValidatorControl } = Validators;

            return ValidatorControl(
                composeControl([required], { value: startTime, name: "预订时间" }),
                composeControl([required], { value: endTime, name: "预订时间" }),
                composeControl([required], { value: name, name: "姓名" }),
                composeControl([required, cellphone], { value: mobile, name: "手机号码" }),
                composeControl([required, email], { value: Email, name: "邮箱" }),
                composeControl([required], { value: company, name: "公司名称" })
            );
        }

        /**
         * 校验其他数据
         * @returns true if extra
         */
        checkExtra(): boolean {
            const { state } = this.props,
                check = state!.check,
                invoice = state!.invoice;
            if (check && !invoice) {
                Toast.fail("请选择发票!", 1);
                return false;
            }
            return true;
        }

        renderFooterView(): React.ReactNode {
            let id = this.props.match!.params.detailid;
            let resourceType = this.props.match!.params.resourceType;
            let { state } = this.props,
                roomdetail = state!.roomdetail,
                couponSelect = state!.couponSelect,
                orderResult = state!.orderResult;
            let totalPrice: any = this.getTotalPrice2(); // 不算优惠券的总价
            let couponDeduction = couponSelect ? (couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice) : 0; // 优惠券抵扣
            return (
                <Flex className="flex-collapse white">
                    {this.totoalRoomPrice ? (
                        <div className="resouce-footer">
                            <div className="total">合计：</div>
                            <div className="price">
                                ¥{roomdetail ? ((+Number.parseFloat(totalPrice).toFixed(2) * 100 - +Number.parseFloat(couponDeduction).toFixed(2) * 100) / 100).toFixed(2) : 0}
                            </div>
                        </div>
                    ) : null}
                    <Flex.Item className="margin-0">
                        <Button
                            type={"primary"}
                            className=" button-no-radius"
                            onClick={() => {
                                const msg = this.check()!();
                                if (msg) {
                                    Toast.fail(msg.join(), 1);
                                    return;
                                }
                                if (!this.checkExtra()) {
                                    return;
                                }

                                if (orderResult) {
                                    this.showPayActionSheet(deepClone(orderResult));
                                } else {
                                    this.dispatch({
                                        type: "roomSubmitAction",
                                        state: state,
                                        id: id,
                                        successcallback: (e) => {
                                            Number(resourceType) === InvoiceEnum.personalInvoice
                                                ? setEventWithLabel(statisticsEvent.serviceMeetingSbmitOrders)
                                                : setEventWithLabel(statisticsEvent.serviceSiteSbmitOrders);
                                            this.showPayActionSheet(e);
                                        },
                                    });
                                }
                            }}
                        >
                            提交订单
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        renderFooter(): React.ReactNode {
            return this.renderFooterView();
        }

        renderHeader(): React.ReactNode {
            let { state } = this.props,
                orderResult = state!.orderResult;

            return (
                <NavBar
                    className="park-nav"
                    icon={
                        <Icon
                            onClick={() => {
                                if (orderResult) {
                                    history.go(-2);
                                } else {
                                    this.goBack();
                                }
                            }}
                            type="left"
                        />
                    }
                    leftContent={this.renderHeaderLeft() as any}
                >
                    {`${getResourceTitle(this.props.match!.params.resourceType)}预订`}
                </NavBar>
            );
        }

        showPayActionSheet(order: any) {
            let { state } = this.props;
            let selectDucType = state!.selectDucType;
            let couponSelect = state!.couponSelect;
            let roomdetail = state!.roomdetail;
            const loyaltyDeu =
                selectDucType === IntgralSelectEnum.person
                    ? this.getPersonDeduction()?.totalPersonDeductPrice
                    : selectDucType === IntgralSelectEnum.company
                    ? this.getCompanyDeduction()?.totalCompanyDeductPrice
                    : 0;

            if (order.totalAmount !== 0) {
                order.meetingItems = this.getMeetingItems();
                order.loyaltyDeu = loyaltyDeu;
                appPaySheet(order, this, true);
            } else if (order.totalAmount === 0 && (selectDucType || couponSelect)) {
                Toast.success("提交成功!", 1, () => history.go(-2));
            } else {
                if (roomdetail && roomdetail.config && roomdetail.config.isAudit) {
                    this.goTo(`resourceSubmitSucceed/${order.id}/review`);
                } else {
                    this.goTo(`resourceSubmitSucceed/${order.id}/freesuccess`);
                }
            }
        }

        renderInvoice(): React.ReactNode {
            let { state } = this.props;
            let invoiceOpen = state!.invoiceOpen;
            let invoiceType = state!.invoiceType;
            const invoiceProps: any = {
                isOpen: () => invoiceOpen,
                close: () => {
                    this.onOpenChangeFive(false);
                },
                selectedcallback: (data: any) => {
                    this.dispatch({ type: "input", data: { invoice: data } });
                    this.onOpenChangeFive(false);
                },
                goAdd: () => {
                    setTimeout(() => this.goTo("invoice/edit/0/" + invoiceType), 100);
                    this.dispatch({ type: "input", data: { isAdd: true } });
                },
                invoiceType: invoiceType,
            };
            return this.renderEmbeddedView(InvoiceSelect.Page as any, { ref: "selectInvoice", ...invoiceProps });
        }

        getDiscount() {
            return [
                {
                    value: 1,
                    label: (
                        <div>
                            可用<i>{this.getPersonDeduction().totalPersonDeductIntgral}</i>积分，抵用<i>{this.getPersonDeduction().totalPersonDeductPrice}</i>元（个人）
                        </div>
                    ),
                },
                {
                    value: RoomTypeEnum.workingType,
                    label: (
                        <div>
                            可用<i>{this.getCompanyDeduction().totalCompanyDeductIntgral}</i>
                            积分，抵用<i>{this.getCompanyDeduction().totalCompanyDeductPrice}</i>
                            元（企业）
                        </div>
                    ),
                },
                { value: 0, label: "不使用积分优惠" },
            ];
        }

        renderIntergralModal(): React.ReactNode {
            let { state } = this.props;
            let modal1 = state!.modal1;
            let selectDucType = state!.selectDucType;

            return (
                <Modal className="discount-modal" popup visible={modal1} onClose={() => this.onOpenChangeTwo(false)} animationType="slide-up">
                    <List className="choose-discount" renderHeader={"积分优惠选择"}>
                        {this.getDiscount().map((i) => (
                            <Radio.RadioItem key={i.value} checked={selectDucType === i.value} onChange={this.onChange.bind(this, i.value)}>
                                <div className="discount-name">{i.label}</div>
                            </Radio.RadioItem>
                        ))}
                    </List>
                    <Flex className="flex-collapse row-collapse">
                        <Flex.Item>
                            <Button onClick={() => this.onOpenChangeTwo(false)}>取消</Button>
                        </Flex.Item>
                        <Flex.Item>
                            <Button type={"primary"} onClick={() => this.onOpenChangeTwo(false)}>
                                确定
                            </Button>
                        </Flex.Item>
                    </Flex>
                </Modal>
            );
        }

        renderServiceConfigureMap(roomdetail): React.ReactNode {
            return (
                roomdetail &&
                roomdetail.service &&
                roomdetail.service.map((item, i) => {
                    if (item.selecCount) {
                        return (
                            <div key={i} className="row room-order-conigure">
                                <span className="name">{item.serviceName}</span>
                                <span className="count">{item.selecCount}</span>
                                <span className="price">¥{(item.selecCount * item.price).toFixed(2)}</span>
                            </div>
                        );
                    }
                })
            );
        }

        renderServiceConfigure(): React.ReactNode {
            let { state } = this.props;
            let roomdetail = state!.roomdetail;
            return this.getSelecConfigureCount(roomdetail) !== 0 ? (
                <>
                    <List
                        className="room-details"
                        renderHeader={
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                可选服务结算
                            </NoticeBar>
                        }
                    >
                        <List.Item>
                            <div className="bd">
                                <div className="tit">
                                    <span>名称</span>
                                    <span>数量</span>
                                    <span>总价</span>
                                </div>
                                {this.renderServiceConfigureMap(roomdetail)}
                                <div className="bt">
                                    <span>总额</span>
                                    <span>{this.getSelecConfigureCount(roomdetail)}</span>
                                    <span>¥{this.getSelecConfigurePrice(roomdetail).toFixed(2)}</span>
                                </div>
                            </div>
                        </List.Item>
                    </List>
                    <WhiteSpace className="default-gray-bg gray" />
                </>
            ) : null;
        }

        renderRoomExpend(): React.ReactNode {
            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />
                    <List
                        className="room-details"
                        renderHeader={
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                {getResourceTitle(this.props.match!.params.resourceType)}结算
                            </NoticeBar>
                        }
                    >
                        {this.totoalRoomPrice ? (
                            <List.Item>
                                <div className="bd">
                                    <div className="tit">
                                        <span>时段</span>
                                        <span>时长</span>
                                        <span>总价</span>
                                    </div>
                                    {this.renderMeetingItems()}
                                    <div className="bt">
                                        <span>总额</span>
                                        <span>{this.totoalRoomHours && this.totoalRoomHours.toFixed(2)}小时</span>
                                        <span>¥{this.totoalRoomPrice ? parseFloat(this.totoalRoomPrice).toFixed(2) : 0}</span>
                                    </div>
                                </div>
                            </List.Item>
                        ) : (
                            <List.Item>
                                <div className="bd">
                                    <div className="tit">
                                        <span>时段</span>
                                        <span>时长</span>
                                    </div>
                                    {this.renderFreeMeetingItems()}
                                    <div className="bt">
                                        <span>总计</span>
                                        <span>{this.totoalRoomHours && this.totoalRoomHours.toFixed(2)}小时</span>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    </List>
                </>
            );
        }
        renderCouponModal(): React.ReactNode {
            let resourceType = this.props.match!.params.resourceType;
            let { state } = this.props;
            let couponOpen = state!.couponOpen,
                selectDucType = state!.selectDucType;
            const invoiceProps: any = {
                isOpen: () => (couponOpen ? couponOpen : false),
                close: () => {
                    this.onOpenChange(false);
                },
                selectedcallback: (data: any) => {
                    this.onOpenChange(false);
                    this.dispatch({ type: "input", data: { couponSelect: data } });
                    synchronousSerial(() => {
                        this.onChange(selectDucType);
                    });
                },
                sceneCode: Number(resourceType) === ResourceTypeEnum.meeting ? "meetingRoom" : "yard",
                orderAmount: this.getTotalPrice2(),
            };
            return this.renderEmbeddedView(CouponChoice.Page as any, { ref: "selectInvoice", ...invoiceProps });
        }

        renderBody(): React.ReactNode {
            let { state } = this.props;
            let couponOpen = state!.couponOpen;
            return (
                <div className="example-list">
                    {/*会议室结算*/}
                    {this.renderRoomExpend()}
                    {/*可选服务结算*/}
                    {this.renderServiceConfigure()}
                    {this.renderRemarkFormView()}
                    {/*发票信息注释*/}
                    {this.renderInvoiceFormView()}
                    {/*优惠信息*/}
                    {this.renderPreferentialFormView()}
                    {couponOpen && this.renderCouponModal()}
                    {/*用户信息*/}
                    {this.renderUserFormView()}
                    {/*积分*/}
                    {this.renderIntergralModal()}
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.roomorder]);
}
