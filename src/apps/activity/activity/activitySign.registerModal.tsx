import React from "react";

import { Modal, Button, InputItem, WhiteSpace, Toast, TextareaItem, DatePicker, List, Radio, WingBlank, Checkbox, Flex, Accordion } from "antd-mobile-v2";

import { template, isAnonymous, formatDate, getDate } from "@reco-m/core";

import { LocationDescriptorObject } from "history";

import { ViewComponent, setEventWithLabel, androidExit } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, SignFormFieldTypeEnum, TextTypeEnum, activityDetailModel } from "@reco-m/activity-models";
export namespace ActivitySignSignModal {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        isRegisted?: any;
        activityDetailData?: any;
        currentUser?: any;
        time;
    }

    export interface IState extends ViewComponent.IState, activityDetailModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.activityDetail;
        headerContent = "填写报名表单";
        protected __goTo(_path: string | LocationDescriptorObject, state?: any) {
            let index = `${this.props.match!.url}}`.indexOf("sign");
            let result = `${this.props.match!.url}}`.substr(0, index);

            this.props.history && this.props.history.replace(`${result}sresult?sign=true` as any, state);
        }
        signUpSuccess(e: any) {
            setEventWithLabel(statisticsEvent.parkActivityEnrollment);

            e &&
                Toast.success("提交成功!", 1, () => {
                    this.goTo("sresult");
                });

            this.dispatch({ type: "activityDetail/getActivityDetail", data: this.props.match!.params.id });
        }
        /**
         * 报名操作报错时
         * @param e
         */
        signUpActivityError(e) {
            if (e.errcode === "ACTIVITY_APPLY_JOIN_DING_TALK") {
                Modal.alert("操作提示", `检测到您还未加入钉钉组织，提交报名信息并同意邀请后，才可自动进群，是否继续？`, [

                    {
                        text:  "我知道了",
                        onPress: () => {
                            this.signUpSuccess({});
                        }
                    }
                ]);
            } else {
                this.message.error(e.errmsg);
            }
        }
        showSignUpModal(bool) {
            if (!isAnonymous()) {
                this.dispatch({ type: "input", data: { showSignUpModal: bool } });
                // 解决android返回
                const callback = () => this.dispatch({ type: "input", data: { showSignUpModal: false } });
                androidExit(bool, callback);
            } else {
                this.goTo("login");
            }
        }
        showValidateToast(columnConfig, item) {
            if (columnConfig.validation.errorMessage) {
                Toast.fail(columnConfig.validation.errorMessage.replace("{0}", item.columnName || ""), 1);
            } else {
                Toast.fail(item.columnName + "请输入正确的内容", 1);
            }
        }
        /**
         * 验证
         */
        check() {
            const { state } = this.props,
                activityDetailData = state!.activityDetail;
            if (!state!.userName) {
                Toast.fail(`姓名为必填项`);
                return false;
            }
            if (!state!.mobile) {
                Toast.fail(`手机号为必填项`);
                return false;
            }



            const { activityDetailVM = {}, activityVM = {}  } = activityDetailData || ({} as any);

            if (!activityVM.isApply) {
                return true
            }

            const applyFieldsJson = activityDetailVM.applyFieldsJson;
            const applyFieldsObj = JSON.parse(applyFieldsJson);
            let result = true;

            applyFieldsObj &&
                applyFieldsObj.reverse().forEach((item) => {
                    let temp = state![item.id];
                    if (item.isRequired && !temp) {
                        Toast.fail(`${item.columnName}为必填项`);
                        result = false;
                    } else {
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.text || item.columnContentTypeValue === SignFormFieldTypeEnum.textArea) {
                            // 单行文本 || 多行文本
                            // console.log('temp', temp, item);
                            let columnConfig = item.columnConfig ? JSON.parse(item.columnConfig) : {};
                            if (item.columnConfig && columnConfig.validation) {
                                // 需要正则验证
                                let validationArgs = columnConfig.validation.validationArgs;
                                // console.log('validationArgs', validationArgs);
                                try {
                                    let reg = new RegExp(validationArgs);
                                    // console.log('temp111', reg.test(temp), validationArgs, columnConfig);
                                    if (temp && !reg.test(temp)) {
                                        // console.log('temp00');
                                        this.showValidateToast(columnConfig, item);
                                        result = false;
                                    }
                                } catch (e) {
                                    Toast.fail(`${item.columnName}正则表达式错误`, 2);
                                    result = false;
                                }
                            }
                        }
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.date) {
                            // 日期时间
                        }
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.radio) {
                            // 单选框
                        }
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.select) {
                            // 下拉
                        }
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.radio) {
                            // 复选框
                        }
                    }
                });
            return result;
        }

        /**
         * 确认报名
         */
        sureSubmit(activityDetailData: any) {
            const { state } = this.props;
            if (this.check()) {
                this.dispatch({ type: "input", data: { isSubmitting: true } });
                this.dispatch({
                    type: "signUpActivity",
                    state,
                    activityDetailData: activityDetailData,
                    callback: (e) => {
                        this.signUpSuccess(e);
                    },
                    errorback: (e) => {
                        this.signUpActivityError(e)
                    },
                });
                this.showSignUpModal(false);
            }
        }

        /**
         * 单行文本
         */
        renderLineText(objData): React.ReactNode {
            const { state } = this.props;
            let columnConfig = objData.columnConfig ? JSON.parse(objData.columnConfig) : {};
            let type = columnConfig.child.value;

            return (
                <InputItem
                labelNumber = {7}
                    key={objData.id}
                    placeholder={objData.columnTip}
                    type={type === TextTypeEnum.number ? "number" : "text"}
                    value={state![objData.id]}
                    onChange={(e) => {
                        this.dispatch({ type: "update", data: { [objData.id]: e } });
                    }}
                >
                    {objData.columnName}
                    {objData.isRequired && <span className="color-red">*</span>}
                </InputItem>
            );
        }

        /**
         * 多行文本
         */
        renderTextArea(objData): React.ReactNode {
            const { state } = this.props;
            return (
                <List
                    key={objData.id}
                    renderHeader={
                        <div style={{marginBottom: "10px"}}>
                            {objData.columnName}
                            {objData.isRequired && <span className="color-red">*</span>}
                        </div>
                    }
                >
                    <div className="model-list-box">
                        <TextareaItem
                            value={state![objData.id]}
                            placeholder={objData.columnTip}
                            data-seed="logId"
                            rows={3}
                            autoHeight
                            onChange={(e) => {
                                this.dispatch({ type: "update", data: { [objData.id]: e } });
                            }}
                        />
                    </div>
                </List>
            );
        }
        renderDateText(objData) {
            const { state } = this.props;
            if (objData.columnConfig.indexOf("只显示时分") !== -1) {
                return formatDate(state![objData.id], "hh:mm");
            } else if (objData.columnConfig.indexOf("日期") !== -1) {
                return formatDate(state![objData.id], "yyyy-MM-dd");
            } else if (objData.columnConfig.indexOf("包含时分") !== -1) {
                return formatDate(state![objData.id], "yyyy-MM-dd hh:mm");
            } else {
                return "";
            }
        }
        refScroll(el) {
            super.refScroll(el);
            $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }
        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents(".container-page").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $(this)
                .parents(".container-page")
                .find("#nav_box_Shadow")
                .css({
                    background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                        top * 0.001 < 0.1 ? top * 0.001 : 0.1
                    }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                });
        }

        /**
         * 时间日期
         */
        renderDate(objData): React.ReactNode {
            const { state } = this.props;

            let type = "date";
            if (objData.columnConfig.indexOf("只显示时分") !== -1) {
                type = "time";
            } else if (objData.columnConfig.indexOf("日期") !== -1) {
                type = "date";
            } else if (objData.columnConfig.indexOf("包含时分") !== -1) {
                type = "datetime";
            }

            return (
                <div>
                    <DatePicker
                        key={objData.id}
                        mode={type as any}
                        onChange={(v) => {
                            this.dispatch({ type: "update", data: { [objData.id]: v } });
                        }}
                        value={getDate(state![objData.id])}
                        extra="请选择日期"
                    >
                        <List
                            renderHeader={
                                <div style={{marginBottom: "10px"}}>
                                    {" "}
                                    {objData.columnName}
                                    {objData.isRequired && <span className="color-red">*</span>}
                                </div>
                            }
                        >
                            <div className="model-list-box">
                                <List.Item>{state![objData.id] ? this.renderDateText(objData) : <span className="gray-three-color">请选择</span>}</List.Item>
                            </div>
                        </List>
                    </DatePicker>
                </div>
            );
        }

        checkRadio(objData, item) {
            const { state } = this.props;
            const selected = state![objData.id];
            return selected ? selected.value === item.value : false;
        }

        /**
         * 渲染单选选项RadioItem
         */
        renderRadio(objData, item, index): React.ReactNode {
            return (
                <Radio.RadioItem
                    checked={this.checkRadio(objData, item)}
                    key={index}
                    name={"radio-" + index}
                    onChange={() => {
                        this.dispatch({ type: "update", data: { [objData.id]: item } });
                    }}
                >
                    {item.label}
                </Radio.RadioItem>
            );
        }

        /**
         *  单选
         */
        renderRadioItems(objData): React.ReactNode {
            let selections = JSON.parse(objData.selections);
            return (
                <List
                    key={objData.id}
                    renderHeader={
                        <div style={{marginBottom: "10px"}}>
                            {objData.columnName}
                            {objData.isRequired && <span className="color-red">*</span>}
                        </div>
                    }
                >
                    <div className={"model-list-box"}>
                        {selections &&
                            selections.map((item, index) => {
                                return this.renderRadio(objData, item, index);
                            })}
                    </div>
                </List>
            );
        }

        /**
         * 下拉单选
         */
        renderDownRadioItems(objData): React.ReactNode {
            let selections = JSON.parse(objData.selections);
            return (
                <Accordion defaultActiveKey="0" key={objData.id} className="my-accordion">
                    <Accordion.Panel
                        header={
                            <div style={{marginBottom: "10px"}}>
                                {objData.columnName}
                                {objData.isRequired && <span className="color-red">*</span>}
                            </div>
                        }
                    >
                        <List renderHeader={""} key={objData.id} className="my-list">
                            <div className="model-list-box">
                                {selections &&
                                    selections.map((item, index) => {
                                        return this.renderRadio(objData, item, index);
                                    })}
                            </div>
                        </List>
                    </Accordion.Panel>
                </Accordion>
            );
        }

        /**
         * 多选
         */
        checkboxChange(objData, item) {
            const { state } = this.props;
            const selecteds = state![objData.id];
            if (this.chekboxValue(objData, item)) {
                let newselecteds = selecteds.filter((itm) => {
                    return itm.value !== item.value;
                });
                this.dispatch({ type: "update", data: { [objData.id]: newselecteds } });
            } else {
                let newselecteds = selecteds ? [...selecteds] : [];
                newselecteds.push(item);
                this.dispatch({ type: "update", data: { [objData.id]: newselecteds } });
            }
        }

        chekboxValue(objData, item) {
            const { state } = this.props;
            const selecteds = state![objData.id];

            let chekboxValue = false;
            selecteds &&
                selecteds.forEach((itm) => {
                    if (itm.value === item.value) {
                        chekboxValue = true;
                    }
                });
            return chekboxValue;
        }

        /**
         * 渲染多选项
         */
        renderChecked(objData, item, index): React.ReactNode {
            return (
                <Checkbox.CheckboxItem key={index} checked={this.chekboxValue(objData, item)} onChange={() => this.checkboxChange(objData, item)}>
                    {item.label}
                </Checkbox.CheckboxItem>
            );
        }

        /**
         * 多选题目
         */
        renderCheckedItem(objData): React.ReactNode {
            let selections = JSON.parse(objData.selections);
            return (
                <List
                    key={objData.id}
                    renderHeader={
                        <div style={{marginBottom: "10px"}}>
                            {objData.columnName}
                            {objData.isRequired && <span className="color-red">*</span>}
                        </div>
                    }
                >
                    <div className="model-list-box">
                        {selections &&
                            selections.map((item, index) => {
                                return this.renderChecked(objData, item, index);
                            })}
                    </div>
                </List>
            );
        }

        renderFieldObj(applyFieldsObj): React.ReactNode {
            return (
                applyFieldsObj &&
                applyFieldsObj.map((item) => {
                    if (item.columnContentTypeValue === SignFormFieldTypeEnum.text) {
                        // 单行文本
                        return this.renderLineText(item);
                    }
                    if (item.columnContentTypeValue === SignFormFieldTypeEnum.textArea) {
                        // 多行文本
                        return this.renderTextArea(item);
                    }
                    if (item.columnContentTypeValue === SignFormFieldTypeEnum.date) {
                        // 日期时间
                        return this.renderDate(item);
                    }
                    if (item.columnContentTypeValue === SignFormFieldTypeEnum.radio) {
                        // 单选框
                        return this.renderRadioItems(item);
                    }
                    if (item.columnContentTypeValue === SignFormFieldTypeEnum.select) {
                        // 下拉
                        return this.renderDownRadioItems(item);
                    }
                    if (item.columnContentTypeValue === SignFormFieldTypeEnum.check) {
                        // 复选框
                        return this.renderCheckedItem(item);
                    }
                })
            );
        }

        renderChargeView(activityDetailData): React.ReactNode {
            const { activityVM = {} } = activityDetailData || ({} as any);
            const isApplyCharge = activityVM.isApplyCharge;
            const isApply = activityVM.isApply;
            return isApplyCharge && isApply ? (
                <List>
                    <div className="model-list-box">
                        <Radio.RadioItem
                            checked={true}
                            disabled={false}
                        >
                            票价<span>{activityVM.applyCharge}</span>
                        </Radio.RadioItem>
                    </div>
                </List>
            ) : null;
        }

        renderSignUpFrom(): React.ReactNode {
            const { state } = this.props,
                mobile = state!.mobile,
                userName = state!.userName,
                activityDetailData = state!.activityDetail;
            const { activityDetailVM = {}, activityVM = {} } = activityDetailData || ({} as any);
            const applyFieldsJson = activityDetailVM.applyFieldsJson;
            const applyFieldsObj = JSON.parse(applyFieldsJson);

            return (
                <>
                    <WhiteSpace size={"lg"} />
                    {this.renderChargeView(activityDetailData)}
                    <InputItem
                        placeholder={"请输入姓名"}
                        type={"text"}
                        value={userName}
                        onChange={(e) => {
                            this.dispatch({
                                type: "update",
                                data: { userName: e },
                            });
                        }}
                    >
                        您的姓名<span className="color-red">*</span>
                    </InputItem>
                    <InputItem
                        placeholder={"请输入联系电话"}
                        type={"number"}
                        editable={false}
                        value={mobile}
                        onChange={(e) => {
                            this.dispatch({
                                type: "update",
                                data: { mobile: e },
                            });
                        }}
                    >
                        您的手机号<span className="color-red">*</span>
                    </InputItem>
                    {applyFieldsObj && activityVM.isApply && this.renderFieldObj(applyFieldsObj)}
                </>
            );
        }

        chargeNext() {
            if (this.check()) {
                this.goTo("signOrder");
            }
        }

        renderSignUpModal(): React.ReactNode {
            return (
                <div className="model-full">
                    <WingBlank>{this.renderSignUpFrom()}</WingBlank>
                    <WhiteSpace size={"lg"} />
                </div>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                activityDetailData = state!.activityDetail;
            return activityDetailData ? this.renderSignUpModal() : null;
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                activityDetailData = state!.activityDetail,
                isSubmitting = state!.isSubmitting;
            const { activityVM = {} } = activityDetailData || ({} as any);
            const isApplyCharge = activityVM.isApplyCharge;
            const isApply = activityVM.isApply;
            return (
                <Flex key="b" onClick={(e) => e.stopPropagation()} className={`flex-collapse row-collapse`}>
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.goBack();
                            }}
                        >
                            取消
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                if (isApplyCharge && isApply) {
                                    // 收费
                                    this.chargeNext();
                                } else {
                                    // 免费
                                    !isSubmitting ? this.sureSubmit(activityDetailData) : null;
                                }
                            }}
                        >
                            {isApplyCharge && isApply ? "下一步" : isSubmitting ? "提交中..." : "确认报名"}
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.activityDetail]);
}
