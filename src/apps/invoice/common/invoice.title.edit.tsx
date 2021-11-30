import React from "react";

import { List, WhiteSpace, Button, InputItem, Picker, Toast, Flex } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";

import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces,  invoiceTitleEditModel, comOrPerSubject } from "@reco-m/invoice-models";

import { InvoiceTitleTypeEnum, ComOrPerTitleTypeEnum } from "@reco-m/ipark-common";
export namespace InvoiceEdit {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, invoiceTitleEditModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "发票抬头";
        namespace = Namespaces.invoiceTitleEdit;

        componentDidMount() {
            this.dispatch({ type: "init" });
            const { id, intype } = this.props.match!.params;
            if (Number(id) !== 0) {
                this.dispatch({ type: "getInvoiceTitleEdit", data: id });
            }
            if (intype === `${InvoiceTitleTypeEnum.personInvoice}`) {
                this.dispatch({ type: "input", data: { type: intype, comOrPerType: ComOrPerTitleTypeEnum.person } });
            } else {
                this.dispatch({ type: "input", data: { type: intype, comOrPerType: ComOrPerTitleTypeEnum.company } });
            }
        }

        check1() {
            const { state } = this.props,
                { required, composeControl, cellphone, ValidatorControl } = Validators;

            return ValidatorControl(
                composeControl([required], { value: state!.title, name: "公司名称" }),
                composeControl([required], { value: state!.taxId, name: "纳税人识别号" }),
                composeControl([required], { value: state!.registerAddress, name: "注册地址" }),
                composeControl([required, cellphone], { value: state!.registerTel, name: "注册电话" }),
                composeControl([required], { value: state!.bankName, name: "开户银行" }),
                composeControl([required], { value: state!.bankAccount, name: "银行账号" })
            );
        }

        check2() {
            const { state } = this.props,
                { required, composeControl, ValidatorControl } = Validators;

            return ValidatorControl(
                composeControl([required], { value: state!.title, name: "公司名称" }),
                composeControl([required], { value: state!.taxId, name: "纳税人识别号" })
            );
        }

        check3() {
            const { state } = this.props,
                { required, composeControl, ValidatorControl } = Validators;

            return ValidatorControl(composeControl([required], { value: state!.title, name: "发票抬头" }));
        }

        checkTaxId(taxId) {
            if (taxId.length === 15 || taxId.length === 17 || taxId.length === 18 || taxId.length === 20) {
                return true;
            }
            // 纳税人识别号格式错误
            return false;
        }

        submitInvoiceSpecical() {
            const { id } = this.props.match!.params;
            let { state } = this.props;
            let value = "";
            const msg = this.check1()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            if (!this.checkTaxId(state!.taxId)) {
                Toast.fail("纳税人识别号格式错误");
                return;
            }
            value = "增值税专用发票";
            if (Number(id) !== 0) {
                this.dispatch({
                    type: "modifyInvoiceTitle",
                    value,
                    id,
                    callback: () => {
                        Toast.success("修改成功", 2, () => {
                            this.goBack();
                        });
                    },
                });
            } else {
                this.dispatch({
                    type: "submitInvoiceTitle",
                    value,
                    id,
                    callback: () => {
                        Toast.success("提交成功", 2, () => {
                            setEventWithLabel(statisticsEvent.invoiceRiseAdd);
                            this.goBack();
                        });
                    },
                });
            }
        }
        submitInvoiceCommon() {
            const { id } = this.props.match!.params;
            let { state } = this.props;
            let value = "";
            const msg = this.check2()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            if (!this.checkTaxId(state!.taxId)) {
                Toast.fail("纳税人识别号格式错误");
                return;
            }
            value = "增值税普通发票";
            if (Number(id) !== 0) {
                this.dispatch({
                    type: "modifyInvoiceTitle",
                    value,
                    id,
                    callback: () => {
                        setEventWithLabel(statisticsEvent.invoiceRisePost);
                        Toast.success("修改成功", 2, () => {
                            this.goBack();
                        });
                    },
                });
            } else {
                this.dispatch({
                    type: "submitInvoiceTitle",
                    value,
                    id,
                    callback: () => {
                        Toast.success("提交成功", 2, () => {
                            this.goBack();
                        });
                    },
                });
            }
        }
        submitInvoicePerson() {
            const { id } = this.props.match!.params;
            let value = "";
            const msg = this.check3()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            value = "个人普通发票";
            if (Number(id) !== 0) {
                this.dispatch({
                    type: "modifyInvoiceTitle",
                    value,
                    id,
                    callback: () => {
                        Toast.success("修改成功", 2, () => {
                            this.goBack();
                        });
                    },
                });
            } else {
                this.dispatch({
                    type: "submitInvoiceTitle",
                    value,
                    id,
                    callback: () => {
                        Toast.success("提交成功", 2, () => {
                            this.goBack();
                        });
                    },
                });
            }
        }
        submit() {
            let { state } = this.props;

            if (+state!.type === InvoiceTitleTypeEnum.speciallyInvoice) {
                this.submitInvoiceSpecical();
            } else if (+state!.type === InvoiceTitleTypeEnum.commonInvoice) {
                this.submitInvoiceCommon();
            } else if (+state!.type === InvoiceTitleTypeEnum.personInvoice) {
                this.submitInvoicePerson();
            }
        }

