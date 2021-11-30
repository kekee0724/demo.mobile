import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { myMarketInHttpService } from "@reco-m/workorder-service";

import { tagService } from "@reco-m/tag-service";

import { translateCity } from "@reco-m/workorder-common";

import { Namespaces, MarketTypeEnum } from "./common";

import { Namespaces as memberNamespaces } from "@reco-m/member-models";

export namespace marketModel {
    export const namespace = Namespaces.market;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            show: false,
            type: 1,
            csfwId: "",
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        marketPage(state: any, { marketList, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;


            return produce(state, (draft) => {
                Object.assign(draft, marketList, {
                    items: marketList.currentPage <= 1 ? marketList.items : [...draft.items, ...marketList.items],
                    refreshing: false,
                    hasMore: marketList.currentPage < marketList.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            try {
                yield put({ type: "getTags", data: { tagClass: "CATALOGUE/fuwlx", parkId: getLocalStorage("parkId") } });
                yield put({ type: "input", data: { csfwId: data.tagId } });
                yield put({ type: "getInstitytionMode", message });
                yield put({
                    type: "getInstitutionList",
                    data: {
                        pageIndex: 1,
                        key: data.key,
                        pageSize: 15,
                        status: 1,
                        parkId: getLocalStorage("parkId"),
                        isConfirmed: true,
                        orderBy: "inputTime desc",
                        serviceCategoryValue: data.tagId,
                    },
                    message,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getInstitytionMode({ message }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });

                let institutionMode = yield call(myMarketInHttpService.acceptanceMode);
                yield yield put({ type: `${memberNamespaces.member}/getCurrentMemberInfo`, message });

                const marketDetail = yield call(myMarketInHttpService.getMyInstitution);

                const memberState: any = yield select((state) => state[memberNamespaces.member]),
                    currentMember = memberState!.member;

                yield put({ type: "input", data: { institutionMode, member: currentMember, marketDetail } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getInstitutionList({ message, data }, { call, put }) {
            try {
                // yield put({ type: "showLoading" });
                const thisChangeId = ++changeCounter,
                    marketList = yield call(myMarketInHttpService.getPaged, data);

                yield put({ type: "marketPage", marketList, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getTags({ message, data }, { call, put }) {
            try {
                // yield put({ type: "showLoading" });

                const tags = yield call(tagService.getTagByTagClass, data);
                if (tags) {
                    yield put({
                        type: "input",
                        data: { tags: tags },
                    });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        // 获取组合标签
        *groupTag({ message, data }, { put }) {
            try {
                let datas: any = [];

                if (data.type === MarketTypeEnum.serviceType) {
                    datas.push({ value: "", label: "全部" });

                    data.tags &&
                        data.tags["CATALOGUE/fuwlx"].forEach((tag) => {
                            datas.push({ value: tag.id, label: tag.tagName });
                        });
                } else if (data.type === MarketTypeEnum.serviceCity) {
                    const cityArea = data.tags["service/fuwcs"] || [];

                    datas = translateCity(cityArea, !0);
                    datas.unshift({ value: "", label: "全部", children: [{ value: "", label: "全部" }] });
                } else if (data.type === MarketTypeEnum.intelligenceSort) {
                    datas.push({ value: MarketTypeEnum.timeSort, label: "按咨询量排序" });
                    datas.push({ value: MarketTypeEnum.heatSort, label: "按申请量排序" });
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
    };
}

app.model(marketModel);
