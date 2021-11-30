import React from "react";

import { List } from "antd-mobile";

import { template } from "@reco-m/core";
import { getHotUpdateVersion, ViewComponent, getVersion, checkNewVersion, getPhone, share, setEventWithLabel, OSVersionType } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/statistics";
import { Namespaces, aboutModel, editionTypeEnum, updateTypeEnum } from "@reco-m/system-models";

export namespace About {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, aboutModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "关于";
        namespace = Namespaces.about;

        debouncheckNewVersion = this.debounce(this.checkNewVersion.bind(this), 5000);

        checkNewVersion() {
            checkNewVersion();
        }

        debounce(func, wait) {
            let timeout;
            return function (args?) {
                if (timeout) clearTimeout(timeout);
                let callNow = !timeout;
                timeout = setTimeout(() => {
                    timeout = null;
                }, wait);
                if (callNow) {
                    func(args);
                }
            };
        }

        componentDidMount() {
            let type = getPhone();
            if (type === OSVersionType.ios) {
                type = OSVersionType.iosAfter;
            }
            this.dispatch({ type: "getNewAppVersion", data: { editionTypeId: editionTypeEnum.service, updateTypeId: updateTypeEnum.hotUpdate } });
        }

        // 分享app
        shareApp() {
            share(server.shareApp.title, server.shareApp.content, server.shareApp.logo, server.shareApp.url).then(() => {});
        }

        renderLogo(): React.ReactNode {
            const { state } = this.props,
                versionSwitch = state!.versionSwitch,
                updateVersion = getHotUpdateVersion(), // 获取app本地版热更新本号
                lastVersion = getVersion(); // 获取app本地壳子版本号
            return (
                <div className="reco-about">
                    <div className="reco-about-logo"><img src={"assets/images/login-logo.png"} alt=""/></div>
                    <div className="reco-about-version" onClick={() => this.dispatch({ type: "input", data: { versionSwitch: !versionSwitch } })}>{versionSwitch ? (lastVersion ? `版本号(K): ${lastVersion}` : `版本号(K): 0.0`) : updateVersion ? `版本号(R): ${updateVersion}` : `版本号(R): 0.0.0`}</div>
                </div>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                version = state!.version,
                updateVersion = getHotUpdateVersion(); // 获取app本地版热更新本号
            return (
                <>
                    {this.renderLogo()}
                    <List mode="card">
                        <List.Item onClick={() => this.goTo("version")}>
                            新功能介绍
                        </List.Item>
                        <List.Item onClick={() => this.shareApp()}>推荐给好友</List.Item>
                        <List.Item
                            onClick={() => {
                                this.debouncheckNewVersion();
                                setEventWithLabel(statisticsEvent.c_app_Myself_versionUpdate);
                            }}
                            extra={version && version.version === updateVersion ? "已是最新版本" : version && version.version > updateVersion ? "有新版本更新" : "已是最新版本"}
                        >
                            版本更新
                        </List.Item>
                    </List>
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.about]);
}
