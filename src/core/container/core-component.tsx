import React from "react";
import PropTypes from "prop-types";
import { Action, AnyAction } from "redux";
import { SubscriptionAPI } from "dva";

import { LocationDescriptorObject } from "history";

import { resolvePath } from "../utils/resolve";
import { URLSearchParams, isAuth } from "../http";
import { PluginHost, CorePlugin, AttachPlugin, IAttachInfo } from "../plugins";

import { PageWrap, Location, Match, MessageInstance } from "./type";
import { PureComponent } from "./pure-component";

const PREFIX_REG = /^(\\|\/)/;

export namespace CoreComponent {
    export interface IProps<S = any> extends PureComponent.IProps, SubscriptionAPI {
        location?: Location;
        match?: Match;
        staticContext?: any;
        wrap?: PageWrap;
        state?: Readonly<S>;
    }

    export interface IState extends PureComponent.IState {}

    export abstract class Base<P extends IProps = IProps, S = any> extends PureComponent.Base<P, S> {
        static pageType = "page";

        static childContextTypes = {
            registerPlugins: PropTypes.func,
            removePlugins: PropTypes.func,
            goBack: PropTypes.func,
            goTo: PropTypes.func,
        };

        static defaultProps = {
            classPrefix: "view",
        } as any;

        static getDerivedStateFromProps<P extends IProps = IProps, S extends IState = IState>(props: P, state: S) {
            return props.state || state;
        }

        protected readonly namespace: string;
        protected message: MessageInstance;

        private _load: (corePlugin: CorePlugin.Base) => {};

        protected plugins = new PluginHost();

        constructor(props: P, context: any) {
            super(props, context);

            this.state = this.getInitState(props);
            this.message = this.createMessageTools();

            Promise.resolve().then(this.componentMount.bind(this));
        }

        protected getInitState(nextProps: Readonly<P>): Readonly<S> {
            return nextProps.state! as any || {};
        }

        protected componentMount() {}

        getChildContext() {
            return {
                registerPlugins: (plugin: any) => {
                    this._load && this._load(plugin);

                    this.registerPlugins(plugin);
                },
                removePlugins: this.removePlugins.bind(this),
                goBack: this.goBack.bind(this),
                goTo: this.goTo.bind(this),
            };
        }

        protected abstract createMessageTools(): MessageInstance;

        protected getHistory() {
            return this.props.history;
        }

        protected registerPlugins(plugin: CorePlugin.Base) {
            this.plugins.register(plugin);
        }

        protected removePlugins(plugin: CorePlugin.Base) {
            this.plugins.remove(plugin);
        }

        protected async loadPlugins<R = never>(tableId?: number, ...args: any[]) {
            this._load = (plugin) => plugin.load(tableId, ...args);

            return await Promise.all(this.mapPlugins((plugin) => plugin.load<R>(tableId, ...args)));
        }

        protected async loadAttach(tableId?: number) {
            this._load = (plugin) => plugin instanceof AttachPlugin.Base && plugin.load(tableId);

            return await Promise.all(this.mapAttachPlugins((plugin) => plugin.load(tableId)));
        }

        protected async getPluginsInfo<R = never>(...args: any[]) {
            return await Promise.all(this.mapPlugins((plugin) => plugin.getInfo<R>(...args)));
        }

        protected attachIsInProgress() {
            return !!this.plugins.find((plugin) => plugin instanceof AttachPlugin.Base && plugin.isInProgress());
        }

        getAttachInfo(): IAttachInfo[] {
            return this.mapAttachPlugins((plugin) => plugin.getInfo());
        }

        protected async savePlugins<R = never>(tableId?: number, ...args: any[]) {
            return await Promise.all(this.mapPlugins((plugin) => plugin.save<R>(tableId, ...args)));
        }

        protected async saveAttach(tableId?: number) {
            await Promise.all(this.mapAttachPlugins((plugin) => plugin.save(tableId)));
        }

