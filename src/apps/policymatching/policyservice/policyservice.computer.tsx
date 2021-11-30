
import React from "react";
import Rater from "react-rater";
import { Flex, InputItem, List, WhiteSpace, Button, Accordion, Toast, Modal, Checkbox } from "antd-mobile-v2";

import { template, getLocalStorage, Validators, browser } from "@reco-m/core";
import { setEventWithLabel, Picture, ImageAuto } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { SelectCompany } from "@reco-m/member-common";

import { policyserviceModel, Namespaces, isNoCertify, isCertifyed, CashTypeValueEnum, DataTypeEnum, getPolicyDeadline, PolicyDeclareModeEnum } from "@reco-m/policymatching-models";

import { WBFormViewComponent, clickTypeEnum } from "@reco-m/ipark-common-page";

import { IParkBindTableNameEnum, CertifyEnum, synchronousSerial } from "@reco-m/ipark-common";

import {goToCompatibleWxmini} from "@reco-m/h5home-models";
const AgreeItem = Checkbox.AgreeItem;
export namespace PolicyComputerService {
    export interface IProps<S extends IState = IState> extends WBFormViewComponent.IProps<S> {
        initData: () => void;
    }

    export interface IState extends WBFormViewComponent.IState, policyserviceModel.StateType {
        tabsIndex?: any;
        sValue?: any;
        accordion?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends WBFormViewComponent.Component<P, S> {
        namespace = Namespaces.policyservice;
        showloading = false;
        headerContent = "政策服务";
        hasConfirm = false;
        hasModel = false;
        showAllCompany = 4;
        time;
        // showAllPerson = false;
        componentDidMount() {
            this.setState({
                accordion: 0,
            });
        }
        scroll = () => {
            // console.log("scrollTop()", $(".scroll-p").scrollTop());

            clearTimeout(this.time);
            const dom = $(".am-notice-bar-marquee");
            dom.addClass("no-right");
            this.time = setTimeout(() => dom.removeClass("no-right"), 300);

            if ($(".scroll-p").scrollTop()! > 30 && isCertifyed(this.props) && this.state.accordion === 0) {
                console.log("1111");

                this.setState({
                    accordion: 1,
                });
            } else if ($(".scroll-p").scrollTop()! < 30 && isCertifyed(this.props) && this.state.accordion === 1) {
                this.setState({
                    accordion: 0,
                });
            }
            $(".arrow").hide();
        };
        renderForm(item, i) {
            let { state } = this.props,
                itemDatas = state![item.id];
            if (item.dataTypeValue === DataTypeEnum.string) {
                // 侧拉选择
                return (
                    <div key={i}>
                        {this.renderInput({
                            title: item.className,
                            stateKey: `${item.id}Select`,
                            placeholder: `请选择${item.className}`,
                            clickType: clickTypeEnum.drawer,
                            isRequired: false,
                            rollTitle: true,
                            drawerConfig: {
                                drawerData: itemDatas,
                                drawerLabelKey: "tagName",
                                drawerValueKey: "id",
                                drawerMult: item.remark === "多选",
                                drawerDatasStateKey: `${item.id}`,
                                filterKey: "tagName",
                            },
                            onClick: (fun) => {
                                this.dispatch({
                                    type: "getCalculateTagsItems",
                                    tagId: item.id,
                                });
                                fun();
                            },
                        })}
                    </div>
                );
            } else if (item.dataTypeValue === DataTypeEnum.num) {
                // 数值
                return this.renderInput({
                    type: browser.versions.android ? "digit" : "number",
                    title: item.className,
                    stateKey: `${item.id}Select`,
                    placeholder: `输入${item.className}`,
                    isRequired: false,
                    rollTitle: true,
                });
            } else if (item.dataTypeValue === DataTypeEnum.date) {
                // 日期
                return this.renderDatePick({
                    title: item.className,
                    stateKey: `${item.id}Select`,
                    placeholder: `请选择${item.className}`,
                    mode: "date",
                    minDate: new Date(1900, 0, 1),
                    format: "yyyy/MM/dd",
                    isRequired: false,
                    rollTitle: true,
                });
            } else if (item.dataTypeValue === DataTypeEnum.bool) {
                // 布尔
                return (
                    <List.Item>
                        <div>
                            <Flex>
                                <span className="am-input-label am-input-label-5 gray-two-color">{item.className}</span>
                                {this.renderTagsLine({
                                    stateKey: `${item.id}Select`,
                                    tagsData: [
                                        { tagName: "是", tagValue: "TRUE" },
                                        { tagName: "否", tagValue: "FALSE" },
                                    ],
                                    multiple: false,
                                    tagLabelKey: "tagName",
                                    tagValueKey: "tagValue",
                                })}
                            </Flex>
                        </div>
                    </List.Item>
                );
            }
        }
        renderPolicyComputerCom() {
            let { state } = this.props,
                { calculateTags = [] } = state as any;
            return calculateTags.map((item, i) => {
                // 只显示第三个
                if (i >= this.showAllCompany) {
                    return null;
                }

                return this.renderForm(item, i);
            });
        }
        renderPolicyComputerDefault() {
            let { state } = this.props,
                { defaultTags = [] } = state as any;

            return defaultTags.map((item, i) => {
                return this.renderForm(item, i);
            });
        }
        onChange = (_key) => {
            this.setState({
                accordion: this.state.accordion === 0 ? 1 : 0,
            });
        };
        renderPolicyComputerHeader() {
            let { state } = this.props,
                { policyMatch = {} } = state as any;
            let matchnum = policyMatch.enterpriseIntegrity?.toFixed(2) * 100;

            return this.state.accordion === 0 ? (
                <>
                    <Accordion defaultActiveKey="0" activeKey={`0`} className="card-accordion" onChange={this.onChange}>
                        <Accordion.Panel
                            key="0"
                            header={
                                <>
                                    <div className="omit omit-1">
                                        <strong>{policyMatch.customerName}</strong>
                                    </div>
                                    <WhiteSpace />
                                    <Flex align={"center"} style={{ height: 20 }}>
                                        <div className="schedule-box">
                                            <div className="schedule-bar" style={{ width: matchnum + "%" }} />
                                        </div>
                                        <Flex.Item className="text-left">
                                            {this.state.accordion !== 0 ? <span className="margin-left-xs highlight-color size-12">{matchnum}%</span> : ""}
                                        </Flex.Item>
                                    </Flex>
                                    <WhiteSpace />
                                    <div className="size-14">
                                            企业信息完整度：<span className="highlight-color">{matchnum || 0}%</span>
                                        </div>

                                </>
                            }
                        >
                            <List className="list-no-border">
                                <List.Item wrap>
                                    <Flex align="start" className="text-center width-full size-14 gray-three-color">
                                        <Flex.Item>
                                            <div>匹配政策数</div>
                                            <WhiteSpace />
                                            <div className="omit omit-1">
                                                <strong className="color-blue size-18 margin-right-xs">{policyMatch.policyNumber || 0}</strong>条
                                            </div>
                                        </Flex.Item>
                                        <Flex.Item>
                                            <div>预估补贴金额</div>
                                            <WhiteSpace />
                                            <div className="omit omit-1">
                                                <strong className="highlight-color size-18 margin-right-xs">{policyMatch.predictMoneyNumber || 0}</strong>万元
                                            </div>
                                        </Flex.Item>
                                        <Flex.Item>
                                            <div>预估资质认定</div>
                                            <WhiteSpace />
                                            <div className="omit omit-1">
                                                <strong className="highlight-color size-18 margin-right-xs">{policyMatch.predictQualificationsNumber || 0}</strong>项
                                            </div>
                                        </Flex.Item>
                                    </Flex>
                                    <WhiteSpace size={"lg"} />
                                    <Flex align={"center"} justify={"center"}>
                                        <div className="text-center">
                                            <Button
                                                style={{ width: 150 }}
                                                className="radius-button"
                                                size={"small"}
                                                type={"primary"}
                                                onClick={() => {
                                                    this.dispatch("input", { showComputerResult: false });
                                                    this.dispatch({ type: `getCalculateTags` });
                                                }}
                                            >
                                                继续完善信息
                                            </Button>
                                            <WhiteSpace />
                                            <Button
                                                style={{ width: 150 }}
                                                className="radius-button"
                                                size={"small"}
                                                type={"ghost"}
                                                onClick={() => {
                                                    if (this.isAuth()) {
                                                        // this.goTo(`create/zczx?ZCZT=人工咨询`);
                                                        goToCompatibleWxmini(this, () => {
                                                            this.goTo(`create/zczx?ZCZT=人工咨询`);
                                                        })
                                                    } else {

                                                        if (!browser.versions.weChatMini) {
                                                            // this.goTo("login");
                                                            goToCompatibleWxmini(this, () => {
                                                                this.goTo("login");
                                                            })
                                                        } else {
                                                            wx["miniProgram"].redirectTo({url: '/apps-auth/login/login'})
                                                        }


                                                        // wx.checkJsApi({
                                                        //     jsApiList: ['chooseImage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                                                        //     success: function(res) {
                                                        //     // 以键值对的形式返回，可用的api值true，不可用为false
                                                        //     // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                                                        //     }
                                                        //   });
                                                        // wx.miniProgram.navigateTo
                                                    }
                                                }}
                                            >
                                                专家人工建议
                                            </Button>
                                        </div>
                                    </Flex>
                                    <WhiteSpace size={"lg"} />
                                </List.Item>
                            </List>
                        </Accordion.Panel>
                    </Accordion>
                    <WhiteSpace />
                </>
            ) : (
                <>
                    <Accordion defaultActiveKey="0"  className="card-accordion" onChange={this.onChange}>
                        <Accordion.Panel
                            key="0"
                            header={
                                <>
                                    <div className="omit omit-1">
                                        <strong>{policyMatch.customerName}</strong>
                                    </div>
                                    <WhiteSpace />
                                    <Flex align={"center"} style={{ height: 20 }}>
                                        <div className="schedule-box">
                                            <div className="schedule-bar" style={{ width: matchnum + "%" }} />
                                        </div>
                                        <Flex.Item className="text-left">
                                            {this.state.accordion !== 0 ? <span className="margin-left-xs highlight-color size-12">{matchnum}%</span> : ""}
                                        </Flex.Item>
                                    </Flex>
                                    <WhiteSpace />

                                    <Flex>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.dispatch("input", { showComputerResult: false });
                                                }}
                                                className="radius-button margin-right-xs"
                                                type={"ghost"}
                                                size={"small"}
                                            >
                                                继续完善信息
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (this.isAuth()) {
                                                        goToCompatibleWxmini(this, () => {
                                                            this.goTo(`create/zczx?ZCZT=人工咨询`);
                                                        })
                                                    } else {
                                                        if (!browser.versions.weChatMini) {
                                                            goToCompatibleWxmini(this, () => {
                                                                this.goTo("login");
                                                            })
                                                        } else {
                                                            wx["miniProgram"].redirectTo({url: '/apps-auth/login/login'})
                                                        }
                                                    }
                                                }}
                                                className="radius-button margin-right-xs"
                                                type={"ghost"}
                                                size={"small"}
                                            >
                                                专家人工建议
                                            </Button>
                                        </Flex>
                                </>
                            }
                        >

