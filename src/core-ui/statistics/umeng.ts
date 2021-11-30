let isWebviewFlag = true;

// function setWebViewFlag() {
//     isWebviewFlag = true;
// }

function loadURL(url) {
    let iFrame;
    iFrame = document.createElement("iframe");
    iFrame.setAttribute("src", url);
    iFrame.setAttribute("style", "display:none;");
    iFrame.setAttribute("height", "0px");
    iFrame.setAttribute("width", "0px");
    iFrame.setAttribute("frameborder", "0");
    document.body.appendChild(iFrame);
    iFrame.parentNode.removeChild(iFrame);
    iFrame = null;

    // if (window["WebViewJavascriptBridge"] || window["webkit"]) {
    //     const a = document.createElement("a");

    //     a.href = url;

    //     a.click();
    // }
    // document.removeChild(a);
}

function exec(funName, args) {
    let commend = {
        functionName: funName,
        arguments: args,
    };
    let jsonStr = JSON.stringify(commend);
    let url = "umanalytics:" + jsonStr;
    loadURL(url);
}

class MobclickAgent {
    getDeviceId(callBack) {
        if (isWebviewFlag) {
            exec("getDeviceId", [callBack.name]);
        }
    }
    onCCEvent(evenArray, evenValue, eventLabel) {
        if (isWebviewFlag) {
            exec("onCCEvent", [evenArray, evenValue, eventLabel]);
        }
    }
    /**
     * 自定义事件数量统计
     *
     * @param eventId
     *            String类型.事件ID，注意需要先在友盟网站注册此ID
     */
    onEvent(eventId) {
        if (isWebviewFlag) {
            exec("onEvent", [eventId]);
        }
    }
    /**
     * 自定义事件数量统计
     *
     * @param eventId
     *            String类型.事件ID， 注意需要先在友盟网站注册此ID
     * @param eventLabel
     *            String类型.事件标签，事件的一个属性说明
     */
    onEventWithLabel(eventId, eventLabel) {
        if (isWebviewFlag) {
            exec("onEventWithLabel", [eventId, eventLabel]);
        }
    }
    /**
     * 自定义事件数量统计
     *
     * @param eventId
     *            String类型.事件ID， 注意需要先在友盟网站注册此ID
     * @param eventData
     *            Map<String,String>类型.当前事件的属性集合，最多支持10个K-V值
     */
    onEventWithParameters(eventId, eventData) {
        if (isWebviewFlag) {
            exec("onEventWithParameters", [eventId, eventData]);
        }
    }
    /**
     * 自定义事件数值型统计
     *
     * @param eventId
     *            String类型.事件ID，注意要先在友盟网站上注册此事件ID
     * @param eventData
     *            Map<String,String>类型.事件的属性集合，最多支持10个K-V值
     * @param eventNum
     *            int 类型.事件持续时长，单位毫秒，您需要手动计算并传入时长，作为事件的时长参数
     *
     */
    onEventWithCounter(eventId, eventData, eventNum) {
        if (isWebviewFlag) {
            exec("onEventWithCounter", [eventId, eventData, eventNum]);
        }
    }
    /**
     * 页面统计开始时调用
     *
     * @param pageName
     *            String类型.页面名称
     */
    onPageBegin(pageName) {
        if (isWebviewFlag) {
            exec("onPageBegin", [pageName]);
        }
    }
    /**
     * 页面统计结束时调用
     *
     * @param pageName
     *            String类型.页面名称
     */
    onPageEnd(pageName) {
        if (isWebviewFlag) {
            exec("onPageEnd", [pageName]);
        }
    }
    /**
     * 统计帐号登录接口 *
     *
     * @param UID
     *            用户账号ID,长度小于64字节
     */
    profileSignInWithPUID(UID) {
        if (isWebviewFlag) {
            exec("profileSignInWithPUID", [UID]);
        }
    }
    /**
     * 统计帐号登录接口 *
     *
     * @param provider
     *            帐号来源.用户通过第三方账号登陆,可以调用此接口进行统计.不能以下划线"_"开头,使用大写字母和数字标识,长度小于32字节;
     *            如果是上市公司,建议使用股票代码.
     * @param UID
     *            用户账号ID,长度小于64字节
     */
    profileSignInWithPUIDWithProvider(provider, UID) {
        if (isWebviewFlag) {
            exec("profileSignInWithPUIDWithProvider", [provider, UID]);
        }
    }
    /**
     * 帐号统计退出接口
     */
    profileSignOff() {
        if (isWebviewFlag) {
            exec("profileSignOff", []);
        }
    }
}

export function Mobclick() {
    return new MobclickAgent();
}
