import React from "react";

import { Button, Flex } from "antd-mobile-v2";

import { ViewComponent } from "@reco-m/core-ui";

export namespace SubmitBtn {
    export interface IProps extends ViewComponent.IProps {
        isAgree?: boolean;
        submit?();
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
            } as any;
        }
        render(): React.ReactNode {
            const { submit, isAgree } = this.props;

            return <Flex className="flex-collapse">
            <Flex.Item>
                {!isAgree ? (
                    <Button disabled>确认提交</Button>
                ) : (
                        <Button type="primary" onClick={() => submit && submit()}>
                            确认提交
                        </Button>
                    )}
            </Flex.Item>
        </Flex>;
        }
    }
}
