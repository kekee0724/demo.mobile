import React from "react";

import { List, Flex, Button, Modal, ActionSheet, Toast, WhiteSpace, InputItem } from "antd-mobile-v2";

import { template, formatDateTime } from "@reco-m/core";
import { ViewComponent, ImageAuto, setEventWithLabel, popstateHandler } from "@reco-m/core-ui";

import { Namespaces, MemberTypeEnum, staffmanagerDetailModel } from "@reco-m/member-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace StaffmanagerDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, staffmanagerDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "员工管理";
        namespace = Namespaces.staffmanagerDetail;
        componentWillUnmount() {
            this.dispatch({ type: "input", data: { staffmanagerDetail: null } });
        }
        componentDidMount() {
            const { id } = this.props.match!.params;
            this.dispatch({
                type: `initPage`,
                data: id,
            });
        }
        /**
         * 提交认证
         */
        confirmBtn(item?: any) {
            // 判断是否有证明材料
            let modal = Modal.alert("操作提示", `解绑后，【${item.realName}】将无法使用企业服务，确定继续解绑吗？`, [
                {
                    text: "取消",
                    onPress: () => {
                        popstateHandler.removePopstateListener();
                    },
                },
                {
                    text: "确认",
                    onPress: () => {
                        popstateHandler.removePopstateListener();
                        this.dispatch({
                            type: `${Namespaces.staffmanagerList}/unBindComPany`,
                            params: { ...item },
                            callback: () => {
                                Toast.success("已解绑", 2, () => {
                                    this.goBack();
                                });

                                setEventWithLabel(statisticsEvent.unbindManagerCertification);
                            },
                        });
                    },
                },
            ]);
            popstateHandler.popstateListener(() => {
                modal.close();
            });
        }

        changeInfo(item?: any) {

            popstateHandler.popstateListener(() => {
                ActionSheet.close();
            });
            const { state } = this.props,
                usertypeNames = state!.usertypeNames;
            ActionSheet.showActionSheetWithOptions(
                {
                    options: usertypeNames,
                    cancelButtonIndex: usertypeNames.length - 1,
                    message: "请选择角色权限",
                    maskClosable: true,
                },
                (buttonIndex) => {
                    popstateHandler.removePopstateListener();
                    this.dispatch({
                        type: `${Namespaces.staffmanagerList}/changeCetifyInfo`,
                        buttonIndex,
                        item,
                        usertypeNames,
                        callback: () => {
                            Toast.success("修改成功", 1, () => {
                                const { id } = this.props.match!.params;

                                this.dispatch({ type: "getStaffmanagerDetail", data: id });
                            });

                            setEventWithLabel(statisticsEvent.changingManagerRoles);
                        },
                    });
                }
            );
        }

        renderButton(): React.ReactNode {
            const { state } = this.props,
                detail = state!.staffmanagerDetail || {};
            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button onClick={() => this.changeInfo(detail)}>修改角色</Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button type={"primary"} onClick={() => this.confirmBtn(detail)}>
                            企业解绑
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        renderTitle(detail: any): React.ReactNode {
            return (
                <List className="border-none">
                    <List.Item
                        wrap
                        thumb={
                            <ImageAuto.Component
                                cutWidth="80"
                                cutHeight="80"
                                height="80px"
                                width="80px"
                                radius="80px"
                                src={`${detail.avatar ? detail.avatar : "assets/images/zwtx.png"}`}
                            />
                        }
                    >
                        <div>
                            <Flex>
                                <Flex.Item>
                                    <div className="omit omit-2">{detail.realName || detail.realName}</div>
                                </Flex.Item>
                            </Flex>
                            <div className="staff-company mt5">
                                <span className="size-14 gray-three-color">{detail.companyName ? detail.companyName : ""}</span>
                            </div>
                            <div className="certify-staff-tit mt5">
                            <em className={detail.companyUserTypeName === MemberTypeEnum.admin ? "type2" : "type1"}>{detail.companyUserTypeName}</em>
                                {/* <span className={"date " + (detail.companyUserTypeName !== MemberTypeEnum.admin) ? "yellow" : ""}>{detail.companyUserTypeName}</span> */}
                            </div>
                        </div>
                    </List.Item>
                    <WhiteSpace />
                </List>
            );
        }

        renderContactType(detail: any): React.ReactNode {
            return (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List renderHeader="联系方式">
                        {detail && detail.mobile && (
                            <InputItem
                                clear
                                placeholder="未录入联系电话"
                                onClick={() => {
                                    (document.activeElement as any)!.blur();
                                }}
                                editable={false}
                                value={detail.mobile}
                            >
                                联系电话
                            </InputItem>
                        )}
                        {detail && detail.email && (
                            <InputItem
                                clear
                                placeholder="未录入邮箱"
                                onClick={() => {
                                    (document.activeElement as any)!.blur();
                                }}
                                editable={false}
                                value={detail.email}
                            >
                                联系邮箱
                            </InputItem>
                        )}
                    </List>
                </>
            );
        }

        renderOtherMsg(detail: any): React.ReactNode {
            return (
                <>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List renderHeader="其他信息">
                        <InputItem
                            clear
                            editable={false}
                            onClick={() => {
                                (document.activeElement as any)!.blur();
                            }}
                            value={detail.inputTime && formatDateTime(detail.inputTime)}
                        >
                            提交时间
                        </InputItem>
                        <InputItem
                            clear
                            editable={false}
                            onClick={() => {
                                (document.activeElement as any)!.blur();
                            }}
                            value={detail.auditTime && formatDateTime(detail.auditTime)}
                        >
                            审核时间
                        </InputItem>
                    </List>
                </>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                detail = state!.staffmanagerDetail || {};

            return (
                detail && (
                    <div className="container-prop container-column container-fill">
                        {this.renderTitle(detail)}
                        {this.renderContactType(detail)}
                        {this.renderOtherMsg(detail)}
                    </div>
                )
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                detail = state!.staffmanagerDetail || {};
            return detail && this.renderButton();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.staffmanagerDetail]);
}
