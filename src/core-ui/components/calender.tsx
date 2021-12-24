import React from "react";
import * as PropTypes from "prop-types";
import classNames from "classnames/bind";
import moment from "moment";

import "moment/locale/zh-cn";

import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";

import { PureComponent } from "@reco-m/core";

import { goDateBoard, slideRenderer } from "./slideRenderer";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

const cx = classNames.bind({});

interface ObjState {
    setState: any;
}

let st: any = 0,
    sc: any = 0,
    startx: any,
    starty: any,
    result: any,
    _this: ObjState;

export namespace RMCalendar {
    export interface IProps extends PureComponent.IProps {
        defaultDate: any;
        type: any;
        touch: any;
        width: any;
        locale: any;
        firstDayOfWeek: any;
        toolbar: any;
        schedule: any;
        onCellClick: any;
        onPageChange: any;
    }

    export interface IState extends PureComponent.IState {
        type: any;
        dropdownlist: boolean;
        hasError: boolean;
        prevProps: any;
        date: any;
        selectDate: any;
        cellHeight: any;
        index: any;
        animate: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps = {
            type: "month",
            firstDayOfWeek: 0,
            schedule: [],
            width: "100%",
            locale: "zh-cn",
            toolbar: true,
            touch: true,
            onCellClick: null,
            onPageChange: null,
            bodyClassName: "",
        };
        static propTypes = {
            defaultDate: PropTypes.instanceOf(Date).isRequired,
            type: PropTypes.oneOf(["month", "week"]),
            firstDayOfWeek: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
            schedule: PropTypes.any,
            width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            locale: PropTypes.oneOf(["zh-cn", "en"]),
            toolbar: PropTypes.bool,
            touch: PropTypes.bool,
            onCellClick: PropTypes.func,
            onPageChange: PropTypes.func,
        };
        calendar;
        handleCellClick;
        handleResize;
        handleChangeType;
        handleChangeBoard;
        handleChangePage;
        ani2;
        ani;
        timer;

        static turnWeekNumToChar(num) {
            switch (num) {
                case 0:
                    return "日";
                case 1:
                    return "一";
                case 2:
                    return "二";
                case 3:
                    return "三";
                case 4:
                    return "四";
                case 5:
                    return "五";
                case 6:
                    return "六";
                default:
                    return null;
            }
        }

        static getDaysOfPerMonth(date) {
            // 获取（天/月）数据
            const year = date.getFullYear();
            const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
                days[1] = 29;
            }
            return days;
        }

        static getDataOfHeader(firstDayOfWeek) {
            // 获取周排列数据
            const start = firstDayOfWeek;
            const week = [
                { day: 0, "zh-cn": "日", en: "Sun" },
                { day: 1, "zh-cn": "一", en: "Mon" },
                { day: 2, "zh-cn": "二", en: "Tue" },
                { day: 3, "zh-cn": "三", en: "Wed" },
                { day: 4, "zh-cn": "四", en: "Thu" },
                { day: 5, "zh-cn": "五", en: "Fri" },
                { day: 6, "zh-cn": "六", en: "Sat" },
            ];
            const p1 = week.slice(start);
            const p2 = week.slice(0, start);
            return p1.concat(p2);
        }

        static getComposeDaysOfBoard(date, firstDayOfWeek = 0, order = 0) {
            // 获取面板组成天数据 [-1：获取上月组成天数 | 0：获取本月组成天数 | 1：获取下月组成天数]
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = new Date(year, month, 1).getDay();
            const daysOfPerMonth = Component.getDaysOfPerMonth(date);
            const weekCharacter = Component.getDataOfHeader(firstDayOfWeek);
            const theMonthNumOfBoard = daysOfPerMonth[month];
            let preMonthNumOfBoard = 0; // 上月组成天数
            for (let i = 0; i < weekCharacter.length; i++) {
                const item = weekCharacter[i];
                if (item.day === day) preMonthNumOfBoard = i;
            }
            if (order === -1) {
                // 上月组成天数
                return preMonthNumOfBoard;
            }
            if (order === 1) {
                // 下月组成天数
                const sumDays = 6 * 7;
                return sumDays - theMonthNumOfBoard - preMonthNumOfBoard;
            }
            // 本月组成天数
            return theMonthNumOfBoard;
        }

