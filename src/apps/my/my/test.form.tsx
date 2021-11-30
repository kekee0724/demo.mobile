import React from "react";

import { List } from "antd-mobile";

import { template } from "@reco-m/core";

import { Namespaces, testModel } from "@reco-m/my-models";

import { WBFormViewComponent, clickTypeEnum, ListTitle } from "@reco-m/core-ui";

export namespace IparkTestForm {
    export interface IProps<S extends IState = IState> extends WBFormViewComponent.IProps<S> {}

    export interface IState extends WBFormViewComponent.IState, testModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends WBFormViewComponent.Component<P, S> {
        isRoot = true;
        showloading = false;
        headerContent = "常用表单封装";
        namespace = Namespaces.coretest;
        view;
        showback = false;
        componentDidMount() {
            this.dispatch({ type: "input", data: { minzu: "汉族" } });
        }
        renderBody() {
            // setTimeout(() => {
            //     console.log(this.props.state);
            // }, 1000);
            return (
                <div>
                    <ListTitle>基本信息</ListTitle>
                    {this.renderForm({
                        children: (
                            <>
                                {this.renderInput({
                                    title: "姓名",
                                    stateKey: "name",
                                    placeholder: "请输入姓名",
                                    isRequired: true,
                                    // rollTitle: true,
                                })}
                                {this.renderInput({
                                    title: "民族",
                                    stateKey: "minzu",
                                    readOnly: true,
                                })}
                                {this.renderInput({
                                    title: "职业超长测试123",
                                    stateKey: "profession",
                                    placeholder: "请选择职业",
                                    clickType: clickTypeEnum.drawer,
                                    isRequired: true,
                                    rollTitle: true,
                                    drawerConfig: {
                                        drawerData: [
                                            { label: "医生", value: 1 },
                                            { label: "警察", value: 2 },
                                            { label: "工人", value: 3 },
                                            { label: "农民", value: 4 },
                                            { label: "公务员", value: 5 },
                                            { label: "学生", value: 6 },
                                            { label: "学生2", value: 7 },
                                            { label: null, value: 8 },
                                        ],
                                        drawerLabelKey: "label",
                                        drawerValueKey: "value",
                                        drawerMult: true,
                                        filterKey: "label", // 过滤掉label为空的
                                    },
                                })}
                                {this.renderPick({
                                    title: "购买日期",
                                    stateKey: "buydate",
                                    placeholder: "请选择购买日期",
                                    isRequired: true,
                                    rollTitle: true,
                                    config: {
                                        data: [
                                            [
                                                {
                                                    label: "2013",
                                                    value: "13value",
                                                },
                                                {
                                                    label: "2014",
                                                    value: "14value",
                                                },
                                            ],
                                        ],
                                        title: "选择购买日期",
                                        cascade: false, // 是否联动
                                    },
                                })}
                                {/* 多行联动输入 */}
                                {this.renderPick({
                                    title: "住址",
                                    stateKey: "address",
                                    placeholder: "请选择住址",
                                    isRequired: true,
                                    rollTitle: true,
                                    config: {
                                        data: [
                                            {
                                                label: "河南",
                                                value: "河南",
                                                children: [
                                                    {
                                                        label: "商丘",
                                                        value: "商丘",
                                                    },
                                                    {
                                                        label: "郑州",
                                                        value: "郑州",
                                                    },
                                                ],
                                            },
                                            {
                                                label: "上海",
                                                value: "上海",
                                                children: [
                                                    {
                                                        label: "浦东",
                                                        value: "浦东",
                                                    },
                                                    {
                                                        label: "黄埔区",
                                                        value: "黄埔区",
                                                    },
                                                ],
                                            },
                                        ],
                                        title: "选择住址",
                                        cascade: true, // 是否联动
                                        cols: 2, // 列数
                                    },
                                })}
                                {this.renderDatePick({
                                    title: "生日",
                                    stateKey: "birthday",
                                    placeholder: "请选择生日",
                                    mode: "day",
                                    maxDate: new Date(),
                                    minDate: new Date(1900, 0, 1),
                                    format: "yyyy/MM/dd",
                                    isRequired: true,
                                    rollTitle: true,
                                })}
                                {this.renderTextarea({
                                    title: "备注",
                                    placeholder: "请输入备注内容",
                                    stateKey: "remark",
                                    isRequired: true,
                                    rows: 3,
                                    rollTitle: true,
                                })}
                            </>
                        ),
                    })}
                    <ListTitle>物业项目</ListTitle>
                    <List>
                        <List.Item>
                            {this.renderTags({
                                stateKey: "projects",
                                tagsData: [
                                    { label: "张江一期", value: 11 },
                                    { label: "张江二期", value: 21 },
                                    { label: "张江三期", value: 31 },
                                    { label: "张江四期", value: 41 },
                                ],
                                multiple: false,
                            })}
                        </List.Item>
                    </List>
                    <ListTitle>设备小标签</ListTitle>
                    <List>
                        <List.Item>
                            {this.renderTags({
                                stateKey: "devicessamll",
                                tagsData: [
                                    { label: "投影仪", value: 1 },
                                    { label: "欢迎屏", value: 2 },
                                    { label: "笔记本", value: 3 },
                                    { label: "钢笔", value: 4 },
                                    { label: "麦克风", value: 5 },
                                    { label: "钢笔2", value: 6 },
                                    { label: "麦克风2", value: 7 },
                                ],
                                multiple: true,

                                maxSelectNum: 2,
                                maxSelectError: () => {
                                    console.log("最多选择两个!!");
                                },
                                foldnum: 6,
                            })}
                        </List.Item>
                    </List>
                    <ListTitle>设备大标签</ListTitle>
                    <List>
                        <List.Item>
                            {this.renderTags({
                                stateKey: "devicesbig",
                                tagsData: [
                                    { label: "投影仪", value: 11 },
                                    { label: "欢迎屏", value: 21 },
                                    { label: "笔记本", value: 31 },
                                    { label: "钢笔", value: 41 },
                                    { label: "麦克风", value: 51 },
                                ],
                                multiple: true,
                                foldnum: 2,
                                foldTitle: "more",
                            })}
                        </List.Item>
                    </List>
                    <ListTitle>设备标签多选列表</ListTitle>
                    {this.renderTagsList({
                        stateKey: "devicesListMul",
                        tagsData: [
                            { tagName: "投影仪", tagValue: 1 },
                            { tagName: "欢迎屏", tagValue: 2 },
                            { tagName: "笔记本", tagValue: 3 },
                            { tagName: "钢笔", tagValue: 4 },
                            { tagName: "麦克风", tagValue: 5 },
                        ],
                        multiple: true,
                        tagLabelKey: "tagName",
                        tagValueKey: "tagValue",
                    })}
                    <ListTitle>设备标签列表单选</ListTitle>
                    {this.renderTagsList({
                        stateKey: "devicesList",
                        tagsData: [
                            { tagName: "投影仪", tagValue: 1 },
                            { tagName: "欢迎屏", tagValue: 2 },
                            { tagName: "笔记本", tagValue: 3 },
                            { tagName: "钢笔", tagValue: 4 },
                            { tagName: "麦克风", tagValue: 5 },
                        ],
                        multiple: false,
                        tagLabelKey: "tagName",
                        tagValueKey: "tagValue",
                    })}
                    <ListTitle>单选</ListTitle>
                    <List>
                        <List.Item prefix="单行标签选择">
                            {this.renderTagsLine({
                                stateKey: "devicesTag",
                                tagsData: [
                                    { tagName: "是", tagValue: true },
                                    { tagName: "否", tagValue: false },
                                ],
                                multiple: false,
                                tagLabelKey: "tagName",
                                tagValueKey: "tagValue",
                            })}
                        </List.Item>
                    </List>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.coretest]);
}
