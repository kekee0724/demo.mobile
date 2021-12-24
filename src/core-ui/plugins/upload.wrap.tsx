import React from "react";
import { List, ProgressBar } from "antd-mobile";
import { DeleteOutline } from "antd-mobile-icons";

import { UploadrWrap } from "@reco-m/core";
import { Container, FileIcon } from "../components";

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
                    {children}
                    {this.renderItems()}
                </div>
            );
        }

        renderItems(): React.ReactNode {
            return (
                <List mode={"card"}>
                    {this.state && this.state.files && this.state.files.map(this.renderItem.bind(this))}
                    {this.renderUploadBtn()}
                </List>
            );
        }

        renderItem(file: WebUploader.File, index: number): React.ReactNode {
            const { readonly } = this.props as any;
            return (
                file && (
                    <List.Item
                        key={index}
                        className={file.isError ? "error" : ""}
                        prefix={<FileIcon text={file.ext} />}
                        extra={
                            readonly || !this.removePermission(file) ? null : (
                                <a onClick={(event) => this.removeFile(file, event)}>
                                    <DeleteOutline />
                                </a>
                            )
                        }
                        arrow={false}
                    >
                        <div className={(file as any).status === "error" ? "update-error" : ""} onClick={this.onPreview.bind(this, file)}>
                            <Container.Component direction={"row"} align={"center"}>
                                <Container.Component fill className="padding-right">
                                    {file.name}
                                </Container.Component>
                                {file.formatSize}
                            </Container.Component>
                        </div>
                        {file.percentage! > 0 ? <ProgressBar percent={file.percentage} /> : null}
                    </List.Item>
                )
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

        renderUploadBtn(): React.ReactNode {
            const { customUpload, readonly } = this.props as any;

            return customUpload || readonly ? null : <AttachUpload.Component />;
        }

        renderModal(): React.ReactNode {
            return this.renderModalBody();
        }
    }
}
