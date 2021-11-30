import { HttpService, resolveService } from "@reco-m/core";

export class NotificationService extends HttpService {
  constructor() {
    super("notification/notification");
  }

  getScene(data: any) {
    return this.httpGet('scene', this.resolveRequestParams(data))
  }

  /**
   * 阅读消息
   */
  readNotification(data: any) {
    return this.httpPost("read?deliveryId=" + data);
  }

  /**
   * 阅读消息
   */
  readAllNotification(data: any) {
    return this.httpPost("read-all?notificationType=" + data.notificationType + "&sceneId=" + data.sceneId)
  }

  deleteNotification(id: any) {
    return this.httpDelete(`${id}`);
  }

}
export const notificationService = resolveService(NotificationService);
export class NotificationSceneService extends HttpService {
  constructor() {
    super("notification/scene")
  }

  getAllScene(data: any) {
    return this.httpGet('list', this.resolveRequestParams(data))
  }
  getTakeScene(productCode: any) {
    return this.httpGet('list/' + productCode)
  }
  takeScene(data: any) {
    return this.httpPost("take", data);
  }
  cancelTake(data: any) {
    return this.httpPost("cancel-take", data);
  }
}


export const notificationSceneService = resolveService(NotificationSceneService);

