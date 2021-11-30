import "./reco.config";

// 通用图标库
import "./assets/fonts/two/iconfont.css";

// 新版图标库
import "./assets/fonts/iconfont.css";
import "./assets/fonts/app_new/iconfont.css";
import "./assets/fonts/app_new_color/iconfont.js";

// 老版图标库
// import "./assets/fonts/iconfont.default.css";

import "./assets/css/vendor.less";
import "./assets/css/index.less";

/** 主题样式 */
import "./assets/css/themes/white/index.less";

import "../src/assets/fonts/two/iconfont.js";

import $ from "jquery";

import "ion-rangeslider/js/ion.rangeSlider.min";
import "ion-rangeslider/css/ion.rangeSlider.min.css";

window["$"] = $;

function remove<T>(this: T[], v: T, deleteCount?: number): number | void;
function remove<T>(this: T[], v: T, deleteCount?: number, ...items: T[]): number | void {
    (<any[]>items).unshift(deleteCount || 1);

    for (let i = 0, l = this.length; i < l; i++) {
        if (this[i] === v) {
            (<any[]>items).unshift(i), this.splice.apply(this, items);
            return i;
        }
    }
}

Array.prototype.remove = remove;

function removeGrep<T, TResult = never>(this: T[], func: (v: T, index: number, array: T[]) => TResult, inv: TResult): T | void {
    for (let i = 0, l = this.length, v; i < l; i++) {
        if (func((v = this[i]), i, this) === inv) {
            this.splice(i, 1);
            return v;
        }
    }
}

Array.prototype.removeGrep = removeGrep;

function removeGrepAll<T, TResult = never>(this: T[], func: (v: T, index: number, array: T[]) => TResult, inv: TResult): T[] {
    const buff: T[] = [];

    for (let i = 0, l = this.length; i < l; i++) {
        if (func(this[i], i, this) === inv) {
            this.splice(i, 1);
        }
    }

    return buff;
}

Array.prototype.removeGrepAll = removeGrepAll;

export function dateDiff(this: Date, interval: "y" | "m" | "d" | "w" | "h" | "n" | "s" | "l", date: Date): number | void {
    const long = this.getTime() - date.getTime();
    // tslint:disable-next-line:switch-default
    switch (interval.toLowerCase()) {
        case "y":
            return this.getFullYear() - date.getFullYear();
        case "m":
            return (this.getFullYear() - date.getFullYear()) * 12 + (this.getMonth() - date.getMonth());
        case "d":
            return +(long / 1000 / 60 / 60 / 24).toFixed(0);
        case "w":
            return +(long / 1000 / 60 / 60 / 24 / 7).toFixed(0);
        case "h":
            return +(long / 1000 / 60 / 60).toFixed(0);
        case "n":
            return +(long / 1000 / 60).toFixed(0);
        case "s":
            return +(long / 1000).toFixed(0);
        case "l":
            return long;
    }
}

Date.prototype.dateDiff = dateDiff;

export function dateDiffDecimals(this: Date, interval: "y" | "m" | "d" | "w" | "h" | "n" | "s" | "l", date: Date): number | void {
    const long = this.getTime() - date.getTime();
    // tslint:disable-next-line:switch-default
    switch (interval.toLowerCase()) {
        case "y":
            return this.getFullYear() - date.getFullYear();
        case "m":
            return (this.getFullYear() - date.getFullYear()) * 12 + (this.getMonth() - date.getMonth());
        case "d":
            return +(long / 1000 / 60 / 60 / 24);
        case "w":
            return +(long / 1000 / 60 / 60 / 24 / 7);
        case "h":
            return +(long / 1000 / 60 / 60);
        case "n":
            return +(long / 1000 / 60);
        case "s":
            return +(long / 1000);
        case "l":
            return long;
    }
}

Date.prototype.dateDiffDecimals = dateDiffDecimals;

