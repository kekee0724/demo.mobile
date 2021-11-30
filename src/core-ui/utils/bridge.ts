let changeCounter = 0;

function registerGlobalFunc(func: Function) {
    const globalFunc = `Global_Bridge_${++changeCounter}`;

    return (window[globalFunc] = func), globalFunc;
}

const defOptions = { timeout: 1000 * 60 * 3 };

function registerTimeout<T>(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void, action: string, data?: T, options?: any) {
    options = { ...defOptions, ...options };

    const time = options.timeout >= 0 ? setTimeout(() => (untied(), reject()), options.timeout) : undefined,
        resolveID = registerGlobalFunc((d) => {
            time || clearTimeout(time), untied(), resolve(d);
        }),
        rejectID = registerGlobalFunc((d) => {
            time || clearTimeout(time), untied(), reject(d);
        });

    function untied() {
        delete window[resolveID], delete window[rejectID];
    }

    return { action, resolve: resolveID, reject: rejectID, data, options };
}

export function webkitPostMessage<T>(action: string, data?: T, options?: any) {
    return new Promise((resolve, reject) => {
        try {
            const handler = webkit && webkit.messageHandlers["bridgeMessage"];

            handler ? handler.postMessage(registerTimeout(resolve, reject, action, data, options)) : reject();
        } catch (error) {
            reject(error);
        }
    });
}

export function webViewJavascriptBridge<T>(action: string, data?: T, options?: any) {
    return new Promise((resolve, reject) => {
        try {
            window["WebViewJavascriptBridge"]
                ? WebViewJavascriptBridge.callHandler("bridgeMessage", registerTimeout(resolve, reject, action, data, options))
                : resolve({ msg: "模拟通过" });
        } catch (error) {
            reject(error);
        }
    });
}

export function postBridgeMessage<T>(action: string, data?: T, options?: any) {
    return (!window["webkit"] ? webViewJavascriptBridge : webkitPostMessage)(action, data, options);
}
