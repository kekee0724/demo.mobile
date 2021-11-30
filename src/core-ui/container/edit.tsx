import { ViewComponent } from "./view";

export namespace EditComponent {
    export interface IProps<S = any> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState {}

    export abstract class Base<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        static defaultProps = {
            ...ViewComponent.Base.defaultProps,
            classPrefix: "edit",
        };
    }
}
