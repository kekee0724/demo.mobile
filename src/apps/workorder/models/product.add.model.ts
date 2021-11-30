import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { serviceProductService, myMarketInHttpService } from "@reco-m/workorder-service";
import { tagService } from "@reco-m/tag-service";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { ServiceSourceTextEnum } from "@reco-m/ipark-common";
import { Namespaces, ServiceInstitutionAcceptanceModeEnum } from "./common";


export namespace productAddModel {

  export const namespace = Namespaces.productAdd;

  export type StateType = typeof state;

  export const state: any = freeze({}, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...CoreReducers,

    init() {
      return state;
    }
  };

  export const effects: EffectsMapObject = {
    ...CoreEffects,
    *initPage({ data, productId, message }, { put }) {
      put({ type: "showLoading" });

      try {
        yield put({ type: `getInstitytionMode`, message });
        yield put({ type: `getAgreementConfig`, message });
        yield put({ type: `getInstitutionByID`, message, data: data.institutionID });
        yield put({ type: `getTag`, message, data: { tagClass: "INSTITUTION/FUWJG", parkId: getLocalStorage("parkId") }, map: "prices" });
        yield put({ type: `getTag`, message, data: { tagClass: "INSTITUTION/jiagdw", parkId: getLocalStorage("parkId") }, map: "units" });
        yield put({ type: `getTag`, message, data: { tagClass: "INSTITUTION/fuwdx", parkId: getLocalStorage("parkId") }, map: "objects" });
        yield put({ type: `getTag`, message, data: { tagClass: "CATALOGUE/fuwlx", parkId: getLocalStorage("parkId") }, map: "catalogues" });
        if (productId) {
          yield put({ type: `getProduct`, productId });
        }
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    /**
     * 获取产品详情
     */
    *getProduct({ message, productId }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const result = yield call(serviceProductService.get, productId),
          serviceProductBasicFormVM = result.serviceProductBasicFormVM || {};
        yield put({
          type: "input", data: {
            productName: serviceProductBasicFormVM.serviceName,
            serviceCatalogueNames: serviceProductBasicFormVM.serviceCategory,
            serviceCatalogueIDs: serviceProductBasicFormVM.serviceCategoryValue,
            serviceObjectNames: serviceProductBasicFormVM.serviceObject,
            serviceObjectIDs: serviceProductBasicFormVM.serviceObjectValue,
            summary: serviceProductBasicFormVM.productIntroduce,
            maxPrice: serviceProductBasicFormVM.chargeMaxPrice,
            minPrice: serviceProductBasicFormVM.chargeMinPrice,
            chosenChargeMode: { tagName: serviceProductBasicFormVM.chargeMode, tagValue: serviceProductBasicFormVM.chargeModeValue },
            chosenUnit: { tagName: serviceProductBasicFormVM.chargeUnit, tagValue: serviceProductBasicFormVM.chargeUnitValue }
          }
        });
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getInstitytionMode({ message }, { call, put }) {
      try {
        yield put({ type: "showLoading" });

        let institutionMode = yield call(myMarketInHttpService.acceptanceMode);

        yield put({ type: "input", data: { institutionMode } });
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },

    *getInstitutionByID({ message, data }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        const marketDetail = yield call(myMarketInHttpService.get, data);
        yield put({ type: "input", data: { institution: marketDetail } });
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },

    *getTag({ message, data, map }, { call, put }) {
      try {
        const tags = yield call(tagService.getTagByTagClass, data);

        yield put({
          type: "input",
          data: { [map]: tags }
        });
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      }
    },

    *addProduct({ message, callback, productId }, { call, put, select }) {
      yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
      const user = yield select(state => state[authNamespaces.user]);
      const currentUser = user!.currentUser;
      try {
        const state = yield select(state => state[Namespaces.productAdd]),
          chosenUnit = state!.chosenUnit,
          chosenChargeMode = state!.chosenChargeMode,
          institution = state!.institution,
          institutionMode = state!.institutionMode;

          console.log("currentUser", currentUser, institution);
          

        let contactPersonalCommonVM = {
          email: institutionMode === ServiceInstitutionAcceptanceModeEnum.showOnly ? currentUser.email : institution.contactPersonalCommonVM && institution.contactPersonalCommonVM.email,
          fullName: institutionMode === ServiceInstitutionAcceptanceModeEnum.showOnly ? currentUser.name || currentUser.nickName : institution.contactPersonalCommonVM && institution.contactPersonalCommonVM.fullName,
          mobile: institutionMode === ServiceInstitutionAcceptanceModeEnum.showOnly ? currentUser.mobile : institution.contactPersonalCommonVM && institution.contactPersonalCommonVM.mobile
        };

        let serviceProductBasicFormVM = {
          chargeMaxPrice: state!.maxPrice,
          chargeMinPrice: state!.minPrice,
          chargeMode: chosenChargeMode && chosenChargeMode.tagName,
          chargeModeValue: chosenChargeMode && chosenChargeMode.tagValue,
          chargeUnit: chosenUnit && chosenUnit.tagName,
          chargeUnitValue: chosenUnit && chosenUnit.tagValue,
          clientSource: ServiceSourceTextEnum.app,
          institutionId: institution.contactPersonalCommonVM && institution.contactPersonalCommonVM.bindTableId,
          institutionName: institution.serviceInstitutionBasicFormVM && institution.serviceInstitutionBasicFormVM.institutionName,
          isOnService: true,
          parkId: getLocalStorage("parkId"),
          parkName: getLocalStorage("parkName"),
          productIntroduce: state!.summary,
          serviceCategory: state!.serviceCatalogueNames,
          serviceCategoryValue: state!.serviceCatalogueIDs,
          serviceName: state!.productName,
          serviceObject: state.serviceObjectNames,
          serviceObjectValue: state!.serviceObjectIDs,
          status: 1
        }
        let postData
        if (productId) {
          postData = yield call(serviceProductService.put, productId, { contactPersonalCommonVM, serviceProductBasicFormVM });
          callback(productId);
        } else {
          postData = yield call(serviceProductService.post, { contactPersonalCommonVM, serviceProductBasicFormVM });
          callback(postData);
        }
        
      } catch (e) {
        console.log('catcherror', e?.errmsg||e);
        message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *getAgreementConfig({ message }, { call, put }) {
      try {
        const result = yield call(serviceProductService.getConfig);
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

app.model(productAddModel);
