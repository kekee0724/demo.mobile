// import React from "react";


// import { template } from "@reco-m/core";

// import { ViewComponent } from "@reco-m/core-ui";

// import { policyModel, Namespaces } from "@reco-m/policy-models";
// import {Flex, List, WhiteSpace, Button} from "antd-mobile-v2";
// export namespace PolicyTextDetails {
//   export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
//   }

//   export interface IState extends ViewComponent.IState, policyModel.StateType {}

//   export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
//     namespace = Namespaces.policy;
//     showloading = false;
//     headerContent="政策原文详情"


//     componentDidMount() {

//     }
//     renderHeader(headerContent?: any): React.ReactNode {
//       return <>
//         {super.renderHeader(headerContent)}
//         <List className=" not-card-border">
//           <List.Item wrap  onClick={() => this.goTo("details")}>
//             <div className="omit omit-2 size-14">
//               西青经济开发区专项发展资金申请表——支持企业研发创新通知
//             </div>
//              <div className="omit omit-1"><div className="default-tag mr10">人才</div> <div className="default-tag mr10">国家级</div>
//                <div className="default-tag mr10">金额补贴</div></div>
//             <div className="mt10 size-12 gray-three-color">
//               <a><i className="icon icon-huabanfuben size-12 mr10"></i></a>
//               2021-01-01  |  科经委发布
//             </div>
//             <div className="mt5 size-12 gray-three-color">
//               <a><i className="icon icon-wenjian size-12 mr10"></i></a>
//               发改规划〔0185〕8887号
//             </div>
//             <div className="mt5 size-12 gray-three-color">
//               <a><i className="icon icon-baoming2 size-12 mr10"></i></a>
//               截止至 2022-12-31
//             </div>
//           </List.Item>
//         </List>
//         <WhiteSpace className="dark" />
//       </>
//     }
//     renderHeaderRight(): React.ReactNode {
//       return <i className="icon icon-share" />
//     }

//     renderBody(): React.ReactNode {
//       return<>
//         <List >
//           <List.Item >
//             <div className="omit omit-1 size-14">
//               <a><i className="icon icon-newpel size-14 mr10" /></a>技术咨询：20231080
//             </div>
//           </List.Item>
//           <List.Item>
//             <div className="omit omit-1 size-14">
//               <a> <i className="icon icon-newpel size-14 mr10" /></a>技术咨询：20231080
//             </div>
//           </List.Item>
//           <List.Item>
//             <div className="omit omit-1 size-14">
//               <a> <i className="icon icon-newpel size-14 mr10" /></a>技术咨询：20231080
//             </div>
//           </List.Item>
//         </List>
//         <WhiteSpace className="dark" />
//         <List className="not-card-border">
//           <List.Item wrap>
//             各有关单位：

//             根据《上海市服务业发展引导资金使用和管理办法》（沪府规〔2018〕5号）、《杨浦区服务业发展引导资金使用和管理办法》（杨发改规范[2019]2号）中的有关规定，现开展杨浦区2021年上海市服务业发展引导资金项目申报工作，相关事项通知如下：

//             一、  申报项目条件：

//             1、项目总投资不低于1000万元。

//             2、申报的项目一般是2020 年8月16日至2021年3月15日开始建设的项目。

//             3、引导资金支持过的项目单位，再次申报新项目必须以上次支持项目验收通过为前提。

//             4、上报单位2020年度净资产原则上为正。

//             5、申报单位税收户管地和注册经营地必须在杨浦区。
//           </List.Item>
//         </List>
//       </>
//     }
//     renderFooter(): React.ReactNode {
//       return <Flex className="flex-collapse">
//         <Flex.Item>
//           <Button type="primary" >
//             确认提交
//           </Button>
//         </Flex.Item>
//       </Flex>
//     }
//   }

//   export const Page = template(Component, (state) => state[Namespaces.policy]);
// }
