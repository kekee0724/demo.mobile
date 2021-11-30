import React from "react";

import { List, InputItem } from "antd-mobile-v2";

import { ViewComponent } from "@reco-m/core-ui";
export namespace ContactInfo {
    export interface IProps extends ViewComponent.IProps {
        state?: any;
        header?: any;
        count: any;
        changeStateInfo?(type: any, data: any);
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
        }
        render(): React.ReactNode {
            const { header, count, state, changeStateInfo } = this.props;

            return (
                <List renderHeader={header ? header : "联系人信息"} className="my-list">
                    {count >= 1 ? (
                        <InputItem
                            placeholder={`请输入姓名(必填)`}
                            type={"text"}
                            value={state!.contactName}
                            onChange={e => changeStateInfo && changeStateInfo("input", { contactName: e, isEdit: true })}
                        >
                            姓名
                        </InputItem>
                    ) : (
                            null
                        )}
                    {count >= 2 ? (
                        <InputItem
                            placeholder={`请输入手机号码(必填)`}
                            type={"number"}
                            value={state!.contactMobile}
                            onChange={e => changeStateInfo && changeStateInfo("input", { contactMobile: e, isEdit: true })}
                        >
                            手机号码
                        </InputItem>
                    ) : (
                            null
                        )}
                    {count >= 3 ? (
                        <InputItem
                            placeholder={`请输入邮箱(必填)`}
                            type={"text"}
                            value={state!.contactEmail}
                            onChange={e => changeStateInfo && changeStateInfo("input", { contactEmail: e, isEdit: true })}
                        >
                            邮箱
                        </InputItem>
                    ) : (
                            null
                        )}
                    {!state!.institution && count >= 4 ? (
                        <InputItem
                            placeholder={`请输入公司名称`}
                            type={"text"}
                            value={state!.companyName}
                            onChange={e => changeStateInfo && changeStateInfo("input", { companyName: e, isEdit: true })}
                        >
                            公司名称
                        </InputItem>
                    ) : state!.institution && count >= 4 ? (
                        <InputItem
                            placeholder={`请输入机构名称`}
                            type={"text"}
                            value={state!.institution && (state!.institution.OrganizationNameNew || state!.institution.Organization.OrganizationName)}
                            onChange={e => changeStateInfo && changeStateInfo("input", { institutionName: e, isEdit: true })}
                        >
                            机构名称
                        </InputItem>
                    ) : (
                                null
                            )}
                </List>
            );
        }
    }
}
