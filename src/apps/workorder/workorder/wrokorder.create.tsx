import React from "react";

import { Toast } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";
import { ViewComponent, setEventWithLabel, setNavTitle } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { ApprovalState } from "@reco-m/approval-approval";

import { Namespaces, WorkOrderTriggerEnum, defaultApprovers, wrokorderCreateModel } from "@reco-m/workorder-models";

import { ServiceSourceEnum, ServiceSourceTextEnum } from "@reco-m/ipark-common";
export namespace WorkOrderCreate {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        code?: any;
        showheader?: boolean;
        success?: (order) => void;
        renderBodyHeader?: () => JSX.Element;
        renderBodyFooter?: () => JSX.Element;
        order?: any;
        bindTableName?: any;
        bindTableId?: any;
        contactPersonCode?: any;
    }

    export interface IState extends ViewComponent.IState, wrokorderCreateModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        showheader = false;
        namespace = Namespaces.wrokorderCreate;
        principaluserid = "";
        principaluser = "";
        from;
        bindTableName;
        bindTableId;
        scrollable = false;
        isSubmiting = false;
        get code() {
            return (this.props.match && this.props.match.params.code) || this.props.code;
        }

        get id() {
            return this.props.match && this.props.match.params.workorderid;
        }

        get flowProjectId() {
            return this.props.match && this.props.match.params.flowProjectId;
        }

        get routeID(): string {
            return this.props.match && this.props.match.params.routeId;
        }
        get taskId(): string {
            return this.getSearchParam("taskId");
        }

        componentDidMount() {
            this.dispatch({
                type: `initPage`,
                data: {
                    code: this.code,
                    id: this.id,
                    goBack: this.goBack.bind(this),
                },
            });
            if (this.code === "WYBX1") {
                setEventWithLabel(statisticsEvent.repairBrowse);
            }

            this.principaluser = this.getQueryString("principalUser");
            this.principaluserid = this.getQueryString("principalUserId");
            this.bindTableName = this.getQueryString("bindTableName") || this.props.bindTableName;
            this.bindTableId = this.getQueryString("bindTableId") || this.props.bindTableId;
        }

        getQueryString(name) {
            const result = location.href.match(new RegExp("[?&]" + name + "=([^&]+)", "i"));
            if (result == null || result.length < 1) return "";
            return result[1];
        }
        submit(code: any, data) {
            if (this.isSubmiting) {
                // 防止重复提交
                return;
            }
            this.isSubmiting = true;
            const { state } = this.props,
                catalogue = state!.catalogue;

            if (!this.isAuth()) data.defaultApprovers = defaultApprovers;
            let name = state!.realName;
            if (!name && data.componentData && this.props.contactPersonCode) {
                const c = JSON.parse(data.componentData);
                if (c && c.controls) {
                    const d = c.controls.find((x) => x.controlCode === this.props.contactPersonCode);
                    d && (name = d.value);
                }
            }
            if (code === WorkOrderTriggerEnum.workOrderSubmitTrigger)
                this.dispatch({
                    type: "submit",
                    data: {
                        order: Object.assign(
                            {
                                bindTableName: this.bindTableName,
                                bindTableId: this.bindTableId,
                                parkId: getLocalStorage("parkId"),
                                catalogueId: catalogue.id,
                                catalogueName: catalogue.catalogName,
                                // subject: `[${catalogue.catalogName}]`,
                                customerId: state!.companyId || getLocalStorage("companyId"),
                                customerName: state!.companyName || getLocalStorage("companyName"),
                                principalUserId: this.principaluserid,
                                principalUser: decodeURI(this.principaluser),
                                sources: ServiceSourceTextEnum.app,
                                sourcesValue: ServiceSourceEnum.app,
                                contactPerson: !this.isAuth() ? "匿名提交" : name,
                                parkName: getLocalStorage("parkName"),
                            },
                            this.props.order || {}
                        ),
                        state: data,
                    },
                    callback: this.submitSuccess.bind(this),
                });
        }
        submitSuccess(res) {
            if (this.code === "YYKF") {
                setEventWithLabel(statisticsEvent.parkSubmitViewRoom);
            } else if (this.code === "WYBX1") {
                setEventWithLabel(statisticsEvent.submitRepairApplication);
            } else if (this.code === "WYTS") {
                setEventWithLabel(statisticsEvent.submitComplainApplication);
            } else if (this.code === "TCWSQ") {
                setEventWithLabel(statisticsEvent.submitParkingApplication);
            } else if (this.code === "XQTB") {
                setEventWithLabel(statisticsEvent.submitNeedApplication);
            }
            this.from && this.from.saveAttach(res.flowStateId);

            Toast.success("提交成功，请至个人中心关注处理进度", 1, () => {
                if (this.flowProjectId) {
                    this.goBack();
                } else {
                    this.goBack();
                    !this.getSearchParam("noclosewxmini") && wx["miniProgram"] &&
                    wx["miniProgram"].getEnv(function (res) {
                        if (res.miniprogram) {
                            wx["miniProgram"].navigateBack();
                        }
                    });
                }


            });
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

            if (client!.showheader) {
                catalogue && (this.headerContent = catalogue.catalogName);
                // catalogue && (document.title = catalogue.catalogName)
            } else {
                catalogue &&  setNavTitle.call(this, catalogue.catalogName)
            }

            return (
                <ApprovalState.Page
                    {...(this.props as any)}
                    onRef={(e) => {
                        this.from = e;
                    }}
                    goBack={this.goBack.bind(this)}
                    flowId={this.flowProjectId ? 0 : flowId}
                    flowProjectId={this.flowProjectId}
                    autoOperation={this.submit.bind(this)}
                    headerContent={this.headerContent}
                    autoTriggerCodes={[WorkOrderTriggerEnum.workOrderSubmitTrigger]}
                    operationComplete={this.operationComplete.bind(this)}
                    routeId={this.routeID}
                    isEdit={true}
                    serviceOrder={this}
                    taskId={this.taskId}
                />
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.wrokorderCreate]);
}
