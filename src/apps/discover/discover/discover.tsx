import React from "react";
import ReactDOM from "react-dom";

import { Drawer, WingBlank, Icon } from "antd-mobile-v2";

import { template, setLocalStorage, getLocalStorage } from "@reco-m/core";
import { ViewComponent, TabbarContext, Container, setNavTitle } from "@reco-m/core-ui";
import { discoverhomeModel, Namespaces, DiscoverTypeEnum } from "@reco-m/discover-models";
import { ArticleHome } from "@reco-m/article";
import { ActivityDiscover } from "@reco-m/ipark-white-activity";
import { Circle } from "@reco-m/ipark-white-circle";


const data = ["话题", "活动", "资讯"];

export namespace DiscoverHome {
  export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

  export interface IState extends ViewComponent.IState, discoverhomeModel.StateType { }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
    showloading = false;
    namespace = Namespaces.discoverhome;
    showback = false;
    audio;
    scrollable = true;

    componentMount() {
      this.setState = () => false;
    }

    componentDidMount() {
      let parkId = this.getSearchParam("parkId");
      if (parkId) {
        setLocalStorage("parkId", parkId);
        setLocalStorage("hasGetNearPark", "1");
      }
      setNavTitle.call(this, client.title);
      const tabID = this.props.match!.params.tabID;
      switch (tabID) {
        case "0":
          this.dispatch({ type: "input", data: { selectTag: 0 } });
          break;
        case "1":
          this.dispatch({ type: "input", data: { selectTag: 1 } });
          break;
        case "2":
          this.dispatch({ type: "input", data: { selectTag: 2 } });
          break;
        default:
          this.dispatch({ type: "input", data: { selectTag: 0 } });
      }
      this.dispatch({
        type: "initPage",
      });
    }

    componentReceiveProps(nextProps: Readonly<P>): void {
      setNavTitle.call(this, client.title, nextProps);
      let npath = nextProps.location,
        tpath = this.props.location;
      if (npath!.pathname!.length < tpath!.pathname!.length) {
        this.refreshNewesttopicdetails();
        this.dispatch({ type: "circle/getHostCircle" });
      }
    }

    componentWillUnmount() {
      this.clear();
    }

    clear() {
      setLocalStorage("activityTypeValue", '')
      setLocalStorage("categoryValue", '')
      setLocalStorage("articleTagValue", '')
      setLocalStorage("currentTagName", '')
      this.dispatch({ type: "input", data: { isSideOpen: false } })
    }

    refreshNewesttopicdetails() {

      this.dispatch({ type: "newesttopicdetails/input", data: { show: false } });
      this.dispatch({ type: "newesttopicdetails/getCircleTopicTwo" });
    }

    scrollHead() {
      setTimeout(() => {
        $(".am-list-view-scrollview").off("scroll", this.topHeight).on("scroll", this.topHeight);
        $(".container-scrollable").off("scroll", this.topHeight2).on("scroll", this.topHeight2);
      }, 500);
    }

    topHeight2() {
      let et = $(".dynamic-gambit-list").offset() ? ($(".dynamic-gambit-list").offset()!.top as any) : 0;
      if (et < 50) {
        $(".discover-tabs").addClass("show");
      } else {
        $(".discover-tabs").removeClass("show");
      }
      const top = $(this).scrollTop() || 0;
      $("#nav_box_Shadow").length <= 0 && $(this).parents(".container-page").find(".discover-tabs").append('<div id="nav_box_Shadow"></div>');
      $(this)
        .parents(".container-page")
        .find("#nav_box_Shadow")
        .css({
          background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
        });
    }

    topHeight() {
      let top = $(".am-list-view-scrollview").scrollTop() as any;
      if (top > 0) {
        $(".discover-tabs").addClass("show");
      } else {
        $(".discover-tabs").removeClass("show");
      }
      $("#nav_box_Shadow").length <= 0 && $(this).parents(".container-page").find(".discover-tabs").append('<div id="nav_box_Shadow"></div>');
      $(this)
        .parents(".container-page")
        .find("#nav_box_Shadow")
        .css({
          background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
        });
    }

    renderPage(): React.ReactNode {
      let state = this.props.state,
        clickNum = state!.clickNum,
        selectTag = state!.selectTag,
        selectTagtest = state!.selectTagtest;
      return selectTag === DiscoverTypeEnum.circle
        ? this.renderEmbeddedView(Circle.Page as any, { clickNum })
        : selectTag === DiscoverTypeEnum.activityDiscover
          ? this.renderEmbeddedView(ActivityDiscover.Page as any, { selectTagtest: selectTagtest })
          : selectTag === DiscoverTypeEnum.articleHome
            ? this.renderEmbeddedView(ArticleHome.Page as any, { hideHeader: true })
            : "";
    }

    selectTabs(e) {
      let state = this.props.state,
        clickNum = state!.clickNum || 0;
      $(".discover-tabs").find("#nav_box_Shadow").attr("style", "");
      this.dispatch({ type: "input", data: { selectTag: e, clickNum: clickNum + 1 } });
    }

    runTag(e) {
      this.dispatch({ type: "input", data: { isSideOpen: e } });
    }

