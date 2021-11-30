import moment from "moment";

import "moment/locale/zh-cn";

export function getDate(date: string | Date, def?: Date): Date | undefined {
    return date instanceof Date ? date : date ? new Date(date.replace(/\-/g, "/").replace(/T/g, " ").substr(0, 19)) : def;
}

export function formatNow(fmt: string = "yyyy-MM-dd") {
    return formatDate(new Date(), fmt);
}

export function formatDateTime(date: Date | string, fmt: string = "yyyy-MM-dd hh:mm:ss") {
    return formatDate(date, fmt);
}

// 只用于发送数据格式化数据
export function formatDateTimeSend(date: Date | string, fmt: string = "yyyy-MM-ddThh:mm:ss") {
    return formatDate(date, fmt);
}

export function formatDate(date: Date | string, fmt: string = "yyyy-MM-dd"): string {
    const value = getDate(date);

    return value ? value.format(fmt) : (date as any);
}
/**
 * 获取当前日期N天后日期
 * @param days GetDateStr
 */
export function getDateStr(days?: any, fmt: string = "yyyy-MM-dd") {
    return formatDate(moment().add(days, "days").toDate(), fmt);
}

/**
 * 获取指定日期N天后日期
 * @param days GetDateStr
 */
export function getSetDateStr(date: Date | string, days: number, fmt: string = "yyyy-MM-dd") {
    return formatDate(moment(getDate(date)).add(days, "days").toDate(), fmt);
}

export function formatDates(fmt: string = "yyyy-MM-dd") {
    return (date: Date | string) => formatDate(date, fmt);
}

export function formatDateTimes(fmt: string = "yyyy-MM-dd hh:mm:ss") {
    return (date: Date | string) => formatDate(date, fmt);
}

export function format(this: Date, fmt: string): string {
    const o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        S: this.getMilliseconds(), // 毫秒
    };

    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

    for (const k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));

    return fmt;
}

(Date as any).prototype.format = format;

export function formatTime(date: Date | string, fmt: string = "hh:mm") {
    return formatDate(date, fmt);
}

/**
 * 判断周几
 */
export function getWeekStr(date: string, days: number) {
    let week = moment(getDate(date)).add(days, "days").day();
    let str;
    if (week === 0) {
        str = "周日";
    } else if (week === 1) {
        str = "周一";
    } else if (week === 2) {
        str = "周二";
    } else if (week === 3) {
        str = "周三";
    } else if (week === 4) {
        str = "周四";
    } else if (week === 5) {
        str = "周五";
    } else if (week === 6) {
        str = "周六";
    }
    return str;
}
