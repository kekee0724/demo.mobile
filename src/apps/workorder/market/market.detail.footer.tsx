import React from "react";

import { Button, Flex } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { callTel } from "@reco-m/ipark-common"

import { FavoritesLink } from "@reco-m/favorites-common";

import { marketDetailModel, Namespaces } from "@reco-m/workorder-models";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace MarketDetailFooter {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        apply: () => void;
        detail: any;
        type?: any;
    }

    export interface IState extends ViewComponent.IState, marketDetailModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.marketDetail;

        render(): React.ReactNode {

            let { detail } = this.props,
                contactPersonalCommonVM = detail && detail.contactPersonalCommonVM,
                serviceInstitutionBasicFormVM = detail && detail.serviceInstitutionBasicFormVM;
            return (
                <footer className="ft-detail ft-detail-width">
                    <Flex className="flex-collapse white">
                        <Flex.Item className="flex-collapse-btn2 tag-ft-btn">
                            <Button
                                onClick={() => {
                                    setEventWithLabel(statisticsEvent.marketServiceConsulting);
                                    callTel(contactPersonalCommonVM && contactPersonalCommonVM.mobile);
                                }}
                                className="food-text-color zx-icon"
                            >
                                <span>咨询</span>
                            </Button>
                        </Flex.Item>
                        {client.isBiParkApp && <Flex.Item className="flex-collapse-btn2 tag-ft-btn">
                            {this.renderEmbeddedView(FavoritesLink.Page as any, {
                                bindTableName: IParkBindTableNameEnum.institution,
                                bindTableId: this.props.match!.params.id,
                                bindTableValue: serviceInstitutionBasicFormVM && serviceInstitutionBasicFormVM.institutionName,
                                favoriteSuccess: () => setEventWithLabel(statisticsEvent.marketCollectionAervice)
                            })}
                        </Flex.Item>}
                        <Flex.Item className="flex-collapse-btn3">
                            <Button
                                type={"primary"}
                                onClick={() => {
                                    setEventWithLabel(statisticsEvent.marketServiceApplication);
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

    export const Page = template(Component, state => state[Namespaces.marketDetail]);
}
