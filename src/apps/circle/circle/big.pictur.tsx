import React from "react";

import Modal from "react-modal";

import Swiper from "swiper/swiper-bundle.js";


import {  PureComponent, transformImageUrl } from "@reco-m/core";

import { ImageAuto } from "@reco-m/core-ui";

import {synchronousSerial} from "@reco-m/ipark-common"
export namespace Bigpictur {
    export interface IProps extends PureComponent.IProps {
        src: any;
        component?: any;
        width?: any;
        height?: any;
        children?;
        staticContext?;
        classPrefix?: string;
        active?;
        selected?;
        disabled?;
        className?;
    }

    export interface IState extends PureComponent.IState {
        src: string;
        imgs: Array<string>;
        open: boolean;
    }
    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: Bigpictur.IProps = {
            classPrefix: "Bigpictur-content",
            component: "div",
            src: "",
            width: "",
            height: "",
        };
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
                src: "",
                imgs: [],
                open: false,
            } as any;
        }
        swpie;


        handleCloseModal() {
            this.setState({
                open: false,
            });
        }
        renderImages(src): React.ReactNode {
            const { width, height } = this.props;
            return src.map((item, index) => {
                return (
                    <div
                        style={{ width: "100%" }}
                        key={index}
                        onClick={() => {
                            this.setState({
                                open: true,
                                imgs: src,
                            });
                            synchronousSerial(() => {
                                this.swpie = new Swiper(".swiper-container", {
                                    initialSlide: index,
                                    zoom: true,
                                    width: window.innerWidth,
                                    height: window.innerHeight,
                                    pagination: {
                                        el: ".swiper-pagination",
                                    },
                                });
                            });
                        }}
                    >
                        {item && <ImageAuto.Component cutWidth="384" cutHeight="233" src={item} width={width as any} height={height as any} />}
                    </div>
                );
            });
        }

        renderModal(): React.ReactNode {
            return this.state.open ? (
                <Modal
                    ariaHideApp={false}
                    isOpen={this.state.open}
                    closeTimeoutMS={500}
                    onRequestClose={() => this.handleCloseModal()}
                    style={{
                        overlay: {
                            backgroundColor: "#000",
                        },
                        content: {
                            backgroundColor: "transparent",
                            border: "none",
                            overflow: "initial",
                            display: "flex",
                            alignItems: "center",
                            padding: "0",
                            top: "50%",
                            left: "50%",
                            bottom: "auto",
                            right: "auto",
                            transform: "translate(-50%, -50%)",
                        },
                    }}
                >
                    <div className="swiper-container img-view" onTouchStart={(e) => e.stopPropagation()}>
                        <div className="swiper-wrapper">
                            {this.state.imgs.map((img, i) => {
                                return (
                                    <div className="swiper-slide" key={i}>
                                        <div className="swiper-zoom-container" onClick={this.handleCloseModal.bind(this)}>
                                            <img src={transformImageUrl(img, 375, 211)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="swiper-pagination" />
                    </div>
                </Modal>
            ) : null;
        }

        render(): React.ReactNode {
            const { src, ...props } = this.props;
            delete (props as any).classPrefix;
            return src && src.length ? (
                <>
                    {this.renderImages(src)}

                    {this.renderModal()}
                </>
            ) : null;
        }
    }
}
