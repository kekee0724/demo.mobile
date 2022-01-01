import React, { ReactNode } from "react";
import { NavBar as AntNavBar } from "antd-mobile";
import { PureComponent } from "@reco-m/core";
import { Fab } from "./ui/fab";
import { FabButtons } from "./ui/fab.buttons";
import { FabButton } from "./ui/fab.button";

export namespace NavBar {
    export interface IProps extends PureComponent.IProps {
        back?: string | null;
        backArrow?: boolean | ReactNode;
        left?: ReactNode;
        right?: ReactNode;
        onBack?: () => void;
        visible?: Boolean;
        content?: string | ReactNode;
        fabContent?: ReactNode;
        fabContentOpen: Boolean;
    }

    export interface IState extends PureComponent.IState {
        delay: number;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: NavBar.IProps = {
            visible: client.showheader,
            fabContentOpen: true,
        } as any;
        renderFab(right) {
            if (!right) return null;

            if (!(right as any)!.props.children || !Array.isArray((right as any)!.props.children)) {
                return <Fab position="right-bottom" text={right} />;
            } else if ((right as any)!.props.children.length > 1) {
                return (
                    <Fab position="right-bottom">
                        <FabButtons position="top">
                            {(right as any)!.props.children.map((item, index) => {
                                return <FabButton key={index}>{item}</FabButton>;
                            })}
                        </FabButtons>
                    </Fab>
                );
            }
        }

        render(): React.ReactNode {
            const { visible, right, back, backArrow, left, onBack, fabContent, children, fabContentOpen } = this.props;

            if (visible) {
                return (
                    <AntNavBar left={left} right={right} onBack={onBack} backArrow={backArrow} back={back}>
                        {children}
                    </AntNavBar>
                );
            } else {
                return fabContentOpen && (fabContent || this.renderFab(right));
            }
        }
    }
}
