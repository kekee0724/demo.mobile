import React from "react";

import { Badge, List, Flex, Menu, Icon, Toast, NavBar } from "antd-mobile-v2";

import { template, browser, getLocalStorage } from "@reco-m/core";

import { ListComponent, ImageAuto, setEventWithLabel, androidExit } from "@reco-m/core-ui";

import { Namespaces, MarketTypeEnum, productModel, MarketTagIdEnum } from "@reco-m/workorder-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace Product {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, productModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        showloading = true;
        headerContent = "服务产品";
        namespace = Namespaces.product;
        bodyClass = "container-height";

        key = "";

        componentDidMount() {
            let tagId: any = +this.props.match!.params.tagId;

            if (tagId === MarketTagIdEnum.companyRegistered) {
                setEventWithLabel(statisticsEvent.productCompanyRegistered);
            } else if (tagId === MarketTagIdEnum.fiscalTaxationService) {
                setEventWithLabel(statisticsEvent.productFiscalTaxationService);
            } else if (tagId === MarketTagIdEnum.legalServices) {
                setEventWithLabel(statisticsEvent.productLegalServices);
            } else if (tagId === MarketTagIdEnum.manpowerTraining) {
                setEventWithLabel(statisticsEvent.productManpowerTraining);
            } else if (tagId === MarketTagIdEnum.itServices) {
                setEventWithLabel(statisticsEvent.productITservices);
            } else if (tagId === MarketTagIdEnum.brandCreativity) {
                setEventWithLabel(statisticsEvent.productBrandCreativity);
            } else if (tagId === MarketTagIdEnum.intellectualPropertyRights) {
                setEventWithLabel(statisticsEvent.productIntellectualPropertyRights);
            } else if (tagId === MarketTagIdEnum.other) {
                setEventWithLabel(statisticsEvent.productOther);
            } else {
                tagId = null;
            }
            this.key = this.getSearchParam("key")!;

            this.dispatch({
                type: `initPage`,
                data: {
                    tagId,
                    key: this.key,
                },
            });
            if (!this.key) {
                setTimeout(() => {
                    this.onChange(MarketTypeEnum.serviceType, null, "", [`${tagId}`], true);
                }, 500);
            }
        }

        /**
         * 请求列表
         */
        getDataList(index?: number, catalogueIDs?: string, orderBy?: string, sflxid?: any) {
            this.dispatch({
                type: "getProductList",
                data: {
                    pageIndex: index,
                    serviceCategoryValue: catalogueIDs || undefined,
                    chargeModeValue: sflxid !== 0 ? sflxid : "",
                    orderBy: orderBy,
                    pageSize: 15,
                    key: this.key,
                    parkId: getLocalStorage("parkId"),
                    isOnService: true,
                },
            });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            this.shouldUpdateData(nextProps.state);

            nextProps.location !== this.props.location && this.getListData(1);
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        gotoDetail(id: number) {
            if (this.isAuth()) {
                this.goTo(`productdetail/${id}`);
            } else {
                this.goTo("login");
            }
        }

        renderOneItemContent(item: any): React.ReactNode {
            return (
                <>
                    <div className="omit omit-1  flex-service-clim">{item.serviceName}</div>
                    <div className="color-orange click-color-orange">
                        {item.serviceCategory &&
                            item.serviceCategory.split(",").map((item, i) => {
                                if (i < 3) {
                                    return <Badge text={item} key={i} className="badge-box" />;
                                }
                            })}
                    </div>
                    <div className="gray-three-color size-14 margin-top-xs flex-service-sub">
                        <div className="omit omit-1 margin-right-sm">
                            {+item.chargeModeValue === MarketTypeEnum.chargFree
                                ? "免费"
                                : +item.chargeModeValue === MarketTypeEnum.chargDiscuss
                                ? "面议"
                                : `${item.chargeMinPrice}-${item.chargeMaxPrice}${item.chargeUnit}`}
                        </div>
                    </div>
                </>
            );
        }

        renderItemsContent(institution: any): React.ReactNode {
            let picurl = institution.pictureUrlList && institution.pictureUrlList[0];
            return (
                <List.Item
                    onClick={() => {
                        this.gotoDetail(institution.id);
                    }}
                    extra={<div />}
                    align="top"
                    multipleLine
                >
                    <Flex align={"start"}>
                        <ImageAuto.Component cutWidth="124" cutHeight="91" src={picurl ? picurl : ""} width="30vw" height="22vw" radius="8px" />
                        <Flex.Item>{this.renderOneItemContent(institution)}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }
        /**
         * 点击标签筛选信息
         */
        onChange(type: number, csfwId: any, sflxid: any, value: any, isInit = false) {
            const { state } = this.props;

            !isInit && this.onOpenChange(!state!.show);
            // tab选项切换筛选
            this.dispatch({
                type: "changeProductTabState",
                data: {
                    csfwId: csfwId,
                    type: type,
                    value: value,
                    sflxid: sflxid,
                },
                key: this.key,
                errorcall: (e) => {
                    Toast.fail(e);
                },
            });

            // 切换时改变Tab的title
            this.dispatch({
                type: "changeProductTabTitle",
                data: {
                    type: type,
                    csfwId: csfwId,
                    typeTitle: state!.typeTitle,
                    cityTitle: state!.cityTitle,
                    sortTitle: state!.sortTitle,
                    chargeTitle: state!.chargeTitle,
                    tags: state!.tags,
                    value: value,
                    sflxid: sflxid,
                },
            });
        }

        /**
         * 标签选项
         */
        renderMenu(): React.ReactNode {
            const { state } = this.props,
                type = state!.type,
                csfwId = state!.csfwId,
                sflxid = state!.sflxid,
                orderById = state!.orderById,
                groupTag = state!.groupTag;
            let value = type === MarketTypeEnum.serviceType ? csfwId : type === MarketTypeEnum.intelligenceSort ? orderById : sflxid;

            return (
                <Menu
                    className="animated-fast slideInDown"
                    data={groupTag}
                    value={[value]}
                    onChange={this.onChange.bind(this, type, csfwId, sflxid)}
                    level={1}
                    height={document.documentElement!.clientHeight / 1.6}
                />
            );
        }

        /**
         * 下拉与刷新公共
         */
        getListData(pageIndex: number) {
            const { state } = this.props,
                csfwId = state!.csfwId,
                sflxid = state!.sflxid,
                orderBy = state!.orderBy;

            this.getDataList(pageIndex, csfwId, orderBy, sflxid);
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
        onOpenChange = (bool: boolean) => {
            this.dispatch({ type: "input", data: { show: bool } });
            // 解决android返回
            const callback = () => this.dispatch({ type: "input", data: { show: false } });
            androidExit(bool, callback);
        };
        /**
         * tab选项
         */
        search(clicktype: number) {
            const { state } = this.props,
                show = state!.show,
                type = state!.type,
                tags = state!.tags;
            if (clicktype === MarketTypeEnum.serviceType) {
                setEventWithLabel(statisticsEvent.productServiceTypeFiltering);
            } else if (clicktype === MarketTypeEnum.chargType) {
                setEventWithLabel(statisticsEvent.productChargeType);
            } else if (clicktype === MarketTypeEnum.intelligenceSort) {
                setEventWithLabel(statisticsEvent.productIntelAortFiltering);
            }
            clicktype === type
                ? (this.onOpenChange(!show),
                  this.dispatch({
                      type: "input",
                      data: { type: clicktype },
                  }))
                : (this.onOpenChange(true),
                  this.dispatch({
                      type: "input",
                      data: { type: clicktype },
                  }));
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

        renderTabs(): React.ReactNode {
            const { state } = this.props,
                typeTitle = state!.typeTitle,
                sortTitle = state!.sortTitle,
                chargeTitle = state!.chargeTitle;
            return (
                <Flex align="center" className="tab-down-list border-bottom-1px">
                    {this.renderOneTab(typeTitle, MarketTypeEnum.serviceType)}
                    {this.renderOneTab(sortTitle, MarketTypeEnum.intelligenceSort)}
                    {this.renderOneTab(chargeTitle, MarketTypeEnum.chargType)}
                </Flex>
            );
        }
        renderHeaderLeft(): React.ReactNode {
            return (
                <Icon
                    type="left"
                    onClick={() => {
                        browser.versions.android ? this.onOpenChange(false) : this.goBack();
                    }}
                />
            );
        }
        renderHeaderRight(): React.ReactNode {
            const { state } = this.props,
                csfwId = state!.csfwId,
                show = state!.show;
            return (
                <div
                    className="search-top"
                    onClick={() => {
                        show
                            ? (this.onOpenChange(false),
                              setTimeout(
                                  () =>
                                      this.goTo({
                                          pathname: `search`,
                                          state: csfwId,
                                      }),
                                  100
                              ))
                            : (this.goTo({
                                  pathname: `search`,
                                  state: csfwId,
                              }),
                              this.dispatch({ type: "input", data: { show: false } }));
                    }}
                >
                    <Icon type="search" style={{ color: "black" }} />
                </div>
            );
        }
        renderHeaderContent(): React.ReactNode {
            return <span>服务产品</span>;
        }
        renderHeader(): React.ReactNode {
            const { state } = this.props,
                show = state!.show;
            return (
                <>
                    <NavBar leftContent={this.renderHeaderLeft()} rightContent={this.renderHeaderRight()}>
                        {this.renderHeaderContent()}
                    </NavBar>
                    {this.renderTabs()}
                    {show && (
                        <div className="tab-show new-tab-show">
                            {this.renderMenu()}
                            <div
                                className="product-menu-bottom"
                                onClick={() => {
                                    this.onOpenChange(false);
                                }}
                            />
                        </div>
                    )}
                </>
            );
        }
        /**
         * 渲染服务集市列表Items
         */
        renderBody(): React.ReactNode {
            const { state } = this.props;
            return state!.refreshing !== false ? null : this.getListView();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.product]);
}
