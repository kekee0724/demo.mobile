import * as WebUploader from "webuploader";

import { getCurrentToken } from "../../http";
import { getObjectProp } from "../../utils";

import { AttachDataService } from "./attach.data-service";

const { fileSingleSizeLimit, fileSizeLimit, fileNumLimit } = {
    fileSingleSizeLimit: 10 * 1024 * 1024,
    fileSizeLimit: 30 * 1024 * 1024,
    ...getObjectProp(client, "plugins.attach", {}),
} as any;

export class AttachUploadService {
    static propsNames = ["multiple", "readonly", "accept", "fileSingleSizeLimit", "fileSizeLimit", "fileNumLimit"];

    protected uploader: WebUploader.Uploader;

    options: WebUploader.Uploader.Options = { fileSingleSizeLimit, fileSizeLimit, fileNumLimit };

    multiple: boolean | string = true;
    auto: boolean | string = true;
    readonly: boolean | string = true;
    files: any = {};

    set accept(value: WebUploader.FilePicker.accept) {
        this.options.accept = typeof value === "string" ? { mimeTypes: value } : value;
    }

    get mimeTypes() {
        return this.options.accept?.mimeTypes as any;
    }

    set fileSingleSizeLimit(value: number) {
        this.options.fileSingleSizeLimit = value;
    }

    get fileSingleSizeLimit() {
        return this.options.fileSingleSizeLimit! / 1024;
    }

    set fileSizeLimit(value: number) {
        this.options.fileSizeLimit = value;
    }

    set fileNumLimit(value: number) {
        this.options.fileNumLimit = value;
    }

    get fileNumLimit() {
        return this.options.fileNumLimit!;
    }

    get fileSingleSizeLimitStr() {
        return WebUploader.formatSize(this.options.fileSingleSizeLimit!);
    }

    get fileSizeLimitStr() {
        return WebUploader.formatSize(this.options.fileSizeLimit!);
    }

    get fileNumLimitStr() {
        return WebUploader.formatSize(this.options.fileNumLimit!);
    }

    protected fileQueuedQueue = new Set<(file: WebUploader.File, attachDataService: AttachDataService) => void>();
    protected fileUploadProgressQueue = new Set<(file: WebUploader.File, percentage: number, attachDataService: AttachDataService) => void>();
    protected fileUploadErrorQueue = new Set<(file: WebUploader.File, attachDataService: AttachDataService) => void>();
    protected fileUploadSuccessQueue = new Set<(file: WebUploader.File, data: any, attachDataService: AttachDataService) => void>();
    protected fileUploadCompleteQueue = new Set<(file: WebUploader.File, attachDataService: AttachDataService) => void>();

    onShowErrorMessage: (msg: string) => void;

    constructor(protected attachDataService: AttachDataService) {}

    getWebUploaderOptions(): WebUploader.Uploader.Options {
        return {
            server: this.attachDataService.getUploadUrlFn(),
            auto: !0,
            chunked: !0,
            chunkSize: 5 * 1024 * 1024,
            pick: { multiple: true },
            compress: false,
            ...this.options,
        } as any;
    }

    init() {
        this.uploader || (this.uploader = this.createWebUploader(this.getWebUploaderOptions()));
    }

    isInProgress() {
        return this.uploader && this.uploader.isInProgress();
    }

    subscribeFileQueued(func: (file: WebUploader.File, attachDataService: AttachDataService) => void) {
        this.fileQueuedQueue.add(func);

        return () => this.fileQueuedQueue.delete(func);
    }

    subscribeFileUploadProgress(func: (file: WebUploader.File, percentage: number, attachDataService: AttachDataService) => void) {
        this.fileUploadProgressQueue.add(func);

        return () => this.fileUploadProgressQueue.delete(func);
    }

    subscribeFileUploadError(func: (file: WebUploader.File, attachDataService: AttachDataService) => void) {
        this.fileUploadErrorQueue.add(func);

        return () => this.fileUploadErrorQueue.delete(func);
    }

    subscribeFileUploadSuccess(func: (file: WebUploader.File, attachDataService: AttachDataService) => void) {
        this.fileUploadSuccessQueue.add(func);

        return () => this.fileUploadSuccessQueue.delete(func);
    }

    subscribeFileUploadComplete(func: (file: WebUploader.File, attachDataService: AttachDataService) => void) {
        this.fileUploadCompleteQueue.add(func);

        return () => this.fileUploadCompleteQueue.delete(func);
    }