    renderHeaderRight(): React.ReactNode {
      return (
        <div className="flex-center">
          <i
            className={this.isAuth() ? "icon icon-newsel" : "icon icon-newsel size-18"}
            onClick={() => {
              this.clear()
              this.goTo(`search?isDiscover=true`);
            }}
          />
        </div>
      );
    }

    renderHeader(): React.ReactNode {
      let state = this.props.state,
        selectTag = state!.selectTag;
      return (
        <div>
          <div className="discover-tabs">
            {data.map((item, i) => {
              return (
                <span
                  className={selectTag === i ? "active" : ""}
                  key={i}
                  onClick={() => {
                    this.clear()
                    this.dispatch({ type: "update", data: { activityselecticon: {}, cirecleselecticon: {}, articleselecticon: {} } });
                    this.selectTabs(i);
                    this.refreshNewesttopicdetails();
                  }}
                >
                  {item}
                </span>
              );
            })}
            {/* 筛选 */}
            <div className="discover-parse" style={{ display: "flex" }}>
              {this.renderHeaderRight()}
              <i className={"icon icon-newsever "} style={{ marginLeft: "10px" }} onClick={() => this.runTag(true)} />
            </div>
          </div>
        </div>
      );
    }

    renderTag(title, tag, selectTag): React.ReactNode {
      let state = this.props.state,
        tags = state![tag],
        currentTagName = getLocalStorage("currentTagName");
      return (
        <>
          <div className="tag-screen-box">
            <div className="service-screen-title">{title}</div>
            <div className="row gutter-5">
              {tags &&
                tags.map((e, j) => {
                  return (
                    <div key={j} className="park-col park-col-8">
                      <span className={`parkTag type1 mb10 ${currentTagName === e.tagName ? 'active' : ''}`} onClick={() => {
                        let tagValue = e.tagValue
                        if (currentTagName === e.tagName) {
                          this.clear()
                          // this.dispatch({ type: "input", data: { currentTagName: null } })
                          tagValue = ''
                        } else {
                          setLocalStorage("currentTagName", e.tagName)
                          this.dispatch({ type: "input", data: { currentTagName: e.tagName } })
                        }
                        this.dispatch({ type: "update", data: { activityselecticon: {}, cirecleselecticon: {}, articleselecticon: {} } });
                        this.selectTabs(selectTag);
                        if (selectTag === DiscoverTypeEnum.circle) {
                          setLocalStorage("categoryValue", tagValue)
                          setLocalStorage("activityTypeValue", '')
                          setLocalStorage("articleTagValue", '')
                          this.dispatch({ type: "circle/getHostCircle" })
                          this.refreshNewesttopicdetails();
                        } else if (selectTag === DiscoverTypeEnum.activityDiscover) {
                          setLocalStorage("activityTypeValue", tagValue)
                          setLocalStorage("categoryValue", '')
                          setLocalStorage("articleTagValue", '')
                          this.dispatch({
                            type: "activity/getActivityContents",
                            data: {
                              pageIndex: 1,
                              isValid: true,
                              parkId: getLocalStorage("parkId"),
                              activityTypeValue: tagValue,
                            },
                          });
                        } else if (selectTag === DiscoverTypeEnum.articleHome) {
                          setLocalStorage("articleTagValue", tagValue)
                          setLocalStorage("activityTypeValue", '')
                          setLocalStorage("categoryValue", '')
                          this.dispatch({
                            type: "article/getArticleList",
                            data: {
                              pageIndex: 1,
                              parkId: getLocalStorage("parkId"),
                              catalogueCode: "DTZX",
                              tagValue: tagValue
                            }
                          });
                        }
                        this.runTag(false)
                      }}>{e.tagName}</span>
                    </div>
                  );
                })}
            </div>
          </div>

        </>
      )
    }

    renderSlider(): React.ReactNode {
      return (
        <div className="drawer-detail">
          <Container.Component direction="column" fill>
            <div className="colse-btn text-right">
              <Icon size={"lg"} type={"cross"} onClick={() => this.runTag(false)} />
            </div>
            <WingBlank>
              {this.renderTag("话题", "cirecletag", DiscoverTypeEnum.circle)}
              {this.renderTag("活动", "activitytag", DiscoverTypeEnum.activityDiscover)}
              {this.renderTag("资讯", "articletag", DiscoverTypeEnum.articleHome)}
            </WingBlank>
          </Container.Component>
        </div>
      );
    }

    render(): React.ReactNode {
      let state = this.props.state,
        isSideOpen = state!.isSideOpen;
      this.scrollHead();

      return (
        <Drawer
          className="max-drawer my-drawer"
          sidebar={this.renderSlider()}
          docked={false}
          open={isSideOpen}
          position="right"
          onOpenChange={() => this.dispatch({ type: "input", data: { isSideOpen: false } })}
        >
          <Container.Component key="l" fill direction="column" ref={(el) => this.refScroll(ReactDOM.findDOMNode(el))}>
            {this.renderHeader()}
            {this.renderPage()}
            {this.renderFooter()}
          </Container.Component>
        </Drawer>
      );
    }

    renderFooter(): React.ReactNode {
      return <TabbarContext.Consumer>{(Tabbar) => <Tabbar {...this.props} type={"discover"} />}</TabbarContext.Consumer>;
    }
  }

  export const Page = template(Component, (state) => state[Namespaces.discoverhome]);
}
