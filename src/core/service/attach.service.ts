import { resolveService } from "../funcs/resolve.service";
import { RequestOptionsArgs, IDParam } from "../http";

import { HttpService } from "./core.service";

export class AttachService extends HttpService {
    guid: (prefix?: string) => string;

    constructor(controllerName: string = "attach/index") {
        super(controllerName);

        this.guid = guid();
    }

    getUploadChunkUrl(uploadId: string): string {
        return this.getRootUrl(this.transformUrl(this.resolveUrl("upload-chunk", uploadId)));
    }

    getPreviewUrl(id: IDParam, uploadId?: string, options?: RequestOptionsArgs) {
        return this.httpGet(this.resolveUrl("preview-url", id), this.resolveRequestParams({ uploadId }, options));
    }

    downloadFile(uploadId: string, id: IDParam, options?: RequestOptionsArgs) {
        return this.httpGetDownload(this.resolveUrl("download", id), this.resolveRequestParams({ uploadId }, options));
    }
}

export const attachService = resolveService(AttachService);

function guid() {
    let counter = 0;

    return (prefix?: string) => {
        let uid = (+new Date()).toString(32),
            i = 0;

        for (; i < 5; i++) {
            uid += Math.floor(Math.random() * 65535).toString(32);
        }

        return (prefix || "wu_") + uid + (counter++).toString(32);
    };
}
