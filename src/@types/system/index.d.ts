declare namespace RECO.Mobile {
    namespace Config {
        /**
         * 客户端配置
         *
         * @interface Client
         */
        interface Client {
            title: string;
            /**
             *  资源加载参数
             *
             * @type {string}
             * @memberof Client
             */
            urlArgs?: string;

            /**
             * 资源配置
             *
             * @type {client.Config.Assets}
             * @memberof Client
             */
            Assets?: Client.Assets;

            tabBar?: Client.TabBar.Config;
            isIpark?: boolean;
            theme?: string;
            showheader: boolean;
            openMapLocation: boolean;
            openThirdLogin: boolean;
            showloading: boolean;
            canTouchBack: boolean;

            isBiParkApp?: boolean;
            thirdshareLogo?: string;
            mapKey?: string;
        }

        namespace Client {
            /**
             *  客户端资源配置
             *
             * @interface assets
             */
            interface Assets {
                Js?: (string | string[])[];

                Css?: (string | string[])[];
            }

            namespace TabBar {
                interface Config {
                    items: Item[];

                    isActive?: isActive;
                }

                type isActive = (type: string, item: Item) => boolean;

                interface Item {
                    icon: object | string;

                    selectedIcon?: object | string;

                    title: string;

                    key?: string;

                    type: string | number;
                }
            }
        }

        /**
         * 服务端配置
         *
         * @interface Server
         */
        interface Server {
            /**
             * Api Key
             *
             * @memberof Server
             */
            apiKey?: Server.ApiKey;

            /**
             * 认证配置信息
             *
             * @type {Server.Auth}
             * @memberof Server
             */
            auth?: Server.Auth;

            /**
             * 接口版本
             *
             * @type {(number | string)}
             * @memberof Server
             */
            apiVersion?: number | string;

            /**
             * 服务端访问地址
             *
             * @type {string}
             * @memberof Server
             */
            url?: string;
            /**
             * 联系方式
             *
             */
            userMobile?: any;
            /**
             * 使用位置信息及地图服务
             *
             */
            useLocation?: any;
            /**
             * APP分享信息
             *
             */
            shareApp?: any;

            imgURL?: any;

            assetsUrl?: any;

            previewUrl?: any;

            /**
             * redirectUrl
             *
             * @memberof Server
             */
            redirectUrl?: Server.IParkPlus.redirectUrl;

            wechatAppid?: string;
            corpId?: string;
            h5url?: string;
            rsa?: any;
        }

        namespace Server {
            namespace IParkPlus {
                /**
                 * redirectUrl
                 *
                 * @interface redirectUrl
                 */
                interface redirectUrl {
                    /**
                     * weibo重定向
                     *
                     * @type {string}
                     * @memberof Server
                     */
                    weiboredirect_uri?: string;
                    /**
                     * qq重定向
                     *
                     * @type {string}
                     * @memberof Server
                     */
                    qqredirect_uri?: string;
                }
            }
            /**
             * Api Key
             *
             * @interface ApiKey
             */
            interface ApiKey {
                /**
                 * Api Key
                 *
                 * @type {string}
                 * @memberof Server
                 */
                apiKey: string;

                /**
                 * api Secret
                 *
                 * @type {string}
                 * @memberof Server
                 */
                secret: string;
            }

            /**
             * 认证配置
             *
             * @interface Auth
             */
            interface Auth {
                /**
                 * 认证控制器路径
                 *
                 * @type {string}
                 * @memberof Auth
                 */
                oauth2Url: string;
                /**
                 * 是否启用自动登录
                 *
                 * @type {boolean}
                 * @memberof Auth
                 */
                autoLogin: boolean;
                /**
                 * 是否启用自动刷新 Token
                 *
                 * @type {boolean}
                 * @memberof Auth
                 */
                autoRefreshToken: boolean;
                /**
                 * 是否启用匿名登录
                 *
                 * @type {boolean}
                 * @memberof Auth
                 */
                anonymousLogin: boolean;
            }
        }
    }

    namespace Webkit {
        interface Config {
            messageHandlers: MessageHandlers;
        }

        interface MessageHandlers {
            [key: string]: PostMessage;
        }

        interface PostMessage {
            postMessage<T>(data?: T): void;
        }
    }

    namespace WebViewJavascriptBridge {
        interface Config {
            callHandler<T>(func: string, data?: T): void;
        }
    }

    interface Pagination {
        CurrentPage: number;
        Items: any[];
        ItemsPerPage: number;
        TotalItems: number;
        TotalPages: number;
    }

    namespace ListView {
        class DataSources {
            constructor(params: DataSource.Params);

            cloneWithRows<T>(dataBlob: T[], rowIdentities?): this;

            cloneWithRowsAndSections<T>(dataBlob: T[], sectionIdentities?, rowIdentities?): this;

            getRowCount(): number;

            getRowAndSectionCount(): number;

            rowShouldUpdate(sectionIndex, rowIndex);

            getRowData(sectionIndex, rowIndex);

            getRowIDForFlatIndex(index);

            getSectionIDForFlatIndex(index);

            getSectionLengths(): number[];

            sectionHeaderShouldUpdate(sectionIndex);

            getSectionHeaderData(sectionIndex);
        }

        namespace DataSource {
            interface Params {
                rowHasChanged?(prevRowData, nextRowData): boolean;

                getRowData?(dataBlob, sectionID, rowID);

                getSectionHeaderData?(dataBlob, sectionID);

                sectionHeaderHasChanged?(prevSectionData, nextSectionData);
            }
        }
    }

    namespace Validation {
        interface AbstractControl {
            value: any;
            readonly name: string;
            errors?: any;
        }

        type ValidationErrors = {
            [key: string]: any;
        };

        interface ValidatorFn {
            (control: AbstractControl): ValidationErrors | null;
        }
    }

    namespace Statistics {
        interface MtaLinkH5 {
            eventStats(eventid, param);

            pageBasicStats(pageName);

            setLoginUin();

            versionControl();
        }
    }
}

