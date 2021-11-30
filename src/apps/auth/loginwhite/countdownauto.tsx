import React from "react";

import { PureComponent } from "@reco-m/core";

export namespace Countdownauto {
    export interface IProps extends PureComponent.IProps {
        start: (ctrl: any) => boolean | void;

        content?: string;

        className?;
    }

    export interface IState extends PureComponent.IState {
        delay: number;
    }
    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S>  {
        static defaultProps: Countdownauto.IProps = {
            className: "size-14 gray-three-color"
        } as any;

        protected interval;
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
                delay: 0
            } as any;
        }

        componentWillUnmount() {
            this.clearInterval();
        }
        componentDidMount() {
            const { start } = this.props;
            setTimeout(() => {
                start && start(this.start.bind(this));
            }, 500);
        }

        protected clearInterval() {
            this.interval && clearInterval(this.interval);
        }

        start() {
            this.clearInterval();

            this.setState({ delay: 60 });

            this.interval = setInterval(() => {
                const { delay } = this.state;

                if (delay > 0) this.setState({ delay: delay - 1 });
                else this.clearInterval();
            }, 1000);

            return this.cancel.bind(this);
        }

        cancel() {
            this.setState({ delay: 0 });

            this.clearInterval();
        }

        render(): React.ReactNode {
            const { delay } = this.state,
                { start, content } = this.props;

            return delay > 0 ? (
                <div className="countdown">{delay} 秒</div>
            ) : (
                    <div className="countdown-light" onClick={() => start && start(this.start.bind(this))}>
                        {content}
                    </div>
                );
        }
    }

}
