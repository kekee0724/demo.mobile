// import React from "react";


// import { template } from "@reco-m/core";

// import { ViewComponent } from "@reco-m/core-ui";

// import { policyModel, Namespaces } from "@reco-m/policy-models";
// import {Flex, Tabs, Picker, InputItem, List, WhiteSpace, WingBlank,  Button, Accordion} from "antd-mobile-v2";
// const seasons = [
//   [
//     {
//       label: '选择一',
//       value: '选择一',
//     },
//     {
//       label: '选择二',
//       value: '选择二',
//     },
//   ]
// ];
// export namespace Policy {
//     export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
//     }

//     export interface IState extends ViewComponent.IState, policyModel.StateType {
//       tabsIndex?:any;
//       sValue?:any;
//       stepIndex?: any;
//       accordion?: any;
//     }

//     export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
//         namespace = Namespaces.policy;
//         showloading = false;
//         headerContent="政策服务";


//         componentDidMount() {
//           this.setState({
//             tabsIndex: 0,
//             stepIndex: 0,
//           })
//         }
//         renderHeader(headerContent?: any): React.ReactNode {
//           const data = ["政策申报", "政策匹配", "政策计算器"]
//           return <>
//             {super.renderHeader(headerContent)}
//             <WingBlank>
//               <Flex className="padding-v">
//                 {
//                   data.map((item, i) => {
//                     return     <Flex.Item key={i}>
//                       <div className={this.state.tabsIndex === i ? "tabs-tag active" : "tabs-tag"} onClick={() => {this.setState({tabsIndex: i})}}>{item}</div>
//                     </Flex.Item>

//                   })
//                 }
//               </Flex>
//             </WingBlank>
//             {
//                this.state.tabsIndex === 1 && this.state.stepIndex !== 2 ?  <List className="list-card list-no-border">
//                  <List.Item wrap>
//                    <Flex align={"start"} className="text-center size-12 policy-steps-box">
//                      <Flex.Item>
//                        <div className="policy-steps">1</div>
//                        <div className="mt10">完善材料</div>
//                        <div className="gray-three-color">请先完成企业认证</div>
//                      </Flex.Item>
//                      <Flex.Item>

//                        <div className="policy-steps">2</div>
//                        <div className="mt10">自动匹配</div>
//                        <div className="gray-three-color">AI小政自动计算，给出建议</div>

//                      </Flex.Item>
//                      <Flex.Item>

//                        <div className="policy-steps">3</div>
//                        <div className="mt10">专家建议</div>
//                        <div className="gray-three-color">提出进一步的要求，专家解答</div>

//                      </Flex.Item>
//                    </Flex>
//                  </List.Item>
//                </List> : ""
//             }
//           </>
//         }
//         renderHeaderRight(): React.ReactNode {
//           return <i className="icon icon-search01" />
//         }

//       renderBody(): React.ReactNode {
//             return this.state.tabsIndex === 0 ?
//               this.renderPolicyDeclare() :
//               this.state.tabsIndex === 1 ?
//               this.renderPolicyMatching() :
//               this.renderPolicyComputer();




//         }
//         // 政策申报
//       renderPolicyDeclare() {
//         const tabs = [
//           { title: "最新" },
//           { title: "国家级" },
//           { title: "省/直辖市级" },
//           { title: "地市级" },
//           { title: "区县级" }
//         ];
//         return  <Tabs tabs={tabs}
//                       renderTabBar={props => <Tabs.DefaultTabBar {...props} page={4} />}
//                       onChange={(tab, index) => { console.log('onChange', index, tab); }}
//                       onTabClick={(tab, index) => { console.log('onTabClick', index, tab); }}
//         >
//           <List className="list-card not-card-border">
//             <WhiteSpace />
//             {
//               ["","","",""].map((item, i) => {
//                 return   <List.Item wrap key={i} onClick={() => this.goTo("details")}>
//                   <div className="omit omit-2 size-14">
//                     西青经济开发区专项发展资金申请表——支持企业研发创新通知{item}
//                   </div>
//                   <Flex>
//                     <Flex.Item>
//                       <div className="default-tag">减税30%</div> <div className="default-tag">享受政策补贴最多50万</div>
//                     </Flex.Item>
//                     <span className="size-14">剩余<strong className="color-red size-24">13</strong>天</span>

//                   </Flex>
//                 </List.Item>
//               })
//             }
//           </List>
//         </Tabs>
//       }

