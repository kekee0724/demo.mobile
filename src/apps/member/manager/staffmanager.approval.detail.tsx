import React from "react";

import { List, Flex, Button, Modal, Toast, InputItem } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";
import { Picture, ViewComponent, setEventWithLabel, popstateHandler, androidExit } from "@reco-m/core-ui";

import { callTel } from "@reco-m/ipark-common"

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, CertifyStatusEnum, staffmanagerApprovalDetailModel, MemberTypeEnum } from "@reco-m/member-models";

import { IParkBindTableNameEnum, ServiceSourceEnum } from "@reco-m/ipark-common";
export namespace StaffmanagerApprovalDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, staffmanagerApprovalDetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "员工认证审核详情";
        namespace = Namespaces.staffmanagerApprovalDetail;
        accountId;
        componentDidMount() {
            setEventWithLabel(statisticsEvent.detailAuditView);
            this.accountId = this.getSearchParam("id") ? this.getSearchParam("id") : this.props.match!.params.id;

            this.dispatch({
                type: `initPage`, data: { id: this.accountId },
                successcall: (id) => {
                    this.loadAttach(id);
                },
                errorcall: () => {
                    Toast.fail("审核信息不存在", 1 , ()=> this.goBack())
                }
            });
        }

        componentMount(): void {
            this.dispatch({ type: "input", data: { reason: "" } });
        }

        getDetail() {
            this.dispatch({ type: "getStaffmanagerApprovalDetail", data: this.accountId, errorcall: () => {
                Toast.fail("审核信息不存在", 2 , ()=> this.goBack())
            } });
        }

        renderReasonView(): React.ReactNode {
            const { state } = this.props;
            return (
                <div className="am-modal-propmt-content">
                    <div>
                        {/* 请填写不通过原因(必填) */}
                        <div className="am-modal-input-container">
                            <div className="am-modal-input">
                                <label>
                                    <InputItem
                                        type="text"
                                        value={state!.reason}
                                        onChange={e => {
                                            this.dispatch({ type: "input", data: { reason: e } });
                                        }}
                                        placeholder="请输入原因"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        renderModal(): React.ReactNode {
            const { state } = this.props;
            return (
                <Modal
                    visible={state!.modalFlag}
                    transparent
                    maskClosable={true}
                    title="请填写不通过原因(必填)"/** 访客审核 */
                    footer={[
                        {
                            text: "取消", onPress: () => {
                                this.onOpenChange(false)
                            }
                        },
                        {
                            text: "确定",
                            onPress: this.passChk.bind(this)
                        }
                    ]}
                    onClose={() => this.onOpenChange(false)}
                >
                    {this.renderReasonView()}
                </Modal>
            );
        }
        onOpenChange = (bool: boolean) => {
            this.dispatch({ type: "input", data: { modalFlag: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { modalFlag: false } });
            androidExit(bool, callback)
        };
        check() {
            const { state } = this.props,
                { required, composeControl, ValidatorControl } = Validators;

            return ValidatorControl(composeControl([required], { value: state!.reason, name: "审核原因" }));
        }

        /**
         * 渲染弹出报名模态框
         */
        passChk() {
            const msg = this.check()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }

            const { state } = this.props,
                detail = state!.staffmanagerApprovalDetail,
                reason = state!.reason;

            this.dispatch({
                type: "certifyUpdate",
                param: { ids: [detail.id], status: CertifyStatusEnum.bounced, rejectReason: reason },
                callback: () => {
                    Toast.success("操作成功", 2, () => {
                        this.getDetail();
                    });

                    setEventWithLabel(statisticsEvent.certificationAuditFailed);
                }
            });
            this.onOpenChange(false)
        }

        accept() {
            const { state } = this.props;
            let detail = state!.staffmanagerApprovalDetail;
            let modal = Modal.alert("操作提示", "确认审核通过？", [
                {
                    text: "取消",
                    onPress: () => { popstateHandler.removePopstateListener() }
                },
                {
                    text: "确认",
                    onPress: () => {
                        popstateHandler.removePopstateListener();
                        this.dispatch({
                            type: "certifyUpdate",
                            param: { ids: [detail.id], status: CertifyStatusEnum.allow, operateSource: ServiceSourceEnum.app },
                            callback: () => {
                                Toast.success("操作成功", 2, () => {
                                    this.getDetail();
                                });

                                setEventWithLabel(statisticsEvent.certificationApproval);
                            }
                        });
                    }
                }
            ]);
            popstateHandler.popstateListener(() => {
                modal.close();
            })
        }

        renderItem(title: string, content: string): React.ReactNode {
            return (
                <List.Item>
                    <Flex>
                        <span className="margin-right-sm gray-two-color">{title}</span>
                        <Flex.Item className="no-omit">{content}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        renderOrderDetailView(): React.ReactNode {
            const { state } = this.props;
            let detail = state!.staffmanagerApprovalDetail;

            return (
                detail && (
                    <List className="width-span">
                        {this.renderItem("员工姓名", detail.realName) || null}
                        {this.renderItem("申请企业", detail.companyName) || null}
                        {this.renderItem("申请职位", detail.companyUserTypeName) || null}
                        {this.renderItem("手机号码", detail.mobile) || null}
                        {(detail.inputTime && this.renderItem("提交时间", detail.inputTime.split("T")[0])) || this.renderItem("提交时间", detail.auditTime && detail.auditTime.split("T")[0])}

                        <List.Item>
                            <Flex>
                                <span className="margin-right-sm gray-two-color">证明材料</span>
                            </Flex>
                            <Picture.Component tableName={IParkBindTableNameEnum.certify} customType={1} readonly={true} />
                        </List.Item>

                        {(detail.rejectReason && detail.status === CertifyStatusEnum.bounced && this.renderItem("退回原因", detail.rejectReason)) || null}
                    </List>
                )
            );
        }

        renderButton(): React.ReactNode {
            const { state } = this.props;
            let detail = state!.staffmanagerApprovalDetail,
                member = state!.member;
            if ((detail && detail.status === CertifyStatusEnum.noConfim) && member && member.companyUserTypeName === MemberTypeEnum.admin && member.companyId === detail.companyId) {
                return (
                    <Flex className="flex-collapse tiled-btn">
                        <Flex.Item>
                            <Button
                                onClick={() => {
                                    callTel(detail.mobile);
                                }}
                            >
                                联系申请人
                            </Button>
                        </Flex.Item>
                        <Flex.Item>
                            <Button onClick={() => this.onOpenChange(true)}>审核不通过</Button>
                        </Flex.Item>
                        <Flex.Item>
                            <Button type={"primary"} onClick={this.accept.bind(this)}>
                                审核通过
                            </Button>
                        </Flex.Item>
                    </Flex>
                );
            } else {
                return (
                    <Flex className="flex-collapse">
                        <Flex.Item>
                            <Button
                                type="primary"
                                onClick={() => {
                                    callTel(detail.mobile);
                                }}
                            >
                                联系申请人
                            </Button>
                        </Flex.Item>
                    </Flex>
                );
            }
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                detail = state!.staffmanagerApprovalDetail;

            return detail && this.renderButton();
        }

        renderBody(): React.ReactNode {
            return (
                <>
                    {this.renderModal()}
                    {this.renderOrderDetailView()}
                </>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.staffmanagerApprovalDetail]);
}
