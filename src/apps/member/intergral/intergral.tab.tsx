import React from "react";

import { WhiteSpace, Tabs, WingBlank, Button, List } from "antd-mobile-v2";

import { template, formatDate } from "@reco-m/core";
import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { Namespaces, intergralModel, loyaltyEventCodeEnum } from "@reco-m/member-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";
import { MyApplyTabTypeEnum } from "@reco-m/workorder-models";

import { tabs1, tabs2, CurrentIntergralTypeEnum, EventNameEnum } from "./common";

export namespace IntergralTab {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, intergralModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.intergral;
        currentYear = new Date().getFullYear();

        componentDidMount() {
            this.dispatch({ type: `initTab` });
        }

        renderRecordList(item): React.ReactNode {
            return item.operateList.map((itm: any, i: number) => (
                <div key={`${i}`} className="td">
                    <div>
                        <div className="tit">{itm.eventName}</div>
                        <div className="pintro">{itm.eventDescription}</div>
                    </div>
                    <div>
                        {itm.rewardPoint > 0 ? <span className="jf">{`+${itm.rewardPoint}`}</span> : <span className="jf2">{itm.rewardPoint}</span>}
                        <div className="date">{formatDate(itm.inputTime)}</div>
                    </div>
                </div>
            ));
        }

        renderRecordListView(listData: any): React.ReactNode {
            return (
                listData &&
                listData.map((item: any, i: number) => {
                    return (
                        <div className="whiteBackColor" key={i}>
                            <div className="th">
                                <span className="mouth">
                                    {item.year < this.currentYear ? `${item.year}年` : ""}
                                    {item.month}月
                                </span>
                                <span className="nmb">
                                    获取：<em>{item.totalIncomeIntegral > 1000000 ? "99999+" : `+${item.totalIncomeIntegral}`}</em>
                                </span>
                                <span className="nmb">
                                    使用：<span>{item.totalExpenditureIntegral}</span>
                                </span>
                            </div>
                            {this.renderRecordList(item)}
                        </div>
                    );
                })
            );
        }

        loadAll() {
            const { state } = this.props;
            this.dispatch({
                type: "getOperatesAction",
                data: { pageIndex: state!.pageIndex + 1 },
            });
        }

        routeGoto(item: any) {
            const { state } = this.props,
                member = state!.member;


            if (this.getArrowType(item)) {

                if (item.code === loyaltyEventCodeEnum.Order_ruzsq) {
                    const rzsqOrder = state!.rzsqOrder;
                    rzsqOrder && rzsqOrder.checkOrderId && MyApplyTabTypeEnum.cancel !== rzsqOrder.checkStatus
                        ? this.goTo(`applyDetail/${rzsqOrder.checkOrderId}/${rzsqOrder.topicStatus}`)
                        : this.goTo(item.appRouteKey);
                } else if (item.code === "NameAuthentication") {
                    if (member && !member.id) {
                        this.goTo("certify");
                    } else if (member) {
                        this.goTo(`certifyDetail/${member.id}`);
                    }
                } else {
                    item.isOperate && this.goTo(item.appRouteKey);
                    setEventWithLabel(statisticsEvent.integralRuleGuidelines);
                }
            }
        }

        getArrowType(item: any) {
            if (
                item.name === EventNameEnum.dailyDheck ||
                item.name === EventNameEnum.logIn ||
                item.name === EventNameEnum.topic ||
                item.name === EventNameEnum.thirdPartySharing ||
                item.name === EventNameEnum.deposit ||
                item.name === EventNameEnum.noSign ||
                item.name === EventNameEnum.cancallation ||
                item.name === EventNameEnum.commentDelete ||
                item.name === EventNameEnum.platformDeduction
            ) {
                return false;
            }
            return true;
        }

