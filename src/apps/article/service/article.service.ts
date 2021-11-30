import { HttpService, resolveService } from "@reco-m/core";

export class ArticleHttpService extends HttpService {
    constructor() {
        super("article/article");
    }
    /**
     * 获取我的里面的收藏列表
     */
    addView(id?: number) {
        return this.httpPut("browser/" + id);
    }
}

export const articleHttpService = resolveService(ArticleHttpService);

