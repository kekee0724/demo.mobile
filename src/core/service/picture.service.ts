import { resolveService } from "../funcs/resolve.service";

import { AttachService } from "./attach.service";

export class PictureService extends AttachService {
    constructor(controllerName: string = "attach/picture") {
        super(controllerName);
    }
    
    getPictureUrls(data?: string | URLSearchParams | { [key: string]: any | any[] }) {
        return this.httpGet(this.resolveUrl("urls"), this.resolveRequestParams(data!));
    }

    getPictureUrl(data?: string | URLSearchParams | { [key: string]: any | any[] }) {
        return this.httpGet(this.resolveUrl("url"), this.resolveRequestParams(data!));
    }

    getPictureList(data?: string | URLSearchParams | { [key: string]: any | any[] }) {
        return this.httpGet(this.resolveUrl("list"), this.resolveRequestParams(data!));
    }

    getEditorUploadUrl() {
        return this.getRootUrl(this.transformUrl("upload-img"));
    }
}

export const pictureService = resolveService(PictureService);
