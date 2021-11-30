import {browser} from "@reco-m/core"
export function replaceBr(centent) {
    return centent?.replace(/\n/g, "<br />") || ""
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