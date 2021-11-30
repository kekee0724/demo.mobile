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
    isBiParkApp: true,
    /**
     * 苹果端React代码是否支持手势返回,及安卓和苹果页面进入动画
     */
    canTouchBack: true,
    /**
     * 是否显示项目中导航栏 true显示  false不显示
     */
    showheader: true,
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
            { icon: "mobile mobile-ipark", title: "首页", key: "/index", type: "home" },
            { icon: "mobile mobile-service", title: "服务", key: "/service", type: "service" },
            { icon: "mobile mobile-discover", title: "发现", key: "/discover/0", type: "discover" },
            { icon: "mobile mobile-my", title: "我的", key: "/my", type: "my" },
        ],
    },
    mapKey: "32a27fb58b64adbf3846556e180e5134",
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
        enable: false,
        publicKey: `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDXu1ms9TrhrMlIn3iv4g2Pw9Mfr9abdAB-TpDD65G98wjHZxgkZfhzUHE8BSsUDzIHfOiCd4RT5fZtTiop9bzwecgYCrAICjrVC-8ZWKf1RqRX4EXiISyEBHb4YAER_Rt2TQEWGPCi14ujDTA9qr1_YRUFfh52nrc-MfkfC12BwQIDAQAB`,
    },
    auth: {
        oauth2Url: "authorization/oauth2",
        autoLogin: !0,
        autoRefreshToken: !0,
        anonymousLogin: !0,
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
     * 当前app部署下载地址
     */
    appdownload: "http://demo.bitech.cn/iparkappjavaalpha/",
    /**
     * 当前app部署线上地址
     */
    h5url: "http://demo.bitech.cn/iparkjava/",
    /**
     * 附件预览域名地址-永中平台
     */
    previewUrl: "https://preview.bitech.cn/",
    /**
     * 项目资源文件地址
     */
    assetsUrl: "https://fat.bitechdevelop.com/reco-oa-10-1-mobileapi/",
    /**
     * 项目接口地址
     */
    url: "https://fat.bitechdevelop.com/reco-oa-10-1-mobileapi/", // 正在使用win
    // url: "http://192.168.30.150:8081/",  // 伍振飞本地

    // assetsUrl: "https://linux.bitechdevelop.com/ipark_test1.mobileapi/",
    // url: "https://linux.bitechdevelop.com/ipark_test1.mobileapi/"

    // url: "http://linux.bitechdevelop.com/reco.biparkall.10.0.mobileapi.service/", // 正在使用win
    // assetsUrl: "http://linux.bitechdevelop.com/reco.biparkall.10.0.mobileapi.service/",

    // g6
    // url: "https://linux.bitechdevelop.com/reco.g6.10.0.mobileapi/", // 正在使用win
    // assetsUrl: "https://linux.bitechdevelop.com/reco.g6.10.0.mobileapi/",
});
