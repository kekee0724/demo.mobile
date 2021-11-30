import { template, browser, setLocalStorage } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { IParkBindTableNameEnum, getQueryString } from "@reco-m/ipark-common";

import { MsgReachReachCanalEnum, msgreachModel, Namespaces } from "@reco-m/msgreach-models";

import { MsgReachViewLimitEnum } from "@reco-m/msgreach-models";

import { msgDingTalkConfigShare } from "@reco-m/msgreach-common";

const ddkit = window["dd"];
export namespace MsgReach {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, msgreachModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.msgreach;
        showloading = false;
        /**
         * 跳转的路由
         */
        path;
        /**
         * 推送Id
         */
        pushSubjectId;
        /**
         * 推送对象日志Id
         */
        objectLogId;
        /**
         * 自定义渠道Id
         */
        channelId;
        /**
         * 推送记录Id
         */
        recordId;
        /**
         * 推送渠道
         */
        reachCanal;
        /**
         * 触达记录Id
         */
        objectId;
        /**
         * 绑定表Id
         */
        bindTableId;
        /**
         * 绑定表名
         */
        bindTableName;
        /**
         * 插入链接内容
         */
        addLinkContent = "[[LinkUrl]]";

        /**
         * 是否从app消息中跳入
         */
        noticelist;

        componentDidMount() {
            this.getMsg();
        }

        /**
         * 跳转路由，全局拦截跳转
         * @param path
         */
        goToPageUrl(path) {
            if (this.noticelist) {
                this.reachCanal = MsgReachReachCanalEnum.notice;
                this.reachCanal && setLocalStorage("reachCanal", this.reachCanal);
                // 从app消息列表跳入直接进入下级路由
                path && this.props.history && this.props.history.replace(`/${this.noticelist}/${path}` as any);
            } else {
                path && this.props.history && this.props.history.replace(`/msgreach/${path}` as any);
            }
        }

        /**
         * 获取推送信息
         */
        getMsg() {
            // 获取微信分享路由
            let wechatshareurl = this.getSearchParam("wechatshareurl") || getQueryString("wechatshareurl");
            if (wechatshareurl) {
                location.href = wechatshareurl;
                return;
            }

            // 关闭翻页动画
            browser.versions.ios = false;

            this.handleLocalStorage();

            this.getMsgAction();
        }

        /**
         * 获取url参数并存储
         */
        handleLocalStorage() {
            this.handleReachCanal();

            this.noticelist = this.getSearchParam("noticelist") || getQueryString("noticelist");
            this.recordId = this.getSearchParam("recordId") || getQueryString("recordId");
            this.pushSubjectId = this.getSearchParam("pushSubjectId") || getQueryString("pushSubjectId");
            this.channelId = this.getSearchParam("channelId") || getQueryString("channelId");
            this.bindTableId = this.getSearchParam("bindTableId") || getQueryString("bindTableId");
            this.bindTableName = this.getSearchParam("bindTableName") || getQueryString("bindTableName");
            this.objectLogId = this.getSearchParam("objectLogId") || getQueryString("objectLogId");
            this.objectId = this.getSearchParam("objectId") || getQueryString("objectId");
            this.reachCanal = this.reachCanal || this.getSearchParam("reachCanal") || getQueryString("reachCanal");

            if (!this.reachCanal) {
                this.reachCanal = MsgReachReachCanalEnum.h5Link;
            }

            this.objectLogId && setLocalStorage("objectLogId", this.objectLogId);
            this.channelId && setLocalStorage("channelId", this.channelId);
            this.recordId && setLocalStorage("recordId", this.recordId);
            this.pushSubjectId && setLocalStorage("pushSubjectId", this.pushSubjectId);
            this.bindTableId && setLocalStorage("bindTableId", this.bindTableId);
            this.bindTableName && setLocalStorage("bindTableName", this.bindTableName);
            this.reachCanal && setLocalStorage("reachCanal", this.reachCanal);
            this.objectId && setLocalStorage("objectId", this.objectId);
        }

        /**
         * 处理推送方式
         */
        handleReachCanal() {
            if (ddkit && ddkit.env.platform !== "notInDingTalk") {
                this.reachCanal = MsgReachReachCanalEnum.dingTalk;
            } else if (browser.versions.weChat) {
                this.reachCanal = MsgReachReachCanalEnum.wechatMP;
            } else if (this.getSearchParam("isFromApp")) {
                this.reachCanal = MsgReachReachCanalEnum.app;
            }
        }

