import React from "react";
import ReactDOM from "react-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { Flex, WhiteSpace, List, WingBlank } from "antd-mobile-v2";

import { template, isAnonymous, getLocalStorage, setLocalStorage } from "@reco-m/core";

import { ViewComponent, ImageAuto, Container, setEventWithLabel, callModal, NoData } from "@reco-m/core-ui";

import { Namespaces, circleModel } from "@reco-m/ipark-white-circle-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import {debounce} from '@reco-m/ipark-common'

import { newesttopicdetails } from "./newest.topic.details";

export namespace Circle {
  export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
    clickNum?: any;
  }

  export interface IState extends ViewComponent.IState, circleModel.StateType { }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
    showloading = this.props.clickNum ? true : false;
    namespace = Namespaces.circle;
    showback = false;
    audio;
    viewRef;
    debounceJoinCircle = debounce(this.joinCircle.bind(this), 2000);
    debounceOutCircle = debounce(this.outCircle.bind(this), 2000);
    componentDidMount() {
      const data = {
        parkId: getLocalStorage("parkId"),
        pageIndex: 1,
        pageSize: 5,
        IsValid: true,
      };
      this.dispatch({ type: "initPage", data: { selectTag: 1, datas: data } });
    }
    outCircle(id) {
      this.dispatch({
        type: "outCircle",
        id: id,
        callback: () => {
          setEventWithLabel(statisticsEvent.parkCancelPartakeCircle);
          this.dispatch({
            type: "getHostCircle",
          });
        },
      });
    }
    joinCircle(id) {
      if (!this.isAuth()) {
        this.goTo(`/login`);
        return;
      }

      this.dispatch({
        type: "joinCircle",
        id: id,
        callback: () => {
          setEventWithLabel(statisticsEvent.parkPartakeCircle);
          this.dispatch({
            type: "getHostCircle",
          });
        },
      });
    }
    renderHeader() {
      return null;
    }

    /** 骨架屏 */
    renderSkeletons(count) {
      let items: any = [];
      for (let i = 0; i < count; i++) {
        items.push(1);
      }

      return this.props.clickNum
        ? null
        : items.map((_, i) => (
          <WingBlank key={i}>
            <WhiteSpace />
            <SkeletonTheme color={"#F0F0F0"} highlightColor={"f5f5f5"}>
              <div>
                <Skeleton circle={true} height={30} />
              </div>
            </SkeletonTheme>
            <WhiteSpace />
          </WingBlank>
        ));
    }
    renderHostCircleItem(): React.ReactNode {
      const { state } = this.props,
        hostCircle = state!.hostCircle;
      return (
        hostCircle &&
        hostCircle.length > 0 &&
        hostCircle.map((item, i) => {
          return (
            <div key={i}>
              <List.Item
                onClick={() => this.goTo(`circleDetail/${item.id}`)}
                wrap
                thumb={
                  <ImageAuto.Component
                    cutWidth="59"
                    cutHeight="59"
                    src={item.pictureUrlList && item.pictureUrlList[0]}
                    width="59px"
                    height="59px"
                  ></ImageAuto.Component>
                }
                extra={
                  !item.isSubscribe ? (
                    <div
                      className="tag type1"
                      onClick={(e) => {
                        isAnonymous() ? this.goTo("login") : this.debounceJoinCircle(item && item.id); // this.joinCircle(item && item.id);
                        e.stopPropagation();
                      }}
                    >
                      去参与
                    </div>
                  ) : (
                    <div
                      className="tag type2"
                      onClick={(e) => {
                        isAnonymous()
                          ? this.goTo("login")
                          : callModal("确认要取消参与吗?", () => {
                            this.debounceOutCircle(item && item.id); // this.outCircle(item && item.id);
                          });
                        e.stopPropagation();
                      }}
                    >
                      已参与
                    </div>
                  )
                }
              >
                <div className="title omit omit-2">{item.topicName}</div>
                <Flex className="mt5">
                  <Flex.Item>
                    <span className="mr5 size-14">成员</span>
                    <span className="color-a">{item.memberCount ? item.memberCount : 0}</span>
                  </Flex.Item>
                  <Flex.Item>
                    <span className="mr5 size-14">动态</span>
                    <span className="color-a">{item.postCount ? item.postCount : 0}</span>
                  </Flex.Item>{" "}
                </Flex>
              </List.Item>
              <WhiteSpace size="lg"></WhiteSpace>
            </div>
          );
        })
      );
    }

    clear() {
      setLocalStorage("activityTypeValue", '')
      setLocalStorage("categoryValue", '')
      setLocalStorage("articleTagValue", '')
      setLocalStorage("currentTagName", '')
    }

    renderHostCircle(): React.ReactNode {
      const { state } = this.props,
        hostCircle = state!.hostCircle;
      return (
        <List
          className="hot-active dynamic-gambit-list"
          renderHeader={
            <Flex>
              <span className="tit">热门话题</span>
              <Flex.Item></Flex.Item>
              <span
                className="morelink"
                onClick={() => {
                  this.clear()
                  this.goTo("circlelist");
                }}
              >
                更多
              </span>
            </Flex>
          }
        >
          {hostCircle ? hostCircle.length > 0 ? this.renderHostCircleItem() : <NoData.Component /> : this.renderSkeletons(3)}
        </List>
      );
    }
    iscroll(_el) {
      if (!this.viewRef && _el) {
        this.viewRef = ReactDOM.findDOMNode(_el);
        this.setState({ viewRef: this.viewRef });
      }
    }
    renderBody(): React.ReactNode {
      return (
        <Container.Component body>
          <Container.Component scrollable fill ref={(e) => this.iscroll(e)}>
            {this.renderHostCircle()}
            {this.state.viewRef && this.renderEmbeddedView(newesttopicdetails.Page as any, { scroll: this.state.viewRef, clickNum: this.props.clickNum })}
          </Container.Component>
        </Container.Component>
      );
    }
    renderFooter() {
      return (
        <div
          className="btn-edit"
          style={{ bottom: 60 }}
          onClick={() => {
            isAnonymous() ? this.goTo("login") : this.goTo("add");
          }}
        >
          <i className="icon icon-jiahao"></i>
        </div>
      );
    }
  }

  export const Page = template(Component, (state) => state[Namespaces.circle]);
}
