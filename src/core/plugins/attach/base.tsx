import * as WebUploader from "webuploader";

import { IDParam } from "../../http";
import { attachService } from "../../service";

import { CorePlugin } from "../core.plugin";

import { AttachDataService } from "./attach.data-service";

export interface IAttachInfo {
    id: IDParam;
    tableId: IDParam;
    tableName: string;
    customType: number;
    files?: WebUploader.File[];
}

export namespace AttachPlugin {
    export interface IProps extends CorePlugin.IProps {
        tableId?: IDParam;
        tableName?: string;
        customType?: number;
        loadAttachFn?: () => Promise<void> | void;
        transformLoadParams?: () => Promise<void> | void;
        transformLoadData?: () => Promise<void> | void;
        handleDownload?: () => void;
        handlePreview?: () => void;
    }

    export interface IState extends CorePlugin.IState {
        files: any[];
    }

    export abstract class Base<P extends IProps = IProps, S extends IState = IState> extends CorePlugin.Base<P, S> {
        attachDataService: AttachDataService;

        constructor(props: P, context: any) {
            super(props, context);

            this.createDataService(props);
        }

        protected getHttpService() {
            return attachService;
        }

        protected createDataService(props: P) {
            const attachDataService = (this.attachDataService = new AttachDataService(this.getHttpService()));

            Object.keys(props).forEach((key) => {
                if (AttachDataService.propsNames.includes(key)) {
                    attachDataService[key] = props[key];
                }
            });
        }

        load(tableId?: IDParam) {
            return new Promise<void>((resolve, reject) => {
                const load = () => this.attachDataService.loadAttach(tableId).then(resolve, reject);
                this.attachDataService ? load() : setTimeout(load, 0);
            });
        }

        getInfo<R = IAttachInfo>(...args: any[]): R {
            return this.attachDataService.getInfo(...args);
        }

        save(tableId?: IDParam) {
            return this.attachDataService.saveAttach(tableId);
        }

        isInProgress(): boolean {
            return false;
        }

        abstract render(): React.ReactNode;
    }
}
