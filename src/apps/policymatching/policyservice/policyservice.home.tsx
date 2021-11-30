import React from "react";
import {Flex, List, WhiteSpace, WingBlank} from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";

import { policyserviceHomeModel, Namespaces, CashTypeValueEnum, getPolicyHomeDeadline} from "@reco-m/policymatching-models";
export namespace PolicyServiceHome {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, policyserviceHomeModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.policyserviceHomeModel;
        showheader = false;
        scrollTop = -1;
        middle = true;
        key: any;

        componentDidMount() {
            this.initData();
        }
        initData() {
            this.dispatch({ type: `initPage`, callback: () => {
                this.dispatch({ type: "getPolicy" });
            } });
        }
        render(): React.ReactNode {
            const { state } = this.props,
                policyservice = state!.policyservice;

            return <>
            <WhiteSpace />
              <List
                className="hot-active"
                renderHeader={
                  <Flex>
                    <span className="tit">申报通知</span>
                    <Flex.Item></Flex.Item>
                    <span className="morelink" onClick={() => this.goTo("policyservice?tabsIndex=0")}>
                                更多
                            </span>
                  </Flex>
                }
              >
                {policyservice &&
                policyservice.map((item, index) => {
                  const keywords = item.keywords,
                    keywordsArr = keywords && keywords.split(",");
                  return (
                    <List.Item
                      wrap
                      key={index}
                      onClick={() => {
                        this.goTo(`policyservicedetails/${item.id}`);
                      }}
                    >
                      <Flex>
                        <Flex.Item>
                          <div className="omit omit-2 size-15">{item.implementationDetailTitle}</div>
                          <div className="omit omit-1 mt10">
                            <Flex align={"start"} className=" size-14">
                              <Flex.Item>
                                <span className="gray-three-color">扶持力度：</span>
                                {item.cashTypeValue === CashTypeValueEnum.amountSubsidy ? (
                                  <span className="highlight-color">最高{item.amountSubsidy}万元</span>
                                ) : (
                                  <span className="highlight-color">{item.qualificationIdentification}</span>
                                )}
                              </Flex.Item>
                            </Flex>
                            {keywordsArr && (
                              <div className="omit omit-1 mt10">
                                {keywordsArr.map((item, index) => {
                                  return (
                                    <div className="default-tag mr10 no-nowrap" key={index}>
                                      {item}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </Flex.Item>
                        {/* <div>
                                    <ECharts notMerge={true}  option={option} style={{ width: "74px", height: "74px" }} />
                                    <div className="text-center size-13 mt10">申报截止</div>
                                  </div> */}
                        <div className="pl15">
                          {getPolicyHomeDeadline(item.declareStartTime, item.declareEndTime)}
                        </div>
                      </Flex>

                    </List.Item>
                  );
                })}

                <WingBlank>
                  <WhiteSpace />
                  <Flex>
                    <Flex.Item>
                      <div
                        className="policeservice-home-button"
                        onClick={() => {
                          this.goTo(`policyservice?tabsIndex=1`);
                        }}
                      >
                        <div className="title">政策匹配</div>
                        <div className="des">
                          属于您的<span>专属</span>政策,戳我领{">>"}
                        </div>
                      </div>
                    </Flex.Item>
                    <Flex.Item className="ml15">
                      <div
                        className="policeservice-home-button"
                        onClick={() => {
                          this.goTo(`policyservice?tabsIndex=2`);
                        }}
                      >
                        <div className="title">政策计算器</div>
                        <div className="des">
                        一键<span>计算</span>,查的快算的准{">>"}
                        </div>
                      </div>
                    </Flex.Item>
                  </Flex>
                </WingBlank>
              </List>
              <WhiteSpace />
            </>
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.policyserviceHomeModel]);
}
