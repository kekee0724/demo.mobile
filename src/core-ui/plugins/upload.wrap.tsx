import React from "react";
import { List, Grid, NoticeBar, Popup } from "antd-mobile";

import { UploadrWrap } from "@reco-m/core";
import { ToastInfo } from "../utils/index";

import { AttachUpload } from "./upload";

export namespace UploadWrap {
    export interface IProps extends UploadrWrap.IProps {
        id?: string;
        customUpload?: boolean;
    }

    export interface IState extends UploadrWrap.IState {
        files: any[];
        percentage?: number;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends UploadrWrap.Base<P, S> {
        showErrorMessage(content: string): void {
            ToastInfo(content, 2000);
        }

        renderUpload(): React.ReactNode {
            const { className, readonly, children } = this.props as any;

            return (
                <div className={this.classnames(className, this.getClassSet(), readonly ? "readonly" : "")}>
                    {this.renderUploadBtn()}
                    {children}
                    {this.renderItems()}
                </div>
            );
        }

        renderItems(): React.ReactNode {
            return <List>{this.state && this.state.files && this.state.files.map(this.renderItem.bind(this))}</List>;
        }

        renderItem(file: WebUploader.File, index: number): React.ReactNode {
            return (
                <List.Item key={index} className={file.isError ? "error" : ""}>
                    {this.renderItemContent(file)}
                    {file.percentage! >= 0 ? (
                        <div className="progress">
                            <div className="progress-bar" style={{ width: file.percentage + "%" }} />
                        </div>
                    ) : null}
                </List.Item>
            );
        }
        removePermission(file) {
            const { removePermission } = this.props as any;
            if (removePermission) {
                let result = removePermission.find((item) => {
                    return +item === +file.id;
                });
                return result && result.length;
            } else {
                return true;
            }
        }
        renderItemContent(file: WebUploader.File): React.ReactNode {
            const { readonly } = this.props as any;

            return (
                <div className={(file as any).status === "error" ? "update-error" : ""} onClick={this.onPreview.bind(this, file)}>
                    <Grid columns={0} >
                        <div className="type-box">
                            <i className="icon icon-dingdan size-16" />
                            <span>{file.ext}</span>
                        </div>
                        <Grid.Item>
                            <NoticeBar icon={null} content={file.name} className="no-notice" />
                        </Grid.Item>
                        <div className="size-14">{file.formatSize}</div>
                        {readonly || !this.removePermission(file) ? null : (
                            <div className="margin-left-sm am-file-picker-item-remove" onClick={(event) => this.removeFile(file, event)}>
                                <i className="icon icon-shanchu" />
                            </div>
                        )}
                    </Grid>
                </div>
            );
        }

        renderUploadBtn(): React.ReactNode {
            const { customUpload, readonly } = this.props as any;

            return customUpload || readonly ? null : <AttachUpload.Component />;
        }

        touchStop(e) {
            $(e)
                .parents(".upload-modal")
                .on("touchstart", (e) => e.stopPropagation())
                .on("touchmove", (e) => e.stopPropagation())
                .on("touchend", (e) => e.stopPropagation());
        }
        
        renderModal(): React.ReactNode {
            return (
                <Popup
                    visible={this.attachDataService.previewVisible}
                >
                    <Grid columns={0}>
                        <Grid.Item>
                            预览 <span className="size-12 text-error">(温馨提示：双击或双指可放大缩小)</span>
                        </Grid.Item>
                        <a onClick={this.onCancel.bind(this)}>
                           x
                        </a>
                    </Grid>
                    <div className="container-fill" ref={(e) => this.touchStop(e)}>
                        {this.renderModalBody()}
                    </div>
                </Popup>
            );
        }
    }
}
