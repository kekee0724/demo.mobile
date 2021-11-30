import React from "react";

import { List, WhiteSpace, Flex, Picker, DatePicker, Toast, Icon, NavBar } from "antd-mobile-v2";

import { template, getDate, Validators } from "@reco-m/core";

import { ViewComponent, ImageAuto, Picture, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { genderTypes } from "@reco-m/auth-models";

import { accountEditModel, Namespaces, judgeInfo } from "@reco-m/ipark-auth-models";

import { IParkBindTableNameEnum, synchronousSerial } from "@reco-m/ipark-common";

import { AccountViewInterest } from "./account.interest";


export namespace AccountViewWhite {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, accountEditModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        headerContent = "个人资料";
        namespace = Namespaces.accountEdit;
        avatarAwiat: any;
        avatar: any;
        isSubmitting: any;
        mainCallback: any;
        tagHref;
        componentDidMount() {
            this.dispatch({
                type: `initPage`,
                callback: (_id) => {},
            });
            this.dispatch({ type: "input", data: { sValue: ["选项一", "选项一"] } });

            // history.pushState(null, "", location.href);
            // this.addMainListen();
        }
        // addMainListen() {
        //     this.mainCallback = () => {
        //         if (window.location.href.indexOf("edit") === -1) {
        //             if (this.tagHref) {
        //                 this.tagHref = null;
        //             } else {
        //                 this.removeMainListen();
        //                 this.submitClick();
        //             }
        //         } else {
        //             this.tagHref = window.location.href;
        //         }
        //     };
        //     window.addEventListener("popstate", this.mainCallback);
        // }
        removeMainListen() {
            window.removeEventListener("popstate", this.mainCallback);
        }
        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }
        validator() {
            const { required, composeControl, email, ValidatorControl } = Validators,
                { state } = this.props;

            return ValidatorControl(composeControl([required], { value: state!.nickName, name: "昵称" }), composeControl([email], { value: state!.email, name: "邮箱" }));
        }
        submitClick() {
            const msg = this.validator()!();
            if (msg) {
                Toast.fail(msg.join(), 1);
                return;
            }
            this.submit(true);
        }
        renderHeader(): React.ReactNode {
            return (
                <NavBar
                    className="park-nav"
                    icon={<Icon type="left" />}
                    onLeftClick={() => {
                        this.submitClick();
                    }}
                >
                    个人资料
                </NavBar>
            );
        }

        submit(isGoback?) {
            const { state } = this.props;
            const count = judgeInfo(state);
            if (this.isSubmitting) {
                return;
            }
            if (this.attachIsInProgress()) {
                Toast.fail("头像上传中,请稍后再试!", 2);
                this.isSubmitting = false;
                return;
            }

            this.isSubmitting = true;
            this.dispatch({ type: "saveTagInfo" });
            this.dispatch({
                type: "saveData",
                count,
                callback: (id) => {
                    this.saveAttach(id);
                    this.isSubmitting = false;
                    synchronousSerial(() => {
                        isGoback && this.goBack();
                    }, 1000);

                    setEventWithLabel(statisticsEvent.uploadPicture); // 修改头像
                    setEventWithLabel(statisticsEvent.modificationPersonalData); // 修改个人资料统计
                },
            });
        }
        onOpenChange = (data, _key) => {
            this.dispatch({ type: "input", data: data });
            // const datavalue = Object.values(data)[0];
            // 解决android返回
            // if (datavalue) {
            //     this.removeMainListen();
            //     const datakey = Object.keys(data)[0];
            //     const callback = () => {
            //         this.dispatch({ type: "input", data: key });
            //         this.addMainListen();
            //     };
            //     androidExit(data[datakey], callback);
            // } else {
            //     popstateHandler.removePopstateListener().then(() => {
            //         this.addMainListen();
            //     });
            // }
        };

        selectInfos(e) {
            // console.log(e);
            this.dispatch({ type: "input", data: { sValue: e } });
        }

        // 渲染头像
        renderAvatar(thumb: any, avatar: any): React.ReactNode {
            return (
                <List.Item
                    arrow="horizontal"
                    multipleLine
                    onClick={() => {}}
                    extra={
                        <div className="user-img small">
                            <div className="my-upload-box">
                                <a className="my-upload-button-white type-my">
                                    <Picture.Component
                                        fileNumLimit={1}
                                        customType={1}
                                        tableName={IParkBindTableNameEnum.sysaccount}
                                        uploadSuccess={(_file, _data, _attachDataService) => {
                                            synchronousSerial(() => {
                                                this.dispatch({
                                                    type: "input",
                                                    data: { thumb: { filePath: _data!.url } },
                                                });
                                            });
                                        }}
                                    />
                                    <ImageAuto.Component
                                        cutWidth="384"
                                        cutHeight="233"
                                        src={(thumb && thumb.filePath) || (avatar && avatar !== undefined && avatar.Image && avatar.Image) || "assets/images/myBackgroundview1.png"}
                                        width="100%"
                                        height="100%"
                                    />
                                </a>
                            </div>
                        </div>
                    }
                >
                    <Flex>
                        <div className="margin-right-xs gray-three-color label-name">头像</div>
                    </Flex>
                </List.Item>
            );
        }

        renderAnonymityName(): React.ReactNode {
            const { state } = this.props;
            return (
                <List.Item arrow="horizontal" multipleLine onClick={() => this.goTo("edit/nickName/昵称")}>
                    <Flex>
                        <div className="margin-right-xs gray-three-color label-name">昵称</div>
                        <Flex.Item className="no-omit text-right">{state!.nickName}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }
        renderRealName(): React.ReactNode {
            const { state } = this.props;
            return (
                <List.Item
                    arrow="horizontal"
                    multipleLine
                    onClick={() => {
                        if (!state!.realName) {
                            this.goTo("edit/RealNameedit/真实姓名");
                        }
                    }}
                >
                    <Flex>
                        <div className="margin-right-xs gray-three-color label-name">真实姓名</div>
                        <Flex.Item className="no-omit text-right">{state!.realName ? state!.realName : state!.RealNameedit}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }
        renderMail(): React.ReactNode {
            const { state } = this.props;
            return (
                <List.Item arrow="horizontal" onClick={() => this.goTo("edit/email/邮箱")}>
                    <Flex>
                        <div className="margin-right-xs gray-three-color label-name">邮箱</div>
                        <Flex.Item className="no-omit text-right">{state!.email}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }
        // 渲染性别
        renderGender(gender: any): React.ReactNode {
            const { state } = this.props,
                Genderbool = state!.Genderbool;
            if (gender && gender > 2) {
                gender = 2;
                this.dispatch({ type: "input", data: { gender: 2 } });
            }
            return (
                <Picker
                    cascade={false}
                    data={[genderTypes]}
                    visible={Genderbool}
                    onVisibleChange={(e) => this.onOpenChange({ Genderbool: e }, { Genderbool: false })}
                    value={gender && [gender]}
                    cols={1}
                    onChange={(value) => {
                        this.dispatch({ type: "input", data: { gender: value![0] } });
                        synchronousSerial(() => {
                            this.submit();
                        });
                    }}
                >
                    <List.Item arrow="horizontal" multipleLine>
                        <Flex>
                            <div className="margin-right-xs gray-three-color label-name">性别</div>
                        </Flex>
                    </List.Item>
                </Picker>
            );
        }
        getTagname(Xuel: any, value) {
            let name = "";
            Xuel &&
                Xuel.forEach((item) => {
                    if (item.value === value) {
                        name = item.label;
                    }
                });
            return name;
        }
        renderCountryName(): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                guoj = state!.guoj,
                CountryNamebool = state!.CountryNamebool;
            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/guoj"]]}
                        title="选择国籍"
                        cascade={false}
                        extra="请选择"
                        value={guoj && personInfoDic["ACCOUNT/guoj"] && personInfoDic["ACCOUNT/guoj"].length ? guoj.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { guoj: { name: this.getTagname(personInfoDic["ACCOUNT/guoj"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={CountryNamebool}
                        onVisibleChange={(e) => this.onOpenChange({ CountryNamebool: e }, { CountryNamebool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">国籍</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        renderNationName(): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                minz = state!.minz,
                NationNamebool = state!.NationNamebool;

            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/minz"]]}
                        title="选择民族"
                        cascade={false}
                        extra="请选择"
                        value={minz && personInfoDic["ACCOUNT/minz"] && personInfoDic["ACCOUNT/minz"].length ? minz.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { minz: { name: this.getTagname(personInfoDic["ACCOUNT/minz"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={NationNamebool}
                        onVisibleChange={(e) => this.onOpenChange({ NationNamebool: e }, { NationNamebool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">民族</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        renderHunyin(): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                huny = state!.huny,
                Hunyinbool = state!.Hunyinbool;

            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/huny"]]}
                        title="选择婚姻状况"
                        cascade={false}
                        extra="请选择"
                        value={huny && personInfoDic["ACCOUNT/huny"] && personInfoDic["ACCOUNT/huny"].length ? huny.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { huny: { name: this.getTagname(personInfoDic["ACCOUNT/huny"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={Hunyinbool}
                        onVisibleChange={(e) => this.onOpenChange({ Hunyinbool: e }, { Hunyinbool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">婚姻状况</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        // 渲染生日
        renderBirthday(birthday: any): React.ReactNode {
            const { state } = this.props,
                Birthdaybool = state!.Birthdaybool;
            return (
                <div className="extra-none">
                    <DatePicker
                        mode="date"
                        extra="请选择"
                        format= "YYYY-MM-DD"
                        maxDate={new Date()}
                        minDate={new Date(1900, 0, 1)}
                        value={getDate(birthday)}
                        onChange={(date) => {
                            this.dispatch({ type: "input", data: { birthday: date } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={Birthdaybool}
                        onVisibleChange={(e) => this.onOpenChange({ Birthdaybool: e }, { Birthdaybool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine onClick={() => {}}>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">生日</div>
                            </Flex>
                        </List.Item>
                    </DatePicker>
                </div>
            );
        }
        renderZhengzmm(zhengzmm: any): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                zhengzmmbool = state!.zhengzmmbool;
            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/zhengzmm"]]}
                        title="选择政治面貌"
                        cascade={false}
                        extra="请选择"
                        value={zhengzmm && personInfoDic["ACCOUNT/zhengzmm"] && personInfoDic["ACCOUNT/zhengzmm"].length ? zhengzmm.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { zhengzmm: { name: this.getTagname(personInfoDic["ACCOUNT/zhengzmm"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={zhengzmmbool}
                        onVisibleChange={(e) => this.onOpenChange({ zhengzmmbool: e }, { zhengzmmbool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name"> 政治面貌</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        renderXuel(xuel: any): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                xuelbool = state!.xuelbool;
            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/xuel"]]}
                        title="选择学历"
                        cascade={false}
                        extra="请选择"
                        value={xuel && personInfoDic["ACCOUNT/xuel"] && personInfoDic["ACCOUNT/xuel"].length ? xuel.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { xuel: { name: this.getTagname(personInfoDic["ACCOUNT/xuel"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={xuelbool}
                        onVisibleChange={(e) => this.onOpenChange({ xuelbool: e }, { xuelbool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name"> 学历</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        renderDegreeName(): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                xuew = state!.xuew,
                DegreeNamebool = state!.DegreeNamebool;

            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/xuew"]]}
                        title="选择学位"
                        cascade={false}
                        extra="请选择"
                        value={xuew && personInfoDic["ACCOUNT/xuew"] && personInfoDic["ACCOUNT/xuew"].length ? xuew.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { xuew: { name: this.getTagname(personInfoDic["ACCOUNT/xuew"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={DegreeNamebool}
                        onVisibleChange={(e) => this.onOpenChange({ DegreeNamebool: e }, { DegreeNamebool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">学位</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        renderZhic(zhic: any): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                zhicbool = state!.zhicbool;
            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/zhic"]]}
                        title="选择职称"
                        cascade={false}
                        extra="请选择"
                        value={zhic && personInfoDic["ACCOUNT/zhic"] && personInfoDic["ACCOUNT/zhic"].length ? zhic.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { zhic: { name: this.getTagname(personInfoDic["ACCOUNT/zhic"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={zhicbool}
                        onVisibleChange={(e) => this.onOpenChange({ zhicbool: e }, { zhicbool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">职称</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }

        renderZhuanyfx(zhuanyfx: any): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                Zhuanyfxbool = state!.Zhuanyfxbool;
            return (
                personInfoDic && (
                    <Picker
                        data={[personInfoDic["ACCOUNT/zhuanyfx"]]}
                        title="选择专业方向"
                        cascade={false}
                        extra="请选择"
                        value={zhuanyfx && personInfoDic["ACCOUNT/zhuanyfx"] && personInfoDic["ACCOUNT/zhuanyfx"].length ? zhuanyfx.value : []}
                        onChange={(value) => {
                            this.dispatch({ type: "input", data: { zhuanyfx: { name: this.getTagname(personInfoDic["ACCOUNT/zhuanyfx"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={Zhuanyfxbool}
                        onVisibleChange={(e) => this.onOpenChange({ Zhuanyfxbool: e }, { Zhuanyfxbool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">专业方向</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        // 个性签名
        renderSignName(): React.ReactNode {
            const { state } = this.props;
            return (
                <List.Item
                    arrow="horizontal"
                    multipleLine
                    onClick={() => {
                        this.goTo("edit/idiograph/个性签名");
                    }}
                >
                    <Flex>
                        <div className="margin-right-xs gray-three-color label-name">个性签名</div>
                        <Flex.Item className="no-omit text-right">{state!.idiograph}</Flex.Item>
                    </Flex>
                </List.Item>
            );
        }
        // 兴趣爱好
        renderInterest(): React.ReactNode {
            const { state } = this.props,
                getTagApplyInfos = state!.getTagApplyInfos;

            return (
                <List.Item arrow="horizontal" multipleLine onClick={this.selectInterest.bind(this)}>
                    <Flex>
                        <div className="margin-right-xs gray-three-color label-name">兴趣爱好</div>
                        <Flex.Item className="no-omit text-right">
                            {getTagApplyInfos && getTagApplyInfos.length ? `${getTagApplyInfos[0].tagName}等${getTagApplyInfos.length}个爱好` : "请选择"}
                        </Flex.Item>
                    </Flex>
                </List.Item>
            );
        }
        // 家乡
        renderJiax(): React.ReactNode {
            const { state } = this.props,
                personInfoDic = state!.personInfoDic,
                jiax = state!.jiax,
                Jiaxiangbool = state!.Jiaxiangbool;

            return (
                personInfoDic && (
                    <Picker
                        data={personInfoDic["ACCOUNT/jiax"]}
                        title="选择家乡"
                        cols={2}
                        extra="请选择"
                        value={jiax && personInfoDic["ACCOUNT/jiax"] && personInfoDic["ACCOUNT/jiax"].length ? jiax.value : []}
                        onChange={(value) => {
                            console.log(value);

                            this.dispatch({ type: "input", data: { jiax: { name: this.getTagname(personInfoDic["ACCOUNT/jiax"], value![0]), value: value } } });
                            synchronousSerial(() => {
                                this.submit();
                            });
                        }}
                        visible={Jiaxiangbool}
                        onVisibleChange={(e) => this.onOpenChange({ Jiaxiangbool: e }, { Jiaxiangbool: false })}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <Flex>
                                <div className="margin-right-xs gray-three-color label-name">家乡</div>
                            </Flex>
                        </List.Item>
                    </Picker>
                )
            );
        }
        selectInterest() {
            const { state } = this.props;
            this.dispatch({ type: "input", data: { interestOpen: !state!.interestOpen } });
        }
        refScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $(this).parents(".container-page").find("#nav_box_Shadow").length <= 0 && $(this).prevAll(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $(this)
                .parents(".container-page")
                .find("#nav_box_Shadow")
                .css({
                    background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${
                        top * 0.001 < 0.1 ? top * 0.001 : 0.1
                    }) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
                });
        }
        renderBody(): React.ReactNode {
            const { state } = this.props;
            let avatar = state!.avatar,
                gender = state!.gender,
                thumb = state!.thumb,
                birthday = state!.birthday,
                zhengzmm = state!.zhengzmm,
                xuel = state!.xuel,
                zhic = state!.zhic,
                zhuanyfx = state!.zhuanyfx,
                interestOpen = state!.interestOpen;
            const interestProps: any = {
                isOpen: () => interestOpen,
                close: () => {
                    this.selectInterest();
                },
                confirmSelect: () => {
                    this.dispatch("input", { interestOpen: false });
                    synchronousSerial(() => {
                        this.submit();
                    });
                },
            };
            return (
                <>
                    <List className="account-list">
                        {this.renderAvatar(thumb, avatar) || null}
                        {this.renderAnonymityName() || null}
                        {this.renderRealName() || null}
                        {this.renderMail() || null}
                        {this.renderGender(gender) || null}
                        {this.renderCountryName() || null}
                        {this.renderNationName() || null}
                        {this.renderHunyin() || null}
                        {this.renderBirthday(birthday) || null}
                    </List>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List className="account-list">
                        {this.renderSignName() || null}
                        {this.renderInterest() || null}
                        {this.renderJiax() || null}
                    </List>
                    <WhiteSpace className="whitespace-gray-bg" />
                    <List className="account-list">
                        {this.renderZhengzmm(zhengzmm) || null}
                        {this.renderXuel(xuel) || null}
                        {this.renderDegreeName() || null}
                        {this.renderZhic(zhic) || null}
                        {this.renderZhuanyfx(zhuanyfx) || null}
                    </List>
                    {this.renderEmbeddedView(AccountViewInterest.Page as any, { ...interestProps })}
                </>
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.accountEdit]);
}
