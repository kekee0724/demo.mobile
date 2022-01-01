import React from "react";

import AMapLoader from "@amap/amap-jsapi-loader";

import { Empty, List } from "antd-mobile";

import { QuestionCircleOutline } from "antd-mobile-icons";

import { PureComponent } from "@reco-m/core";

import { getLocation } from "../utils/common";

export namespace GDMap {
    export interface IProps extends PureComponent.IProps {
        address?: string;
        title?: string;
        mapStyle?: string;
        titleStyle?: string;
    }

    export interface IState extends PureComponent.IState {
        show?: boolean;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends PureComponent.Base<P, S> {
        static defaultProps: any = {
            address: "浦东新区纳贤路800号",
            title: "地图",
        };

        protected getInitState(_nextProps: Readonly<P>): Readonly<S> {
            return {
                show: false,
            } as any;
        }

        componentDidMount() {
            const { address } = this.props;
            AMapLoader.load({
                key: client?.mapKey ? client.mapKey : "", // 申请好的Web端开发者Key，首次调用 load 时必填
                version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
                // AMapUI: {
                //     // 是否加载 AMapUI，缺省不加载
                //     version: "1.1", // AMapUI 缺省 1.1
                //     plugins: [], // 需要加载的 AMapUI ui插件
                // },
                // Loca: {
                //     // 是否加载 Loca， 缺省不加载
                //     version: "2.0.0", // Loca 版本，缺省 1.3.2
                // },
            })
                .then(() => {
                    address && this.renderMapStyle(address!);
                })
                .catch((e) => {
                    console.log(e);
                });
        }

        renderMapStyle(address: string) {
            new AMap.plugin("AMap.Geocoder", () => {
                let geocoder = new AMap.Geocoder({ city: "全国" });
                geocoder.getLocation(address, (status: any, result: any) => {
                    if (status === "complete" && result.info === "OK") {
                        let lnglat = result.geocodes[0].location,
                            map = new AMap.Map("spaceMap", {
                                zoom: 15,
                                center: [lnglat.lng, lnglat.lat],
                            }),
                            marker = new AMap.Marker({
                                position: new AMap.LngLat(lnglat.lng, lnglat.lat),
                                title: address,
                            });

                        map.add(marker);

                        const infoWindow = new AMap.InfoWindow({
                            content: address,
                            offset: new AMap.Pixel(0, -40),
                        });
                        marker.on("click", () => {
                            infoWindow.open(map, [lnglat.lng, lnglat.lat]);
                        });
                        infoWindow.open(map, [lnglat.lng, lnglat.lat]);
                    } else {
                        getLocation().then((data: any) => {
                            if (data && data.Longitude) {
                                let lnglat = {
                                        lng: data!.Longitude,
                                        lat: data!.Latitude,
                                    },
                                    map = new AMap.Map("spaceMap", {
                                        zoom: 15,
                                        center: [lnglat.lng, lnglat.lat],
                                    }),
                                    marker = new AMap.Marker({
                                        position: new AMap.LngLat(lnglat.lng, lnglat.lat),
                                        title: address,
                                    });

                                map.add(marker);
                            }
                        });
                        this.setState({
                            show: true,
                        });
                    }
                });
            });
        }

        render(): React.ReactNode {
            const { title, mapStyle, titleStyle } = this.props;

            return (
                <List className={mapStyle} mode="card">
                    {title && <List.Item className={titleStyle}>
                        <span>{title}</span>
                    </List.Item>}
                    <List.Item>
                        {!this.state.show ? <div className="space-map" id="spaceMap" /> : null}
                        {this.state.show ? (
                            <Empty
                                style={{ padding: "64px 0" }}
                                image={
                                    <QuestionCircleOutline
                                        style={{
                                            color: "var(--adm-color-light)",
                                            fontSize: 48,
                                        }}
                                    />
                                }
                                description="未找到该地址，请确认该地址是否有误"
                            />
                        ) : null}
                    </List.Item>
                </List>
            );
        }
    }
}
