export const client: RECO.Mobile.Config.Client = (window["client"] = {
    title: "园企互动",
    techSupport: "技术支持:  上海瑞谷拜特软件技术有限公司",
    urlArgs: "v=180427",
    Assets: {
        Js: [],
        Css: [],
    },
    /**
     * 是否部署在在app中, 如果是部署在app壳子中true,如果不是部署在app壳子中false
     */
    isBiParkApp: false,
    /**
     * 苹果端React代码是否支持手势返回,及安卓和苹果页面进入动画
     */
    canTouchBack: false,
    /**
     * 是否显示项目中导航栏 true显示  false不显示
     */
    showheader: false,
    /**
     * 第三方分享的默认logo
     */
    thirdshareLogo: "http://demo.bitech.cn/IPark_Share/assets/images/ipark1.png",
    /**
     * app是否启用地图定位, 服务端设置后以服务端配置为准
     */
    openMapLocation: false,
    /**
     * 是否显示三方登录绑定功能
     */
    openThirdLogin: true,
    /**
     * 全局设置列表底部是否显示正在加载
     */
    showloading: true,
    /**
     * 底层退出跳转配置
     */
    logoutRouter: "/login",
    /**
     * 底部tab设置
     */
    tabBar: {
        items: [
            { icon: "home", title: "首页", path: "/index", type: "home" },
            { icon: "sever", title: "服务", path: "/service", type: "service" },
            { icon: "found", title: "发现", path: "/discover/0", type: "discover" },
            { icon: "my", title: "我的", path: "/my", type: "my" },
        ],
    },
});

export const server: RECO.Mobile.Config.Server = (window["server"] = {
    apiKey: {
        apiKey: "Bitech\\H5",
        secret: "vgkEeveppBwCzPHr",
    },
    redirectUrl: {
        weiboredirect_uri: "http://dev.bitech.cn/BiParkE01/",
        qqredirect_uri: "http://demo.bitech.cn/chuang1jiaII/",
    },
    userMobile: {
        aboutUsMobile: "021-23231080",
        adminPhone: "18002332204",
    },
    shareApp: {
        title: "iPark+应用",
        content: "非常好的园区智慧App",
        logo: "",
        url: "http://demo.bitech.cn/iparkappjavaalpha/",
    },
    /**
     * 登录密码加密设置
     */
    rsa: {
        enable: true,
        publicKey: `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDXu1ms9TrhrMlIn3iv4g2Pw9Mfr9abdAB-TpDD65G98wjHZxgkZfhzUHE8BSsUDzIHfOiCd4RT5fZtTiop9bzwecgYCrAICjrVC-8ZWKf1RqRX4EXiISyEBHb4YAER_Rt2TQEWGPCi14ujDTA9qr1_YRUFfh52nrc-MfkfC12BwQIDAQAB`,
    },
    auth: {
        oauth2Url: "authorization/oauth2",
        autoLogin: !0,
        autoRefreshToken: !0,
        anonymousLogin: !0,
    },
    /**
     * 附件预览域名地址-永中平台
     */
     previewUrl: "https://fat.bitechdevelop.com/dcs-preview/",
     /**
      * 是否开启附件预览配置
      */
     plugins: {
         attach: {
             onlineDoc: true,
         },
     },
    /**
     * 微信公众号配置
     */
    wechatAppid: "wx3545eb792d885a20",
    /**
     * 钉钉配置
     */
    corpId: "ding4ea0c434140e38d6ffe93478753d9884",
    /**
     * 当前app名称
     */
    appname: "iPark+",
    /**
     * 当前app部署下载地址
     */
    appdownload: "https://fat.bitechdevelop.com/reco-ipark-10-1-h5/appdown/",
    /**
     * 当前web部署线上地址
     */
    weburl: "https://fat.bitechdevelop.com/reco-ipark-10-1-website/",
    /**
     * 当前app部署线上地址
     */
    h5url: "http://demo.bitech.cn/iparkjava/",
    // /**
    //  * 项目资源文件地址
    //  */
    assetsUrl: "https://fat.bitechdevelop.com/reco-ipark-10-1-mobileapi/",
    // /**
    //  * 项目接口地址
    //  */
    url: "https://fat.bitechdevelop.com/reco-ipark-10-1-mobileapi/",



    // url: "http://192.168.30.206:8081/",  // 伍振飞本地

    // assetsUrl: "https://linux.bitechdevelop.com/ipark_test1.mobileapi/",
    // url: "https://linux.bitechdevelop.com/ipark_test1.mobileapi/"

    // h5url: "http://demo.bitech.cn/iparkjavaall/",
    // url: "https://linux.bitechdevelop.com/reco.biparkall.10.0.mobileapi.service/",
    // assetsUrl: "https://linux.bitechdevelop.com/reco.biparkall.10.0.mobileapi.service/",

    // url: "https://app.bitechdevelop.com/reco-ipark-10-0-mobileapi/",
    // assetsUrl: "https://app.bitechdevelop.com/reco-ipark-10-0-mobileapi/",

    // url: "https://fat.bitechdevelop.com/policy-demo-mobileapi/",
    // assetsUrl: "https://fat.bitechdevelop.com/policy-demo-mobileapi/",

    // url: "https://linux.bitechdevelop.com/reco.ipark.10.0.mobileapi/",
    // assetsUrl: "https://linux.bitechdevelop.com/reco.ipark.10.0.mobileapi/",

    // url: "https://ys.bitech.cn/mobileapi/",
    // assetsUrl: "https://ys.bitech.cn/mobileapi/",
});
