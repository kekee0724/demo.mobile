import React from "react";

import { Toast, Dialog, List, Button, Card, Space, Form, CheckList } from "antd-mobile";

import { template, isAnonymous, browser } from "@reco-m/core";
import {
    ViewComponent,
    setEventWithLabel,
    getVersionBefore,
    isGesture,
    getHotUpdateVersionBefore,
    GDMap,
    Skeletons,
    SkeletonType,
    Picture,
    TabbarContext,
    callModal,
    ImageAuto,
    Fab,
    FabButtons,
    FabButton,
    TimePicker,
    CardText,
    ListContainer,
    CardTextTag,
    RMCalendar,
    Description,
    Fold,
} from "@reco-m/core-ui";

import { Namespaces, listItems, myModel } from "@reco-m/my-models";
import { statisticsEvent } from "@reco-m/statistics";

export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

export namespace My {
    export interface IProps<S = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, myModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        isRoot = true;
        namespace = Namespaces.my;
        headerContent = "我的";

        componentMount() {
            setEventWithLabel(statisticsEvent.c_app_homepage_Myself);

            this.getSearchParam;
            this.isAuth() && this.dispatch({ type: "getHeadImageAction" });

            getHotUpdateVersionBefore();
            getVersionBefore();
            isGesture();
        }

