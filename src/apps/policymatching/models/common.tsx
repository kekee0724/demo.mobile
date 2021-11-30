import React from "react";
import ECharts from "re-echarts";
import { getDate } from "@reco-m/core";
import { CertifyStatusEnum } from "@reco-m/member-models";
export enum Namespaces {
    policymatchinglist = "policymatchinglist",
    policymatching = "policymatching",
    policymatchingdetail = "policymatchingdetail",
    policymatchingsearch = "policymatchingsearch",
    policyservice = "policyservice",
    policyservicedetail = "policyservicedetail",
    policyserviceoriginaldetail = "policyserviceoriginaldetail",
    policyserviceHomeModel = "policyserviceHomeModel",
    policyserviceMy = "policyserviceMy",
    policyserviceOrder = "policyserviceOrder",
}

/**
 * 政策标签
 */
export enum PolicyTabTypeEnum {
    policyContent = "政策原文",
    policySupport = "扶持力度",
    policyCondition = "申报条件",
    policyProcess = "申报程序",
    policyMatiral = "申报材料",
    policyAcceptance = "受理服务",
}

export enum SpecialStateTagValueEnum {
    waitAccept = 1,
    processing = 5,
    assessing = 10,
    waitFunding = 15,
    fundingSuccess = 20,
    waitSend = -5,
    back = -10,
    finish = 25,
}
export const mytabs = [
    { title: "全部", stateTagValue: "" },
    { title: "待受理", stateTagValue: SpecialStateTagValueEnum.waitAccept.toString() },
    { title: "受理中", stateTagValue: SpecialStateTagValueEnum.processing.toString() },
    { title: "评审中", stateTagValue: SpecialStateTagValueEnum.assessing.toString() },
    { title: "待拨款", stateTagValue: SpecialStateTagValueEnum.waitFunding.toString() },
    { title: "拨款成功", stateTagValue: SpecialStateTagValueEnum.fundingSuccess.toString() },
    { title: "待提交", stateTagValue: SpecialStateTagValueEnum.waitSend.toString() },
    { title: "申报成功", stateTagValue: SpecialStateTagValueEnum.finish.toString() },
    { title: "已退回", stateTagValue: SpecialStateTagValueEnum.back.toString() },
];
/**
 * 申报状态
 */
export enum PolicyDeclareStatusEnum {
    /**
     * 处理中
     */
    none = 0,
    /**
     * 审核通过
     */
    approved = 1,
    /**
     * 已退回
     */
    return = 2,
}

export const mysimtabs = [
    { title: "全部", stateTagValue: "" },
    { title: "待处理", stateTagValue: String(PolicyDeclareStatusEnum.none) },
    { title: "已通过", stateTagValue: String(PolicyDeclareStatusEnum.approved) },
    { title: "已退回", stateTagValue: String(PolicyDeclareStatusEnum.return) },
];
/**
 * 获取政策状态
 * @param status
 * @returns
 */
export function getStatusText(status) {
    switch (status) {
        case PolicyDeclareStatusEnum.none:
            return "待处理";
        case PolicyDeclareStatusEnum.approved:
            return "审核通过";
        case PolicyDeclareStatusEnum.return:
            return "已退回";
        default:
            break;
    }
}
/**
 * 政策标签tab
 */
export enum PolicyTabIndexEnum {
    policyMatch = 0,
}

export enum WhetherJumpEnum {
    jump = 1,
    unJump = 0,
}
export enum CashTypeValueEnum {
    /**
     * 金额补贴
     */
    amountSubsidy = "1",
    /**
     * 资质认定
     */
    qualificationIdentification = "2",
}
export enum PolicyTagEnum {
    /**
     * 企业标签
     */
    company = "1",
    /**
     * 各人标签
     */
    person = "2",
}
export enum PolicyTabIndex {
    /**
     * 政策申报
     */
    service = 0,
    /**
     * 政策匹配
     */
    match = 1,
    /**
     * 政策计算
     */
    count = 2,
}

/**
 * 未认证
 */
export function isNoCertify(props) {
    const { state } = props,
        member = state!.member;
    if ((member && member.status === CertifyStatusEnum.nocertify) || !member || !member.id) {
        return true;
    }
    return false;
}

/**
 * 认证中
 */
export function isCertifying(props) {
    const { state } = props,
        member = state!.member;
    if (member && (member.status === CertifyStatusEnum.noConfim || member.status === CertifyStatusEnum.bounced)) {
        return true;
    }
    return false;
}
/**
 * 已认证
 */
export function isCertifyed(props) {
    const { state } = props,
        member = state!.member;
    if (member && member.status === CertifyStatusEnum.allow) {
        return true;
    }
    return false;
}

/**
 * 计算器数据类型
 */
