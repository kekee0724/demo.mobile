// import React from "react";
import { Modal, Toast } from "antd-mobile-v2";
import { browser, setLocalStorage, getObjectProp } from "@reco-m/core";
import { postBridgeMessage, popstateHandler } from "@reco-m/core-ui";
import { cashAliPayService, wechatPayService } from "@reco-m/ipark-common-service";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
const ddkit = window["dd"];

export function noPassByName(str) {
    if (str.length === 2) {
        return str.replace(/(.{1}).*/, "$1***");
    } else {
        return str.replace(/(.{1}).*(.{1})/, "$1***$2");
    }
}

export function debounce(func, wait) {
    let timeout;
    return function (args?) {
        if (timeout) clearTimeout(timeout);
        let callNow = !timeout;
        timeout = setTimeout(() => {
            timeout = null;
        }, wait);

        if (callNow) {
            func(args);
        } else {
            ToastInfo("操作太频繁啦，请稍后重试~");
        }
    };
}
export function callEmail(email: string) {
    window.location.href = "mailto:" + email;
}

export function callTel(tel: string) {
    let modal = Modal.alert("拨号提示", `您确定要拨打${tel}？`, [
        {
            text: "取消",
            onPress: () => {
                popstateHandler.removePopstateListener();
            },
        },
        {
            text: "确认",
            onPress: () => {
                popstateHandler.removePopstateListener();
                setTimeout(() => {
                    window.location.href = "tel:" + tel;
                }, 1000);
            },
        },
    ]);
    popstateHandler.popstateListener(() => {
        modal.close();
    });
}
export function isDingding() {
    return !(!ddkit || (ddkit && ddkit.env.platform === "notInDingTalk"));
}
// 钉钉鉴权
export function dingconfig(result) {
    ddkit &&
        ddkit.config({
            agentId: result.agentId, // 必填，微应用ID
            corpId: result.corpId, // 必填，企业ID
            timeStamp: result.timeStamp, // 必填，生成签名的时间戳
            nonceStr: result.nonceStr, // 必填，生成签名的随机串
            signature: result.signature, // 必填，签名
            type: 0, // 选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
            jsApiList: [
                "biz.map.view", // 展示位置
                "device.geolocation.get", // 获取当前地理位置信息(单次定位)
                "biz.ding.create", // dING 2.0发钉
                "biz.util.scanCard", // 扫名片
                "device.audio.startRecord", // 开始录音
                "device.audio.stopRecord", // 停止录音
                "device.audio.onRecordEnd", // 监听录音自动停止
                "device.audio.download", // 下载音频
                "device.audio.play", // 播放语音
                "device.audio.pause", // 暂停播放语音
                "device.audio.resume", // 恢复暂停播放的语音
                "device.audio.stop", // 停止播放音频
                "device.audio.onPlayEnd", // 监听播放自动停止
                "device.audio.translateVoice", // 语音转文字
                "biz.telephone.call", // 拨打钉钉电话
                "biz.chat.openSingleChat", // 打开与某个用户的单聊会话
            ], // 必填，需要使用的jsapi列表，注意：不要带dd。
        });
    ddkit &&
        ddkit.error(function (err) {
            alert(`config=${JSON.stringify(err)}`);
        });
}
// h5打开地图
export function openAddress(latitude, longitude, name?) {
    if (browser.versions.weChat) {
        wx.openLocation({
            latitude: latitude, // 纬度，浮点数，范围为90 ~ -90
            longitude: longitude, // 经度，浮点数，范围为180 ~ -180。
            name: name, // 位置名
            address: "", // 地址详情说明
            scale: 13, // 地图缩放级别,整形值,范围从1~28。默认为最大
            infoUrl: "", // 在查看位置界面底部显示的超链接,可点击跳转
        });
    } else if (isDingding()) {
        ddkit &&
            ddkit.ready(function () {
                // alert("11111")
                ddkit.biz.map.view({
                    latitude: latitude, // 纬度
                    longitude: longitude, // 经度
                    title: name, // 地址/POI名称
                });
            });
        ddkit &&
            ddkit.error(function (err) {
                alert(`openAddress=${JSON.stringify(err)}`);
            });
    } else {
        location.href = `https://m.amap.com/navi/?dest=${longitude},${latitude}&destName=${name}&hideRouteIcon=1&key=32a27fb58b64adbf3846556e180e5134`;
    }
}

// 获取微信授权url参数
export function getQueryString(name) {
    const result = location.href.match(new RegExp("[?&]" + name + "=([^&]+)", "i"));
    if (result == null || result.length < 1) return "";
    return result[1];
}

