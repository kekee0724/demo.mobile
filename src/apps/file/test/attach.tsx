import React from "react";

import { Button } from "antd-mobile";

import { template } from "@reco-m/core";
import { ViewComponent, Attach, AttachDetail } from "@reco-m/core-ui";

export namespace AttachTest {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        load() {
            this.loadAttach(2248570568704100);
        }

        renderLoading(): React.ReactNode {
            return null;
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
            return <Attach.Component  removePermission={["656364167548153856"]}  tableName="test" openPreviewUrl={(data) => {
                console.log("handlePreview", data);
                
            }} removeFile={(file, files) => {
                console.log("removeFile", file, files);
                
            }} uploadSuccess={(file) => {
                console.log("uploadSuccess", file);
            }}/>;
        }

        renderView(): React.ReactNode {
            return <AttachDetail.Component  tableName="test" openPreviewUrl={(data) => {
                console.log("handlePreview", data);
                
            }}/>;
        }

        renderBody(): React.ReactNode {
            // this.attachIsInProgress()  // 是否有附件上传中
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