                        </Accordion.Panel>
                    </Accordion>
                    <WhiteSpace />
                </>);
        }
        renderPolicyComputerResult() {
            // 政策匹配

            return (
                <>
                    <div className="container container-fill container-column">
                        {this.renderPolicyComputerHeader()}
                        <div className="container container-fill container-body container-scrollable scroll-p">{this.renderPolicyMatchList()}</div>
                    </div>
                </>
            );
        }
        renderPolicyMatchList() {
            let { state } = this.props,
                { resultListSort = [], declareMode } = state as any;

            return (
                <>
                    {resultListSort.map((item, index) => {
                        return item.listarr.length ? (
                            <List renderHeader={item.name} className="list-card list-no-border" key={index}>
                                {item.listarr.map((itm, i) => {
                                    return (
                                        <List.Item
                                            wrap
                                            onClick={() => {
                                                goToCompatibleWxmini(this, () => {
                                                    this.goTo(`policyservicedetails/${itm.id}?matchDegree=${itm.matchDegree}`);
                                                })
                                            }}
                                            key={i}
                                        >
                                            <div className="omit omit-2 ">{itm.implementationDetailTitle}</div>
                                            <Flex className="size-14 gray-three-color mt10">
                                                <Flex.Item>
                                                    <span className="gray-three-color">扶持力度：</span>
                                                    {itm.cashTypeValue === CashTypeValueEnum.amountSubsidy ? (
                                                        <span className="highlight-color">最高{itm.amountSubsidy}万元</span>
                                                    ) : (
                                                        <span className="highlight-color">{itm.qualificationIdentification}</span>
                                                    )}
                                                </Flex.Item>
                                                {declareMode !== PolicyDeclareModeEnum.none && getPolicyDeadline(itm.declareStartTime, itm.declareEndTime)}
                                                {/* {itm.declareStartTime ? (
                                                    deadlineDays > 0 ? (
                                                        startDays >= 0 ? (
                                                            <div>
                                                                <span>
                                                                    剩<span className="color-red size-16">{Math.floor(deadlineHour / 24)}</span>天
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="gray-three-color">申报未启动</span>
                                                        )
                                                    ) : (
                                                        <span className="gray-three-color">申报已截止</span>
                                                    )
                                                ) : (
                                                    <span className="gray-three-color">申报未启动</span>
                                                )} */}
                                            </Flex>
                                            <div className="omit omit-1 size-14 gray-three-color mt5 match-rater">
                                                <span>匹配度：</span>
                                                <Rater total={5} rating={itm.matchDegree} />
                                            </div>
                                        </List.Item>
                                    );
                                })}
                            </List>
                        ) : null;
                    })}
                </>
            );
        }
        renderPolicyComputerBody() {
            let { state } = this.props,
                { showComputerResult, calculateTags = [], agreechecked } = state as any;
            return showComputerResult ? (
                this.renderPolicyComputerResult()
            ) : (
                <List className="list-body-card">
                    <List.Item wrap>
                        <Flex>
                            <i className="icon icon-zhishichanquan highlight-color" />
                            <Flex.Item>
                                <div className="omit omit-2 size-12">优惠政策与企业基本情况息息相关，信息越完善，适合您的优惠政策才会更多哦~</div>
                            </Flex.Item>
                        </Flex>
                    </List.Item>
                    {this.renderPolicyComputerDefault()}
                    {this.renderPolicyComputerCom()}
                    {this.showAllCompany < calculateTags.length && (
                        <List.Item>
                            <div
                                className="primary-color"
                                style={{ margin: "10px", textAlign: "center" }}
                                onClick={() => {
                                    // if (!this.showAllCompany) {
                                    //     this.showAllCompany = true;
                                    // } else if (!this.showAllPerson) {
                                    //     this.showAllPerson = true;
                                    // }
                                    this.showAllCompany = this.showAllCompany + 4;
                                    this.dispatch("input", { random: Math.random() });
                                }}
                            >
                                完善更多
                            </div>
                        </List.Item>
                    )}
                    <WhiteSpace />
                    <AgreeItem
                        data-seed="logId"
                        className="login-logid"
                        checked={agreechecked}
                        onChange={(e) => this.dispatch({ type: "input", data: { agreechecked: e.target.checked } })}
                    >
                        同步至我的政策订阅
                    </AgreeItem>
                </List>
            );
        }
        // 政策匹配表单
        change(type: number) {
            this.dispatch({ type: "input", data: { type: type, company: "", key: "" } });
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
        getPictureTip() {
            let { state } = this.props;

            if (state!.type === CertifyEnum.companyStaff) {
                return "请上传工作证/工牌扫描件";
            } else if (state!.type === CertifyEnum.admin) {
                return "请上传营业执照扫描件";
            }
        }
        selectCompany() {
            (document.activeElement as any)!.blur();
            const { state } = this.props;

            this.dispatch({ type: "input", data: { companyOpen: !state!.companyOpen } });
        }
        fileSuccess(_file, _data, _attachDataService) {
            this.dispatch({ type: "input", data: { files: [..._attachDataService!.files] } });
        }
        renderPolicyMatchingForm() {
            const { state } = this.props,
                companyOpen = state!.companyOpen,
                company = state!.company || {},
                account = state!.account || {},
                companyProps: any = {
                    isOpen: () => companyOpen,
                    close: () => {
                        this.selectCompany();
                    },
                    selectedcall: (data: any) => this.dispatch("input", { selectedCompany: data }),
                    confirmSelect: (data: any) => this.dispatch("input", { company: data, companyOpen: false }),
                    item: company,
                    onRef: () => {},
                };

            const parkName: any = getLocalStorage("parkName");
            return (
                <div>
                    <List className="list-body-card" renderHeader="第一步完善资料">
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
                            <div style={{ color: "#666" }}>
                                证明材料<span className="color-red">*</span>
                            </div>
                            <Picture.Component tableName={IParkBindTableNameEnum.certify} customType={1} uploadSuccess={this.fileSuccess.bind(this)} />
                            <span className="size-16" style={{ color: "#b9b9b9" }}>
                                {this.getPictureTip()}
                            </span>
                        </List.Item>
                    </List>
                    {this.renderEmbeddedView(SelectCompany.Page as any, { ref: "selectCompany", ...companyProps })}
                </div>
            );
        }
        // 认证通过界面
        passContent() {
            const { state } = this.props,
                member = state!.member;
            return (
                <Flex align={"center"} justify={"center"} className="height-full white-bg">
                    <div className={"pass-box"}>
                        <div className="pass-icon ">
                            <i className={"icon icon-duihao"} />
                        </div>
                        <div className="size-16 mt40 text">企业认证通过后，即可查看给出适合您的优惠政策啦，请耐心等待~</div>
                        <Button
                            onClick={() => {
                                goToCompatibleWxmini(this, () => {
                                    this.goTo(`certifyDetail/${member.id}`);
                                })
                            }}
                            style={{ width: 200 }}
                            className="radius-button mt20"
                            type={"primary"}
                        >
                            查看认证进度
                        </Button>
                    </div>
                </Flex>
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
                                    Toast.success("提交成功", 1, this.props.initData.bind(this));
                                    setEventWithLabel(statisticsEvent.submitCertificationInformation);
                                },
                            });
                        },
                    },
                ]
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

        render(): React.ReactNode {
            if (!this.isAuth()) {
                return (
                    <List className="list-body-card">
                        <div className="text-center pv50">
                            <ImageAuto.Component cutHeight="112.5px" cutWidth={"160.5px"} height={"112.5px"} width={"160.5px"} src={"assets/images/login.png"} />
                            <div className={"size-13 primary-color mv25"}>当前您还未登录,无法使用政策计算器</div>
                            <Flex justify={"center"}>
                                <Button
                                    size={"large"}
                                    style={{ width: 223 }}
                                    type={"primary"}
                                    className="radius-button mb75"
                                    onClick={() => {
                                        if (!browser.versions.weChatMini) {
                                            goToCompatibleWxmini(this, () => {
                                                this.goTo("login");
                                            })
                                        } else {
                                            wx["miniProgram"].redirectTo({url: '/apps-auth/login/login'})
                                        }
                                    }}
                                >
                                    {"去登录>>"}
                                </Button>
                            </Flex>
                        </div>
                    </List>
                );
            }
            // return <>{this.renderPolicyMatchingForm() }{this.renderFooter()}</>; // 未认证
            if (isNoCertify(this.props)) {
                return (
                    <div className="container container-fill container-column">
                        <div className="container container-fill container-body container-scrollable">{this.renderPolicyMatchingForm()}</div>
                        {this.renderFooter()}
                    </div>
                ); // 未认证
            } else if (isCertifyed(this.props)) {
                return (
                    <div className="container container-fill container-column ">
                        <div className="container container-fill container-body container-scrollable">{this.renderPolicyComputerBody()}</div>
                        {this.renderFooter()}
                    </div>
                );
            } else {
                return this.passContent();
            }
        }
        renderFooter(): React.ReactNode {
            let { state } = this.props,
                { showComputerResult } = state as any;
            return isNoCertify(this.props) ? (
                <Flex className="flex-collapse white">
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.confirmBtn();
                            }}
                        >
                            提交认证
                        </Button>
                    </Flex.Item>
                </Flex>
            ) : !showComputerResult ? (
                <Flex className="flex-collapse white">
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.dispatch({
                                    type: "policyMatchResult",
                                    callback: () => {
                                        Toast.success("匹配成功", 1, () => {
                                            this.dispatch("input", { showComputerResult: true });
                                            synchronousSerial(() => {
                                                $(".arrow").hide();
                                                $(".container-scrollable").on("scroll", this.scroll);
                                            }, 200)
                                        });
                                    },
                                });
                            }}
                        >
                            立即查看计算结果
                        </Button>
                    </Flex.Item>
                </Flex>
            ) : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policyservice]);
}
