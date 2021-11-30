import { HttpService, resolveService, pictureService } from "@reco-m/core";
export class CircleHttpService extends HttpService {
    constructor() {
        super("topic/topic");
    }

    get(id, data?) {
        return this.httpGet(id, this.resolveRequestParams(data));
    }
    Join(data?: any) {
        return this.httpPost("subscribe/" + data.id, data);
    }

    out(data?: any) {
        return this.httpDelete("unsubscribe/" + data.id, data);
    }
    
}

export const circleService = resolveService(CircleHttpService);
export const pictureHttpService = pictureService;

export class InteractiveTopicHttpService extends HttpService {
    constructor() {
        super("post/post");
    }
    deletListItem(data: any) {
        return this.httpDelete("Delete/" + data.id);
    }
    deletes(id: any) {
        return this.httpDelete(id);
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
}

export const rateRateHttpService = resolveService(RateRateHttpService);
export class FollowHttpService extends HttpService {
    constructor() {
        super("follow/follow");
    }
    /**
     * 我的关注
     */
    getMyfollow(data: any) {
        return this.httpGet("", this.resolveRequestParams(data));
    }
    /**
     * 我的粉丝
     */
    getMyFans(data: any) {
        return this.httpGet("my-fans-paged", this.resolveRequestParams(data));
    }
    /**
     * 关注
     */
    follow(data: any) {
        return this.httpPost("", data);
    }
    /**
     * 取消关注
     */
    cancelFollow(id: any) {
        return this.httpPut("cancel-follow/" + id + "/sys_account");
    }
    /**
     * 删除关注
     */
    deleteFollow(id: any) {
        return this.httpDelete(id);
    }
}

export const followService = resolveService(FollowHttpService);
