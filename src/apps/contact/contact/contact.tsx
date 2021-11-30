import React from "react";

import ReactDOM from "react-dom";

import { List, SearchBar, WhiteSpace, Result } from "antd-mobile-v2";

import { template } from "@reco-m/core";
import { ViewComponent, ImageAuto, Container, setEventWithLabel } from "@reco-m/core-ui";
import { statisticsEvent } from "@reco-m/ipark-statistics";

import { iparkContactModel, Namespaces } from "@reco-m/contact-models";

export namespace Contact {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, iparkContactModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        headerContent = "通讯录";
        namespace = Namespaces.contact;
        bodyClass = "container-hidden";
        componentDidMount() {
            setEventWithLabel(statisticsEvent.contact);
            this.dispatch({ type: `initPage` });
        }

        gotoChar(ch: string) {
            const elItemList = $("#item", ReactDOM.findDOMNode(this)!).get(0);
            if (elItemList)
                if (ch === "*") elItemList.scrollTop = 0;
                else if (ch === "#") elItemList.scrollTop = elItemList.scrollHeight;
                else {
                    let target = elItemList.querySelector('[data-ch="' + ch + '"]');
                    target && target.scrollIntoView();
                }
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        renderListView(): React.ReactNode {
            let { state } = this.props,
                contactList = state!.contactList;
            return (
                contactList &&
                contactList.map(
                    (items: any, i: number) =>
                        items.length > 0 && (
                            <List
                                className="contact-list"
                                key={i}
                                renderHeader={() => (<div data-ch={i < 26 ? String.fromCharCode(i + 65) : "#"}>{i < 26 ? String.fromCharCode(i + 65) : "#"}</div>) as any}
                            >
                                {items.map((item: any, o: number) => (
                                    <List.Item
                                        key={o}
                                        onClick={() => {
                                            this.goTo(`contactDetail/${item.accountId}`);
                                        }}
                                        thumb={<ImageAuto.Component cutWidth="50" cutHeight="50" radius="50%" src={item.avatar ? item.avatar : "assets/images/zwtx.png"} width="50px" height="50px" />}
                                        multipleLine
                                    >
                                        {item.realName}
                                        <List.Item.Brief className="size-14">{item.companyUserTypeName}</List.Item.Brief>
                                    </List.Item>
                                ))}
                            </List>
                        )
                )
            );
        }

        renderTips(certify: any): React.ReactNode {
            return certify.length === 0 ? (
                <Result
                    img={<i className="icon icon-beizhu color-orange" style={{ fontSize: "60px" }} />}
                    title=" 您还没认证"
                    message={
                        <span>
                            是否立即认证?
                            <a className="primary-color" onClick={() => this.goTo("certify")}>
                                前往认证
                            </a>
                        </span>
                    }
                />
            ) : certify.length > 0 && !certify.IsValid ? (
                <Result img={<i className="icon icon-beizhu color-orange" style={{ fontSize: "60px" }} />} title=" 您的认证申请还在审核中" message="请等待审核" />
            ) : (
                        null
                    );
        }

        renderTipsContent(_: any): React.ReactNode {
            return null;
        }

        renderContentView(): React.ReactNode {
            let { state } = this.props,
                certify = state!.certify || {};

            return certify.companyId ? ( // 已认证
                <div className="container-column container-fill container-scrollable">
                    {this.renderListView()}
                    <div style={{ height: "40px" }} />
                    <br />
                </div>
            ) : (
                    this.renderTipsContent(certify)
                );
        }

        renderHeader(): React.ReactNode {
            return (
                <>
                    {super.renderHeader()}
                    <SearchBar
                        placeholder="搜索"
                        onChange={value => {
                            setEventWithLabel(statisticsEvent.contactSearch);
                            this.dispatch({ type: "getSearchContact", searchContent: value });
                        }}
                    />
                    <WhiteSpace />
                </>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <Container.Component direction={"column"} id="item">
                    {this.renderContentView()}
                </Container.Component>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.contact]);
}
