import React from "react";

import { Carousel } from "antd-mobile-v2";

import { template, getLocalStorageObject } from "@reco-m/core";

import { ViewComponent, ImageAuto } from "@reco-m/core-ui";

import { homeModel, Namespaces } from "@reco-m/home-models";

export namespace HomeNewbanner {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, homeModel.StateType {
        viewRef?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.home;
        componentWillUnmount() {
            this.dispatch({ type: `input`, data: { pictures: null } });
        }
        componentDidMount(): void {
            this.dispatch({ type: `initPagebanner` });
        }
        renderCarousel(): React.ReactNode {
            const { state } = this.props,
                stopautostate = state!.stopautostate,
                pictures = state!.pictures;
            return (
                <div className="header-banner">
                    <Carousel dots autoplay={stopautostate} infinite>
                        {pictures.length > 0 &&
                            pictures.map((item: any, i: any) => <ImageAuto.Component cutWidth="414" cutHeight="233" key={i} src={item.filePath ? item.filePath : ""} />)}
                    </Carousel>
                </div>
            );
        }

        render(): React.ReactNode {
            const { state } = this.props,
                pictures = state!.pictures;
            let homecachePic = getLocalStorageObject("homecachePic");
            return pictures ? (
                pictures.length > 1 ? (
                    this.renderCarousel()
                ) : pictures.length === 1 ? (
                    <div className="header-banner">
                        <ImageAuto.Component cutWidth="414" cutHeight="233" src={pictures[0].filePath ? pictures[0].filePath : ""} />
                    </div>
                ) : (
                    <div className="header-banner">
                        <ImageAuto.Component cutWidth="414" cutHeight="233" src="" />
                    </div>
                )
            ) : !homecachePic ? (
                <div className="header-banner">
                    <ImageAuto.Component src="assets/images/image_loading.gif" />
                </div>
            ) : (
                <div className="header-banner">
                    <ImageAuto.Component cutWidth="414" cutHeight="233" src={homecachePic?.filePath ? homecachePic?.filePath : ""} />
                </div>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.home]);
}
