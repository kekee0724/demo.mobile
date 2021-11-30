import React from "react";

import { List, Flex, WhiteSpace } from "antd-mobile-v2";

import { template, friendlyTime, getLocalStorage } from "@reco-m/core";

import { ListComponent, ImageAuto, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { articleModel, Namespaces } from "@reco-m/article-models";

export namespace Article {
  export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {
    scroll?: any;
    hideHeader?: any;
  }

  export interface IState extends ListComponent.IState, articleModel.StateType {
  }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
    namespace = Namespaces.article;
    showheader = false;
    scrollTop = -1;
    key: any;
    showloading = this.props.hideHeader ? false : true;
    componentMount() {
      this.dispatch({ type: "init" });
    }
    componentDidMount() {
      this.key = this.getSearchParam("key");
      this.dispatch({
        type: `initPage`,
        data: {
          pageIndex: 1,
          key: this.key && decodeURI(this.key),
          parkId: getLocalStorage("parkId"),
          catalogueCode: "DTZX",
          tagValue: getLocalStorage("articleTagValue")
        }
      });
      setEventWithLabel(statisticsEvent.parkHeadlineListBrowse);
    }

    componentReceiveProps(nextProps: Readonly<IProps>): void {
      const { state } = nextProps,
        updataCommentCount = state!.updataCommentCount;

      this.shouldUpdateData(nextProps.state);
      updataCommentCount && this.updataCommentCount(); // 资讯详情页面返回，更新评论数量
    }
    updataCommentCount() {
      this.getData();

      this.dispatch({
        type: "input",
        data: { updataCommentCount: false }
      });
    }

    getData(pageIndex?: number) {
      const { state } = this.props,
        tagValue = getLocalStorage("articleTagValue") || state!.tagValue;
      this.dispatch({
        type: "getArticleList",
        data: {
          pageIndex: pageIndex || state!.pageIndex,
          key: this.key && decodeURI(this.key),
          parkId: getLocalStorage("parkId"),
          catalogueCode: "DTZX",
          tagValue
        }
      });
    }

    /**
     * 刷新列表
     */
    onRefresh() {
      this.getData(1);
    }

    /**
     * 上拉刷新
     */
    pullToRefresh() {
      this.getData(1);
    }

    /**
     * 下拉刷新
     */
    onEndReached() {
      const { state } = this.props;
      this.getData((state!.pageIndex || 0) + 1);
    }

    /**
     * 进入详情
     */
    addViewCounts(articleId: number) {
      this.goDetail(articleId);
    }

    goDetail(articleId: number) {
      this.goTo(`articleDetail/${articleId}`);
    }

    /**
     * 先判断有封面图片情况，就左右显示封面图片
     */
    renderHasArticleCoverPicture(data: any): React.ReactNode {
      return (
        <Flex align={"start"}>
          <Flex.Item>
            <div className="list-title">{data.title}</div>
          </Flex.Item>
          <div className="acticleList">
            <ImageAuto.Component cutWidth="110" cutHeight="80" src={data.coverUrl} width="110px" height="80px" />
          </div>
        </Flex>
      );
    }
    /**
     * 显示封面图片
     */
    renderArticleCoverPicture(data: any): React.ReactNode {
      return (
        <>
          <div className="list-title">{data.title}</div>
          {// 0张图片有无封面情况
            data.FileUsageUrl && <ImageAuto.Component cutWidth="384" cutHeight="233" src={data.coverUrl} height={20 * 1.3 + "vw"} />}
        </>
      );
    }

    /**
     * 显示单个图片
     */
    renderArticleSinglePicture(data: any): React.ReactNode {
      return (
        <Flex align={"start"}>
          <Flex.Item>
            <div className="title margin-right-xs">{data.title}</div>
          </Flex.Item>
          <ImageAuto.Component cutWidth="123" cutHeight="80" src={data.pictureUrlList[0]} width="32%" height="80px" compress={true} />
        </Flex>
      );
    }

    /**
     * 显示多个图片
     */
    renderArticleMultiPicture(data: any): React.ReactNode {
      const imgs = ((data.pictureUrlList && data.pictureUrlList.length > 2) ? data.pictureUrlList.slice(0, 3) : data.pictureUrlList) || [];
      return (
        <>
          <div className="title">{data.title}</div>
          <Flex>
            {imgs.map((item, k) => {
              return <Flex.Item key={k}>{<ImageAuto.Component cutWidth="188" cutHeight="117" src={item} height={`calc(56.25vw / ${imgs.length})`} />}</Flex.Item>;
            })}
          </Flex>
        </>
      );
    }

    renderPicture(data: any): React.ReactNode {
      return data.coverUrl
        ? this.renderHasArticleCoverPicture(data)
        : (data.pictureUrlList && data.pictureUrlList.length === 0)
          ? this.renderArticleCoverPicture(data)
          : (data.pictureUrlList && data.pictureUrlList.length) === 1
            ? this.renderArticleSinglePicture(data)
            : this.renderArticleMultiPicture(data);
    }

    renderItemsContent(data: any): React.ReactNode {
      const articleTagVMList = data.articleTagVMList || [];
      return (
        <List.Item onClick={() => this.addViewCounts(data.id)}>
          <WhiteSpace size={"sm"} />
          {this.renderPicture(data)}
          <List.Item.Brief>
            {data.isTop ?
              <span className="mr17 color-red">置顶</span> : ""
            }
            {articleTagVMList.length > 0 ? <span className="adds">{articleTagVMList[0].tagName || ""}</span> : ""}
            {data.publishTime ? <span className="time">{friendlyTime(data.publishTime)}</span> : ""}
            {data.viewCount || data.viewCount === 0 ? <span className="adds">{data.viewCount}浏览</span> : ""}
            {data.commentNumber || data.commentNumber === 0 ? <span className="adds">{data.commentNumber}评论</span> : ""}
          </List.Item.Brief>
          <WhiteSpace size={"sm"} />
        </List.Item>
      );
    }

    render(): React.ReactNode {
      const { state } = this.props;
      if (this.props.hideHeader) {
        return <div className="news-list" >{state!.refreshing !== false ? null : this.getListView()}</div>;
      } else {
        return (
          <div className="news-list" style={{ minHeight: "200px" }}>
            {state!.refreshing !== false ? null : this.getListView()}
          </div>
        );
      }
    }
  }

  export const Page = template(Component, state => state[Namespaces.article]);
}
