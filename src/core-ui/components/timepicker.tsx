import React, { ReactNode } from "react";
import { Picker } from "antd-mobile";
import { PureComponent } from "@reco-m/core";
import { Fab } from "./ui/fab";
import { FabButtons } from "./ui/fab.buttons";
import { FabButton } from "./ui/fab.button";

declare type PickerValue = string | null;
// declare type PickerValueExtend = {
//     items: (PickerColumnItem | null)[];
// };
declare type PickerColumnItem = {
    label: string;
    value: string;
};
declare type PickerColumn = (string | PickerColumnItem)[];
export namespace TimePicker {
    export interface IProps extends PureComponent.IProps {
        visible?: boolean;
        value?: PickerValue[];
        defaultValue?: Date;
        min?: Date;
        max?: Date;

        onConfirm?: (label: PickerValue[], value: any, date: Date) => void;
        onSelect?: (label: PickerValue[], value: any, date: Date) => void;
        onCancel?: () => void;
        onClose?: () => void;
        title?: ReactNode;
        confirmText?: string;
        cancelText?: string;
        columns?: PickerColumn[] | ((value: PickerValue[]) => PickerColumn[]);
        content?: (items: PickerColumnItem[]) => ReactNode;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: TimePicker.IProps = {
            // defaultValue: new Date(),
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
            const { visible, cancelText, confirmText, title, onClose, onCancel, onSelect, onConfirm, defaultValue, value, content, min, max } = this.props;

            let hour = defaultValue?.getHours(),
                mInit = defaultValue?.getMinutes(),
                minHour = min?.getHours(),
                minMinut = min?.getMinutes(),
                maxHour = max?.getHours(),
                maxMinut = max?.getMinutes();

            let timeProps = {
                visible,
                cancelText,
                confirmText,
                title,
                onClose,
                onCancel,
                onSelect: (value: PickerValue[]) => {
                    let hour = value[0]?.split("时")[0] || 0;
                    let mInit = value[1]?.split("分")[0] || 0;

                    let data = new Date();
                    data.setHours(+hour);
                    data.setMinutes(+mInit);
                    onSelect && onSelect(value, { hour, mInit }, data);
                },
                onConfirm: (value: PickerValue[]) => {
                    let hour = value[0]?.split("时")[0] || 0;
                    let mInit = value[1]?.split("分")[0] || 0;

                    let data = new Date();
                    data.setHours(+hour);
                    data.setMinutes(+mInit);

                    onConfirm && onConfirm(value, { hour, mInit }, data);
                },
                defaultValue: hour && [`${hour}时`, `${mInit}分`],
                value,
            } as any;

            let columnsT = [[], []] as any;
            for (let i = 0; i < 24; i++) {
                if ((minHour && i < minHour) || (maxHour && i > maxHour)) {
                    continue;
                }
                columnsT[0].push(`${i}时`);
            }
            for (let j = 0; j < 60; j++) {
                if ((minMinut && j < minMinut) || (maxMinut && j > maxMinut)) {
                    continue;
                }
                columnsT[1].push(`${j}分`);
            }
        
            timeProps.columns = columnsT;

            return <Picker {...timeProps}>{content}</Picker>;
        }
    }
}
