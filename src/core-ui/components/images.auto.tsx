import React, { ReactNode } from "react";

import { PureComponent, transformAssetsUrl } from "@reco-m/core";

import { Image } from "antd-mobile";
import classNames from "classnames";

export namespace ImageAuto {
    export interface IProps extends PureComponent.IProps {
        src: any;
        height?: any;
        width?: any;
        cutWidth?: any;
        cutHeight?: any;
        cropWidth?: any;
        cropHeight?: any;
        style?: any;
        className?: any;
        fit?: any; // 图片填充模式 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
        onClick?: (event: React.MouseEvent<HTMLImageElement, Event>) => void; // 图片点击时间
        alt?: any; // 图片描述
        borderRadius?: any; // 图片圆角
        lazy?: boolean; // 图片是否懒加载
        onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void; // 图片错误时触发
        fallback?: ReactNode; // 错误时占位
        placeholder?: ReactNode; // 加载时占位
    }

    export interface IState extends PureComponent.IState {
        src?: string;
        hasCacheAccess?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            compress: false,
            src: "",
            fit: "cover",
            onClick: () => {},
        };

        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
                errorImage: false,
            } as any;
        }

        componentDidMount() {}

        componentWillUnmount() {
            this.setState = () => false;
        }

        // 客户列表的图片，在请求错误时要显示传过来的文字不显示错误图片
        render(): React.ReactNode {
            const {
                src: target,
                width,
                height,
                cutWidth,
                cutHeight,
                cropWidth,
                cropHeight,
                fit,
                onClick,
                alt,
                borderRadius,
                lazy,
                onError,
                style,
                className,
                children,
            } = this.props;
            let src = transformAssetsUrl((this.state && this.state.src) || target);
            if (!src) {
                src = "";
            } else if (cutWidth || cropWidth || cutHeight || cropHeight) {
                const v = 2;
                src = `${src}?`;
                cutWidth && (src = `${src}width=${cutWidth * v}&`);
                cutHeight && (src = `${src}height=${cutHeight * v}&`);
                cropWidth && (src = `${src}cropWidth=${cropWidth * v}&`);
                cropHeight && (src = `${src}cropHeight=${cropHeight * v}`);
            }
            return (
                <div className={classNames("reco-image", className)} style={{ width: width, height: height }}>
                    <Image
                        src={src}
                        lazy={lazy}
                        width="100%"
                        height={height}
                        fit={fit}
                        onClick={onClick}
                        alt={alt}
                        onError={onError}
                        style={{ ...style, borderRadius: borderRadius }}
                    />
                    {children && <div className="reco-image-shade">{children}</div>}
                </div>
            );
        }
    }
}
