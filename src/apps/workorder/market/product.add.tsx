import React from "react";
import { NavBar, List, Toast, Drawer, Radio, TextareaItem, InputItem, Checkbox, Flex, Button, WingBlank, Tag } from "antd-mobile-v2";
import { Brief } from "antd-mobile/lib/list/ListItem";
import { template, Validators } from "@reco-m/core";
import { ViewComponent, setEventWithLabel, Picture, androidExit } from "@reco-m/core-ui";
import { SideBarItem, ContactInfo, SubmitBtn, Header } from "@reco-m/workorder-common";
import { Namespaces, MarketTypeEnum, productAddModel, ServiceInstitutionAcceptanceModeEnum } from "@reco-m/workorder-models";
import { statisticsEvent } from "@reco-m/ipark-statistics";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
const AgreeItem = Checkbox.AgreeItem;
export namespace ProductAdd {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, productAddModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        showheader = false;
        scrollable = false;
        namespace = Namespaces.productAdd;
        isSubmiting = false;
        get productId() {
            return this.props.match!.params.productId;
        }
        componentDidMount() {
            if (this.productId) {
                this.loadAttach(this.productId);
            }
            this.dispatch({
                type: `initPage`,
                data: {
                    institutionID: this.props.match!.params.institutionID,
                },
                productId: this.productId,
            });
        }
        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }
        onOpenChange() {
            const { state } = this.props,
                isOpen = state!.isOpen,
                chosenChargeMode = state!.chosenChargeMode;
            chosenChargeMode && chosenChargeMode.tagName === "收费" ? this.checkCharge() : this.onOpenChanges(!isOpen);
        }

        // 验证
        check() {
            const { state } = this.props,
                institutionMode = state!.institutionMode,
                { cellphone, required, composeControl, ValidatorControl, requiredTrue } = Validators;
            let Attach = (this.getAttachInfo() && this.getAttachInfo()[0]) || {};
            if (institutionMode === ServiceInstitutionAcceptanceModeEnum.showOnly) {
                return ValidatorControl(
                    composeControl([required], { value: state!.productName, name: "产品名称" }),
                    composeControl([required], { value: state!.serviceCatalogueIDs, name: "服务类型" }),
                    composeControl([required], { value: state!.serviceObjectIDs, name: "服务对象" }),
                    composeControl([required], { value: state!.chosenChargeMode, name: "服务价格" }),
                    composeControl([required], { value: Attach.files, name: "产品logo" }),
                    composeControl([required], { value: state!.contactName, name: "姓名" }),
                    composeControl([required, cellphone], { value: state!.contactMobile, name: "手机号码" }),
                    composeControl([requiredTrue], {
                        value: state!.isAgree,
                        name: "",
                        errors: {
                            required: "需要同意并勾选入驻协议",
                        },
                    })
                );
            } else {
                return ValidatorControl(
                    composeControl([required], { value: state!.productName, name: "产品名称" }),
                    composeControl([required], { value: state!.serviceCatalogueIDs, name: "服务类型" }),
                    composeControl([required], { value: state!.serviceObjectIDs, name: "服务对象" }),
                    composeControl([required], { value: state!.chosenChargeMode, name: "服务价格" }),
                    composeControl([required], { value: Attach.files, name: "产品logo" }),
                    composeControl([requiredTrue], {
                        value: state!.isAgree,
                        name: "",
                        errors: {
                            required: "需要同意并勾选入驻协议",
                        },
                    })
                );
            }
        }

        submit() {
            if (this.isSubmiting) {
                // 防止重复提交
                return;
            }
            this.isSubmiting = true;
            const msg = this.check()!();

            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }

            this.dispatch({
                type: "addProduct",
                productId: this.productId,
                callback: (data) => {
                    this.saveAttach(data);
                    setEventWithLabel(statisticsEvent.addProduct);
                    Toast.success("服务产品新增成功", 1, this.goBack.bind(this));
                },
            });
        }
        onOpenChanges = (bool: boolean, opentype?) => {
            const { state } = this.props,
                minPrice = state!.minPrice,
                maxPrice = state!.maxPrice,
                chosenChargeMode = state!.chosenChargeMode,
                chosenUnit = state!.chosenUnit;
            this.dispatch({ type: "input", data: { isOpen: bool } });
            // 解决android返回
            const callback = opentype
                ? () => (
                      this.dispatch({ type: "input", data: { isOpen: false } }),
                      this.dispatch({
                          type: "input",
                          data: { chosenChargeMode: chosenChargeMode || null, minPrice: minPrice || null, maxPrice: maxPrice || null, chosenUnit: chosenUnit || null },
                      })
                  )
                : () => this.dispatch({ type: "input", data: { isOpen: false } });
            androidExit(bool, callback);
        };
        chooseModalData(opentype) {
            this.dispatch({ type: "input", data: { /*isOpen: true,*/ isEdit: true, openType: opentype } });
            this.onOpenChanges(true, opentype);
        }

        // 多选数据
        getMultData(chosenData, bindID, bindName) {
            if (!chosenData || chosenData.length === 0) return;
            let ids = chosenData.map((x) => x.tagValue).join(",");
            let names = chosenData.map((x) => x.tagName).join(",");
            this.dispatch({ type: "input", data: { [bindID]: ids, [bindName]: names } });
        }

        renderOrderFormView(): React.ReactNode {
            const { state } = this.props,
                chosenChargeMode = state!.chosenChargeMode,
                chosenObject = state!.chosenObject,
                chosenCatalogue = state!.chosenCatalogue,
                serviceCatalogueNames = state!.serviceCatalogueNames,
                serviceObjectNames = state!.serviceObjectNames,
                productName = state!.productName,
                minPrice = state!.minPrice,
                maxPrice = state!.maxPrice,
                chosenUnit = state!.chosenUnit,
                summary = state!.summary,
                isOpen = state!.isOpen;

            this.getMultData(chosenCatalogue, "serviceCatalogueIDs", "serviceCatalogueNames");
            this.getMultData(chosenObject, "serviceObjectIDs", "serviceObjectNames");
            return (
                <>
                    <List key={"a"} renderHeader={"基本信息"}>
                        <InputItem placeholder="请输入产品名称（必填）" value={productName} onChange={(e) => this.dispatch({ type: "input", data: { productName: e } })}>
                            产品名称<span className="color-red">*</span>
                        </InputItem>
                        {this.renderEmbeddedView(SideBarItem.Component as any, {
                            data: serviceCatalogueNames,
                            labelName: "服务类型",
                            labelPlaceholder: "请选择服务类型(必选)",
                            isMultiselect: true,
                            isOpen: isOpen,
                            chooseModalData: this.chooseModalData.bind(this, "ServiceCatalogue"),
                        })}
                        {this.renderEmbeddedView(SideBarItem.Component as any, {
                            data: serviceObjectNames,
                            labelName: "服务对象",
                            labelPlaceholder: "请选择服务对象(必选)",
                            isMultiselect: true,
                            isOpen: isOpen,
                            chooseModalData: this.chooseModalData.bind(this, "ServiceObject"),
                        })}
                        {this.renderEmbeddedView(SideBarItem.Component as any, {
                            data:
                                chosenChargeMode && minPrice && maxPrice && +chosenChargeMode.tagValue === MarketTypeEnum.chargToll
                                    ? minPrice + " ~ " + maxPrice + " " + (chosenUnit && chosenUnit.tagName)
                                    : chosenChargeMode && chosenChargeMode.tagName,
                            labelName: "服务价格",
                            labelPlaceholder: "请选择服务价格(必选)",
                            isMultiselect: true,
                            isOpen: isOpen,
                            chooseModalData: this.chooseModalData.bind(this, "ChargeMode"),
                        })}
                        <List.Item>
                            产品logo<span className="color-red">*</span>
                            <Brief>
                                <Picture.Component fileNumLimit={1} tableName={IParkBindTableNameEnum.product} />
                            </Brief>
                        </List.Item>
                    </List>

                    <List key={"b"} renderHeader={"产品详情"}>
                        <TextareaItem placeholder="请输入产品详情" rows={4} count={1500} value={summary} onChange={(e) => this.dispatch({ type: "input", data: { summary: e } })} />
                    </List>
                </>
            );
        }

        // 单选
        renderRadioItem(item: any, i: number): React.ReactNode {
            const { state } = this.props,
                chosenChargeMode = state!.chosenChargeMode;

            return (
                <Radio.RadioItem
                    key={i}
                    checked={chosenChargeMode && chosenChargeMode.id === item.id}
                    onClick={() => {
                        this.dispatch({
                            type: "input",
                            data: { chosenChargeMode: item },
                        });
                    }}
                >
                    {item.tagName}
                </Radio.RadioItem>
            );
        }

        // 多选判断是否选中
        isMultChecked(checkedTags: any, tag: any) {
            let filter = checkedTags && checkedTags.find((t: any) => t.id === tag.id);
            return filter;
        }

        // 多选选中时
        onMultChange(tag, chosenData) {
            const { state } = this.props,
                openType = state!.openType;
            if (this.isMultChecked(chosenData, tag)) {
                let filter = chosenData && chosenData.filter((t) => t.id !== tag.id);
                if (openType === "ServiceCatalogue")
                    this.dispatch({
                        type: "input",
                        data: { chosenCatalogue: filter, a: new Date() },
                    });
                else if (openType === "ServiceObject")
                    this.dispatch({
                        type: "input",
                        data: { chosenObject: filter, a: new Date() },
                    });
            } else {
                if (openType === "ServiceCatalogue") {
                    let chosenDatatemp = [] as any;
                    chosenDatatemp.push(tag);
                    this.dispatch({
                        type: "input",
                        data: { chosenCatalogue: chosenDatatemp, a: new Date() },
                    });
                } else if (openType === "ServiceObject") {
                    let chosenDatatemp = [...chosenData] as any;
                    chosenDatatemp && chosenDatatemp.push(tag);
                    this.dispatch({
                        type: "input",
                        data: { chosenObject: chosenDatatemp, a: new Date() },
                    });
                }
            }
        }

        // 多选
        renderMultItem(list, tag, i): React.ReactNode {
            let { state } = this.props,
                openType = state!.openType,
                serviceCatalogueNames = state!.serviceCatalogueNames || "",
                serviceObjectNames = state!.serviceObjectNames || "",
                chosenObject = state!.chosenObject || [],
                chosenCatalogue = state!.chosenCatalogue || [];
            let chosenData;
            if (openType === "ServiceCatalogue") {
                if (serviceCatalogueNames) {
                    const serviceCatalogueNamesList = serviceCatalogueNames.split(",");
                    const newArr = list.filter((item) => {
                        for (let obj of serviceCatalogueNamesList) {
                            if (item.tagName === obj) return item;
                        }
                    });
                    chosenData = newArr;
                } else {
                    chosenData = chosenCatalogue;
                }
            } else if (openType === "ServiceObject") {
                if (serviceObjectNames) {
                    const serviceObjectNamesList = serviceObjectNames.split(",");
                    const newArr = list.filter((item) => {
                        for (let obj of serviceObjectNamesList) {
                            if (item.tagName === obj) return item;
                        }
                    });
                    chosenData = newArr;
                } else {
                    chosenData = chosenObject;
                }
            } else {
                chosenData = [];
            }

            return (
                <Checkbox.CheckboxItem className={"checkbox1"} key={i} onChange={() => this.onMultChange(tag, chosenData)} checked={this.isMultChecked(chosenData, tag)}>
                    {tag.tagName}
                </Checkbox.CheckboxItem>
            );
        }

        // 重置
        reset() {
            const { state } = this.props,
                openType = state!.openType;
            if (openType === "ServiceCatalogue")
                this.dispatch({
                    type: "input",
                    data: { chosenCatalogue: [], serviceCatalogueIDs: null, serviceCatalogueNames: null },
                });
            else if (openType === "ServiceObject")
                this.dispatch({
                    type: "input",
                    data: { chosenObject: [], serviceObjectIDs: null, serviceObjectNames: null },
                });
            else if (openType === "ChargeMode") this.dispatch({ type: "input", data: { chosenChargeMode: null, minPrice: null, maxPrice: null, chosenUnit: null } });
        }

        // 服务价格的收费类型是收费，则最高价和最低价，单位， 必填
        checkCharge() {
            const { state } = this.props,
                minPrice = state!.minPrice,
                maxPrice = state!.maxPrice,
                chosenUnit = state!.chosenUnit;
            if (minPrice && maxPrice && chosenUnit && parseInt(minPrice, 10) < parseInt(maxPrice, 10)) {
                this.onOpenChanges(false);
            } else {
                if (!minPrice) {
                    Toast.info("必须填写最低价格", 2);
                } else if (!maxPrice) {
                    Toast.info("必须填写最高价格", 2);
                } else if (!chosenUnit) {
                    Toast.info("必须选择单位", 2);
                } else if (parseInt(minPrice, 10) > parseInt(maxPrice, 10)) {
                    Toast.info("最高价格不能低于最低价格", 2);
                } else if (parseInt(minPrice, 10) === parseInt(maxPrice, 10)) {
                    Toast.info("最高价格不能等于最低价格", 2);
                }
            }
        }

        // 侧边栏按钮
        renderButton(): React.ReactNode {
            const { state } = this.props,
                chosenChargeMode = state!.chosenChargeMode,
                isOpen = state!.isOpen;

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
                                chosenChargeMode && chosenChargeMode.tagName === "收费" ? this.checkCharge() : this.onOpenChanges(!isOpen);
                            }}
                        >
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }

        // 服务价格
        renderPrice(): React.ReactNode {
            const { state } = this.props,
                minPrice = state!.minPrice,
                maxPrice = state!.maxPrice;

            return (
                <Flex>
                    <Flex.Item>
                        <div className="sidebar-tag">
                            <InputItem
                                type="number"
                                placeholder="最低价"
                                value={minPrice}
                                onChange={(v) => {
                                    this.dispatch({ type: "input", data: { minPrice: v } });
                                }}
                            />
                        </div>
                    </Flex.Item>
                    <WingBlank size="md">~</WingBlank>
                    <Flex.Item>
                        <div className="sidebar-tag">
                            <InputItem
                                type="number"
                                placeholder="最高价"
                                value={maxPrice}
                                onChange={(v) => {
                                    this.dispatch({ type: "input", data: { maxPrice: v } });
                                }}
                            />
                        </div>
                    </Flex.Item>
                </Flex>
            );
        }

        // 服务价格单位
        renderUnit(): React.ReactNode {
            const { state } = this.props,
                units = state!.units || [],
                chosenUnit = state!.chosenUnit;
            const chosenUnitItem = chosenUnit && units.find((item) => item.tagName === chosenUnit.tagName);
            return (
                <Flex wrap={"wrap"} className="flex-row">
                    {units &&
                        units.length > 0 &&
                        units.map((item, i) => {
                            return (
                                <Tag
                                    key={i}
                                    className="matching mr10"
                                    data-seed="logId"
                                    selected={chosenUnitItem && chosenUnitItem.id === item.id}
                                    onChange={(e) => {
                                        this.dispatch({ type: "input", data: { chosenUnit: e ? item : "", t: new Date() } });
                                    }}
                                >
                                    {item.tagName}
                                </Tag>
                            );
                        })}
                </Flex>
            );
        }
        getSideBarTempArr() {
            const { state } = this.props,
                institution = state!.institution ? state!.institution : {},
                catalogues = state!.catalogues;

            let temp = institution.serviceInstitutionCategoryDetailVMList;
            let tempArr: any = [];
            if (temp && catalogues && temp.length > 0) {
                for (let i = 0; i < temp.length; i++) {
                    for (let j = 0; j < catalogues.length; j++) {
                        if (catalogues[j].tagName === temp[i].serviceCategory) {
                            tempArr.push({ tagName: catalogues[j].tagName, tagValue: catalogues[j].tagValue, id: catalogues[j].id });
                        }
                    }
                }
            }
            return tempArr;
        }
        renderSideBar(): React.ReactNode {
            const { state } = this.props,
                openType = state!.openType,
                objects = state!.objects,
                chosenChargeMode = state!.chosenChargeMode,
                prices = state!.prices;

            let tempArr = this.getSideBarTempArr();

            return (
                <div className="drawer-detail">
                    <div className="container-column container-fill">
                        {client.showheader && (
                            <NavBar className="park-nav">
                                {openType === "ServiceCatalogue" ? "服务类型" : openType === "ServiceObject" ? "服务对象" : openType === "ChargeMode" ? "服务价格" : "筛选"}
                            </NavBar>
                        )}

                        <div className="container-fill container-scrollable">
                            {openType === "ServiceCatalogue" && (
                                <List className="sidebar-list">{tempArr && tempArr.length > 0 && tempArr.map((tag, i) => this.renderMultItem(tempArr, tag, i))}</List>
                            )}
                            {openType === "ServiceObject" && (
                                <List className="sidebar-list">{objects && objects.length > 0 && objects.map((tag, i) => this.renderMultItem(objects, tag, i))}</List>
                            )}
                            {openType === "ChargeMode" && (
                                <List className="sidebar-list">
                                    {prices && prices.length > 0 && prices.map((tag, i) => this.renderRadioItem(tag, i))}
                                    {}
                                </List>
                            )}
                            {openType === "ChargeMode" && chosenChargeMode && +chosenChargeMode.tagValue === MarketTypeEnum.chargToll && (
                                <List className="sidebar-list" renderHeader={"价格"}>
                                    {}
                                    {this.renderPrice()}
                                </List>
                            )}
                            {openType === "ChargeMode" && chosenChargeMode && +chosenChargeMode.tagValue === MarketTypeEnum.chargToll && (
                                <List className="sidebar-list" renderHeader={`单位`}>
                                    {}

                                    {this.renderUnit()}
                                </List>
                            )}
                        </div>
                        {this.renderButton()}
                    </div>
                </div>
            );
        }

        renderRead(): React.ReactNode {
            const { state } = this.props,
                isAgree = state!.isAgree;

            return (
                <List
                    key={"e"}
                    renderHeader={
                        <AgreeItem data-seed="logId" className="login-logid" checked={isAgree} onClick={() => this.dispatch({ type: "input", data: { isAgree: !isAgree } })}>
                            我已阅读并同意
                            <a onClick={() => this.goTo("productaddagree")}>《企业服务平台产品发布协议》</a>
                        </AgreeItem>
                    }
                ></List>
            );
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

        render(): React.ReactNode {
            const { state } = this.props,
                isOpen = state!.isOpen,
                sidebar = this.renderSideBar();

            return (
                <Drawer sidebar={sidebar} docked={false} open={isOpen} onOpenChange={this.onOpenChange.bind(this)} position="right">
                    <div className="container-fill container-column body">
                        {client.showheader && (
                            <Header.Component
                                title={this.productId ? "编辑服务产品" : "新增服务产品"}
                                isEdit={state!.isEdit}
                                path={"myMarketIn"}
                                goBack={this.goBack.bind(this)}
                                goTo={this.goTo.bind(this)}
                            />
                        )}
                        {this.renderBody()}
                        {this.renderRead()}
                        {this.renderFooter()}
                    </div>
                </Drawer>
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                isAgree = state!.isAgree;
            return <SubmitBtn.Component isAgree={isAgree} submit={this.submit.bind(this)} />;
        }
        /**
         * 渲染主入口
         */
        renderBody(): React.ReactNode {
            const { state } = this.props,
                institutionMode = state!.institutionMode;
            return (
                <div className="container-fill container-scrollable">
                    {this.renderOrderFormView()}
                    {institutionMode === ServiceInstitutionAcceptanceModeEnum.showOnly && <ContactInfo.Component state={this.props.state} count={4} changeStateInfo={this.dispatch.bind(this)} />}
                </div>
            );
        }
    }
    export const Page = template(Component, (state) => state[Namespaces.productAdd]);
}