        renderInvoiceFormView(): React.ReactNode {
            const { state } = this.props;
            // 发票信息注释
            if (state!.comOrPerType === ComOrPerTitleTypeEnum.company) {
                return (
                    <>
                        {this.renderViewPicker()}
                        <WhiteSpace className="whitespace-gray-bg" />
                        {+state!.type === InvoiceTitleTypeEnum.commonInvoice && this.renderBasicInvoiceInfo()}
                        {+state!.type === InvoiceTitleTypeEnum.speciallyInvoice && this.renderCompanyInvoiceInfo()}
                    </>
                );
            } else if (state!.comOrPerType === ComOrPerTitleTypeEnum.person) {
                return (
                    <>
                        <WhiteSpace className="whitespace-gray-bg"></WhiteSpace>
                        <List renderHeader="资质信息">
                            <InputItem
                                placeholder="请输入个人发票抬头"
                                type="text"
                                value={state!.title}
                                onChange={(e) => {
                                    this.dispatch({ type: "input", data: { title: e } });
                                }}
                            >
                                发票抬头<span className="color-red">*</span>
                            </InputItem>
                        </List>
                    </>
                );
            }

            return null;
        }


        renderViewPicker(): React.ReactNode {
            const { state } = this.props;
            return (
                <List className="invoiceTitlePick">
                    <Picker
                        data={[
                            { label: "增值税普通发票", value: InvoiceTitleTypeEnum.commonInvoice },
                            {
                                label: "增值税专用发票",
                                value: InvoiceTitleTypeEnum.speciallyInvoice,
                            },
                        ]}
                        cols={1}
                        value={[state!.type]}
                        onOk={(value) => {
                            this.dispatch({
                                type: "input",
                                data: { title: "", taxId: "", registerAddress: "", registerTel: "", bankName: "", bankAccount: "" },
                            });
                            this.dispatch({ type: "input", data: { type: value[0] } });
                        }}
                    >
                        <InputItem
                            labelNumber={7}
                            className="list-picker"
                            value={+state!.type === InvoiceTitleTypeEnum.speciallyInvoice ? "增值税专用发票" : "增值税普通发票"}
                            placeholder="请选择发票类型"
                            editable={false}
                            onClick={() => {
                                (document.activeElement as any)!.blur();
                            }}
                        >
                            发票类型
                        </InputItem>
                    </Picker>
                </List>
            );
        }

