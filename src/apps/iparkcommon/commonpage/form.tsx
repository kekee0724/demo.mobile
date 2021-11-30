import React from "react";

import { Drawer, NavBar, Flex, Button, InputItem, List, Radio, Checkbox, NoticeBar, Picker, DatePicker, TextareaItem, Tag, WingBlank } from "antd-mobile-v2";

import { formatDate, getDate } from "@reco-m/core";

import { ListComponent, Container } from "@reco-m/core-ui";

import { testModel } from "@reco-m/ipark-common-models";
const AgreeItem = Checkbox.AgreeItem;
/**
 * 单行输入框配置
 */
export enum clickTypeEnum {
    input,
    drawer,
}
export interface WBInputProps {
    title: string; // 标题
    stateKey: string; // 输入值存入变量
    placeholder?: string;
    /**
     * 可以是银行卡bankCard; 手机号phone(此时最大长度固定为11,maxLength设置无效); 密码password; 数字number(为了尽量唤起带小数点的数字键盘，此类型并不是原生 number，而是<input type="text" pattern="[0-9]*" />); digit(表示原生的 number 类型); money(带小数点的模拟的数字键盘) 以及其他标准 html input type 类型
     */
    type?: string;
    editable?: boolean; // 是否可编辑
    clickType?: clickTypeEnum; // 默认input,其他选项drawer(抽屉选择)
    isRequired?: boolean; // 是否必填
    rollTitle?: boolean;
    onChange?: (val: string) => void;
    onClick?: (fun: () => void) => void;
    // 侧边栏配置
    drawerConfig?: {
        drawerData: object[];
        drawerLabelKey: string;
        drawerValueKey: string;
        drawerTitle?: string;
        drawerMult?: boolean;
        drawerDatasStateKey?: string; // 侧边栏数据存储的statekey
        filterKey?: string; // 标签中该字段如果为空就过滤掉
    };
}
/**
 * 数据选择器配置
 */
export interface WBPickProps {
    title: string; // 标题
    stateKey: string; // 输入值存入变量
    placeholder?: string;
    isRequired?: boolean; // 是否必填
    rollTitle?: boolean;
    onChange?: (val: any) => void;
    //数据选择栏配置
    config: {
        data: any[];
        cascade: boolean; // 是否联动
        title?: string;
        cols?: number; // 列数
    };
}
/**
 * 日期时间选择器配置
 */
export interface WBDatePickProps {
    title: string; // 标题
    mode: "time" | "datetime" | "date" | "year" | "month" | undefined; // 日期选择的类型, 可以是日期date,时间time,日期+时间datetime,年year,月month
    stateKey: string; // 输入值存入变量
    maxDate?: Date;
    minDate?: Date;
    placeholder?: string;
    isRequired?: boolean; // 是否必填
    rollTitle?: boolean;
    onChange?: (val: any) => void;
    format?: string;
}
/**
 * 多行文本框配置
 */
export interface WBTextareaProps {
    title?: string; // 标题
    stateKey: string; // 输入值存入变量
    editable?: boolean;
    placeholder?: string;
    isRequired?: boolean; // 是否必填
    rollTitle?: boolean;
    onChange?: (val: any) => void;
    format?: string;
    count?: number; // 计数功能,兼具最大长度,默认为0,代表不开启计数功能
    rows?: number; // 显示几行
}

/**
 * 标签选择
 */
export enum tagTypeEnum {
    small,
    big,
}
export interface WBTagProps {
    stateKey: string; // 输入值存入变量
    multiple?: boolean; // 是否多选
    tagsData: object[]; // 标签数据
    tagLabelKey: string; // 标签显示字段
    tagValueKey: string; // 标签选中值字段
    maxSelectNum?: number; // 最大选择数量(多选时有效)
    maxSelectError?: () => void; // 超过最大选择后报错回调(多选时有效)
    tagType?: tagTypeEnum;
    foldnum?: number; // 设置折叠显示数量
    foldTitle?: string; // 设置折叠显示标题
    filterKey?: string; // 标签中该字段如果为空就过滤掉
}
export namespace WBFormViewComponent {
    export interface IProps<S = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, testModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        /**
         * 渲染Items的内容
         */
        renderItemsContent(_item: any, _i: number): React.ReactNode {
            return <div></div>;
        }
        /**
         * 刷新列表
         */
        pullToRefresh() {}

