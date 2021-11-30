import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, formatDate } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { PersonInfoService, authAccountHttpService } from "@reco-m/auth-service";
import { tagService } from "@reco-m/tag-service";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";
import { Namespaces as memberNamespaces } from "@reco-m/member-models";

import { Namespaces } from "./common";

export namespace accountEditModel {
    export const namespace = Namespaces.accountEdit;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            thumb: "",
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, callback }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: `getUserInfo`, message, callback });
                yield put({ type: "getApplyTags", message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *saveTagInfo({ message }, { put, call, select }) {
            try {
                const { currentUser, ...props } = yield select((state) => state[Namespaces.accountEdit]);
                let jiaxtemp = props.personInfoDic["ACCOUNT/jiax"];
                let jiax: any = {};
                jiaxtemp &&
                    props.jiax &&
                    props.jiax.value &&
                    jiaxtemp.forEach((item) => {
                        if (item.value === props.jiax.value[0]) {
                            jiax["province"] = item.label;
                            jiax["provinceValue"] = item.value;
                            item.children &&
                                item.children.forEach((itm) => {
                                    if (itm.value === props.jiax.value[1]) {
                                        jiax["city"] = itm.label;
                                        jiax["cityValue"] = itm.value;
                                    }
                                });
                            if (item.children && item.children.length === 0) {
                                jiax["city"] = null;
                                jiax["cityValue"] = null;
                            }
                        }
                    });
                let getTagApplyInfos = props.getTagApplyInfos;
                let xingq: any = {
                    interest: "",
                    interestValue: "",
                };
                getTagApplyInfos &&
                    getTagApplyInfos.forEach((item, i) => {
                        if (i < getTagApplyInfos.length - 1) {
                            xingq.interest = xingq.interest + item.tagName + ",";
                            xingq.interestValue = xingq.interestValue + item.tagValue + ",";
                        } else {
                            xingq.interest = xingq.interest + item.tagName;
                            xingq.interestValue = xingq.interestValue + item.tagValue;
                        }
                    });

                let guoj = props.guoj && props.guoj.value ? { country: props.guoj.name, countryValue: props.guoj.value[0] } : {};
                let minz = props.minz && props.minz.value ? { nation: props.minz.name, nationValue: props.minz.value[0] } : {};
                let huny = props.huny && props.huny.value ? { marriageStatus: props.huny.name, marriageStatusValue: props.huny.value[0] } : {};
                let xuew = props.xuew && props.xuew.value ? { highestDegree: props.xuew.name, highestDegreeValue: props.xuew.value[0] } : {};

                let xuel = props.xuel && props.xuel.value ? { highestEducation: props.xuel.name, highestEducationValue: props.xuel.value[0] } : {};
                let zhengzmm = props.zhengzmm && props.zhengzmm.value ? { politicalStatus: props.zhengzmm.name, politicalStatusValue: props.zhengzmm.value[0] } : {};
                let zhic = props.zhic && props.zhic.value ? { jobTitle: props.zhic.name, jobTitleValue: props.zhic.value[0] } : {};
                let zhuanyfx = props.zhuanyfx && props.zhuanyfx.value ? { researchArea: props.zhuanyfx.name, researchAreaValue: props.zhuanyfx.value[0] } : {};

                let params = {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: currentUser.id,
                    idiograph: props.idiograph,
                    fullName: props!.realName && props!.realName !== "" ? props!.realName : props!.RealNameedit,
                    ...guoj,
                    ...minz,
                    ...huny,
                    ...xuew,
                    ...jiax,
                    ...xingq,
                    ...xuel,
                    ...zhengzmm,
                    ...zhic,
                    ...zhuanyfx,
                };

                if (!props.personInfo || !props.personInfo.id) {
                    yield call(PersonInfoService.saveInfo, params);
                } else {
                    yield call(PersonInfoService.modifyInfo, props.personInfo.id, params);
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getUserInfo({ message, callback }, { select, put, call }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                let user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;

                const pictureSrc = yield call(pictureService.getPictureList, {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: currentUser.id,
                    customType: 1,
                });

                yield put({
                    type: "input",
                    data: {
                        currentUser,
                        realName: currentUser && currentUser.realName,
                        nickName: currentUser && currentUser.nickName,
                        mobile: currentUser && currentUser.mobile,
                        gender: currentUser && currentUser.gender,
                        email: currentUser && currentUser.email,
                        birthday: currentUser && currentUser.birthday,
                        thumb: pictureSrc ? pictureSrc[pictureSrc.length - 1] : "",
                    },
                });
                callback && callback(currentUser.id);
                yield put({ type: "getOtherInfo", id: currentUser.id });
                yield put({ type: "hideLoading" });
            } catch (e) {
                yield put({ type: "hideLoading" });
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getOtherInfo({ message, id }, { put, call }) {
            try {
                const personInfo = yield call(PersonInfoService.getInfo, {
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    bindTableId: id,
                });
                let guoj = personInfo && !!personInfo.country && !!personInfo.countryValue ? { name: personInfo.country, value: [+personInfo.countryValue] } : {};
                let minz = personInfo && !!personInfo.nation && !!personInfo.nationValue ? { name: personInfo.nation, value: [+personInfo.nationValue] } : {};
                let xuew =
                    personInfo && !!personInfo.highestDegree && !!personInfo.highestDegreeValue ? { name: personInfo.highestDegree, value: [+personInfo.highestDegreeValue] } : {};
                let huny =
                    personInfo && !!personInfo.marriageStatus && !!personInfo.marriageStatusValue
                        ? { name: personInfo.marriageStatus, value: [+personInfo.marriageStatusValue] }
                        : {};

                let xuel =
                    personInfo && !!personInfo.highestEducation && !!personInfo.highestEducationValue
                        ? { name: personInfo.highestEducation, value: [+personInfo.highestEducationValue] }
                        : {};
                let zhengzmm =
                    personInfo && !!personInfo.politicalStatus && !!personInfo.politicalStatusValue
                        ? { name: personInfo.politicalStatus, value: [+personInfo.politicalStatusValue] }
                        : {};
                let zhic = personInfo && !!personInfo.jobTitle && !!personInfo.jobTitleValue ? { name: personInfo.jobTitle, value: [+personInfo.jobTitleValue] } : {};
                let zhuanyfx =
                    personInfo && !!personInfo.researchArea && !!personInfo.researchAreaValue ? { name: personInfo.researchArea, value: [+personInfo.researchAreaValue] } : {};
                let jiax = {};
                if (personInfo && personInfo.province) {
                    jiax["name"] = personInfo.province;
                    jiax["value"] = [];
                    personInfo.provinceValue && jiax["value"].push(+personInfo.provinceValue);
                    if (personInfo.city) {
                        personInfo.cityValue && jiax["value"].push(+personInfo.cityValue);
                    }
                }
                let getTagApplyInfos: any = [];
                let interestsArr = personInfo && personInfo.interest ? personInfo.interest.split(",") : [],
                    interestsValueArr = personInfo && personInfo.interestValue ? personInfo.interestValue.split(",") : [];
                interestsArr &&
                    interestsArr.forEach((item, i) => {
                        let itemTemp = {};
                        itemTemp["tagName"] = item;
                        itemTemp["tagValue"] = +interestsValueArr[i];
                        getTagApplyInfos.push(itemTemp);
                    });
                yield put({
                    type: "input",
                    data: { zhengzmm, xuel, zhic, zhuanyfx, personInfo: personInfo, guoj, minz, xuew, huny, idiograph: personInfo?.idiograph, jiax, getTagApplyInfos },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getApplyTags({ message }, { call, put }) {
            try {
                const tags = yield call(tagService.getTagByTagClasses, {
                    tagClass: "ACCOUNT/guoj,ACCOUNT/minz,ACCOUNT/xuew,ACCOUNT/huny,ACCOUNT/jiax,ACCOUNT/xingqah,ACCOUNT/xuel,ACCOUNT/zhengzmm,ACCOUNT/zhic,ACCOUNT/zhuanyfx",
                });
                // 家乡
                let hometown = tags["ACCOUNT/jiax"];
                hometown = hometown
                    .filter((v) => v.parentId === "0")
                    .map((item) => {
                        item.children = [];
                        hometown.forEach((s) => {
                            if (s.parentId === item.id) {
                                s = { ...s, label: s.tagName, value: parseInt(s.tagValue, 10) };
                                item.children.push(s);
                            }
                        });
                        return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                    });
                tags["ACCOUNT/jiax"] = hometown;

                // 国籍
                let country = tags["ACCOUNT/guoj"];
                country = country.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/guoj"] = country;
                // 婚姻
                let political = tags["ACCOUNT/huny"];
                political = political.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/huny"] = political;
                // 民族
                let nation = tags["ACCOUNT/minz"];
                nation = nation.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/minz"] = nation;
                // // 学位
                let highestDegree = tags["ACCOUNT/xuew"];
                highestDegree = highestDegree.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/xuew"] = highestDegree;

                // 学历
                let education = tags["ACCOUNT/xuel"];
                education = education.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/xuel"] = education;

                // 职称
                let technical = tags["ACCOUNT/zhic"];
                technical = technical.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/zhic"] = technical;

                // 政治面貌
                let polity = tags["ACCOUNT/zhengzmm"];
                polity = polity.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/zhengzmm"] = polity;

                // 专业方向
                let professional = tags["ACCOUNT/zhuanyfx"];
                professional = professional.map((item) => {
                    return (item = { ...item, label: item.tagName, value: parseInt(item.tagValue, 10) });
                });
                tags["ACCOUNT/zhuanyfx"] = professional;

                // 兴趣爱好
                let xingqArrs = tags["ACCOUNT/xingqah"];
                let indterestMaxCount = 10;
                if (xingqArrs) {
                    if (xingqArrs.length > 30) {
                        indterestMaxCount = 15;
                    } else if (xingqArrs.length > 10) {
                        indterestMaxCount = 10;
                    } else {
                        indterestMaxCount = 5;
                    }
                }

                // console.log('tags', tags);
                yield put({ type: "input", data: { personInfoDic: tags, indterestMaxCount: indterestMaxCount } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *savePersonInfo({ message }, { call, select, put }) {
            try {
                const { birthday, avatar, email, RealNameedit, gender, nickName, mobile, currentUser, ...props } = yield select((state) => state[Namespaces.accountEdit]);
                delete props.isLoading;
                delete props.showloading;

                const accountEdit = yield select((state) => state[Namespaces.accountEdit]);

                let ncurrentUser = { ...currentUser };
                ncurrentUser.password = null;
                yield call(authAccountHttpService.put, currentUser.id, {
                    account: {
                        ...ncurrentUser,
                        mobile: "13262786327",
                        nickName: nickName,
                        gender: gender,
                        birthday: formatDate(birthday),
                        email: email,
                        realName: accountEdit!.realName && accountEdit!.realName !== "" ? accountEdit!.realName : RealNameedit,
                    },
                });

                yield put({
                    type: `${authNamespaces.user}/cleanCurrentUser`,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);

                return Promise.reject(e);
            }
        },
        *saveData({ message, callback, count }, { put, call, select }) {
            try {
                yield put({ type: "showLoading" });
                const { currentUser = {} } = yield select((state) => state[Namespaces.accountEdit]);
                yield yield put({ type: "savePersonInfo", message });
                if (count >= 13) yield put({ type: `${memberNamespaces.intergral}/operateMemberIntegral`, eventCode: "PerfectInformation" });
                yield call(callback!, currentUser.id);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(accountEditModel);
