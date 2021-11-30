import { getDate } from "./formatTime";

function getTime(date: string | Date | number): number {
    return typeof date === "number" ? date : getDate(date)!.getTime();
}

const preMinute = 1000 * 60,
    preHour = preMinute * 60,
    preDay = preHour * 24;

export function friendlyTime(startDate: string | Date, endDate?: string | Date) {
    if (!startDate) return "";

    const dates = getDate(startDate),
        start = getTime(dates!),
        end = getTime(endDate || Date.now());

    if (isNaN(start)) return startDate;

    const det = end - start;

    if (det < preMinute) return "刚刚";
    else if (det < preHour) return Math.round(det / preMinute) + "分钟前";
    else if (det < preDay) return Math.round(det / preHour) + "小时前";
    else if (det < preDay * 7) return Math.round(det / preDay) + "天前";
    else if (dates!.getFullYear() !== new Date().getFullYear()) return dates!.format("yyyy-MM-dd hh:mm");
    else return dates!.format("MM-dd hh:mm");
}
