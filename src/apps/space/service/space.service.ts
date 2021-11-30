import { HttpService, resolveService } from "@reco-m/core";

export class SpaceProjectHttpService extends HttpService {
    constructor() {
        super('space/project')
    }
    /**
     * 空间列表
     */
    getProjectList(data?: any) {
        return this.httpGet('', this.resolveRequestParams(data))
    }
    /**
     * 获取空间详情
     */
    getProjectDetail(id: any) {
        return this.httpGet(id)
    }
}

export const spaceProjectService = resolveService(SpaceProjectHttpService);
