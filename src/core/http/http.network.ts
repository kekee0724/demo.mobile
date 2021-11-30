import fetch from "isomorphic-fetch";

import { getObjectProp } from "../utils/get.object.prop";
import { customEvent } from "../utils/custom.event";

import { onLine } from "./utils";
import { HttpRequest } from "./http.request";

let timeout = getObjectProp(client, "http.timeout", 90000),
    disableTimeout = getObjectProp(client, "http.disableTimeout", !1);

if (navigator && (navigator as any).connection) {
    const times = { "2g": 18000, "3g": 12000 };

    (navigator as any).connection.onchange = ({ target = { effectiveType: "4g" } }) => {
        timeout = times[target.effectiveType] || 90000;
    };
}

function emit(data: any) {
    customEvent.emit("networkError", data);
}

export function httpRequest(input: HttpRequest) {
    return new Promise<any>((resolve, reject) => {
        if (onLine()) {
            const controller = AbortController ? new AbortController() : undefined,
                options = input.options!,
                time =
                    options!.disableTimeout || disableTimeout
                        ? 0
                        : setTimeout(() => {
                              const msg = {
                                  status: 408,
                                  errmsg: "服务器繁忙，请稍后重试。",
                                  input,
                              };

                              controller && controller.abort();

                              emit(msg), reject(msg);
                          }, getObjectProp(options, "timeout", timeout));

            fetch(input.request, { signal: controller?.signal })
                .then(
                    (res) => (time && clearTimeout(time), res),
                    (err) => (time && clearTimeout(time), { status: 404, err } as any)
                )
                .then((res: Response) => {
                    if (res.ok) resolve(res as any);
                    else if (res.status === 400) {
                        // console.log("res", res);
                        res.json().then((d) => {
                            // console.log("dddddddddd", d);
                            
                            return ((((res as any).data = d), ((res as any).input = input), ((res as any).options = options)), emit(res), reject(d))
                        }, reject);
                    } else {
                        let errmsg;
                        // tslint:disable-next-line: switch-default
                        switch (res.status) {
                            case 401:
                                errmsg = "会话超时，请重新登录。";
                                break;
                            case 403:
                                errmsg = "无权限。";
                                break;
                            case 404:
                                errmsg = `网络不稳定，请稍后再试。`; // `远程地址 "${typeof input === "string" ? input : input && input.url}" 无法访问。`;
                                break;
                            default:
                                errmsg = `远程服务异常,请稍后重试, 服务状态：${res.statusText}`;
                                break;
                        }

                        (((res as any).errmsg = errmsg), ((res as any).input = input)), emit(res), reject(res);
                    }
                });
        } else {
            const msg = { status: -1, errmsg: "网络无法连接，请检查网络连接是否正常。", input };

            emit(msg), reject(msg);
        }
    });
}
