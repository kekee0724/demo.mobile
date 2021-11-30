import { HttpService, resolveService } from "@reco-m/core";

export class TagHttpService extends HttpService {
    constructor() {
        super("tag/tag");
    }

    getTagByTagClass(data?: any) {
        return this.httpGet("by-tagclass", this.resolveRequestParams(data));
    }
    getTagByTagClasses(data?: any) {
        return this.httpGet("by-tagclasses", this.resolveRequestParams(data));
    }
}

export const tagService = resolveService(TagHttpService);
