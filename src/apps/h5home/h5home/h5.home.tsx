import React from "react";
import { template, setLocalStorage, clearLocalStorage } from "@reco-m/core";
import { ViewComponent } from "@reco-m/core-ui";
import { Namespaces, h5HomeModel, nextpathnames, addEventListeners, setInitPathname } from "@reco-m/h5home-models";

export namespace h5Home {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> { }

    export interface IState extends ViewComponent.IState, h5HomeModel.StateType {
        date?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        isRoot = true;
        showloading = true;
        headerContent = "应用";
        namespace = Namespaces.h5Home;
        /**
         * 传入的tokenStr
         */
        get tokenStr() {
            return this.getSearchParam("tokenStr")
        }
        /**
         * 传入的trefreshToken
         */
        get refreshToken() {
            return this.getSearchParam("refreshToken")
        }
        /**
         * 传入的路由
         */
       path
    
       componentDidMount() {
            addEventListeners();
            setInitPathname(this);
            clearLocalStorage()
            let paramMap = this.getSearchParams()?.paramsMap;
            for (let key of paramMap!.keys()) {
                let value =  paramMap?.get(key) && paramMap?.get(key)![0];
                value && setLocalStorage(key, decodeURI(value));
            }
            
            console.log(this.path, "this.path");
            
            this.dispatch({
                type: `initPage`, data: {
                    tokenStr: this.tokenStr,
                    refreshToken: this.refreshToken
                }, callback: () => {
                    // 初始化成功回掉
                }
            });
        }
        componentReceiveProps(nextProps: Readonly<IProps>): void {
            nextpathnames(this.props, nextProps);
        }

        renderBody(): React.ReactNode{
            return <div></div>
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.h5Home]);
}