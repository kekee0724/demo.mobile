import React from "react";
import ReactDOM from "react-dom";

import { Flex, Toast } from "antd-mobile-v2";

import { browser, getLocalStorage, isAnonymous, template, Validators } from "@reco-m/core";
import { setEventWithLabel, setScrollViewZoomClose, setScrollViewZoomOpen, shake, ViewComponent } from "@reco-m/core-ui";

import { commentFooterModel, Namespaces } from "@reco-m/comment-models";
import { FavoritesLink } from "@reco-m/favorites-common";
import { ServiceSourceEnum, ServiceSourceTextEnum } from "@reco-m/ipark-common";
import { statisticsEvent } from "@reco-m/ipark-statistics";

export namespace CommentFooter {
  export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
    bindTableName: any;
    bindTableId: any;
    bindTableValue: any;
    title: any;
    scroll?: any;
    scrollTop?: any;
    commentSuccess?: any;
  }

  export interface IState extends ViewComponent.IState, commentFooterModel.StateType { }

  export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
    namespace = Namespaces.commentFooter;
    scrollTop = -1;
    scrollTops = 0;

    get commentNum(): number {
      return this.getSearchParam("commentNum") ? this.getSearchParam("commentNum") : this.props.match!.params.commentNum;
    }

    componentWillUnmount() {
      $("#autoFocus").blur();
      this.dispatch({ type: "input", data: { replyContent: "", comment: false } });
    }
    componentDidMount() {
      const { bindTableName, bindTableId } = this.props,
        data = {
          bindTableName: bindTableName,
          bindTableId: bindTableId,
          replyId: 0,
          pageIndex: 1,
        };
      this.dispatch({ type: `initPage`, data });
    }
    /*详情是否点赞*/
    isFollow() {
      const { bindTableName, bindTableId } = this.props;
      this.dispatch({
        type: "isFollow",
        data: {
          bindTableName: bindTableName,
          bindTableId: bindTableId,
          followType: 20,
        },
      });
    }
    /*详情点赞数*/
    getDianzanCount() {
      const { bindTableName, bindTableId } = this.props;
      this.dispatch({
        type: "getarticledianzancount",
        bindTableName: bindTableName,
        bindTableId: bindTableId,
      });
    }
    getCommentList() {
      const { bindTableName, bindTableId } = this.props,
        data = {
          bindTableName: bindTableName,
          bindTableId: bindTableId,
          pageIndex: 1,
        };
      this.dispatch({ type: "getCommentList", data: data });
    }

    commentChange(event) {
      this.dispatch({ type: "input", data: { replyContent: event.target.value } });
    }

    commentFocus() {
      this.dispatch({ type: "input", data: { comment: true } });
      if (!browser.versions.ios) {
        // 非IOS系统
        $("#comment").css({ position: "relative", opacity: "1" });
        $("#autoFocus").focus();
      } else {
        const handler = window["webkit"] && webkit && webkit.messageHandlers["bridgeMessage"];
        if (handler) {
          // 是在iOS壳子里
          setTimeout(() => {
            $("#mm").attr("style", "");
          }, 500);
          window["setHeightFooter"] = (height) => {
            $("#mm").attr("style", "");
            $("#comment").css({ top: "auto", bottom: height + "px", position: "absolute", opacity: "1" });
          };
          return;
        }
      }
    }

    commentBlur() {
      setScrollViewZoomClose();
      setTimeout(() => {
        window["setHeightFooter"] = null;
        $("#mm").attr("style", "");
        $("#comment").attr("style", "");
        this.dispatch({ type: "input", data: { comment: false } });
      }, 200);
    }

    /**
     * 点击激活评论框
     */
    commentClick() {
      setScrollViewZoomOpen(); // 设置wkwebview的frame到键盘上方
      const handler = window["webkit"] && webkit && webkit.messageHandlers["bridgeMessage"];
      if (handler) {
        // 是在iOS壳子里
        $("#mm").css({ top: "auto", bottom: "1000px", position: "absolute", opacity: "1" }); // 先抬高输入框防止wkwebview滚动
      }
      setTimeout(() => {
        this.dispatch({ type: "input", data: { comment: true } });
      }, 100);
    }

    validator() {
      const { required, composeControl } = Validators,
        { state } = this.props;
      return composeControl([required], { value: state!.replyContent, name: "评论内容" });
    }

    commentSuccess(e) {
      Toast.success(e, 1);

      this.dispatch({ type: "input", data: { replyContent: "" } });

      this.dispatch({ type: "comment/changeState", data: { commentSuccess: true } }); // 评论成功，更新评论列表

      this.props.commentSuccess!();
    }

    commentFail(msg: string) {
      Toast.fail(msg, 1);
      this.dispatch({ type: "input", data: { msg: "" } });
    }

    /**
     * 发表评论
     */
    publishReply() {
      const { state } = this.props;
      const msg = this.validator()!();
      if (msg) {
        Toast.fail(msg.msg.join(), 1.5);
        return;
      }
      if (!this.isAuth()) {
        this.goTo("login");
        return;
      }
      const { bindTableName, bindTableId, title } = this.props;
      let data = {
        bindTableName: bindTableName,
        bindTableId: bindTableId,
        replyId: 0,
        source: ServiceSourceTextEnum.app,
        sourceValue: ServiceSourceEnum.app,
        parkId: getLocalStorage("parkId"),
        commentContent: state!.replyContent,
        bindTableValue: title,
      };
      this.dispatch({
        type: "submitCommentContent",
        data: data,
        commentSuccess: (e) => this.commentSuccess(e),
        commentFail: (e) => this.commentFail(e),
      });
      this.dispatch({ type: "input", data: { comment: false } });
    }

    /**
     * 滚动到评论模块
     */
    commentScroll() {
      shake();
      const sc = $(this.props.scroll!);
      if (this.scrollTop > -1) {
        sc.stop().animate({ scrollTop: this.scrollTop });
        this.scrollTop = -1;
      } else {
        this.scrollTop = sc.scrollTop() as any;
        sc.stop().animate({ scrollTop: (ReactDOM.findDOMNode(this.props.scrollTop) as any).offsetTop });
      }
    }
    renderComentInput(): React.ReactNode {
      const { state } = this.props;
      return (
        <div className={`pl-list border-top-1px ${!getLocalStorage("height") ? "ios" : ""}`} id="comment">
          <Flex>
            <Flex.Item>
              <div className="input-box">
                <input
                  id="autoFocus"
                  placeholder="评论..."
                  style={{ fontSize: "15px" }}
                  autoFocus
                  maxLength={500}
                  onFocus={this.commentFocus.bind(this)}
                  onBlur={this.commentBlur.bind(this)}
                  onChange={this.commentChange.bind(this)}
                  value={state!.replyContent}
                />
              </div>
            </Flex.Item>
            <a
              onClick={() => {
                this.publishReply();
                setEventWithLabel(statisticsEvent.parkCircleSendComments);
              }}
            >
              发布
            </a>
          </Flex>
        </div>
      );
    }
    itemLikeClick(e) {
      const { state, bindTableName, bindTableId } = this.props,
        isFollow = state!.isFollow;

      shake();
      isAnonymous()
        ? this.goTo("login")
        : this.dispatch({
          type: `likeComment`,
          bindTableName: bindTableName,
          comment: { isAgreed: isFollow, id: bindTableId },
          likecallback: () => {
            setEventWithLabel(statisticsEvent.parkHeadPraise);
            this.getDianzanCount();
          },
        });
      e.stopPropagation();
    }
    renderComentFun(data): React.ReactNode {
      const { state } = this.props,
        isFollow = state!.isFollow;
      console.log(state)
      return (
        <Flex>
          <Flex.Item>
            <div className="input-box">
              <input onClick={this.commentClick.bind(this)} maxLength={500} style={{ fontSize: "15px" }} type="text" placeholder="请输入您的评论" readOnly></input>
            </div>
          </Flex.Item>
          <div className="comment-collect">
            <div className="text-center" onClick={this.commentScroll.bind(this)}>
              <i className="icon icon-huifu size-18 gray-two-color"></i>
              <div className="size-10 gray-three-color">{this.commentNum || state!.number}</div>
            </div>
            <div
              className="text-center"
              onClick={(e) => {
                this.itemLikeClick(e);
              }}
            >
              {isFollow ? <i className="icon icon-newzan size-18 primary-color"></i> : <i className="icon icon-newzan size-18 gray-two-color"></i>}
              <div className={!isFollow ? "size-10 gray-three-color" : "size-10 primary-color"}>{state!.dianzancount}</div>
            </div>
            <div className="text-center">{this.renderEmbeddedView(FavoritesLink.Page as any, data)}</div>
          </div>
        </Flex>
      );
    }
    renderComent(data): React.ReactNode {
      const { state } = this.props;

      return state!.comment === true ? this.renderComentInput() : this.renderComentFun(data);
    }

    render(): React.ReactNode {
      const { bindTableName, bindTableId, title } = this.props,
        data = {
          bindTableName: bindTableName,
          bindTableId: bindTableId,
          bindTableValue: title,
          isIcon: true,
          favoriteSuccess: () => setEventWithLabel(statisticsEvent.parkHeadlineCollection),
        };
      return (
        <div id="mm" className="comment-box border-top-1px">
          {this.renderComent(data)}
        </div>
      );
    }
  }

  export const Page = template(Component, (state) => state[Namespaces.commentFooter]);
}