        static getDataOfBoard(date, firstDayOfWeek) {
            // 获取面板所有日期数据
            const TC = Component;
            const year = date.getFullYear();
            const month = date.getMonth();
            const daysOfPerMonth = TC.getDaysOfPerMonth(date);
            const preMonthNum = TC.getComposeDaysOfBoard(date, firstDayOfWeek, -1);
            const theMonthNum = TC.getComposeDaysOfBoard(date, firstDayOfWeek, 0);
            const nextMonthNum = TC.getComposeDaysOfBoard(date, firstDayOfWeek, 1);
            return new Array(42).fill(null).map((_item, i) => {
                // 验证数据范围：1900-2099
                if (year < 1900 || year > 2099) return false;
                // 上月数据
                if (i < preMonthNum) {
                    const preMonth = month - 1 >= 0 ? month - 1 : 11;
                    const preMYear = month - 1 >= 0 ? year : year - 1;
                    if (preMYear < 1900) return false;
                    return {
                        day: daysOfPerMonth[preMonth] - preMonthNum + i + 1,
                        month: preMonth,
                        year: preMYear,
                        monthIndex: -1,
                    };
                }
                // 本月数据
                if (i < theMonthNum + preMonthNum) {
                    const today = new Date();
                    const thisYear = today.getFullYear();
                    const thisMonth = today.getMonth();
                    const thisDate = today.getDate();
                    const data: any = {
                        day: i + 1 - preMonthNum,
                        month,
                        year,
                        monthIndex: 0,
                    };
                    if (thisDate === data.day && thisMonth === data.month && thisYear === data.year) {
                        data.today = true; // 今日
                    }
                    return data;
                }
                // 下月数据
                const nextMonth = month + 1 <= 11 ? month + 1 : 0;
                const nextMYear = month + 1 <= 11 ? year : year + 1;
                if (nextMYear > 2099) return false;
                return {
                    day: i - 41 + nextMonthNum,
                    month: nextMonth,
                    year: nextMYear,
                    monthIndex: 1,
                };
            });
        }

        static getWeekRowOfBoard(date, firstDayOfWeek) {
            const TC = Component;
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            const dataOfBoard = TC.getDataOfBoard(date, firstDayOfWeek);
            if (Array.isArray(dataOfBoard) && dataOfBoard.length > 0) {
                for (let i = 0; i < dataOfBoard.length; i++) {
                    const item = dataOfBoard[i];
                    if (item.year === year && item.month === month && item.day === day) {
                        return Math.floor(i / 7);
                    }
                }
            }
            return 0;
        }

        static getComputedDataOfBoard(date, firstDayOfWeek, schedule) {
            // 获取合并后的日历日程表完整数据
            const TC = Component;
            const dataOfBoard = TC.getDataOfBoard(date, firstDayOfWeek);
            // 合并数据：将传入的日程数据合并到日历上
            return dataOfBoard.map((item) => {
                const itemBoardDate = moment(new Date(item.year, item.month, item.day)).format("YYYY-MM-DD");
                for (let i = 0; i < schedule.length; i++) {
                    const itemSchedule = schedule[i];
                    const itemScheduleDate = itemSchedule.date && moment(itemSchedule.date).format("YYYY-MM-DD");
                    if (itemBoardDate === itemScheduleDate) {
                        return {
                            ...item,
                            data: itemSchedule,
                        };
                    }
                }
                return item;
            });
        }

        static dateToValid(date = new Date()) {
            if (date.getFullYear() < 1900) return new Date(1900, 0, 1); // date设置最小值
            if (date.getFullYear() > 2099) return new Date(2099, 11, 31); // date设置最大值
            return date;
        }