// 客户端配置
declare const client: RECO.Mobile.Config.Client;

// 服务端配置
declare const server: RECO.Mobile.Config.Server;

// webkit
declare const webkit: RECO.Mobile.Webkit.Config;

// MtaLinkH5
declare const MtaLinkH5: RECO.Mobile.Statistics.MtaLinkH5;

// WebViewJavascriptBridge
declare const WebViewJavascriptBridge: RECO.Mobile.WebViewJavascriptBridge.Config;

declare const __webpack_require__: any;

declare function getIosVersion(version: string): void;

declare function setHeight(height: number | string): void;

declare function thirdAuthLogin(type: string, openId: string, token: string, params: string, isLogin: string | number | boolean): void;

declare class Aliplayer {
    constructor(params?: any, play?: (play: any) => void);
}

// 数组拓展
interface Array<T> {
    remove(v: T, deleteCount?: number): number | void;

    removeGrep<TResult = never>(fn: (v: T, index: number, array: this) => TResult, inv: TResult): T | void;

    removeGrepAll<TResult = never>(fn: (v: T, index: number, array: this) => TResult, inv: TResult): T[];

    groupBy(field: string): { key: string; value: T[] }[];

    treeSort(tmpl: string, rootLayer?: number, useVirtualRoot?: boolean): T[];

    treeChild(parentNode?: T): T[];

    add(...items: T[]): number;

    clear(): void;

    first(): T;

    last(): T;

    contains(item: T): boolean;
}

// 日期拓展
interface Date {
    dateDiff(interval: "y" | "m" | "d" | "w" | "h" | "n" | "s" | "l", date: Date): number | void;

    dateDiffDecimals(interval: "y" | "m" | "d" | "w" | "h" | "n" | "s" | "l", date: Date): number | void;

    dateAdd(interval: "s" | "n" | "h" | "d" | "w" | "q" | "m" | "y", number: number): Date;

    format(fmt: string): string;
}

// 数字拓展
interface Number {
    /**
     * 加
     *
     * @param {number} v 加数
     * @returns {number} 运算结果
     *
     * @memberOf Number
     */
    add(v: number): number;

    /**
     * 减
     *
     * @param {number} v 减数
     * @returns {number} 运算结果
     *
     * @memberOf Number
     */
    sub(v: number): number;

    /**
     * 乘
     *
     * @param {number} v 乘数
     * @returns {number} 运算结果
     *
     * @memberOf Number
     */
    mul(v: number): number;

    /**
     * 除
     *
     * @param {number} v 除数
     * @returns {number} 运算结果
     *
     * @memberOf Number
     */
    div(v: number): number;
}

// 字符串拓展
interface String {
    htmlInjectDecode(tagExp?: RegExp): string;

    htmlInjectEncode(tagExp?: RegExp): string;
}

declare const AMap: any;
declare const AMapUI: any;
declare const Loca: any;
