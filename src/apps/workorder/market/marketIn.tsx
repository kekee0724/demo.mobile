import React from "react";

import { List, NavBar, Drawer, InputItem, DatePicker, Flex, Button, TextareaItem, Toast, Checkbox } from "antd-mobile-v2";

import { template, Validators, formatDate, isAnonymous } from "@reco-m/core";

import { ViewComponent, setEventWithLabel, Picture, callModal } from "@reco-m/core-ui";

import { SideBarItem, SubmitBtn, Header, PickerContent } from "@reco-m/workorder-common";

import { marketInModel, Namespaces } from "@reco-m/workorder-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
const AgreeItem = Checkbox.AgreeItem;

export namespace MarketIn {
    const CELLPHONE_REGEXP = /^1[3|4|5|6|7|8|9][0-9]{9}$/;

    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, marketInModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.marketIn;
        showheader = false;
        companyId;
        isupdate;
        modifyInfo;
        modifyMobile;
        /**
         * 手机号码是否出错
         */
        isMobileError = false;
        componentDidMount() {
            this.companyId = +this.props.match!.params.companyId;
            this.isupdate = this.props.match!.params.isupdate;

            /**
             * 获取服务分类、获取服务集市地区、获取用户信息
             */
            !isAnonymous() &&
                this.dispatch({
                    type: "initPage",
                    companyId: this.companyId,
                    isupdate: this.isupdate,
                    callback: (personCommon) => {
                        this.isupdate && this.loadAttach(personCommon.bindTableId);
                    },
                    validateMobileError: (e) => {
                        this.isMobileError = true;
                        this.message.error(e);
                    },
                });
            setEventWithLabel(statisticsEvent.marketInBrowse);
            setEventWithLabel(statisticsEvent.checkinApplicationsBrowse);
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        // 验证
        check() {
            const { state } = this.props,
                { cellphone, required, requiredTrue, composeControl, ValidatorControl } = Validators;
            return ValidatorControl(
                composeControl([required], { value: state!.organizationName, name: "机构名称" }),
                composeControl([required], { value: state!.chosenCatalogue, name: "服务类别" }),
                composeControl([required], { value: state!.address, name: "机构地址" }),
                composeControl([required], { value: state!.contactPerson, name: "联系人" }),
                composeControl([required, cellphone], { value: state!.mobile, name: "手机号码" }),
                composeControl([required], { value: state!.summary, name: "机构介绍" }),
                composeControl([required], { value: state!.caseinfo, name: "服务案例" }),

                composeControl([required], {
                    value: state!.fileIDs || (this.filterAttachPlugins()?.length > 0 && this.filterAttachPlugins()[0]?.attachDataService?.files),
                    name: "机构logo",
                }),
                composeControl([required], {
                    value: state!.fileIDs2 || (this.filterAttachPlugins()?.length > 0 && this.filterAttachPlugins()[1]?.attachDataService?.files),
                    name: "案例附件",
                }),
                composeControl([required], {
                    value: state!.fileIDs3 || (this.filterAttachPlugins()?.length > 0 && this.filterAttachPlugins()[2]?.attachDataService?.files),
                    name: "机构资质",
                }),
                composeControl([required], {
                    value: state!.isAgree,
                    name: "",
                    errors: {
                        required: "需要同意并勾选入驻协议",
                    },
                }),
                composeControl([requiredTrue], {
                    value: !this.isMobileError,
                    name: "",
                    errors: {
                        required: "该手机账号已存在，无法创建成功",
                    },
                })
            );
        }

        submitConfirm() {
            const msg = this.check()!();

            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }

            this.dispatch({
                type: "commitFrom",
                companyId: this.companyId,
                isupdate: this.isupdate,
                callback: (id) => {
                    this.saveAttach(id);
                    setEventWithLabel(statisticsEvent.submitCheckinApplication);
                    Toast.success("提交成功，请至个人中心关注处理进度", 3, this.goBack.bind(this));
                    setEventWithLabel(statisticsEvent.submitMarketInApplication);
                },
            });
        }
        submit() {
            const { state } = this.props,
                initMobile = state!.initMobile,
                mobile = state!.mobile;
            if (this.isupdate) {
                if (initMobile !== mobile) {
                    callModal("当前机构信息已发生变更，将重新审核并发短信至新联系人，是否确认？", () => {
                        this.submitConfirm();
                    });
                    return;
                    // } else if (this.modifyInfo) {
                } else {
                    callModal("当前机构信息已发生变更，将重新审核，是否确认？", () => {
                        this.submitConfirm();
                    });
                    return;
                }
            }
            this.submitConfirm();
        }