export function dateAdd(this: Date, interval: "s" | "n" | "h" | "d" | "w" | "q" | "m" | "y", number: number): Date {
    // tslint:disable-next-line:switch-default
    switch (interval.toLowerCase()) {
        case "s":
            return new Date(Date.parse(this + "") + 1000 * number);
        case "n":
            return new Date(Date.parse(this + "") + 60000 * number);
        case "h":
            return new Date(Date.parse(this + "") + 3600000 * number);
        case "d":
            return new Date(Date.parse(this + "") + 86400000 * number);
        case "w":
            return new Date(Date.parse(this + "") + 86400000 * 7 * number);
        case "q":
            return new Date(this.getFullYear(), this.getMonth() + number * 3, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds());
        case "m":
            return new Date(this.getFullYear(), this.getMonth() + number, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds());
        case "y":
            return new Date(this.getFullYear() + number, this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds());
    }

    return this;
}

Date.prototype.dateAdd = dateAdd;

export function format(this: Date, fmt: string): string {
    const o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        S: this.getMilliseconds(), // 毫秒
    };

    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

    for (const k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));

    return fmt;
}

Date.prototype.format = format;

function add(a: number, b: number): number {
    const e = Math.pow(10, Math.max(fn(b), fn(a)));

    return div(mul(a, e) + mul(b, e), e);
}

Number.prototype.add = function (this: number, v: number): number {
    return add(this, v);
};

function sub(a: number, b: number): number {
    const e = Math.pow(10, Math.max(fn(b), fn(a)));

    return div(mul(a, e) - mul(b, e), e);
}

Number.prototype.sub = function (this: number, v: number): number {
    return sub(this, v);
};

function mul(a: number, b: number): number {
    const e = a ? a.toString() : "0",
        f = b ? b.toString() : "0";

    return (Number(e.replace(".", "")) * Number(f.replace(".", ""))) / Math.pow(10, fn(f) + fn(e));
}

Number.prototype.mul = function (this: number, v: number): number {
    return mul(this, v);
};

function div(a: number, b: number): number {
    const e = a ? a.toString() : "0",
        f = b ? b.toString() : "0";

    return mul(Number(e.replace(".", "")) / Number(f.replace(".", "")), Math.pow(10, fn(f) - fn(e)));
}

Number.prototype.div = function (this: number, v: number): number {
    return div(this, v);
};

function fn(a: any) {
    return ((a && /\d+(?:\.(\d+))?/.exec(a)![1]) || "").length;
}

Array.prototype.add = function (this: any[], ...items: any[]) {
    return this.push.apply(this, items);
};

Array.prototype.clear = function (this: any[]) {
    this.length = 0;
};

Array.prototype.first = function (this: any[]) {
    return this[0];
};

Array.prototype.last = function (this: any[]) {
    return this.length > 0 && this[this.length - 1];
};

Array.prototype.contains = function (this: any[], item: any) {
    return this.indexOf(item) >= 0;
};

function htmlInjectEncode(this: string, tagExp: RegExp = /<\/?(iframe|script|link|style|frameset|frame)\b[^>]*?>/gi) {
    return this.replace(tagExp, (d) => `&lt;${d.substr(1, d.length - 2)}&gt;`);
}

String.prototype.htmlInjectEncode = htmlInjectEncode;

function htmlInjectDecode(this: string, tagExp: RegExp = /&lt;\/?(iframe|script|link|style|frameset|frame)\b.*?&gt;/gi) {
    return this.replace(tagExp, (d) => `<${d.substr(4, d.length - 8)}>`);
}

String.prototype.htmlInjectDecode = htmlInjectDecode;

if (typeof Object.assign !== "function") {
    Object.defineProperty(Object, "assign", {
        value: function assign(target) {
            if (target == null) {
                throw new TypeError("Cannot convert undefined or null to object");
            }
            const to = Object(target);
            for (let index = 1; index < arguments.length; index++) {
                const nextSource = arguments[index];

                if (nextSource != null) {
                    for (const nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true,
    });
}

if (typeof String.prototype.includes !== "function") {
    String.prototype.includes = function (this: string, search: string) {
        return this.indexOf(search) >= 0;
    };
}

if (typeof Promise.prototype.finally !== "function") {
    Promise.prototype.finally = function (this: Promise<any>, onfinally?: (() => void) | undefined | null): Promise<any> {
        return this.then(
            (e) => (onfinally && onfinally(), e),
            (e) => (onfinally && onfinally(), e)
        );
    };
}

