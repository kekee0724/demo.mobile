import React from "react";

import { ViewComponent } from "@reco-m/core-ui";

export namespace SideBarItem {
    export interface IProps extends ViewComponent.IProps {
        data?: any;
        labelName?: any;
        labelPlaceholder?: any;
        type?: any;
        isMultiselect?: boolean;
        isOpen?: boolean;
        titleName?: any;
        tagStateKey?: any;
        openKey?: any;
        itemKey?: any;
        isMustWrite?: any;
        chooseModalData?(type: any);
    }

    export interface IState extends ViewComponent.IState { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        // 物业报修，入住申请等侧边栏支持单选多选
        render(): React.ReactNode {
            const { data, labelName, labelPlaceholder, type, chooseModalData, isMultiselect, isOpen, titleName, tagStateKey, openKey, itemKey, isMustWrite } = this.props;

            return (
                <div className={!isMultiselect ? "am-list-item am-input-item am-list-item-middle" : "am-list-item am-list-item-middle"}>
                    <div className="am-list-line">
                        <div className="am-input-label am-input-label-5">
                            {labelName}
                            {isMustWrite || isMultiselect ? <span className="color-red">*</span> : ""}
                        </div>
                        {!isMultiselect ? (
                            <div
                                className="am-input-control"
                                onClick={() =>
                                    chooseModalData
                                        ? chooseModalData({
                                            type: type,
                                            isOpen: isOpen,
                                            titleName: titleName,
                                            tagStateKey: tagStateKey,
                                            openKey: openKey,
                                            itemKey: itemKey,
                                            isMultiselect: isMultiselect
                                        })
                                        : ""
                                }
                            >
                                {!data ? <div className="gray-four-color">{labelPlaceholder}</div> : data}
                            </div>
                        ) : (
                                <div className="am-input-control">
                                    <div
                                        className="gray-four-color"
                                        onClick={() =>
                                            chooseModalData
                                                ? chooseModalData({
                                                    isOpen: isOpen,
                                                    titleName: titleName,
                                                    tagStateKey: tagStateKey,
                                                    openKey: openKey,
                                                    itemKey: itemKey,
                                                    isMultiselect: isMultiselect
                                                })
                                                : ""
                                        }
                                    >
                                        {data && data.substring(0, data.length - 1) !== "" ? <div className="color-black">{data.substring(0, data.length)}</div> : labelPlaceholder}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            );
        }
    }
}
