import React from "react";

import { Button, List, Flex, InputItem, Toast, Modal } from "antd-mobile-v2";

import { template, Validators, getLocalStorage } from "@reco-m/core";
import { ViewComponent, setEventWithLabel, Picture } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { SelectCompany } from "@reco-m/member-common";
import { Namespaces, certifyFormModel } from "@reco-m/member-models";
import { IParkBindTableNameEnum, CertifyEnum } from "@reco-m/ipark-common";

export namespace CertifyForm {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, certifyFormModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "企业认证";
        namespace = Namespaces.certifyForm;
        showloading = true;
        hasConfirm = false;
        hasModel = false;
        ceshiref;
        componentMount() {
            let updatamemberID = this.props.match!.params.memberID;
            console.log("updatamemberID", updatamemberID);

            this.dispatch({ type: `initPage`, data: { company: null, type: CertifyEnum.companyStaff, updatamemberID } });
            if (updatamemberID) {
                this.loadAttach(updatamemberID);
            }
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        change(type: number) {
            this.dispatch({ type: "input", data: { type: type, company: "", key: "" } });
        }

        selectCompany() {
            (document.activeElement as any)!.blur();
            const { state } = this.props;

            this.hasModel = true;
            this.dispatch({ type: "input", data: { companyOpen: !state!.companyOpen } });
        }

        getPictureTip() {
            let { state } = this.props;

            if (state!.type === CertifyEnum.companyStaff) {
                return "请上传工作证/工牌扫描件";
            } else if (state!.type === CertifyEnum.admin) {
                return "请上传营业执照扫描件";
            }
        }

        /**
         * 请求tag标签
         */
        getTagList() {
            this.dispatch({ type: "getTagByTagClass", params: "MEMBER/MEMBER_ROLE" });
        }

        fileSuccess(_file, _data, _attachDataService) {
            this.dispatch({ type: "input", data: { files: [..._attachDataService!.files] } });
        }

        renderCertifyType(type: number): React.ReactNode {
            return (
                <List.Item>
                    <div>
                        <Flex>
                            <span className="am-input-label am-input-label-5">认证类型</span>
                            <Flex.Item className="margin-left-0 size-14">
                                <Flex onClick={this.change.bind(this, CertifyEnum.companyStaff)}>
                                    <i className={type === CertifyEnum.companyStaff ? "icon icon-chenggong primary-color" : "icon icon-weichenggong gray-three-color"} />
                                    <span className="margin-left-xs">企业员工</span>
                                </Flex>
                            </Flex.Item>
                            <Flex.Item className="size-14">
                                <Flex onClick={this.change.bind(this, CertifyEnum.admin)} className="pl5">
                                    <i className={type === CertifyEnum.admin ? "icon icon-chenggong primary-color" : "icon icon-weichenggong gray-three-color"} />
                                    <span className="margin-left-xs">企业管理员</span>
                                </Flex>
                            </Flex.Item>
                        </Flex>
                    </div>
                </List.Item>
            );
        }

        renderCertifyFormView(): React.ReactNode {
            const { state } = this.props,
                account = state!.account || {};
            const parkName: any = getLocalStorage("parkName");

            return (
                <List className="list-not-border input-gray-list">
                    {this.renderCertifyType(state!.type) || null}

                    <InputItem
                        clear
                        value={parkName}
                        editable={false}
                        onClick={() => {
                            (document.activeElement as any)!.blur();
                        }}
                        className={"certifyLight"}
                    >
                        认证园区
                    </InputItem>

                    <InputItem
                        clear
                        placeholder="请选择认证公司"
                        editable={false}
                        value={state!.company ? state!.company.customerName : ""}
                        onClick={this.selectCompany.bind(this)}
                    >
                        认证企业<span className="color-red">*</span>
                    </InputItem>

                    <InputItem
                        clear
                        placeholder="请输入真实姓名"
                        maxLength={10}
                        value={state!.realname}
                        editable={account!.realName ? false : true}
                        onClick={() => {
                            account!.realName && (document.activeElement as any)!.blur();
                        }}
                        className={(account!.realName ? false : true) ? "" : "certifyLight"}
                        onChange={(e) => this.dispatch({ type: "input", data: { realname: e } })}
                    >
                        真实姓名<span className="color-red">*</span>
                    </InputItem>
                    <InputItem
                        clear
                        placeholder="请输入手机号码"
                        value={state!.mobile ? state!.mobile : ""}
                        editable={account!.mobile ? false : true}
                        onClick={() => {
                            account!.mobile && (document.activeElement as any)!.blur();
                        }}
                        className={(account!.mobile ? false : true) ? "" : "certifyLight"}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { mobile: e } });
                        }}
                    >
                        手机号码<span className="color-red">*</span>
                    </InputItem>
                    <List.Item>
                        <div style={{ color: "#666" }}>证明材料<span className="color-red">*</span></div>
                        <Picture.Component tableName={IParkBindTableNameEnum.certify} customType={1} uploadSuccess={this.fileSuccess.bind(this)} />
                        <span className="size-16" style={{ color: "#b9b9b9" }}>
                            {this.getPictureTip()}
                        </span>
                    </List.Item>
                </List>
            );
        }

        confirmModel(company: any) {
            const parkName: any = getLocalStorage("parkName");
            Modal.alert(
                "操作提示",
                <div style={{ textAlign: "left", fontSize: "14px" }}>
                    请确认以下信息：
                    <ul style={{ paddingLeft: "20px" }}>
                        <li>
                            <i style={{ fontSize: "18px", fontStyle: "inherit", marginRight: "5px" }}></i>认证园区：{parkName}
                        </li>
                        <li style={{ lineHeight: "30px", marginBottom: "10px" }}>
                            <i style={{ fontSize: "18px", fontStyle: "inherit", marginRight: "5px" }}></i>认证企业：{company.customerName}
                        </li>
                    </ul>
                    提交后将无法修改，是否确认提交？
                </div>,
                [
                    {
                        text: "取消",
                        onPress: () => {},
                    },
                    {
                        text: "确认",
                        onPress: () => {
                            this.dispatch({
                                type: "certify",
                                params: this.props.state,
                                callback: (id) => {
                                    this.saveAttach(id);
                                    Toast.success("提交成功", 1, this.goBack.bind(this));
                                    setEventWithLabel(statisticsEvent.submitCertificationInformation);
                                },
                            });
                        },
                    },
                ]
            );
        }

        check() {
            const { state } = this.props,
                { composeControl, required, requiredTrue, cellphone, ValidatorControl } = Validators;
            let Attach = (this.getAttachInfo() && this.getAttachInfo()[0]) || {};

            return ValidatorControl(
                composeControl([required], { value: state!.realname, name: "姓名" }),
                composeControl([required, cellphone], { value: state!.mobile, name: "手机号码" }),
                composeControl([required], {
                    value: Attach.files,
                    name: "",
                    errors: {
                        required: "请选择并上传证明材料",
                    },
                }),
                composeControl([requiredTrue], {
                    value: !this.attachIsInProgress(),
                    name: "",
                    errors: {
                        required: "图片上传中,请稍后再试",
                    },
                })
            );
        }

        confirmBtn() {
            const { state } = this.props,
                company = state!.company;

            if (!!company && !!company.customerName) {
                const msg = this.check()!();
                if (msg) {
                    Toast.fail(msg.join(), 1);
                    return;
                }
                this.hasConfirm = true;
                // 判断是否有证明材料
                this.confirmModel(company);
            } else {
                Toast.fail("请选择认证企业", 1);
            }
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                companyOpen = state!.companyOpen,
                company = state!.company || {},
                companyProps: any = {
                    isOpen: () => companyOpen,
                    close: () => {
                        this.selectCompany();
                    },
                    selectedcall: (data: any) => this.dispatch("input", { selectedCompany: data }),
                    confirmSelect: (data: any) => this.dispatch("input", { company: data, companyOpen: false }),
                    item: company,
                    onRef: (ref) => {
                        this.ceshiref = ref;
                    },
                };

            return (
                <div>
                    {this.renderCertifyFormView()}
                    {this.renderEmbeddedView(SelectCompany.Page as any, { ref: "selectCompany", ...companyProps })}
                </div>
            );
        }

        renderFooter(): React.ReactNode {
            return <Flex className="flex-collapse">
            <Flex.Item>
                <Button
                    type={"primary"}
                    onClick={() => {
                        this.confirmBtn();
                    }}
                >
                    确认
                </Button>
            </Flex.Item>
        </Flex>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.certifyForm]);
}
