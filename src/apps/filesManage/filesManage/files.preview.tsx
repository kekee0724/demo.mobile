import React from "react";

import { template, transformAssetsUrl } from "@reco-m/core";

import { ViewComponent, download, setNavTitle, previewFileC } from "@reco-m/core-ui";

import { Namespaces } from "@reco-m/files-manage-models";

export namespace FilesPreview {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState {
        previewUrl?: string;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        namespace = Namespaces.filespreview;

        componentMount() {
            setNavTitle.call(this, this.props.location!.state.title);
            let url = this.props.location!.state.url;
            this.dispatch({ type: "initPage", url })
        }
        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }
        componentReceiveProps(nextProps: Readonly<P>): void {
            setNavTitle.call(this, this.props.location!.state.title, nextProps);
        }

        renderHeaderContent(): React.ReactNode {
            return <div className="bt-box">{this.props.location!.state.title}</div>;
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                previewUrl = state!.previewUrl,
                showloading = state!.showloading;

            let url = this.props.location!.state.url;
            if (!showloading && !previewUrl) {
                return (
                    <div className="no-data">
                        {super.renderHeaderContent()}
                        <div
                            onClick={() => {
                                previewFileC(transformAssetsUrl(url), () => {
                                    download(url);
                                });
                            }}
                        >
                            <img width="50%" src="assets/images/no-dl.png" />
                            <p>
                                文件格式不支持预览，请点击<span className="defaultTextColor">下载</span>
                            </p>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="container-column container-fill iframeScroll">
                        <iframe src={previewUrl} className="iframe_full" />
                    </div>
                );
            }
        }

        renderFooter(): React.ReactNode {
            let url = this.props.location!.state.url;

            return url ? (
                <div className="schedule-footer border-top-1px">
                    <a
                        className="submit"
                        onClick={() =>
                            previewFileC(transformAssetsUrl(url), () => {
                                download(url);
                            })
                        }
                    >
                        <span>下载</span>
                    </a>
                </div>
            ) : null;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.filespreview]);
}
