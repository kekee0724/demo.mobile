import React from "react";

import { Toast, Flex } from "antd-mobile-v2";

import { template, isAnonymous, getLocalStorage } from "@reco-m/core";

import { ViewComponent, setEventWithLabel, setNavTitle } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { ApprovalState } from "@reco-m/approval-approval";

import { Namespaces, WorkOrderTriggerEnum, VisitorTypeEnum, wrokorderCreateModel } from "@reco-m/workorder-models";

import { CertifyStatusEnum } from "@reco-m/member-models";

export namespace WorkorderVisitor {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, wrokorderCreateModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        showheader = false;
        namespace = Namespaces.wrokorderCreate;
        principaluserid = "";
        from;

        code = "FKYY_sfz";

        componentDidMount() {
            setNavTitle.call(this, "访客预约")

            if (isAnonymous()) {
                this.goTo("/login");
                return;
            }
            this.dispatch({
                type: "initVisitorPage",
                callback: () => {
                    const { state } = this.props;
                    let member = state!.member;
                    if (this.getSearchParam("vt")) {
                        // url默认打开访客
                        this.typeClick(VisitorTypeEnum.visitor);
                    } else {
                        setTimeout(() => {
                            if (member && member.status === CertifyStatusEnum.allow) {
                                this.typeClick(VisitorTypeEnum.respondent);
                            } else {
                                this.typeClick(VisitorTypeEnum.visitor);
                            }
                        }, 200);
                    }
                },
                goBack: this.goBack.bind(this),
                code: this.code
            });

            this.principaluserid = this.getQueryString("principalUserId");
            console.log(this.principaluserid);

        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, "访客预约", nextProps);
        }
        getQueryString(name) {
            const result = location.href.match(new RegExp("[?&]" + name + "=([^&]+)", "i"));
            if (result == null || result.length < 1) return "";
            return result[1];
        }

        submit(code: any, data) {
            const { state } = this.props,
                catalogue = state!.catalogue,
                from = JSON.parse(data.componentData || "{}");
            let sfqy: any = null;

            if (from && from.controls) sfqy = from.controls.find((x) => x.controlName === "受访企业名");

            if (code === WorkOrderTriggerEnum.workOrderSubmitTrigger)
                this.dispatch({
                    type: "submit",
                    data: {
                        order: {
                            parkId: getLocalStorage("parkId"),
                            catalogueId: catalogue.id,
                            catalogueName: catalogue.catalogName,
                            // subject: `【${catalogue.catalogName}】`,
                            customerId: sfqy ? sfqy.hidValue : "",
                            customerName: sfqy ? sfqy.value : "",
                            principalUserId: this.principaluserid,
                        },
                        state: data,
                    },
                    callback: this.submitSuccess.bind(this),
                });
        }

        submitSuccess(res) {
            this.from && this.from.saveAttach(res.flowStateId);

            Toast.success("提交成功，请至个人中心关注处理进度", 1, () => {
                setEventWithLabel(statisticsEvent.submitVisitorsAppointmentAppli);
                this.goBack();
                wx["miniProgram"] &&
                    wx["miniProgram"].getEnv(function (res) {
                        if (res.miniprogram) {
                            wx["miniProgram"].navigateBack();
                        }
                    });
            });
        }

        typeClick(type: any) {
            const stateType = this.props.state!.type || VisitorTypeEnum.respondent;
            if (stateType === type) return;

            this.dispatch("update", { type, flowId: undefined });

            this.code = ["", "FKYY_sfz", "FKYY_fk"][type];

            setTimeout(() => {
                this.dispatch({ type: "getCatalogDTO", goBack: this.goBack.bind(this) }, this.code);
            }, 20);
        }

        renderBodyHeader(): React.ReactNode {
            const type = this.props.state!.type || VisitorTypeEnum.respondent;

            return (
                <Flex className="visitor_type whiteBackColor border-bottom-1px">
                    <Flex.Item className={type === VisitorTypeEnum.respondent ? "active" : ""}>
                        <div className="visitor_type_img" onClick={this.typeClick.bind(this, VisitorTypeEnum.respondent)}>
                            <img src="assets/images/visitor01.png" />
                            {type === VisitorTypeEnum.respondent && (
                                <div>
                                    <i className="icon icon-duihao" />
                                </div>
                            )}
                        </div>
                        <div className="visitor_type_text">受访者</div>
                    </Flex.Item>
                    <div className="visitor_type_ask">请问您是？</div>
                    <Flex.Item className={type === VisitorTypeEnum.visitor ? "active" : ""}>
                        <div className="visitor_type_img" onClick={this.typeClick.bind(this, VisitorTypeEnum.visitor)}>
                            <img src="assets/images/visitor02.png" />
                            {type === VisitorTypeEnum.visitor && (
                                <div>
                                    <i className="icon icon-duihao" />
                                </div>
                            )}
                        </div>
                        <div className="visitor_type_text">访客</div>
                    </Flex.Item>
                </Flex>
            );
        }

        componentWillUnmount() {
            this.dispatch("init");
        }
        operationComplete(res) {
            this.from && this.from.saveAttach(res.project.id);

            this.goBack();
        }
        renderBody(): React.ReactNode {
            const flowId = this.props.state!.flowId,
                catalogue = this.props.state!.catalogue;

            catalogue && (this.headerContent = catalogue.catalogName);
            const type = this.props.state!.type || VisitorTypeEnum.respondent;

            if (!flowId) {
                return null;
            }

            return type === VisitorTypeEnum.respondent ? (
                <ApprovalState.Page
                    key={1}
                    {...(this.props as any)}
                    onRef={(e) => {
                        this.from = e;
                    }}
                    goBack={this.goBack.bind(this)}
                    flowId={flowId}
                    autoOperation={this.submit.bind(this)}
                    headerContent={this.headerContent}
                    autoTriggerCodes={[WorkOrderTriggerEnum.workOrderSubmitTrigger]}
                    renderBodyHeader={this.renderBodyHeader.bind(this)}
                    operationComplete={this.operationComplete.bind(this)}
                    isEdit={true}
                />
            ) : (
                <ApprovalState.Page
                    key={2}
                    {...(this.props as any)}
                    onRef={(e) => {
                        this.from = e;
                    }}
                    goBack={this.goBack.bind(this)}
                    flowId={flowId}
                    autoOperation={this.submit.bind(this)}
                    headerContent={this.headerContent}
                    autoTriggerCodes={[WorkOrderTriggerEnum.workOrderSubmitTrigger]}
                    renderBodyHeader={this.renderBodyHeader.bind(this)}
                    operationComplete={this.operationComplete.bind(this)}
                    isEdit={true}
                />
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.wrokorderCreate]);
}