        static getDerivedStateFromProps(props, state) {
            const nextType = props.type;
            const prevType = state.prevProps.type;
            // 将type转化为受控属性：prop type 与 state type 映射
            if (nextType !== prevType) {
                const { selectDate } = state;
                return {
                    prevProps: {
                        ...state.prevProps,
                        type: nextType,
                    },
                    type: nextType,
                    date: new Date(selectDate.year, selectDate.month, selectDate.day),
                    index: 0,
                };
            }
            return null;
        }

        static getDerivedStateFromError() {
            return { hasError: true };
        }

        static setDate(data, index) {
            let date = new Date(data);
            _this &&
                _this.setState({
                    selectDate: {
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: date.getDate(),
                    },
                    date: date,
                    index: index,
                });
        }

        constructor(props: P, context: any) {
            super(props, context);
            // 不受控属性：props 转化为内部 state 并在内部使用，
            // 因此外部更改不受控属性，不会驱动界面变化，除非通过 getDerivedStateFromProps 手动维护
            // 而受控属性：即不转化为内部 state 的属性, 直接在内部使用原始 props, 外部更改 props 会驱动界面更新

            this.calendar = React.createRef();
            this.handleCellClick = this._handleCellClick.bind(this);
            this.handleResize = this._handleResize.bind(this);
            this.handleChangeType = this._handleChangeType.bind(this);
            this.handleChangeBoard = this._handleChangeBoard.bind(this);
            this.handleChangePage = this._handleChangePage.bind(this);
        }

        protected getInitState(props: Readonly<P>): Readonly<S> {
            const { type, defaultDate } = props; // type 将维护为受控属性，defaultDate 为不受控属性
            const validDate = Component.dateToValid(defaultDate); // 校正范围

            return {
                hasError: false,
                prevProps: { type }, // 用于比对props是否变化，只在getDerivedStateFromProps中维护，内部不宜setState
                type,
                date: validDate,
                selectDate: {
                    year: validDate.getFullYear(),
                    month: validDate.getMonth(),
                    day: validDate.getDate(),
                },
                cellHeight: 0,
                dropdownlist: false,
                index: 0, // 滑动面板默认页索引
                animate: true,
            } as any;
        }

        componentDidMount() {
            _this = this;
            this.handleResize();
            window.addEventListener("resize", this.handleResize);
        }

        componentDidUpdate(_prevProps, prevState) {
            const { index, selectDate }: any = this.state;
            const { onPageChange }: any = this.props;
            this.ani2 = requestAnimationFrame(() => {
                if (index !== prevState.index) {
                    if (onPageChange) onPageChange(selectDate);
                }
            });
        }

        componentWillUnmount() {
            cancelAnimationFrame(this.ani);
            cancelAnimationFrame(this.ani2);
            clearTimeout(this.timer);
            window.removeEventListener("resize", this.handleResize);
        }

        _handleCellClick(item) {
            if (!item || (item && item.year > 2099) || (item && item.year < 1900)) return; // 1900-2099
            const { onCellClick } = this.props as any;
            if (onCellClick) onCellClick(item);
            this.setState((state: any) => {
                const { year, month, day } = item;
                const { year: selectYear, month: selectMonth, day: selectDay } = state.selectDate;
                if (year !== selectYear || month !== selectMonth || day !== selectDay) {
                    const { index, type }: any = state;
                    return {
                        index: type === "month" ? index + item.monthIndex : index,
                        selectDate: { year, month, day },
                    };
                }
                return null;
            });
        }

        _handleResize() {
            if (!this.calendar.current) return;
            const cellHeight = Math.floor(this.calendar.current.querySelector("table").clientWidth / 7) - 10;
            this.setState((prevState: any) => {
                if (prevState.cellHeight !== cellHeight) {
                    return {
                        cellHeight,
                    };
                }
                return null;
            });
        }