        toggleModal() {
            const { state } = this.props;

            this.dispatch({
                type: "input",
                data: {
                    open: !state!.open,
                    isEdit: true,
                },
            });
        }

        renderInputItem(placeholder: any, type: any, name: string, value: string, must: Boolean, editable: boolean = true, onChange?: (e) => void): React.ReactNode {
            return (
                <InputItem
                    placeholder={`请输入${placeholder}`}
                    type={type}
                    value={value}
                    editable={editable}
                    onChange={(e) => {
                        if (this.isupdate) {
                            if (name !== "mobile") {
                                this.modifyInfo = true;
                            }
                        }
                        this.dispatch({
                            type: "input",
                            data: {
                                [name]: e,
                                isEdit: true,
                            },
                        });
                        onChange && onChange(e);
                    }}
                >
                    {placeholder}
                    {must && <span className="color-red">*</span>}
                </InputItem>
            );
        }
        // 多选数据
        getMultData(chosenData, bindID, bindName) {
            if (!chosenData || chosenData.length === 0) return;
            let ids = [...chosenData].map((x) => x.tagValue).join(",");
            let names = [...chosenData].map((x) => x.tagName).join(",");
            this.dispatch({ type: "input", data: { [bindID]: ids, [bindName]: names } });
            return names;
        }
        // 服务类别
        renderServiceType(): React.ReactNode {
            const { state } = this.props,
                chosenCatalogue = state!.chosenCatalogue;
            const names = this.getMultData(chosenCatalogue, "serviceCatalogueIDs", "serviceCatalogueNames");
            return this.renderEmbeddedView(SideBarItem.Component as any, {
                isMustWrite: true,
                data: names,
                labelName: "服务类别",
                labelPlaceholder: "请选择服务类别",
                isMultiselect: true,
                chooseModalData: this.toggleModal.bind(this),
            });
        }

