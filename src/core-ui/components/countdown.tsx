import React from "react";

import { PureComponent, setLocalStorage, formatDateTime, getLocalStorage, getDate, removeLocalStorage } from "@reco-m/core";

export namespace Countdown {
    export interface IProps extends PureComponent.IProps {
        start: (ctrl: Component) => boolean | void;

        content?: string;

        className?;

        type: string;
    }

    export interface IState extends PureComponent.IState {
        delay: number;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: Countdown.IProps = {
            className: "",
        } as any;

        protected interval;

        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return { delay: 0 } as any;
        }

        componentDidMount() {
            this.getTime();
        }

        componentWillUnmount() {
            this.setTime();
            this.clearInterval();
        }

        getTime() {
            if (this.props.type) {
                let delayTime = getLocalStorage(this.props.type);

                if (delayTime) {
                    let delay = +getLocalStorage(`${this.props.type}delay`);
                    let newData = new Date();
                    let time = newData.dateDiff("s", getDate(delayTime) as any) || 0;
                    let countdown = delay - time;
                    if (countdown > 0) {
                        this.setState({ delay: countdown });
                        this.creatInterval();
                    }
                    removeLocalStorage(this.props.type);
                    removeLocalStorage(`${this.props.type}delay`);
                }
            }
        }

        setTime() {
            const { delay } = this.state;
            if (this.props.type && delay > 0) {
                setLocalStorage(this.props.type, formatDateTime(new Date()));
                setLocalStorage(`${this.props.type}delay`, `${delay}`);
            }
        }

        protected clearInterval() {
            this.interval && clearInterval(this.interval);
        }

        start() {
            this.clearInterval();

            this.setState({ delay: 60 });

            this.creatInterval();

            return this.cancel.bind(this);
        }

        creatInterval() {
            this.interval = setInterval(() => {
                const { delay } = this.state;
                this.setTime();
                if (delay > 0) this.setState({ delay: delay - 1 });
                else this.clearInterval();
            }, 1000);
        }

        cancel() {
            this.setState({ delay: 0 });

            this.clearInterval();
        }

        render(): React.ReactNode {
            const { delay } = this.state,
                { start, content, className } = this.props;

            return delay > 0 ? <span className={this.classnames(className)}>{delay} 秒</span> : <a onClick={() => start && start(this.start.bind(this))}>{content}</a>;
        }
    }
}
