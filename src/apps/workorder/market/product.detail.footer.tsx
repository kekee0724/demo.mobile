import React from "react";

import { Button, Flex } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { FavoritesLink } from "@reco-m/favorites-common";
import { callTel } from "@reco-m/ipark-common"
import { Namespaces, productDetailModel } from "@reco-m/workorder-models";

import { statisticsEvent } from "@reco-m/ipark-statistics";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace ProductDetailFooter {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        apply: () => void;
        detail: any;
        type?: any;
    }

    export interface IState extends ViewComponent.IState, productDetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.productDetail;
        productId;

        componentDidMount(): void {
            this.productId = this.props.match!.params.productId;
        }

        render(): React.ReactNode {

            const { state } = this.props;
            let detail = state && state!.detail,
                contactPersonalCommonVM = detail!.contactPersonalCommonVM,
                serviceProductBasicFormVM = detail!.serviceProductBasicFormVM;

            return (
                <footer className="ft-detail ft-detail-width">
                    <Flex className="flex-collapse white">
                        <Flex.Item className="flex-collapse-btn2 tag-ft-btn">
                            <Button
                                onClick={() => {
                                    setEventWithLabel(statisticsEvent.productServiceConsulting);
                                    callTel(contactPersonalCommonVM && contactPersonalCommonVM!.mobile);
                                }}
                                className="food-text-color zx-icon"
                            >
                                <span>咨询</span>
                            </Button>
                        </Flex.Item>
                        {client.isBiParkApp && <Flex.Item className="flex-collapse-btn2 tag-ft-btn">
                            {this.productId &&
                                this.renderEmbeddedView(FavoritesLink.Page as any, {
                                    bindTableName: IParkBindTableNameEnum.product,
                                    bindTableId: this.productId,
                                    bindTableValue: serviceProductBasicFormVM && serviceProductBasicFormVM!.serviceName,
                                    favoriteSuccess: () => setEventWithLabel(statisticsEvent.productCollectionAervice)
                                })}
                        </Flex.Item>}
                        <Flex.Item className="flex-collapse-btn3">
                            <Button
                                type={"primary"}
                                onClick={() => {
                                    setEventWithLabel(statisticsEvent.productServiceApplication);
                                    this.props.apply();
                                }}
                            >
                                服务申请
                            </Button>
                        </Flex.Item>
                    </Flex>
                </footer>
            );
        }
    }

    export const Page = template(Component, state => state[Namespaces.productDetail]);
}
