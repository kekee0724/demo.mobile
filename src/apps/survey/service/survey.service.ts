import { HttpService, resolveService } from "@reco-m/core";

export class SurveyHttpService extends HttpService {
    constructor() {
        super("questionnaire/questionnaire");
    }
}
export const surveyService = resolveService(SurveyHttpService);
export class SurveyAnswerHttpService extends HttpService {
    constructor() {
        super("questionnaire/answer");
    }
    mySurvey (data: any) {
        return this.httpGet("my", this.resolveRequestParams(data));
    }
    saveServey(data: any) {
        return this.httpPut("" + data.id, data.survey);
    }
    tempSave(data) {
        return this.httpPut("temp-save/" + data.id, data.survey);
    }
}
export const surveyAnswerService = resolveService(SurveyAnswerHttpService);