        /**
         * 上拉刷新
         */
        onEndReached() {}
        /*——————————————————————————————单行输入框start——————————————————————————————*/
        sideBarReset() {
            // 侧边栏重置
            const { state } = this.props,
                drawerProps = state!.drawerProps;

            if (drawerProps.drawerConfig?.drawerDatasStateKey) {
                this.dispatch({ type: "update", data: { open: false, [drawerProps.stateKey]: null, drawerConfig: null, [drawerProps.drawerConfig?.drawerDatasStateKey]: null } });
                return;
            }
            this.dispatch({ type: "update", data: { open: false, [drawerProps.stateKey]: null, drawerConfig: null } });
        }
        sideBarSure() {
            // 侧边栏确定
            const { state } = this.props,
                drawerProps = state!.drawerProps;
            if (drawerProps.drawerConfig?.drawerDatasStateKey) {
                this.dispatch({ type: "update", data: { open: false, drawerConfig: null, [drawerProps.drawerConfig?.drawerDatasStateKey]: null } });
                return;
            }
            this.dispatch({ type: "update", data: { open: false, drawerConfig: null } });
        }

        renderButton(): React.ReactNode {
            // 侧边栏按钮
            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button
                            onClick={() => {
                                this.sideBarReset();
                            }}
                        >
                            重置
                        </Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button
                            type="primary"
                            onClick={() => {
                                this.sideBarSure();
                            }}
                        >
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
        renderRadioItem() {
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                drawerConfig = state!.drawerConfig,
                drawerData = drawerConfig.drawerData,
                selectItem = state![drawerProps.stateKey];

            return (
                drawerData &&
                drawerData.map((item, i) => {
                    if (drawerProps.drawerConfig.filterKey && !item[drawerProps.drawerConfig.filterKey]) {
                        return null;
                    }
                    return (
                        <Radio.RadioItem
                            key={i}
                            checked={selectItem && selectItem[drawerConfig.drawerValueKey] === item[drawerConfig.drawerValueKey]}
                            onClick={() => {
                                this.dispatch({
                                    type: "update",
                                    data: { [drawerProps.stateKey]: item },
                                });
                            }}
                        >
                            {item[drawerConfig.drawerLabelKey]}
                        </Radio.RadioItem>
                    );
                })
            );
        }
        // 多选判断是否选中
        isMultChecked(selectItems: any, tag: any) {
            const { state } = this.props,
                drawerConfig = state!.drawerConfig;
            let filter = selectItems && selectItems.find((t: any) => t[drawerConfig.drawerValueKey] === tag[drawerConfig.drawerValueKey]);
            return filter;
        }
        // 多选选择
        onMultChange(selectItems: any = [], tag: any) {
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                drawerConfig = state!.drawerConfig;
            if (this.isMultChecked(selectItems, tag)) {
                // 已经选中
                let filter = selectItems && selectItems.filter((t) => t[drawerConfig.drawerValueKey] !== tag[drawerConfig.drawerValueKey]);
                this.dispatch({
                    type: "update",
                    data: { [drawerProps.stateKey]: filter },
                });
            } else {
                let chosenDatatemp = [...selectItems] as any;
                chosenDatatemp && chosenDatatemp.push(tag);
                this.dispatch({
                    type: "update",
                    data: { [drawerProps.stateKey]: chosenDatatemp },
                });
            }
        }
        renderMultItem() {
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                drawerConfig = state!.drawerConfig,
                drawerData = drawerConfig.drawerData,
                selectItems = state![drawerProps.stateKey];
            return (
                drawerData &&
                drawerData.map((item, i) => {
                    if (drawerProps.drawerConfig.filterKey && !item[drawerProps.drawerConfig.filterKey]) {
                        return null;
                    }
                    return (
                        <Checkbox.CheckboxItem
                            className={"checkbox1"}
                            key={i}
                            onChange={() => {
                                this.onMultChange(selectItems, item);
                            }}
                            checked={this.isMultChecked(selectItems, item)}
                        >
                            {item[drawerConfig.drawerLabelKey]}
                        </Checkbox.CheckboxItem>
                    );
                })
            );
        }
        renderFormSideBar(): React.ReactNode {
            // 侧边栏渲染
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                drawerConfig = state!.drawerConfig;
            return drawerConfig ? (
                <div className="drawer-detail">
                    <div className="container-column container-fill">
                        {client.showheader && <NavBar className="park-nav">{drawerConfig.drawerTitle || drawerProps.title}</NavBar>}

                        <div className="container-fill container-scrollable">
                            <List className="sidebar-list">{drawerConfig.drawerMult ? this.renderMultItem() : this.renderRadioItem()}</List>
                        </div>
                        {this.renderButton()}
                    </div>
                </div>
            ) : null;
        }
        getInputDrawerValue(props) {
            const { state } = this.props,
                drawerConfig = props!.drawerConfig,
                selectItems = state![props.stateKey];

            let drawerValue = "";
            if (drawerConfig && drawerConfig.drawerMult) {
                // 多选
                let names = selectItems ? selectItems.map((x) => x[drawerConfig.drawerLabelKey]).join(",") : null;
                drawerValue = names;
            } else {
                drawerValue = selectItems && drawerConfig ? selectItems[drawerConfig.drawerLabelKey] : selectItems;
            }
            return drawerValue;
        }
        drawerOpen(props) {
            this.dispatch({ type: "update", data: { drawerProps: props, open: true, drawerConfig: props.drawerConfig || null } });
        }
        renderInput(props: WBInputProps): React.ReactNode {
            const { state } = this.props,
                open = state!.open,
                drawerConfig = state!.drawerConfig,
                drawerDatas = props.drawerConfig?.drawerDatasStateKey ? state![props.drawerConfig.drawerDatasStateKey] : null,
                value = state![props.stateKey];

            if (props.drawerConfig && props.drawerConfig.drawerDatasStateKey && open && drawerDatas && !drawerConfig?.drawerData) {
                this.drawerOpen(props);
            }
            // 输入框渲染
            let param: any = {
                placeholder: props.placeholder,
                labelNumber: 6,
                type: props.type || "text",
                editable: props.editable,
            };
            if (props.clickType === clickTypeEnum.drawer) {
                param = {
                    ...param,
                    value: this.getInputDrawerValue(props),
                    editable: false,
                    onClick: () => {
                        if (props.onClick) {
                            props.onClick(() => {
                                this.drawerOpen(props);
                            });
                            return;
                        }
                        this.drawerOpen(props);
                    },
                };
            } else {
                param = {
                    ...param,
                    value: value,
                    onChange: (e) => {
                        if (props.onChange) {
                            props.onChange(e);
                        }
                        this.dispatch({ type: "update", data: { [props.stateKey]: e } });
                    },
                };
            }
            return (
                <div className="wb-form-view">
                    <InputItem {...param} key={props.stateKey}>
                        {props.rollTitle ? (
                            <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                {props.title}
                                {props.isRequired && <span className="color-red">*</span>}
                            </NoticeBar>
                        ) : (
                            <>
                                <span className="props-title">{props.title}</span>
                                {props.isRequired && <span className="color-red">*</span>}
                            </>
                        )}
                    </InputItem>
                </div>
            );
        }
        /*——————————————————————————————单行输入框end——————————————————————————————*/

        /*——————————————————————————————数据选择器start——————————————————————————————*/
        renderPick(props: WBPickProps): React.ReactNode {
            const { state } = this.props,
                value = state![props.stateKey];
            let config = props.config;
            return (
                <div className="wb-form-view">
                    <Picker
                        title={config!.title}
                        cascade={config.cascade}
                        data={config?.data || []}
                        value={value}
                        cols={config.cols || 1}
                        extra={props.placeholder}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { [props.stateKey]: value } });
                            if (props.onChange) {
                                props.onChange(value);
                            }
                        }}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <div>
                                {props.rollTitle ? (
                                    <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                        {props.title}
                                        {props.isRequired && <span className="color-red">*</span>}
                                    </NoticeBar>
                                ) : (
                                    <>
                                        <span className="props-title">{props.title}</span>
                                        {props.isRequired && <span className="color-red">*</span>}
                                    </>
                                )}
                            </div>
                        </List.Item>
                    </Picker>
                </div>
            );
        }
        /*——————————————————————————————数据选择器end——————————————————————————————*/

        /*——————————————————————————————日期时间选择器start——————————————————————————————*/
        renderDatePick(props: WBDatePickProps): React.ReactNode {
            const { state } = this.props,
                value = state![props.stateKey];
            let prop: any = {};
            if (props.format) {
                prop.format = (value: Date) => formatDate(value, props.format);
            }
            return (
                <div className="wb-form-view">
                    <DatePicker
                        mode={props.mode}
                        extra={props.placeholder}
                        maxDate={props.maxDate}
                        minDate={props.minDate}
                        value={getDate(value)}
                        {...prop}
                        onChange={(date) => {
                            console.log("onChange");

                            this.dispatch({ type: "input", data: { [props.stateKey]: date } });
                            if (props.onChange) {
                                props.onChange(date);
                            }
                        }}
                    >
                        <List.Item arrow="horizontal">
                            <div>
                                {props.rollTitle ? (
                                    <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                        {props.title}
                                        {props.isRequired && <span className="color-red">*</span>}
                                    </NoticeBar>
                                ) : (
                                    <>
                                        <span className="props-title">{props.title}</span>
                                        {props.isRequired && <span className="color-red">*</span>}
                                    </>
                                )}
                            </div>
                        </List.Item>
                    </DatePicker>
                </div>
            );
            return null;
        }
        /*——————————————————————————————日期时间选择器end——————————————————————————————*/

        /*——————————————————————————————多行文本框start——————————————————————————————*/
        renderTextarea(props: WBTextareaProps): React.ReactNode {
            const { state } = this.props,
                value = state![props.stateKey];
            return (
                <TextareaItem
                    className="wb-form-view"
                    editable={props.editable}
                    onChange={(v) => {
                        this.dispatch({ type: "input", data: { [props.stateKey]: v } });
                        if (props.onChange) {
                            props.onChange(v);
                        }
                    }}
                    placeholder={props.placeholder}
                    value={value}
                    rows={props.rows}
                    count={props.count || 0}
                    labelNumber={6}
                    title={
                        props.title ? (
                            props.rollTitle ? (
                                <NoticeBar icon={null} marqueeProps={{ loop: true }}>
                                    {props.title}
                                    {props.isRequired && <span className="color-red">*</span>}
                                </NoticeBar>
                            ) : (
                                <>
                                    <span className="props-title">{props.title}</span>
                                    {props.isRequired && <span className="color-red">*</span>}
                                </>
                            )
                        ) : null
                    }
                />
            );
        }
        /*——————————————————————————————多行文本框end——————————————————————————————*/

        /*——————————————————————————————标签选择start——————————————————————————————*/
        /**
         * 侧边栏标签变化
         * @param isChecked 是否多选
         */
        onModelChange(props: WBTagProps, item: any, valueMap: string, isMultiple?: boolean) {
            const { state } = this.props,
                selectedTags = JSON.parse(JSON.stringify(state![valueMap] || []));
            if (isMultiple) {
                if (this.isChecked(selectedTags, item, props.tagValueKey)) {
                    let filter = selectedTags.filter((x) => x[props.tagValueKey] !== item[props.tagValueKey]);
                    this.dispatch({ type: "input", data: { [valueMap]: filter } });
                } else {
                    if (props.maxSelectNum && props.maxSelectNum <= selectedTags.length) {
                        let error = props.maxSelectError;
                        error && error();
                        if (props.tagType !== tagTypeEnum.big) {
                            // 解决蚂蚁默认选中
                            $(`.logId${item[props.tagValueKey]}`).removeClass("am-tag-active").addClass("am-tag-normal");
                        }
                    } else {
                        selectedTags.push(item);
                        this.dispatch({ type: "input", data: { [valueMap]: selectedTags } });
                    }
                }
            } else {
                if (this.isChecked(selectedTags, item, props.tagValueKey)) {
                    this.dispatch({ type: "input", data: { [valueMap]: [] } });
                } else {
                    this.dispatch({ type: "input", data: { [valueMap]: [item] } });
                }
            }
        }

        /**
         * 侧边栏标签是否选择
         */
        isChecked = (arr, value, tagValueKey) => {
            let filter = arr && arr.length > 0 && arr.find((x) => x[tagValueKey] === value[tagValueKey]);
            return filter;
        };
        /**
         * 点击标签
         */
        renderTags(props: WBTagProps): React.ReactNode {
            const { state } = this.props,
                foldnum = props.foldnum,
                selectedTags = state![props.stateKey] || [],
                tagFoldnum = state![`${props.stateKey}num`] || foldnum,
                tagsData = props.tagsData;
            return props.tagType === tagTypeEnum.big ? (
                <WingBlank className="wb-form-view">
                    <div className=" tag-screen">
                        <div className="row gutter-5">
                            {(tagsData || []).map((tag, i) => {
                                if (props.foldnum && i > tagFoldnum - 1) {
                                    return null;
                                }
                                if (props.filterKey && !tag[props.filterKey]) {
                                    return null;
                                }
                                return (
                                    <div key={i} className="park-col park-col-8">
                                        <span
                                            className={`parkTag type1 mb10 ${this.isChecked(selectedTags, tag, props.tagValueKey) ? "active" : ""}`}
                                            onClick={() => this.onModelChange(props, tag, props.stateKey, props.multiple)}
                                        >
                                            {tag[props.tagLabelKey]}
                                        </span>
                                    </div>
                                );
                            })}
                            {foldnum && tagFoldnum < tagsData.length && (
                                <div className="park-col park-col-8">
                                    <span
                                        className={`parkTagmore type1 mb10`}
                                        onClick={() => {
                                            this.dispatch({ type: "input", data: { [`${props.stateKey}num`]: tagFoldnum + foldnum } });
                                        }}
                                    >
                                        {props.foldTitle ? props.foldTitle : "更多"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </WingBlank>
            ) : (
                <List.Item wrap className="wb-form-view">
                    {(tagsData || []).map((tag, i) => {
                        if (props.foldnum && i > tagFoldnum - 1) {
                            return null;
                        }
                        if (props.filterKey && !tag[props.filterKey]) {
                            return;
                        }
                        return (
                            <Tag
                                selected={this.isChecked(selectedTags, tag, props.tagValueKey)}
                                onChange={() => this.onModelChange(props, tag, props.stateKey, props.multiple)}
                                key={i}
                                data-seed={`logId${tag[props.tagValueKey]}`}
                                className={`mr6 mb6 logId${tag[props.tagValueKey]}`}
                            >
                                {tag[props.tagLabelKey]}
                            </Tag>
                        );
                    })}
                    {foldnum && tagFoldnum < tagsData.length && (
                        <span
                            className="parkSmallTagmore"
                            onClick={() => {
                                this.dispatch({ type: "input", data: { [`${props.stateKey}num`]: tagFoldnum + foldnum } });
                            }}
                        >
                            {props.foldTitle ? props.foldTitle : "更多"}
                        </span>
                    )}
                </List.Item>
            );
        }
        /**
         * 列表标签
         */
        renderTagsList(props: WBTagProps): React.ReactNode {
            const { state } = this.props,
                selectedTags = state![props.stateKey] || [],
                tagsData = props.tagsData;
            return (tagsData || []).map((tag, i) => {
                return props.multiple ? (
                    <Checkbox.CheckboxItem
                        checked={this.isChecked(selectedTags, tag, props.tagValueKey)}
                        onChange={() => this.onModelChange(props, tag, props.stateKey, props.multiple)}
                        key={i}
                    >
                        {tag[props.tagLabelKey]}
                    </Checkbox.CheckboxItem>
                ) : (
                    <Radio.RadioItem
                        checked={this.isChecked(selectedTags, tag, props.tagValueKey)}
                        onChange={() => this.onModelChange(props, tag, props.stateKey, props.multiple)}
                        key={i}
                    >
                        {tag[props.tagLabelKey]}
                    </Radio.RadioItem>
                );
            });
        }

        renderTagsLine(props: WBTagProps): React.ReactNode {
            const { state } = this.props,
                selectedTags = state![props.stateKey] || [],
                tagsData = props.tagsData;

            return (tagsData || []).map((tag, i) => {
                return (
                    <Flex.Item className="margin-left-0 size-14 wb-form-view" key={i}>
                        <Flex onClick={() => this.onModelChange(props, tag, props.stateKey, props.multiple)}>
                            <AgreeItem data-seed="logId" className="login-logid" checked={this.isChecked(selectedTags, tag, props.tagValueKey)}>
                                <span className="margin-left-xs">{tag[props.tagLabelKey]}</span>
                            </AgreeItem>
                        </Flex>
                    </Flex.Item>
                );
            });
        }
        /*——————————————————————————————标签选择end——————————————————————————————*/

        render(): React.ReactNode {
            const sidebar = this.renderFormSideBar() as any;
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                open = state!.open;
            return (
                <Drawer
                    sidebar={sidebar}
                    docked={false}
                    open={open}
                    onOpenChange={() => {
                        if (drawerProps.drawerConfig?.drawerDatasStateKey) {
                            this.dispatch({ type: "update", data: { open: false, drawerConfig: null, [drawerProps.drawerConfig?.drawerDatasStateKey]: null } });
                            return;
                        }
                        this.dispatch({ type: "update", data: { open: false, drawerConfig: null } });
                    }}
                    position="right"
                >
                    <Container.Component direction="column" fill>
                        {this.renderHeader()}
                        <div
                            className={this.classnames(
                                this.scrollable && this.props.scrollable !== false ? "container-scrollable" : "",
                                "container-fill body",
                                this.props.bodyClass || this.bodyClass
                            )}
                            onScroll={() => this.viewScroll()}
                            ref={(el) => this.refScroll(el)}
                        >
                            {this.renderBody()}
                        </div>
                        {this.renderFooter()}
                        {this.renderLoading()}
                    </Container.Component>
                </Drawer>
            );
        }
    }
}
