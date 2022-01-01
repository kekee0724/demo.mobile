import React, { forwardRef, ReactNode } from "react";

import { PureComponent, transformAssetsUrl } from "@reco-m/core";

import { Image } from "antd-mobile";

import classNames from "classnames";

type ratioType = "16:9" | "4:3" | "1:1" | "2:3";

export namespace ImageAuto {
    export interface IProps extends PureComponent.IProps {
        src?: any;
        height?: any;
        width?: any;
        cutWidth?: any;
        cutHeight?: any;
        cropWidth?: any;
        cropHeight?: any;
        style?: any;
        className?: any;
        fit?: any; // 图片填充模式 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
        onClick?: (e) => void; // 图片点击时间
        alt?: any; // 图片描述
        borderRadius?: any; // 图片圆角
        lazy?: boolean; // 图片是否懒加载
        onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void; // 图片错误时触发
        fallback?: ReactNode; // 错误时占位
        placeholder?: ReactNode; // 加载时占位
        ratio?: ratioType; // 比例显示图片
    }

    export interface IState extends PureComponent.IState {
        src?: string;
        hasCacheAccess?: any;
        domMount?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            compress: false,
            src: "",
            fit: "cover",
            lazy: true,
            onClick: () => {},
        };
        class;
        dom;

        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
                errorImage: false,
            } as any;
        }

        componentDidMount() {
            this.setState({
                domMount: true,
            });
        }

        componentWillUnmount() {
            this.setState = () => false;
        }

        // 客户列表的图片，在请求错误时要显示传过来的文字不显示错误图片
        render(): React.ReactNode {
            const {
                width,
                height,
                className,
                children,
                ratio,
                src,
                fit,
                onClick,
                alt,
                borderRadius,
                lazy,
                onError,
                style,
                cutWidth,
                cutHeight,
                cropWidth,
                cropHeight,
                fallback,
                placeholder,
            } = this.props;

            switch (ratio) {
                case "16:9":
                    this.class = "long-rectangle";
                    break;
                case "4:3":
                    this.class = "rectangle";
                    break;
                case "2:3":
                    this.class = "vertical-rectangle";
                    break;
                case "1:1":
                    this.class = "square";
                    break;
                default:
                    this.class = "";
                    break;
            }

            return (
                <div className={className} style={{ width: width, height: height }}>
                    <div
                        ref={(e) => {
                            this.dom = e;
                        }}
                        className={classNames("reco-image", this.class)}
                        onClick={onClick}
                    >
                        {this.state.domMount && (
                            <Images
                                dom={this.dom}
                                src={src}
                                fit={fit}
                                alt={alt}
                                ratio={ratio}
                                borderRadius={borderRadius}
                                lazy={lazy}
                                onError={onError}
                                style={style}
                                height={height}
                                cutWidth={cutWidth}
                                cutHeight={cutHeight}
                                cropWidth={cropWidth}
                                cropHeight={cropHeight}
                                fallback={fallback}
                                placeholder={placeholder}
                            />
                        )}
                        {children && <div className="reco-image-shade">{children}</div>}
                    </div>
                </div>
            );
        }
    }
}

export const Images = forwardRef((props: any, _ref: any) => {
    const { src: target, fit, alt, borderRadius, lazy, onError, style, height, cutWidth, cutHeight, cropWidth, cropHeight, dom, ratio, fallback, placeholder } = props;

    let setWidth, setHeight;

    if (ratio) {
        setWidth = dom.clientWidth;
        setHeight = dom.clientHeight;
    }

    let src = transformAssetsUrl(target);
    if (!src) {
        src = "";
    } else if (cutWidth || cropWidth || cutHeight || cropHeight || setWidth || setHeight) {
        const v = 2;
        src = `${src}?`;
        (cutWidth || setWidth) && (src = `${src}width=${(cutWidth || setWidth) * v}&`);
        (cutHeight || setHeight) && (src = `${src}height=${(cutHeight || setHeight) * v}&`);
        cropWidth && (src = `${src}cropWidth=${cropWidth * v}&`);
        cropHeight && (src = `${src}cropHeight=${cropHeight * v}`);
    }

    return (
        <Image
            src={src}
            lazy={lazy}
            width="100%"
            height={height}
            fit={fit}
            alt={alt}
            fallback={fallback}
            placeholder={placeholder}
            onError={onError}
            style={{ ...style, borderRadius: borderRadius }}
        />
    );
});
