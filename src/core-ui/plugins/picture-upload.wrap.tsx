import React from "react";
import { ImageUploader, Toast } from "antd-mobile";

import { UploadrWrap, browser } from "@reco-m/core";

export namespace PictureUploadWrap {
    export interface IProps extends UploadrWrap.IProps {
        id?: string;
        customUpload?: boolean;
    }

    export interface IState extends UploadrWrap.IState {
        files: any[];
        percentage?: number;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends UploadrWrap.Base<P, S> {
        private files: WebUploader.File[];

        componentDidMount() {
            const {onRef} = this.props as any;
            onRef && onRef(this)
        }

        showErrorMessage(content: string): void {
            Toast.show({ icon: "fail", content });
        }

        onChange(files: any[]) {
            this.setState({ files: files.map((f) => (f.thumbnailUrl ? f : this.files.find((d: any) => f.url === d.url) ?? f)) });
        }

        beforeUpload(files: File[]) {
            const { files: already } = this.state;

            return this.checkUploadFiles(
                () => already.length + files.length,
                () => already.reduce((a, b) => a + b.size, 0) + files.reduce((a, b) => a + b.size, 0)
            )
                ? files
                : [];
        }

        upload(file: any) {
            return new Promise((resolve, reject) => {
                const uploader = this.attachUploadService.getWebUploader(),
                    getThumbUrl = this.attachDataService.getThumbUrl;

                function uploadSuccess(uploadFile: WebUploader.File) {
                    if ((uploadFile as any).source.source === file) {
                        uploader.off("uploadSuccess", uploadSuccess).off("uploadError", uploadError).off("errorMessage", errorMessage);

                        (uploadFile as any).thumbnailUrl = getThumbUrl(((uploadFile as any).rawUrl = uploadFile.url!));

                        resolve({ url: uploadFile.url });
                    }
                }

                function uploadError(uploadFile: WebUploader.File) {
                    if ((uploadFile as any).source.source === file) {
                        uploader.off("uploadSuccess", uploadSuccess).off("uploadError", uploadError).off("errorMessage", errorMessage);

                        reject(uploadFile);
                    }
                }

                function errorMessage(uploadFile: WebUploader.File, message: any) {
                    if ((uploadFile as any).source.source === file) {
                        uploader.off("uploadSuccess", uploadSuccess).off("uploadError", uploadError).off("errorMessage", errorMessage);

                        reject(message);
                    }
                }

                uploader.on("uploadSuccess", uploadSuccess).on("uploadError", uploadError).on("errorMessage", errorMessage);

                this.uploadFile(uploader, file);
            });
        }

        onFileChange(files: any[], isReset: boolean) {
            if (isReset) {
                this.setState({ files });
            }

            this.files = files;
        }
        clearFiles() {
            let {files} = this.state;

            files && files.map(item => {
                this.removeFile(item);

            })
            
            this.setState({files: []})
        }


        protected onFileUploadProgress(_file: WebUploader.File, _percentage: number) {}

        protected onFileUploadComplete(_file: WebUploader.File) {}

        onPreview0(index: number, _: any[]) {
            super.onPreview0(index, this.state.files);
        }

        renderUpload(): React.ReactNode {
            const { files } = this.state,
                { className, multiple, children, readonly, ...props } = this.props as any,
                fileNumLimit = this.attachUploadService?.fileNumLimit;
            let captureProps = {};
            if (browser.versions.weChatMini && browser.versions.android) {
                captureProps = { capture: "camera" };
            }

            return (
                <ImageUploader
                    {...props}
                    {...captureProps}
                    className={this.classnames(className, this.getClassSet(), readonly ? "readonly" : "")}
                    value={files}
                    beforeUpload={this.beforeUpload.bind(this)}
                    multiple={multiple}
                    onChange={this.onChange.bind(this)}
                    deletable={!readonly}
                    onDelete={this.removeFile.bind(this)}
                    upload={this.upload.bind(this)}
                    showUpload={!readonly && (!fileNumLimit || fileNumLimit > files.length)}
                />
            );
        }

        renderUploadBtn(): React.ReactNode {
            return null;
        }

        renderModal(): React.ReactNode {
            return null;
        }
    }
}
