import React from "react";
import classnames from "classnames";

import { ClassValue } from "./type";

export namespace PureComponent {
    const CLASSNAMES = {
        disabled: "disabled",
        active: "active",
    };

    export interface IProps {
        children?: React.ReactNode;
        key?: React.Key;
        ref?: React.LegacyRef<any>;
        classPrefix?: string;
        active?: boolean | string;
        selected?: boolean | string;
        disabled?: boolean;
        className?: string;
    }

    export interface IState {}

    export abstract class Base<P extends IProps = IProps, S = any> extends React.Component<P, S> {
        constructor(props: P, context: any) {
            super(props, context);

            this.state = this.getInitState(props);
        }

        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {} as any;
        }

        shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
            if (!shallowCompare(nextProps, this.props)) {
                this.componentReceiveProps(nextProps, nextContext);
            }

            return !(fullShallowCompare(nextProps, this.props) && nextState === this.state);
        }

        protected componentReceiveProps(_nextProps: Readonly<P>, _nextContext: any): void {}

        setClassNS(classPrefix?: string): string {
            return classPrefix! || this.props.classPrefix! || "";
        }

        getClassSet(ignorePrefix?: boolean) {
            let classNames = {};
            const { active, selected, disabled } = this.props;

            if (this.props.classPrefix) {
                const classPrefix = this.setClassNS();

                // don't return prefix if ignore flag set
                !ignorePrefix && (classNames[classPrefix] = true);
            }

            classNames[CLASSNAMES["active"]] = active || selected;
            classNames[CLASSNAMES["disabled"]] = disabled;

            return classNames;
        }

        prefixClass(subClass?) {
            return this.setClassNS() + "-" + subClass;
        }

        protected classnames(...classes: ClassValue[]) {
            return classnames(...classes);
        }
    }
}

function shallowCompare(a: any, b: any) {
    const akeys = Object.keys(a),
        bkeys = Object.keys(b);

    return akeys.length === bkeys.length && !akeys.concat(bkeys).some((key) => key !== "children" && a[key] !== b[key]);
}

function fullShallowCompare(a: any, b: any) {
    const akeys = Object.keys(a),
        bkeys = Object.keys(b);

    return akeys.length === bkeys.length && !akeys.concat(bkeys).some((key) => a[key] !== b[key]);
}
