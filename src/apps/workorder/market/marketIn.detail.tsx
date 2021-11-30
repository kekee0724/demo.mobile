import React from "react";
import "react-rater/lib/react-rater.css";
import { List, Steps, WhiteSpace, Popover, Tag, Tabs, InputItem, TextareaItem, Flex, Button, Toast } from "antd-mobile-v2";
import { template, formatDate, formatDateTime } from "@reco-m/core";
import { ImageAuto, HtmlContent, ViewComponent, Picture, NoData, gotoMap, setEventWithLabel } from "@reco-m/core-ui";
import { callTel, callEmail } from "@reco-m/ipark-common";
import { Namespaces, MyMarketinStatusEnum, marketInDetailModel } from "@reco-m/workorder-models";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { IParkBindTableNameEnum, ServiceSourceTextEnum } from "@reco-m/ipark-common";
import { PicturePreview } from "@reco-m/workorder-common";
import Swiper from "swiper/swiper-bundle.js";
const Step = Steps.Step;

export namespace MarketInDetail {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, marketInDetailModel.StateType {
        show?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.marketInDetail;
        bodyClass = "tabs-auto";
        scrollable = true;
        submitPage: any;
        swiper: any;
        pcadd: any;

        json: any = {};

        componentDidMount() {
            setEventWithLabel(statisticsEvent.marketInBrowse);
            this.dispatch({
                type: "initPage",
                callback: (personCommon) => {
                    this.loadAttach(personCommon.bindTableId);
                },
                errorcall: () => {
                    Toast.fail("机构信息不存在", 1, () => this.goBack());
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            if (nextProps.location !== this.props.location) {
                this.dispatch({
                    type: "getMarketInInit",
                    callback: (personCommon) => {
                        this.loadAttach(personCommon.bindTableId);
                    },
                    errorcall: () => {
                        Toast.fail("机构信息不存在", 1, () => this.goBack());
                    },
                });
            }
        }

        renderHeaderContent(): React.ReactNode {
            return "我的服务机构入驻";
        }
        getHeaderSteps(Order) {
            return [
                {
                    title: "提交申请",
                    description: (
                        <>
                            <div>{Order && formatDate(Order.inputTime)}</div>
                            <div>{Order && formatDateTime(Order.inputTime, "hh:mm:ss")}</div>
                        </>
                    ),
                },
                {
                    title: Order.status === MyMarketinStatusEnum.bounced ? "已退回" : "审批处理",
                    description:
                        Order.status === MyMarketinStatusEnum.bounced ? (
                            <>
                                <div>{Order && formatDate(Order.auditTime)}</div>
                                <div>{Order && formatDateTime(Order.auditTime, "hh:mm:ss")}</div>
                            </>
                        ) : (
                            <div>进行线下签约</div>
                        ),
                },
                {
                    title: "成功入驻",
                    description: Order.status === MyMarketinStatusEnum.pass && (
                        <>
                            <div>{Order && formatDate(Order.onServiceDate)}</div>
                            <div>{Order && formatDateTime(Order.onServiceDate, "hh:mm:ss")}</div>
                        </>
                    ),
                },
            ].map((s, i) => <Step key={i} title={s.title} description={s.description} />);
        }
        renderHeaderView(marketDetail: any): React.ReactNode {
            const { serviceInstitutionBasicFormVM: Order = {} } = marketDetail || {};
            let status = 1;
            if (Order.status === MyMarketinStatusEnum.pass) {
                status = 2;
            }
            let steps = this.getHeaderSteps(Order);

            return (
                Order && (
                    <List>
                        <List.Item wrap>
                            <WhiteSpace size="lg" />
                            <Steps current={status} direction="horizontal" size="small">
                                {steps}
                            </Steps>
                            <WhiteSpace />
                        </List.Item>
                    </List>
                )
            );
        }

        renderHeaderView2(detail: any): React.ReactNode {
            const { serviceInstitutionBasicFormVM: Order = {} } = detail || {};
            return (
                Order && (
                    <List>
                        <List.Item wrap>
                            <div className="market-pc">
                                <i className="icon icon-wancheng2 size-16" />
                                恭喜您，已于<span>{`${formatDateTime(Order.onServiceDate)}`}</span>通过平台审核！
                            </div>
                        </List.Item>
                    </List>
                )
            );
        }

        renderInputItem(placeholder: string, type: any, name: string, value: string, must?: Boolean): React.ReactNode {
            return (
                <InputItem
                    type={type}
                    value={value}
                    editable={false}
                    onChange={(e) =>
                        this.dispatch({
                            type: "input",
                            data: {
                                [name]: e,
                                isEdit: true,
                            },
                        })
                    }
                >
                    {placeholder}
                    {must && <span className="color-red">*</span>}
                </InputItem>
            );
        }

        renderBasicInfo(): React.ReactNode {
            const { state } = this.props,
                marketDetail = state!.marketDetail;
            const { serviceInstitutionBasicFormVM: insBasic = {}, contactPersonalCommonVM: perCommon = {} } = marketDetail || {};
            return (
                <List renderHeader={"基本信息"} className="my-list invoice">
                    {this.renderInputItem("机构名称", "text", "organizationName", insBasic!.institutionName || "", true) || null}
                    {this.renderInputItem("服务类别", "text", "serviceCatalogueNames", state!.serviceCatalogueNames || "", true) || null}

                    {this.renderInputItem("机构地址", "text", "address", perCommon!.address || "", true) || null}
                    {this.renderInputItem("联系人", "text", "contactPerson", perCommon!.fullName || "", true) || null}
                    {this.renderInputItem("手机号码", "number", "mobile", perCommon!.mobile || "", true) || null}
                    {this.renderInputItem("成立时间", "text", "registDate", insBasic.setupDate ? formatDate(insBasic.setupDate) : "") || null}
                    {this.renderInputItem("统一信用码", "text", "businessCode", insBasic!.creditCode || "") || null}
                    {this.renderInputItem("电子邮箱", "text", "email", perCommon!.email || "") || null}
                    {this.renderInputItem("固定电话", "number", "tel", perCommon!.tel || "") || null}
                    <List.Item>
                        机构logo<span className="color-red">*</span>
                        <Picture.Component tableName={IParkBindTableNameEnum.institution} customType={1} readonly={true} />
                    </List.Item>
                    <div>
                        <div className="ph15 pv10 size-16">
                            机构介绍<span className="color-red">*</span>
                        </div>
                        <TextareaItem data-seed="logId" name="description" autoHeight rows={3} value={insBasic.detail} editable={false} />
                    </div>
                </List>
            );
        }

        renderBackReason(text: any): React.ReactNode {
            return (
                <List className="border-none" renderHeader="退回原因：">
                    <TextareaItem data-seed="logId" name="description" autoHeight rows={2} value={text} editable={false} />
                </List>
            );
        }

        renderApplyInfo(): React.ReactNode {
            const { state } = this.props,
                marketDetail = state!.marketDetail;
            const { serviceInstitutionBasicFormVM: insBasic = {} } = marketDetail || {};

            return (
                <List renderHeader={"资质信息"} className="my-list invoice">
                    <div>
                        <div className="ph15 pv10 size-16">
                            服务案例<span className="color-red">*</span>
                        </div>
                        <TextareaItem data-seed="logId" name="description" autoHeight rows={3} value={insBasic.serviceCase} editable={false} />
                    </div>

                    <List.Item>
                        案例附件<span className="color-red">*</span>
                        <Picture.Component tableName="bi_service_institution" customType={2} readonly={true} />
                    </List.Item>
                    <List.Item>
                        机构资质<span className="color-red">*</span>
                        <Picture.Component tableName="bi_service_institution" customType={3} readonly={true} />
                    </List.Item>
                    {(insBasic.status === MyMarketinStatusEnum.bounced && this.renderBackReason(insBasic.returnReason)) || null}
                </List>
            );
        }

        /**
         * 表单部分
         */
        renderForm(): React.ReactNode {
            return (
                <div>
                    {this.renderBasicInfo()}
                    {this.renderApplyInfo()}
                </div>
            );
        }

        renderOrderBody(): React.ReactNode {
            const isOrderView = this.props.state!.isOrderView;
            return !isOrderView ? (
                <div
                    className="check-more"
                    onClick={() => {
                        this.dispatch({ type: "input", data: { isOrderView: !isOrderView } });
                    }}
                >
                    展开工单详情
                    <i className="icon icon-sanjiao" />
                </div>
            ) : (
                <>
                    {this.renderForm()}
                    <div
                        className="check-more"
                        onClick={() => {
                            this.dispatch({ type: "input", data: { isOrderView: !isOrderView } });
                        }}
                    >
                        收起工单详情
                        <i className="icon icon-sanjiao" />
                    </div>
                </>
            );
        }

        // 标签
        renderLabelPop(policyDetails: any): React.ReactNode {
            const { state } = this.props,
                tagShow = state!.tagShow;
            return policyDetails && policyDetails.length > 2 ? (
                <Popover
                    visible={tagShow}
                    placement="bottomLeft"
                    overlay={
                        <div className="padding-sm container-scrollable">
                            {" "}
                            <Flex align={"center"} className="margin-bottom-xs">
                                <Flex.Item>
                                    {policyDetails.length > 0 &&
                                        policyDetails.slice(2).map((tag, index) => {
                                            return (
                                                <Tag key={index} small className="margin-right-xs tag-big">
                                                    {tag.serviceCategory}
                                                </Tag>
                                            );
                                        })}
                                </Flex.Item>
                            </Flex>
                        </div>
                    }
                    onVisibleChange={() => this.dispatch({ type: "input", data: { tagShow: !tagShow } })}
                >
                    <span className={tagShow === true ? "pull-up on" : "pull-up"}>
                        <i className="icon icon-xia size-12" />
                    </span>
                </Popover>
            ) : (
                ""
            );
        }
        renderlabelTag(policyDetails): React.ReactNode {
            return (
                policyDetails &&
                policyDetails.length > 0 &&
                policyDetails.map((_, k) => {
                    return (
                        <span key={k}>
                            <Tag small className="margin-right-xs tag-big margin-bottom-xs">
                                {policyDetails[k].serviceCategory}
                            </Tag>
                        </span>
                    );
                })
            );
        }
        renderLabel(policyDetails: any): React.ReactNode {
            return (
                <span>
                    {this.renderLabelPop(policyDetails)}
                    <div className="pull-left" style={{ whiteSpace: "pre-wrap" }}>
                        {this.renderlabelTag(policyDetails)}
                    </div>
                </span>
            );
        }

        // 我的机构
        renderMarketDetailTopView(detail: any): React.ReactNode {
            const { serviceInstitutionBasicFormVM: insBasic = {}, serviceInstitutionCategoryDetailVMList: category = {} } = detail || {};

            return (
                detail && (
                    <List renderHeader="我的机构">
                        <List.Item
                            className="service-style-song"
                            align="top"
                            thumb={
                                <ImageAuto.Component
                                    cutWidth="104"
                                    cutHeight="91"
                                    src={insBasic.pictureUrlList && insBasic.pictureUrlList[0]}
                                    width="25vw"
                                    height="22vw"
                                    radius="8px"
                                    className="margin-v"
                                />
                            }
                            multipleLine
                        >
                            <div className="size-18 omit omit-1 omit-flex w100">{insBasic.institutionName}</div>
                            {this.renderLabel(category)}
                        </List.Item>
                    </List>
                )
            );
        }

        /**
         * 去地图
         */
        goMap(address: string, OrganizationName: string) {
            address && gotoMap(OrganizationName, address);
        }

        // 联系信息
        renderMarketDetailContactView(detail: any): React.ReactNode {
            const { contactPersonalCommonVM: contactPersonal = {} } = detail || {};
            return (
                <List>
                    <List.Item>
                        <span className="size-14">
                            <span> 联系人：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            <span className="color-qs">{contactPersonal.fullName}</span>
                        </span>
                    </List.Item>
                    <List.Item>
                        <span className="size-14">
                            <span style={{ marginLeft: "-1px" }}> 手机号码：&nbsp;</span>
                            <a className="color-qs" onClick={() => callTel(contactPersonal.mobile)}>
                                {contactPersonal.mobile}
                            </a>
                        </span>
                    </List.Item>
                    <List.Item>
                        <span className="size-14">
                            <span style={{ marginLeft: "-1px" }}> 固定电话：&nbsp;</span>
                            <a className="color-qs" onClick={() => callTel(contactPersonal.tel)}>
                                {contactPersonal.tel}
                            </a>
                        </span>
                    </List.Item>
                    <List.Item>
                        <div className="am-list-brief">
                            <span className="map-addressstyle">
                                <span className="address-componystyle address-companywidth">
                                    <span> 公司邮箱：&nbsp;</span>
                                    <a
                                        className="color-qs"
                                        style={{ whiteSpace: "pre-wrap" }}
                                        onClick={() => {
                                            callEmail(contactPersonal.email);
                                        }}
                                    >
                                        {contactPersonal.email}
                                    </a>
                                </span>
                            </span>
                        </div>
                    </List.Item>
                </List>
            );
        }

        // 服务介绍
        renderMarketDetailSummaryView(detail: any): React.ReactNode {
            return (
                <HtmlContent.Component
                    className="html-details padding-h"
                    html={
                        detail.serviceInstitutionBasicFormVM.detail &&
                        detail.serviceInstitutionBasicFormVM.detail.replace(/href=\"\/\//g, 'href="http://').replace(/src=\"\/\//g, 'src=" http://')
                    }
                />
            );
        }

        onImageClick(imgs: any, index: number) {
            if (imgs[0]) {
                this.dispatch({ type: "input", data: { openImg: true, imgs: imgs } });

                setTimeout(() => {
                    this.swiper = new Swiper(".swiper-container", {
                        initialSlide: index,
                        zoom: true,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        pagination: {
                            el: ".swiper-pagination",
                        },
                    });
                }, 100);
            }
        }

        // 机构资质
        renderImages(pic): React.ReactNode {
            return (
                pic &&
                pic.map((item, i) => {
                    return (
                        <div className="padding" key={i} onClick={() => this.onImageClick(pic, i)}>
                            <ImageAuto.Component cutWidth="384" cutHeight="233" key={i} radius="6px" src={item.filePath} />
                            <div className="padding-top-sm">{item.fileName && item.fileName.split(".png")[0].split(".jpg")[0]}</div>
                        </div>
                    );
                })
            );
        }

        // 注册信息
        renderRegistration(detail: any): React.ReactNode {
            const { serviceInstitutionBasicFormVM: insBasic = {} } = detail || {};
            const { state } = this.props,
                pictureData2 = state!.pictureData2;

            return (
                <List>
                    <List.Item>
                        <span className="size-14">
                            <span> 成立时间：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            <span className="color-qs">{formatDate(insBasic.setupDate)}</span>
                        </span>
                    </List.Item>
                    <List.Item>
                        <span className="size-14">
                            <span style={{ marginLeft: "-1px" }}> 统一信用代码：&nbsp;</span>
                            <span className="color-qs">{insBasic.creditCode}</span>
                        </span>
                    </List.Item>
                    <List.Item>
                        <span className="size-14">
                            <span> 案例附件：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            {this.renderImages(pictureData2)}
                        </span>
                    </List.Item>
                </List>
            );
        }

        renderTabChange(): React.ReactNode {
            const { state } = this.props,
                pictureData = state!.pictureData,
                detail = state!.marketDetail;
            const tabs = [{ title: "机构详情" }, { title: "联系信息" }, { title: "机构资质" }, { title: "注册信息" }];
            return (
                <div className="integral-tabs">
                    <Tabs tabs={tabs} initialPage={0} swipeable={false}>
                        <div>
                            {detail && detail.serviceInstitutionBasicFormVM && detail.serviceInstitutionBasicFormVM.detail && detail.serviceInstitutionBasicFormVM.detail.length ? (
                                this.renderMarketDetailSummaryView(detail)
                            ) : (
                                <NoData.Component />
                            )}
                        </div>
                        <div>{detail ? this.renderMarketDetailContactView(detail) : <NoData.Component />}</div>
                        <div>{pictureData && pictureData.length ? this.renderImages(pictureData) : <NoData.Component />}</div>
                        <div>{detail ? this.renderRegistration(detail) : <NoData.Component />}</div>
                    </Tabs>
                    <PicturePreview.Component openImg={state!.openImg} imgs={state!.imgs || []} changeState={this.dispatch.bind(this)} />
                </div>
            );
        }

        renderMarketDetailView(): React.ReactNode {
            const { state } = this.props,
                marketDetail = state!.marketDetail;
            return (
                marketDetail && (
                    <div>
                        {this.renderMarketDetailTopView(marketDetail)}
                        <WhiteSpace className="back" />
                        {this.renderTabChange()}
                        <WhiteSpace />
                    </div>
                )
            );
        }

        renderFinishBody(): React.ReactNode {
            return <div>{this.renderMarketDetailView()}</div>;
        }

        getOrderInfo() {
            const { state } = this.props,
                applyDetailData = state!.applyDetailData,
                { Order = {} } = applyDetailData || {};
            return Order;
        }

        refScroll(el) {
            $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $("#nav_box_Shadow").css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
            });
        }

        renderHeaderRight(): React.ReactNode {
            const { state } = this.props,
                marketDetail = state!.marketDetail;
                const { serviceInstitutionBasicFormVM: Order = {} } = marketDetail || {};

            return Order.status === MyMarketinStatusEnum.pass && (
                <div className="flex-center">
                    <i
                        className="icon icon-qiandao"
                        onClick={() => {
                            this.resubmit();
                        }}
                    />
                </div>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                marketDetail = state!.marketDetail,
                serviceInstitutionBasicFormVM = marketDetail ? marketDetail.serviceInstitutionBasicFormVM : {};
            return serviceInstitutionBasicFormVM && serviceInstitutionBasicFormVM.clientSource !== ServiceSourceTextEnum.pc ? (
                <>
                    {marketDetail && this.renderHeaderView(marketDetail)}
                    {serviceInstitutionBasicFormVM.status !== MyMarketinStatusEnum.pass && this.renderOrderBody()}
                    {serviceInstitutionBasicFormVM.status === MyMarketinStatusEnum.pass && this.renderFinishBody()}
                </>
            ) : (
                <>
                    {marketDetail && this.renderHeaderView2(marketDetail)}
                    {marketDetail && this.renderFinishBody()}
                </>
            );
        }

        resubmit() {
            const { state } = this.props,
                marketDetail = state!.marketDetail;
            const { serviceInstitutionBasicFormVM: insBasic = {} } = marketDetail || {};
            this.goTo(`marketUpdataIn/${insBasic.companyId}/isupdate`);
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                marketDetail = state!.marketDetail;
            const { serviceInstitutionBasicFormVM: insBasic = {} } = marketDetail || {};
            return insBasic.status === MyMarketinStatusEnum.bounced ? (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button type="primary" onClick={() => this.resubmit()}>
                            重新提交
                        </Button>
                    </Flex.Item>
                </Flex>
            ) : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.marketInDetail]);
}
