import { CommentAuditStatusEnum } from "@reco-m/ipark-common";
export enum Namespaces {
    comment = "comment",
    commentInput = "commentInput",
    commentFooter = "commentFooter",
    evaluate = "evaluate",
}

/**
 * 评价类型枚举
 */
export enum TopicRateTypeEnum {
    /**
     * 评价
     */
    rate = 1,
    /**
     * 点赞
     */
    agree = 2,
}
/**
 * 评价操作
 */
export enum CommentTypeEnum {
    /**
     * 评论加
     */
    add = 1,
    /**
     * 评论减
     */
    reduce = 0,
}


/**
 * html相关属性去除
 */
export function getSummary(str: string) {
    if (str == null || str === undefined) {
        return "";
    } else {
        const tem = str
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&nbsp;/g, "")
            .replace(/<\/?.+?\/?>/g, "")
            .replace(/<[^>]+>/g, "");

        return tem;
    }
}

/**
 * html相关属性去除，并限制字数
 */
export function getLimitSummary(str: string, limitNum?: number) {
    let summary = getSummary(str);

    if (!limitNum) return summary;

    if (limitNum) {
        if (summary.length <= limitNum) return summary;
        else {
            summary = summary.slice(0, limitNum - 3);
            return summary + "······";
        }
    }
}
/**
 * 获取评论审核状态
 * @param status
 * @param type
 * @returns
 */
 export function getCommentAuditStatus(status, type: "label" | "class" = "label") {
    switch (status) {
        case CommentAuditStatusEnum.waitAudit:
            return type === "class" ? "5" : "待审核";
        case CommentAuditStatusEnum.fail:
            return type === "class" ? "4" : "审核退回";
        case CommentAuditStatusEnum.pass:
            return type === "class" ? "3" : "审核通过";
        default:
            return "--";
    }
}
