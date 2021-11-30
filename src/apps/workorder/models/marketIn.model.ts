import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, formatDate, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { tagService } from "@reco-m/tag-service";

import { myMarketInHttpService, companyHttpService } from "@reco-m/workorder-service";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { ServiceSourceTextEnum } from "@reco-m/ipark-common";

import { Namespaces } from "./common";

export namespace marketInModel {
    export const namespace = Namespaces.marketIn;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            show: false,
            open: false,
            organizationName: "",
            organizationAbbr: "",
            typeTag: {}, // 被选中的服务类别
            cityName: "",
            registDate: "",
            businessCode: "", // 社会信用码
            stateTaxCode: "", // 纳税识别号
            summary: "", // 公司简介
            contactPerson: "",
            mobile: "", // 公司联系人手机号码
            tel: "",
            email: "",
            address: "",
            website: "",
            officialAccount: "", // 微信公众号
            microBlog: "", // 微博
            contactName: "",
            contactMobile: "",
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

        *initPage({ message, companyId, isupdate, callback, validateMobileError }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });
                yield put({ type: `getAgreementConfig`, message });
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = user!.currentUser;
                yield put({ type: "input", data: { contactPerson: currentUser.realName, mobile: currentUser.mobile } });
                yield yield put({ type: `${Namespaces.productAdd}/getAgreementConfig`, message });
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });
                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    currentMember = memberState!.member;
                let companyInfo: any = {};
                if (currentMember && currentMember.companyId) {
                    companyInfo = yield call(companyHttpService.getCompanyInfo, currentMember.companyId);
                    companyInfo = companyInfo && companyInfo.companyVM;
                }

                const marketInTags = yield call(tagService.getTagByTagClass, { tagClass: "CATALOGUE/fuwlx", parkId: getLocalStorage("parkId") });

                yield put({
                    type: "input",
                    data: {
                        currentMember,
                        marketInTags,
                    },
                });
                if (companyId) {
                    yield put({
                        type: "input",
                        data: {
                            companyId,
                            address: companyInfo && companyInfo.businessAddress,
                            organizationName: currentMember.companyName,
                            businessCode: companyInfo.creditCode || currentMember.creditCode,
                            contactPerson: currentMember.realName,
                            mobile: currentMember.mobile,
                        },
                    });
                }
                // 如果是重新提交
                // 服务机构获取详情重新提交
                const marketDetail = yield call(myMarketInHttpService.getMyInstitution);
                const { serviceInstitutionCategoryDetailVMList: insCategory = [], serviceInstitutionBasicFormVM: insBasic = {}, contactPersonalCommonVM: personCommon = {} } =
                    marketDetail || {};
                let serviceCatalogueNamesArr = [] as any;
                insCategory &&
                    insCategory.forEach((item) => {
                        let temp = {
                            id: item.id,
                            tagName: item.serviceCategory,
                            tagValue: item.serviceCategoryValue,
                        };
                        serviceCatalogueNamesArr.push(temp);
                    });

                if (isupdate) {
                    yield put({
                        type: "input",
                        data: {
                            companyId,
                            organizationName: insBasic.institutionName,
                            chosenCatalogue: serviceCatalogueNamesArr,
                            address: personCommon.address,
                            contactPerson: personCommon.fullName,
                            personId: personCommon.id,
                            mobile: personCommon.mobile,
                            initMobile: personCommon.mobile,
                            registDate: formatDate(insBasic.setupDate, "yyyy-MM-dd"),
                            businessCode: insBasic.creditCode,
                            email: personCommon.email,
                            tel: personCommon.tel,
                            summary: insBasic.detail,
                            caseinfo: insBasic.serviceCase,
                            bindTableId: personCommon.bindTableId,
                            website: insBasic.website,
                            insBasic
                        },
                    });
                }
                if (!isupdate) {
                    yield put({ type: "getValidateMobile", mobile: currentMember?.mobile, error: validateMobileError });
                }

                callback && callback(personCommon);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        /**
         * 服务机构校验手机
         * @param { error, mobile, callback }
         * @param { call }
         */
        *getValidateMobile({ error, mobile, callback }, { call }) {
            try {
                yield call(myMarketInHttpService.getValidateMobile, mobile);

                if (callback) {
                    yield call(callback);
                }
            } catch (e) {
                yield call(error, e.errmsg);
            }
        },
        // 提交服务机构入驻申请
        *commitFrom({ message, callback, companyId, isupdate }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });

                

                const { marketIn } = yield select((state) => ({ marketIn: state[Namespaces.marketIn] })),
                    chosenCatalogue = marketIn.chosenCatalogue;

                let contactPersonalCommonVM = {
                    address: marketIn.address,
                    fullName: marketIn.contactPerson,
                    mobile: marketIn.mobile,
                    email: marketIn.email,
                    tel: marketIn.tel,
                    id: marketIn.personId,
                };
                let serviceInstitutionBasicFormVM = {
                    clientSource: ServiceSourceTextEnum.app,
                    creditCode: marketIn.businessCode,
                    detail: marketIn.summary,
                    institutionName: marketIn.organizationName,
                    parkId: getLocalStorage("parkId"),
                    parkName: getLocalStorage("parkName"),
                    serviceCase: marketIn.caseinfo,
                    setupDate: marketIn.registDate,
                    status: 0,
                    companyId: companyId ? companyId : null,
                    website: marketIn.website,
                };
                let serviceInstitutionCategoryDetailVMList = [] as any;

                chosenCatalogue &&
                    chosenCatalogue.forEach((item) => {
                        serviceInstitutionCategoryDetailVMList.push({
                            serviceCategory: item.tagName,
                            serviceCategoryValue: item.tagValue,
                        });
                    });
                let submitResult;
                if (isupdate) {
                    submitResult = yield call(myMarketInHttpService.put, marketIn.bindTableId, {
                        contactPersonalCommonVM,
                        serviceInstitutionBasicFormVM,
                        serviceInstitutionCategoryDetailVMList,
                    });
                    yield call(callback!, marketIn.bindTableId);
                } else {
                    submitResult = yield call(myMarketInHttpService.post, {
                        contactPersonalCommonVM,
                        serviceInstitutionBasicFormVM,
                        serviceInstitutionCategoryDetailVMList,
                    });
                    yield call(callback!, submitResult);
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getAgreementConfig({ message }, { call, put }) {
          try {
            const result = yield call(myMarketInHttpService.getConfig);
            yield put({ type: "input", data: { agreementConfig: result } });
          } catch (e) {
            console.log('catcherror', e?.errmsg||e);
            message!.error(`${e?.errmsg || e}`)
          } finally {
            yield put({ type: "hideLoading" });
          }
        }
    };
}

app.model(marketInModel);