        protected eachPlugins<T extends CorePlugin.Base>(func: (plugin: T) => void) {
            this.plugins.each<T>(func);
        }

        protected eachAttachPlugins<T extends AttachPlugin.Base>(func: (plugin: T) => void) {
            this.filterAttachPlugins().forEach(func);
        }

        protected mapPlugins<T extends CorePlugin.Base, R = never>(func: (plugin: T) => R): R[] {
            return this.plugins.map<T, R>(func);
        }

        protected mapAttachPlugins<T extends AttachPlugin.Base, R = never>(func: (plugin: T) => R): R[] {
            return this.filterAttachPlugins().map(func);
        }

        protected filterPlugins<T extends CorePlugin.Base, R>(func: (plugin: T) => R): T[] {
            return this.plugins.filter<T, R>(func);
        }

        protected filterAttachPlugins<T extends AttachPlugin.Base>(): T[] {
            return this.filterPlugins<T, boolean>((plugin) => plugin instanceof AttachPlugin.Base);
        }

        inputData(data: any) {
            return this.dispatch("input", data);
        }

        dispatch<A extends Action = AnyAction>(action: A | string, data?: any) {
            const target: any = typeof action === "string" ? { type: action, data } : action;

            if (!/\//.test(target.type)) {
                if (!this.namespace) throw new Error("必须通过属性 namespace 设置页面所属命名空间。");

                target.type = `${this.namespace}/${target.type}`;
            }

            target && (data && (target.data = data), (target.message = this.message));

            return this.props.dispatch(target);
        }

        getSearchParams(nextProps?: Readonly<P>) {
            const { match, location } = nextProps || this.props;

            return location && match && (match!.searchParams || (match!.searchParams = new URLSearchParams(this.props.location && this.props.location!.search)));
        }

        getSearchParam(key: string, nextProps?: Readonly<P>) {
            const { match } = nextProps || this.props;

            return (match && (match.searchParams || this.getSearchParams(nextProps)) && match.searchParams!.get(key)) || "";
        }

        renderEmbeddedView<P1, T extends React.Component<P1, React.ComponentState>, C extends React.ComponentClass<P1>>(
            component: React.ClassType<P1, T, C>,
            props?: React.ClassAttributes<T> & P1,
            ...children: React.ReactNode[]
        ) {
            const { history, location, match, staticContext, wrap } = this.props;

            return React.createElement(
                component,
                {
                    history,
                    location,
                    match,
                    staticContext,
                    wrap,
                    ...(props as any),
                },
                ...children
            );
        }

        goBack(e?: MouseEvent | boolean) {
            this.__goBack(e);
        }

        protected __goBack(e?: MouseEvent | boolean) {
            this.props.wrap ? this.props.wrap!.goBack(e) : this.getHistory().goBack();
        }

        goTo(path: string | LocationDescriptorObject, state?: any) {
            this.__goTo(this.resolveRoutePath(path, state), state);
        }

        protected __goTo(path: string | LocationDescriptorObject, state?: any) {
            this.getHistory().push(path as any, state);
        }

        jump(path: string | LocationDescriptorObject, state?: any) {
            this.__jump(this.resolveRoutePath(path, state), state);
        }

        protected __jump(path: string | LocationDescriptorObject, state?: any) {
            this.getHistory().replace(path as any, state);
        }

        protected resolveRoutePath(path: string | LocationDescriptorObject, _state?: any) {
            const { match } = this.props,
                history = this.getHistory();

            if ((match || history) && path) {
                let isString = typeof path === "string",
                    paths = isString ? (path as string) : (path as LocationDescriptorObject).pathname;

                if (!PREFIX_REG.test(paths!)) {
                    paths = resolvePath(match ? match!.url! : history.location.pathname, paths!);

                    isString ? (path = paths) : ((path as LocationDescriptorObject).pathname = paths);
                }
            }

            return path;
        }

        isAuth() {
            return isAuth();
        }
    }
}
