import React from "react";

import ECharts from "re-echarts";

import { List, WhiteSpace, Carousel, NoticeBar } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { intergralModel, Namespaces } from "@reco-m/member-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { IntergralTab } from "./intergral.tab";

import { colorArr, option, RuleTypeEnum, CurrentIntergralTypeEnum } from "./common";

export namespace Intergral {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, intergralModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "积分中心";
        namespace = Namespaces.intergral;
        showloading = true;

        componentDidMount() {
            this.dispatch({ type: `initPage` });
        }
        componentReceiveProps(nextProps: Readonly<P>): void {
            let locationChanged = nextProps.location !== this.props.location;

            if (locationChanged) {
                if (this.isAuth()) {
                    this.dispatch({ type: `getLoyal`, currentIntergralType: 1 });
                }
            }
        }
        componentWillUnmount() {}
        signClick() {
            this.dispatch({ type: `getIntegralSign` });

            setEventWithLabel(statisticsEvent.integralSignIn);
        }

        treatChartOption() {
            const { state } = this.props,
                eventStatistic = state!.eventStatistic,
                eventStatisticExpend = state!.eventStatisticExpend;

            if (state!.ruleType === RuleTypeEnum.earn) {
                if (eventStatistic && eventStatistic.length) {
                    option.series[0].data = eventStatistic.map((item) => {
                        let data = {
                            name: item.categoryName,
                            value: item.rewardPoint,
                        };
                        return data;
                    });
                    option.color = eventStatistic.map((item, i) => {
                        item;
                        return colorArr[i];
                    });
                } else {
                    option.series[0].data = [];
                    option.color = [];
                }
            } else {
                if (eventStatisticExpend && eventStatisticExpend.length) {
                    option.series[0].data = eventStatisticExpend.map((item) => {
                        let data = {
                            name: item.categoryName,
                            value: item.rewardPoint,
                        };
                        return data;
                    });
                    option.color = eventStatisticExpend.map((item, i) => {
                        item;
                        return colorArr[i];
                    });
                } else {
                    option.series[0].data = [];
                    option.color = [];
                }
            }
        }
        renderHeaderTabCompany(): React.ReactNode {
            return (
                <div>
                    <span>积分·企业</span>
                    <span
                        onClick={() => {
                            this.dispatch({
                                type: "input",
                                data: { eventStatisticSum: null, eventStatisticSumExpend: null, eventStatistic: null, eventStatisticExpend: null },
                            });
                            this.dispatch({ type: "input", data: { currentIntergralType: CurrentIntergralTypeEnum.person } });
                            this.dispatch({ type: "refreshDatas", currentIntergralType: CurrentIntergralTypeEnum.person });
                            this.dispatch({ type: `getEventStatisticEarnExpend`, data: { currentIntergralType: 0 } });
                            setEventWithLabel(statisticsEvent.integralTypeSwitch);
                        }}
                    >
                        <i className="icon icon-jiaohuan" />
                        个人
                    </span>
                </div>
            );
        }
        renderHeaderTabPerson(): React.ReactNode {
            return (
                <div>
                    <span>积分·个人</span>
                    <span
                        onClick={() => {
                            this.dispatch({
                                type: "input",
                                data: { eventStatisticSum: null, eventStatisticSumExpend: null, eventStatistic: null, eventStatisticExpend: null },
                            });
                            this.dispatch({ type: "input", data: { currentIntergralType: CurrentIntergralTypeEnum.company } });
                            this.dispatch({ type: "refreshDatas", currentIntergralType: CurrentIntergralTypeEnum.company });
                            this.dispatch({ type: `getEventStatisticEarnExpend`, data: { currentIntergralType: 1 } });
                            setEventWithLabel(statisticsEvent.integralTypeSwitch);
                        }}
                    >
                        <i className="icon icon-jiaohuan" />
                        企业
                    </span>
                </div>
            );
        }
        renderHeaderTab(isCertify, currentIntergralType): React.ReactNode {
            if (isCertify) {
                return currentIntergralType === CurrentIntergralTypeEnum.company ? this.renderHeaderTabCompany() : this.renderHeaderTabPerson();
            } else {
                return (
                    <div>
                        <span>积分·个人</span>
                    </div>
                );
            }
        }

        renderIntergralList() {
            const { state } = this.props;
            let arr: any[] = [];
            for (let i = 0; i < state!.continuitySignDay; i++) {
                arr.push(0);
            }

            let currentIntergral = state!.isSign ? state!.tomorrowIntegral : state!.todayIntegral;
            for (let i = 0; i < 7 - state!.continuitySignDay; i++) {
                arr.push(currentIntergral);
                currentIntergral = currentIntergral + 1;
            }
            return arr.map((item, i) => {
                if (item === 0) {
                    return (
                        <li className="active" key={i}>
                            <div className="data">+{i + 1}</div>
                            <div className="circle">
                                <i />
                            </div>
                            <div className="nmb">{i + 1}天</div>
                        </li>
                    );
                } else {
                    return (
                        <li key={i}>
                            <div className="data">+{item}</div>
                            <div className="circle">
                                <i />
                            </div>
                            <div className="nmb">{item}天</div>
                        </li>
                    );
                }
            });
        }

