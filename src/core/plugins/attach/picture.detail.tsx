// import React from "react";

import { pictureService } from "../../service";

import { BaseAttachDetail } from "./attach.detail";

export namespace BasePictureDetail {
    export interface IProps extends BaseAttachDetail.IProps {}

    export interface IState extends BaseAttachDetail.IState {}

    export abstract class Component<P extends IProps = IProps, S extends IState = IState> extends BaseAttachDetail.Component<P, S> {
        protected getHttpService() {
            return pictureService;
        }
        // protected onFileQueued(file: WebUploader.File) {
        //     if (!file.url && this.attachUploadService) {
        //         this.attachUploadService.getWebUploader().makeThumb(file, (error, src) => error || file.url || ((file.url = src), this.forceUpdate()));
        //     }
        //     super.onFileQueued(file);
        // }
        // renderItemContent(file: WebUploader.File) {
        //     return <img src={transformAssetsUrl(file.url!, "assets/images/error.png")} alt={file.name} height="100" />;
        // }
    }
}
