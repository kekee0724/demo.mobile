import { HttpService, resolveService } from "@reco-m/core";

export class GetFileHttpService extends HttpService {
    constructor() {
        super("file-manage/file-manage");
    }

    /**
     * 获取文件列表
     * @param data
     */
    getFileList(data: any) {
        return this.httpGet("", this.resolveRequestParams(data));
    }
}

export const getFileService = resolveService(GetFileHttpService);
