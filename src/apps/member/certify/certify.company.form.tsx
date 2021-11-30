import React from "react";

import { Button, List, Flex, InputItem, Toast, Modal } from "antd-mobile-v2";

import { template, Validators, getLocalStorage } from "@reco-m/core";
import { ViewComponent, setEventWithLabel, Picture } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, certifyCompanyFormModel } from "@reco-m/member-models";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
export namespace CertifyCompanyForm {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, certifyCompanyFormModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "企业认证";
        namespace = Namespaces.certifyCompanyForm;
        showloading = true;
        hasConfirm = false;
        hasModel = false;
        ceshiref;
        showheader = client.showheader;
        companyId;
        get key() {
            return this.getSearchParam("key");
        }
        componentMount() {
            this.companyId = this.props.match!.params.companyId;
            this.dispatch({ type: `initPage`, companyId: this.companyId, key: this.key });
            if (this.companyId) {
                this.loadAttach(this.companyId);
            }
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
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

        renderCertifyFormView(): React.ReactNode {
            const { state } = this.props,
                account = state!.account || {},
                parkName = getLocalStorage("parkName");
            return (
                <List className="list-not-border input-gray-list">
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
                        placeholder="请输入企业名称"
                        value={state!.company ? state!.company : ""}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { company: e } });
                        }}
                    >
                        企业名称<span className="color-red">*</span>
                    </InputItem>
                    <InputItem
                        clear
                        placeholder="请输入统一信用码"
                        value={state!.creditCode ? state!.creditCode : ""}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { creditCode: e } });
                        }}
                    >
                        统一信用码<span className="color-red">*</span>
                    </InputItem>
                    <InputItem
                        clear
                        placeholder="请输入经营地址(门牌号)"
                        value={state!.companyaddress ? state!.companyaddress : ""}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { companyaddress: e } });
                        }}
                    >
                        经营地址<span className="color-red">*</span>
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
                        证明材料<span className="color-red">*</span>
                        <Picture.Component tableName={IParkBindTableNameEnum.newCompany} uploadSuccess={this.fileSuccess.bind(this)} />
                        <span className="size-16 gray-three-color">请上传营业执照扫描件</span>
                    </List.Item>
                </List>
            );
        }
        submit() {
            this.dispatch({
                type: "certify",
                params: this.props.state,
                companyId: this.companyId,
                callback: (data) => {
                    this.saveAttach(data.id).then(() => {
                        this.dispatch({
                            type: "generateAttach",
                            data: {
                                bindTableId: data?.id,
                                bindTableName: IParkBindTableNameEnum.newCompany,
                                toBindTableId: data?.newMemberCertifyId,
                                toBindTableName: IParkBindTableNameEnum.certify,
                                toCustomType: 1,
                            },
                        });
                    });
                    Toast.success("提交成功", 1, () => {
                        history.go(-2);
                    });
                    setEventWithLabel(statisticsEvent.submitCertificationInformation);
                },
            });
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
                            <i style={{ fontSize: "18px", fontStyle: "inherit", marginRight: "5px" }}></i>认证企业：{company}
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
                            this.submit();
                        },
                    },
                ]
            );
        }

        check() {
            const { state } = this.props,
                company = state!.company,
                companyaddress = state!.companyaddress,
                creditCode = state!.creditCode,
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
                composeControl([required], {
                    value: company,
                    name: "",
                    errors: {
                        required: "请输入认证企业",
                    },
                }),
                composeControl([required], {
                    value: creditCode,
                    name: "",
                    errors: {
                        required: "请输入统一信用码",
                    },
                }),
                composeControl([required], {
                    value: companyaddress,
                    name: "",
                    errors: {
                        required: "请输入认证企业地址",
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

            const msg = this.check()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }

            this.hasConfirm = true;

            this.dispatch({
                type: "validateCreditcode",
                creditCode: state!.creditCode,
                callback: (isValid) => {
                    if (isValid) {
                        // 判断是否有证明材料
                        this.confirmModel(company);
                    } else {
                        this.message.error("统一社会信用代码不正确");
                    }
                },
            });
        }

        renderBody(): React.ReactNode {
            return <div>{this.renderCertifyFormView()}</div>;
        }

        renderFooter(): React.ReactNode {
            return (
                <Flex className="flex-collapse">
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
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.certifyCompanyForm]);
}
