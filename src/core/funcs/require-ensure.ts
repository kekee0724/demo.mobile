const STYLE_REG = /\.css$/i,
    installedChunks: any = {};

/**
 * 加载资源
 *
 * @param chunkIds 资源路径
 * @param urlArgs url参数
 * @param ignoreExten 是否忽略后缀
 * @returns 等待对象
 */
export function requireEnsure(chunkIds: (string | string[])[], urlArgs?: string, ignoreExten = false): Promise<any> {
    return Promise.all(chunkIds.map((chunkId) => (Array.isArray(chunkId) ? requireEnsures(chunkId) : requireAssort(chunkId)(chunkId, urlArgs, ignoreExten))));

    function requireAssort(chunkId: string) {
        return STYLE_REG.test(chunkId) ? requireEnsureCss : requireEnsureJs;
    }

    function requireEnsures(chunkIds: string[]) {
        const chunkId = chunkIds.shift();

        return chunkId && requireAssort(chunkId)(chunkId, urlArgs, ignoreExten).then(() => requireEnsures(chunkIds));
    }
}

/**
 * 加载js资源
 *
 * @param chunkIds 资源路径
 * @param urlArgs url参数
 * @param ignoreExten 是否忽略后缀
 * @returns 等待对象
 */
export function requireEnsureAllJs(chunkIds: (string | string[])[], urlArgs?: string, ignoreExten = false): Promise<any> {
    return Promise.all(chunkIds.map((chunkId) => (Array.isArray(chunkId) ? requireEnsure(chunkId) : requireEnsureJs(chunkId, urlArgs, ignoreExten))));

    function requireEnsure(chunkIds: string[]) {
        const chunkId = chunkIds.shift();

        return chunkId && requireEnsureJs(chunkId, urlArgs, ignoreExten).then(() => requireEnsure(chunkIds));
    }
}

/**
 * 加载js资源
 *
 * @param chunkIds 资源路径
 * @param urlArgs url参数
 * @param ignoreExten 是否忽略后缀
 * @returns 等待对象
 */
export function requireEnsureJs(chunkId: string, urlArgs?: string, ignoreExten = false) {
    const promises: Promise<any>[] = [];

    // JSONP chunk loading for javascript

    let installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
        // 0 means "already installed".

        // a Promise means "currently loading".
        if (installedChunkData) {
            promises.push(installedChunkData[2]);
        } else {
            // setup Promise in chunk cache
            const promise = new Promise((resolve, reject) => {
                installedChunkData = installedChunks[chunkId] = [resolve, reject];
            });
            promises.push((installedChunkData[2] = promise));

            // start chunk loading
            const script: any = document.createElement("script");

            script.charset = "utf-8";
            script.timeout = 120;
            if (__webpack_require__.nc) {
                script.setAttribute("nonce", __webpack_require__.nc);
            }
            script.src = `${__webpack_require__.p}${chunkId}${ignoreExten ? "" : ".js"}${urlArgs ? `?${urlArgs}` : ""}`;

            // create error before stack unwound to get useful stacktrace later
            const error: any = new Error();
            const onScriptComplete = (event) => {
                // avoid mem leaks in IE.
                script.onerror = script.onload = null;
                clearTimeout(timeout);
                const chunk = installedChunks[chunkId];
                if (chunk !== 0) {
                    if (chunk) {
                        const errorType = event && (event.type === "load" ? "missing" : event.type);
                        const realSrc = event && event.target && event.target.src;
                        error.message = "Loading chunk " + chunkId + " failed.\n(" + errorType + ": " + realSrc + ")";
                        error.name = "ChunkLoadError";
                        error.type = errorType;
                        error.request = realSrc;
                        chunk[1](error);
                    }
                    installedChunks[chunkId] = undefined;
                }
            };
            const timeout = setTimeout(() => {
                onScriptComplete({ type: "timeout", target: script });
            }, 120000);

            script.onload = (event) => {
                installedChunks[chunkId][0]();
                installedChunks[chunkId] = 0;

                onScriptComplete(event);
            };

            script.onerror = onScriptComplete;

            document.head.appendChild(script);
        }
    }

    return Promise.all(promises);
}

/**
 * 加载样式表资源
 *
 * @param chunkIds 资源路径
 * @param urlArgs url参数
 * @param ignoreExten 是否忽略后缀
 * @returns 等待对象
 */
export function requireEnsureAllCss(chunkIds: (string | string[])[], urlArgs?: string, ignoreExten = false): Promise<any> {
    return Promise.all(chunkIds.map((chunkId) => (Array.isArray(chunkId) ? requireEnsure(chunkId) : requireEnsureCss(chunkId, urlArgs, ignoreExten))));

    function requireEnsure(chunkIds: string[]) {
        const chunkId = chunkIds.shift();

        return chunkId && requireEnsureCss(chunkId, urlArgs, ignoreExten).then(() => requireEnsure(chunkIds));
    }
}

/**
 * 加载样式表资源
 *
 * @param chunkIds 资源路径
 * @param urlArgs url参数
 * @param ignoreExten 是否忽略后缀
 * @returns 等待对象
 */
export function requireEnsureCss(chunkId: string, urlArgs?: string, ignoreExten = false) {
    const promises: Promise<any>[] = [];

    // JSONP chunk loading for javascript

    let installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
        // 0 means "already installed".

        // a Promise means "currently loading".
        if (installedChunkData) {
            promises.push(installedChunkData[2]);
        } else {
            // setup Promise in chunk cache
            const promise = new Promise((resolve, reject) => {
                installedChunkData = installedChunks[chunkId] = [resolve, reject];
            });
            promises.push((installedChunkData[2] = promise));

            // start chunk loading
            const link: any = document.createElement("link");

            link.rel = "stylesheet";
            link.type = "text/css";
            link.charset = "utf-8";
            link.timeout = 120;

            if (__webpack_require__.nc) {
                link.setAttribute("nonce", __webpack_require__.nc);
            }
            link.href = `${__webpack_require__.p}${STYLE_REG.test(chunkId) ? chunkId : `${chunkId}${ignoreExten ? "" : ".css"}`}${urlArgs ? `?${urlArgs}` : ""}`;

            // create error before stack unwound to get useful stacktrace later
            const error: any = new Error();
            const onScriptComplete = (event) => {
                // avoid mem leaks in IE.
                link.onerror = link.onload = null;
                clearTimeout(timeout);
                const chunk = installedChunks[chunkId];
                if (chunk !== 0) {
                    if (chunk) {
                        const errorType = event && (event.type === "load" ? "missing" : event.type);
                        const realSrc = event && event.target && event.target.src;
                        error.message = "Loading chunk " + chunkId + " failed.\n(" + errorType + ": " + realSrc + ")";
                        error.name = "ChunkLoadError";
                        error.type = errorType;
                        error.request = realSrc;
                        chunk[1](error);
                    }
                    installedChunks[chunkId] = undefined;
                }
            };
            const timeout = setTimeout(() => {
                onScriptComplete({ type: "timeout", target: link });
            }, 120000);

            link.onload = (event) => {
                installedChunks[chunkId][0]();
                installedChunks[chunkId] = 0;

                onScriptComplete(event);
            };

            link.onerror = onScriptComplete;

            document.head.appendChild(link);
        }
    }

    return Promise.all(promises);
}
