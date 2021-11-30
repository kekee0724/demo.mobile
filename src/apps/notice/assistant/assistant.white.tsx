import React from "react";

import { Flex, Badge } from "antd-mobile-v2";

import { template, getLocalStorage } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { assistantModel, Namespaces } from "@reco-m/notice-models";
import Swiper from "swiper/swiper-bundle.js";
export namespace Assistantwhite {
  export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

  export interface IState extends ViewComponent.IState, assistantModel.StateType {
    viewRef?: any;
  }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
    showloading = false;
    namespace = Namespaces.assistant;
    swiper;
    componentMount(): void {
      const data = {
        pageIndex: 1,
        parkId: getLocalStorage("parkId"),
        isPublish: true,
        catalogueCode: "TZTG",
      };
      this.dispatch({ type: "initPage", data });
    }

    componentDidUpdate() {
      this.swiper && this.swiper.update();
    }
    refSwiper() {
      if (!this.swiper)
        this.swiper = new Swiper(".swiper-container", {
          direction: "vertical",
          slidesPerView: 1,
          loop: true,
          autoplay: {
            delay: 4000,
            disableOnInteraction: false,
          },
        });
    }
    renderNodata(): React.ReactNode {
      return (
        <Flex.Item
          onClick={() => {
            if (this.isAuth()) {
              this.goTo("noticelist");
            } else {
              this.goTo("login");
            }
          }}
        >
          <div className="secretary-item">
            暂无数据
          </div>
        </Flex.Item>
      );
    }
    renderList(): React.ReactNode {
      const { state } = this.props,
        noticeList = state!.noticeList || [];
      return (
        <Flex.Item>
          <div className="swiper-container white-home-swiper swiper-no-swiping" ref={() => this.refSwiper()}>
            <div className="swiper-wrapper">
              {noticeList.map((item, i) => {
                return (
                  <div
                    className="secretary-item swiper-slide"
                    key={i}
                    onClick={() => {
                      this.goTo(`articleDetail/${item.id}?type=通告详情`);
                    }}
                  >
                    {item.isRead ? <Badge>{item.title}</Badge> : <Badge dot>{item.title}</Badge>}
                  </div>
                );
              })}
            </div>
          </div>
        </Flex.Item>
      );
    }
    render(): React.ReactNode {
      const { state } = this.props,
        noticeList = state!.noticeList || [];
      return (
        <Flex className="secretary">
          <img className="tips" src="assets/images/white/secretary.png" onClick={() => this.goTo("noticelist")} />
          {noticeList && noticeList.length ? this.renderList() : this.renderNodata()}
        </Flex>
      );
    }
  }
  export const Page = template(Component, (state) => state[Namespaces.assistant]);
}
