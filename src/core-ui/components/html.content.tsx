import React from "react";
import {Grid, Popup} from "antd-mobile";
import SwiperCore, { Navigation, Pagination, Zoom } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import { PureComponent, htmlInjectEncode, htmlInjectDecode, getAssetsUrl, transformAssetsUrl } from "@reco-m/core";

SwiperCore.use([Navigation, Pagination, Zoom]);

export namespace HtmlContent {
    export interface IProps extends PureComponent.IProps {
        html: any;
        component?: any;
        encode?: boolean;
    }

    export interface IState extends PureComponent.IState {
        imgs: any[];
        open: boolean;
        index: number;
    }

    export class Component<P extends HtmlContent.IProps = HtmlContent.IProps, S extends HtmlContent.IState = HtmlContent.IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            classPrefix: "html-content ck-content",
            component: "div",
            html: "",
            encode: true,
        };

        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
                imgs: [],
                open: false,
            } as any;
        }

        renderRef(e) {
            const _this = this;
            let imgs = [] as any;
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
                        imgs: imgs,
                        index: ($(this).attr("id") as any) || 0,
                    });
                })
                .find("img")
                .each((i, el) => {
                    imgs.push($(el).attr("id", i).attr("src"));
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
                    if (imgSrc && (imgSrc.startsWith("//"))) $img.attr("src", protocol + imgSrc);
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
                        ...props,
                        ref: this.renderRef.bind(this),
                        className: this.classnames(className, this.getClassSet()),
                        dangerouslySetInnerHTML: { __html: newHtml },
                    })}
                    {this.state.open ? (
                        <Popup
                            visible={this.state.open}
                        >
                            <Grid columns={0}>
                                <Grid.Item>
                                    预览 <span className="size-12 text-error">(温馨提示：双击可放大，拖动滚动条预览大图)</span>
                                </Grid.Item>
                                <a onClick={this.onCancel.bind(this)}>
                                    x
                                </a>
                            </Grid>
                            <Swiper initialSlide={this.state.index} zoom={true} keyboard={true} navigation={true} pagination={true} slidesPerView="auto">
                                {this.state.imgs &&
                                    this.state.imgs.length > 0 &&
                                    this.state.imgs.map((e, i) => {
                                        return (
                                            <SwiperSlide key={i}>
                                                <div className="reco-upload-item swiper-zoom-container">
                                                    <img src={transformAssetsUrl(e)} alt="" />
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                            </Swiper>
                        </Popup>
                    ) : null}
                </>
            );
        }
    }
}
