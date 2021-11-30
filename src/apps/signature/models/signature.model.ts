import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { app, createData, dataURLtoFile } from "@reco-m/core-ui";
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from 'immer';
import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { getAttachmentService } from "@reco-m/signature-service";
import { Namespaces, BindTableNameEnum } from "./common";

export namespace signatureModel {
    export const namespace = Namespaces.signature;
    export const state: any = freeze({
        ...CoreState,
    })
    export type StateType = typeof state;


    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: "getSignature", message });
            } catch (e) {
                message!.error(e?.errmsg || e)
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        /**
         * 获取签名附件
         */
        *getSignature({ message }, { call, put, select }) {
            put({ type: "showLoading" });
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser` });
                const user = yield select(state => state[authNamespaces.user]),
                    currentUser = user && user.currentUser;
                const params = {
                    bindTableName: BindTableNameEnum.account,
                    bindTableId: currentUser.id,
                    customType: 2 // 和后台对应customType
                }
                const file = yield call(getAttachmentService.getAttachmentList, params)
                yield put({ type: "input", data: { file: file, isShowImg: file.length } })
            } catch (e) {
                message!.error(e?.errmsg || e)
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        /**
         * 上传保存签名附件
         */
        *saveSignature({ message, data, callback }, { call, put, select }) {
            put({ type: "showLoading" });
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser` });
                const user = yield select(state => state[authNamespaces.user]),
                    signatureState = yield select(state => state[Namespaces.signature]),
                    currentUser = user && user.currentUser,
                    file = signatureState.file || [];
                let formDate = createData(dataURLtoFile(data, "img", "png"));
                let result = yield call(getAttachmentService.upload, formDate.get("id"), formDate); // 上传
                let params = {
                    addIds: [result.fileId],
                    bindTableId: currentUser.id,
                    bindTableName: BindTableNameEnum.account,
                    customType: 2, // 和后台对应customType
                    uploadId: formDate.get("id")
                }
                let x = yield call(getAttachmentService.save, params); // 保存
                if (x) {
                    yield call(callback)
                    // 保存成功后手动删除其他签名附件
                    for (let i = 0; i < file.length; i++){
                        yield call(getAttachmentService.delete, file[i].id)
                    }
                }
            } catch (e) {
                message!.error(e?.errmsg || e)
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(signatureModel);
