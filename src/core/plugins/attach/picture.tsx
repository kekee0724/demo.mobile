import { pictureService } from "../../service";

import { BaseAttach } from "./attach";

export namespace BasePicture {
    export interface IProps extends BaseAttach.IProps {}

    export interface IState extends BaseAttach.IState {}

    export abstract class Component<P extends IProps = IProps, S extends IState = IState> extends BaseAttach.Component<P, S> {
        protected getHttpService() {
            return pictureService;
        }
    }
}
