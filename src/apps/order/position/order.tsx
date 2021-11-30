import React from "react";

import { NavBar, Modal, Icon, List, TextareaItem, Flex, Switch, InputItem, WhiteSpace, Button, Toast, Picker, DatePicker, Radio, NoticeBar } from "antd-mobile-v2";

import { template, formatDate, formatNow, Validators, getDate, getLocalStorage, formatDateTime } from "@reco-m/core";

import { ViewComponent, setEventWithLabel, androidExit } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { invoiceSubject, comOrPerSubject } from "@reco-m/invoice-models";
import { InvoiceTitleTypeEnum, ComOrPerTitleTypeEnum, synchronousSerial } from "@reco-m/ipark-common";
import { InvoiceSelect } from "@reco-m/invoice-common";

import { appPaySheet, appPaySheetClose } from "@reco-m/order-common";

import {
    START_TIME,
    END_TIME,
    Namespaces,
    getResourceTitle,
    ResourceOrderIntergralTypeEnum,
    ResourceOrderIInvoiceTypeEnum,
    PriceUnitEnum,
    positionorderModel,
    IntgralSelectEnum,
    RoomTypeEnum,
} from "@reco-m/order-models";

import { CouponChoice } from "@reco-m/coupon-common";
import { Namespaces as couponNamespaces } from "@reco-m/coupon-models";

import { ResourceTypeEnum } from "@reco-m/ipark-common";

import { getRequestParams } from "./common";

