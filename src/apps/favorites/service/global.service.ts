import { HttpService, resolveService } from "@reco-m/core";


/**
 * 收藏表管理
 */
export class CollectionHttpService extends HttpService {

  constructor() {
    super("collection/collection");
  }

  isCollected(data: any) {
    return this.httpGet("is-collected", this.resolveRequestParams(data))
  }

  /**
   * 取消收藏
   */
  cancelCollection(data: any) {
    return this.httpDelete(`cancel-collect/${data.bindTableId}/${data.bindTableName}`)
  }

  /**
   * 收藏表  分页查询
   */
  getCollectionPaged(data: any) {
    return this.httpGet("collection-detail-paged", this.resolveRequestParams(data))
  }

  /**
   * 获取收藏数量接口 (新接口调整到park中)
   */
  getCollectionCount(data: any) {
    return this.httpGet("count", this.resolveRequestParams(data));
  }

  /**
   * 收藏表 查询全部
   */
  getCollectionList(data: any) {
    return this.httpGet("list", this.resolveRequestParams(data))
  }

}

export const collectionHttpService = resolveService(CollectionHttpService);



export class SearchTopicHttpService extends HttpService {
  constructor() {
    super("universalsearch");
  }
  getSearchData(data: any) {
    return this.httpGet("search", this.resolveRequestParams(data));
  }
}

export const searchService = resolveService(SearchTopicHttpService);
