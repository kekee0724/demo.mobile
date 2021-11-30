import React from "react";
import ReactDOM from "react-dom";
import { List, Flex, WingBlank, Drawer, Tag, Icon, Modal } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";

import { ListComponent, Container, ImageAuto, setEventWithLabel, Loading, androidExit, popstateHandler } from "@reco-m/core-ui";

import { callTel } from "@reco-m/ipark-common";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, MarketTypeEnum, MyMarketinStatusEnum, marketModel, MarketTagIdEnum, ServiceInstitutionAcceptanceModeEnum } from "@reco-m/workorder-models";
import { CertifyStatusEnum, MemberTypeEnum } from "@reco-m/member-models";
import { CertifyEnum } from "@reco-m/ipark-common";

let modal;
export namespace Market {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> { }

    export interface IState extends ListComponent.IState, marketModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        headerContent = "服务集市";
        namespace = Namespaces.market;
        scrollable = false;
        bodyClass = "container-height";
        showloading = false;
        key = "";
        time;

        componentDidMount() {
            let tagId = +this.props.match!.params.tagId as any;

            if (tagId === MarketTagIdEnum.companyRegistered) {
                setEventWithLabel(statisticsEvent.marketCompanyRegistered);
            } else if (tagId === MarketTagIdEnum.fiscalTaxationService) {
                setEventWithLabel(statisticsEvent.marketFiscalTaxationService);
            } else if (tagId === MarketTagIdEnum.legalServices) {
                setEventWithLabel(statisticsEvent.marketLegalServices);
            } else if (tagId === MarketTagIdEnum.manpowerTraining) {
                setEventWithLabel(statisticsEvent.marketManpowerTraining);
            } else if (tagId === MarketTagIdEnum.itServices) {
                setEventWithLabel(statisticsEvent.marketITservices);
            } else if (tagId === MarketTagIdEnum.brandCreativity) {
                setEventWithLabel(statisticsEvent.marketBrandCreativity);
            } else if (tagId === MarketTagIdEnum.intellectualPropertyRights) {
                setEventWithLabel(statisticsEvent.marketIntellPropertyRight);
            } else if (tagId === MarketTagIdEnum.other) {
                setEventWithLabel(statisticsEvent.marketOther);
            } else {
                tagId = null;
            }
            this.key = this.getSearchParam("key")!;

            this.dispatch({ type: `initPage`, data: { tagId, key: this.key, isAuth: this.isAuth() } });
        }

