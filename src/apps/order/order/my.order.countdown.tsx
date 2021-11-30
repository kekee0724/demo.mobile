import React from "react";

import ReactDOM from "react-dom";

import { List, Flex } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { OrderStatusEnum, Namespaces, myorderdetailModel } from "@reco-m/order-models";

export namespace MyOrderCountDown {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        order: any;

        timeBack(type: any);

        timeDownOver();
    }

    export interface IState extends ViewComponent.IState, myorderdetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.myorderdetail;
        key: any;
        interval1: any;
        timeText1: any;
        time1 = 1;
        t = 0;

        componentMount(): void {
            clearInterval(this.interval1);
            this.interval1 = null;
        }

        renderPaidTimeView(): React.ReactNode {
            const { order } = this.props;

            return order && this.time1 > 0 && order.orderStatus === OrderStatusEnum.unpaid ? (
                <List renderHeader={() => "支付信息" as any}>
                    <List.Item>
                        <Flex>
                            <span className="margin-right-sm gray-two-color">支付时间</span>
                            <Flex.Item className="no-omit size-14 timedown-style">
                                <span className="color-orange size-16 timedownnew" ref="timedownRef" />
                                (逾期将自动取消)
                            </Flex.Item>
                        </Flex>
                    </List.Item>
                </List>
            ) : (
                    null
                );
        }

        componentWillUnmount() {
            clearInterval(this.interval1);
            this.interval1 = null;
        }

        componentDidUpdate() {
            const { order, timeDownOver } = this.props;

            if (order && this.time1 > 0 && order.unpaidTime && order.unpaidTime > 0) {
                this.t = order.unpaidTime;
                let _this = this;
                if (!this.interval1 && this.t > 0) {
                    this.interval1 = setInterval(() => {
                        _this.t--;
                        const day_num = 60 * 60 * 24,
                            hour_num = 60 * 60,
                            minute_num = 60,
                            day = this.t / day_num,
                            hour = (this.t % day_num) / hour_num,
                            minute = ((this.t % day_num) % hour_num) / minute_num,
                            second = ((this.t % day_num) % hour_num) % minute_num;
                        if (_this.t < 0) {
                            timeDownOver();
                            clearInterval(_this.interval1);
                            _this.interval1 = null;
                        } else {
                            _this.timeText1 = Math.floor(_this.t / 60) + "分钟" + (_this.t % 60) + "秒";
                            _this.time1 = _this.t;

                            let day_text = Math.floor(day) ? Math.floor(day) + "天" : "";
                            let hour_text = Math.floor(hour) ? Math.floor(hour) + "时" : "";
                            let minute_text = Math.floor(minute) ? Math.floor(minute) + "分钟" : "";
                            let second_text = Math.floor(second) ? Math.floor(second) + "秒" : "";

                            $(ReactDOM.findDOMNode(_this.refs.timedownRef)!).text(day_text + hour_text + minute_text + second_text);
                        }
                    }, 1000);
                }
            } else {
                clearInterval(this.interval1);
                this.interval1 = null;
            }
        }

        render() {
            return this.renderPaidTimeView();
        }
    }

    export const Page = template(Component, state => state[Namespaces.myorderdetail]);
}