// 钉钉单次定位
export function dinglocation(success, fail?) {
    ddkit &&
        ddkit.ready(function () {
            // dd.ready参数为回调函数，在环境准备就绪时触发，jsapi的调用需要保证在该回调函数触发后调用，否则无效。
            ddkit.device.geolocation.get({
                targetAccuracy: 100,
                coordinate: 1,
                withReGeocode: true,
                useCache: true, // 默认是true，如果需要频繁获取地理位置，请设置false
                onSuccess: function (result) {
                    alert(JSON.stringify(result));
                    success(result);
                    // 高德坐标 result 结构
                    // {
                    //     longitude : Number,
                    //     latitude : Number,
                    //     accuracy : Number,
                    //     address : String,
                    //     province : String,
                    //     city : String,
                    //     district : String,
                    //     road : String,
                    //     netType : String,
                    //     operatorType : String,
                    //     errorMessage : String,
                    //     errorCode : Number,
                    //     isWifiEnabled : Boolean,
                    //     isGpsEnabled : Boolean,
                    //     isFromMock : Boolean,
                    //     provider : wifi|lbs|gps,
                    //     isMobileEnabled : Boolean
                    // }
                },
                onFail: function (err) {
                    fail ? fail(err) : alert(`dingdingerr=${JSON.stringify(err)}`);
                },
            });
        });
    ddkit &&
        ddkit.error(function (err) {
            alert(`err=${JSON.stringify(err)}`);
        });
}
// 支付宝支付
export function aliPay(params: any, payWay: any) {
    // //模拟失败
    // return cashAliPayService.pay(params).then(d => (postBridgeMessage("aliPay", {
    //     ...params,
    //     pay: d.pay,
    //     aliSign: d.result,
    //     payWay: payWay
    // }), Promise.reject({...params, payWay: payWay}))
    // );

    // // 模拟成功
    // return cashAliPayService.pay(params).then(d => (postBridgeMessage("aliPay", {
    //     ...params,
    //     pay: d.pay,
    //     aliSign: d.result,
    //     payWay: payWay
    // }), {
    //     ...params,
    //     payWay: payWay
    // })
    // );

    // 旧写法,app返回结果
    // return cashAliPayService.pay(params).then((d) => {
    //     return postBridgeMessage("aliPay", {
    //         ...params,
    //         pay: d.pay,
    //         aliSign: d.result,
    //         payWay: payWay,
    //     });
    // });

    // 新写法,接口返回结果
    return cashAliPayService.pay(params).then((d) => {
        postBridgeMessage("aliPay", {
            ...params,
            pay: d.pay,
            aliSign: d.result,
            payWay: payWay,
        });
        return Promise.resolve({
            ...params,
            pay: d.pay,
            aliSign: d.result,
            payWay: payWay,
        });
    });
}
// 微信支付
export function wechatPay(params: any, paytype: any, payWay: any) {
    return wechatPayService.pay(params).then((d: any) => {
        let wxParam = new URLSearchParams(d.result) as any;
        let statusCode = wxParam.get("statusCode") || 0;
        if (statusCode > 0) {
            let message = wxParam.get("message") || 0;
            ToastInfo(message);
            return Promise.reject({ ...params, payWay: payWay });
        }

        wxParam = JSON.parse(d.result);
        let appid = wxParam.appid || 0;
        let partnerid = wxParam.partnerid || 0;
        let prepayid = wxParam.prepayid || 0;
        let noncestr = wxParam.noncestr || 0;
        let timestamp = wxParam.timestamp || 0;
        let packages = wxParam.package || 0;
        let sign = wxParam.paySign || 0;

        // 旧写法,app返回结果
        // return postBridgeMessage(
        //     "wechatPay",
        //     Object.assign({}, params, {
        //         type: paytype,
        //         payWay: payWay,
        //         appid,
        //         partnerid,
        //         prepayid,
        //         noncestr,
        //         timestamp,
        //         package: packages,
        //         sign,
        //     })
        // );

        // 新写法,接口返回结果
        postBridgeMessage(
            "wechatPay",
            Object.assign({}, params, {
                type: paytype,
                payWay: payWay,
                appid,
                partnerid,
                prepayid,
                noncestr,
                timestamp,
                package: packages,
                sign,
                pay: d.pay,
            })
        );

        return Promise.resolve(
            Object.assign({}, params, {
                type: paytype,
                payWay: payWay,
                appid,
                partnerid,
                prepayid,
                noncestr,
                timestamp,
                package: packages,
                sign,
                pay: d.pay,
            })
        );
    });
}

// 深度拷贝
export function deepClone(obj) {
    if (!obj) return obj;
    let _obj = JSON.stringify(obj);
    return JSON.parse(_obj);
}

