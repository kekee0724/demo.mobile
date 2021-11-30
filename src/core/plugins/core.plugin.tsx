import PropTypes from "prop-types";

import { PureComponent } from "../container/pure-component";

export namespace CorePlugin {
    export interface IProps extends PureComponent.IProps {}

    export interface IState extends PureComponent.IState {}

    export abstract class Base<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static contextTypes = {
            registerPlugins: PropTypes.func,
            removePlugins: PropTypes.func,
        };

        protected isDestroy = false;

        constructor(props: P, context: any) {
            super(props, context);

            this.registerPlugin(context);
        }

        protected registerPlugin(context: any) {
            context.registerPlugins(this);
        }

        componentWillUnmount() {
            this.removePlugin();

            this.isDestroy = true;
        }

        protected removePlugin() {
            this.context.removePlugins(this);
        }

        abstract load<R = never>(tableId?: number, ...args: any[]): Promise<R | void>;

        abstract getInfo<R = never>(...args: any[]): R;

        abstract save<R = never>(tableId?: number, ...args: any[]): Promise<R | void>;
    }
}
