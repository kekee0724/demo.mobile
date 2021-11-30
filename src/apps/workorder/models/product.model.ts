import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { serviceProductService } from "@reco-m/workorder-service";
import { tagService } from "@reco-m/tag-service";
import { translateCity } from "@reco-m/workorder-common";

import { Namespaces, MarketTypeEnum, MyMarketinStatusEnum } from "./common";

export namespace productModel {
    export const namespace = Namespaces.product;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            show: false,
            type: 1,
            csfwId: "",
            orderBy: "",
            orderById: "",
            typeTitle: "服务类型",
            cityTitle: "服务城市",
            sortTitle: "智能排序",
            chargeTitle: "收费方式",
            refreshing: false,
            pageSize: 15,
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        productPage(state: any, { productList, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, productList, {
                    items: productList.currentPage <= 1 ? productList.items : [...draft.items, ...productList.items],
                    refreshing: false,
                    hasMore: productList.currentPage < productList.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });
            try {
                yield put({ type: "getTags", data: { tagClass: "CATALOGUE/fuwlx", parkId: getLocalStorage("parkId") } });
                yield put({ type: `input`, data: { csfwId: data.tagId } });

                yield put({
                    type: `getProductList`,
                    data: {
                        pageIndex: 1,
                        serviceCategoryValue: data.tagId || undefined,
                        key: data.key,
                        orderBy: "",
                        pageSize: 15,
                        parkId: getLocalStorage("parkId"),
                        isOnService: true,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getProductList({ data, message }, { call, put }) {
            try {
                const thisChangeId = ++changeCounter,
                    productList = yield call(serviceProductService.getPaged, { status: MyMarketinStatusEnum.pass, ...data });

                yield put({ type: "productPage", productList, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getTags({ message, data, tagId }, { call, put }) {
            try {
                const tags = yield call(tagService.getTagByTagClass, data);

                yield put({
                    type: "input",
                    data: { tags: tags },
                });

                yield put({
                    type: "changeProductTabTitle",
                    data: {
                        tags: tags,
                        type: 1,
                        csfwId: tagId,
                        fwcsId1: "",
                        fwcsId2: "",
                        typeTitle: "服务类型",
                        // cityTitle: "服务城市",
                        sortTitle: "智能排序",
                        chargeTitle: "收费方式",
                        data: 1,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        // 获取组合标签
        *groupTag({ message, data }, { put }) {
            try {
                // yield put({ type: "showLoading" });

                let datas: any = [];

                if (data.type === MarketTypeEnum.serviceType) {
                    datas.push({ value: "", label: "全部" });

                    data.tags &&
                        data.tags.forEach((tag) => {
                            datas.push({ value: tag.tagValue, label: tag.tagName });
                        });
                } else if (data.type === MarketTypeEnum.serviceCity) {
                    const cityArea = data.tags["service/fuwcs"] || [];

                    datas = translateCity(cityArea, !0);
                    datas.unshift({ value: "", label: "全部", children: [{ value: "", label: "全部" }] });
                } else if (data.type === MarketTypeEnum.intelligenceSort) {
                    datas.push({ value: MarketTypeEnum.timeSort, label: "按咨询量排序" });
                    datas.push({ value: MarketTypeEnum.heatSort, label: "按申请量排序" });
                } else if (data.type === MarketTypeEnum.chargType) {
                    datas.push({ value: 0, label: "全部" });
                    datas.push({ value: MarketTypeEnum.chargFree, label: "免费" });
                    datas.push({ value: MarketTypeEnum.chargToll, label: "收费" });
                    datas.push({ value: MarketTypeEnum.chargDiscuss, label: "面议" });
                }

                yield put({
                    type: "input",
                    data: {
                        groupTag: datas,
                        type: data.type,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        // tab选项切换筛选
        *changeProductTabState({ message, data, messagecall, key }, { put, select }) {
            try {
                const { market } = yield select((state) => ({ market: state[Namespaces.product] }));
                let getInstitutionData: any = {};
                if (data.type === MarketTypeEnum.serviceType) {
                    yield put({
                        type: "input",
                        data: {
                            csfwId: data.value[0],
                            orderBy: market.orderBy,
                            sflxid: data.sflxid,
                        },
                    });

                    getInstitutionData = {
                        pageIndex: 1,
                        serviceCategoryValue: data.value[0] || undefined,
                        chargeModeValue: data.sflxid !== 0 ? data.sflxid : "",
                        orderBy: market.orderBy,
                        parkId: getLocalStorage("parkId"),
                        isOnService: true,
                        key,
                    };
                } else if (data.type === MarketTypeEnum.intelligenceSort) {
                    let orderBy = data.value[0] === MarketTypeEnum.timeSort ? "viewCount desc" : data.value[0] === MarketTypeEnum.heatSort ? "applyNumber desc" : data.value;

                    yield put({
                        type: "input",
                        data: {
                            csfwId: data.csfwId,
                            orderBy: orderBy,
                            orderById: data.value[0],
                            sflxid: data.sflxid,
                        },
                    });

                    getInstitutionData = {
                        pageIndex: 1,
                        serviceCategoryValue: data.csfwId || undefined,
                        chargeModeValue: data.sflxid !== 0 ? data.sflxid : "",
                        orderBy: orderBy,
                        parkId: getLocalStorage("parkId"),
                        isOnService: true,
                        key,
                    };
                } else if (data.type === MarketTypeEnum.chargType) {
                    yield put({
                        type: "input",
                        data: {
                            csfwId: data.csfwId,
                            orderBy: market.orderBy,
                            sflxid: data.value[0],
                        },
                    });

                    getInstitutionData = {
                        pageIndex: 1,
                        serviceCategoryValue: data.csfwId || undefined,
                        chargeModeValue: data.value[0] !== 0 ? data.value[0] : "",
                        orderBy: market.orderBy,
                        parkId: getLocalStorage("parkId"),
                        isOnService: true,
                        key,
                    };
                }
                if (getInstitutionData?.serviceCategoryValue === "null") {
                    delete getInstitutionData.serviceCategoryValue;
                }

                // 获取选择Tab的数据
                yield put({ type: "getProductList", data: getInstitutionData, messagecall });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        // 切换时改变Tab的title
        *changeProductTabTitle({ message, data }, { put }) {
            try {
                // yield put({ type: "showLoading" });

                let typeTitle = data.typeTitle || "",
                    // cityTitle = data.cityTitle || "",
                    sortTitle = data.sortTitle || "",
                    chargeTitle = data.chargeTitle || "",
                    tags = data.tags;
                if (data.type === MarketTypeEnum.serviceType) {
                    if (data.data && data.data === 1) {
                        data.csfwId &&
                            tags &&
                            tags &&
                            tags.forEach((tag) => {
                                if (tag.tagValue === data.csfwId && tag.tagName) typeTitle = tag.tagName;
                            });

                        if (typeTitle === "") typeTitle = "服务类型";

                        // if (data.fwcsId2 === undefined || data.fwcsId2 === "") cityTitle = "服务城市";
                    } else {
                        data.value[0] &&
                            tags &&
                            tags.forEach((tag) => {
                                if (tag.tagValue === data.value[0] && tag.tagName) typeTitle = tag.tagName;
                            });

                        if (typeTitle === "" || data.value[0] === "" || data.value[0] === undefined) typeTitle = "服务类型";
                    }
                } else if (data.type === MarketTypeEnum.intelligenceSort) {
                    sortTitle = data.value && data.value[0] === MarketTypeEnum.timeSort ? "咨询量排序" : data.value && data.value[0] === MarketTypeEnum.heatSort && "申请量排序";

                    if (sortTitle === "" || data.value[0] === "" || data.value[0] === undefined) sortTitle = "智能排序";
                } else if (data.type === MarketTypeEnum.chargType) {
                    chargeTitle =
                        data.value && data.value[0] === MarketTypeEnum.chargFree
                            ? "免费"
                            : data.value && data.value[0] === MarketTypeEnum.chargDiscuss
                            ? "面议"
                            : data.value && data.value[0] === MarketTypeEnum.chargToll
                            ? "收费"
                            : "全部";

                    if (chargeTitle === "" || data.value[0] === "" || data.value[0] === undefined) chargeTitle = "收费方式";
                }

                yield put({
                    type: "input",
                    data: {
                        typeTitle: typeTitle,
                        sortTitle: sortTitle,
                        chargeTitle: chargeTitle,
                        type: data.type,
                    },
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(productModel);