        /**
         * 请求列表
         */
        getDataList(index?: number, serviceCategoryValue?: string) {
            this.dispatch({
                type: "getInstitutionList",
                data: {
                    pageIndex: index,
                    status: 1,
                    key: this.key,
                    pageSize: 15,
                    parkId: getLocalStorage("parkId"),
                    orderBy: "inputTime desc",
                    isConfirmed: true,
                    serviceCategoryValue: serviceCategoryValue ? serviceCategoryValue : null,
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);

            if (nextProps.location !== this.props.location) {
                this.isAuth() && this.dispatch({ type: "getInstitytionMode" });
                this.getListData(1);
            }
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        gotoDetail(id: number) {
            if (this.isAuth()) {
                this.goTo(`detail/${id}/${this.props.match!.params.tagId}`);
            } else {
                this.goTo("login");
            }
        }

        renderOneItemContent(institution: any): React.ReactNode {
            let Content = institution.institutionDetail && institution.institutionDetail.replace(/<\/?.+?\/?>/g, ""),
                subContent = Content ? Content.substring(0, 50) : "";
            return (
                <>
                    <div className="omit omit-1 omit-flex  flex-service-clim">{institution.institutionName}</div>
                    {subContent && <div className="omit omit-3 size-14 gray-three-color margin-top-xs">{subContent}</div>}
                    <div className="size-12 flex-service-sub iteam-man margin-top-xs">
                        <Flex alignContent="center">
                            <Flex.Item className="omit omit-1 omit-flex margin-right-sm">
                                <a
                                    className="no-nowrap"
                                    onClick={(e) => {
                                        callTel(institution.mobile);
                                        e.stopPropagation();
                                    }}
                                >
                                    <i className="icon icon-newpel margin-right-xs size-12" />
                                    {institution.contactPerson} | {institution.mobile}
                                </a>
                            </Flex.Item>
                            <div className="pull-right">
                                <Tag small className="tag-big">
                                    {institution.applyNumber ? institution.applyNumber : 0}人申请
                                </Tag>
                            </div>
                        </Flex>
                    </div>
                </>
            );
        }

        renderItemsContent(institution: any): React.ReactNode {
            let picurl = institution.pictureUrlList && institution.pictureUrlList[0];
            return (
                <List.Item onClick={this.gotoDetail.bind(this, institution.id)} extra={<div />} align="top" wrap multipleLine>
                    <Flex align={"start"}>
                        <ImageAuto.Component cutWidth="104" cutHeight="91" src={picurl ? picurl : ""} width="25vw" height="20vw" radius="8px" />
                        <Flex.Item>{this.renderOneItemContent(institution)}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }

        /**
         * 下拉与刷新公共
         */
        getListData(pageIndex: number) {
            const { state } = this.props,
                csfwId = state!.csfwId;
            this.getDataList(pageIndex, csfwId);
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getListData(1);
        }

        /**
         * 上拉加载
         */
        onEndReached() {
            const { state } = this.props;
            this.getListData((state!.currentPage || 0) + 1);
        }

        /**
         * tab选项
         */
        search(clicktype: number) {
            const { state } = this.props,
                show = state!.show,
                type = state!.type,
                tags = state!.tags;
            if (clicktype === MarketTypeEnum.serviceType) {
                setEventWithLabel(statisticsEvent.marketServiceTypeFiltering);
            } else if (clicktype === MarketTypeEnum.serviceCity) {
                setEventWithLabel(statisticsEvent.marketServiceCitySelection);
            } else if (clicktype === MarketTypeEnum.intelligenceSort) {
                setEventWithLabel(statisticsEvent.marketIntelligentAortFiltering);
            }
            clicktype === type
                ? this.dispatch({
                    type: "input",
                    data: { type: clicktype, show: !show },
                })
                : this.dispatch({
                    type: "input",
                    data: { type: clicktype, show: true },
                });
            // 组合标签
            this.dispatch({ type: "groupTag", data: { type: clicktype, tags: tags } });
        }

        renderOneTab(title: string, marketType: number): React.ReactNode {
            const { state } = this.props,
                show = state!.show,
                type = state!.type;

            return (
                <Flex.Item onClick={this.search.bind(this, marketType)}>
                    <span className={type === marketType && show === true ? "active" : undefined}>
                        {title} <i className="icon icon-xia" />
                    </span>
                </Flex.Item>
            );
        }

        onOpenChange = () => {
            const { state } = this.props,
                openChange = state!.open;
            this.dispatch({ type: "input", data: { open: !openChange } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { open: false } });
            androidExit(!openChange, callback);
        };

        renderTabsItem(): React.ReactNode {
            const { state } = this.props,
                tags = state!.tags,
                csfwId = state!.csfwId;

            return tags ? tags.map((item, i) => {
                return (
                    <div
                        key={i}
                        className={csfwId + "" === item.tagValue + "" ? "row active" : "row"}
                        onClick={() => {
                            this.dispatch({ type: "input", data: { csfwId: item.tagValue } });
                            this.getDataList(1, item.tagValue);
                        }}
                    >
                        {item.tagName}
                    </div>
                );
            })
                : null;
        }

        tabsScroll(e) {
            clearTimeout(this.time);
            this.time = setTimeout(() => {
                $(e).animate({ scrollLeft: $(e).find(".active").length && ($(e).scrollLeft() || 0) + $(e).find(".active").position().left }, 200);
            }, 300);
        }

        renderTabs(): React.ReactNode {
            const { state } = this.props,
                csfwId = state!.csfwId;
            return (
                <div className="tag-list">
                    <Flex>
                        <Flex.Item>
                            <div
                                className="service-type-list"
                                onTouchStart={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                                onTouchEnd={(e) => e.stopPropagation()}
                                ref={(el) => this.tabsScroll(el)}
                            >
                                <div
                                    className={csfwId + "" === "" ? "row active" : "row"}
                                    onClick={() => {
                                        this.dispatch({ type: "input", data: { csfwId: "" } });
                                        this.getDataList(1, "");
                                    }}
                                >
                                    全部
                                </div>
                                {this.renderTabsItem()}
                            </div>
                        </Flex.Item>
                        <div className="more">
                            <a onClick={this.onOpenChange}>
                                <i className="icon icon-newsever" />
                            </a>
                        </div>
                    </Flex>
                </div>
            );
        }

        renderHeaderRight(): React.ReactNode {
            const { state } = this.props,
                csfwId = state!.csfwId;
            return (
                <div
                    className="search-top"
                    onClick={() => {
                        this.goTo({
                            pathname: `search`,
                            state: csfwId,
                        });
                    }}
                >
                    <Icon type="search" style={{ color: "black" }} />
                </div>
            );
        }

        renderHeader(): React.ReactNode {
            return (
                <>
                    {super.renderHeader()}
                    {this.renderTabs()}
                </>
            );
        }

        /**
         * 渲染服务集市列表Items
         */
        renderBody(): React.ReactNode {
            const { state } = this.props;
            return state!.refreshing !== false ? <Loading.Component showback={true} content={this.showloadingContent} /> : this.getListView();
        }

        renderTabsItemTag(): React.ReactNode {
            const { state } = this.props,
                tags = state!.tags,
                csfwId = state!.csfwId;
            return tags
                ? tags.map((item, i) => {
                    return (
                        <div
                            key={i}
                            className="row"
                            onClick={() => {
                                setEventWithLabel(statisticsEvent.marketServiceTypeFiltering);
                                this.dispatch({ type: "input", data: { csfwId: item.tagValue } });
                                this.getDataList(1, item.tagValue);
                            }}
                        >
                            <Tag selected={csfwId + "" === item.tagValue + ""}>{item.tagName}</Tag>
                        </div>
                    );
                })
                : null;
        }

        renderSideBar(): React.ReactNode {
            const { state } = this.props,
                csfwId = state!.csfwId;
            return (
                <div className="market-tag-box">
                    <Container.Component fill direction={"column"}>
                        <WingBlank className="iphonex-top">
                            <div className="size-18 drawer-title">
                                服务类别 <i className="icon icon-guanbi pull-right" onClick={this.onOpenChange} />
                            </div>
                            <Container.Component fill>
                                <div className="search-tag" onClick={this.onOpenChange}>
                                    <div
                                        className="row"
                                        onClick={() => {
                                            setEventWithLabel(statisticsEvent.marketServiceTypeFiltering);
                                            this.dispatch({ type: "input", data: { csfwId: "" } });
                                            this.getDataList(1, "");
                                        }}
                                    >
                                        <Tag selected={csfwId + "" === ""}>全部</Tag>
                                    </div>
                                    {this.renderTabsItemTag()}
                                </div>
                            </Container.Component>
                        </WingBlank>
                    </Container.Component>
                </div>
            );
        }

        // 成为服务商 按钮
        serviceProvicer(member) {
            const { state } = this.props,
                marketDetail = state!.marketDetail,
                serviceInstitutionBasicFormVM = (marketDetail && marketDetail.serviceInstitutionBasicFormVM) || {};
            if (
                (
                    serviceInstitutionBasicFormVM.status === MyMarketinStatusEnum.wait ||
                    serviceInstitutionBasicFormVM.status === MyMarketinStatusEnum.pass ||
                    serviceInstitutionBasicFormVM.status === MyMarketinStatusEnum.bounced
                )
            ) {
                // 已提交表单
                this.goTo(`marketInDetail`);
            } else {
                popstateHandler.popstateListener(() => {
                    modal.close();
                  });
                modal = Modal.alert(
                    "操作提示",
                    <div style={{ textAlign: "left", fontSize: "14px" }}>
                        是否关联您当前已认证的企业？
                        <div>关联后，认证企业的成立时间和联系人信息将自动带入，提交申请的机构信息将和企业绑定关系~</div>
                    </div>,
                    [
                        {
                            text: "不关联",
                            onPress: () => {
                                popstateHandler.removePopstateListener().then(() => {
                                    this.goTo("marketIn/0");
                                });
                            },
                        },
                        {
                            text: "关联",
                            onPress: () => {
                                popstateHandler.removePopstateListener().then(() => {
                                    this.goTo(`marketIn/${member.companyId}`);
                                });
                            },
                        },
                        {
                            text: "关闭",
                            onPress: () => {
                                popstateHandler.removePopstateListener().then(() => {
                                    modal.close();
                                });
                            },
                        },
                    ]
                );
            }
        }

        isVisitorCertify(permission: any) {
            for (let i = 0; i < permission.length; i++) {
                if (permission[i].id === CertifyEnum.businessAdmin || permission[i].id === CertifyEnum.admin) {
                    return true;
                }
            }
            return false;
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                currentMember = state!.member,
                institutionMode = state!.institutionMode;

            if (institutionMode === ServiceInstitutionAcceptanceModeEnum.institution && currentMember) {
                if (currentMember.companyUserTypeName === MemberTypeEnum.admin && currentMember.status === CertifyStatusEnum.allow) {
                    return (
                        <div className="tag-footer" onClick={() => this.serviceProvicer(currentMember)}>
                            <i className="add-icon"></i>
                            <span>成为服务商</span>
                        </div>
                    );
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        scrollRef(e) {
            $(e)
                .find(".am-list-view-scrollview")
                .on("scroll", function () {
                    const top = $(this).scrollTop() || 0;
                    $(this).parents(".container-page").find(".tag-list #nav_box_Shadow").length <= 0 &&
                        $(this).parents(".container-page").find(".tag-list").append('<span id="nav_box_Shadow"></span>');
                    $(this)
                        .parents(".container-page")
                        .find(".tag-list #nav_box_Shadow")
                        .css({
                            background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1
                                }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                        });
                    $(".tag-footer").css({ opacity: 1 - top * 0.01 <= 1 ? 1 - top * 0.01 : 1 });
                });
        }

        render(): React.ReactNode {
            const sidebar = this.renderSideBar();
            const { state } = this.props;

            return (
                <Drawer className="market-drawer" sidebar={sidebar} open={state!.open} onOpenChange={this.onOpenChange} position="right" style={{ width: "100%" }}>
                    <Container.Component direction={"column"}>
                        {this.renderHeader()}
                        <Container.Component fill className="container-hidden" ref={(e) => this.scrollRef(ReactDOM.findDOMNode(e))}>
                            {this.renderBody()}
                        </Container.Component>
                        {/*管理员才能看到*/}
                        {this.renderFooter()}
                    </Container.Component>
                </Drawer>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.market]);
}
