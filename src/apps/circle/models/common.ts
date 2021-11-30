export enum Namespaces {
    circle = "circle",
    circleList = "circleList",
    circleAdd = "circleAdd",
    circleDetail = "circleDetail",
    selectCircle = "selectCircle",
    circleTopicDetail = "circleTopicDetail",
    myTrend = "myTrend",
    myTopic = "myTopic",
    myFans = "myFans",
    myFollow = "myFollow",
    circlecomment = "circlecomment",
    circlecommentFooter= "circlecommentFooter",
    newesttopicdetails = "newesttopicdetails",
    accountHome = "accountHome"
}
/**
 * 添加类型
 */
export enum AddTypeEnum {
    /**
     * 暂存
     */
    temp = 0,
    /**
     * 添加
     */
    add = 1
}
// html相关属性去除
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
            return summary + "······"
        }
    }
}
