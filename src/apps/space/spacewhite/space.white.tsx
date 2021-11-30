import React from "react";

import { List, WhiteSpace } from "antd-mobile-v2";

import { template, isAnonymous } from "@reco-m/core";

import { ListComponent, ImageAuto } from "@reco-m/core-ui";

import { Namespaces, spaceModel } from "@reco-m/space-models";
export namespace SpaceWhite {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, spaceModel.StateType {
        spaceData?: any[];
        pageIndex?: number;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.space;
        showloading = false;
        showheader = false;
        scrollable = false;

        componentReceiveProps(nextProps: Readonly<P>): void {
            this.shouldUpdateData(nextProps.state);
        }

        componentMount() {
            this.dispatch({ type: `initPage` });
        }

        getSpaceListInterface(pageIndex?: number) {
            this.dispatch({ type: "getSpaceListInterface", param: { pageIndex: pageIndex } });
        }
        selectText() {
            $(".more-text").each(function () {
                let hg = $(this).find("span").height() as any;
                if (hg > 70) {
                    $(this).addClass("active");
                }
            });
        }
        showMore(event) {
            if ($(event.path[2]).hasClass("showText")) {
                $(event.path[2]).removeClass("showText");
            } else {
                $(event.path[2]).addClass("showText");
            }
        }
        /**
         * 刷新列表
         */
        pullToRefresh() {
            this.getSpaceListInterface(1);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            const { state } = this.props;
            this.getSpaceListInterface((state!.currentPage || 0) + 1);
        }

        /**
         * 渲染Items的内容
         */
        renderItemsContent(data: any, _: any, i: number): React.ReactNode {
            return <List ref={() => this.selectText()} key={i} className="border-none">
            <List.Item wrap>
                <div
                    onClick={() => {
                        isAnonymous() ? this.goTo("login") : this.goTo(`spacedetail/${data && data.id}`);
                    }}
                >
                    <ImageAuto.Component cutWidth="384" cutHeight="233" src={(data && data.coverPicUrl &&data.coverPicUrl.filePath) || ""}></ImageAuto.Component>
                </div>
                <div className="impression-head-infos">
                    <div
                        className="size-18 pb10 mt15 omit omit-1"
                        onClick={() => {
                            isAnonymous() ? this.goTo("login") : this.goTo(`spacedetail/${data && data.id}`);
                        }}
                    >
                        {data && data.spaceName}
                    </div>
                    <div className="size-13 mb10 omit omit-1">
                        <i className="icon icon-newadds size-16 mr5"></i> <span>{data && data.address}</span>
                    </div>
                    <p
                        className="text more-text omit omit-3"
                        onClick={() => {
                            isAnonymous() ? this.goTo("login") : this.goTo(`spacedetail/${data && data.id}`);
                        }}
                    >
                        <span>{data && data.summary}</span>
                    </p>
                </div>
            </List.Item>
            <WhiteSpace className="whitespace-gray-bg" />
        </List>;
        }
        render(): React.ReactNode {
            return this.getListView();
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.space]);
}
