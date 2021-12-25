import React from "react";
import PropTypes from "prop-types";

import * as WebUploader from "webuploader";

import { PureComponent } from "../../container";
import { transformAssetsUrl } from "../../funcs";
import { getObjectProp } from "../../utils";

import { AttachDataService } from "./attach.data-service";
import { AttachUploadService } from "./attach.upload-service";
import { ImageViewer } from "antd-mobile";

const fileNameMaxLength = getObjectProp(client, "plugins.attach.fileNameMaxLength", 50);

export namespace UploadrWrap {
    export interface IProps extends PureComponent.IProps {
        id?: string;
        customUpload?: boolean;
        wrapClassName?: string;
    }

    export interface IState extends PureComponent.IState {
        files: any[];
        percentage?: number;
    }

    export abstract class Base<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static contextTypes = {
            getDataService: PropTypes.func,
            getUploadService: PropTypes.func,
        };

        attachDataService: AttachDataService;
        attachUploadService: AttachUploadService;

        protected unSubscribeFileChange: () => void;
        protected unSubscribeFileUpload: () => void;

        constructor(props: P, context: any) {
            super(props, context);

            this.initDataService(context);
            this.initUploadService(context);
        }

        initDataService(context: any) {
            const attachDataService: AttachDataService = (this.attachDataService = context.getDataService());

            this.state = { files: [...attachDataService.files] } as any;

            this.unSubscribeFileChange = attachDataService.subscribeFileChange(this.onFileChange.bind(this));
        }

        onFileChange(files: any[], _isReset?: boolean) {
            this.setState({ files });
        }

        initUploadService(context: any) {
            if (context.getUploadService) {
                const attachUploadService: AttachUploadService = (this.attachUploadService = context.getUploadService()),
                    unSubscribes = [
                        attachUploadService.subscribeFileQueued(this.onFileQueued.bind(this)),
                        attachUploadService.subscribeFileUploadProgress(this.onFileUploadProgress.bind(this)),
                        attachUploadService.subscribeFileUploadError(this.onFileUploadError.bind(this)),
                        attachUploadService.subscribeFileUploadSuccess(this.onFileUploadSuccess.bind(this)),
                        attachUploadService.subscribeFileUploadComplete(this.onFileUploadComplete.bind(this)),
                    ];

                this.unSubscribeFileUpload = () => unSubscribes.forEach((func) => func());
            }
        }

        onFileQueued(file: WebUploader.File) {
            file.formatSize = WebUploader.formatSize(file.size);
        }

        protected onFileUploadProgress(file: WebUploader.File, percentage: number) {
            this.setState({ percentage: (file.percentage = Math.round(percentage * 100)) });
        }

        protected onFileUploadError(file: WebUploader.File) {
            (file as any).status = file.source.source.status = "error";
        }

        protected onFileUploadSuccess(file: WebUploader.File, data: any) {
            file.url = transformAssetsUrl(data.url);

            (file as any).status = file.source.source.status = "done";
        }

        protected onFileUploadComplete(file: WebUploader.File) {
            file.percentage = 0;

            this.setState({});
        }

        beforeUpload(..._: any[]): any {
            return false;
        }

        onPreview(file: WebUploader.File) {
            this.attachDataService.handlePreview(file);

            this.setState({});
        }

        onPreview0(index: number, files: any[]) {
            this.onPreview(files[index]);
        }

        removeFile(file: any, e?: any) {
            e?.stopPropagation();

            this.attachDataService.remove(file);
            this.attachUploadService.removeFile(file);
        }

        protected checkUploadFiles(count: () => number, size: () => number): boolean {
            const { fileNumLimit, fileSizeLimit } = this.attachUploadService;

            if (fileNumLimit && count() > fileNumLimit) {
                this.showErrorMessage("文件数量超过限制！");
                return false;
            }

            if (fileSizeLimit && size() > fileSizeLimit) {
                this.showErrorMessage("文件大小超过限制！");
                return false;
            }

            return true;
        }

        protected uploadFiles(files: any[]) {
            const uploader = this.attachUploadService.getWebUploader();

            files.forEach((file) => this.uploadFile(uploader, file));
        }

        protected uploadFile(uploader: WebUploader.Uploader, file: any) {
            const fileData = this.getUploadFileData(file);

            if (fileData?.name.length > fileNameMaxLength) {
                this.showErrorMessage(`文件名不能超过${fileNameMaxLength}个字。`);
            } else if (fileData) {
                uploader.once("fileQueued", (target: WebUploader.File) => this.associateUploadFileData(file, target));

                uploader.addFile(fileData);
            }
        }

        protected getUploadFileData(file: any) {
            return file;
        }

        protected associateUploadFileData(file: any, target: any) {
            file.uid && (((file.target = target) as any).uid = file.uid);
        }

        abstract showErrorMessage(content: string): void;

        abstract renderUpload(): React.ReactNode;

        abstract renderUploadBtn(): React.ReactNode;

        onCancel() {
            this.attachDataService.previewVisible = !1;

            this.setState({});
        }

        onDownload(file: any) {
            this.attachDataService.handleDownload(file);
        }

        renderModalBody(): React.ReactNode {
            return (
                <ImageViewer.Multi
                    images={this.attachDataService.previewImages.map((data) => data.url)}
                    visible={this.attachDataService.previewVisible}
                    defaultIndex={this.attachDataService.previewImageIndex}
                    onClose={() => {
                        this.attachDataService.previewVisible = false;
                        this.forceUpdate();
                    }}
                />
            );
        }

        abstract renderModal(): React.ReactNode;

        componentWillUnmount() {
            this.unSubscribeFileChange();

            if (this.unSubscribeFileUpload) {
                this.unSubscribeFileUpload();
            }
        }

        render(): React.ReactNode {
            const { id, wrapClassName } = this.props as any;

            return (
                <div className={wrapClassName} id={id}>
                    {this.renderUpload()}
                    {this.renderModal()}
                </div>
            );
        }
    }
}
