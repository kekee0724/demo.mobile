import { HttpService, resolveService } from "@reco-m/core";

export class GetAttachmentHttpService extends HttpService {
    constructor() {
        super("attach/picture");
    }
    /**
     * 获取附件列表
     */
    getAttachmentList(data: any) {
        return this.httpGet("list", this.resolveRequestParams(data));
    }
    /**
     * 上传附件
     */
    upload(name, data: any) {
        return this.httpPost(`upload-chunk/${name}`, data);
    }
    /**
     * 保存附件
     */
     save(data: any) {
        return this.httpPost(``, data);
    }
  }
  export const getAttachmentService = resolveService(GetAttachmentHttpService);