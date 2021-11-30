import React from "react";

import { List, Flex, WhiteSpace, PullToRefresh, ListView } from "antd-mobile-v2";

import { template, formatDateTime, getLocalStorage } from "@reco-m/core";

import { ListComponent, ImageAuto, Container, setEventWithLabel, NoData } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, activityStatus, ActivityModeEnum, activityModel } from "@reco-m/activity-models";

import { renderBadgetext } from "@reco-m/activity";

export namespace ActivityDiscover {
  export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
    selectTagtest?: any;
  }
  export interface IState extends ListComponent.IState, activityModel.StateType { }
  export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
    showloading = true;
    namespace = Namespaces.activity;
    showheader = this.getSearchParam("key") ? true : false;
    headerContent = "活动";
    key: any;
    parkId: any;
    scrollable = false;

    componentDidMount() {
      setEventWithLabel(statisticsEvent.parkActiveList);
      this.key = this.getSearchParam("key");
      this.parkId = getLocalStorage("parkId");
      const data = {
        pageIndex: 1,
        isValid: true,
        key: this.key,
        parkId: this.parkId,
        activityTypeValue: getLocalStorage("activityTypeValue")
      };
      this.dispatch({ type: `initPage`, data: data });
    }

    componentReceiveProps(nextProps: Readonly<IProps>): void {
      this.shouldUpdateData(nextProps.state);
      let npath = nextProps.location,
        tpath = this.props.location;
      if (npath!.pathname!.length < tpath!.pathname!.length) {
        this.pullToRefresh();
      }
    }

    componentWillUnmount() {
      this.dispatch({ type: "init" });
    }

    getActivityList(pageIndex: number, _: string) {
      const { state } = this.props,
        activityTypeValue = getLocalStorage("activityTypeValue") || state!.activityTypeValue;
      const data = {
        pageIndex: pageIndex,
        isValid: true,
        key: this.key,
        parkId: this.parkId,
        activityTypeValue,
      };

      this.dispatch({
        type: "getActivityContents",
        data: data,
      });
    }

    /**
     * 顶部下拉刷新列表
     */
    pullToRefresh() {
      this.getActivityList(1, (this.props.state as any).orderBy);
    }

    /**
     * 上拉刷新
     */
    onEndReached() {
      const { state } = this.props;
      this.getActivityList(((state as any).currentPage || 0) + 1, (state as any).orderBy);
    }

    renderActivityMessage(itemData: any): React.ReactNode {
      return (
        <>
          <div className="park-title">{itemData.title}</div>
          <div className="hint-box">
            <span>
              <i className="icon icon-shijian4" />
              {formatDateTime(itemData.StartTime, "yyyy-MM-dd hh:mm")}
            </span>
            <span>
              <i className="icon icon-weizhi1" />
              {itemData.address}
            </span>
            <span className="pull-right">
              <i className="icon icon-ren" />
              {itemData.AppliedMembers}
            </span>
          </div>
        </>
      );
    }
    renderPullToRefresh(onRefresh?: () => void): React.ReactNode {
      const { state } = this.props;
      return (
        <PullToRefresh
          getScrollContainer={null!}
          indicator={this.renderPullToRefreshIndicator()}
          distanceToRefresh={40}
          direction={this.state.down !== !1 ? "down" : "up"}
          refreshing={this.state.refreshing && (state as any).refreshing}
          damping={50}
          onRefresh={() => typeof onRefresh === "function" && (this.setState({ refreshing: !0 }), onRefresh())}
        />
      );
    }
    /**
     * 列表底部
     */
    renderListFooter(): React.ReactNode {
      return (
        <div className="text-center">
          <span className="loadmore__tips">——— 没有更多内容了 ———</span>
        </div>
      );
    }
    getListView(middle: boolean = false): React.ReactNode {
      const { scroll = this.scroll } = this.props,
        state = this.getPageData(),
        { dataSource } = this.state || ({} as any);

      middle = middle || this.middle || this.props.middle!;
      // 首先判断是否优化为加载完数据不显示暂无数据兼容旧版本
      return (state as any).refreshing !== false && this.loadingOptimize ? null : dataSource && dataSource.getRowCount() ? (
        middle && !scroll ? null : (
          <ListView
            ref={
              middle
                ? (el: any) => {
                  el &&
                    scroll &&
                    (function (lvr) {
                      lvr.componentWillUnmount(), (lvr.ScrollViewRef = scroll), lvr.componentDidMount();
                    })(el.listviewRef.ListViewRef),
                    (this.listView = el);
                }
                : (el) => (this.listView = el)
            }
            className={middle ? "container-list" : undefined}
            initialListSize={this.state.pageSize}
            dataSource={this.state.dataSource}
            renderFooter={this.renderListFooter.bind(this)}
            renderRow={this.renderItemsContent.bind(this)}
            style={{ height: "100%" }}
            scrollRenderAheadDistance={500}
            pullToRefresh={this.renderPullToRefresh(this.pullToRefresh.bind(this))}
            onEndReached={this.onEndReached.bind(this)}
            onEndReachedThreshold={200}
            pageSize={this.state.pageSize}
          />
        )
      ) : (
        <NoData.Component text={this.NoDataText || "暂无数据"} />
      );
    }
    renderItemTag(item) {
      let activityTagArr = item.activityTag ? item.activityTag.split(",") : [];
      return (
        activityTagArr &&
        activityTagArr.map((item, index) => {
          return (
            <span key={index} className="size-12 mr5" style={{ color: "#02b8cd" }}>
              #{item}
            </span>
          );
        })
      );
    }
    /**
     * 渲染每一条新闻内容
     */
    renderItemsContent(item: any, i: number): React.ReactNode {
      const url = item.coverPictureUrl ? item.coverPictureUrl : item.pictureUrlList && item.pictureUrlList.length ? item.pictureUrlList[0] : "";

      return (
        <div className="hot-active">
          <List.Item
            wrap
            key={i}
            onClick={() => {
              this.goTo(`activityDetail/${item.id}`);
            }}
          >
            <WhiteSpace />
            <div className="img">
              <ImageAuto.Component cutWidth="384" cutHeight="233" src={url} />
              {renderBadgetext(item)}
            </div>
            <div className="omit omit-1 size-17 mt14">{item.activityName}</div>
            <div className="omit omit-1 mt5">
              <span className="primary-color size-12 mr5">#{item.activityType}</span>
              {this.renderItemTag(item)}
            </div>
            <Flex className="mt5">
              <Flex.Item>
                <div className="gray-three-color size-12">
                  <i className="icon size-13 mr5 gray-four-color icon-newtime" />
                  {formatDateTime(item.startTime, "yyyy-MM-dd hh:mm")} ~ {formatDateTime(item.endTime, "yyyy-MM-dd hh:mm")}
                </div>
              </Flex.Item>
              <div className="gray-three-color size-12">
                <i className="icon size-13 mr5 gray-four-color icon-newren1" />
                <span className="color-3">{item.applyNumber ? item.applyNumber : 0}</span>人报名
              </div>
            </Flex>
            {item.activityModeValue === ActivityModeEnum.offline && (
              <div className="gray-three-color size-12 mt3 omit omit-1">
                <i className="icon size-13 mr5 gray-four-color icon-newadds" />
                {item.activityAddress}
              </div>
            )}
            <WhiteSpace size={"sm"} />
          </List.Item>
        </div>
      );
    }

    getTabsTitle(title: string, order: boolean): React.ReactNode {
      return (
        <span className="size-14">
          {title}
          {order ? <i className="icon icon-jiangxu size-14" /> : <i className="icon icon-shengxu size-14" />}
        </span>
      );
    }

    dispatchAction(data: any) {
      this.dispatch({ type: "input", data: data.selectedData });
      const { state } = this.props,
        activityTypeValue = getLocalStorage("activityTypeValue") || state!.activityTypeValue;
      this.dispatch({
        type: "getActivityContents",
        data: {
          pageIndex: 1,
          orderBy: "ActivitySort desc," + data.orderBy,
          activityStatus: activityStatus,
          key: this.key,
          parkId: this.parkId,
          activityTypeValue
        },
      });
      this.scrollTo();
    }

    renderBody(): React.ReactNode {
      const { state } = this.props;
      return (state as any).refreshing !== false ? null : <Container.Component body>{this.getListView()}</Container.Component>;
    }
  }

  export const Page = template(Component, (state) => state[Namespaces.activity]);
}