export namespace PositionOrder {
    const RadioItem = Radio.RadioItem;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        change?(type: any);
    }

    export interface IState extends ViewComponent.IState, positionorderModel.StateType {
        location: { pathname?: string; search?: string; hash?: string; state?: any };
        form: {
            orderRemark?: any;
            check?: boolean;
            invoiceType?: any;
            num?: string;
            name?: string;
            mobile?: string;
            email?: string;
            company?: string;
            comOrPerType?: any;
        };
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        showheader = false;
        namespace = Namespaces.positionorder;
        path: any;
        startDate: any;

        get dayPriceType() {
            return Number(this.props.match!.params.dayPriceType);
        }

        componentMount() {
            if (this.isAuth()) {
                this.getDate();
            } else {
                this.goTo("login");
            }
            this.startDate = this.getSearchParam("startDate");
        }

        componentWillUnmount() {
            this.dispatch({
                type: "input",
                data: {
                    startTime: null,
                    endTime: null,
                    resourceOrder: null,
                    message: null,
                    isAdd: false,
                    invoice: "",
                    isManager: false,
                    selectDucType: 0,
                    detail: null,
                    member: "",
                    num: "",
                    orderRemark: "",
                    invoiceType: "",
                    result: "",
                    check: false,
                    comOrPerType: null,
                    title: "",
                    taxID: "",
                    bankAccount: "",
                    bankName: "",
                    couponSelect: null,
                },
            });
            this.dispatch({ type: `${couponNamespaces.couponchice}/init` });
            this.dispatch({ type: "invoiceTitleEdit/init" });
            this.dispatch({ type: "clearErrorToast" });
            this.dispatch({
                type: "couponchice/input",
                data: { selectCouponTypeID: [], selectID: {} },
            });
            appPaySheetClose(this);
        }

        onChange = (val) => {
            let DeductionIntegral: any = 0;
            if (val === ResourceOrderIntergralTypeEnum.none) {
                DeductionIntegral = 0;
            } else if (val === ResourceOrderIntergralTypeEnum.person) {
                DeductionIntegral! = this.getPersonDeduction().totalPersonDeductIntgral;
            } else if (val === ResourceOrderIntergralTypeEnum.company) {
                DeductionIntegral! = this.getCompanyDeduction().totalCompanyDeductIntgral;
            }
            this.dispatch({ type: "input", data: { selectDucType: val, DeductionIntegral: DeductionIntegral } });
        };

        getDate() {
            let start: any;
            let end: any;

            if (this.dayPriceType === PriceUnitEnum.perDay) {
                // 元/个/天
                start = getLocalStorage("ResourceStartDate") ? getLocalStorage("ResourceStartDate") : formatNow() + START_TIME;
                end = getLocalStorage("ResourceendDate") ? getLocalStorage("ResourceendDate") : formatNow() + END_TIME;
            } else if (this.dayPriceType === PriceUnitEnum.perMonth) {
                // 元/个/月
                start = getLocalStorage("ResourceStartDate") ? getLocalStorage("ResourceStartDate") : formatNow() + START_TIME;
                end = formatDate(getDate(start)!.dateAdd("m", 1).dateAdd("d", -1), "yyyy/MM/dd") + END_TIME;
            }
            const parmas = getRequestParams(this.props, this.paramCallback.bind(this), start, end);
            this.dispatch({ type: `initPage`, data: { detailid: this.props.match!.params.detailid, params: parmas } });
        }

        paramCallback(start: any, end: any) {
            this.dispatch({ type: "input", data: { startDate: formatDate(start), endDate: formatDate(end) } });
        }

        getPriceUnit(detail: any) {
            return detail.priceUnit === PriceUnitEnum.perDay ? "元/个/天" : detail.priceUnit === PriceUnitEnum.perMonth ? "元/个/月" : "";
        }

        onStartDate(date: any, v: any) {
            const { state } = this.props,
                detail = state!.detail;

            let startDate = formatDate(date, "yyyy/MM/dd") + " 00:00:00",
                endDate;

            let resourceType = this.props.match!.params.resourceType;

            if (detail && detail.priceUnit === PriceUnitEnum.perDay) {
                endDate = formatDate(date, "yyyy/MM/dd") + " 23:59:59";
            } else if (detail.priceUnit === PriceUnitEnum.perMonth) {
                endDate = formatDate(v.dateAdd("m", 1).dateAdd("d", -1), "yyyy/MM/dd") + " 23:59:59";
            }

            this.dispatch({
                type: "getResourceStatusAction",
                resourcedeta: getRequestParams(this.props, this.paramCallback.bind(this), startDate, endDate),
            });
            this.dispatch({
                type: "couponchice/getMemberOrderUseCoupon",
                sceneCode: Number(resourceType) === ResourceTypeEnum.working ? ["station", "all"] : ["adsense", "all"],
                orderAmount: this.etIntervalPrice2(getDate(startDate + " 00:00:00")!, getDate(endDate + " 23:59:00")!),
            });
            const parmas = getRequestParams(this.props, this.paramCallback.bind(this), startDate, endDate);
            this.dispatch({ type: "getResourceDetailAction", id: this.props.match!.params.detailid, params: parmas });
        }

        onEndDate(date: any) {
            const { state } = this.props,
                startDated = state!.startDate;

            let startDate = formatDate(startDated, "yyyy/MM/dd") + " 00:00:00",
                endDate = formatDate(date, "yyyy/MM/dd") + " 23:59:59";
            let resourceType = this.props.match!.params.resourceType;

            if (startDate > endDate) {
                Toast.fail("开始时间不能大于结束时间");
                return;
            }

            this.dispatch({
                type: "getResourceStatusAction",
                resourcedeta: getRequestParams(this.props, this.paramCallback.bind(this), startDate, endDate),
            });
            this.dispatch({
                type: "couponchice/getMemberOrderUseCoupon",
                sceneCode: Number(resourceType) === ResourceTypeEnum.working ? ["station", "all"] : ["adsense", "all"],
                orderAmount: this.etIntervalPrice2(getDate(startDate + " 00:00:00")!, getDate(endDate + " 23:59:00")!),
            });
        }

        renderHeaderView(): React.ReactNode {
            const { state } = this.props,
                detail = state!.detail;

            return (
                <List>
                    <List.Item>
                        <div>{detail && detail.resourceName}</div>
                        <span className="color-orange size-14">
                            {detail && detail.price ? detail.price : "免费"}
                            {detail && detail.price ? this.getPriceUnit(detail) : ""}
                        </span>
                    </List.Item>
                </List>
            );
        }

        etIntervalPrice2(startDate: any, endDate: any, number?) {
            const { state } = this.props,
                selectDucType = state!.selectDucType,
                total = +this.etIntervalPrice(startDate, endDate, number)!;
            if (isNaN(total)) return null;

            if (selectDucType === IntgralSelectEnum.none) {
                return total.toFixed(2);
            } else if (selectDucType === IntgralSelectEnum.person) {
                return (Number(total.toFixed(2)) - Number(this.getPersonDeduction().totalPersonDeductPrice)).toFixed(2);
            } else if (selectDucType === IntgralSelectEnum.company) {
                return (Number(total.toFixed(2)) - Number(this.getCompanyDeduction().totalCompanyDeductPrice)).toFixed(2);
            }

            return total.toFixed(2);
        }

        renderStartDatePicker(startDate: any): React.ReactNode {
            const { state } = this.props,
                resourceConfigure = state!.resourceConfigure;

            let maxDate = new Date();
            if (resourceConfigure) {
                if (this.dayPriceType === PriceUnitEnum.perMonth) {
                    maxDate = maxDate.dateAdd("m", resourceConfigure.bookingDay);
                } else {
                    maxDate = maxDate.dateAdd("d", resourceConfigure.bookingDay - 1); // 获取可预定日期
                }
            } else {
                maxDate.setDate(maxDate.getDate() + 365); // 可预定一年
            }
            return (
                <DatePicker mode="date" minDate={new Date()} maxDate={maxDate} onOk={(v) => this.onStartDate(formatDateTime(v, "yyyy/MM/dd"), v)}>
                    <InputItem value={startDate && formatDate(startDate, "yyyy-MM-dd")} placeholder="请选择开始日期" editable={false}>
                        <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                            开始日期
                        </NoticeBar>
                    </InputItem>
                </DatePicker>
            );
        }

        renderEndDatePicker(startDate: any, endDate: any): React.ReactNode {
            const { state } = this.props,
                resourceConfigure = state!.resourceConfigure;

            let maxDate = new Date();
            if (resourceConfigure) {
                if (this.dayPriceType === PriceUnitEnum.perMonth) {
                    maxDate = maxDate.dateAdd("m", resourceConfigure.bookingDay);
                } else {
                    maxDate = maxDate.dateAdd("d", resourceConfigure.bookingDay - 1); // 获取可预定日期
                }
            } else {
                maxDate.setDate(maxDate.getDate() + 365); // 可预定一年
            }
            return (
                <DatePicker
                    mode="date"
                    minDate={
                        this.dayPriceType === PriceUnitEnum.perDay
                            ? startDate
                                ? new Date(startDate)
                                : new Date()
                            : startDate
                            ? new Date(startDate).dateAdd("m", 1).dateAdd("d", -1)
                            : new Date()
                    }
                    maxDate={maxDate}
                    onOk={(v) => {
                        this.onEndDate(formatDateTime(v, "yyyy/MM/dd"));
                    }}
                >
                    <InputItem value={endDate && formatDate(endDate, "yyyy-MM-dd")} placeholder="请选择结束日期" editable={false}>
                        <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                            结束日期
                        </NoticeBar>
                    </InputItem>
                </DatePicker>
            );
        }
        getTotalPriceDed() {
            const { state } = this.props,
                startDate = state!.startDate,
                endDate = state!.endDate,
                detail = state!.detail,
                couponSelect = state!.couponSelect;
            let totalPrice: any = this.etIntervalPrice2(getDate(startDate + " 00:00:00")!, getDate(endDate + " 23:59:00")!); // 不算优惠券的总价
            let couponDeduction = couponSelect ? (couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice) : 0; // 优惠券抵扣
            return detail ? ((totalPrice * 100 - couponDeduction * 100) / 100).toFixed(2) : 0;
        }
        renderOrderFormView(): React.ReactNode {
            const { state } = this.props,
                startDate = state!.startDate,
                endDate = state!.endDate,
                num = state!.num,
                resourceStatus = state!.resourceStatus,
                type = this.props.match!.params.resourceType;

            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />
                    <List
                        className="invoice"
                        renderHeader={
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                预订信息
                            </NoticeBar>
                        }
                    >
                        {/*广告位(4)只有一个，工位(2)可以设定编号*/}
                        {Number(type) === ResourceTypeEnum.advertisement ? (
                            ""
                        ) : (
                            <InputItem
                                clear
                                placeholder={resourceStatus && resourceStatus.length + "个可被预订（必填）"}
                                value={num}
                                type="number"
                                onChange={(value) => {
                                    if (value > resourceStatus.length) {
                                        Toast.fail("工位数量不足,请重新填写预订个数");
                                        this.dispatch({ type: "input", data: { num: null } });
                                    } else {
                                        this.dispatch({ type: "input", data: { num: value } });

                                        this.dispatch({
                                            type: "couponchice/getMemberOrderUseCoupon",
                                            sceneValue: Number(type) === ResourceTypeEnum.working ? ["station", "all"] : ["adsense", "all"],
                                            orderAmount: this.etIntervalPrice2(getDate(startDate + " 00:00:00")!, getDate(endDate + " 23:59:00")!, value),
                                        });
                                    }
                                }}
                            >
                                <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                    预订个数
                                </NoticeBar>
                            </InputItem>
                        )}
                        {this.renderStartDatePicker(startDate)}
                        {this.renderEndDatePicker(startDate, endDate)}
                        <List.Item>
                            <div className="text-right">
                                总计金额：<span className="color-orange">¥{this.getTotalPriceDed()}</span>
                            </div>
                        </List.Item>
                    </List>
                </>
            );
        }

        renderRemarkFormView(): React.ReactNode {
            return (
                <>
                    <WhiteSpace className="default-gray-bg gray" />
                    <List
                        className="room-14"
                        renderHeader={
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                备注信息
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
                    <WhiteSpace className="default-gray-bg gray" />
                </>
            );
        }

        companyOrPersonChange(value) {
            this.dispatch({ type: "input", data: { invoice: null, title: "", taxID: "", bankAccount: "", bankName: "" } });
            this.dispatch({ type: "invoiceTitleEdit/init" });
            if (value && value.length > 0)
                if (value[0] === undefined) {
                    this.dispatch({ type: "input", data: { comOrPerType: ComOrPerTitleTypeEnum.company } });
                } else {
                    if (value[0] === ResourceOrderIInvoiceTypeEnum.company) {
                        this.dispatch({ type: "input", data: { invoiceType: undefined } });
                    } else if (value[0] === ResourceOrderIInvoiceTypeEnum.person) {
                        this.dispatch({ type: "input", data: { invoiceType: InvoiceTitleTypeEnum.personInvoice } });
                    }
                    this.dispatch({ type: "input", data: { comOrPerType: value[0] } });
                }
        }

        renderCompanyOrPerson(): React.ReactNode {
            const { state } = this.props,
                comOrPerType = state!.comOrPerType,
                check = state!.check,
                subject = comOrPerType ? comOrPerSubject.filter((item) => item.value === comOrPerType)[0].label : "";
            const invoiceShow = state!.invoiceShow;
            return check ? (
                <div className="invoice">
                    <Picker
                        title="请选择发票主体"
                        data={comOrPerSubject}
                        value={[comOrPerType]}
                        visible={invoiceShow}
                        onVisibleChange={() => this.onOpenChangeThree(!invoiceShow)}
                        cols={1}
                        onChange={(value) => {
                            this.companyOrPersonChange(value);
                        }}
                    >
                        <InputItem clear editable={false} placeholder="请选择" value={subject} onClick={() => this.onOpenChangeThree(true)}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                发票主体
                            </NoticeBar>
                        </InputItem>
                    </Picker>
                </div>
            ) : null;
        }

        renderSpecialUse(invoice: any) {
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

        renderCommon(invoice: any) {
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
            let subject = invoiceType ? invoiceSubject && invoiceSubject.filter((item) => item.value === invoiceType)[0]?.label : "";
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

        mainIncoiceItem(value) {
            this.dispatch({ type: "input", data: { invoice: "", title: "", taxID: "", bankAccount: "", bankName: "" } });
            this.dispatch({ type: "invoiceTitleEdit/init" });
            if (value && value.length > 0)
                if (value[0] === undefined) {
                    this.dispatch({ type: "input", data: { invoiceType: InvoiceTitleTypeEnum.speciallyInvoice } });
                } else {
                    this.dispatch({ type: "input", data: { invoiceType: value[0] } });
                }
        }

        showInvoice() {
            (document.activeElement as any)!.blur();
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
            let detail = state!.detail;
            const check = state!.check;
            return detail && +this.getTotalPriceDed() ? (
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
        renderUserFormView(): React.ReactNode {
            const { state } = this.props,
                name = state!.name,
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
                        <InputItem clear placeholder="请输入姓名（必填）" value={name} onChange={(value) => this.dispatch({ type: "input", data: { name: value } })}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                姓名<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                        <InputItem
                            clear
                            placeholder="请输入手机号码（必填）"
                            value={mobile}
                            type="number"
                            onChange={(value) => this.dispatch({ type: "input", data: { mobile: value } })}
                        >
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                手机号码<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                        <InputItem clear placeholder="请输入邮箱（必填）" value={email} onChange={(value) => this.dispatch({ type: "input", data: { email: value } })}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                邮箱<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                        <InputItem clear placeholder="请输入公司名称（必填）" value={company} onChange={(value) => this.dispatch({ type: "input", data: { company: value } })}>
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                公司名称<span className="color-red">*</span>
                            </NoticeBar>
                        </InputItem>
                    </List>
                    <WhiteSpace className="default-gray-bg gray" />
                </>
            );
        }

        etIntervalPrice(startDate: any, endDate: any, number?) {
            const { state } = this.props,
                detail = state!.detail,
                num = number || state!.num,
                type = +this.props.match!.params.resourceType;

            if (type === ResourceTypeEnum.working) {
                if (detail && detail.price && num) {
                    if (this.dayPriceType === PriceUnitEnum.perDay) {
                        // 元/个/天
                        return (endDate.dateDiff("d", startDate) * detail.price * parseInt(num, 10)).toFixed(2);
                    } else if (this.dayPriceType === PriceUnitEnum.perMonth) {
                        // 元/个/月
                        let year = endDate.getFullYear() - startDate.getFullYear(),
                            month = endDate.getMonth() - startDate.getMonth(),
                            day = endDate.getDate() - startDate.getDate();

                        return (day >= 0 ? (12 * year + month + 1) * detail.price * parseInt(num, 10) : (12 * year + month) * detail.price * parseInt(num, 10)).toFixed(2);
                    }
                } else {
                    return "";
                }
            } else {
                if (detail && detail.price) {
                    if (this.dayPriceType === PriceUnitEnum.perDay) {
                        // 元/个/天
                        return (endDate.dateDiff("d", startDate) * detail.price).toFixed(2);
                    } else if (this.dayPriceType === PriceUnitEnum.perMonth) {
                        // 元/个/月
                        let year = endDate.getFullYear() - startDate.getFullYear();
                        let month = endDate.getMonth() - startDate.getMonth();
                        let day = endDate.getDate() - startDate.getDate();
                        return (day >= 0 ? (12 * year + month + 1) * detail.price : (12 * year + month) * detail.price).toFixed(2);
                    }
                } else {
                    return "";
                }
            }
        }
        /**
         * 个人
         */
        getPersonDeduction() {
            let { state } = this.props,
                resourceConfigure = state!.resourceConfigure,
                IntegralWorth = state!.IntegralWorth,
                userIntergral = state!.userIntergral,
                detail = state!.detail,
                couponSelect = state!.couponSelect;
            let totalPrice: any = Number(this.getTotalPrice()); // 总价
            let couponDeduction = couponSelect ? (couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice) : 0; // 优惠券抵扣;

            if (detail && userIntergral) {
                let maxDeductPrice = (+Number.parseFloat(`${totalPrice - couponDeduction.toFixed(2)}`).toFixed(2) * resourceConfigure.integralDeductRatio) / 100;
                let maxDeductIntegral = (IntegralWorth * Math.ceil(maxDeductPrice * 100)) / 100;
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
                detail = state!.detail,
                couponSelect = state!.couponSelect;
            let totalPrice: any = Number(this.getTotalPrice()); // 不算优惠券的总价
            let couponDeduction = couponSelect ? (couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice) : 0; // 优惠券抵扣;

            if (detail && userIntergral) {
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

        getTotalPrice() {
            const { state } = this.props,
                startDate = state!.startDate,
                endDate = state!.endDate;

            return this.etIntervalPrice(getDate(startDate + " 00:00:00"), getDate(endDate + " 23:59:00"));
        }

        renderDeuExtra(selectDucType: number): React.ReactNode {
            return selectDucType === IntgralSelectEnum.none ? (
                <div className="integral-discount">不使用积分优惠</div>
            ) : selectDucType === IntgralSelectEnum.person ? (
                <div className="integral-discount  color-orange">
                    可用{this.getPersonDeduction().totalPersonDeductIntgral}积分，抵用{this.getPersonDeduction().totalPersonDeductPrice}元（个人）
                </div>
            ) : selectDucType === IntgralSelectEnum.company ? (
                <div className="integral-discount  color-orange">
                    可用{this.getCompanyDeduction().totalCompanyDeductIntgral}积分，抵用{this.getCompanyDeduction().totalCompanyDeductPrice}元（企业）
                </div>
            ) : null;
        }

        /**
         * 优惠信息
         */
        renderPreferentialFormView(): React.ReactNode {
            const { state } = this.props,
                selectDucType = state!.selectDucType,
                detail = state!.detail,
                couponSelect = state!.couponSelect,
                startDate = state!.startDate,
                endDate = state!.endDate;
            if (detail) {
                let totalPrice: any = this.etIntervalPrice2(getDate(startDate + " 00:00:00")!, getDate(endDate + " 23:59:00")!); // 不算优惠券的总价
                return parseFloat(this.getTotalPrice()!) > 0 ? (
                    <>
                        <WhiteSpace className="default-gray-bg gray" />
                        <List
                            className="room-14"
                            renderHeader={
                                <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                    优惠信息
                                </NoticeBar>
                            }
                        >
                            <List.Item
                                arrow="horizontal"
                                extra={
                                    <span>
                                        {couponSelect ? (
                                            <span className="color-orange">{`已选${couponSelect.couponNum}张优惠券 抵扣${
                                                couponSelect.deductionPrice > totalPrice ? totalPrice : couponSelect.deductionPrice
                                            }元`}</span>
                                        ) : (
                                            "不使用优惠券"
                                        )}
                                    </span>
                                }
                                onClick={this.showCoupon.bind(this)}
                            >
                                <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                    使用优惠券
                                </NoticeBar>
                            </List.Item>
                            {this.getPersonDeduction().totalPersonDeductPrice! >= 0.01 || this.getCompanyDeduction().totalCompanyDeductPrice! > 0.01 ? (
                                <List.Item
                                    arrow="horizontal"
                                    extra={this.renderDeuExtra(selectDucType)}
                                    onClick={(modal1) => {
                                        modal1.preventDefault(); // 修复 Android 上点击穿透
                                        this.onOpenChangeTwo(true);
                                    }}
                                >
                                    <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                        积分优惠
                                    </NoticeBar>
                                </List.Item>
                            ) : null}
                        </List>
                    </>
                ) : null;
            } else {
                return null;
            }
        }

        renderHeader(): React.ReactNode {
            return (
                <NavBar className="park-nav" icon={<Icon onClick={() => this.goBack()} type="left" />} leftContent={this.renderHeaderLeft() as any}>
                    {`${getResourceTitle(this.props.match!.params.resourceType)}预订`}
                </NavBar>
            );
        }

        showPayActionSheet(order: any) {
            const { state } = this.props,
                selectDucType = state!.selectDucType;
            const loyaltyDeu =
                selectDucType === IntgralSelectEnum.person
                    ? this.getPersonDeduction()?.totalPersonDeductPrice
                    : selectDucType === IntgralSelectEnum.company
                    ? this.getCompanyDeduction()?.totalCompanyDeductPrice
                    : 0;
            order.loyaltyDeu = loyaltyDeu;
            order.totalAmount !== 0
                ? appPaySheet(order, this, true)
                : Toast.success("您的订单已提交成功，请耐心等待后台审核~", 2, () => {
                      this.startDate ? history.go(-2) : this.goBack();
                  });
        }

        getDiscount() {
            return [
                {
                    value: 1,
                    label: (
                        <div>
                            可用<i>{this.getPersonDeduction().totalPersonDeductIntgral}</i>
                            积分，抵用<i>{this.getPersonDeduction().totalPersonDeductPrice}</i>元（个人）
                        </div>
                    ),
                },
                {
                    value: 2,
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

        renderModalContent(selectDucType: any) {
            return (
                <>
                    <List className="choose-discount" renderHeader={"积分优惠选择"}>
                        {this.getDiscount().map((i) => (
                            <RadioItem key={i.value} checked={selectDucType === i.value} onChange={this.onChange.bind(this, i.value)}>
                                <div className="discount-name">{i.label}</div>
                            </RadioItem>
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
                </>
            );
        }

        renderPreferentialModel(): React.ReactNode {
            const { state } = this.props,
                selectDucType = state!.selectDucType,
                modal1 = state!.modal1;

            return (
                <Modal
                    className="discount-modal"
                    popup
                    visible={modal1}
                    onClose={() => {
                        this.dispatch({ type: "input", data: { modal1: false } });
                    }}
                    animationType="slide-up"
                >
                    {this.renderModalContent(selectDucType)}
                </Modal>
            );
        }

        // 验证
        check() {
            const type = this.props.match!.params.resourceType,
                { state } = this.props,
                num = type === "2048" ? 1 : state!.num;

            const startDate = state!.startDate,
                endDate = state!.endDate,
                name = state!.name,
                mobile = state!.mobile,
                company = state!.company,
                Email = state!.email,
                detail = state!.detail,
                { cellphone, required, composeControl, email, requiredTrue, ValidatorControl } = Validators;

            return ValidatorControl(
                composeControl([required], { value: num, name: "预订个数" }),
                composeControl([required], { value: startDate, name: "租赁开始时间" }),
                composeControl([required], { value: endDate, name: "租赁结束时间" }),
                composeControl([required], { value: name, name: "姓名" }),
                composeControl([requiredTrue], {
                    value: startDate <= endDate ? true : false,
                    name: "",
                    errors: {
                        required: "租赁开始时间不能大于结束时间",
                    },
                }),
                composeControl([requiredTrue], {
                    value: detail && detail.FreeItems < num ? false : true,
                    name: "",
                    errors: {
                        required: "预订的资源已被占用",
                    },
                }),
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

        renderPositionSubmit(): React.ReactNode {
            let id = this.props.match!.params.detailid;
            let resourceType = this.props.match!.params.resourceType;
            return (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                const msg = this.check()!();
                                if (msg && typeof msg !== "undefined") {
                                    Toast.fail(msg.join(), 1);
                                    return;
                                }
                                if (!this.checkExtra()) {
                                    return;
                                }
                                this.dispatch({
                                    type: "positionSubmitAction",
                                    id,
                                    callback: (e) => {
                                        Number(resourceType) === RoomTypeEnum.workingType
                                            ? setEventWithLabel(statisticsEvent.serviceStationSbmitOrders)
                                            : setEventWithLabel(statisticsEvent.serviceAdvertisingSbmitOrders);
                                        this.showPayActionSheet(e);
                                    },
                                    resourcetype: resourceType,
                                });
                            }}
                        >
                            确认
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        renderInvoice() {
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

        renderCouponModal(): React.ReactNode {
            let resourceType = this.props.match!.params.resourceType;
            let { state } = this.props;
            let couponOpen = state!.couponOpen,
                selectDucType = state!.selectDucType,
                startDate = state!.startDate,
                endDate = state!.endDate;

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
                sceneCode: Number(resourceType) === ResourceTypeEnum.working ? "station" : "adsense",
                orderAmount: this.etIntervalPrice2(getDate(startDate + " 00:00:00")!, getDate(endDate + " 23:59:00")!),
            };
            return this.renderEmbeddedView(CouponChoice.Page as any, { ref: "selectInvoice", ...invoiceProps });
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
            let { state } = this.props;
            let couponOpen = state!.couponOpen;
            return (
                <div className="example-list">
                    {" "}
                    {this.renderHeaderView()}
                    {this.renderOrderFormView()}
                    {/*备注*/}
                    {this.renderRemarkFormView()}
                    {/*发票信息注释*/}
                    {this.renderInvoiceFormView()}
                    {/*优惠信息*/}
                    {this.renderPreferentialFormView()}
                    {couponOpen && this.renderCouponModal()}
                    {/*用户信息*/}
                    {this.renderUserFormView()}
                    {this.renderPreferentialModel()}
                </div>
            );
        }

        renderFooter(): React.ReactNode {
            return this.renderPositionSubmit();
        }
    }

    export const Page = template(Component, (state) => state.positionorder);
}
