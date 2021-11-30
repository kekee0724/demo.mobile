import React, { ReactNode } from "react";

import { List, Flex, WhiteSpace } from "antd-mobile-v2";

import { template, transformImageUrl, isAnonymous } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { MyIntergralCountWhite } from "@reco-m/member-common";
import { myCertifyModel, Namespaces } from "@reco-m/member-models";
export namespace MyHeaderWhite {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        avatarExtra?: ReactNode | React.ReactNode;
        noticeExtra?: ReactNode | React.ReactNode;
    }

    export interface IState extends ViewComponent.IState, myCertifyModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.myCertify;

        renderAvatarExtra(): React.ReactNode {
            return this.props.avatarExtra as any;
        }

        renderAvatar(): React.ReactNode {
            const { state } = this.props,
                thumb = state!.thumb,
                currentUser = state!.currentUser ? state!.currentUser : {},
                userid = currentUser!.id;
            return (
                <div
                    className="user-img"
                    style={{
                        backgroundImage: (this.isAuth() && thumb && `url(${transformImageUrl(thumb.filePath, 64, 64)})`) || "url(assets/images/myBackgroundview1.png)",
                    }}
                    onClick={() => this.checkGoTo(userid)}
                >
                    {this.renderAvatarExtra()}
                </div>
            );
        }

        checkGoTo(userid) {
            if (isAnonymous()) {
                this.goTo("login");
            } else {
                this.goTo(`home/${userid}`);
                setEventWithLabel(statisticsEvent.personalInformationEditing);
            }
        }

        renderNickName(): React.ReactNode {
            const { state } = this.props,
                currentUser = state!.currentUser ? state!.currentUser : {},
                userid = currentUser!.id,
                nickName = currentUser!.nickName;
            return <div onClick={() => this.checkGoTo(userid)}>{isAnonymous() ? "请点击登录" : nickName ? nickName : "未设置昵称"}</div>;
        }

        renderIntergralCount(): React.ReactNode {
            return this.renderEmbeddedView(MyIntergralCountWhite.Page as any, {});
        }

        render(): React.ReactNode {
            return (
                <div className="new-user-bg">
                    <List className="my-user new-user">
                        <List.Item wrap align="top" thumb={this.renderAvatar()} multipleLine>
                            <Flex>
                                <span className="size-18 omit omit-2">{this.renderNickName()}</span>
                                <div className="size-12 gray-three-color identity-tag"></div>
                            </Flex>
                            {this.renderIntergralCount()}
                        </List.Item>
                        <Flex className="my-nav mt12" wrap="wrap">
                            <Flex.Item onClick={() => (!this.isAuth() ? this.goTo("login") : this.goTo(`order/0`))}>
                                <>
                                    <svg className="iconew size-24" aria-hidden="true">
                                        <use xlinkHref="#icon-myicon3"></use>
                                    </svg>
                                    <WhiteSpace size="sm" />
                                    <div>订单</div>
                                </>
                            </Flex.Item>
                            <Flex.Item
                                onClick={() => {
                                    !this.isAuth() ? this.goTo("login") : this.goTo("apply/0/0");
                                }}
                            >
                                <>
                                    <svg className="iconew size-24" aria-hidden="true">
                                        <use xlinkHref="#icon-myicon4"></use>
                                    </svg>
                                    <WhiteSpace size="sm" />
                                    <div>申请</div>
                                </>
                            </Flex.Item>
                            <Flex.Item
                                onClick={() => {
                                    !this.isAuth() ? this.goTo("login") : this.goTo("invoice");
                                }}
                            >
                                <svg className="iconew size-24" aria-hidden="true">
                                    <use xlinkHref="#icon-shengqing"></use>
                                </svg>
                                <WhiteSpace size="sm" />
                                <div>发票</div>
                            </Flex.Item>
                            <Flex.Item
                                onClick={() => {
                                    !this.isAuth() ? this.goTo("login") : this.goTo("mine");
                                }}
                            >
                                <svg className="iconew size-24" aria-hidden="true">
                                    <use xlinkHref="#icon-youhuijuan"></use>
                                </svg>
                                <WhiteSpace size="sm" />
                                <div>优惠券</div>
                            </Flex.Item>
                        </Flex>
                    </List>
                </div>
            );
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.myCertify]);
}