        // 成立时间
        renderRegistDate(registDate: string): React.ReactNode {
            const nowTimeStamp = Date.now(),
                now = new Date(nowTimeStamp);

            return (
                <DatePicker
                    mode="date"
                    minDate={new Date("1700/01/01")}
                    maxDate={now}
                    onChange={(date) => this.dispatch({ type: "input", data: { registDate: formatDate(date, "yyyy-MM-dd") } })}
                >
                    <div>
                        <PickerContent.Component title={"成立时间"} condition={registDate} trueContent={registDate} falseContent={"请选择成立时间"} />
                    </div>
                </DatePicker>
            );
        }
        /**
         * 手机号改变时
         * @param e
         */
        onChangeMobile(e) {
            const value = e;
            if (CELLPHONE_REGEXP.test(value) && !this.isupdate) {
                this.dispatch({
                    type: "getValidateMobile",
                    mobile: value,
                    callback: () => {
                        this.isMobileError = false;
                    },
                    error: (e) => {
                        this.isMobileError = true;
                        this.message.error(e);
                    },
                });
                this.isMobileError;
            }
        }
        renderBasicInfo(): React.ReactNode {
            const { state } = this.props,
                summary = state!.summary,
                insBasic = state!.insBasic,
                isConfirmed = insBasic && insBasic.isConfirmed ? true : false;

            console.log("insBasic", insBasic);

            return (
                (
                    <List renderHeader={"基本信息"} className="my-list invoice">
                        {this.renderInputItem("机构名称", "text", "organizationName", state!.organizationName, true) || null}
                        {this.renderServiceType() || null}
                        {this.renderInputItem("机构地址", "text", "address", state!.address, true) || null}
                        {this.renderInputItem(
                            isConfirmed ? (
                                "联系人"
                            ) : (
                                <span>
                                    联系人<span style={{ fontSize: "12px", color: "red" }}>(待确认)</span>
                                </span>
                            ),
                            "text",
                            "contactPerson",
                            state!.contactPerson,
                            true,
                            isConfirmed
                        ) || null}
                        {this.renderInputItem("手机号码", "number", "mobile", state!.mobile, true, isConfirmed, this.onChangeMobile.bind(this)) || null}
                        {this.renderRegistDate(state!.registDate) || null} {/*成立时间*/}
                        {this.renderInputItem("统一信用码", "text", "businessCode", state!.businessCode, false) || null}
                        {this.renderInputItem("电子邮箱", "text", "email", state!.email, false) || null}
                        {this.renderInputItem("固定电话", "number", "tel", state!.tel, false) || null}
                        <List.Item>
                            机构logo<span className="color-red">*</span>
                            <Picture.Component
                                tableName={IParkBindTableNameEnum.institution}
                                customType={1}
                                fileNumLimit={1}
                                uploadSuccess={(_file, _data, _attachDataService) => {
                                    this.dispatch({
                                        type: "input",
                                        data: { fileIDs: [..._attachDataService!.addFileIds] },
                                    });
                                }}
                            />
                        </List.Item>
                        <div>
                            <div className="ph15 pv10 size-16">
                                机构介绍<span className="color-red">*</span>
                            </div>
                            <TextareaItem
                                placeholder="机构介绍"
                                data-seed="logId"
                                name="description"
                                autoHeight
                                rows={3}
                                value={summary}
                                onChange={(e) => this.dispatch({ type: "input", data: { summary: e, isEdit: true } })}
                            />
                        </div>
                    </List>
                )
            );
        }

        renderApplyInfo(): React.ReactNode {
            const { state } = this.props,
                caseinfo = state!.caseinfo;

            return (
                <List renderHeader={"资质信息"} className="my-list invoice">
                    <div>
                        <div className="ph15 pv10 size-16">
                            服务案例<span className="color-red">*</span>
                        </div>
                        <TextareaItem
                            placeholder="服务案例"
                            data-seed="logId"
                            name="description"
                            autoHeight
                            rows={3}
                            value={caseinfo}
                            onChange={(e) => this.dispatch({ type: "input", data: { caseinfo: e, isEdit: true } })}
                        />
                    </div>
                    <List.Item>
                        案例附件<span className="color-red">*</span>
                        <Picture.Component
                            tableName={IParkBindTableNameEnum.institution}
                            customType={2}
                            uploadSuccess={(_file, _data, _attachDataService) => {
                                this.dispatch({
                                    type: "input",
                                    data: { fileIDs2: [..._attachDataService!.addFileIds] },
                                });
                            }}
                        />
                    </List.Item>
                    <List.Item>
                        机构资质<span className="color-red">*</span>
                        <Picture.Component
                            tableName={IParkBindTableNameEnum.institution}
                            customType={3}
                            uploadSuccess={(_file, _data, _attachDataService) => {
                                this.dispatch({
                                    type: "input",
                                    data: { fileIDs3: [..._attachDataService!.addFileIds] },
                                });
                            }}
                        />
                    </List.Item>
                </List>
            );
        }
        /**
         * 表单部分
         */
        renderForm(): React.ReactNode {
            setEventWithLabel(statisticsEvent.myServiceOrgListBrowse);
            return (
                <div className="container-column container-fill container-scrollable">
                    {this.renderBasicInfo()}
                    {this.renderApplyInfo()}
                </div>
            );
        }
        // 多选选中时
        onMultChange(tag, chosenData) {
            if (this.isMultChecked(chosenData, tag)) {
                let filter = chosenData && chosenData.filter((t) => t.tagValue !== tag.tagValue);
                this.dispatch({
                    type: "input",
                    data: { chosenCatalogue: filter, a: new Date() },
                });
            } else {
                let chosenDatatemp = chosenData ? [...chosenData] : ([] as any);
                chosenDatatemp.push(tag);
                this.dispatch({
                    type: "input",
                    data: { chosenCatalogue: chosenDatatemp, a: new Date() },
                });
            }
        }
        // 多选判断是否选中
        isMultChecked(checkedTags: any, tag: any) {
            let filter = checkedTags && checkedTags.find((t: any) => t.tagValue === tag.tagValue);
            return filter;
        }
        // 多选
        renderMultItem(tag, i): React.ReactNode {
            const { state } = this.props,
                chosenData = state!.chosenCatalogue;
            return (
                <Checkbox.CheckboxItem className={"checkbox1"} key={i} onChange={() => this.onMultChange(tag, chosenData)} checked={this.isMultChecked(chosenData, tag)}>
                    {tag.tagName}
                </Checkbox.CheckboxItem>
            );
        }
        /**
         * 需求内容
         */
        renderXQLX(): React.ReactNode {
            const { state } = this.props,
                marketInTags = state!.marketInTags;

            return (
                <div>
                    {marketInTags instanceof Array &&
                        marketInTags.map((tag, i) => {
                            return this.renderMultItem(tag, i);
                        })}
                </div>
            );
        }

