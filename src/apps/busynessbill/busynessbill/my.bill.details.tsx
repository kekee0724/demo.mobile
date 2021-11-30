import React from "react";

import { Button, Flex, List, Steps, WhiteSpace } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";

import { billModel, Namespaces } from "@reco-m/busynessbill-models";

const Step = Steps.Step;
export namespace MyBillDetails {
  export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
    clickNum?: any;
  }

  export interface IState extends ViewComponent.IState, billModel.StateType {
    isSideOpen?: any;
  }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
    namespace = Namespaces.bill;
    headerContent = "我的账单详情";
    showloading = false;
    viewRef;

    componentDidMount() {
    }


    renderBody(): React.ReactNode {
      return <>
        <List className="list-no-border">
          <List.Item>
            <Flex>
              <Flex.Item>
                订单编号：QYYD2020072116220357
              </Flex.Item>
              <span className="gray-three-color">待评价</span>
            </Flex>
            <List.Item.Brief>
              <span className="margin-right-lg"> <i className="icon icon-shijian1 size-14 margin-right-xs"></i>2020/07/15 15:22:25</span>
              <span> <i className="icon icon-yonghu size-13 margin-right-xs"></i>瑞小谷</span>

            </List.Item.Brief>
          </List.Item>

        </List>
        <WhiteSpace className="dark" />
        <List renderHeader="订单信息">
          <List.Item>
            <Flex>
              <div className="label-name gray-two-color">
                订单名称
              </div>
              <Flex.Item>
                上海瑞谷拜特2020年05月账单
              </Flex.Item>
            </Flex>
          </List.Item>
          <List.Item>
            <Flex>
              <div className="label-name gray-two-color">
                订单金额
              </div>
              <Flex.Item>
                10000元
              </Flex.Item>
            </Flex>
          </List.Item>
        </List>
        <WhiteSpace className="dark" />
        <List renderHeader="费用明细" className="bill-list">
          <List.Item wrap extra={<span className="highlight-color">¥500.00</span>} align="top"
            multipleLine>
            <div className="title margin-bottom-sm">
              <i className="icon icon-tag icon-radius small primary-back-color" />
              物业管理费
            </div>
            <List.Item.Brief>计费周期：2021-04-26~2021-07-25</List.Item.Brief>
          </List.Item>
          <List.Item wrap extra={<span className="highlight-color">¥500.00</span>} align="top"
            multipleLine>
            <div className="title margin-bottom-sm">
              <i className="icon icon-tag icon-radius small primary-back-color" />
              物业管理费
            </div>
            <List.Item.Brief>计费周期：2021-04-26~2021-07-25</List.Item.Brief>
          </List.Item>
          <List.Item wrap extra={<span className="highlight-color">¥500.00</span>} align="top"
            multipleLine>
            <div className="title margin-bottom-sm">
              <i className="icon icon-tag icon-radius small primary-back-color" />
              物业管理费
            </div>
            <List.Item.Brief>计费周期：2021-04-26~2021-07-25</List.Item.Brief>
          </List.Item>
        </List>
        <WhiteSpace className="dark" />
        <List renderHeader="个人信息">
          <List.Item>
            <Flex>
              <div className="label-name gray-two-color">
                姓名
              </div>
              <Flex.Item>
                瑞小谷
              </Flex.Item>
            </Flex>
          </List.Item>
          <List.Item>
            <Flex>
              <div className="label-name gray-two-color">
                手机号码
              </div>
              <Flex.Item>
                18342903321
              </Flex.Item>
            </Flex>
          </List.Item>
          <List.Item>
            <Flex>
              <div className="label-name gray-two-color">
                邮箱
              </div>
              <Flex.Item>
                167613726@163.com
              </Flex.Item>
            </Flex>
          </List.Item>
          <List.Item>
            <Flex>
              <div className="label-name gray-two-color">
                公司名称
              </div>
              <Flex.Item>
                上海拜特技术服务有限公司
              </Flex.Item>
            </Flex>
          </List.Item>
        </List>
        <WhiteSpace className="dark" />
        <List className="list-no-border" renderHeader={"处理进度"}>
          <List.Item>
            <Steps size="small" current={1}>
              <Step title="您的订单已取消成功。" description="2020/07/15 15:22:25" />
              <Step title="您的订单已提交成功，请尽快前往支付。" description="2020/07/15 08:52:25" />
            </Steps>
          </List.Item>
        </List>
      </>
    }

    renderFooter(): React.ReactNode {
      return <Flex className="flex-collapse">
        <Flex.Item>
          <Button
            type={"primary"}
          >
            重新预订
          </Button>
        </Flex.Item>
      </Flex>
    }

  }

  export const Page = template(Component, (state) => state[Namespaces.bill]);
}
