import React from "react";

import Modal from "react-modal";

import { transformAssetsUrl } from "@reco-m/core";

import { ViewComponent } from "@reco-m/core-ui";
export namespace PicturePreview {
    export interface IProps extends ViewComponent.IProps {
        openImg?: any;
        imgs?: any;

        changeState?(data?: any);
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
        }
        componentDidMount() { }

        setOpen() {
            const { openImg } = this.props;
            return openImg;
        }

        close() {
            const { changeState } = this.props;
            changeState && changeState({ type: "input", data: { openImg: false } });
        }

        render(): React.ReactNode {
            const { imgs } = this.props;
            const { changeState } = this.props;

            return (
                <Modal
                    ariaHideApp={false}
                    isOpen={this.setOpen()}
                    closeTimeoutMS={500}
                    onRequestClose={() => close()}
                    style={{
                        overlay: {
                            backgroundColor: "#000"
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
                            transform: "translate(-50%, -50%)"
                        }
                    }}
                >
                    <div className="swiper-container img-view" onTouchStart={(e) => e.stopPropagation()}>
                        <div className="swiper-wrapper">
                            {imgs && imgs.map((img: any, i: number) => {
                                return (
                                    <div className="swiper-slide" key={i}>
                                        <div className="swiper-zoom-container" onClick={() => changeState && changeState({ type: "input", data: { openImg: false } })}>
                                            <img src={transformAssetsUrl(img.filePath)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="swiper-pagination" />
                    </div>
                </Modal>
            );
        }
    }
}
