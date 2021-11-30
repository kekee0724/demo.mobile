import { postBridgeMessage } from "./browser";

export enum loginType {
    qq,
    wechat,
    weibo
}


export enum socialType {
    WeChat = "12",
    QQ = "15",
    WeiBo = "16",
    Alipay = "17"
}

// 测试地址
// /login/accountbindmobile/?type=0&thirdcode=4B9B0F25EBECFB94EDAA0E38EEAC2B98
// /my/setting/safe/social?type=1&thirdcode=011mkEQL1EoIx71bw4PL1M5nQL1mkEQw
export function otherLogin(type: loginType, data: any) {
    let result: Promise<any> | null = null;
    if (type === loginType.qq) {
        result = postBridgeMessage("qqLogin", data);
    } else if (type === loginType.wechat) {
        // 微信登录
        result = postBridgeMessage("wechatLogin", data);
    } else if (type === loginType.weibo) {
        result = postBridgeMessage("weiboLogin", data);
    }

    if (result) {
        return result.then(
            data => {
                return data;
            }
        );
    }
}