//       // 政策计算机
//       renderPolicyComputer(){
//           return <List className="list-body-card">
//             <List.Item wrap>
//               <Flex>
//                 <i className="icon icon-zhishichanquan highlight-color" />
//                 <Flex.Item>
//                   <div className="omit omit-2 size-12">优惠政策与企业基本情况息息相关，信息越完善，适合您的优惠政策才会更多哦~</div>
//                 </Flex.Item>
//               </Flex>
//             </List.Item>
//             <List.Item>
//           <Flex>
//             <div className="label-name">企业资质</div>
//             <Flex.Item>
//               上市公司
//             </Flex.Item>
//           </Flex>
//             </List.Item>
//             <List.Item>
//             <Flex>
//               <div className="label-name">企业规模</div>
//               <Flex.Item>
//                 中型企业
//               </Flex.Item>
//             </Flex>
//             </List.Item>
//             <List.Item>
//               <Flex>
//                 <div className="label-name">所属产业</div>
//                 <Flex.Item>
//                   互联网
//                 </Flex.Item>
//               </Flex>
//             </List.Item>
//             <Accordion  className="policy-accordion" onChange={this.onChange}>
//               <Accordion.Panel header={<a>完善更多</a>}>
//                 <List className="my-list">
//                   <Picker
//                     data={seasons}
//                     title="请选择"
//                     cascade={false}
//                     extra="请选择(可选)"
//                     value={this.state.sValue}
//                     onChange={v => this.setState({ sValue: v })}
//                     onOk={v => this.setState({ sValue: v })}
//                   >
//                     <List.Item arrow="horizontal">荣誉奖项</List.Item>
//                   </Picker>
//                   <Picker
//                     data={seasons}
//                     title="请选择"
//                     cascade={false}
//                     extra="请选择(可选)"
//                     value={this.state.sValue}
//                     onChange={v => this.setState({ sValue: v })}
//                     onOk={v => this.setState({ sValue: v })}
//                   >
//                     <List.Item arrow="horizontal">年营业收入</List.Item>
//                   </Picker>
//                   <Picker
//                     data={seasons}
//                     title="请选择"
//                     cascade={false}
//                     extra="请选择(可选)"
//                     value={this.state.sValue}
//                     onChange={v => this.setState({ sValue: v })}
//                     onOk={v => this.setState({ sValue: v })}
//                   >
//                     <List.Item arrow="horizontal">年营增长率</List.Item>
//                   </Picker>
//                   <Picker
//                     data={seasons}
//                     title="请选择"
//                     cascade={false}
//                     extra="请选择(可选)"
//                     value={this.state.sValue}
//                     onChange={v => this.setState({ sValue: v })}
//                     onOk={v => this.setState({ sValue: v })}
//                   >
//                     <List.Item arrow="horizontal">前三年年均营收</List.Item>
//                   </Picker>
//                 </List>
//               </Accordion.Panel>
//             </Accordion>


//           </List>
//       }


//       // 政策匹配
//       renderPolicyMatching(){
//           return <>
//             {
//               this.state.stepIndex === 0  ? this.renderPolicyMatchingForm() :
//                 this.state.stepIndex === 1  ?  this.passContent() :  this.renderSchedule()
//             }
//           </>
//       }
//       // 政策匹配表单
//       renderPolicyMatchingForm(){
//           return <List className="list-body-card" renderHeader="第一步完善资料">
//             <Picker
//               data={seasons}
//               title="请选择"
//               cascade={false}
//               extra="请选择(可选)"
//               value={this.state.sValue}
//               onChange={v => this.setState({ sValue: v })}
//               onOk={v => this.setState({ sValue: v })}
//             >
//               <List.Item arrow="horizontal">认证园区</List.Item>
//             </Picker>
//             <Picker
//               data={seasons}
//               title="请选择"
//               cascade={false}
//               extra="请选择(可选)"
//               value={this.state.sValue}
//               onChange={v => this.setState({ sValue: v })}
//               onOk={v => this.setState({ sValue: v })}
//             >
//               <List.Item arrow="horizontal">认证企业</List.Item>
//             </Picker>
//             <Picker
//               data={seasons}
//               title="请选择"
//               cascade={false}
//               extra="请选择(可选)"
//               value={this.state.sValue}
//               onChange={v => this.setState({ sValue: v })}
//               onOk={v => this.setState({ sValue: v })}
//             >
//               <List.Item arrow="horizontal">认证类型</List.Item>
//             </Picker>
//             <InputItem
//               clear
//               placeholder="请输入"
//             >真实姓名</InputItem>
//             <InputItem
//               clear
//               placeholder="请输入"
//             >手机号码</InputItem>
//             <List renderHeader="证明材料" className="list-no-border">
//               <List.Item>
//               </List.Item>
//             </List>
//           </List>
//       }
//       onChange = (key) => {
//         console.log(key.length);
//         this.setState({
//           accordion: key.length
//         })
//       }
//       // 认证进度
//       renderSchedule() {
//           return <>
//             <Accordion defaultActiveKey="0" className="card-accordion" onChange={this.onChange}>
//               <Accordion.Panel header={
//                 <>
//                   <div className="omit omit-1"><strong>上海瑞谷拜特软件技术有限公司</strong></div>
//                   <WhiteSpace />
//                   <Flex align={"center"} style={{height: 20}}>
//                     <div className="schedule-box">
//                       <div className="schedule-bar" style={{width: 30 + "%"}}/>
//                     </div>
//                     <Flex.Item className="text-left">
//                       {
//                         this.state.accordion === 0 ?  <span className="margin-left-xs highlight-color size-12">60%</span> : ""
//                       }
//                     </Flex.Item>
//                   </Flex>
//                   <WhiteSpace />
//                   {
//                     this.state.accordion !== 0 ? <div className="size-14">企业信息完整度：<span className="highlight-color">60%</span></div> : ''
//                   }

