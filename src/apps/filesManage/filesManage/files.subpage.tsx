import React from "react";

import { SearchBar, List, Popup, Button, CheckList } from "antd-mobile";

import { template, browser } from "@reco-m/core";

import { ListComponent, Container, setNavTitle, previewFile, FooterButton, NavBar } from "@reco-m/core-ui";

import { Namespaces, fileSubPageModel, FileTypeEnum } from "@reco-m/files-manage-models";

import { FileItem } from "./files.item";
import { SearchOutline } from "antd-mobile-icons";

const ddkit = window["dd"];

export namespace FilesSubpage {
    export interface IProps<S = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, fileSubPageModel.StateType {
        isDir?: boolean;
        show?: any;
        isFile?: boolean;
        isAll?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.filessubpage;
        listMode = "card";

        componentDidMount() {
            setNavTitle.call(this, this.props.match!.params.fileName);
            let id = this.props.match!.params.id;
            this.getData(1, id, "");
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, this.props.match!.params.fileName, nextProps);
            nextProps.state && this.shouldUpdateData(nextProps.state![`${this.props.match!.params.id}`]);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                let id = this.props.match!.params.id;
                this.getData(1, id);
                locationChanged = false;
            }
        }

        getData(index?: number, status?: number, key?: any) {
            const { state } = this.props,
                isDir = state!.isDir,
                isFile = state!.isFile;
            let params = {};
            if (isDir && !isFile) {
                params = Object.assign({ fileFlag: FileTypeEnum.no }, params);
            }
            if (!isDir && isFile) {
                params = Object.assign({ fileFlag: FileTypeEnum.yes }, params);
            }
            this.dispatch({
                type: "getFilesAction",
                data: { pageIndex: index, parentId: status, name: key, ...params },
                typed: "FILE_FILE_LIST_STATE",
            });
        }

        getPageData(): S {
            return this.props.state![this.props.match!.params.id] as any;
        }

        pullToRefresh() {
            const { state } = this.props;
            let id = this.props.match!.params.id;
            this.getData(1, id, state!.key);
        }

        onEndReached() {
            const { state } = this.props;
            let id = this.props.match!.params.id;
            this.getData((state![this.props.match!.params.id].currentPage || 0) + 1, id, state!.key);
        }

        renderItemsContent(item?: any): React.ReactNode {
            return this.renderFileListView(item);
        }

        clickItem(item: any) {
            if (!item.isHasFile) {
                this.goTo(`${item.id}/${item.name}`);
            } else {
                if (item.attachList && item.attachList.length > 0) {
                    this.toggleState(item);
                } else {
                    this.goTo(`${item.id}/${item.name}`);
                }
            }
        }

        toggleState(item?: any) {
            const { state } = this.props,
                show = state!.show;
            show && show === item.id
                ? this.dispatch({
                      type: "input",
                      data: { show: null },
                  })
                : this.dispatch({ type: "input", data: { show: item.id } });
            this.pullToRefresh();
        }

        /**
         * 去预览
         */
        previewClick(item: any) {
            previewFile(this, item);
        }

        /**
         * 文件与文件夹列表
         */

        renderFileListView(item): React.ReactNode {
            const { state } = this.props,
                show = state!.show;
            return (
                <FileItem.Component
                    show={show}
                    item={item}
                    click={(itm) => this.clickItem(itm)}
                    extraClick={(itm) => this.clickItem(itm)}
                    previewClick={(itm) => this.previewClick(itm)}
                />
            );
        }

        renderHeaderContent(): React.ReactNode {
            let fileName = this.props.match!.params.fileName;
            return <>{fileName}</>;
        }

        /**
         * 跳转应用首页
         */
        goToService() {
            if (ddkit && ddkit.env.platform !== "notInDingTalk") {
                ddkit.biz.navigation.close({
                    onSuccess: function () {},
                    onFail: function () {},
                });
            } else if (browser.versions.weChatMini && browser.versions.weChat) {
                wx.miniProgram.switchTab({ url: "/pages/service/service-home/service-home" });
            } else {
                this.goTo("/service");
            }
        }

        renderHeaderRight(): React.ReactNode {
            return (
                <div>
                    <SearchOutline fontSize={18} onClick={() => this.dispatch({ type: "input", data: { open: true } })} />
                </div>
            );
        }

        renderHeader(): React.ReactNode {
            let id = this.props.match!.params.id;
            return (
                <>
                    <div className="zIndex">{super.renderHeader()}</div>
                    <List>
                        <List.Item>
                            <SearchBar
                                showCancelButton
                                placeholder="搜索文件名、文件夹名"
                                onChange={(value) => {
                                    this.dispatch({ type: "input", data: { key: value } });
                                    this.getData(1, id, value);
                                }}
                            />
                        </List.Item>
                    </List>
                </>
            );
        }

        /**
         * 重置
         */
        reset() {
            this.dispatch({
                type: "input",
                data: {
                    isAll: true,
                    isDir: false,
                    isFile: false,
                },
            });
        }

        /**
         * 点击文件夹时
         */
        clickFolder() {
            this.dispatch({
                type: "input",
                data: {
                    isDir: true,
                    isAll: false,
                    isFile: false,
                },
            });
        }

        /**
         * 点击文件时
         */
        clickFile() {
            this.dispatch({
                type: "input",
                data: {
                    isFile: true,
                    isAll: false,
                    isDir: false,
                },
            });
        }

        renderButten(): React.ReactNode {
            const { state } = this.props,
                key = state!.key!;
            return (
                <FooterButton.Component>
                    <FooterButton.Item>
                        <Button block onClick={() => this.reset()}>
                            重置
                        </Button>
                    </FooterButton.Item>
                    <FooterButton.Item>
                        <Button
                            block
                            color={"primary"}
                            onClick={() => {
                                this.dispatch({ type: "input", data: { open: false } });
                                this.getData(1, null!, key);
                                this.pullToRefresh();
                            }}
                        >
                            确定
                        </Button>
                    </FooterButton.Item>
                </FooterButton.Component>
            );
        }

        renderSideBar(): React.ReactNode {
            const { state } = this.props,
                isAll = state!.isAll,
                isDir = state!.isDir;
            return (
                <Container.Component direction={"column"} fill hidden>
                    <NavBar.Component className="oa-nav" back={null}>
                        筛选
                    </NavBar.Component>
                    <Container.Component fill scrollable>
                        <CheckList
                            value={isAll ? ["A"] : isDir ? ["B"] : ["C"]}
                            onChange={(value) => {
                                if (value.includes("A")) {
                                    this.reset();
                                } else if (value.includes("B")) {
                                    this.clickFolder();
                                } else if (value.includes("C")) {
                                    this.clickFile();
                                }
                            }}
                        >
                            <CheckList.Item value="A">全部</CheckList.Item>
                            <CheckList.Item value="B">文件夹</CheckList.Item>
                            <CheckList.Item value="C">文件</CheckList.Item>
                        </CheckList>
                    </Container.Component>
                    {this.renderButten()}
                </Container.Component>
            );
        }

        renderBody(): React.ReactNode {
            return this.getListView();
        }

        render(): React.ReactNode {
            const { state } = this.props,
                open = state!.open;
            const sidebar = this.renderSideBar();
            return (
                <>
                    <Container.Component range={"container"}>
                        {this.renderHeader()}
                        <Container.Component range={"body"}>{this.renderBody()}</Container.Component>
                    </Container.Component>
                    <div>
                        <a className="suspend-button" onClick={() => this.goToService()}>
                            <i className="iconoa icon-fanhuioa size-19" />
                        </a>
                        <a
                            className="suspend-button"
                            onClick={() => {
                                this.dispatch({ type: "input", data: { open: true } });
                            }}
                        >
                            <i className="icon icon-search01" />
                        </a>
                    </div>
                    <Popup onMaskClick={() => this.dispatch({ type: "input", data: { open: false } })} className="my-Popup" visible={open} position="right">
                        {sidebar}
                    </Popup>
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.filessubpage]);
}