        /**
         * 侧边栏内容
         */
        renderDrawerSideBar(): React.ReactNode {
            return (
                <div className="drawer-detail">
                    <div className="container-column container-fill">
                        {client.showheader && <NavBar className="park-nav">服务类别</NavBar>}
                        <div className="container-fill container-scrollable">
                            <List>{this.renderXQLX()!}</List>
                        </div>
                        {this.renderButton()}
                    </div>
                </div>
            );
        }
        // 重置
        reset() {
            this.dispatch({
                type: "input",
                data: { chosenCatalogue: [], serviceCatalogueIDs: null, serviceCatalogueNames: null },
            });
        }
        onOpenChanges = (bool: boolean) => {
            this.dispatch({ type: "input", data: { open: bool } });
        };
        // 侧边栏按钮
        renderButton(): React.ReactNode {
            const { state } = this.props,
                open = state!.open;

            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                this.reset();
                            }}
                        >
                            重置
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.onOpenChanges(!open);
                            }}
                        >
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
        renderRead() {
            const { state } = this.props,
                isAgree = state!.isAgree;

            return (
                <List
                    key={"e"}
                    renderHeader={
                        <AgreeItem data-seed="logId" className="login-logid" checked={isAgree} onClick={() => this.dispatch({ type: "input", data: { isAgree: !isAgree } })}>
                            我已阅读并同意
                            <a onClick={() => this.goTo("marketagree")}>《企业服务平台机构入驻协议》</a>
                        </AgreeItem>
                    }
                ></List>
            );
        }

        render(): React.ReactNode {
            const { state } = this.props,
                open = state!.open,
                sidebar = this.renderDrawerSideBar();
            return (
                <Drawer
                    sidebar={sidebar}
                    docked={false}
                    open={open}
                    position="right"
                    onOpenChange={() =>
                        this.dispatch({
                            type: "input",
                            data: { open: !open },
                        })
                    }
                >
                    <div className="container-fill container-column body">
                        {client.showheader && (
                            <Header.Component title={"服务机构入驻"} isEdit={state!.isEdit} path={"myMarketIn"} goBack={this.goBack.bind(this)} goTo={this.goTo.bind(this)} />
                        )}
                        {this.renderBody()}
                        {this.renderRead()}
                        {this.renderFooter()}
                    </div>
                </Drawer>
            );
        }

        /**
         * 侧边栏层
         */

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                isAgree = state!.isAgree;
            return <SubmitBtn.Component isAgree={isAgree} submit={this.submit.bind(this)} />;
        }
        /**
         * 渲染主入口
         */
        renderBody(): React.ReactNode {
            return <div className="container-fill container-scrollable">{this.renderForm()}</div>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.marketIn]);
}
