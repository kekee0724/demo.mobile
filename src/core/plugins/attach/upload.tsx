import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";

import { PureComponent } from "../../container/pure-component";

import { AttachUploadService } from "./attach.upload-service";

export namespace BaseAttachUpload {
    export interface IProps extends PureComponent.IProps {
        multiple?: boolean;
        component?: any;
        accept?: WebUploader.FilePicker.accept;
        options?: WebUploader.FilePicker.Options;
        content?: any;
    }

    export interface IState extends PureComponent.IState {}

    export abstract class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static contextTypes = {
            getUploadService: PropTypes.func,
        };

        static defaultProps = {
            classPrefix: "upload",
            component: "div",
            content: "点击上传附件",
            multiple: true,
        } as any;

        isUnmount = false;

        componentDidMount() {
            const uploadService: AttachUploadService = this.context.getUploadService(),
                webUploader = uploadService.getWebUploader(),
                options = this.getOptions(uploadService);

            webUploader.addButton(options);

            setTimeout(() => {
                this.isUnmount || ($("input", findDOMNode(this)!) && $("input", findDOMNode(this)!).removeAttr("capture"))
            }, 60);
        }
        /*  */
        protected getOptions(uploadService: AttachUploadService) {
            const opts: WebUploader.Uploader.Options = uploadService.getWebUploaderOptions(),
                { multiple } = this.props as any;

            return { id: findDOMNode(this), multiple: multiple && opts.pick!.multiple };
        }

        componentWillUnmount() {
           this.isUnmount = true;
        }

        abstract renderBody(): React.ReactNode;

        render(): React.ReactNode {
            const { component: Component, className, children, content, ...props } = this.props as any;

            delete (props as any).classPrefix;

            return (
                <Component {...props} className={this.classnames(className, this.getClassSet())}>
                    {children ? children : this.renderBody()}
                </Component>
            );
        }
    }
}
