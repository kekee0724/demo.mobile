export const browser = {
    versions: (function () {
        const u = navigator.userAgent;

        return {
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
            android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1, // android终端或者uc浏览器
            iPhone: u.indexOf("iPhone") > -1 || u.indexOf("Mac") > -1, // 是否为iPhone或者QQHD浏览器
            iPad: u.indexOf("iPad") > -1, // 是否iPad
            weChat: u.indexOf("MicroMessenger") > -1,
            weChatMini: u.indexOf("miniProgram") != -1 // 小程序
        };
    })(),
};
