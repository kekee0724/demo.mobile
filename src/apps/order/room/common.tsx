import { formatDate, getDate } from "@reco-m/core";
import { Toast } from "antd-mobile-v2";
import {  CertifyStatusEnum } from "@reco-m/member-models";
/**
 * 获取指定日期N天后日期字符串
 * @param days GetDateStr
 */
export function getSetDateStr(date: string, days: number, fmt: string = "yyyy-MM-dd") {
    let dd = getDate(date)!;
    return formatDate(dd.dateAdd("d", days), fmt);
}

/**
 * 会议室认证状态
 */
 export function isCertifyMeeting(currentMember: any, parkName: string) {
    if ((currentMember && currentMember.status === CertifyStatusEnum.nocertify) || (!currentMember || !currentMember.id)) {
        // 未认证
        Toast.fail(`${parkName}园区未认证，请审核通过后使用`, 2);
        return false;
    } else if (currentMember && currentMember.status === CertifyStatusEnum.noConfim) {
        // 待确认
        Toast.fail(`您在${parkName}园区的认证申请正在审核，请审核通过后使用`, 2);
        return false;
    } else if (currentMember && currentMember.status === CertifyStatusEnum.allow) {
        // 已通过
        return true;
    } else {
        // 已退回
        Toast.fail(`您在${parkName}园区的认证申请已退回，请审核通过后使用`, 2);
        return false;
    }
}