//                   {
//                     this.state.accordion === 0 ? <Flex>
//                       <Button onClick={(e) => e.stopPropagation()} className="radius-button margin-right-xs" type={"ghost"} size={"small"}>继续完善信息</Button>
//                       <Button onClick={(e) => e.stopPropagation()} className="radius-button margin-right-xs"  type={"ghost"} size={"small"}>专家人工建议</Button></Flex> : ""
//                   }

//                 </>
//               }>
//                 <List className="list-no-border">
//                   <List.Item wrap>
//                     <Flex className="text-center width-full size-14 gray-three-color">
//                       <Flex.Item >
//                         <div>匹配实施细则</div>
//                         <WhiteSpace />
//                         <div><strong className="color-blue size-18 margin-right-xs">16</strong>条</div>
//                       </Flex.Item>
//                       <Flex.Item>
//                         <div>预估补贴金额</div>
//                         <WhiteSpace />
//                         <div><strong className="highlight-color size-18 margin-right-xs">300</strong>条</div>
//                       </Flex.Item>
//                       <Flex.Item>
//                         <div>预估资质认定</div>
//                         <WhiteSpace />
//                         <div><strong className="highlight-color size-18 margin-right-xs">26</strong>项</div>
//                       </Flex.Item>
//                     </Flex>
//                     {/*  <div className="omit omit-1 size-14 color-black"><i className="icon icon-wenjian size-14 margin-right-xs" />匹配结果</div>*/}
//                     {/*  <List.Item.Brief>*/}
//                     {/*    <div className="size-12"><span className="margin-right-lg">匹配实施细则</span> <span className="primary-color size-16 margin-right-xs">16</span>条</div>*/}
//                     {/*  </List.Item.Brief>*/}
//                     {/*  <List.Item.Brief>*/}
//                     {/*    <div className="size-12"><span className="margin-right-lg">预估补贴金额</span> <span className="highlight-color size-16 margin-right-xs">300</span>万元</div>*/}
//                     {/*</List.Item.Brief>*/}
//                     {/*  <List.Item.Brief>*/}
//                     {/*    <div className="size-12"><span className="margin-right-lg">预估资质认定</span> <span className="highlight-color size-16 margin-right-xs">6</span>项</div>*/}
//                     {/*  </List.Item.Brief>*/}
//                     <WhiteSpace size={"lg"} />
//                     <Flex align={"center"} justify={"center"}>
//                       <div className="text-center">
//                         <Button style={{width: 150}} className="radius-button" size={"small"} type={"primary"}>继续完善信息</Button>
//                         <WhiteSpace />
//                         <Button style={{width: 150}} className="radius-button"  size={"small"} type={"ghost"}>专家人工建议</Button>
//                       </div>
//                     </Flex>
//                     <WhiteSpace size={"lg"} />
//                   </List.Item>
//                 </List>
//               </Accordion.Panel>
//             </Accordion>
//             <WhiteSpace />
//             <List renderHeader="金融（1）" className="list-card list-no-border">
//               <List.Item wrap onClick={() => this.goTo("details")}>
//                 <div className="omit omit-2 ">西青经济开发区专项发展资金申请表——支持企业研发创新通知</div>
//                <Flex className="size-14 gray-three-color mt10">
//                  <Flex.Item>
//                    扶持力度：<span className="color-black">最高200万元</span>
//                  </Flex.Item>
//                  <Flex.Item>
//                    申报截止：<span className="color-black">剩余<strong className="color-red size-18">13</strong>天</span>
//                  </Flex.Item>
//                </Flex>
//                 <div className="omit omit-1 size-14 gray-three-color mt5">
//                    <span>匹配度：</span> <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 gray-three-color" />
//                 </div>
//               </List.Item>
//               <List.Item wrap onClick={() => this.goTo("details")}>
//                 <div className="omit omit-2 ">西青经济开发区专项发展资金申请表——支持企业研发创新通知</div>
//                 <Flex className="size-14 gray-three-color mt10">
//                   <Flex.Item>
//                     扶持力度：<span className="color-black">最高200万元</span>
//                   </Flex.Item>
//                   <Flex.Item>
//                     申报截止：<span className="color-black">剩余<strong className="color-red size-18">13</strong>天</span>
//                   </Flex.Item>
//                 </Flex>
//                 <div className="omit omit-1 size-14 gray-three-color mt5">
//                   <span>匹配度：</span> <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 gray-three-color" />
//                 </div>
//               </List.Item>
//               <List.Item wrap onClick={() => this.goTo("details")}>
//                 <div className="omit omit-2 ">西青经济开发区专项发展资金申请表——支持企业研发创新通知</div>
//                 <Flex className="size-14 gray-three-color mt10">
//                   <Flex.Item>
//                     扶持力度：<span className="color-black">最高200万元</span>
//                   </Flex.Item>
//                   <Flex.Item>
//                     申报截止：<span className="color-black">剩余<strong className="color-red size-18">13</strong>天</span>
//                   </Flex.Item>
//                 </Flex>
//                 <div className="omit omit-1 size-14 gray-three-color mt5">
//                   <span>匹配度：</span> <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 gray-three-color" />
//                 </div>
//               </List.Item>
//             </List>
//             <List renderHeader="产业（2）" className="list-card list-no-border">
//               <List.Item wrap>
//                 <div className="omit omit-2 ">西青经济开发区专项发展资金申请表——支持企业研发创新通知</div>
//                 <Flex className="size-14 gray-three-color mt10">
//                   <Flex.Item>
//                     扶持力度：<span className="color-black">最高200万元</span>
//                   </Flex.Item>
//                   <Flex.Item>
//                     申报截止：<span className="color-black">剩余<strong className="color-red size-18">13</strong>天</span>
//                   </Flex.Item>
//                 </Flex>
//                 <div className="omit omit-1 size-14 gray-three-color mt5">
//                   <span>匹配度：</span> <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 gray-three-color" />
//                 </div>
//               </List.Item>
//               <List.Item wrap>
//                 <div className="omit omit-2 ">西青经济开发区专项发展资金申请表——支持企业研发创新通知</div>
//                 <Flex className="size-14 gray-three-color mt10">
//                   <Flex.Item>
//                     扶持力度：<span className="color-black">最高200万元</span>
//                   </Flex.Item>
//                   <Flex.Item>
//                     申报截止：<span className="color-black">剩余<strong className="color-red size-18">13</strong>天</span>
//                   </Flex.Item>
//                 </Flex>
//                 <div className="omit omit-1 size-14 gray-three-color mt5">
//                   <span>匹配度：</span> <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 gray-three-color" />
//                 </div>
//               </List.Item>
//               <List.Item wrap>
//                 <div className="omit omit-2 ">西青经济开发区专项发展资金申请表——支持企业研发创新通知</div>
//                 <Flex className="size-14 gray-three-color mt10">
//                   <Flex.Item>
//                     扶持力度：<span className="color-black">最高200万元</span>
//                   </Flex.Item>
//                   <Flex.Item>
//                     申报截止：<span className="color-black">剩余<strong className="color-red size-18">13</strong>天</span>
//                   </Flex.Item>
//                 </Flex>
//                 <div className="omit omit-1 size-14 gray-three-color mt5">
//                   <span>匹配度：</span> <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 highlight-color" />
//                   <i className="icon icon-star size-14 gray-three-color" />
//                 </div>
//               </List.Item>
//             </List>
//           </>
//       }

