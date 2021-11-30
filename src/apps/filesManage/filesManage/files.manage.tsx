import React from "react";

import { SearchBar, List, Button, Popup, CheckList } from "antd-mobile";

import { SearchOutline } from "antd-mobile-icons";

import { template } from "@reco-m/core";

import { ListComponent, setEventWithLabel, Container, previewFile, setNavTitle, FooterButton, NavBar } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/statistics";

import { Namespaces, fileManageModel, FileTypeEnum } from "@reco-m/files-manage-models";

import { goToCompatibleWxmini } from "@reco-m/h5home-models";

import { FileItem } from "./files.item";

export namespace FilesManage {
    export interface IProps<S = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, fileManageModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        namespace = Namespaces.filesmanage;
        listMode = "card";
        componentMount() {
            setNavTitle.call(this, "文件");
            setEventWithLabel(statisticsEvent.c_app_homepage_Application_File);
            this.getData(1, "");
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            setNavTitle.call(this, "文件", nextProps);
            this.shouldUpdateData(nextProps.state);
        }

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        getData(index?: number, key?: any) {
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
                data: { pageIndex: index, name: key, parentId: 0, pageSize: 9999, ...params },
                typed: "FILE_FILES_STATE",
            });
        }

        pullToRefresh() {
            const { state } = this.props;
            this.getData(1, state!.key);
        }

        onEndReached() {
            const { state } = this.props;
            this.getData((state!.currentPage || 0) + 1, state!.key);
        }

        renderItemsContent(item?: any): React.ReactNode {
            return this.renderFileListView(item);
        }

        clickItem(item: any) {
            if (!item.isHasFile) {
                goToCompatibleWxmini(this, () => this.goTo(`fileSubList/${item.id}/${item.name}`));
            } else {
                if (item.attachList && item.attachList.length > 0) {
                    this.toggleState(item);
                } else {
                    goToCompatibleWxmini(this, () => this.goTo(`fileSubList/${item.id}/${item.name}`));
                }
            }
        }

        toggleState(item?: any) {
            const { state } = this.props,
                show = state!.show;
            show && show === item.id
                ? this.dispatch({
                      type: "input",
                      data: { show: null, mandom: Math.random() },
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
        extraClick(item, e, show) {
            e.stopPropagation();
            show === item.id
                ? this.dispatch({ type: "input", data: { show: null } })
                : this.dispatch({
                      type: "input",
                      data: { show: item.id },
                  });
            setTimeout(() => {
                let state = this.props.state;
                this.dispatch({ type: "input", data: { ...state } });
            });
        }

        renderFileListView(item): React.ReactNode {
            const { state } = this.props,
                show = state!.show;
            return (
                <>
                    <FileItem.Component
                        show={show}
                        item={item}
                        click={(itm) => this.clickItem(itm)}
                        extraClick={(itm) => this.clickItem(itm)}
                        previewClick={(itm) => this.previewClick(itm)}
                    />
                </>
            );
        }

        renderHeader(): React.ReactNode {
            const { state } = this.props;
            return (
                <>
                    <NavBar.Component
                        onBack={() => this.goBack()}
                        right={
                            <SearchOutline
                                fontSize={18}
                                onClick={() =>
                                    this.dispatch({
                                        type: "input",
                                        data: { open: true },
                                    })
                                }
                            />
                        }
                    >
                        文件
                    </NavBar.Component>
                    <List>
                        <List.Item>
                            <SearchBar
                                showCancelButton
                                placeholder="搜索文件名、文件夹名"
                                onChange={(value) => {
                                    this.dispatch({ type: "input", data: { key: value } });
                                    this.getData(state!.pageIndex, value);
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

        renderSideBar(): React.ReactNode {
            const { state } = this.props,
                isAll = state!.isAll,
                isDir = state!.isDir;

            return (
                <Container.Component direction={"column"} fill>
                    {client.showheader && (
                        <NavBar.Component
                            className="oa-nav"
                            back={null}
                            right={<SearchOutline fontSize={18} onClick={() => this.dispatch({ type: "input", data: { open: true } })} />}
                        >
                            筛选
                        </NavBar.Component>
                    )}
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
                    {this.renderFooterButton()}
                </Container.Component>
            );
        }

        renderFooterButton(): React.ReactNode {
            const { state } = this.props,
                key = state!.key;
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
                                this.getData(1, key);
                                this.pullToRefresh();
                            }}
                        >
                            确定
                        </Button>
                    </FooterButton.Item>
                </FooterButton.Component>
            );
        }

        renderBody(): React.ReactNode {
            return (
                <Container.Component fill scrollable>
                    {this.getListView()}
                </Container.Component>
            );
        }

        render(): React.ReactNode {
            const { state } = this.props,
                open = state!.open;
            const sidebar = this.renderSideBar();
            return (
                <>
                    <Container.Component direction={"column"}>
                        {this.renderHeader()}
                        {this.renderBody()}
                        {this.renderLoading()}
                    </Container.Component>
                    <Popup onMaskClick={() => this.dispatch({ type: "input", data: { open: false } })} visible={open} position="right">
                        {sidebar}
                    </Popup>
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.filesmanage]);
}
