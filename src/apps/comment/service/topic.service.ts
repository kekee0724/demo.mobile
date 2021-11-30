import { HttpService, resolveService } from "@reco-m/core";

/**
 * 评论服务
 */
export class InteractiveTopicHttpService extends HttpService {
    constructor() {
        super("comment/comment");
    }

    delete(id) {
        return this.httpDelete("user-delete/" + id);
    }

    getAgreeCoutn(id: any) {
        return this.httpGet("agree-count/" + id);
    }


    getCommentList(data: any) {
        return this.httpGet("getCommentList", this.resolveRequestParams(data));
    }
    /**
     * 获取评论个数
     */
    getCommentCount(data: any) {
        return this.httpGet("count", this.resolveRequestParams(data));
    }
}

export const interactiveTopicHttpService = resolveService(InteractiveTopicHttpService);
/**
 * 评论服务
 */
export class RateRateHttpService extends HttpService {
    constructor() {
        super("rate/rate");
    }
    getAgreeCoutn(id: any, name: any) {
        return this.httpGet("agree-info/" + id + "/" + name);
    }
    /**
     * 取消点赞
     * @param bindTableId
     * @param bindTableName
     */
    cancelAgree(bindTableId, bindTableName) {
        return this.httpDelete("cancel-agree/" + bindTableId + "/" + bindTableName);
    }
}

export const rateRateHttpService = resolveService(RateRateHttpService);
