import React from "react";

import { template, formatDateTime } from "@reco-m/core";

import { ViewComponent, ImageAuto, Container, setEventWithLabel, HtmlContent } from "@reco-m/core-ui";

import { List, SearchBar, WhiteSpace, WingBlank, Flex, Tag, Icon } from "antd-mobile-v2";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, searchModel } from "@reco-m/search-models";

import { ResourceTypeEnum, htmlContentTreatWord, IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { isCertify } from "@reco-m/member-common";


export namespace Search {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, searchModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "搜索";
        bodyClass = "white-container";
        namespace = Namespaces.search;
        isDiscover = false;
        // get isDiscover() {
        //     return this.getSearchParam("isDiscover");
        // }
        componentDidMount() {
            this.isDiscover = !!this.getSearchParam("isDiscover");
            this.dispatch({ type: `initPage` });
        }
        componentWillUnmount() {
            this.isDiscover = false;
            this.dispatch({
                type: "init",
            });
        }

        getTotal() {
            const { state } = this.props,
                datas = state!.datas;

            if (
                this.isDiscover &&
                datas &&
                ((datas.Activity && datas.Activity.items.length) || (datas.News && datas.News.items.length) || (datas.Topic && datas.Topic.items.length))
            ) {
                return true;
            } else if (!this.isDiscover) {
                if (
                    datas &&
                    ((datas.Activity && datas.Activity.items.length) ||
                        (datas.AdvertisingSpace && datas.AdvertisingSpace.items.length) ||
                        (datas.App && datas.App.items.length) ||
                        (datas.CubicleRoom && datas.CubicleRoom.items.length) ||
                        (datas.MeetingRoom && datas.MeetingRoom.items.length) ||
                        (datas.News && datas.News.items.length) ||
                        (datas.Notice && datas.Notice.items.length) ||
                        (datas.Policy && datas.Policy.items.length) ||
                        (datas.ServiceInstitution && datas.ServiceInstitution.items.length) ||
                        (datas.ServiceProduct && datas.ServiceProduct.items.length) ||
                        (datas.Topic && datas.Topic.items.length) ||
                        (datas.Venue && datas.Venue.items.length))
                ) {
                    return true;
                }
            }
        }
        searchGlobal(keys) {
            setEventWithLabel(statisticsEvent.globalSearch);
            const key = keys.replace(/\s/gi, "");
            this.dispatch({ type: "getGlobalSearchDetail", data: key });
        }
        goCertify() {
            this.goTo("certify");
        }
        searchKey(router: string, moduleName = "") {
            let { state } = this.props,
                currentMember = state!.currentMember;
            if (isCertify(currentMember, moduleName, this.goCertify.bind(this))) {
                this.goTo(router);
            }
        }
        /*
    渲染搜索红色字体
    */
        replaceKey(name): React.ReactNode {
            const { state } = this.props,
                key = state!.key,
                startOf = name.indexOf(key),
                endLength = key.length,
                start = name.slice(0, startOf),
                content = name.slice(startOf, startOf + endLength),
                end = name.slice(startOf + endLength, name.length);

            if (startOf > 0) {
                return (
                    <div className="mv10" style={{ marginBottom: " 0 !important" }}>
                        {start}
                        <span className="color-red">{content}</span>
                        {end}
                    </div>
                );
            } else {
                return (
                    <div className="mv10" style={{ marginBottom: " 0 !important" }}>
                        {name}
                    </div>
                );
            }
        }
        renderAppModule(datas): React.ReactNode {
            return (
                <>
                    <WhiteSpace className="whitespace-back" />
                    {datas && datas.App && datas.App.items && datas.App.items.length > 0 ? (
                        <List
                            renderHeader={
                                <Flex>
                                    <span>应用</span>
                                    <Flex.Item></Flex.Item>
                                </Flex>
                            }
                        >
                            {datas.App.items.map((appitem, appi) => {
                                return (
                                    <List.Item
                                        key={appi}
                                        wrap
                                        thumb={<i className={appitem.coverUrl}></i>}
                                        onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(appitem.summary ? appitem.summary : ``, appitem.title))}
                                    >
                                        {this.replaceKey(appitem.title)}
                                    </List.Item>
                                );
                            })}
                        </List>
                    ) : (
                        ""
                    )}
                </>
            );
        }
        renderActivity(datas, key): React.ReactNode {
            return datas && datas.Activity && datas.Activity.items && datas.Activity.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>活动</span>
                                <Flex.Item></Flex.Item>
                                <div
                                    className="gray-three-color"
                                    onClick={() => {
                                        this.searchKey(`activity?key=${key}`);
                                        // /discover/1?key=${key}
                                    }}
                                >
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.Activity.items.map((Activityitem, acti) => {
                            return (
                                <List.Item wrap key={acti} onClick={() => this.searchKey(`activityDetail/${Activityitem.id}`)}>
                                    <div className="omit  mv10">{this.replaceKey(Activityitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={Activityitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Activityitem.summary && htmlContentTreatWord(Activityitem.summary)}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Activityitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderArticle(datas, key): React.ReactNode {
            return datas && datas.News && datas.News.items && datas.News.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>资讯</span>
                                <Flex.Item></Flex.Item>
                                <div className="gray-three-color" onClick={() => this.searchKey(`articleHome?key=${key}`)}>
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.News.items.map((Articleitem, arti) => {
                            return (
                                <List.Item wrap key={arti} onClick={() => this.searchKey(`articleDetail/${Articleitem.id}`)}>
                                    <div className="omit mv10">{this.replaceKey(Articleitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={Articleitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Articleitem.summary}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Articleitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderNotice(datas, key): React.ReactNode {
            return datas && datas.Notice && datas.Notice.items && datas.Notice.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>通知</span>
                                <Flex.Item></Flex.Item>
                                <div className="gray-three-color" onClick={() => this.searchKey(`noticelist?key=${key}`)}>
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.Notice.items.map((Articleitem, arti) => {
                            return (
                                <List.Item wrap key={arti} onClick={() => this.searchKey(`articleDetail/${Articleitem.id}`)}>
                                    <div className="omit  mv10">{this.replaceKey(Articleitem.title)}</div>
                                    <Flex>
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Articleitem.summary}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Articleitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderAppPolicy(datas, _key): React.ReactNode {
            return datas && datas.Policy && datas.Policy.items && datas.Policy.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>政策</span>
                                <Flex.Item></Flex.Item>
                                <div className="gray-three-color" onClick={() => this.searchKey(`policyservice`)}>
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.Policy.items.map((Policyitem, poi) => {
                            return (
                                <List.Item wrap key={poi} onClick={() => {
                                    // if (Policyitem.summary === IParkBindTableNameEnum.policyService)
                                    if (Policyitem.summary === IParkBindTableNameEnum.policyService) {
                                        Policyitem.id && this.goTo(`policyservicedetails/${Policyitem.id}`); // 细则
                                    } else {
                                        Policyitem.id && this.goTo(`policyserviceoriginaldetails/${Policyitem.id}`); // 原文
                                    }
                                }}>
                                    <div className="omit  mv5">{this.replaceKey(Policyitem.title)}</div>
                                    <Flex>
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Policyitem.summary}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Policyitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderCircle(datas, key): React.ReactNode {
            return datas && datas.Topic && datas.Topic.items && datas.Topic.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>话题</span>
                                <Flex.Item></Flex.Item>
                                <div className="gray-three-color" onClick={() => this.searchKey(`circlelist?key=${key}`)}>
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.Topic.items.map((Circleitem, ciri) => {
                            return (
                                <List.Item wrap key={ciri} onClick={() => this.searchKey(`circleDetail/${Circleitem.id}`)}>
                                    <div className="omit  mv10">{this.replaceKey(Circleitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={Circleitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Circleitem.summary}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Circleitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderMeetingRoom(datas, key): React.ReactNode {
            return datas && datas.MeetingRoom && datas.MeetingRoom.items && datas.MeetingRoom.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>会议室</span>
                                <Flex.Item></Flex.Item>
                                <div
                                    className="gray-three-color"
                                    onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`resource/room/${ResourceTypeEnum.meeting}?key=${key}`, "会议室预订"))}
                                >
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.MeetingRoom.items.map((MeetingRoomitem, meeti) => {
                            return (
                                <List.Item
                                    wrap
                                    key={meeti}
                                    onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`${ResourceTypeEnum.meeting}/detail/${MeetingRoomitem.id}`, "会议室预订"))}
                                >
                                    <div className="omit  mv10">{this.replaceKey(MeetingRoomitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={MeetingRoomitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={MeetingRoomitem.summary && htmlContentTreatWord(MeetingRoomitem.summary)}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(MeetingRoomitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderStation(datas, key): React.ReactNode {
            return datas && datas.CubicleRoom && datas.CubicleRoom.items && datas.CubicleRoom.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>工位</span>
                                <Flex.Item></Flex.Item>
                                <div
                                    className="gray-three-color"
                                    onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`resource/position/${ResourceTypeEnum.working}?key=${key}`, "工位预订"))}
                                >
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.CubicleRoom.items.map((Stationitem, meeti) => {
                            return (
                                <List.Item
                                    wrap
                                    key={meeti}
                                    onClick={() =>
                                        !this.isAuth() ? this.goTo("login") : this.searchKey(`postion/${ResourceTypeEnum.working}/detail/${Stationitem.id}`, "工位预订")
                                    }
                                >
                                    <div className="omit  mv10">{this.replaceKey(Stationitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={Stationitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Stationitem.summary && htmlContentTreatWord(Stationitem.summary)}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Stationitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderAdvertising(datas, key): React.ReactNode {
            return datas && datas.AdvertisingSpace && datas.AdvertisingSpace.items && datas.AdvertisingSpace.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List
                        renderHeader={
                            <Flex>
                                <span>广告位</span>
                                <Flex.Item></Flex.Item>
                                <div
                                    className="gray-three-color"
                                    onClick={() =>
                                        !this.isAuth() ? this.goTo("login") : this.searchKey(`resource/position/${ResourceTypeEnum.advertisement}?key=${key}`, "广告位预订")
                                    }
                                >
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.AdvertisingSpace.items.map((Advertisingitem, meeti) => {
                            return (
                                <List.Item
                                    wrap
                                    key={meeti}
                                    onClick={() =>
                                        !this.isAuth()
                                            ? this.goTo("login")
                                            : this.searchKey("postion/" + ResourceTypeEnum.advertisement + "/detail/" + Advertisingitem.id, "广告位预订")
                                    }
                                >
                                    <div className="omit  mv10">{this.replaceKey(Advertisingitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={Advertisingitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Advertisingitem.summary && htmlContentTreatWord(Advertisingitem.summary)}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Advertisingitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderVenue(datas, key): React.ReactNode {
            return datas && datas.Venue && datas.Venue.items && datas.Venue.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />

                    <List
                        renderHeader={
                            <Flex>
                                <span>场地</span>
                                <Flex.Item></Flex.Item>
                                <div
                                    className="gray-three-color"
                                    onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`resource/room/${ResourceTypeEnum.square}?key=${key}`, "场地预订"))}
                                >
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.Venue.items.map((Venueitem, i) => {
                            return (
                                <List.Item
                                    wrap
                                    key={i}
                                    onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`${ResourceTypeEnum.square}/detail/${Venueitem.id}`, "场地预订"))}
                                >
                                    <div className="omit  mv10">{this.replaceKey(Venueitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={Venueitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Venueitem.summary && htmlContentTreatWord(Venueitem.summary)}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Venueitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderInstitution(datas, key): React.ReactNode {
            return datas && datas.ServiceInstitution && datas.ServiceInstitution.items && datas.ServiceInstitution.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />

                    <List
                        renderHeader={
                            <Flex>
                                <span>服务机构</span>
                                <Flex.Item></Flex.Item>
                                <div className="gray-three-color" onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`market/0?key=${key}`))}>
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.ServiceInstitution.items.map((Institutionitem, i) => {
                            return (
                                <List.Item wrap key={i} onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`detail/${Institutionitem.id}/1`))}>
                                    <div className="omit  mv10">{this.replaceKey(Institutionitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={Institutionitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={Institutionitem.summary}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(Institutionitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderServiceProduct(datas, key): React.ReactNode {
            return datas && datas.ServiceProduct && datas.ServiceProduct.items && datas.ServiceProduct.items.length > 0 ? (
                <>
                    <WhiteSpace className="whitespace-back" />

                    <List
                        renderHeader={
                            <Flex>
                                <span>服务产品</span>
                                <Flex.Item></Flex.Item>
                                <div className="gray-three-color" onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`serviceProduct/0?key=${key}`))}>
                                    <span className="inline-middle">更多</span>
                                    <Icon className="inline-middle" type="right" />
                                </div>
                            </Flex>
                        }
                    >
                        {datas.ServiceProduct.items.map((ServiceProductitem, i) => {
                            return (
                                <List.Item wrap key={i} onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`productdetail/${ServiceProductitem.id}`))}>
                                    <div className="omit  mv10">{this.replaceKey(ServiceProductitem.title)}</div>
                                    <Flex>
                                        <ImageAuto.Component cutWidth="80" cutHeight="80" width="80px" height="80px" radius="4px" src={ServiceProductitem.coverUrl} />
                                        <Flex.Item>
                                            <div className="omit omit-2 size-14 gray-three-color">
                                                <HtmlContent.Component html={ServiceProductitem.summary}></HtmlContent.Component>
                                            </div>
                                            <div className="size-14 gray-three-color">{formatDateTime(ServiceProductitem.inputTime, "yyyy-MM-dd")}</div>
                                        </Flex.Item>
                                    </Flex>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderOrder(datas, key): React.ReactNode {
            return datas.HasWorkOrder || datas.HasResourceOrder ? (
                <>
                    <WhiteSpace className="whitespace-back" />
                    <List>
                        {datas.HasWorkOrder ? (
                            <List.Item wrap arrow="horizontal" onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`apply/0/0?key=${key}`))}>
                                <div className="mv10">
                                    查看<span className="color-red">{key}</span>相关申请
                                </div>
                            </List.Item>
                        ) : (
                            ""
                        )}
                        {datas.HasResourceOrder ? (
                            <List.Item wrap arrow="horizontal" onClick={() => (!this.isAuth() ? this.goTo("login") : this.searchKey(`order/0?key=${key}`))}>
                                <div className="mv10">
                                    查看<span className="color-red">{key}</span>相关订单
                                </div>
                            </List.Item>
                        ) : (
                            ""
                        )}
                    </List>
                </>
            ) : (
                ""
            );
        }
        renderTips(): React.ReactNode {
            const { state } = this.props,
                datas = state!.datas || {},
                key = state!.key;
            return (
                <>
                    {this.renderActivity(datas, key)}
                    {this.renderArticle(datas, key)}
                    {this.renderCircle(datas, key)}
                    {!this.isDiscover && (
                        <>
                            {this.renderAppModule(datas)}
                            {this.renderNotice(datas, key)}
                            {this.renderAppPolicy(datas, key)}
                            {this.renderMeetingRoom(datas, key)}
                            {this.renderStation(datas, key)}
                            {this.renderAdvertising(datas, key)}
                            {this.renderVenue(datas, key)}
                            {this.renderInstitution(datas, key)}
                            {this.renderServiceProduct(datas, key)}
                        </>
                    )}
                    <WhiteSpace className="whitespace-back" />
                </>
            );
        }
        renderHistoryMap(): React.ReactNode {
            let { state } = this.props,
                searchHistory = state!.searchHistory;

            return (
                <List
                    renderHeader={
                        <>
                            <span>搜索历史</span>
                            {searchHistory && searchHistory.length > 0 && (
                                <i className="icon icon-lajitong  size-16" style={{ float: "right" }} onClick={() => this.dispatch({ type: "removeAllSearchHistory" })} />
                            )}
                        </>
                    }
                    className="border-none"
                >
                    <List.Item wrap>
                        <div className="tag-content">
                            {searchHistory && searchHistory.length > 0 ? (
                                searchHistory.map((history, i) => {
                                    return (
                                        <Tag className="tag-type2" key={i}>
                                            <div
                                                onClick={() => {
                                                    this.dispatch({ type: "input", data: { key: history.key, searchfinish: false } });
                                                    this.searchGlobal(history.key);
                                                }}
                                            >
                                                {history.key}
                                            </div>
                                        </Tag>
                                    );
                                })
                            ) : (
                                <Container.Component className="no-data container-column container-justify-center container-align-center">
                                    <div>
                                        <ImageAuto.Component src="assets/images/no-dl.png" width="200px" height="164px" />
                                        <p className="gray-three-color" style={{ textAlign: "center" }}>
                                            请输入关键字搜索
                                        </p>
                                    </div>
                                </Container.Component>
                            )}
                        </div>
                    </List.Item>
                </List>
            );
        }
        renderHistory(): React.ReactNode {
            return <List className="border-none">{this.renderHistoryMap()!}</List>;
        }
        renderNoData(): React.ReactNode {
            const { state } = this.props,
                key = state!.key;
            return (
                <Container.Component className="no-data container-column container-justify-center container-align-center">
                    <div>
                        <ImageAuto.Component src="assets/images/no-dl.png" width="200px" height="164px" />
                        <WingBlank>
                            <p className="gray-three-color" style={{ textAlign: "center" }}>
                                亲，没有找到<span className="primary-color">“{key}”</span>内容，请换个关键词试试
                            </p>
                        </WingBlank>
                    </div>
                </Container.Component>
            );
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                key = state!.key;

            return (
                <div>
                    <SearchBar
                        maxLength={20}
                        className="autoFocus"
                        placeholder="搜索"
                        value={key !== null ? key : ""}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { key: value, searchfinish: false } });
                        }}
                        onSubmit={(value) => {
                            if (!value) {
                                return;
                            }

                            const key = value.replace(/\s/gi, "");
                            if (key) {
                                this.dispatch({ type: "input", data: { key: value, searchfinish: false } });
                            } else {
                                return;
                            }

                            this.searchGlobal(value);
                            this.dispatch({ type: "addSearchHistory", tip: 1, key: value });
                        }}
                        onCancel={() => {
                            this.dispatch({ type: "input", data: { key: "", searchfinish: false } });
                            this.searchGlobal("");
                        }}
                    />
                    <WhiteSpace />
                    {this.renderSearchBody()}
                    {this.renderLoading()}
                </div>
            );
        }

        renderSearchBody() {
            const { state } = this.props,
                searchfinish = state!.searchfinish;
            if (searchfinish) {
                if (this.getTotal()) {
                    return this.renderTips();
                } else {
                    return this.renderNoData();
                }
            } else {
                return <div className="search-display-style">{this.renderHistory()}</div>;
            }
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.search]);
}