export enum DataTypeEnum {
    /**
     * 字符串
     */
    string = 4,
    /**
     * 日期
     */
    date = 3,
    /**
     * 布尔
     */
    bool = 2,
    /**
     * 数值
     */
    num = 1,
}
/**
 * 政策类别标签code
 */
export const POLICY_TYPE_TAG_CODE = "Policy/zhengclb";
/**
 * 政策级别标签code
 */
export const POLICY_LEVEL_TAG_CODE = "POLICY/ZHENGCJB";
/**
 * 扶持行业标签code
 */
export const POLICY_SUPPORT_TAG_CODE = "POLICY/fuccy";
/**
 * 发布部门标签code
 */
export const POLICY_DEPARTMENT_TAG_CODE = "POLICY/fabbm";
/**
 * 政策标签集合
 */
export const POLICY_TAG_ARR = [
    { tagCode: POLICY_TYPE_TAG_CODE, valueMap: "selectPolicyTypeValues", title: "政策类别", paramMap: "policyTypeValueList" },
    { tagCode: POLICY_LEVEL_TAG_CODE, valueMap: "selectPolicyRankValues", title: "政策级别", paramMap: "policyRankValueList" },
    // { tagCode: POLICY_DEPARTMENT_TAG_CODE, urlMap: "pd", valueMap: "selectPolicyDepartmentValues", title: "发布部门" },
    // { tagCode: POLICY_SUPPORT_TAG_CODE, urlMap: "si", valueMap: "selectSupportIndustryValues", title: "扶持产业" },
];
/**
 * 申报模式
 */
export enum PolicyDeclareModeEnum {
    /**
     * 简版
     */
    simple = 1,
    /**
     * 繁版
     */
    complex = 2,
    /**
     * 无
     */
    none = 3,
}
export function getDeadlineDays(deadline) {
    if (!deadline) {
        return 0;
    }

    let nowData = new Date();
    let minite = (getDate(deadline) as any).dateDiff("n", nowData) || 0;
    let time = Math.floor(minite / 60 / 24);
    return time;
}
export function getStartDays(starttime) {
    if (!starttime) {
        return 0;
    }
    let nowData = new Date();
    let time = (getDate(nowData) as any).dateDiff("d", getDate(starttime)) || 0;
    return time;
}
export function getDeadlineHour(deadline) {
    if (!deadline) {
        return 0;
    }
    let nowData = new Date();
    let minite = (getDate(deadline) as any).dateDiff("n", nowData) || 0;
    let time = Math.floor(minite / 60);
    return time;
}
export function getDeadlineMin(deadline) {
    if (!deadline) {
        return 0;
    }
    let nowData = new Date();
    let minite = (getDate(deadline) as any).dateDiff("n", nowData) || 0;
    return minite;
}
export function getDeadlineSec(deadline) {
    if (!deadline) {
        return 0;
    }
    let nowData = new Date();
    let s = (getDate(deadline) as any).dateDiff("s", nowData) || 0;
    return s;
}
export function getStartSec(starttime) {
    if (!starttime) {
        return 0;
    }
    let nowData = new Date();
    let time = (getDate(nowData) as any).dateDiff("s", getDate(starttime)) || 0;
    return time;
}
/**
 * 政策截止日期处理
 */
export function getPolicyDeadline(declareStartTime, declareEndTime) {
    const deadlineDays = getDeadlineDays(declareEndTime);
    const deadlineSecs = getDeadlineSec(declareEndTime);
    const startSecs = getStartSec(declareStartTime);

    return declareStartTime ? (
        deadlineSecs >= 0 ? (
            startSecs >= 0 ? (
                <div>
                    <span>
                        剩<strong className="color-red size-21 margin-h-xs">{deadlineDays}</strong>天
                    </span>
                </div>
            ) : (
                <span className="gray-three-color">申报未启动</span>
            )
        ) : (
            <span className="gray-three-color">申报已截止</span>
        )
    ) : (
        <span className="gray-three-color">申报未启动</span>
    );
}
/**
 * 政策详情截止日期处理
 */
export function getPolicyDetailDeadline(declareStartTime, declareEndTime) {
    let deadlineDays = getDeadlineDays(declareEndTime);
    let deadlineHours = getDeadlineHour(declareEndTime);
    let deadlineMins = getDeadlineMin(declareEndTime);
    let deadlineSecs = getDeadlineSec(declareEndTime);
    const startSecs = getStartSec(declareStartTime);

    return declareStartTime ? (
        deadlineSecs >= 0 ? (
            startSecs >= 0 ? (
                <div>
                    <span className="size-12">
                        剩<strong className="color-red size-21 margin-h-xs">{deadlineDays}</strong>
                      天
                      <strong className="color-red size-21 margin-h-xs">{deadlineHours % 24}</strong>小时
                        <strong className="color-red size-21 margin-h-xs">{deadlineMins % 60}</strong>分
                      <strong className="color-red size-21 margin-h-xs">{deadlineSecs % 60}</strong>秒
                    </span>
                </div>
            ) : (
                <span className="gray-three-color">申报未启动</span>
            )
        ) : (
            <span className="gray-three-color">申报已截止</span>
        )
    ) : (
        <span className="gray-three-color">申报未启动</span>
    );
}

