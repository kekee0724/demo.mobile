import React from "react";

import { Popup, Button, Input, Checkbox, DatePicker, TextArea, Selector, CascadePicker, Form, CheckList, Picker, Space } from "antd-mobile";
import { FormInstance } from "antd-mobile/es/components/form";

import { formatDate, getDate, formatDateTime } from "@reco-m/core";

import { Container, NavBar, FooterButton } from "../components/index";
import { ListComponent } from "../container/index";

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
    readOnly?: boolean; // 是否只读
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
    mode: "day" | "second"; // 日期选择的类型, 可以是日期date,时间time,日期+时间datetime,年year,月month
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
    columns?: number; // 行展示数
    maxSelectNum?: number; // 最大选择数量(多选时有效)
    maxSelectError?: () => void; // 超过最大选择后报错回调(多选时有效)
    tagType?: tagTypeEnum;
    foldnum?: number; // 设置折叠显示数量
    foldTitle?: string; // 设置折叠显示标题
    filterKey?: string; // 标签中该字段如果为空就过滤掉
    onChange?: (val: any) => void;
}

export interface WBTagListProps {
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
    onChange?: (val: any) => void;
}

export namespace WBFormViewComponent {
    export interface IProps<S = any> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        formRef = React.createRef<FormInstance>();

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
                this.dispatch({
                    type: "update",
                    data: {
                        open: false,
                        [drawerProps.stateKey]: null,
                        drawerConfig: null,
                        [drawerProps.drawerConfig?.drawerDatasStateKey]: null,
                    },
                });
                return;
            }
            this.dispatch({ type: "update", data: { open: false, [drawerProps.stateKey]: null, drawerConfig: null } });
        }

        sideBarSure() {
            // 侧边栏确定
            const { state } = this.props,
                drawerProps = state!.drawerProps;
            if (drawerProps.drawerConfig?.drawerDatasStateKey) {
                this.dispatch({
                    type: "update",
                    data: { open: false, drawerConfig: null, [drawerProps.drawerConfig?.drawerDatasStateKey]: null },
                });
                return;
            }
            this.dispatch({ type: "update", data: { open: false, drawerConfig: null } });
        }

        renderForm(props: { layout?: "horizontal" | "vertical"; children: any }) {
            !props.layout && (props.layout = "horizontal");
            return (
                <Form ref={this.formRef} layout={props.layout} mode="card">
                    {props.children}
                </Form>
            );
        }

        renderButton(): React.ReactNode {
            // 侧边栏按钮
            return (
                <FooterButton.Component>
                    <FooterButton.Item>
                        <Button
                            block
                            onClick={() => {
                                this.sideBarReset();
                            }}
                        >
                            重置
                        </Button>
                    </FooterButton.Item>
                    <FooterButton.Item>
                        <Button
                            block
                            color={"primary"}
                            onClick={() => {
                                this.sideBarSure();
                            }}
                        >
                            确定
                        </Button>
                    </FooterButton.Item>
                </FooterButton.Component>
            );
        }

        renderRadioItem() {
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                drawerConfig = state!.drawerConfig,
                drawerData = drawerConfig.drawerData;

            return (
                drawerData &&
                drawerData.map((item, i) => {
                    if (drawerProps.drawerConfig.filterKey && !item[drawerProps.drawerConfig.filterKey]) {
                        return null;
                    }
                    return (
                        <CheckList.Item
                            onClick={() => {
                                this.dispatch({
                                    type: "update",
                                    data: { [drawerProps.stateKey]: item },
                                });
                            }}
                            key={i}
                            value={item[drawerConfig.drawerValueKey]}
                        >
                            {item[drawerConfig.drawerLabelKey]}
                        </CheckList.Item>
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
            if (!selectItems) {
                selectItems = [];
            }

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
                        <CheckList.Item
                            onClick={() => {
                                this.onMultChange(selectItems, item);
                            }}
                            key={i}
                            value={item[drawerConfig.drawerValueKey]}
                        >
                            {item[drawerConfig.drawerLabelKey]}
                        </CheckList.Item>
                    );
                    // return (
                    //     <Checkbox
                    //         className={"checkbox1"}
                    //         key={i}
                    //         onChange={() => {
                    //             this.onMultChange(selectItems, item);
                    //         }}
                    //         checked={this.isMultChecked(selectItems, item)}
                    //     >
                    //         {item[drawerConfig.drawerLabelKey]}
                    //     </Checkbox>
                    // );
                })
            );
        }

        renderFormSideBar(): React.ReactNode {
            // 侧边栏渲染
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                drawerConfig = state!.drawerConfig,
                selectItem = drawerProps ? state![drawerProps.stateKey] : [],
                selectItems = drawerProps ? state![drawerProps.stateKey] : [];

            return (
                drawerConfig && (
                    <Container.Component direction={"column"} fill>
                        <NavBar.Component back={null} className="park-nav">
                            {drawerConfig.drawerTitle || drawerProps.title}
                        </NavBar.Component>

                        <Container.Component fill scrollable>
                            {drawerConfig.drawerMult ? (
                                <CheckList multiple={true} value={selectItems ? selectItems.map((item) => item[drawerConfig.drawerValueKey]) : []}>
                                    {this.renderMultItem()}
                                </CheckList>
                            ) : (
                                <CheckList value={selectItem ? [selectItem[drawerConfig.drawerValueKey]] : []}>{this.renderRadioItem()}</CheckList>
                            )}
                        </Container.Component>
                        {this.renderButton()}
                    </Container.Component>
                )
            );
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
            this.dispatch({
                type: "update",
                data: { drawerProps: props, open: true, drawerConfig: props.drawerConfig || null },
            });
        }

        renderInput(props: WBInputProps): React.ReactNode {
            const { state } = this.props,
                open = state!.open,
                drawerConfig = state!.drawerConfig,
                drawerDatas = props.drawerConfig?.drawerDatasStateKey ? state![props.drawerConfig.drawerDatasStateKey] : null,
                value = state![props.stateKey];

            this.setFormFieldValue(this.formRef, props.stateKey, value);

            if (props.drawerConfig && props.drawerConfig.drawerDatasStateKey && open && drawerDatas && !drawerConfig?.drawerData) {
                this.drawerOpen(props);
            }
            // 输入框渲染
            let param: any = {
                placeholder: props.placeholder,
                labelNumber: 6,
                type: props.type || "text",
                readOnly: props.readOnly,
            };
            if (props.clickType === clickTypeEnum.drawer) {
                let value = this.getInputDrawerValue(props);

                return (
                    <Form.Item
                        onClick={() => {
                            if (props.onClick) {
                                props.onClick(() => {
                                    this.drawerOpen(props);
                                });
                                return;
                            }
                            this.drawerOpen(props);
                        }}
                        name={props.stateKey}
                        label={props.title}
                        required={props.isRequired}
                        shouldUpdate={false}
                    >
                        {value ? value : props.placeholder}
                    </Form.Item>
                );
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
                return (
                    <Form.Item name={props.stateKey} label={props.title} required={props.isRequired}>
                        <Input initialValues={value} {...param} key={props.stateKey} />
                    </Form.Item>
                );
            }
        }

        /*——————————————————————————————单行输入框end——————————————————————————————*/

        /*——————————————————————————————数据选择器start——————————————————————————————*/
        renderPick(props: WBPickProps): React.ReactNode {
            const { state } = this.props,
                value = state![props.stateKey],
                visible = state![`${props.stateKey}pickVisible`];
            let config = props.config;
            if (!config.cascade) {
                return (
                    <Form.Item
                        name={props.stateKey}
                        label={props.title}
                        rules={[{ required: props.isRequired }]}
                        onClick={() => this.dispatch({ type: "input", data: { [`${props.stateKey}pickVisible`]: true } })}
                    >
                        <Picker
                            visible={visible}
                            value={value}
                            onConfirm={(value) => {
                                this.dispatch({
                                    type: "input",
                                    data: { [`${props.stateKey}pickVisible`]: !visible, [props.stateKey]: value },
                                });
                                if (props.onChange) {
                                    props.onChange(value);
                                }
                            }}
                            onClose={() => this.dispatch({ type: "input", data: { [`${props.stateKey}pickVisible`]: false } })}
                            columns={config?.data || []}
                            title={props.title}
                        >
                            {(items) => {
                                if (items.every((item) => item === null)) {
                                    return props.placeholder;
                                } else {
                                    return items.map((item) => item?.label ?? props.placeholder).join(" - ");
                                }
                            }}
                        </Picker>
                    </Form.Item>
                );
            }
            return (
                <Form.Item
                    name={props.stateKey}
                    label={props.title}
                    rules={[{ required: props.isRequired }]}
                    onClick={() => this.dispatch({ type: "input", data: { [`${props.stateKey}pickVisible`]: true } })}
                >
                    <CascadePicker
                        title={config!.title}
                        options={config?.data || []}
                        value={value}
                        visible={visible}
                        onClose={() => this.dispatch({ type: "input", data: { [`${props.stateKey}pickVisible`]: false } })}
                        onConfirm={(value) => {
                            this.dispatch({ type: "input", data: { [props.stateKey]: value } });
                            if (props.onChange) {
                                props.onChange(value);
                            }
                        }}
                    />
                    {value ? value.join(",") : "请选择"}
                </Form.Item>
            );
        }

        /*——————————————————————————————数据选择器end——————————————————————————————*/

        /*——————————————————————————————日期时间选择器start——————————————————————————————*/
        renderDatePick(props: WBDatePickProps): React.ReactNode {
            const { state } = this.props,
                visible = state![`${props.stateKey}visible`],
                value = state![props.stateKey] || new Date();
            let prop: any = {};
            if (props.format) {
                prop.format = (value: Date) => formatDate(value, props.format);
            }
            return (
                <Form.Item
                    name={props.stateKey}
                    label={props.title}
                    rules={[{ required: props.isRequired }]}
                    onClick={() => {
                        this.dispatch({ type: "input", data: { [`${props.stateKey}visible`]: !visible } });
                    }}
                >
                    <DatePicker
                        defaultValue={new Date()}
                        visible={visible}
                        precision={props.mode}
                        title={props.placeholder}
                        max={props.maxDate}
                        min={props.minDate}
                        value={getDate(value)}
                        {...prop}
                        onClose={() => this.dispatch({ type: "input", data: { [`${props.stateKey}visible`]: false } })}
                        onConfirm={(date) => {
                            this.dispatch({
                                type: "input",
                                data: { [props.stateKey]: date, [`${props.stateKey}visible`]: !visible },
                            });
                            if (props.onChange) {
                                props.onChange(date);
                            }
                        }}
                    >
                        {(value) => {
                            if (value) {
                                if (props.mode === "day") {
                                    return formatDate(value);
                                } else if (prop.mode === "second") {
                                    return formatDateTime(value);
                                } else {
                                    return formatDate(value);
                                }
                            } else {
                                return "请选择";
                            }
                        }}
                    </DatePicker>
                </Form.Item>
            );
        }

        /*——————————————————————————————日期时间选择器end——————————————————————————————*/

        /*——————————————————————————————多行文本框start——————————————————————————————*/
        renderTextarea(props: WBTextareaProps): React.ReactNode {
            const { state } = this.props,
                value = state![props.stateKey];
            return (
                <Form.Item name={props.stateKey} label={props.title} rules={[{ required: props.isRequired }]}>
                    <TextArea
                        onChange={(v) => {
                            this.dispatch({ type: "input", data: { [props.stateKey]: v } });
                            if (props.onChange) {
                                props.onChange(v);
                            }
                        }}
                        placeholder={props.placeholder}
                        value={value}
                        rows={props.rows}
                    />
                </Form.Item>
            );
        }

        /*——————————————————————————————多行文本框end——————————————————————————————*/

        /*——————————————————————————————标签选择start——————————————————————————————*/
        /**
         * 多选标签变化
         * @param isChecked 是否多选
         */
        onModelChange(props: WBTagListProps, item: any, valueMap: string, isMultiple?: boolean) {
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
            return !!filter;
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

            let tagsDataArr = [] as any;
            (tagsData || []).forEach((tag, i) => {
                if (props.foldnum && i > tagFoldnum - 1) {
                    return null;
                }
                if (props.filterKey && !tag[props.filterKey]) {
                    return null;
                }
                tagsDataArr.push(tag);
            });

            return (
                <>
                    <Selector
                        multiple={props.multiple}
                        options={tagsDataArr}
                        value={selectedTags}
                        onChange={(v) => {
                            this.dispatch({ type: "input", data: { [props.stateKey]: v } });
                            props.onChange && props.onChange(v);
                        }}
                    />
                    {foldnum && tagFoldnum < tagsData.length && (
                        <a
                            className="reco-selector-more"
                            onClick={() => {
                                this.dispatch({
                                    type: "input",
                                    data: { [`${props.stateKey}num`]: tagFoldnum + foldnum },
                                });
                            }}
                        >
                            {props.foldTitle ? props.foldTitle : "更多"}
                        </a>
                    )}
                </>
            );
        }

        /**
         * 列表标签
         */
        renderTagsList(props: WBTagListProps): React.ReactNode {
            const { state } = this.props,
                // selectedTags = state![props.stateKey] || [],
                selectedTags = JSON.parse(JSON.stringify(state![props.stateKey] || [])),
                tagsData = props.tagsData;
            if (props.multiple) {
                return (
                    <CheckList mode="card" multiple={true} value={selectedTags ? selectedTags.map((item) => item[props.tagValueKey]) : []}>
                        {(tagsData || []).map((tag, i) => {
                            return (
                                <CheckList.Item
                                    onClick={() => {
                                        if (this.isChecked(selectedTags, tag, props.tagValueKey)) {
                                            let filter = selectedTags.filter((x) => x[props.tagValueKey] !== tag[props.tagValueKey]);
                                            this.dispatch({ type: "input", data: { [props.stateKey]: filter } });
                                        } else {
                                            if (props.maxSelectNum && props.maxSelectNum <= selectedTags.length) {
                                                let error = props.maxSelectError;
                                                error && error();
                                            } else {
                                                selectedTags.push(tag);
                                                this.dispatch({ type: "input", data: { [props.stateKey]: selectedTags } });
                                            }
                                        }
                                    }}
                                    key={i}
                                    value={tag[props.tagValueKey]}
                                >
                                    {tag[props.tagLabelKey]}
                                </CheckList.Item>
                            );
                        })}
                    </CheckList>
                );
            } else {
                return (
                    <CheckList mode="card" value={selectedTags ? [selectedTags[props.tagValueKey]] : []}>
                        {(tagsData || []).map((tag, i) => {
                            return (
                                <CheckList.Item
                                    onClick={() => {
                                        this.dispatch({
                                            type: "update",
                                            data: { [props.stateKey]: tag },
                                        });
                                    }}
                                    key={i}
                                    value={tag[props.tagValueKey]}
                                >
                                    {tag[props.tagLabelKey]}
                                </CheckList.Item>
                            );
                        })}
                    </CheckList>
                );
            }
        }

        renderTagsLine(props: WBTagListProps): React.ReactNode {
            const { state } = this.props,
                selectedTags = state![props.stateKey] || [],
                tagsData = props.tagsData;

            return (
                <Space>
                    {(tagsData || []).map((tag, i) => {
                        return (
                            <span key={i} onClick={() => this.onModelChange(props, tag, props.stateKey, props.multiple)}>
                                <Checkbox checked={this.isChecked(selectedTags, tag, props.tagValueKey)}>{tag[props.tagLabelKey || "label"]}</Checkbox>
                            </span>
                        );
                    })}
                </Space>
            );
        }

        /*——————————————————————————————标签选择end——————————————————————————————*/

        render(): React.ReactNode {
            const sidebar = this.renderFormSideBar() as any;
            const { state } = this.props,
                drawerProps = state!.drawerProps,
                open = state!.open;
            return (
                <>
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
                    <Popup
                        {...drawerProps}
                        onMaskClick={() => {
                            this.dispatch({ type: "update", data: { open: false } });
                        }}
                        on
                        visible={open}
                        position="right"
                    >
                        {sidebar}
                    </Popup>
                </>
            );
        }
    }
}
