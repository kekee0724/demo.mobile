import React from "react";

import { List, Flex, WhiteSpace } from "antd-mobile-v2";

import { template, formatDateTime, getLocalStorage } from "@reco-m/core";

import { ViewComponent, ImageAuto, NoData } from "@reco-m/core-ui";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { Namespaces, ActivityModeEnum, activityModel } from "@reco-m/activity-models";

import { renderBadgetext } from "@reco-m/activity";
export namespace ActivityHome {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        selectTagtest?: any;
    }

    export interface IState extends ViewComponent.IState, activityModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.activity;
        showheader = false;
        key: any;
        parkId: any;

        componentDidMount() {
            this.key = this.getSearchParam("key");
            this.parkId = getLocalStorage("parkId");
            const data = {
                pageIndex: 1,
                orderBy: "applyNumber desc",
                isValid: true,
                key: this.key,
                parkId: this.parkId
            };
            this.dispatch({ type: `initPageHome`, data: data });
        }
        rendercontent(content): React.ReactNode {
            return content.items.map((data, i) => {
                const url = data.coverPictureUrl ? data.coverPictureUrl : data.pictureUrlList && data.pictureUrlList[0]
                if (i < 3) {
                    return <List.Item
                        key={i}
                        wrap
                        onClick={() => {
                            this.goTo(`activityDetail/${data.id}`);
                        }}
                    >
                        <div className="img">
                            <ImageAuto.Component cutWidth="384" cutHeight="233" src={url ? url : ''} />
                            {renderBadgetext(data)}
                        </div>
                        <div className="omit omit-1 size-17 mt14">{data && data.activityName}</div>
                        <Flex className="mt5">
                            <Flex.Item>
                                <div className="gray-three-color size-12">
                                    <i className="icon size-13 mr5 gray-four-color icon-newtime" />
                                    {formatDateTime(data && data.startTime, "yyyy-MM-dd hh:mm")} ~ {formatDateTime(data && data.endTime, "yyyy-MM-dd hh:mm")}
                                </div>
                            </Flex.Item>
                            <div className="gray-three-color size-12">
                                <i className="icon size-13 mr5 gray-four-color icon-newren1" />
                                <span className="color-3">{data.applyNumber ? data.applyNumber : 0}</span>人报名
                            </div>
                        </Flex>
                        {data.activityModeValue === ActivityModeEnum.offline && <div className="gray-three-color size-12 mt3 omit omit-1">
                            <i className="icon size-13 mr5 gray-four-color icon-newadds" />
                            {data && data.activityAddress}
                        </div>}
                        <WhiteSpace size={"sm"} />
                    </List.Item>
                }
            })
        }
        getCountArr(count) {
            let items: any = [];

            for (let i = 0; i < count; i++) {
                items.push(1);
            }

            return items;
        }
        /**
         * 骨架屏
         */
        renderSkeletons(count): React.ReactNode {
            let items = this.getCountArr(count);

            return items.map((_, i) => (

                <List.Item key={i} wrap>
                    <SkeletonTheme color={"#F0F0F0"} highlightColor={"f5f5f5"}>
                        <Skeleton height={200} />
                        <div className="mt14"><Skeleton count={1} height={20} width={250} /></div>
                        <Flex className="mt5" align="center">
                            <Flex.Item>
                                <Skeleton count={1} height={20} width={200} />
                            </Flex.Item>
                            <Skeleton count={1} height={20} width={50} />
                        </Flex>
                        <div className="mt14"><Skeleton count={1} height={20} width={150} /></div>
                    </SkeletonTheme>
                </List.Item>
            ));
        }
        render(): React.ReactNode {
            const { state } = this.props,
                content = (state as any).content
            return (
                    <List
                        className="hot-active"
                        renderHeader={
                            <Flex>
                                <span className="tit">热门活动</span>
                                <Flex.Item />
                                <span
                                    className="morelink"
                                    onClick={() => {
                                        this.goTo("/discover/1");
                                    }}
                                >
                                    更多
                                </span>
                            </Flex>
                        }
                    >
                        {(content && content.items) ?
                            (content.items.length ? this.rendercontent(content) : <NoData.Component></NoData.Component>)
                            :
                            this.renderSkeletons(3)
                        }
                    </List>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.activity]);
}
