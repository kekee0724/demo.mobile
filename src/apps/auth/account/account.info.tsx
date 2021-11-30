import React from "react";

import { List, Picker, DatePicker, Image, Button, Toast } from "antd-mobile";

import { template, getDate, formatDate, browser } from "@reco-m/core";
import { ViewComponent, Picture, setNavTitle } from "@reco-m/core-ui";
import { Namespaces, accountinfoModel, genderTypes } from "@reco-m/auth-models";
export namespace AccountInfo {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, accountinfoModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "个人信息";
        namespace = Namespaces.accountinfo;

        componentDidMount() {
            setNavTitle.call(this, this.headerContent)
            this.dispatch({ type: "initPage" });
        }
        componentReceiveProps(nextProps: IProps) {
            setNavTitle.call(this, this.headerContent, nextProps)
        }
        componentWillUnmount() {
            if (!browser.versions.weChat) {
                this.save()
            }

        }
        /**
         * 保存
         */
        save() {
            this.dispatch({
                type: "modifyPersonInfoAction", callback: (id) => {
                    this.saveAttach(id)
                    Toast.show({
                        icon: "success",
                        content: "保存成功",
                    });
                }
            });
        }

        // 渲染编辑头像
        renderHeadImage(thumb): React.ReactNode {
            return (
                <div className="am-list-item am-list-item-middle">
                    <div className="am-list-line">
                        <div className="am-input-label am-input-label-5">头像</div>
                        <div className="my-upload-box">
                            <a className="my-upload-button">
                                <Picture.Component
                                    fileNumLimit={1}
                                    customType={1}
                                    tableName="sys_account"
                                    uploadSuccess={(_file, data) => {
                                        this.dispatch({
                                            type: "input",
                                            data: { thumb: { filePath: data.url } },
                                        });
                                    }}
                                />
                                <Image src={thumb?.filePath} width={80} height={80} />
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                info = state!.info,
                thumb = state!.thumb,
                depart = state!.depart,
                birthday = state!.birthday,
                gender = state!.gender,
                visibleBirthday = state!.visibleBirthday,
                visible = state!.visible;

            return (
                <List className="account-info-list">
                    {this.renderHeadImage(thumb)}
                    <List.Item extra={info?.realName}>姓名</List.Item>
                    <List.Item extra={info?.mobile}>电话</List.Item>
                    <List.Item extra={info?.email}>邮箱</List.Item>
                    <List.Item
                        onClick={() => {
                            this.dispatch({ type: "input", data: { visible: !visible } });
                        }}
                    >
                        性别
                        {/* <div>{gender && [gender]}</div> */}
                        {/* <Picker
                                value={gender && [gender]}
                                onConfirm={value => {
                                    this.dispatch({ type: "input", data: { gender: value![0] } })
                                }}
                                columns={[genderTypes]}
                            /> */}
                        <Picker
                            visible={visible}
                            value={gender && [gender]}
                            onConfirm={(value) => {
                                this.dispatch({ type: "input", data: { gender: value![0], visible: !visible } });
                            }}
                            columns={[genderTypes]}
                        >
                            {(items) => {
                                if (items.every((item) => item === null)) {
                                    return "未选择";
                                } else {
                                    return items.map((item) => item?.label ?? "未选择").join(" - ");
                                }
                            }}
                        </Picker>
                    </List.Item>
                    <List.Item
                        onClick={() => {
                            this.dispatch({ type: "input", data: { visibleBirthday: !visibleBirthday } });
                        }}
                    >
                        生日
                        <DatePicker
                            visible={visibleBirthday}
                            title="选择生日"
                            max={new Date()}
                            min={new Date(1900, 0, 1)}
                            value={getDate(birthday)}
                            onConfirm={(date) => {
                                this.dispatch({ type: "input", data: { birthday: date, visibleBirthday: !visibleBirthday } });
                            }}
                        >
                            {(value) => {
                                if (value) {
                                    return formatDate(value);
                                } else {
                                    return "请选择";
                                }
                            }}
                        </DatePicker>
                    </List.Item>
                    <List.Item extra={depart?.unitName}>所在企业</List.Item>
                    <List.Item extra={depart?.deptName}>部门</List.Item>
                    <List.Item extra={depart?.positionName}>岗位</List.Item>
                </List>
            );
        }

        renderFooter(): React.ReactNode {
            return browser.versions.weChatMini ? <Button
                color="primary"
                style={{ borderRadius: 0 }}
                onClick={() => {
                    this.save();
                }}
            >
                保存
            </Button> : null

        }

    }

    export const Page = template(Component, (state) => state[Namespaces.accountinfo]);
}