//       // 认证通过界面
//       passContent(){
//           return <Flex align={"center"} justify={"center"} className="height-full white-bg">
//                <div className={"pass-box"}>
//                  <div className="pass-icon ">
//                    <i className={"icon icon-duihao"} />
//                  </div>
//                  <div className="size-16 mt40 text">企业认证通过后，即可查看给出适合您的优惠政策啦，请耐心等待~</div>
//                  <Button onClick={() => {this.setState({stepIndex: 2})}} style={{width: 200}} className="radius-button mt20" type={"primary"}>查看认证进度</Button>
//                </div>
//           </Flex>
//       }

//       render(): React.ReactNode {
//         return <div className="container container-fill container-column body-transparency">
//           {this.renderHeader()}
//           <div className="container container-fill container-body container-scrollable body-transparency">
//             {this.renderBody()}
//           </div>
//           {
//             this.state.stepIndex === 0 ? this.renderFooter() : ""
//           }
//         </div>
//       }

//       renderFooter(): React.ReactNode {
//         return  <Flex className="flex-collapse white">
//          <Flex.Item>
//            <Button
//              type="primary"
//              onClick={() => {
//               this.setState({stepIndex: 1})
//              }}
//            >
//              提交认证
//            </Button>
//          </Flex.Item>
//         </Flex>
//       }

//     }

//     export const Page = template(Component, (state) => state[Namespaces.policy]);
// }
