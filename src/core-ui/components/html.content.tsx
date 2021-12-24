import React from "react";
import { ImageViewer } from "antd-mobile";

import { PureComponent, htmlInjectEncode, htmlInjectDecode, getAssetsUrl, transformAssetsUrl } from "@reco-m/core";

export namespace HtmlContent {
    export interface IProps extends PureComponent.IProps {
        html: any;
        component?: any;
        encode?: boolean;
        padding?: boolean;
    }

    export interface IState extends PureComponent.IState {
        images: any[];
        open: boolean;
        index: number;
    }

    export class Component<P extends HtmlContent.IProps = HtmlContent.IProps, S extends HtmlContent.IState = HtmlContent.IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            classPrefix: "",
            component: "div",
            html: "",
            encode: true,
            padding: true,
        };

        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
                images: [],
                open: false,
            } as any;
        }

        renderRef(e) {
            const _this = this;
            let images = [] as any;
            $(document).keydown((event) => {
                if (event.keyCode === 27) {
                    _this.setState({
                        open: false,
                    });
                }
            });
            $(e)
                .off(".img")
                .on("click.img", "img", function () {
                    _this.setState({
                        open: true,
                        images: images,
                        index: ($(this).attr("id") as any) || 0,
                    });
                })
                .find("img")
                .each((i, el) => {
                    images.push($(el).attr("id", i).attr("src"));
                });
        }

        onCancel() {
            this.setState({ open: false });
        }

        componentWillUnmount() {}

        render(): React.ReactNode {
            const { html, className, component, encode, ...props } = this.props as any,
                baseUrl = getAssetsUrl(),
                protocol = baseUrl.split("//")[0];

            delete (props as any).classPrefix;

            let $html = $(`<div>${html}</div>`);

            $html.find("img").each((_index, img) => {
                let $img = $(img);
                let imgSrc = $img.attr("src");
                if (imgSrc && (imgSrc.startsWith("./") || imgSrc.startsWith("~/"))) {
                    $img.attr("src", baseUrl + imgSrc.substr(1));
                } else {
                    if (imgSrc && imgSrc.startsWith("//")) $img.attr("src", protocol + imgSrc);
                }
                $(img).attr("style", "max-width: 100%");
            });

            $html.find("a").each((_index, a) => {
                let $a = $(a);
                let aHref = $a.attr("href");
                if (aHref && aHref.startsWith("./")) $a.attr("href", baseUrl + aHref.substr(1));
            });

            const newHtml = $html.html() ? $html.html() : (encode ? htmlInjectEncode : htmlInjectDecode)($html.html());

            return (
                <>
                    {React.createElement(component, {
                        ref: this.renderRef.bind(this),
                        className: this.classnames("reco-edit-view ck-content", this.props.padding && "padding", className, this.getClassSet()),
                        dangerouslySetInnerHTML: { __html: newHtml },
                    })}
                    {this.state.open ? (
                        <ImageViewer.Multi
                            images={this.state.images.map((data) => transformAssetsUrl(data)!)}
                            visible={this.state.open}
                            defaultIndex={this.state.index}
                            onClose={() => {
                                this.setState({
                                    open: false,
                                });
                            }}
                        />
                    ) : null}
                </>
            );
        }
    }
}