        /**
         * 获取消息方法
         */
        getMsgAction() {
            this.dispatch({
                type: "getReadMsg",
                data: {
                    objectLogId: this.objectLogId,
                    channelId: this.channelId,
                    recordId: this.recordId,
                    pushSubjectId: this.pushSubjectId,
                    bindTableId: this.bindTableId,
                    bindTableName: this.bindTableName,
                },
                callback: (d, imageUrl) => {
                    this.getMsgActionCallBack(d, imageUrl);
                },
            });
        }

        /**
         * 获取消息方法回调
         * @param d
         * @param imageUrl
         */
        getMsgActionCallBack(d, imageUrl) {
            this.setMsgDetailShareInfoLocalStorage(d, imageUrl);
            this.setDingTalkConfigShare();
            this.redirectByBindTableName(d);
        }

        /**
         * 设置分享数据，放入缓存
         * @param d
         * @param imageUrl
         */
        setMsgDetailShareInfoLocalStorage(d, imageUrl) {
            let content = d.shareContent || d.content;
            let addLinkContent = this.addLinkContent;
            if (content && content.indexOf(this.addLinkContent) > -1) {
                const specialChar = ["[", "]"];
                // 处理特殊字符串
                specialChar.forEach((x) => {
                    addLinkContent = addLinkContent.replace(new RegExp("\\" + x, "g"), "\\" + x);
                });
                const reg = new RegExp(addLinkContent, "g");

                content = content.replace(reg, "");
            }

            setLocalStorage("shareTitle", d.shareTitle || d.bindTableValue);
            setLocalStorage("shareImage", imageUrl || "");
            setLocalStorage("shareContent", content);
            setLocalStorage("shareLink", location.href);
        }

        /**
         * 设置钉钉分享
         * @param d
         * @param imageUrl
         */
        setDingTalkConfigShare() {
            if (ddkit && !(ddkit.env.platform === "notInDingTalk")) {
                ddkit.biz.navigation.setRight({
                    show: true, // 控制按钮显示， true 显示， false 隐藏， 默认true
                    control: true, // 是否控制点击事件，true 控制，false 不控制， 默认false
                    text: "", // 控制显示文本，空字符串表示显示默认文本
                    onSuccess: function () {
                        msgDingTalkConfigShare();
                    },
                });
            }
        }

        /**
         * 跳转页面到对应地址
         * @param d
         */
        redirectByBindTableName(d) {

            let viewRange = (d && d.viewRange) || MsgReachViewLimitEnum.none;

            setLocalStorage("viewRange", viewRange);
            if (d.bindTableName === IParkBindTableNameEnum.article || d.bindTableName === IParkBindTableNameEnum.articleInformation) {
                setLocalStorage("path", `articleDetail/${d.bindTableId}?viewRange=${viewRange}`);
                this.goToPageUrl(`articleDetail/${d.bindTableId}?viewRange=${viewRange}`);
            } else if (d.bindTableName === IParkBindTableNameEnum.activity) {
                setLocalStorage("path", `activityDetail/${d.bindTableId}?viewRange=${viewRange}`);
                this.goToPageUrl(`activityDetail/${d.bindTableId}?viewRange=${viewRange}`);
            } else if (d.bindTableName === IParkBindTableNameEnum.policy) {
                setLocalStorage("path", `policydetail/${d.bindTableId}?viewRange=${viewRange}`);
                this.goToPageUrl(`policyserviceoriginaldetails/${d.bindTableId}?viewRange=${viewRange}`);
            } else if (d.bindTableName === IParkBindTableNameEnum.policyService) {
                setLocalStorage("path", `policydetail/${d.bindTableId}?viewRange=${viewRange}`);
                this.goToPageUrl(`policyservicedetails/${d.bindTableId}?viewRange=${viewRange}`);
            } else if (d.bindTableName === IParkBindTableNameEnum.questionnaire) {
                setLocalStorage("path", `anonymityform/${d.bindTableId}?viewRange=${viewRange}`);
                this.goToPageUrl(`anonymityform/${d.bindTableId}?viewRange=${viewRange}`);
            } else {
                this.goToPageUrl("error");
            }
        }

        render(): React.ReactNode {
            return null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.msgreach]);
}
