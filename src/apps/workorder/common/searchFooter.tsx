import React from "react";

import { Flex, Button } from "antd-mobile-v2";

import { ViewComponent } from "@reco-m/core-ui";

export namespace SearchFooter {
    export interface IProps extends ViewComponent.IProps {
        reset?();
        sureSearch?();
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
        }
        render(): React.ReactNode {
            const { reset, sureSearch } = this.props;
            return (
                <Flex className="flex-collapse row-collapse">
                    <Flex.Item>
                        <Button onClick={() => reset && reset()}>重置</Button>
                    </Flex.Item>
                    <Flex.Item>
                        <Button type="primary" onClick={() => sureSearch && sureSearch()}>
                            确定
                        </Button>
                    </Flex.Item>
                </Flex>
            );
        }
    }
}
