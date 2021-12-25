declare module "webuploader" {
    export = WebUploader;
}

declare namespace WebUploader {
    function create(opts?: Uploader.Options): Uploader;
    function formatSize(size: number, pointLength?: any, units?: any): string;
    function guid(prefix?: any): string;
    function isPromise(anything: any): boolean;

    type EventType =
        | "dndAccept"
        | "beforeFileQueued"
        | "fileQueued"
        | "filesQueued"
        | "fileDequeued"
        | "reset"
        | "startUpload"
        | "stopUpload"
        | "uploadFinished"
        | "uploadStart"
        | "uploadBeforeSend"
        | "uploadAccept"
        | "uploadProgress"
        | "uploadError"
        | "uploadSuccess"
        | "uploadComplete"
        | "error";

    class Mediator {
        off(name: EventType, cb: any, ctx?: any): any;

        on(name: "dndAccept", callback: (items: any) => void, context?: any): any;
        on(name: "beforeFileQueued", callback: (file: File) => void, context?: any): any;
        on(name: "fileQueued", callback: (file: File) => void, context?: any): any;
        on(name: "filesQueued", callback: (files: File[]) => void, context?: any): any;
        on(name: "fileDequeued", callback: (file: File) => void, context?: any): any;
        on(name: "reset", callback: () => void, context?: any): any;
        on(name: "startUpload", callback: () => void, context?: any): any;
        on(name: "stopUpload", callback: () => void, context?: any): any;
        on(name: "uploadFinished", callback: () => void, context?: any): any;
        on(name: "uploadStart", callback: (file: File) => void, context?: any): any;
        on(name: "uploadBeforeSend", callback: (file: File, data: any, headers: any) => void, context?: any): any;
        on(name: "uploadAccept", callback: (file: File, ret: any) => void, context?: any): any;
        on(name: "uploadProgress", callback: (file: File, percentage: number) => void, context?: any): any;
        on(name: "uploadError", callback: (file: File, reason: string) => void, context?: any): any;
        on(name: "uploadSuccess", callback: (file: File, response: any) => void, context?: any): any;
        on(name: "uploadComplete", callback: (file: File) => void, context?: any): any;
        on(name: "error", callback: (type: string) => void, context?: any): any;
        on(name: EventType, callback: any, context?: any): any;

        once(name: "dndAccept", callback: (items: any) => void, context?: any): any;
        once(name: "beforeFileQueued", callback: (file: File) => void, context?: any): any;
        once(name: "fileQueued", callback: (file: File) => void, context?: any): any;
        once(name: "filesQueued", callback: (files: File[]) => void, context?: any): any;
        once(name: "fileDequeued", callback: (file: File) => void, context?: any): any;
        once(name: "reset", callback: () => void, context?: any): any;
        once(name: "startUpload", callback: () => void, context?: any): any;
        once(name: "stopUpload", callback: () => void, context?: any): any;
        once(name: "uploadFinished", callback: () => void, context?: any): any;
        once(name: "uploadStart", callback: (file: File) => void, context?: any): any;
        once(name: "uploadBeforeSend", callback: (file: File, data: any, headers: any) => void, context?: any): any;
        once(name: "uploadAccept", callback: (file: File, ret: any) => void, context?: any): any;
        once(name: "uploadProgress", callback: (file: File, percentage: number) => void, context?: any): any;
        once(name: "uploadError", callback: (file: File, reason: string) => void, context?: any): any;
        once(name: "uploadSuccess", callback: (file: File, response: any) => void, context?: any): any;
        once(name: "uploadComplete", callback: (file: File) => void, context?: any): any;
        once(name: "error", callback: (type: string) => void, context?: any): any;
        once(name: EventType, callback: any, context?: any): any;

        trigger(type: EventType): any;
    }

    class RuntimeClient extends Mediator {
        destroy(): any;

        disable(): any;

        enable(): any;

        init(): any;

        refresh(): any;
    }

    class FilePicker extends RuntimeClient {
        constructor(opts: FilePicker.Options);
    }

    namespace FilePicker {
        interface Options {
            button?: any;
            container?: any;
            label?: any;
            innerHTML?: string;
            multiple?: boolean;
            accept?: accept;
            name?: string;
            style?: string;
            id?: any;
        }

        interface accept {
            title?: string;
            extensions?: string;
            mimeTypes?: string;
        }
    }

    class Uploader extends Mediator {
        state: string;

        constructor(opts: Uploader.Options);

        addButton(opts: FilePicker.Options): any;

        addFile(file: File): any;

        getRuid(): string;

        addFiles(file: File[]): any;

        cancelFile(file: File): any;

        destroy(): any;

        disable(): any;

        enable(): any;

        getDimension(): any;

        getFile(fileId: string): File;

        getFiles(): File[];

        getStats(): any;

        isInProgress(): boolean;

        makeThumb(file: File, callback: (error: any, ret: any) => void, width?: number, height?: number): any;

        md5File(file: File): { progress: (percentage: number) => void };

        option(key: any, val: any): any;

        predictRuntimeType(): string;

        refresh(): any;

        removeFile(file: File | string, remove?: boolean): any;

        acceptFile(file: File): boolean;

        request(apiName: any, args?: any, callback?: any): any;

        reset(): any;

        retry(): any;

        skipFile(file: File): any;

        sort(fn?: any): any;

        stop(): any;

        upload(): any;
        upload(fileId: string): any;
        upload(file: File): any;
    }

    namespace Uploader {
        function create(opts: Options): Uploader;

        interface Options {
            auto?: boolean;
            server?: string;
            swf?: string;
            accept?: FilePicker.accept;
            chunkRetry?: number;
            chunkSize?: number;
            chunked?: boolean;
            compress?: {
                allowMagnify?: boolean;
                crop?: boolean;
                height?: number;
                preserveHeaders?: boolean;
                quality?: number;
                width?: number;
                noCompressIfLarger?: boolean;
                compressSize?: number;
            };
            dnd?: string;
            method?: string;
            formData?: any;
            fileVal?: string;
            sendAsBinary?: boolean;
            fileNumLimit?: number;
            pick?: FilePicker.Options;
            prepareNextFile?: boolean;
            threads?: number;
            fileSizeLimit?: number;
            fileSingleSizeLimit?: number;
            duplicate?: boolean;
            disableWidgets?: string | string[];
            thumb?: {
                allowMagnify?: boolean;
                crop?: boolean;
                height?: number;
                preserveHeaders?: boolean;
                quality?: number;
                type?: string;
                width?: number;
            };
            runtimeOrder?: {
                orders: string;
            };
        }

        function register(responseMap: any, widgetProto: any): any;

        function support(): any;

        function unRegister(name: any): any;
    }

    class File extends Mediator {
        constructor(source: any);

        sid: string | number;

        name: string;

        size: number;

        type: string;

        lastModifiedDate: any;

        id: string;

        ext: string;

        statusText: string;

        source: any;

        loaded: boolean;

        fileUsage?: string | string[];

        Icon?: string;

        formatSize?: string;

        percentage?: number;

        url?: string;

        info: any;

        isError?: boolean;

        percent: any;

        progress: any;

        fileNode: any;

        sequence?: number;

        await?: any;

        // region other

        destroy(): any;

        getSource(): any;

        getStatus(): any;

        setStatus(status: any, text: any): any;

        // endregion other
    }
}
