import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { myMarketInHttpService } from "@reco-m/workorder-service";

import { Namespaces } from "./common";

import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

export namespace marketInDetailModel {
    export const namespace = Namespaces.marketInDetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, callback, errorcall }, { put, call }) {
            try {
                yield put({ type: "showLoading" });
                const marketDetail = yield call(myMarketInHttpService.getMyInstitution);
                const { serviceInstitutionCategoryDetailVMList: insCategory = [], contactPersonalCommonVM: personCommon = {} } = marketDetail || {};
                let serviceCatalogueNamesArr = [] as any;
                insCategory &&
                    insCategory.forEach((item) => {
                        serviceCatalogueNamesArr.push(item.serviceCategory);
                    });
                let serviceCatalogueNames = serviceCatalogueNamesArr.join("、");

                yield put({
                    type: `getPictures`,
                    bindTableId: personCommon.bindTableId,
                    message,
                });

                yield put({
                    type: "input",
                    data: {
                        marketDetail,
                        bindTableId: personCommon.bindTableId,
                        contactPerson: personCommon.fullName,
                        personId: personCommon.id,
                        mobile: personCommon.mobile,
                        email: personCommon.email,
                        tel: personCommon.tel,
                        serviceCatalogueNames,
                        applyDetailData: undefined,
                        isOrderView: true,
                    },
                });

                callback && callback(personCommon);
                if (!marketDetail.serviceInstitutionBasicFormVM && errorcall) {
                    errorcall();
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *marketInModifyInit({ message, callback, errorcall }, { put }) {
            try {
                yield put({ type: "showLoading" });
                yield put({ type: "input", data: { applyDetailData: undefined, isOrderView: true } });
                yield put({ type: "getMarketInInit", callback, errorcall, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getMarketInInit({ message, callback, errorcall }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const marketDetail = yield call(myMarketInHttpService.getMyInstitution);
                const { serviceInstitutionCategoryDetailVMList: insCategory = [], contactPersonalCommonVM: personCommon = {} } = marketDetail || {};
                let serviceCatalogueNamesArr = [] as any;
                insCategory &&
                    insCategory.forEach((item) => {
                        serviceCatalogueNamesArr.push(item.serviceCategory);
                    });
                let serviceCatalogueNames = serviceCatalogueNamesArr.join("、");

                yield put({
                    type: `getPictures`,
                    bindTableId: personCommon.bindTableId,
                    message,
                });

                yield put({
                    type: "input",
                    data: {
                        marketDetail,
                        bindTableId: personCommon.bindTableId,
                        contactPerson: personCommon.fullName,
                        personId: personCommon.id,
                        mobile: personCommon.mobile,
                        email: personCommon.email,
                        tel: personCommon.tel,
                        serviceCatalogueNames,
                    },
                });

                callback && callback(personCommon);
                if (!marketDetail.serviceInstitutionBasicFormVM && errorcall) {
                    errorcall();
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getPictures({ bindTableId, message }, { call, put }) {
            try {
                const pictureData = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.institution, bindTableId: bindTableId, customType: 3 });
                const pictureData2 = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.institution, bindTableId: bindTableId, customType: 2 });
                const pictures = yield call(pictureService.getPictureUrls, { bindTableName: IParkBindTableNameEnum.institution, bindTableId: bindTableId, customType: 1 });
                yield put({
                    type: "input",
                    data: {
                        pictureData: pictureData,
                        pictures: pictures && pictures.length ? pictures[0] : "",
                        pictureData2,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *modifyContact({ message, callback }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });

                const marketDetailOrigin = yield call(myMarketInHttpService.getMyInstitution);
                const { contactPersonalCommonVM: personCommon = {} } = marketDetailOrigin || {};

                const { marketDetail } = yield select((state) => ({ marketDetail: state[Namespaces.marketInDetail] }));

                let contactPersonalCommonVM = {
                    currentContactPerson: marketDetail.contactPerson,
                    currentContactPersonMobile: marketDetail.mobile,
                    originContactMobile: personCommon.mobile,
                    originContactPerson: personCommon.fullName,
                    institutionId: marketDetail.bindTableId,
                };

                let submitResult = yield call(myMarketInHttpService.modifyContact, marketDetail.bindTableId, contactPersonalCommonVM);
                yield call(callback!, marketDetail.bindTableId);

                yield call(callback!, submitResult);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(marketInDetailModel);
