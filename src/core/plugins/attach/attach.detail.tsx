// import React from "react";
import PropTypes from "prop-types";

import { AttachPlugin } from "./base";

export namespace BaseAttachDetail {
    export interface IProps extends AttachPlugin.IProps {}

    export interface IState extends AttachPlugin.IState {}

    export abstract class Component<P extends IProps = IProps, S extends IState = IState> extends AttachPlugin.Base<P, S> {
        static childContextTypes = {
            getDataService: PropTypes.func,
        };

        getChildContext() {
            return {
                getDataService: () => this.attachDataService,
            };
        }

        // static contextTypes = {
        //     registerPlugins: PropTypes.func,
        //     removePlugins: PropTypes.func,
        //     getDataService: PropTypes.func,
        //     getUploadService: PropTypes.func,
        // };
        // static childContextTypes = {
        //     getDataService: PropTypes.func,
        // };
        // get readOnly() {
        //     return !this.attachUploadService;
        // }
        // protected attachUploadService: AttachUploadService;
        // protected unSubscribeFileChange: () => void;
        // protected unSubscribeFileUpload: () => void;
        // constructor(props: P, context: any) {
        //     super(props, context);
        //     this.initDataService(props, context);
        //     this.initUploadService(context);
        // }
        // getChildContext() {
        //     return {
        //         getDataService: () => this.attachDataService,
        //     };
        // }
        // protected initDataService(props: P, context: any) {
        //     if (context.getDataService) {
        //         this.attachDataService = context.getDataService();
        //     } else {
        //         this.createDataService(props);
        //     }
        //     this.unSubscribeFileChange = this.attachDataService.subscribeFileChange(this.fileChange.bind(this));
        // }
        // protected initUploadService(context: any) {
        //     if (context.getUploadService) {
        //         const attachUploadService: AttachUploadService = (this.attachUploadService = context.getUploadService()),
        //             unSubscribes = [
        //                 attachUploadService.subscribeFileQueued(this.onFileQueued.bind(this)),
        //                 attachUploadService.subscribeFileUploadProgress(this.onFileUploadProgress.bind(this)),
        //                 attachUploadService.subscribeFileUploadError(this.onFileUploadError.bind(this)),
        //                 attachUploadService.subscribeFileUploadSuccess(this.onFileUploadSuccess.bind(this)),
        //                 attachUploadService.subscribeFileUploadComplete(this.onFileUploadComplete.bind(this)),
        //             ];
        //         this.unSubscribeFileUpload = () => unSubscribes.forEach((func) => func());
        //     }
        // }
        // protected registerPlugin(context: any) {
        //     if (!context.getUploadService) {
        //         super.registerPlugin(context);
        //     }
        // }
        // protected removePlugin() {
        //     if (!this.context.getUploadService) {
        //         super.removePlugin();
        //     }
        // }
        // protected fileChange(files: WebUploader.File[]) {
        //     this.setState({ files });
        // }
        // protected onFileQueued(file: WebUploader.File) {
        //     file.formatSize = WebUploader.formatSize(file.size);
        // }
        // protected onFileUploadProgress(file: WebUploader.File, percentage: number) {
        //     this.setState({ percentage: (file.percentage = Math.round(percentage * 100)) });
        // }
        // protected onFileUploadError(file: WebUploader.File) {
        //     (file as any).error = true;
        // }
        // protected onFileUploadSuccess(file: WebUploader.File, data: any) {
        //     (file as any).success = true;
        //     file.url = transformAssetsUrl(data.url);
        // }
        // protected onFileUploadComplete(file: WebUploader.File) {
        //     file.percentage = 0;
        //     this.forceUpdate();
        // }
        // renderItems(): React.ReactNode {
        //     return this.state.files && this.state.files.map(this.renderItem.bind(this));
        // }
        // renderItem(file: WebUploader.File, index: number): React.ReactNode {
        //     const { itemContainer: ItemContainer, itemContainerProps } = this.props as any;
        //     return (
        //         <ItemContainer key={index} className={file.isError ? "error" : ""} {...itemContainerProps}>
        //             {this.renderItemContent(file)}
        //             {file.percentage! >= 0 ? (
        //                 <div className="progress">
        //                     <div className="progress-bar" style={{ width: file.percentage + "%" }} />
        //                 </div>
        //             ) : null}
        //         </ItemContainer>
        //     );
        // }
        // openFile(file: WebUploader.File) {
        //     this.attachDataService.handlePreview(file);
        // }
        // renderItemContent(file: WebUploader.File): React.ReactNode {
        //     return (
        //         <div className="ant-row-flex">
        //             <div className="type-box">
        //                 <i className="icon icon-dingdan size-16" />
        //                 <span>{file.ext}</span>
        //             </div>
        //             <div style={{ flex: "1" }}>
        //                 <div className="no-notice" onClick={this.openFile.bind(this, file)}>
        //                     {file.name}
        //                 </div>
        //             </div>
        //             <div>{file.formatSize}</div>
        //             <div className="margin-left-sm am-file-picker-item-remove" onClick={this.removeFile.bind(this, file)}>
        //                 <i className="icon icon-shanchu defaultTextColor" />
        //             </div>
        //         </div>
        //     );
        // }
        // removeFile(file: WebUploader.File) {
        //     this.attachDataService.remove(file);
        //     this.attachUploadService?.removeFile(file);
        // }
        // componentWillUnmount() {
        //     super.componentWillUnmount();
        //     this.unSubscribeFileChange();
        //     if (this.unSubscribeFileUpload) {
        //         this.unSubscribeFileUpload();
        //     }
        // }
        // render(): React.ReactNode {
        //     const { container: Container, containerProps } = this.props as any;
        //     return <Container {...containerProps}>{this.renderItems()}</Container>;
        // }
    }
}
