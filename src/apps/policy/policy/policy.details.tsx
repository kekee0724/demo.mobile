// import React from "react";


// import { template } from "@reco-m/core";

// import { ViewComponent } from "@reco-m/core-ui";

// import { policyModel, Namespaces } from "@reco-m/policy-models";
// import {Flex, Tabs, List, WingBlank, WhiteSpace, Button} from "antd-mobile-v2";
// export namespace PolicyDetails {
//     export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
//     }

//     export interface IState extends ViewComponent.IState, policyModel.StateType {}

//     export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
//         namespace = Namespaces.policy;
//         showloading = false;
//         headerContent="政策服务"


//         componentDidMount() {

//         }
//         renderHeader(headerContent?: any): React.ReactNode {
//           return <>
//             {super.renderHeader(headerContent)}
//             <List className=" not-card-border">
//               <List.Item wrap  onClick={() => this.goTo("details")}>
//                 <div className="omit omit-2 size-14">
//                   西青经济开发区专项发展资金申请表——支持企业研发创新通知
//                 </div>
//                 <Flex>
//                   <Flex.Item>
//                     <div className="default-tag mr10">人才</div> <div className="default-tag mr10">国家级</div>
//                     <div className="default-tag mr10">金额补贴</div>
//                   </Flex.Item>
//                   <span className="size-14">剩余<strong className="color-red size-24">13</strong>天<strong className="color-red size-24">11</strong>小时</span>
//                 </Flex>
//                 <div className="mt10 size-12 gray-three-color"><a><i className="icon icon-huabanfuben size-12 mr10"></i></a>2021-01-01  <span className="margin-h">|</span>  科经委发布</div>
//               </List.Item>
//             </List>
//           <WhiteSpace className="dark" />
//           </>
//         }
//         renderHeaderRight(): React.ReactNode {
//           return <i className="icon icon-share"></i>
//         }

//       renderBody(): React.ReactNode {
//         const tabs = [
//           { title: "政策解读" },
//           { title: "政策原文" }
//         ];
//             return<>
//               <Tabs tabs={tabs}
//                     renderTabBar={props => <Tabs.DefaultTabBar {...props} page={4} />}
//                     onChange={(tab, index) => { console.log('onChange', index, tab); }}
//                     onTabClick={(tab, index) => { console.log('onTabClick', index, tab); }}
//               >
//                 <WingBlank>
//                   <div className="policy-box">
//                     <div className="title">解读关键字</div>
//                     <div className="text">
//                       <div className="default-tag mr10">减税30%</div>
//                       <div className="default-tag">享受政策补贴最多50万%</div>
//                     </div>
//                   </div>
//                   <div className="policy-box">
//                     <div className="title">解读关键字</div>
//                     <div className="text">
//                       <p>
//                         1.申报项目类型：本次申报分成两类进行，市级项目要求总投资8111万元（含）以上；区级项目要求总投资在411（含）-8111万元之间。同一项目不得同时申报市级项目和区级项目。
//                       </p>
//                       <p>
//                         2.申报项目一般是0101年6月87日至0108年6月84日开始建设的项目。
//                       </p>

//                       <p>
//                         3.引导资金支持过的项目单位，再次申报新项目必须以上次支持项目验收通过为前提。
//                       </p>

//                       <p>
//                         4.上报单位0101年度净资产原则上为正。
//                       </p>
//                     </div>
//                   </div>
//                   <div className="policy-box">
//                     <div className="title">需要做什么</div>
//                     <div className="text">
//                       <p>
//                         1.申报项目类型：本次申报分成两类进行，市级项目要求总投资8111万元（含）以上；区级项目要求总投资在411（含）-8111万元之间。同一项目不得同时申报市级项目和区级项目。
//                       </p>
//                       <p>
//                         2.申报项目一般是0101年6月87日至0108年6月84日开始建设的项目。
//                       </p>

//                       <p>
//                         3.引导资金支持过的项目单位，再次申报新项目必须以上次支持项目验收通过为前提。
//                       </p>

//                       <p>
//                         4.上报单位0101年度净资产原则上为正。
//                       </p>
//                     </div>
//                   </div>
//                   <div className="policy-box">
//                     <div className="title">能获得什么</div>
//                     <div className="text">
//                       <p>
//                         1.申报项目类型：本次申报分成两类进行，市级项目要求总投资8111万元（含）以上；区级项目要求总投资在411（含）-8111万元之间。同一项目不得同时申报市级项目和区级项目。
//                       </p>
//                       <p>
//                         2.申报项目一般是0101年6月87日至0108年6月84日开始建设的项目。
//                       </p>

//                       <p>
//                         3.引导资金支持过的项目单位，再次申报新项目必须以上次支持项目验收通过为前提。
//                       </p>

//                       <p>
//                         4.上报单位0101年度净资产原则上为正。
//                       </p>
//                     </div>
//                   </div>
//                   <WhiteSpace />
//                 </WingBlank>
//                 <WingBlank>
//                   <div className="policy-box" onClick={() => this.goTo("text")}>
//                     <div className="text">
//                       <div className="omit omit-2 size-14">关于天津西青经济开发区支持企业研发创新通知</div>
//                       <div className="omit omit-1 margin-top-xs gray-three-color">2021-01-01  <span className="margin-h">|</span>  科经委发布%</div>
//                     </div>
//                   </div>
//                 </WingBlank>
//               </Tabs>
//             </>
//         }
//         renderFooter(): React.ReactNode {
//           return <Flex className="flex-collapse">
//             <Flex.Item>
//               <Button type="primary" >
//                 确认提交
//               </Button>
//             </Flex.Item>
//           </Flex>
//         }
//     }

//     export const Page = template(Component, (state) => state[Namespaces.policy]);
// }
