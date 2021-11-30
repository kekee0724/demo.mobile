// import React from "react";


// import { template } from "@reco-m/core";

// import { ViewComponent } from "@reco-m/core-ui";

// import { policyModel, Namespaces } from "@reco-m/policy-models";
// import {Flex, List, Button, WingBlank, WhiteSpace} from "antd-mobile-v2";
// export namespace HomePolicy {
//     export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
//     }

//     export interface IState extends ViewComponent.IState, policyModel.StateType {}

//     export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
//         namespace = Namespaces.policy;
//       showheader = false;
//       scrollTop = -1;
//       middle = true;
//       key: any;

//         componentDidMount() {

//         }
//         render(): React.ReactNode {
//             return <List
//               renderHeader={
//                 <Flex>
//                   <span className="tit">政策服务</span>
//                   <Flex.Item></Flex.Item>
//                   <span className="morelink" onClick={() => this.goTo("/discover/2")}>
//                                 更多
//                             </span>
//                 </Flex>
//               }
//             >
//             <List.Item wrap>
//               <div className="omit omit-2 size-14">
//                 西青经济开发区专项发展资金申请表——支持企业研发创新通知
//               </div>
//               <div className="omit omit-1 mt10">
//                 <Flex align={"end"} className=" size-14">
//                   <Flex.Item ><span className="gray-three-color">扶持力度：</span><span>最高200万元</span></Flex.Item>
//                   <Flex.Item ><span className="gray-three-color">申报截止：</span><span>剩余<span className="color-red size-16">13</span>天</span></Flex.Item>
//                 </Flex>
//               </div>
//               <div className="omit omit-1 mt10">
//                 <Flex align={"end"} className=" size-14">
//                   <span className="gray-three-color">扶持力度：</span>
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 gray-three-color" />
//                 </Flex>
//               </div>
//             </List.Item>
//               <List.Item wrap>
//                 <div className="omit omit-2 size-14">
//                   西青经济开发区专项发展资金申请表——支持企业研发创新通知
//                 </div>
//                 <div className="omit omit-1 mt10">
//                   <Flex align={"end"} className=" size-14">
//                     <Flex.Item ><span className="gray-three-color">扶持力度：</span><span>最高200万元</span></Flex.Item>
//                     <Flex.Item ><span className="gray-three-color">申报截止：</span><span>剩余<span className="color-red size-16">13</span>天</span></Flex.Item>
//                   </Flex>
//                 </div>
//                 <div className="omit omit-1 mt10">
//                   <Flex align={"end"} className=" size-14">
//                     <span className="gray-three-color">扶持力度：</span>
//                     <i className="icon icon-star size-14 highlight-color" />
//                     <i className="icon icon-star size-14 highlight-color" />
//                     <i className="icon icon-star size-14 highlight-color" />
//                     <i className="icon icon-star size-14 highlight-color" />
//                     <i className="icon icon-star size-14 gray-three-color" />
//                   </Flex>
//                 </div>
//               </List.Item>
//               <WingBlank>
//                 <WhiteSpace />
//                 <Flex>
//                   <Flex.Item>
//                     <Button type={"primary"}>政策申报</Button>
//                   </Flex.Item>
//                   <Flex.Item>
//                     <Button type={"primary"}>政策计算器</Button>
//                   </Flex.Item>
//                 </Flex>
//                 <WhiteSpace />
//               </WingBlank>
//             </List>
//         }
//     }

//     export const Page = template(Component, (state) => state[Namespaces.policy]);
// }
