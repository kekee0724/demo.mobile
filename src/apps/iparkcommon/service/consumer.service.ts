import { HttpService, resolveService } from "@reco-m/core";
export class ConsumerHttpService extends HttpService {
    constructor() {
        super("consumer/consumer");
    }

    /**
     * 获取当前用户信息
     * @returns
     */
    getCurrentConsumer(data?: any) {
        return this.httpGet("current-consumer", this.resolveRequestParams(data));
    }

    /**
     * 修改企业用户
     * @param id
     * @param data
     * @returns
     */
    putEnterprise(id: any, data: any) {
        return this.httpPut(`put-enterprise/${id}`, data);
    }

    /**
     * 修改个人用户
     * @param id
     * @param data
     * @returns
     */
    putPersonal(id: any, data: any) {
        return this.httpPut(`put-personal/${id}`, data);
    }

    /**
     * 修改专家信息
     * @param id
     * @param data
     * @returns
     */
    putExpert(id: any, data: any) {
        return this.httpPut(`put-expert/${id}`, data);
    }

    /**
     * 设置用户类型
     * @param id
     * @returns
     */
    setConsumerType(id: any) {
        return this.httpGet(`set-consumertype/${id}`);
    }
}
export const consumerService = resolveService(ConsumerHttpService);
