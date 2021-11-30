export enum Namespaces {
    survey = "survey",
    surveyDetail = "surveyDetail",
    surveyForm = "surveyForm",
    surveyFormSuccess = "surveyFormSuccess",
}

export const changeCounters = {
    surveyChangeCounter: 0,
    surveyData: [],
};

/**
 * 问卷状态
 */
export enum AnswerStatusEnum {
    /**
     * 未回答
     */
    notAnswer = 0,
    /**
     * 已回答
     */
    finished = 1,
    /**
     * 未完成
     */
    tempSave = 2,
    /**
     * 取消
     */
    cancel = 3,
    /**
     * 我的问卷
     */
    mysurvey = 8,
}
/**
 * 问卷问题类型
 */
export enum QuestionTypeEnum {
    /**
     * 单项选择
     */
    singleSelect = 1,
    /**
     * 多项选择
     */
    multiSelect = 2,
    /**
     * 下拉选择
     */
    dropSelect = 3,
    /**
     * 单项填空
     */
    singleFill = 4,
    /**
     * 多项填空
     */
    multiFill = 5,
    /**
     * 多行填空
     */
    multiLineFill = 6,
    /**
     * 文件上传
     */
    fileUpload = 7,
    /**
     * 描述说明
     */
     describe = 8,
}
/**
 * 校验规则
 */
export enum AnswerRuleEnum {
    /**
     * 必填
     */
    required = 1,
    /**
     * 最小选择数量
     */
    minChoice = 2,
    /**
     * 限制选择数量
     */
    limitCount = 3,
    /**
     * 最大选择数量
     */
    maxChoice = 4,
    /**
     * 选项布局
     */
    optionLayout = 11,
    /**
     * 正则表达式
     */
    rule = 12,
}

/**
 * 问卷状态
 */
export enum SurveryStatusEnum {
    /**
     * 未发布
     */
    unPublish = 1,
    /**
     * 已发布
     */
    published = 2,
}

/**
 * 问卷模块，路由中的status枚举
 */
export enum SurveyStatusInUrlEnum {
    /**
     * 问卷列表
     */
    list = "0",
    /**
     * 我的问卷
     */
    myList = "1",
}
/**
 * 显示关联条件
 */
export enum SurveryLogicalShowOperateEnum {
    /**
     * 选中
     */
    selected = 1,
    /**
     * 未选中
     */
    notSelect = 2,
}
