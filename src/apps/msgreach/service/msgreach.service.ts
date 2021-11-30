import { HttpService, resolveService } from "@reco-m/core";

/**
 * 信息触达接口
 */
export class MsgReachHttpService extends HttpService {
    constructor() {
        super("messagereach/push-and-read");
    }

    /**
     * 获取推送内容
     * @param data
     */
    getMsg(data) {
        return this.httpGet("get-msg", this.resolveRequestParams(data));
    }

    /**
     * 已读推送内容
     * @param data
     */
    readMsg(data) {
        return this.httpGet("read-msg", this.resolveRequestParams(data));
    }

    /**
     * 判断手机号是注册还是登陆
     * @param mobile
     * @returns
     */
    getRegisterOrLogin(mobile) {
        return this.httpGet("register-or-login/" + mobile);
    }
}
export const msgReachService = resolveService(MsgReachHttpService);
