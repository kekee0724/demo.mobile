import React from "react";

import { List, Space } from "antd-mobile";

import { formatDate, PureComponent } from "@reco-m/core";
import { computeSize } from "@reco-m/files-manage-models";
import { RightOutline } from "antd-mobile-icons";

export namespace FileItem {
    export interface IProps extends PureComponent.IProps {
        item: any;
        show: any;
        click: (item) => void;
        extraClick: (item, e, show) => void;
        previewClick: (item) => void;
    }

    export interface IState extends PureComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        renderExtra(): React.ReactNode {
            const { extraClick, show, item } = this.props;

            return (
                <>
                    <div>{formatDate(item.inputTime)}</div>
                    {item.attachList && item.attachList.length >= 1 ? (
                        <div
                            className="text-right size-14"
                            onClick={(e) => {
                                extraClick(item, e, show);
                            }}
                        >
                            <span className="margin-right-xxs">{item.attachList.length}个附件</span>
                            <RightOutline className={show === item.id ? "rotate-90" : "rotate-0"} />
                        </div>
                    ) : null}
                </>
            );
        }

        render(): React.ReactNode {
            const { click, item } = this.props;

            return (
                <>
                    <List.Item
                        arrow={false}
                        onClick={() => {
                            click(item);
                        }}
                        prefix={<i className={`size-28 ${item.attachList && item.attachList.length ? "mobile mobile-file color-0" : "mobile mobile-folder color-1"}`} />}
                        extra={this.renderExtra()}
                        description={
                            <Space align={"center"} className="size-14">
                                <span>{item.inputer}</span>
                                {item.attachList && item.attachList.length ? <span>{computeSize(item.totalSize)}</span> : null}
                            </Space>
                        }
                    >
                        {item.name}
                    </List.Item>
                    {this.renderAttachList()}
                </>
            );
        }

        renderAttachList(): React.ReactNode {
            const { previewClick, show, item } = this.props;

            return (
                <>
                    {show === item.id
                        ? item.attachList.map((items, num) => {
                              return (
                                  <List.Item
                                      prefix={
                                          <div className="reco-file-icon">
                                              <i className="mobile mobile-blank_file" />
                                              <span className="file-icon-text">{items.fileType && items.fileType.split("/")[1].substr(0, 4)}</span>
                                          </div>
                                      }
                                      extra={computeSize(items.fileSize)}
                                      key={num}
                                      onClick={() => previewClick(items)}
                                  >
                                      {items.fileName}
                                  </List.Item>
                              );
                          })
                        : null}
                </>
            );
        }
    }
}
