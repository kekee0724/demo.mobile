import React from "react";

import { ViewComponent } from "@reco-m/core-ui";

export namespace PickerContent {
    export interface IProps extends ViewComponent.IProps {
        title?: any;
        condition?: any;
        trueContent?: any;
        falseContent?: any;
        must?: any;
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
        }
        render(): React.ReactNode {
            const { title, condition, trueContent, falseContent, must } = this.props;

            return (
                <div>
                    <div className="am-list-item am-input-item am-list-item-middle">
                        <div className="am-list-line">
                            <div className="am-input-label am-input-label-5">{title}{must && <span className="color-red">*</span>}</div>
                            <div className="am-input-control">{condition ? <div>{trueContent}</div> : <div className="gray-four-color">{falseContent}</div>}</div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}
