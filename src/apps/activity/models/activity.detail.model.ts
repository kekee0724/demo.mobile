import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, formatDate, browser, formatDateTime, getLocalStorage, setLocalStorage} from "@reco-m/core";

import { app, getSharePicture, share, shareType, setEventWithLabel, ToastInfo } from "@reco-m/core-ui";

import { activityHttpService, activityApplyHttpService, activitySignHttpService } from "@reco-m/activity-service";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { dingTalkJSService } from "@reco-m/ipark-common-service";

import { Namespaces as memberNamespaces, CertifyStatusEnum } from "@reco-m/member-models";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { ServiceSourceEnum, htmlContentTreatWord } from "@reco-m/ipark-common";

import { Namespaces, SignFormFieldTypeEnum } from "./common";

import { dingconfig, isDingding, aliPay, wechatPay, PayWayEnum, PaymentTypeEnum, IParkBindTableNameEnum, OrderTypeEnum } from "@reco-m/ipark-common";

export namespace activityDetailModel {
    export const namespace = Namespaces.activityDetail;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            showSignUpModal: false,
            isSubmitting: false,
            userName: "",
            mobile: "",
            email: "",
            remarks: "",
            countDown: 10,
            payWay: PayWayEnum.alipay,
        },
        !0
    );

    export const ddkit = window["dd"];

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ id, message, callback }, { put }) {
            try {
                if (isDingding()) {
                    yield put({ type: `dingdingGetConfig`, message });
                }
                yield put({ type: "showLoading" });
                yield put({ type: `getCertify`, message });
                yield put({ type: "getActivityDetail", data: id, message, callback });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getActivityDetail({ message, data, callback }, { call, put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    member = memberState.member;

                const activityDetail = yield call(activityHttpService.getDetail, data, { mobile: currentUser && currentUser.mobile });

                const { activityAccessVMList = {}, activityDetailVM = {} } = activityDetail || {};

                if (!activityDetail) {
                    location.href = `${location.href.split("?")[0]}/deleteData`
                    return
                }
                let hasLimits = false,
                    memberRoleName = "";
                activityAccessVMList &&
                    activityAccessVMList.length &&
                    activityAccessVMList.forEach((item) => {
                        if (member && member.status === CertifyStatusEnum.allow && item.memberRoleId === member.companyUserTypeId) {
                            hasLimits = true;
                        } else if (item.memberRoleId === "0") {
                            hasLimits = true;
                        } else {
                            memberRoleName = item.memberRoleName;
                        }
                    });

                const pictureSrc = yield call(pictureService.getPictureList, {
                    bindTableName: IParkBindTableNameEnum.activity,
                    bindTableId: data,
                    customType: 3,
                });
                const attachSrcArr = yield call(pictureService.getPictureList, {
                    bindTableName: IParkBindTableNameEnum.activity,
                    bindTableId: data,
                    customType: 2,
                });

                // const activityForm = yield call(activityApplyFormHttpService.applyform, { columnType: 0, isBuiltIn: false });

                const applyFieldsJson = activityDetailVM.applyFieldsJson || "[]";
                let applyFieldsObj = JSON.parse(applyFieldsJson);
                // applyFieldsObj = [...activityForm, ...applyFieldsObj];
                applyFieldsObj = [...applyFieldsObj];

                // 自定义字段有可能会没有id 给没有id的赋值
                let tempNumber = 1;
                applyFieldsObj.forEach((item) => {
                    if (!item.id) {
                        item.id = (tempNumber++).toString();
                    }
                });

                applyFieldsObj = applyFieldsObj.sort((a, b) => {
                    if ((a.sequence || 0) === (b.sequence || 0)) {
                        return new Date(a.inputTime) > new Date(b.inputTime) ? -1 : 1;
                    } else {
                        return (a.sequence || 0) - (b.sequence || 0);
                    }
                });
                activityDetailVM.applyFieldsJson = JSON.stringify(applyFieldsObj);
                
                // 处理信息园区
                let parkId = getLocalStorage("parkId");
                const parkVMList = activityDetail.parkVMList;
                if (!parkId) {        
                    setLocalStorage("parkId", parkVMList[0]!.parkId)
                } else {
                    let access = false;
                    parkVMList && parkVMList.map((item) => {
                        if (item.parkId === parkId || item.id === parkId) {
                            access = true;
                        }
                    })
                    !access && ToastInfo("非此园区资源，请在首页顶部切换园区后再操作", 2, undefined, () => {
                        history.go(-1);
                    })
                    
                }


                yield put({
                    type: "input",
                    data: {
                        attachSrcArr,
                        memberRoleName,
                        marketingPic: pictureSrc,
                        activityDetail: activityDetail,
                        member,
                        hasLimits,
                    },
                });
                
                callback && callback();
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *startShareActivity({ message, callback }, { select }) {
            try {
                const { activityDetail } = yield select((state) => ({ activityDetail: state[Namespaces.activityDetail] }));

                const { activityVM = {}, activityDetailVM = {} } = activityDetail.activityDetail || {},
                    title = activityVM.activityName;

                const contentHTML = activityDetailVM.activityContent;
                let activityContent = htmlContentTreatWord(contentHTML),
                    shareActivityContent = activityContent ? activityContent.substring(0, 40) : "",
                    img = getSharePicture(
                        activityVM.coverUrl ? activityVM.coverUrl : activityVM.pictureUrlList[0],
                        contentHTML,
                        "http://demo.bitech.cn/IPark_Share/assets/images/ipark1.png"
                    );

                let result = share(title, shareActivityContent, img, window.location.href.split("/sign")[0] + `?parkId=${getLocalStorage("parkId")}`);

                result!.then((data) => {
                    if (callback) callback();
                    data === shareType.qq
                        ? setEventWithLabel(statisticsEvent.myActivityQQShare)
                        : data === shareType.weixin
                        ? setEventWithLabel(statisticsEvent.myActivityWeChatShare)
                        : data === shareType.weibo
                        ? setEventWithLabel(statisticsEvent.myActivityWeiboShare)
                        : data === shareType.qqspace && setEventWithLabel(statisticsEvent.myActivitySpaceShare);
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *signUpActivity({ errorback, activityDetailData, callback, state, message }, { call, put }) {
            try {
                const { activityVM = {}, activityDetailVM = {} } = activityDetailData || ({} as any);

                const applyFieldsJson = activityDetailVM.applyFieldsJson || "[]";
                let applyFieldsObj = JSON.parse(applyFieldsJson);

                let postDic = {} as any;

                applyFieldsObj &&
                    applyFieldsObj.forEach((item) => {
                        let temp = state![item.id];
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.text || item.columnContentTypeValue === SignFormFieldTypeEnum.textArea) {
                            // item[item.columnCode] = temp || ""
                            postDic[item.columnName] = temp || "";
                        }
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.date) {
                            // 日期时间
                            if (item.columnConfig.indexOf("只显示时分") !== -1) {
                                // item[item.columnCode] = formatDate(temp, "hh:mm")
                                postDic[item.columnName] = formatDate(temp, "hh:mm");
                            } else if (item.columnConfig.indexOf("只允许日期") !== -1) {
                                // item[item.columnCode] = formatDate(temp, "yyyy-MM-dd")
                                postDic[item.columnName] = formatDate(temp, "yyyy-MM-dd");
                            } else if (item.columnConfig.indexOf("包含时分") !== -1) {
                                // item[item.columnCode] = formatDate(temp, "yyyy-MM-dd hh:mm:")
                                postDic[item.columnName] = formatDate(temp, "yyyy-MM-dd hh:mm");
                            }
                        }
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.radio) {
                            // 单选框
                            postDic[item.columnName] = temp ? temp.label : "";
                        }
                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.select) {
                            // 下拉
                            postDic[item.columnName] = temp ? temp.label : "";
                        }

                        if (item.columnContentTypeValue === SignFormFieldTypeEnum.check) {
                            // 复选框
                            let str = "";
                            temp &&
                                temp.forEach((item, index) => {
                                    if (index === 0) {
                                        str = str + item.label;
                                    } else {
                                        str = str + "," + item.label;
                                    }
                                });
                            postDic[item.columnName] = str;
                        }
                    });
                // console.log('applyFieldsObj', applyFieldsObj, activityVM);
                let sources = "APP";
                if (!client.isBiParkApp) {
                    if (browser.versions.weChat) {
                        sources = "微信";
                    } else if (isDingding()) {
                        sources = "钉钉";
                    } else {
                        sources = "H5";
                    }
                }
                const signUpResult = yield call(activityApplyHttpService.apply, activityVM.id, {
                    userName: state!.userName,
                    mobile: state!.mobile,
                    applyContent: JSON.stringify(postDic),
                    applySource: sources,
                    applySourceValue: `${ServiceSourceEnum.app}`,
                });
                callback && callback(signUpResult);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                yield call(errorback, e);
            } finally {
                yield put({ type: "input", data: { isSubmitting: false } });
                yield put({ type: "hideLoading" });
            }
        },

        *getCertify({ message }, { put, select }) {
            try {
                put({ type: "showLoading" });

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                if (currentUser && currentUser.id) {
                    yield put({
                        type: "input",
                        data: {
                            userName: currentUser.realName,
                            realName: currentUser.realName,
                            mobile: currentUser.mobile,
                            userId: currentUser.id,
                        },
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        // 活动签到
        *activitySignIn({ message, activityID, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                yield call(activitySignHttpService.signIn, activityID, {});

                yield call(callback, "签到成功");
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        // 报名信息
        *getApplyDetail({ message, activityID, datas }, { call, put }) {
            try {
                let result = yield call(activityApplyHttpService.applydetail, activityID, datas);
                let applyDetail = result.items && result.items.length ? result.items[0] : {};
                yield put({
                    type: "input",
                    data: {
                        applyDetail: applyDetail,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *dingdingGetConfig({ successcall }, { call }) {
            try {
                let result = yield call(dingTalkJSService.getConfig, { url: location.href.split("#")[0], appCode: "default" });
                dingconfig(result);
                successcall && successcall();
            } catch (error) {
                alert(`GetConfigerror=${JSON.stringify(error)}`);
            }
        },
        *apppay({ message, payway, order, paysuccess, payerr }, { call }) {
            try {
                let OrderItem = [] as any;
                let itm = {
                    content: `${formatDateTime(order.startTime, "yyyy-MM-dd")}-${formatDateTime(order.endTime, "yyyy-MM-dd")}`,
                    pcs: 1,
                    unitPrice: order.applyCharge,
                    unit: "元",
                };
                OrderItem.push(itm);
                let params = {
                    id: order.id,
                    bindTableId: `${order.id}`,
                    bindTableName: IParkBindTableNameEnum.activity,
                    totalAmount: order.applyCharge,
                    paymentType: PaymentTypeEnum.app,
                    subject: order.activityName,
                    orderNo: "123456", // 目前流程不对后面要调整的,先写个假的
                    orderType: OrderTypeEnum.activity,
                    items: OrderItem,
                };
                let result;
                if (payway === PayWayEnum.alipay) {
                    try {
                        result = yield call(aliPay, params, payway);
                        // yield call(cashAliPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
                        paysuccess && paysuccess(result);
                    } catch (e) {
                        payerr && payerr(e);
                    }
                } else if (payway === PayWayEnum.wechat) {
                    try {
                        result = yield call(wechatPay, params, payway);
                        // yield call(wechatPayService.payConfirm, `${result.pay.paymentNo}`); // 通知服务端查询支付结果
                        paysuccess && paysuccess(result);
                    } catch (e) {
                        payerr && payerr(e);
                    }
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(activityDetailModel);
