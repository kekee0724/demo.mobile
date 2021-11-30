import React from "react";

import { List, Radio } from "antd-mobile";

import { template, setLocalStorage, getLocalStorage } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";

import { Namespaces, myCompanyModel } from "@reco-m/my-models";

export namespace MyCompany {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, myCompanyModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "切换企业";
        namespace = Namespaces.mycompany;
        bodyClass = "container-hidden";

        componentMount() {
            this.dispatch({ type: "initPage" });
        }

        onChange(unit: any) {
            setLocalStorage("unitName", unit.name);
            setLocalStorage("unitId", unit.id);

            this.dispatch({ type: "input", data: { unit: unit } });
        }

        renderBody(): React.ReactNode {
            let { state } = this.props;
            const units = state!.units;
            let unitName = getLocalStorage("unitName") ? getLocalStorage("unitName") : units && units.length > 0 ? units && units[0].name : "";
            let unitId = getLocalStorage("unitId") ? getLocalStorage("unitId") : units && units.length > 0 ? units && units[0].id : "";
            return (
                <div>
                    <div className="comname nycomname border-bottom-1px">
                        <span>{unitName}</span>
                        <a>当前企业</a>
                    </div>
                    <div>选择切换企业</div>
                    <List className="comqy">
                        {units &&
                            units.map((unit, i) => (
                                <Radio key={i} onChange={() => this.onChange(unit)} checked={unit.id === unitId}>
                                    {unit.name}
                                </Radio>
                            ))}
                    </List>
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.mycompany]);
}
