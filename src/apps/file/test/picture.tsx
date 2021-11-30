import React from "react";

import { Button } from "antd-mobile";

import { template } from "@reco-m/core";

import { ViewComponent, Picture, PictureDetail } from "@reco-m/core-ui";
export namespace PictureTest {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        renderLoading(): React.ReactNode {
            return null;
        }

        load() {
            this.loadAttach(2248570568704100);
        }

        getInfo() {
            console.log(this.getAttachInfo());
        }

        save() {
            this.saveAttach(2248570568704100).then(
                () => {
                    alert("成功！");
                },
                () => {
                    alert("失败！");
                }
            );
        }

        renderUpload(): React.ReactNode {
            return <Picture.Component capture="camera"  tableName="test1" fileNumLimit={6}/>;
        }

        renderView(): React.ReactNode {
            return <PictureDetail.Component tableName="test1" />;
        }

        renderBody(): React.ReactNode {
            return (
                <div>
                    {this.renderUpload()}
                    <br />
                    <br />
                    {this.renderView()}
                    <br />
                    <Button onClick={this.load.bind(this)}>加载</Button>
                    <Button onClick={this.save.bind(this)}>保存文件</Button>
                    <Button onClick={this.getInfo.bind(this)}>获取文件信息</Button>
                </div>
            );
        }
    }

    export const Page = template(Component);
}
