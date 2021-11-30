import React from "react";

import { Button, Toast } from "antd-mobile-v2";

import { template } from "@reco-m/core";

import { ViewComponent, shake } from "@reco-m/core-ui";

import { favoritesButtonModel, Namespaces } from "@reco-m/favorites-models";

export namespace FavoritesLink {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {
        bindTableName: any;
        bindTableId: any;
        bindTableValue?: any;
        followType?: any;
        isIcon?: any;
        favoriteSuccess?: any;
        unFavoriteSuccess?: any;
    }

    export interface IState extends ViewComponent.IState, favoritesButtonModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        namespace = Namespaces.favoritesButton;

        componentMount() {
            this.dispatch({ type: "init" });
        }

        componentDidMount() {
            const { bindTableName, bindTableId, bindTableValue } = this.props;
            this.dispatch({
                type: `initPage`,
                data: {
                    bindTableName: bindTableName,
                    bindTableId: bindTableId,
                    bindTableValue: bindTableValue,
                    success: (e) => Toast.success(e.errmsg),
                },
            });
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "input", data: { isFollow: false } });
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && this.props.location!.pathname!.length > nextProps.location!.pathname!.length) {
                this.isFollow(nextProps);
            }
        }

        // 是否收藏
        isFollow(props?: any) {
            const { bindTableName, bindTableId } = props || this.props;
            this.dispatch({
                type: `isFollow`,
                bindTableName: bindTableName,
                bindTableId: bindTableId,
                success: (e) => Toast.success(e.errmsg),
            });
        }

        /**
         * 判断是收藏还是取消收藏
         */
        selectFollowMethod(followFlag) {
            shake();
            const { bindTableName, bindTableId, bindTableValue } = this.props;
            if (!this.isAuth()) {
                this.goTo("login");
                return;
            }
            followFlag &&
                this.dispatch({
                    type: `unFollow`,
                    bindTableName: bindTableName,
                    bindTableId: bindTableId,
                    bindTableValue: bindTableValue,
                    callsuccess: (e) => {
                        Toast.success(e, 1);
                        this.props.unFavoriteSuccess && this.props.unFavoriteSuccess!();
                    },
                });
            !followFlag &&
                this.dispatch({
                    type: `followActivity`,
                    bindTableName: bindTableName,
                    bindTableId: bindTableId,
                    bindTableValue: bindTableValue,
                    callsuccess: (e) => {
                        Toast.success(e, 1);
                        this.props.favoriteSuccess!();
                    },
                });
        }

        render(): React.ReactNode {
            const { state, isIcon } = this.props,
                isFollow = state!.isFollow;
            if (!isIcon) {
                return (
                    <Button className={isFollow && isFollow === true ? "ysc-tag" : "sc-tag"} onClick={() => this.selectFollowMethod(state!.isFollow)}>
                        {isFollow && isFollow === true ? <span className="primary-color">已收藏</span> : <span className="food-text-color">收藏</span>}
                    </Button>
                );
            } else {
                return (
                    <div onClick={() => this.selectFollowMethod(state!.isFollow)}>
                        {state!.isFollow ? (
                            <>
                                <i className="icon icon-yishoucang primary-color size-18" />
                                <div className="size-10 primary-color">已收藏</div>
                            </>
                        ) : (
                            <>
                                <i className="icon icon-shoucang gray-two-color size-18" />
                                <div className="size-10 gray-three-color">收藏</div>
                            </>
                        )}
                    </div>
                );
            }
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.favoritesButton]);
}