        renderEchartList() {
            const { state } = this.props;

            if (state!.ruleType === RuleTypeEnum.earn) {
                const eventStatistic = state!.eventStatistic;

                if (eventStatistic) {
                    return eventStatistic.map((item, i) => {
                        let classs = `color${i + 1}`;
                        return (
                            <div className="row" key={i}>
                                <i className={classs} />
                                <span>{item.categoryName}</span>
                                <em>{Math.abs(item.rewardPoint) > 1000000 ? "99999+" : Math.abs(item.rewardPoint)}</em>
                            </div>
                        );
                    });
                }
            } else {
                const eventStatisticExpend = state!.eventStatisticExpend;

                if (eventStatisticExpend) {
                    return eventStatisticExpend.map((item, i) => {
                        let classs = `color${i + 1}`;
                        return (
                            <div className="row" key={i}>
                                <i className={classs} />
                                <span>{item.categoryName} </span>
                                <em>{Math.abs(item.rewardPoint) > 1000000 ? "99999+" : Math.abs(item.rewardPoint)}</em>
                            </div>
                        );
                    });
                }
            }
        }

        renderCurrentIntergralType(): React.ReactNode {
            const { state } = this.props;

            return state!.currentIntergralType === CurrentIntergralTypeEnum.company ? (
                <div className="cirl">
                    <div>
                        <div className="cd">
                            <span>{state!.totalJiFen ? state!.totalJiFen : 0}</span>
                            <i />
                            <em>可用积分</em>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="cirl">
                    <div>
                        {state!.isSign ? (
                            <div className="cd">
                                <span>{state!.totalJiFen ? state!.totalJiFen : 0}</span>
                                <i />
                                <em>可用积分</em>
                            </div>
                        ) : (
                            <div className="cd" onClick={() => this.signClick()}>
                                <span>签到</span>
                                <i />
                                <em>连续{state!.continuitySignDay}天</em>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        renderTitle(): React.ReactNode {
            const { state } = this.props;

            return (
                <div className="integral-header">
                    <div className="hd">
                        {this.renderHeaderTab(state!.isCertify, state!.currentIntergralType)}
                        <a
                            onClick={() => {
                                this.goTo(`help`);

                                setEventWithLabel(statisticsEvent.helpView);
                            }}
                        >
                            帮助说明
                        </a>
                    </div>
                    <div className="bd">
                        {this.renderCurrentIntergralType()}
                        <div className="integral-week">
                            {state!.currentIntergralType === CurrentIntergralTypeEnum.company ? (
                                <NoticeBar icon={null!} marqueeProps={{ loop: true } as any}>
                                    <h1 className="integral-home-certifyname">{state!.certifyName}</h1>
                                </NoticeBar>
                            ) : (
                                <ul className="main-list">{this.renderIntergralList()}</ul>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        renderECharts(header: string, lazyUpdate: boolean, statisticSum: number): React.ReactNode {
            setEventWithLabel(statisticsEvent.intergralDetail);
            return (
                <List className="integral-echart" renderHeader={header}>
                    <List.Item wrap={true}>
                        <div className="bd">
                            <div className="box">
                                <ECharts notMerge={true} lazyUpdate={lazyUpdate} option={option} style={{ width: "170px", height: "180px" }} />
                            </div>
                            <div className="word">
                                {this.renderEchartList()}
                                <div className="fd">
                                    <div />
                                    <span>总计 </span>
                                    <em>{Math.abs(statisticSum) > 1000000 ? "99999+" : Math.abs(statisticSum) || 0}</em>
                                </div>
                            </div>
                        </div>
                    </List.Item>
                </List>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props;

            this.treatChartOption();

            return (
                <>
                    {this.renderTitle()}
                    <Carousel
                        className="integral-scoll"
                        autoplay={false}
                        infinite
                        afterChange={(index) => {
                            this.dispatch({ type: "input", data: { ruleType: index } });
                        }}
                    >
                        {this.renderECharts("收入（本月）", true, state!.eventStatisticSum)}
                        {this.renderECharts("支出（本月）", true, state!.eventStatisticSumExpend)}
                    </Carousel>
                    <WhiteSpace className="back" />
                    {this.renderEmbeddedView(IntergralTab.Page as any, {})}
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.intergral]);
}
