import { Mobclick } from "./umeng";
import {BaiduMobStat} from "./mobstat"

export interface StatisticsEvent {
    eventid: string;
    eventLabel: string;
}

export function setEventWithLabel(event: StatisticsEvent) {
    try {
        Mobclick().onEventWithLabel(event.eventid, event.eventLabel); // 友盟
        BaiduMobStat.onEvent(event.eventid, event.eventLabel); // 百度
    } catch (error) {
        console.error(error);
    }
}

export function setPageBegin(pageName) {
    try {
        Mobclick().onPageBegin(pageName); // 友盟
    } catch (error) {
        console.error(error);
    }
}
