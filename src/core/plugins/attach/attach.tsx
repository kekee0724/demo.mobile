import PropTypes from "prop-types";

import { AttachPlugin } from "./base";
import { AttachDataService } from "./attach.data-service";
import { AttachUploadService } from "./attach.upload-service";

export namespace BaseAttach {
    export interface IProps extends AttachPlugin.IProps {
        multiple?: boolean;
        single?: boolean;
        readonly?: boolean | string;
        fileSingleSizeLimit?: number;
        fileSizeLimit?: number;
        fileNumLimit?: number;
        accept?: string;
        /**
         * 可以被删除的附件id数组,
         */
        removePermission?: string[];
        transformSaveData?: () => Promise<void> | void;
        uploadProgress?: (file?: WebUploader.File, percentage?: number, attachDataService?: AttachDataService) => void;
        uploadError?: (file?: WebUploader.File, attachDataService?: AttachDataService) => void;
        uploadSuccess?: (file?: WebUploader.File, data?: any, attachDataService?: AttachDataService) => void;
        uploadComplete?: (file?: WebUploader.File, attachDataService?: AttachDataService) => void;
        /**
         * 附件点击预览处理函数
         */
        openPreviewUrl?: (data?: string) => void;
        /**
         * 删除附件回掉
         */
        removeFile?: (file?: WebUploader.File, files?:any[]) => void;
    }

    export interface IState extends AttachPlugin.IState {}

    export abstract class Component<P extends IProps = IProps, S extends IState = IState> extends AttachPlugin.Base<P, S> {
        static childContextTypes = {
            getDataService: PropTypes.func,
            getUploadService: PropTypes.func,
        };

        static defaultProps = {
            classPrefix: "attach",
            multiple: true,
            fileSizeLimit: 1024 * 1024 * 80,
            fileNumLimit: 120,
            fileSingleSizeLimit: 1024 * 1024 * 12,
        } as any;

        attachUploadService: AttachUploadService;

        constructor(props: P, context: any) {
            super(props, context);

            this.createUploadService(props);
        }

        protected createUploadService(props: P) {
            const attachUploadService = (this.attachUploadService = new AttachUploadService(this.attachDataService));

            attachUploadService.onShowErrorMessage = this.onShowErrorMessage.bind(this);

            Object.keys(props).forEach((key) => {
                if (AttachUploadService.propsNames.includes(key)) {
                    attachUploadService[key] = props[key];
                }
            });

            attachUploadService.init();

            props.uploadProgress && attachUploadService.subscribeFileUploadProgress(props.uploadProgress);
            props.uploadError && attachUploadService.subscribeFileUploadError(props.uploadError);
            props.uploadSuccess && attachUploadService.subscribeFileUploadSuccess(props.uploadSuccess);
            props.uploadComplete && attachUploadService.subscribeFileUploadComplete(props.uploadComplete);
        }

        getChildContext() {
            return {
                getDataService: () => this.attachDataService,
                getUploadService: () => this.attachUploadService,
            };
        }

        isInProgress() {
            return this.attachUploadService?.isInProgress();
        }

        protected abstract onShowErrorMessage(msg: string): void;
    }
}