/**
 * 首页截止日期处理
 */

export function getPolicyHomeDeadline(declareStartTime, declareEndTime) {
    let option = {
        title: {
            text: "13",
            subtext: "DAY",
            itemGap: 1,
            x: "center",
            y: "20%",
            textStyle: {
                fontWeight: "bold",
                color: "rgba(255, 153, 51, 1)",
                fontSize: "21",
            },
            subtextStyle: {
                color: "#6F6F6F",
                fontSize: "10",
            },
        },

        color: ["rgba(242, 242, 242, 1)"],

        series: [
            {
                type: "pie",
                clockWise: true,
                radius: ["90%", "100%"],
                itemStyle: {
                    normal: {
                        label: {
                            show: false,
                        },
                        labelLine: {
                            show: false,
                        },
                    },
                },
                hoverAnimation: false,
                data: [
                    {
                        value: 40,
                        name: "01",
                        itemStyle: {
                            normal: {
                                color: "rgba(255, 153, 51, 1)", //"#00C3DC
                                label: {
                                    show: false,
                                },
                                labelLine: {
                                    show: false,
                                },
                            },
                        },
                    }
                ],
            },
            {
                type: "pie",
                clockWise: true,
                radius: ["0", "80%"],
                itemStyle: {
                    normal: {
                        label: {
                            show: false,
                        },
                        labelLine: {
                            show: false,
                        },
                    },
                },
                hoverAnimation: false,
                data: [
                    {
                        value: 1,
                        name: "01",
                        itemStyle: {
                            normal: {
                                color: "rgba(242, 242, 242, 1)",
                                label: {
                                    show: false,
                                },
                                labelLine: {
                                    show: false,
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };

    const deadlineDays = getDeadlineDays(declareEndTime);
    const deadlineSecs = getDeadlineSec(declareEndTime);
    const startDays = getStartDays(declareStartTime);
    const startSecs = getStartSec(declareStartTime);

    let subTitle;
    if (declareStartTime) {
        if (deadlineSecs >= 0) {
           if (startSecs >= 0) {
               // 申报进行中
               subTitle="申报中";
               option.title.text = `${deadlineDays}`;
               option.title.textStyle.color = "rgba(255, 153, 51, 1)"
               option.series[0].data[0].itemStyle.normal.color="rgba(238, 238, 238,  1)"
           } else {
               // 申报未启动
               subTitle="未启动";
               option.title.text = `${Math.abs(startDays)}`;
               option.title.textStyle.color = "rgba(0, 211, 109, 1)"
               option.series[0].data[0].itemStyle.normal.color="rgba(238, 238, 238,  1)"
           }
        } else {
            // 申报已截止
            subTitle="已截止";
            option.title.text = "0";
            option.title.textStyle.color = "rgba(0, 0, 0, 1)"
            option.series[0].data[0].itemStyle.normal.color="rgba(238, 238, 238, 1)"
        }

    } else {
        // 申报未启动
        subTitle="未启动";
        option.title.text = `${Math.abs(startDays)}`;
        option.title.textStyle.color = "rgba(0, 211, 109, 1)"
        option.series[0].data[0].itemStyle.normal.color="rgba(238, 238, 238,  1)"
    }

    return (
        <div>
            <ECharts notMerge={true} option={option} style={{ width: "74px", height: "74px" }} />
            <div className="text-center size-13 mt10">{subTitle}</div>
        </div>
    );
}
export enum PolicyStatusEnum {
    /**
     * 申报中
     */
     declaring,
    /**
     * 未启动
     */
    nostart,
    /**
     * 已结束
     */
     end,
}
export function getPolicyStatus(declareStartTime, declareEndTime) {
    let deadlineSecs = getDeadlineSec(declareEndTime);
    let startSecs = getStartSec(declareStartTime);

    return declareStartTime ? (
        deadlineSecs >= 0 ? (
            startSecs >= 0 ? (
                PolicyStatusEnum.declaring
            ) : (
                PolicyStatusEnum.nostart
            )
        ) : (
            PolicyStatusEnum.end
        )
    ) : (
        PolicyStatusEnum.nostart
    );
}

/**
 * 多维数组转一维
 * @param arr
 * @returns
 */
 export function transformArrFromMultiToSingle(arr) {
    return [].concat.apply([], arr).filter((x) => x);
}