        _handleChangeType(type) {
            this.setState({ animate: false }, () => {
                this.setState(
                    (state) => {
                        // 重置基础date日期
                        const { selectDate, type: prevType }: any = state;
                        const date = new Date(selectDate.year, selectDate.month, selectDate.day);
                        if (prevType !== type) return { type, date, index: 0 };
                        return null;
                    },
                    () => {
                        this.timer = setTimeout(() => {
                            this.setState({
                                animate: true,
                            });
                        }, 300);
                        this.setState({
                            dropdownlist: false,
                        });
                    }
                );
            });
            setTimeout(() => {
                if (this.state.type === "month") {
                    $(this.calendar.current).css({ height: "316px" });
                } else {
                    $(this.calendar.current).css({ height: "116px" });
                }
            });
        }

        _handleChangeBoard(go) {
            const { index }: any = this.state;
            const nextIndex = index + go;
            const { selectDate }: any = goDateBoard(nextIndex, this);
            this.setState({
                index: nextIndex, // 翻页
                selectDate,
            });
        }

        _handleChangePage(index) {
            const { selectDate }: any = goDateBoard(index, this);
            this.ani = requestAnimationFrame(() => {
                this.setState({ index, selectDate });
            });
        }

        _getAngle(angx, angy) {
            return (Math.atan2(angy, angx) * 180) / Math.PI;
        }

