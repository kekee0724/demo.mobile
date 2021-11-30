import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, pictureService, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { surveyAnswerService, surveyService } from "@reco-m/survey-service";

import { IParkBindTableNameEnum, ServiceSourceTextEnum } from "@reco-m/ipark-common";

import { Namespaces, AnswerStatusEnum, QuestionTypeEnum } from "./common";
export namespace surveyFormModel {
    export const namespace = Namespaces.surveyForm;

    export const state: any = freeze(
        {
            isTip: true,
        },
        !0
    );

    export type StateType = typeof state;
    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };
    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ id, errorback, surveytype, callback, message, ispreview }, { put }) {
            put({ type: "showLoading" });
            try {
                if (ispreview) {
                    yield put({ type: `getSurveyAnswer`, message, data: id });
                } else {
                    if (surveytype && +surveytype === AnswerStatusEnum.mysurvey) {
                        yield put({ type: `getSurveyDetail`, message, data: id });
                        yield put({ type: "input", data: { questionnaireAnswerId: id } });
                        callback && callback(id);
                    } else {
                        yield put({ type: `startSurvey`, message, data: id, callback, errorback });
                    }
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *startSurvey({ message, data, callback, errorback }, { call, put }) {
            try {
                const result = yield call(surveyAnswerService.post, { questionnaireId: data, device: getLocalStorage("fingerprint"), sourceChannel: ServiceSourceTextEnum.app });
                if (result) {
                    yield put({ type: `getSurveyDetail`, message, data: result });
                    yield put({ type: "input", data: { questionnaireAnswerId: result } });
                    callback && callback(result);
                } else {
                    location.href = `${location.href.split("?")[0]}/deleteData`;
                }
                
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
                errorback && errorback();
            }
        },
        *getSurveyDetail({ message, data }, { call, put }) {
            try {
                const surveyForm = yield call(surveyAnswerService.get, data);

                const questions = surveyForm.questions;

                const picturs = yield call(pictureService.getPictureList, { bindTableName: IParkBindTableNameEnum.surveyanswer, bindTableId: data });

                const survey = yield call(surveyService.get, surveyForm.questionnaireId);

                yield put({ type: "input", data: {isAnonymous: survey?.isAnonymous } });

                let count = 0;
                let selectedquestions = {};
                let picturDic = {};
                questions &&
                    questions.forEach((question) => {
                        if (question.answerItem) {
                            selectedquestions[question.questionId] = [question.answerItem];
                        } else {
                            const options = question.options;
                            const contentSelect = [] as any;
                            options &&
                                options.forEach((option) => {
                                    if (option.answerItem) {
                                        contentSelect.push(option.answerItem);
                                    }
                                });
                            selectedquestions[question.questionId] = contentSelect;
                        }
                        // 处理文件上传重新编辑必填校验
                        if (question.logicalType === QuestionTypeEnum.fileUpload) {
                            picturs &&
                                picturs.forEach((im) => {
                                    if (question.sequence === im.customType) {
                                        picturDic[question.questionId] = im;
                                    }
                                });
                        }

                        if (question?.logicalType !== QuestionTypeEnum.describe) {
                            question.index = count++;
                        }
                    });

                if (!surveyForm) {
                    location.href = `${location.href.split("?")[0]}/deleteData`;
                } else {
                    yield put({ type: "input", data: { surveyForm: surveyForm, selectedquestions,  ...picturDic } });
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getSurveyAnswer({ message, data }, { call, put }) {
            try {
                const surveyForm = yield call(surveyService.get, data);

                const questions = surveyForm.questions;

                let count = 0;
                let selectedquestions = {};
                let picturDic = {};
                questions &&
                    questions.forEach((question) => {
                        question.questionId = question.id;
                        const options = question.options;
                        if (options?.length) {
                            options.forEach((option) => {
                                option.questionOptionId = option.id;
                            });
                        }
                        if (question.answerItem) {
                            selectedquestions[question.questionId] = [question.answerItem];
                        } else {
                            const options = question.options;
                            const contentSelect = [] as any;
                            options &&
                                options.forEach((option) => {
                                    if (option.answerItem) {
                                        contentSelect.push(option.answerItem);
                                    }
                                });
                            selectedquestions[question.questionId] = contentSelect;
                        }

                        if (question?.logicalType !== QuestionTypeEnum.describe) {
                            question.index = count++;
                        }
                    });

                if (!surveyForm) {
                    location.href = `${location.href.split("?")[0]}/deleteData`;
                } else {
                    yield put({ type: "input", data: { surveyForm: surveyForm, selectedquestions, ...picturDic } });
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *saveServey({ message, callback, params }, { call, put }) {
            try {
                let surveyForm = params.surveyForm,
                    selectedquestions = params.selectedquestions;
                let survey = {} as any,
                    answerDetails = [] as any;

                Object.values(selectedquestions).forEach((val) => {
                    answerDetails = [...answerDetails, ...((val as any) || [])];
                });

                survey.questionnaireId = surveyForm.questionnaireId;
                survey.answerDetails = answerDetails;
                survey.device = getLocalStorage("fingerprint");
                survey.sourceChannel = ServiceSourceTextEnum.app;

                yield call(surveyAnswerService.saveServey, { survey: survey, id: params.questionnaireAnswerId });
                callback && callback();
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *tempsaveServey({ message, callback, params }, { call, put }) {
            try {
                let surveyForm = params.surveyForm,
                    selectedquestions = params.selectedquestions;
                let survey = {} as any,
                    answerDetails = [] as any;

                Object.values(selectedquestions).forEach((val) => {
                    answerDetails = [...answerDetails, ...((val as any) || [])];
                });

                survey.questionnaireId = surveyForm.questionnaireId;
                survey.answerDetails = answerDetails;
                survey.device = getLocalStorage("fingerprint");
                survey.sourceChannel = ServiceSourceTextEnum.app;

                yield call(surveyAnswerService.tempSave, { survey: survey, id: params.questionnaireAnswerId });
                callback && callback();
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(surveyFormModel);
