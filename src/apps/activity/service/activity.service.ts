import { HttpService, resolveService, pictureService } from "@reco-m/core";
export class ActivityHttpService extends HttpService {
    constructor() {
        super("activity/activity");
    }
    getDetail(id, data) {
        return this.httpGet(id, this.resolveRequestParams(data));
    }
}
export const activityHttpService = resolveService(ActivityHttpService);
export class ActivityApplyHttpService extends HttpService {
    constructor() {
        super("activity/apply");
    }
    /**
     * 报名
     * @param activityId
     * @param [data]
     * @returns
     */
    apply(activityID, data?: any) {
        return this.httpPost("" + activityID, data);
    }
    /**
     * 取消报名
     * @param activityId
     * @param [mobile]
     * @returns
     */
    unapply(activityID, mobile?: any) {
        return this.httpDelete("" + activityID + "?mobile=" + mobile);
    }
    /**
     * 报名详情
     * @param activityId
     * @param [datas]
     * @returns
     */
    applydetail(activityID, datas?: any) {
        return this.httpGet("" + activityID, this.resolveRequestParams(datas));
    }
}
export const activityApplyHttpService = resolveService(ActivityApplyHttpService);
export class ActivityApplyFormHttpService extends HttpService {
    constructor() {
        super("activity/apply-form");
    }
    /**
     * 报名表单
     * @param [data]
     * @returns
     */
    applyform(data?: any) {
        return this.httpGet("list", this.resolveRequestParams(data));
    }
}
export const activityApplyFormHttpService = resolveService(ActivityApplyFormHttpService);

export class ActivitySignHttpService extends HttpService {
    constructor() {
        super("activity/sign-in");
    }
    signIn(activityID, data?: any) {
        return this.httpPut("" + activityID, data);
    }
}
export const activitySignHttpService = resolveService(ActivitySignHttpService);
export const pictureHttpService = pictureService;