        _getDirection(startx, starty, endx?, endy?) {
            const angx = endx - startx;
            const angy = endy - starty;
            if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
                return result;
            }
            let angle = this._getAngle(angx, angy);
            if (angle >= -135 && angle <= -45) {
                result = 1;
            } else if (angle > 45 && angle < 135) {
                result = 2;
            } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
                result = 3;
            } else if (angle >= -45 && angle <= 45) {
                result = 4;
            }
            return result;
        }

        _handleTouch(e) {
            if (e.type === "touchstart") {
                startx = e.touches[0].pageX;
                starty = e.touches[0].pageY;
                sc = $(this.calendar.current);
                sc.css({ transform: "translate3d(0, 0, 0)" });
                st = sc.height();
                $(".container-scrollable").css({ overflow: "hidden" });
            } else if (e.type === "touchend") {
                let endx, endy;
                endx = e.changedTouches[0].pageX;
                endy = e.changedTouches[0].pageY;
                let direction = this._getDirection(startx, starty, endx, endy);
                if (Math.abs(endy - starty) >= 60) {
                    switch (direction) {
                        case 1:
                            sc.css({ transition: "all .1s" });
                            this.handleChangeType("week");
                            setTimeout(function () {
                                sc.css({ height: "116px" });
                            });
                            break;
                        case 2:
                            sc.css({ transition: "all .1s" });
                            this.handleChangeType("month");
                            setTimeout(function () {
                                sc.css({ height: "316px" });
                            });
                            break;
                        default:
                            break;
                    }
                    setTimeout(() => {
                        if (this.state.type === "month") {
                            sc.css({ height: "316px" });
                        } else {
                            sc.css({ height: "116px" });
                        }
                    }, 300);
                } else {
                    if (this.state.type === "week") {
                        sc.css({ transition: "all .1s" });
                        setTimeout(function () {
                            sc.css({ height: "116px" });
                        });
                    } else {
                        sc.css({ transition: "all .1s" });
                        setTimeout(function () {
                            sc.css({ height: "316px" });
                        });
                    }
                }
            } else if (e.type === "touchmove") {
                $(".container-scrollable").attr("style", "");
                let sel = this._getDirection(startx, starty) || 1;
                const ie = e.touches[0].clientY - starty <= 0 ? e.touches[0].clientY - starty : e.touches[0].clientY - starty;
                switch (sel) {
                    default:
                        break;
                    case 1:
                        if (st === 116) {
                            sc.css({ height: st + ie >= 316 ? 316 : st + ie <= 116 ? 116 : st + ie, transition: "none" });
                        } else {
                            sc.css({
                                height: st + ie <= 116 ? 116 : st + ie >= 316 ? 316 : st + ie,
                                transition: "none",
                            });
                        }
                        break;
                    case 2:
                        if (st === 116) {
                            sc.css({ height: st + ie >= 316 ? 316 : st + ie, transition: "none" });
                        } else {
                            sc.css({
                                height: st + ie <= 116 ? 116 : st + ie >= 316 ? 316 : st + ie,
                                transition: "none",
                            });
                        }
                        break;
                }
            }
        }

        render(): React.ReactNode {
            const { hasError }: any = this.state;
            if (hasError) {
                return <h2 className="text-center">抱歉出错了~请重新打开页面</h2>;
            }

            const { firstDayOfWeek, toolbar, width, touch, className, bodyClassName }: any = this.props;
            const { type, selectDate, dropdownlist, index, animate }: any = this.state;
            const selectDateTime = new Date(selectDate.year, selectDate.month, selectDate.day);

            const computeSlideCount = () => {
                if (selectDate.year < 1900 || (selectDate.year === 1900 && selectDate.month === 0)) {
                    return 2;
                }
                if (selectDate.year > 2099) {
                    return 1;
                }
                return 0;
            };

            return (
                <div
                    style={{ overflow: "hidden", backgroundColor: "#ffffff" }}
                    ref={this.calendar}
                    className={className}
                    onTouchStart={this._handleTouch.bind(this)}
                    onTouchMove={this._handleTouch.bind(this)}
                    onTouchEnd={this._handleTouch.bind(this)}
                    onTouchCancel={this._handleTouch.bind(this)}
                >
                    {toolbar && (
                        <div className={"top-bar"} style={{ width: typeof width === "number" ? `${width}px` : width }}>
                            <div className={"date"}>
                                <div className={"opt-btn"} role="button" data-index="0" onClick={() => this.setState((state) => ({ dropdownlist: !state.dropdownlist }))}>
                                    <div className={"month"}>{`${selectDate.month < 9 ? 0 : ""}${selectDate.month + 1}月`}</div>
                                    <div className={"week-year"}>
                                        <div>
                                            {type === "week"
                                                ? `第 ${moment(selectDateTime).format(firstDayOfWeek === 0 ? "ww" : "WW")} 周`
                                                : `周${Component.turnWeekNumToChar(selectDateTime.getDay())}`}
                                        </div>
                                        <div className={cx("year", { up: !dropdownlist, down: dropdownlist })}>{`${selectDate.year}年`}</div>
                                    </div>
                                </div>
                                <div className={"turn-btn"}>
                                    <div
                                        className={cx("btn", "down", {
                                            disabled: selectDate.year < 1900 || (selectDate.year === 1900 && selectDate.month === 0),
                                        })}
                                        role="button"
                                        data-index="-1"
                                        onClick={() => this.handleChangeBoard(-1)}
                                    />
                                    <div
                                        className={cx("btn", "up", {
                                            disabled: selectDate.year > 2099 || (selectDate.year === 2099 && selectDate.month === 11),
                                        })}
                                        role="button"
                                        data-index="-2"
                                        onClick={() => this.handleChangeBoard(1)}
                                    />
                                </div>
                            </div>
                            {dropdownlist && (
                                <div key={"a"} className={"options"}>
                                    <div className={"opt"} role="button" data-index="-3" onClick={() => this.handleChangeType("month")}>
                                        <i className={cx({ selected: type === "month" })}>月</i>
                                    </div>
                                    <div className={"opt"} role="button" data-index="-4" onClick={() => this.handleChangeType("week")}>
                                        <i className={cx({ selected: type === "week" })}>周</i>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className={"date-body " + bodyClassName}>
                        <VirtualizeSwipeableViews
                            disabled={!touch}
                            slideCount={computeSlideCount()}
                            resistance
                            ignoreNativeScroll
                            animateTransitions={animate}
                            index={index}
                            onChangeIndex={this.handleChangePage}
                            slideRenderer={(params) => slideRenderer(params, this, RMCalendar)}
                        />
                    </div>
                </div>
            );
        }
    }
}