// 浏览器指纹采集器
export function fingerprintjs() {
    (async () => {
        // we recommend to call `load` at application startup.
        const fp = await FingerprintJS.load();
        // the FingerprintJS agent is ready.
        // get a visitor identifier when you'd like to.
        const result = await fp.get();
        // this is the visitor identifier:
        const visitorId = result.visitorId;
        setLocalStorage("fingerprint", visitorId);
    })();
}

export function orderexist(title: any, items: any[]) {
    return items.some((item) => item.key === title);
}

export function synchronousSerial(fun, time?) {
    if (time) {
        setTimeout(fun, time);
    } else {
        setTimeout(fun);
    }
}

export function htmlContentTreatWord(content) {
    return content && content.replace(/<\/?.+?\/?>/g, "").replace(/&nbsp;/gi, "");
}
export function htmlContentTreatFormat(content) {
    return content && content.replace(/\r\n/g, "<br />").replace(/\r/g, "<br />").replace(/\n/g, "<br />");
}

export function setMapScript(key) {
    const id = getObjectProp(client, "amap.script.id", `amap1`);
    const element = document.getElementById(id);
    if (element && element?.getAttribute("src")?.includes(key)) {
        return;
    } else if (element) {
        element.remove();
    }
    const src = getObjectProp(client, "amap.script.src", `https://webapi.amap.com/maps?v=1.4.10&`) + `key=${key}`;
    const script = document.createElement("script"); //创建一个script标签
    script.type = "text/javascript";
    script.id = id;
    script.src = src;

    document.getElementsByTagName("head")[0].appendChild(script);
}
/**
 * 自定义Toast弹出框,默认是感叹号+2秒停留
 * @param content 提示内容
 * @param duration 自动关闭的延时，单位秒，默认2秒
 * @param icon 显示图标
 * @param success 回调函数
 */
export function ToastInfo(content, duration = 2, _icon = "icon icon-50 size-35", success?: () => void) {
    // Toast.info(
    //     <div>
    //         <i className={icon} />
    //         <div className="size-15 mt10 mb5 ml5 mr5">{content}</div>
    //     </div>,
    //     duration,
    //     success
    // );
    Toast.fail(content, duration, success);
}

/**
 * 是否是手机浏览器
 * @returns
 */
export function isMobile() {
    let mobile = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );
    return mobile != null;
}


/*——————————————————————————————适配小程序安卓返回start——————————————————————————————*/
let pathname = null, // 小程序跳转h5初始页面
    thispathname = null, // 小程序h5首页跳转前所在页面
    nextpathname = null; // 小程序h5即将跳转的页面

let compatibled = false;
export function setInitPathname(_this) {
    pathname = _this.props.location!.pathname;
}
// 兼容微信小程序webview跳转
export function goToCompatibleWxmini(_this, fun) {
    let _thispathname = _this.props.location!.pathname;
    // 处于小程序中，并且小程序跳转初始页面就是当前页面时才处理兼容个别安卓操作
    if (browser.versions.weChatMini && browser.versions.android && pathname === _thispathname) {
        thispathname = _thispathname;
        _thispathname && _this.goTo(_thispathname);
        setTimeout(() => {
            compatibled = true; // 已作兼容处理，上一步goto
            fun();
        }, 200);
    } else {
        fun();
    }
}
export function nextpathnames(thisProps, nextprops) {
    if (!browser.versions.weChatMini) {
        return;
    }
    // alert(`thispathname=${thispathname}`);

    // alert(`nextprops.location!.pathname=${nextprops.location!.pathname}`);
    // alert(`thisProps.location!.pathname=${thisProps.location!.pathname}`);
    // alert(location!.pathname);


    // 已作兼容处理， 并回到兼容处理页面
    if (compatibled && nextprops.location!.pathname === thispathname && thisProps.location!.pathname !== thispathname) {
        // nextpathname = null;
        thispathname = null;
        compatibled = false;
    }
    nextpathname = nextprops.location!.pathname;
}
export function popstateFun() {
    // alert(`pathname=${thispathname}`);
    // alert(location.href);
    // let locationPath = location.href.split("/#")[1]
    // alert(`locationPath=${locationPath}&&pathname=${pathname}&&&goBackTag=${window["goBackTag"]}`)
    if ((nextpathname && !thispathname) ) {
        wx["miniProgram"].navigateBack();
    }
}
export function addEventListeners() {
    browser.versions.weChatMini  && browser.versions.android && window.addEventListener("popstate", popstateFun);
}

/*——————————————————————————————适配小程序安卓返回end——————————————————————————————*/
