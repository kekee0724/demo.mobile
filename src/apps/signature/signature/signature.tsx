import React from "react";

import { Button, Toast } from "antd-mobile";

import { template } from "@reco-m/core";
import { ViewComponent, setEventWithLabel, ToastInfo, ImageAuto, setNavTitle } from "@reco-m/core-ui";
import SignatureCanvas from 'react-signature-canvas';
import { statisticsEvent } from "@reco-m/statistics";
import { Namespaces, signatureModel } from "@reco-m/signature-models";
export namespace Signature {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, signatureModel.StateType { }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "手写签名";
        namespace = Namespaces.signature;
        sigCanvas;
        componentMount() {
            setNavTitle.call(this, this.headerContent)
            this.dispatch({ type: "initPage" });
        }
        componentReceiveProps(nextProps: IProps) {
            setNavTitle.call(this, this.headerContent, nextProps)
        }
        /**
         * 清除
         */
        clearSign() {
            this.sigCanvas && this.sigCanvas.clear();
            this.dispatch({ type: "input", data: { isShowImg: false } })
        }
        /**
         * 提交
         */
        handleSign() {
            if (this.sigCanvas.isEmpty()) {
                ToastInfo("请绘制签名");
                return;
            }
            this.dispatch({
                type: "saveSignature",
                data: this.sigCanvas && this.sigCanvas.toDataURL('image/png'),
                callback: () => {
                    Toast.show({
                        content: "签名上传成功",
                        afterClose: () => {
                            this.dispatch({ type: "getSignature" })
                        }
                    })
                }
            })
        };
        renderSignature(): React.ReactNode {
            return (
                <SignatureCanvas
                    penColor="#000"
                    canvasProps={{
                        width: 400,
                        height: 300,
                        className: "back-signature"
                    }}
                    ref={ref => {
                        this.sigCanvas = ref;
                    }}
                />
            )
        }
        renderImage(): React.ReactNode {
            const { state } = this.props,
                file = state!.file,
                filePath = file && file[0] && file[0].filePath
            return (
                <ImageAuto.Component height="300px" isErrText="抱歉，签名找不到了" src={filePath}/>
            )
        }
        renderBody(): React.ReactNode {
            const { state } = this.props,
                isShowImg = state!.isShowImg;
            return (
                <>
                    {isShowImg ? this.renderImage() : this.renderSignature()}
                    <div className="mybtn">
                        <Button
                            onClick={() => this.clearSign()}
                        >
                            清除
                        </Button>
                    </div>
                    {!isShowImg && <div className="mybtn">
                        <Button
                            color="primary"
                            onClick={() => {
                                setEventWithLabel(statisticsEvent.c_app_Myself_Sign_Submit);
                                this.handleSign()
                            }}
                        >
                            提交
                        </Button>
                    </div>}
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.signature]);
}
