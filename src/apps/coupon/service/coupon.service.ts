import { HttpService, resolveService } from "@reco-m/core";

export class NewCouponHttpService extends HttpService {
    constructor() {
        super("coupon/coupon");
    }
    /**
     * 获取我的优惠券
     */
    getMyCoupon(data: any) {
        return this.httpGet("my-coupon-ticket-paged", this.resolveRequestParams(data));
    }
    /**
     * 获取全部优惠券
     */
    getAllCoupon(data: any) {
        return this.httpGet("", this.resolveRequestParams(data));
    }
     /**
      * 领取优惠券
      */
    gainCoupon(id: any, data) {
        return this.httpPost("receive-coupon-ticket/" + id, data);
    }
    /**
     * 转增优惠券
     */
    givenCoupon(id: any, data) {
        return this.httpPut("give-coupon-ticket/" + id, data);
    }
}
export const newCouponHttpService = resolveService(NewCouponHttpService);
