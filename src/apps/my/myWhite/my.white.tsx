import React from "react";

import { List, NavBar, Flex } from "antd-mobile-v2";
import QueueAnim from "rc-queue-anim";

import { template } from "@reco-m/core";

import { MyHeaderWhite } from "./my.header.white";

import { MyCertifyCard } from "@reco-m/member-common";
import { CertifyEnum } from "@reco-m/ipark-common";

import { MyRoleFuncPage } from "./my.role.func";
import { MyNotificationCountWhite } from "@reco-m/notice-notice";
import { Namespaces } from "@reco-m/my-models";
import { CertifyStatusEnum } from "@reco-m/member-models";
import { My as oldMy } from "@reco-m/my";

export namespace MyWhite {
    export interface IProps extends oldMy.IProps {}

    export interface IState extends oldMy.IState {}

    Namespaces["myCertify"] = "myCertify";

    export class Component<P extends IProps = IProps, S extends IState = IState> extends oldMy.Component<P, S> {
        showloading = false;
        namespace = Namespaces["myCertify"];

        componentDidMount() {
            if (this.isAuth()) {
                this.dispatch({ type: `initPage` });
            }
        }

        componentWillUnmount() {
            this.setState = () => false;
        }

        componentReceiveProps(nextProps: Readonly<P>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && nextProps.location!.pathname === "/my") {
                if (this.isAuth()) {
                    this.dispatch({ type: "initPage" });
                }
            }
        }

        renderAvatarExtra(): React.ReactNode {
            return null;
        }

        isVisitorCertify(permission: any) {
            for (let i = 0; i < permission.length; i++) {
                if (permission[i].id === CertifyEnum.businessAdmin || permission[i].id === CertifyEnum.admin) {
                    return true;
                }
            }
            return false;
        }

        isAdminCertify(permission: any) {
            for (let i = 0; i < permission.length; i++) {
                if (permission[i].id === CertifyEnum.admin) {
                    return true;
                }
            }
            return false;
        }

        renderHeader(): React.ReactNode {
            return (
                <NavBar
                    rightContent={
                        <>
                            <span>{this.isAuth() && this.renderEmbeddedView(MyNotificationCountWhite.Page as any, {})}</span>
                            <i onClick={() => this.goTo(`setting`)} className="icon icon-newset" />
                        </>
                    }
                >
                    我的
                </NavBar>
            );
        }

        refScroll(el) {
            $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $("#nav_box_Shadow").length <= 0 && $(this).parents(".container-page").find(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $("#nav_box_Shadow").css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
            });
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                currentMember = state!.member;
            return (
                <>
                    {this.renderEmbeddedView(MyHeaderWhite.Page as any, {
                        avatarExtra: this.renderAvatarExtra(),
                    })}
                    {this.isAuth() && this.renderEmbeddedView(MyCertifyCard.Page as any, {})}
                    {this.isAuth() && this.renderEmbeddedView(MyRoleFuncPage.Page as any, {})}

                    <div className="my-shadow mb5">
                        <List>
                            {currentMember && currentMember.status === CertifyStatusEnum.allow && (
                                <QueueAnim delay={200}>
                                    <List.Item
                                        arrow="horizontal"
                                        onClick={() => {
                                            if (!this.isAuth()) {
                                                this.goTo("login");
                                                return;
                                            }
                                            // if(currentMember && currentMember.status === CertifyStatusEnum.allow) {
                                            //     this.goTo("policyservicemy")
                                            // } else if (!currentMember || !currentMember.id ||  currentMember.status === CertifyStatusEnum.nocertify) {
                                            //     this.goTo("certify")
                                            // } else {
                                            //     this.goTo(`certifyDetail/${currentMember.id}`)
                                            // }
                                            this.goTo("policyservicemy");
                                        }}
                                    >
                                        <Flex align={"center"}>
                                            <svg className="iconew margin-right-xs" aria-hidden="true">
                                                <use xlinkHref="#icon-mylist4"></use>
                                            </svg>
                                            政策申报
                                        </Flex>
                                    </List.Item>
                                </QueueAnim>
                            )}
                            <QueueAnim delay={200}>
                                <List.Item arrow="horizontal" onClick={() => (!this.isAuth() ? this.goTo("login") : this.goTo("policyserviceorder"))}>
                                    <Flex align={"center"}>
                                        <svg className="iconew margin-right-xs" aria-hidden="true">
                                            <use xlinkHref="#icon-newsel"></use>
                                        </svg>
                                        政策订阅
                                    </Flex>
                                </List.Item>
                            </QueueAnim>
                            <QueueAnim delay={200}>
                                <List.Item arrow="horizontal" onClick={() => (!this.isAuth() ? this.goTo("login") : this.goTo("myActivity"))}>
                                    <Flex align={"center"}>
                                        <svg className="iconew margin-right-xs" aria-hidden="true">
                                            <use xlinkHref="#icon-mylist1"></use>
                                        </svg>
                                        我的活动
                                    </Flex>
                                </List.Item>
                            </QueueAnim>
                            <QueueAnim delay={200}>
                                <List.Item arrow="horizontal" onClick={() => (!this.isAuth() ? this.goTo("login") : this.goTo("survey/1"))}>
                                    <Flex align={"center"}>
                                        <svg className="iconew margin-right-xs" aria-hidden="true">
                                            <use xlinkHref="#icon-mylist2"></use>
                                        </svg>
                                        问卷调查
                                    </Flex>
                                </List.Item>
                            </QueueAnim>
                            <QueueAnim delay={200}>
                                <List.Item arrow="horizontal" onClick={() => (!this.isAuth() ? this.goTo("login") : this.goTo("favorites"))}>
                                    <Flex align={"center"}>
                                        <svg className="iconew margin-right-xs" aria-hidden="true">
                                            <use xlinkHref="#icon-mylist3"></use>
                                        </svg>
                                        我的收藏
                                    </Flex>
                                </List.Item>
                            </QueueAnim>
                        </List>
                    </div>
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces["myCertify"]]);
}