    createWebUploader(options?: WebUploader.Uploader.Options) {
        const uploader = WebUploader.create(options);

        uploader
            .on("uploadBeforeSend", this.onUploadBeforeSend.bind(this))
            .on("beforeFileQueued", this.onBeforeFileQueued.bind(this))
            .on("fileQueued", this.onFileQueued.bind(this))
            .on("uploadProgress", this.onUploadProgress.bind(this))
            .on("uploadAccept", (_, { errmsg }: any = {}, fn: any) => errmsg && fn(errmsg))
            .on("uploadError", this.onUploadError.bind(this))
            .on("uploadSuccess", this.onUploadSuccess.bind(this))
            .on("error", this.onError.bind(this))
            .on("uploadComplete", this.onUploadComplete.bind(this));

        return uploader;
    }

    getWebUploader(): WebUploader.Uploader {
        return this.init(), this.uploader;
    }

    onBeforeFileQueued(file: WebUploader.File) {
        const { fileNumLimit: max, fileSizeLimit: size } = this.options;

        if (max && this.attachDataService.files.length >= max) {
            (this.uploader as any).trigger("error", "Q_EXCEED_NUM_LIMIT", file, max);

            return !1;
        }

        if (size && this.attachDataService.files.reduce((a, b: any) => a + (b.size || b.FileSize || 0), file.size) > size) {
            (this.uploader as any).trigger("error", "Q_EXCEED_SIZE_LIMIT", file, max);

            return !1;
        }

        return !0;
    }

    onUploadBeforeSend(_a: any, _file: WebUploader.File, headers: any) {
        headers.Authorization = getCurrentToken();
    }

    onFileQueued(file: WebUploader.File) {
        this.attachDataService.add(file, !this.multiple, (old: any) => {
            old.setStatus && (this.uploader.cancelFile(old), this.uploader.removeFile(old));
        });

        this.fileQueuedQueue.forEach((func) => func(file, this.attachDataService));

        this.files[this.getFileId(file)] = file;
    }

    getFileId(file: WebUploader.File) {
        return file.id;
    }

    onUploadProgress(file: WebUploader.File, percentage: number) {
        this.fileUploadProgressQueue.forEach((func) => func(file, percentage, this.attachDataService));
    }

    onUploadError(file: WebUploader.File, errmsg: string) {
        this.attachDataService.remove(file);
        this.uploader.removeFile(file);

        this.fileUploadErrorQueue.forEach((func) => func(file, this.attachDataService));

        errmsg && this.onShowErrorMessage(errmsg);
    }

    onUploadSuccess(file: WebUploader.File, data: any) {
        this.attachDataService.addId(((file.sid = data.fileId), file));

        this.fileUploadSuccessQueue.forEach((func) => func(file, data, this.attachDataService));
    }

    onError(type: "F_EXCEED_SIZE" | "Q_EXCEED_NUM_LIMIT" | "Q_EXCEED_SIZE_LIMIT" | "Q_TYPE_DENIED" | "F_DUPLICATE", file: WebUploader.File) {
        let msg: string;
        switch (type) {
            case "F_EXCEED_SIZE":
                msg = `单个文件大小不允许超过 ${this.fileSingleSizeLimitStr}。`;
                break;
            case "Q_EXCEED_NUM_LIMIT":
                msg = `文件总数量不允许超过 ${this.options.fileNumLimit} 个。`;
                break;
            case "Q_EXCEED_SIZE_LIMIT":
                msg = `所有文件总大小不允许超过 ${this.fileSizeLimitStr}。`;
                break;
            case "Q_TYPE_DENIED":
                msg = `您选择了不支持的文件。`;
                break;
            case "F_DUPLICATE":
                msg = `请不要重复上传文件“${file.name}”`;
                break;
        }

        this.onShowErrorMessage(msg);

        (this.uploader as any).trigger("errorMessage", file, msg);
    }

    onUploadComplete(file: WebUploader.File) {
        this.fileUploadCompleteQueue.forEach((func) => func(file, this.attachDataService));
    }

    removeFile(file: WebUploader.File) {
        if ((file = this.files[this.getFileId(file)])) {
            this.uploader.cancelFile(file);
            this.uploader.removeFile(file);

            delete this.files[this.getFileId(file)];
        }
    }

    destroy() {
        this.uploader?.destroy();
    }
}