        componentReceiveProps(nextProps: Readonly<IProps>): void {
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged) {
                this.dispatch({ type: "getHeadImageAction" });

                getHotUpdateVersionBefore();
                getVersionBefore();
                isGesture();
            }
        }

        // renderHeader(): React.ReactNode {
        //     return null;
        // }

        renderBodyItems(items): React.ReactNode {
            return (
                <List mode="card">
                    {items.map((item, i) => (
                        <List.Item
                            key={i}
                            prefix={<i className={item.icon} />}
                            onClick={() => {
                                if (item.route) {
                                    this.goTo(item.route);
                                } else {
                                    setEventWithLabel(statisticsEvent.c_app_Myself_About);
                                    this.dispatch({ type: "input", data: { confirmCleanCache: true } });
                                }
                            }}
                        >
                            {item.title}
                        </List.Item>
                    ))}
                </List>
            );
        }

        renderModelFooter() {
            return [
                {
                    key: "close",
                    text: "取消",
                    onClick: () => this.dispatch({ type: "input", data: { confirmCleanCache: false } }),
                },
                {
                    key: "confirm",
                    text: "确定",
                    onClick: async () => {
                        await sleep(1000);
                        this.dispatch({ type: "input", data: { confirmCleanCache: false } });
                        setEventWithLabel(statisticsEvent.c_app_Myself_Wipecache);
                        this.dispatch({ type: "clearCache" });
                        if (!browser.versions.android) {
                            Toast.show({
                                icon: "success",
                                content: "清除成功！",
                            });
                        }
                    },
                },
            ];
        }

        renderConfirmCleanCache(): React.ReactNode {
            const { state } = this.props,
                confirmCleanCache = state!.confirmCleanCache;

            return (
                <Dialog
                    visible={confirmCleanCache ?? false}
                    title="确定要清除缓存吗？"
                    closeOnAction
                    actions={[this.renderModelFooter()]}
                    onClose={() => {
                        this.dispatch({ type: "input", data: { confirmCleanCache: false } });
                    }}
                    getContainer={document.body}
                />
            );
        }

        renderLogout(): React.ReactNode {
            return isAnonymous() ? null : (
                <ListContainer>
                    <Button
                        block
                        color="primary"
                        onClick={() => {
                            setEventWithLabel(statisticsEvent.c_app_Myself_Logout);

                            this.dispatch({ type: "user/logout" });
                        }}
                    >
                        退出登录
                    </Button>
                </ListContainer>
            );
        }

        renderCallModal(): React.ReactNode {
            return (
                <Card>
                    <Space wrap>
                        <Button
                            color="primary"
                            onClick={() => {
                                callModal(
                                    "是否要拨打110",
                                    () => {},
                                    () => {},
                                    "操作提示",
                                    "就要打",
                                    "放弃了"
                                );
                            }}
                        >
                            安卓返回键弹出框
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.goTo("file");
                            }}
                        >
                            文件管理
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.goTo("form");
                            }}
                        >
                            form
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.goTo("/file/attach");
                            }}
                        >
                            file/attach
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.goTo("/file/picture");
                            }}
                        >
                            file/picture
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.goTo("deleteData");
                            }}
                        >
                            deleteData
                        </Button>
                    </Space>
                </Card>
            );
        }

        fileSuccess(_file, _data, _attachDataService) {
            this.dispatch({ type: "input", data: { filess: [..._attachDataService!.files] } });
        }

        renderBody(): React.ReactNode {
            let { state } = this.props,
                { timepickerVisible } = state as any;
            return (
                <>
                    {this.renderBodyItems(listItems)}
                    {this.renderLogout()}
                    {this.renderConfirmCleanCache()}
                    <br />
                    <br />
                    {this.renderCallModal()}

                    <ImageAuto.Component
                        className="margin"
                        ratio={"16:9"}
                        src={"https://fat.bitechdevelop.com/reco-ipark-10-1-mobileapi/userFile/picture/std_post/20211116/d9041e5b-9468-4338-9b92-a67bd9714b3d.jpg"}
                        borderRadius={8}
                    />

                    <Card>
                        <Picture.Component fileNumLimit={9} customType={0} tableName="std_post" uploadSuccess={this.fileSuccess.bind(this)} />
                    </Card>
                    <GDMap.Component title={"活动地图"} address={"上海纳贤路800号"} />
                    <Card>
                        <Skeletons.Component type={SkeletonType.list} count={5} />
                    </Card>
                    <Fab position="right-bottom">
                        <FabButtons position="top">
                            <FabButton fabClose label={1} onClick={() => console.log(21)}>
                                1
                            </FabButton>
                            <FabButton>2</FabButton>
                            <FabButton>3</FabButton>
                        </FabButtons>
                    </Fab>
                    <Form layout={"horizontal"} mode="card">
                        <Form.Item
                            label={"时间选择器"}
                            onClick={() => {
                                this.dispatch({ type: "input", data: { timepickerVisible: !timepickerVisible } });
                            }}
                        >
                            <TimePicker.Component
                                onConfirm={(label, value, date) => {
                                    console.log("extend", label, value, date);
                                    this.dispatch({ type: "input", data: { timepickerVisible: !timepickerVisible } });
                                }}
                                visible={timepickerVisible}
                                content={(items) => {
                                    if (items.every((item) => item === null)) {
                                        return "未选择生日";
                                    } else {
                                        return items.map((item) => item?.label ?? "未选择").join("");
                                    }
                                }}
                                onCancel={() => {
                                    this.dispatch({ type: "input", data: { timepickerVisible: false } });
                                }}
                                max={new Date()}
                            />
                        </Form.Item>
                    </Form>
                    <CardText
                        className="margin"
                        url={
                            "https://fat.bitechdevelop.com/reco-ipark-10-1-mobileapi/userFile/picture/std_article/20211019/e6c84231-5c85-4c0b-bc59-3250be0ba0ba.jpg?width=310&amp;height=174&amp;"
                        }
                        text={"蛋白质、基因组与人类疾病有了关联图 有助促进药物靶点快速识别"}
                    >
                        <CardTextTag type="in-progress">进行中</CardTextTag>
                    </CardText>
                    <RMCalendar.Component mode={"card"} type="week" defaultDate={new Date()} />
                    <CardText
                        className="margin"
                        type={"block"}
                        url={
                            "https://fat.bitechdevelop.com/reco-ipark-10-1-mobileapi/userFile/picture/std_article/20211019/e6c84231-5c85-4c0b-bc59-3250be0ba0ba.jpg?width=310&amp;height=174&amp;"
                        }
                        content={
                            <Description columns={2} title="张江科技园简称" toggle={true}>
                                <Description.Item label="园区地址">213</Description.Item>
                                <Description.Item label="园区地址">213</Description.Item>
                                <Description.Item label="联系信息" hide>
                                    213
                                </Description.Item>
                            </Description>
                        }
                    />
                    <CardText
                        direction={"row-reverse"}
                        className="margin"
                        type={"block"}
                        url={
                            "https://fat.bitechdevelop.com/reco-ipark-10-1-mobileapi/userFile/picture/std_article/20211019/e6c84231-5c85-4c0b-bc59-3250be0ba0ba.jpg?width=310&amp;height=174&amp;"
                        }
                        imageAutoProps={{ width: 100, borderRadius: 8 }}
                        ratio={"4:3"}
                        content={
                            <Description columns={2} title="张江科技园简称">
                                <Description.Item label="园区地址">213</Description.Item>
                                <Description.Item label="园区地址">213</Description.Item>
                                <Description.Item label="联系信息">213</Description.Item>
                            </Description>
                        }
                    />
                    <CardText
                        direction={"row"}
                        className="margin"
                        type={"block"}
                        url={
                            "https://fat.bitechdevelop.com/reco-ipark-10-1-mobileapi/userFile/picture/std_article/20211019/e6c84231-5c85-4c0b-bc59-3250be0ba0ba.jpg?width=310&amp;height=174&amp;"
                        }
                        imageAutoProps={{ width: 100, borderRadius: 8 }}
                        ratio={"4:3"}
                        content={
                            <Description columns={2} title="张江科技园简称">
                                <Description.Item label="园区地址">213</Description.Item>
                                <Description.Item label="园区地址">213</Description.Item>
                                <Description.Item label="联系信息">213</Description.Item>
                            </Description>
                        }
                        footer="我是底部的内容"
                    />
                    <Fold title="首页" defaultShow={true}>
                        <CheckList mode={"card"} defaultValue={["B"]}>
                            <CheckList.Item value="A">A</CheckList.Item>
                            <CheckList.Item value="B">B</CheckList.Item>
                            <CheckList.Item value="C" disabled>
                                C
                            </CheckList.Item>
                            <CheckList.Item value="D" readOnly>
                                D
                            </CheckList.Item>
                        </CheckList>
                    </Fold>
                </>
            );
        }

        renderFooter(): React.ReactNode {
            return <TabbarContext.Consumer>{(Tabbar) => <Tabbar {...this.props} type={"my"} />}</TabbarContext.Consumer>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.my]);
}
