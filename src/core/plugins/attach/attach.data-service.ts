import * as WebUploader from "webuploader";

import { freeze } from "immer";
import { isAfter, parseISO } from "date-fns";

import { IDParam } from "../../http";
import { AttachService } from "../../service";
import { transformAssetsUrl } from "../../funcs";
import { getObjectProp, browser } from "../../utils";

import { IAttachInfo } from "./base";

const onlineDoc = getObjectProp(client, "plugins.attach.onlineDoc", false);

export class AttachDataService {
    static propsNames = [
        "tableId",
        "tableName",
        "customType",
        "handlePreview",
        "loadAttachFn",
        "saveAttachFn",
        "getUploadUrlFn",
        "transformLoadParams",
        "transformLoadData",
        "loadedData",
        "transformSaveData",
        "handleDownload",
        "openPreviewUrl",
        "removeFile",
        "removePermission",
    ];

    protected changeCounter = 0;

    uid: string = guid()("uploader");

    tableId: number | string;
    tableName: string;
    customType = 0;

    files: any[] = [];
    addFileIds: IDParam[] = [];
    delFileIds: IDParam[] = [];

    change = false;

    previewVisible = false;
    previewImages: any[] = [];
    previewImage: any;
    previewImageIndex: any;

    protected fileChangeQueue = new Set<(files: WebUploader.File[], isReset?: boolean) => void>();

    loadAttachFn = (params: any) => this.attachService.getList(params);
    saveAttachFn = (data: any) => this.attachService.post(data);
    getUploadUrlFn = () => this.attachService.getUploadChunkUrl(this.uid);

    transformLoadParams = (params: any) => params;
    transformLoadData = (data: any) => data;
    loadedData = (data: any) => data;
    transformSaveData = (data: any) => data;

    handleDownload = (file: any) => {
        this.attachService.downloadFile(this.uid, file.sid || file.id);
    };

    handlePreview = (file: any) => {
        if (isImage(file)) {
            this.previewImages = this.files.filter((f) => isImage(f));

            if ((this.previewVisible = !!this.previewImages.length)) {
                this.previewImage = file;
                this.previewImageIndex = this.previewImages.findIndex((f) => f === file);
            }
        } else if (onlineDoc) {
            const { previewUrl, previewUrlExpire } = file;

            if (previewUrl && (!previewUrlExpire || isAfter(parseISO(previewUrlExpire), new Date()))) this.openPreviewUrl(server.previewUrl + previewUrl);
            else {
                this.attachService.getPreviewUrl(file.sid || file.id, this.uid).then((previewUrl) => {
                    this.openPreviewUrl((file.previewUrl = previewUrl));
                });
            }
        }
    };

    openPreviewUrl = (previewUrl: string) => {
        if (browser.versions.weChatMini) {
            wx.miniProgram.navigateTo({url: "/apps-preview/apps-preview/apps-preview?path=" + previewUrl})
        } else {
            previewUrl && window.open(previewUrl);
        }
    };

    constructor(protected attachService: AttachService) {}

    subscribeFileChange(func: () => void) {
        this.fileChangeQueue.add(func);

        return () => this.fileChangeQueue.delete(func);
    }

    fileChange(isReset = false) {
        this.fileChangeQueue.forEach((func) => func(freeze([...this.files]), isReset));
    }

    removeId(file: WebUploader.File) {
        if (file?.sid) {
            this.delFileIds.add(file.sid);
            this.addFileIds.remove(file.sid);
        }

        this.change = true;
    }

    removeFile = (_file: WebUploader.File, _files: any[]) => {};

    remove(file: WebUploader.File) {
        this.removeId(file);

        this.files = this.files.filter((up) => file.id !== up.id);

        this.removeFile(file, this.files);

        this.change = true;

        this.fileChange();
    }

    addId(file: WebUploader.File) {
        if (file?.sid) {
            this.addFileIds.add(file.sid);
        }

        this.change = true;
    }

    add(file: WebUploader.File, single: boolean, func: (file: WebUploader.File) => void) {
        if (single) {
            this.files.forEach((old) => {
                func(old);

                this.removeId(old);
            });

            this.files.clear();
        }

        this.addId(file);
        this.files.add(file);

        this.change = true;

        this.fileChange();
    }

    getInfo<R = IAttachInfo>(...args: any[]): R {
        return {
            id: this.uid,
            tableId: this.tableId,
            tableName: this.tableName,
            customType: this.customType,
            files: this.files,
            args,
        } as any;
    }

    getLoadParams(id?: number | string) {
        return { bindTableName: this.tableName, bindTableId: id || this.tableId, customType: this.customType };
    }

    transformData(data: any[]) {
        data.forEach((file) => {
            file.uid = file.id;
            file.sid = file.id;
            file.name = file.fileName;
            file.status = "done";
            file.type = file.fileType;
            file.url = transformAssetsUrl(file.filePath);
            file.thumbUrl = this.getThumbUrl(file.url);
            file.formatSize = WebUploader.formatSize(file.fileSize);
            file.setStatus = () => 0;
            file.ext = file.name.substr(file.name.lastIndexOf(".") + 1);
        });
    }

    getThumbUrl(url: string) {
        return `${url}?width=120&height=120`;
    }

    loadAttach(id?: number | string) {
        return new Promise<void>((resolve, reject) => {
            const thisChangeId = ++this.changeCounter;

            Promise.resolve(this.transformLoadParams(this.getLoadParams(id))).then((params) => {
                params.bindTableId
                    ? this.loadAttachFn(params).then((data: any[]) => {
                          this.transformData(data);

                          Promise.resolve(this.transformLoadData(data)).then((files) => {
                              thisChangeId === this.changeCounter &&
                                  (this.addFileIds.clear(), this.addFileIds.clear(), this.loadedData((this.files = files)), this.fileChange(true), resolve());
                          }, reject);
                      }, reject)
                    : resolve();
            }, reject);
        });
    }

    getSaveData(id?: number | string) {
        return {
            bindTableName: this.tableName,
            bindTableId: id || this.tableId,
            customType: this.customType,
            uploadId: this.uid,
            deleteIds: [...this.delFileIds],
            addIds: [...this.addFileIds],
            fileUsage: this.getFileUsage(),
        };
    }

    getFileUsage() {
        return this.files.reduce((a, b, i) => {
            return (
                a.push({
                    attachId: b.sid || b.id,
                    sequence: b.sequence || i,
                    fileUsage: (Array.isArray(b.fileUsage) ? b.fileUsage.join(",") : b.fileUsage) || "",
                }),
                a
            );
        }, [] as any);
    }

    saveAttach(id?: number | string) {
        return new Promise<any>((resolve, reject) => {
            this.change
                ? Promise.resolve(this.transformSaveData(this.getSaveData(id)))
                      .then((data) => this.saveAttachFn(data))
                      .then((data) => (this.delFileIds.clear(), this.addFileIds.clear(), (this.change = false), resolve(data)), reject)
                : resolve(true);
        });
    }
}

function guid() {
    let counter = 0;

    return (prefix?: string) => {
        let uid = (+new Date()).toString(32),
            i = 0;

        for (; i < 5; i++) {
            uid += Math.floor(Math.random() * 65535).toString(32);
        }

        return (prefix || "wu_") + uid + (counter++).toString(32);
    };
}

function isImage(file: any) {
    return /image\//i.test(file.type || file.fileType);
}
