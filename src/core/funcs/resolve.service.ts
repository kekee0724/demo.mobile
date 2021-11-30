import { Type } from "../type";
import { HttpService } from "../service/core.service";

const ignoreNames = [
        "constructor",
        "http",
        "controllerName",
        "httpRequest",
        "httpGet",
        "httpPost",
        "httpPut",
        "httpDelete",
        "httpPatch",
        "httpHead",
        "httpOptions",
        "httpUpload",
        "transformRequestUrl",
        "resolveRequestContentType",
        "resolveRequestHeaders",
        "resolveRequestParams",
        "resolveUrl",
        "transformUrl",
        "getRootUrl"
    ],
    container = new Map<Type<HttpService>, HttpService>();

function traversal(proto, thisArg) {
    if (!proto) return;

    proto.constructor === HttpService || traversal(proto.__proto__, thisArg);

    Object.getOwnPropertyNames(proto).forEach(key => {
        if (ignoreNames.some(d => d === key)) return;

        const prop = thisArg[key];

        if (typeof prop === "function") thisArg[key] = prop.bind(thisArg);
    });
}

export function resolveService<S extends HttpService>(service: Type<S>) {
    let instance = container.get(service);

    if (!instance) {
        instance = new service();

        traversal(instance, instance);

        container.set(service, instance);
    }

    return instance as S;
}
