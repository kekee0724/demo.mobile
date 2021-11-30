import React from "react";

import { List, InputItem, NavBar, Toast } from "antd-mobile-v2";

import { template, Validators } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { accountEditModel, judgeInfo, Namespaces } from "@reco-m/ipark-auth-models";
let type;
export namespace AccountViewEditInput {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, accountEditModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.accountEdit;
        name = "";
        defaultValue = "";
        componentDidMount() {
            setEventWithLabel(statisticsEvent.userNameView);
            type = this.props.match!.params.type;
            this.name = this.props.match!.params.name;
            this.defaultValue = this.getvalue();
            this.dispatch({ type: "input", data: { random: Math.random() } });
        }

        renderHeaderLeft(): React.ReactNode {
            return (
                <span
                    onClick={() => {
                        let datas = {};
                        datas[type] = this.defaultValue;
                        this.dispatch({ type: "input", data: datas });
                        this.goBack();
                    }}
                >
                    取消
                </span>
            );
        }

        renderHeaderRight(): React.ReactNode {
            return (
                <span
                    onClick={() => {
                        const msg = this.validator()!();
                        if (msg) {
                            Toast.fail(msg.join(), 1);
                            return;
                        }
                        this.submit();
                        this.goBack();
                    }}
                >
                    保存
                </span>
            );
        }
        validator() {
            const { composeControl, email, ValidatorControl, required } = Validators,
                { state } = this.props;

            return ValidatorControl(composeControl([required], { value: state!.nickName, name: "昵称" }), composeControl([email], { value: state!.email, name: "邮箱" }));
        }
        submit() {
            const { state } = this.props;
            const count = judgeInfo(state);
            this.dispatch({ type: "saveTagInfo" });
            this.dispatch({
                type: "saveData",
                count,
                callback: () => {
                    setEventWithLabel(statisticsEvent.modificationPersonalData); // 修改个人资料统计
                },
            });
        }
        renderHeaderContent(): React.ReactNode {
            return <span>{this.props.match!.params.name}</span>;
        }

        renderHeader(): React.ReactNode {
            return (
                <NavBar className="park-nav" leftContent={this.renderHeaderLeft() as any} rightContent={this.renderHeaderRight()}>
                    {this.renderHeaderContent()}
                </NavBar>
            );
        }
        getvalue() {
            const { state } = this.props;
            if (type === "RealNameedit") {
                return state!.realName ? state!.realName : state!.RealNameedit;
            } else {
                return state![type];
            }
        }
        inputItemOnChange(e) {
            let datas = {};
            if (type === "nickName" && e && e.length > 15) {
                Toast.fail(`${this.name}不能超过15字符`);
                return;
            }
            if (type === "realName" && e && e.length > 8) {
                Toast.fail(`${this.name}不能超过8字符`);
                return;
            }
            if (type === "email" && e && e.length > 30) {
                Toast.fail(`${this.name}不能超过30字符`);
                return;
            }
            if (type === "idiograph" && e && e.length > 30) {
                Toast.fail(`${this.name}不能超过30字符`);
                return;
            }
            datas[type] = e;
            console.log("datas", datas);

            this.dispatch({ type: "input", data: datas });
        }
        renderBody(): React.ReactNode {
            return (
                type && (
                    <List>
                        <InputItem
                            autoFocus
                            clear
                            placeholder={`请输入${this.name}`}
                            value={this.getvalue()}
                            onChange={this.inputItemOnChange.bind(this)}
                        ></InputItem>
                    </List>
                )
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.accountEdit]);
}