        renderItemsMap(item, i): React.ReactNode {
            const { state } = this.props,
                member = state!.member;
            return item.eventVMs.map((itm, t) => {
                let flag = true;
                let extratexts = itm.appOperation ? itm.appOperation.split("|") : ["", ""];
                // itm.IsOperate true表示可以跳转绑定，否则已经绑定
                if (itm.code === "NameAuthentication") {
                    if (member && member.companyId) {
                        flag = false;
                    }
                } else {
                    flag = itm.isOperate;
                }
                let hasArrow = extratexts[0] === "" ? "" : this.getArrowType(itm) ? "horizontal" : "";
                return (
                    <List.Item
                        wrap={true}
                        extra={flag ? extratexts[0] : extratexts[1]}
                        arrow={hasArrow as any}
                        thumb={<i className={itm.appIcon} />}
                        onClick={() => this.routeGoto(itm)}
                        key={`${i}${t}`}
                    >
                        {itm.name}
                        <List.Item.Brief>
                            <div className="context" dangerouslySetInnerHTML={{ __html: itm.ruleDescription }} />
                        </List.Item.Brief>
                    </List.Item>
                );
            });
        }

        renderItemsWithArr(arr: any): React.ReactNode {
            if (arr) {
                return arr.map((item, i) => {
                    return (
                        <List renderHeader={item.categoryName} className="integral-list-type" key={i}>
                            {this.renderItemsMap(item, i)!}
                        </List>
                    );
                });
            }
            return null;
        }

        getMakeIntergral(): React.ReactNode {
            const { state } = this.props;
            if (state!.currentIntergralType === CurrentIntergralTypeEnum.company) {
                // 企业

                return this.renderItemsWithArr(state!.companyEarn);
            } else {
                // 个人

                return this.renderItemsWithArr(state!.personEarn);
            }
        }

        getPayIntergral(): React.ReactNode {
            const { state } = this.props;
            if (state!.currentIntergralType === CurrentIntergralTypeEnum.company) {
                // 企业
                return this.renderItemsWithArr(state!.companySpend);
            } else {
                // 个人

                return this.renderItemsWithArr(state!.personSpend);
            }
        }
        renderCompanyTabs(): React.ReactNode {
            return (
                <Tabs key={1} swipeable={false} tabs={tabs1} initialPage={0} tabBarPosition="bottom" renderTab={(tab) => <span>{tab.title}</span>}>
                    <div className="integral-record">
                        <div className="integral-record-bd">{this.getMakeIntergral()}</div>
                    </div>
                    <div className="integral-record">
                        <div className="integral-record-bd">{this.getPayIntergral()}</div>
                    </div>
                </Tabs>
            );
        }
        renderPersonTabs(): React.ReactNode {
            const { state } = this.props;
            return (
                <Tabs key={2} swipeable={false} tabs={tabs2} initialPage={0} tabBarPosition="bottom" renderTab={(tab) => <span>{tab.title}</span>}>
                    <div className="integral-record-bd">{this.getMakeIntergral()}</div>

                    <div className="integral-record">
                        <div className="integral-record-bd">{this.getPayIntergral()}</div>
                    </div>
                    <div className="integral-record">
                        <div className="integral-record-bd">
                            {this.renderRecordListView(state!.listData)}
                            <WingBlank>
                                <WhiteSpace />
                                {state!.hasMore ? (
                                    <Button size="small" style={{ marginRight: "4px" }} onClick={() => this.loadAll()}>
                                        加载更多
                                    </Button>
                                ) : (
                                    <Button disabled size="small" style={{ marginRight: "4px" }}>
                                        没有更多
                                    </Button>
                                )}
                                <WhiteSpace />
                            </WingBlank>
                        </div>
                    </div>
                </Tabs>
            );
        }
        render(): React.ReactNode {
            const { state } = this.props;

            return <div className="integral-tabs">{state!.currentIntergralType === CurrentIntergralTypeEnum.company ? this.renderCompanyTabs() : this.renderPersonTabs()}</div>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.intergral]);
}