        renderBasicInvoiceInfo(): React.ReactNode {
            const { state } = this.props;
            return (
                <List renderHeader="资质信息">
                    <InputItem
                        placeholder="请输入公司名称"
                        type="text"
                        value={state!.title}
                        labelNumber={7}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { title: e } });
                        }}
                    >
                        公司名称<span className="color-red">*</span>
                    </InputItem>

                    <InputItem
                        placeholder="请输入17-20位纳税人识别号"
                        labelNumber={7}
                        maxLength={20}
                        type="text"
                        value={state!.taxId}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { taxId: e } });
                        }}
                    >
                        纳税人识别号<span className="color-red">*</span>
                    </InputItem>
                </List>
            );
        }

        renderCompanyInvoiceInfo(): React.ReactNode {
            const { state } = this.props;
            return (
                <List renderHeader="资质信息" className="my-list">
                    <InputItem
                        placeholder="请输入公司名称"
                        type="text"
                        value={state!.title}
                        labelNumber={7}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { title: e } });
                        }}
                    >
                        公司名称<span className="color-red">*</span>
                    </InputItem>

                    <InputItem
                        placeholder="请输入17-20位纳税人识别号"
                        labelNumber={7}
                        maxLength={20}
                        type="text"
                        value={state!.taxId}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { taxId: e } });
                        }}
                    >
                        纳税人识别号<span className="color-red">*</span>
                    </InputItem>

                    <InputItem
                        labelNumber={7}
                        placeholder="请输入注册地址"
                        type="text"
                        value={state!.registerAddress}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { registerAddress: e } });
                        }}
                    >
                        注册地址<span className="color-red">*</span>
                    </InputItem>

                    <InputItem
                        labelNumber={7}
                        placeholder="请输入注册电话"
                        maxLength={11}
                        value={state!.registerTel}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { registerTel: e } });
                        }}
                    >
                        注册电话<span className="color-red">*</span>
                    </InputItem>

                    <InputItem
                        placeholder="请输入开户银行"
                        type="text"
                        value={state!.bankName}
                        labelNumber={7}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { bankName: e } });
                        }}
                    >
                        开户银行<span className="color-red">*</span>
                    </InputItem>

                    <InputItem
                        labelNumber={7}
                        placeholder="请输入银行账号"
                        type="text"
                        value={state!.bankAccount}
                        onChange={(e) => {
                            this.dispatch({ type: "input", data: { bankAccount: e } });
                        }}
                    >
                        银行账号<span className="color-red">*</span>
                    </InputItem>
                </List>
            );
        }
        renderCompanyOrPerson(): JSX.Element | null {
            const { state } = this.props;
            let subject = state!.comOrPerType ? comOrPerSubject.filter(item => item.value === state!.comOrPerType)[0].label : "";
            // 从会议室等进入不能选择
            if (`${this.props.match!.url}}`.indexOf("details/invoice") !== -1) {
                return  <InputItem labelNumber={7} clear editable={false} onClick={() => {
                    (document.activeElement as any)!.blur();
                }} placeholder="请选择" value={subject}>
                    发票主体
                </InputItem>;
            } else {
                return (
                    <div className="invoice">
                        <Picker
                            title="请选择发票主体"
                            data={comOrPerSubject}
                            value={[state!.comOrPerType]}
                            cols={1}
                            onChange={value => {
                                console.log("value", value);

                                this.dispatch({
                                    type: "input",
                                    data: { Title: "", TaxID: "", RegisterAddress: "", RegisterTel: "", BankName: "", BankAccount: "" }
                                });

                                if (value && value.length > 0)
                                    if (value[0] === undefined) {
                                        this.dispatch({ type: "input", data: { comOrPerType: ComOrPerTitleTypeEnum.company } });
                                    } else {
                                        if (value[0] === 1) {
                                            this.dispatch({ type: "input", data: { type: 1 } });
                                        } else if (value[0] === 2) {
                                            this.dispatch({ type: "input", data: { type: 3 } });
                                        }
                                        this.dispatch({ type: "input", data: { comOrPerType: value[0] } });
                                    }
                            }}
                        >
                            <InputItem labelNumber={7} clear editable={false} onClick={() => {
                                    (document.activeElement as any)!.blur();
                                }} placeholder="请选择" value={subject}>
                                    发票主体
                                </InputItem>
                        </Picker>
                    </div>
                );
            }
        }
        renderBody(): React.ReactNode {
            const { state } = this.props;
            return (
                <div>
                    <List>
                        {state! && this.renderCompanyOrPerson()}
                        {state! && this.renderInvoiceFormView()}
                    </List>
                </div>
            );
        }
        renderFooter(): React.ReactNode {
            return (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button type="primary" onClick={this.submit.bind(this)}>
                            确认提交
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.invoiceTitleEdit]);
}
