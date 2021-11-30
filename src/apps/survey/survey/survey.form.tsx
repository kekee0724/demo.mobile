import React from "react";
import { Prompt } from "react-router-dom";

import { List, Modal, NavBar, Icon, Radio, Checkbox, WhiteSpace, Button, WingBlank, Toast, Accordion, TextareaItem, InputItem, Flex, DatePicker } from "antd-mobile-v2";

import { template, formatDate, getDate } from "@reco-m/core";

import { ViewComponent, HtmlContent, Attach, removeHtmlAttribute, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, QuestionTypeEnum, AnswerRuleEnum, surveyFormModel, AnswerStatusEnum, SurveryLogicalShowOperateEnum } from "@reco-m/survey-models";

import { deepClone, synchronousSerial } from "@reco-m/ipark-common";
import { MsgReachViewLimitEnum } from "@reco-m/msgreach-models";
import { MsgReachAuthBindModal } from "@reco-m/msgreach-common";

export namespace SurveyForm {
    export interface IProps<S extends IState = IState> extends ViewComponent.IProps<S> {}

    export interface IState extends ViewComponent.IState, surveyFormModel.StateType {}

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ViewComponent.Base<P, S> {
        showloading = false;
        multipleSelect;
        tempCheck;
        headerContent = "问卷调查";
        namespace = Namespaces.surveyForm;
        interval;
        hasModified = false; // 是否有编辑过,返回暂存用到
        canModified = true; // 详情页不可以编辑
        ispreview; // 是否预览
        /**
         * 信息触达传递权限
         */
        viewRange = this.getSearchParam("viewRange");

        componentWillUnmount() {
            this.dispatch({ type: "init" });
        }

        componentDidMount() {
            this.ispreview = this.getSearchParam("ispreview");
            const { id, answerStatus, surveytype } = this.props.match!.params;

            if (+surveytype === AnswerStatusEnum.mysurvey && +answerStatus === AnswerStatusEnum.finished) {
                this.canModified = false;
            }

            this.dispatch({
                type: `initPage`,
                id,
                surveytype,
                ispreview: this.ispreview,
                callback: (questionnaireAnswerId) => {
                    this.loadAttach(questionnaireAnswerId);
                    if (!client.isBiParkApp) {
                        // 不在ipark的app中
                        // 微信和其他浏览器
                        if (!this.isAuth()) {
                            this.dispatch({ type: "input", data: { authBindOpen: true } });
                        }
                    }
                },
                errorback: () => {
                    synchronousSerial(() => {
                        this.goBack();
                    }, 1500)
                },
            });

            if (surveytype && +surveytype === AnswerStatusEnum.mysurvey) {
                setEventWithLabel(statisticsEvent.mySurveyDetailView);
            } else {
                setEventWithLabel(statisticsEvent.questionnaireSurveyView);
            }
        }

        /**
         * 校验附件
         */
        checkAttach(question) {
            // 查找附件中该选项中的附件
            let Attach = this.getAttachInfo() && this.getAttachInfo().find((t) => t.tableName === `bi_questionnaire_${question.questionId}`);
            return Attach && Attach.files && Attach.files.length;
        }

        /**
         * 提交问卷
         */
        submit() {
            let { state } = this.props,
                surveyForm = state!.surveyForm || {},
                questionnaireAnswerId = state!.questionnaireAnswerId,
                selectedquestions = state!.selectedquestions || {},
                questions = surveyForm.questions;
            selectedquestions = deepClone(selectedquestions);
            let questionsn = (questions && deepClone(questions)) || [];
            for (let i = 0; i < questionsn.length; i++) {
                let question = questionsn[i];
                if (!this.isRuleShow(question)) break;
                let questionSelects = selectedquestions![question.questionId] || [];
                let outrules = question.rules || [];
                let options = question.options || [];

                // 附件没有执行onChange,手动加上附件的选项提交
                let selected: any = {};
                if (question.logicalType === QuestionTypeEnum.fileUpload) {
                    selected.item = question;
                    selected.questionId = question.questionId;
                    selectedquestions[question.questionId] = [{ ...selected }];
                }
                // 外部必填校验
                if (this.isRuleRequired(outrules) && question.logicalType !== QuestionTypeEnum.fileUpload) {
                    // 是必填
                    if (questionSelects.length === 0) {
                        this.scrollToQuestion(question);

                        Toast.fail(`${removeHtmlAttribute(question.title)}是必填`);
                        return;
                    }
                }
                // 文件必填校验
                if (question.logicalType === QuestionTypeEnum.fileUpload) {
                    if (this.isRuleRequired(question && question.rules)) {
                        if (!this.checkAttach(question)) {
                            this.scrollToQuestion(question);
                            Toast.fail(`${removeHtmlAttribute(question.title)}是必填`);
                            return;
                        }
                    }
                }
                // 多项选择范围判断
                if (question.logicalType === QuestionTypeEnum.multiSelect) {
                    if (this.isRuleRequired(question && question.rules)) {
                        if (!this.isRuleSelectRange(question.rules, question, questionSelects, true)) {
                            this.scrollToQuestion(question);
                            return;
                        }
                    }
                }
                // 外部正则表达式校验
                if (question.logicalType === QuestionTypeEnum.singleFill) {
                    // 只有单项填空才有外部正则校验
                    let selectedItem = questionSelects[0] ? questionSelects[0] : {};
                    if (!this.isRuleCheck(outrules, selectedItem.answerContent, question, true)) {
                        this.scrollToQuestion(selectedItem);
                        return;
                    }
                }
                // 内部选项正则表达式校验
                if (question.logicalType === QuestionTypeEnum.multiFill) {
                    // 只有多项填空才有内部正则校验
                    for (let j = 0; j < options.length; j++) {
                        let item = options[j];
                        let innerrules = item.rules;
                        let filterSelects = questionSelects.find((itm) => {
                            return itm.questionOptionId === item.questionOptionId;
                        });
                        // 内部必填校验
                        if (this.isRuleRequired(innerrules)) {
                            // 是必填
                            if (filterSelects.length === 0) {
                                this.scrollToQuestion(item);
                                Toast.fail(`${item.title}是必填`);
                                return;
                            }
                        }
                        if (filterSelects) {
                            let selectedItem = filterSelects;
                            // 内部正则表达式校验
                            if (!this.isRuleCheck(innerrules, selectedItem.answerContent, item, true)) {
                                this.scrollToQuestion(selectedItem);
                                return;
                            }
                        }
                    }
                }
            }

            this.dispatch({
                type: "saveServey",
                params: { surveyForm, selectedquestions, questionnaireAnswerId },
                callback: () => {
                    this.hasModified = false;
                    this.dispatch({ type: "input", data: { isTip: false } });
                    this.saveAttach(questionnaireAnswerId);
                    setEventWithLabel(statisticsEvent.submitQuestionnaireSurvey);
                    if (location.href.indexOf("anonymityform") === -1) {
                        location.replace(`#/service/survey/0/surveysuccess`);
                    } else {
                        location.replace("#/surveysuccess");
                    }
                },
            });
        }

        scrollToQuestion(_question) {
            // $(`#${question.questionId}`)[0] && $(`#${question.questionId}`)[0].scrollIntoView({ behavior: "smooth" });
        }

        tempsubmit() {
            let { state } = this.props,
                surveyForm = state!.surveyForm || {},
                questionnaireAnswerId = state!.questionnaireAnswerId,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);

            this.dispatch({
                type: "tempsaveServey",
                params: { surveyForm, selectedquestions, questionnaireAnswerId },
                callback: () => {
                    this.dispatch({ type: "input", data: { isTip: false } });
                    this.hasModified = false;
                    this.saveAttach(questionnaireAnswerId);
                    this.goBack();
                },
            });
        }

        /**
         * 单项输入框
         */
        contentChange(question, content) {
            this.hasModified = true;

            let { state } = this.props,
                questionnaireAnswerId = state!.questionnaireAnswerId,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            let contentSelect = [] as any;

            if (content) {
                let selected = {} as any;
                selected.item = question;
                selected.answerContent = content;
                selected.questionId = question.questionId;
                selected.questionnaireAnswerId = questionnaireAnswerId;

                if (question.questionOptionId) {
                    selected.questionOptionId = question.questionOptionId;
                }

                contentSelect.push(selected);
            }

            selectedquestions[question.questionId] = [...contentSelect];
            this.dispatch({ type: "input", data: { selectedquestions } });
        }

        /**
         * 多项输入框
         */
        mulContentChange(question, content) {
            if (!this.isRuleCheck(question.rules, content, question)) {
                return;
            }
            this.hasModified = true;
            let { state } = this.props,
                questionnaireAnswerId = state!.questionnaireAnswerId,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            let contentSelect = selectedquestions[question.questionId] || [];

            contentSelect = contentSelect.filter((item) => {
                return item.questionOptionId !== question.questionOptionId;
            });

            if (content) {
                let selected = {} as any;
                selected.item = question;
                selected.answerContent = content;
                selected.questionId = question.questionId;
                selected.questionnaireAnswerId = questionnaireAnswerId;

                if (question.questionOptionId) {
                    selected.questionOptionId = question.questionOptionId;
                }

                contentSelect.push(selected);
            }

            selectedquestions[question.questionId] = [...contentSelect];
            this.dispatch({ type: "input", data: { selectedquestions } });
        }

        checkSelect(selects, item) {
            let filterSelects = selects.find((itm) => {
                return itm.questionOptionId === item.questionOptionId;
            });
            return filterSelects ? true : false;
        }

        // 渲染单选选项RadioItem
        renderRadio(question, item, index, i): React.ReactNode {
            let { state } = this.props,
                questionnaireAnswerId = state!.questionnaireAnswerId,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            let radioSelects = selectedquestions![question.questionId] || [];

            return (
                <Radio.RadioItem
                    disabled={!this.canModified}
                    checked={this.checkSelect(radioSelects, item)}
                    key={i}
                    name={"radio-" + index}
                    onChange={() => {
                        this.hasModified = true;
                        if (this.checkSelect(radioSelects, item)) {
                            radioSelects = radioSelects.filter((itm) => {
                                return itm.questionOptionId !== item.questionOptionId;
                            });
                        } else {
                            radioSelects = [];
                            let selected = {} as any;
                            selected.item = item;
                            selected.answerContent = item.questionOptionId;
                            selected.questionId = item.questionId;
                            selected.questionOptionId = item.questionOptionId;
                            selected.questionnaireAnswerId = questionnaireAnswerId;
                            radioSelects.push(selected);
                        }

                        selectedquestions[question.questionId] = [...radioSelects];
                        this.dispatch({ type: "input", data: { selectedquestions } });
                    }}
                >
                    {item.title}
                </Radio.RadioItem>
            );
        }

        // 单选
        renderRadioItems(question, index): React.ReactNode {
            let prop = { id: question.questionId };
            return this.isRuleShow(question) ? (
                <List
                    {...prop}
                    key={index}
                    renderHeader={<HtmlContent.Component className="html-details" html={question.index + 1 + ". " + question.title + this.ruleRequiredView(question.rules)} />}
                >
                    {question.options.map((item, i) => {
                        return this.renderRadio(question, item, index, i);
                    })}
                </List>
            ) : null;
        }

        // 下拉单选
        renderDownRadioItems(question, index): React.ReactNode {
            let prop = { id: question.questionId };
            return this.isRuleShow(question) ? (
                <>
                    <Accordion {...prop} key={index} defaultActiveKey="0" className="my-accordion">
                        <Accordion.Panel
                            header={<HtmlContent.Component className="html-details" html={question.index + 1 + ". " + question.title + this.ruleRequiredView(question.rules)} />}
                        >
                            <List className="my-list">
                                {question.options &&
                                    question.options.map((item, i) => {
                                        return this.renderRadio(question, item, index, i);
                                    })}
                            </List>
                        </Accordion.Panel>
                    </Accordion>
                </>
            ) : null;
        }

        // 渲染多选项
        renderChecked(question, item, i, _index): React.ReactNode {
            let { state } = this.props,
                questionnaireAnswerId = state!.questionnaireAnswerId,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            let checkedSelects = selectedquestions![question.questionId] || [];

            return (
                <Checkbox.CheckboxItem
                    id={item.questionId}
                    disabled={!this.canModified}
                    key={i}
                    checked={this.checkSelect(checkedSelects, item)}
                    onChange={() => {
                        this.hasModified = true;
                        if (this.checkSelect(checkedSelects, item)) {
                            checkedSelects = checkedSelects.filter((itm) => {
                                return itm.questionOptionId !== item.questionOptionId;
                            });
                        } else {
                            if (!this.isRuleSelectRange(question.rules, question, checkedSelects)) {
                                return;
                            }
                            let selected = {} as any;
                            selected.item = item;
                            selected.answerContent = item.questionOptionId;
                            selected.questionId = item.questionId;
                            selected.questionOptionId = item.questionOptionId;
                            selected.questionnaireAnswerId = questionnaireAnswerId;
                            checkedSelects.push(selected);
                        }
                        selectedquestions[question.questionId] = [...checkedSelects];
                        this.dispatch({ type: "input", data: { selectedquestions } });
                    }}
                >
                    {item.title}
                </Checkbox.CheckboxItem>
            );
        }

        // 多选
        renderCheckedItem(question, index): React.ReactNode {
            let prop = { id: question.questionId };
            return this.isRuleShow(question) ? (
                <List
                    {...prop}
                    key={index}
                    renderHeader={<HtmlContent.Component className="html-details" html={question.index + 1 + ". " + question.title + this.ruleRequiredView(question.rules)} />}
                >
                    {question.options.map((item, i) => {
                        return this.renderChecked(question, item, i, index);
                    })}
                </List>
            ) : null;
        }

        // 文件上传
        renderFile(question, index): React.ReactNode {
            let prop = { id: question.questionId };
            return this.isRuleShow(question) ? (
                <List
                    {...prop}
                    key={index}
                    renderHeader={<HtmlContent.Component className="html-details" html={question.index + 1 + ". " + question.title + this.ruleRequiredView(question.rules)} />}
                >
                    <Attach.Component
                        readonly={!this.canModified}
                        tableName={`bi_questionnaire_${question.questionId}`}
                        uploadSuccess={(_file, _data, _attachDataService) => {
                            this.hasModified = true;
                            let filequestions = {};

                            filequestions[question.questionId] = [..._attachDataService!.addFileIds];
                            this.dispatch({
                                type: "input",
                                data: { ...filequestions },
                            });
                        }}
                    />
                </List>
            ) : null;
        }

        renderMulLineTextItems(question): React.ReactNode {
            let { state } = this.props,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            return question.options.map((item, i) => {
                let contentSelect = selectedquestions![question.questionId] || [],
                    selectedItem = {} as any;
                contentSelect.forEach((itm) => {
                    if (item.questionOptionId === itm.questionOptionId) {
                        selectedItem = itm;
                    }
                });
                let isRuleTime = this.isRuleTime(item.rules);

                let timeValue;
                if (isRuleTime.format === "HH:mm") {
                    const timeArr = selectedItem.answerContent ? selectedItem.answerContent.split(":") : [];
                    const time = timeArr.length > 0 && new Date(2000, 1, 1, Number(timeArr[0]), Number(timeArr[1]));
                    timeValue = time && getDate(time);
                } else {
                    timeValue = selectedItem.answerContent && getDate(selectedItem.answerContent);
                }
                let prop = { id: item.questionId };
                return isRuleTime.isRuleTime ? (
                    <DatePicker
                        {...prop}
                        disabled={!this.canModified}
                        key={i}
                        mode={isRuleTime.timeType as any}
                        format={isRuleTime.format}
                        onChange={(v) => {
                            let date = formatDate(getDate(v) as any, isRuleTime.ruleValue);
                            this.mulContentChange(item, date);
                        }}
                        value={timeValue}
                        extra={"请选择" + removeHtmlAttribute(item.title)}
                    >
                        <List.Item arrow="horizontal" multipleLine>
                            <div className="omit omit-1 line-2">{item.title}</div>
                        </List.Item>
                    </DatePicker>
                ) : (
                    <InputItem
                        {...prop}
                        editable={this.canModified}
                        key={i}
                        value={selectedItem.answerContent}
                        type="text"
                        placeholder="请输入"
                        onChange={(e) => this.mulContentChange(item, e)}
                    >
                        <div className="omit omit-1 line-2" style={{ lineHeight: 1.5 }} title={item.title}>
                            {item.title}
                        </div>
                    </InputItem>
                );
            });
        }

        // 多项填空
        renderMulLineText(question, index): React.ReactNode {
            let { state } = this.props,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            let prop = { id: question.questionId };
            return this.isRuleShow(question) ? (
                <div {...prop} className={`${this.canModified ? "" : "survey-disable "}`} key={index}>
                    <List
                        renderHeader={<HtmlContent.Component className="html-details" html={question.index + 1 + ". " + question.title + this.ruleRequiredView(question.rules)} />}
                    >
                        {this.renderMulLineTextItems(question)}
                    </List>
                </div>
            ) : null;
        }

        // 单行文本
        renderLineText(question, index): React.ReactNode {
            let { state } = this.props,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            let contentSelect = selectedquestions![question.questionId] || [],
                selectedItem = contentSelect[0] ? contentSelect[0] : {};
            let isRuleTime = this.isRuleTime(question.rules);

            let timeValue;
            if (isRuleTime.format === "HH:mm") {
                const timeArr = selectedItem.answerContent ? selectedItem.answerContent.split(":") : [];
                const time = timeArr.length > 0 && new Date(2000, 1, 1, Number(timeArr[0]), Number(timeArr[1]));
                timeValue = time && getDate(time);
            } else {
                timeValue = selectedItem.answerContent && getDate(selectedItem.answerContent);
            }
            let prop = { id: question.questionId };
            return this.isRuleShow(question) ? (
                <div className={`${this.canModified ? "" : "survey-disable "}`} key={index}>
                    <List
                        {...prop}
                        renderHeader={<HtmlContent.Component className="html-details" html={question.index + 1 + ". " + question.title + this.ruleRequiredView(question.rules)} />}
                    >
                        {isRuleTime.isRuleTime ? (
                            <DatePicker
                                disabled={!this.canModified}
                                mode={isRuleTime.timeType as any}
                                format={isRuleTime.format}
                                onChange={(v) => {
                                    let date = formatDate(getDate(v) as any, isRuleTime.ruleValue);
                                    this.contentChange(question, date);
                                }}
                                value={timeValue}
                                extra={"请选择" + removeHtmlAttribute(question.title)}
                            >
                                <List.Item className={"date-picker-box value"}></List.Item>
                            </DatePicker>
                        ) : (
                            <InputItem
                                editable={this.canModified}
                                value={selectedItem.answerContent}
                                type="text"
                                placeholder="请输入"
                                onChange={(e) => this.contentChange(question, e)}
                            />
                        )}
                    </List>
                </div>
            ) : null;
        }

        // 多行文本
        renderTextArea(question, index): React.ReactNode {
            let { state } = this.props,
                selectedquestions = state!.selectedquestions || {};
            selectedquestions = deepClone(selectedquestions);
            let contentSelect = selectedquestions![question.questionId] || [],
                selectedItem = contentSelect[0] ? contentSelect[0] : {};
            let prop = { id: question.questionId };
            return this.isRuleShow(question) ? (
                <div {...prop} className={`${this.canModified ? "" : "survey-disable "}`} key={index}>
                    <List
                        renderHeader={<HtmlContent.Component className="html-details" html={question.index + 1 + ". " + question.title + this.ruleRequiredView(question.rules)} />}
                    >
                        <TextareaItem
                            id={question.id}
                            editable={this.canModified}
                            value={selectedItem.answerContent}
                            placeholder=""
                            data-seed="logId"
                            rows={3}
                            autoHeight
                            onChange={(e) => this.contentChange(question, e)}
                        />
                    </List>
                </div>
            ) : null;
        }

        // 描叙
        renderSummery(question, index): React.ReactNode {
            let prop = { id: question.questionId };
            return (
                <List.Item {...prop} key={index}>
                    <HtmlContent.Component className="html-details text-area" html={question.title} />
                </List.Item>
            );
        }

        // 必填校验
        isRuleRequired(rules: any) {
            let isRequired = false;
            rules &&
                rules.forEach((rule) => {
                    if (rule && rule.ruleItem === AnswerRuleEnum.required && rule.ruleValue === "true") {
                        isRequired = true;
                    }
                });
            return isRequired;
        }

        ruleRequiredView(rules) {
            if (this.isRuleRequired(rules)) {
                return "<span class='color-red'>*</span>";
            } else {
                return "";
            }
        }

        // 问题显示校验
        isRuleShow(question: any) {
            let logicShows = question.logicShows;
            if (logicShows?.length > 0) {
                let { state } = this.props,
                    selectedquestions = state!.selectedquestions || {};
                selectedquestions = deepClone(selectedquestions);

                let logicshowItem = logicShows.length > 0 ? logicShows[0] : {};
                let logicshow = true;
                // 根据“全部”或“任一”设置初始值
                if (logicshowItem.logicalConnector === "or") {
                    logicshow = false;
                } else if (logicshowItem.logicalConnector === "and") {
                    logicshow = true;
                }
                logicShows.length > 0 &&
                    logicShows.forEach((item) => {
                        let temlogicshow = false;
                        // 获取对应内容的值
                        let checkedSelects = selectedquestions![item.associatedQuestionId] || [];

                        if (!checkedSelects?.length) {
                            // 如果没有对应值
                            if (item.logicalOperate === SurveryLogicalShowOperateEnum.notSelect) {
                                // 如果没有对应值 且 判断需求是“未选中”
                                temlogicshow = true;
                            }
                        } else {
                            // 获取已选中的数据
                            const sameCheckedSelect = checkedSelects.find((x) => x.questionOptionId === item.associatedQuestionOptionId);
                            // 判断需求是 “选中” 还是 “未选中”
                            if (item.logicalOperate === SurveryLogicalShowOperateEnum.selected && sameCheckedSelect) {
                                // 如果需求是 “选中” 且 存在已选中的数据
                                temlogicshow = true;
                            } else if (item.logicalOperate === SurveryLogicalShowOperateEnum.notSelect && !sameCheckedSelect) {
                                // 如果需求是 “未选中” 且 不存在已选中的数据
                                temlogicshow = true;
                            }
                        }

                        if (item.logicalConnector === "or") {
                            logicshow = logicshow || temlogicshow;
                        } else if (item.logicalConnector === "and") {
                            logicshow = logicshow && temlogicshow;
                        }
                    });

                // 如果不被显示则清除选中数据
                if (!logicshow && selectedquestions![question.questionId]?.length) {
                    selectedquestions![question.questionId] = [];
                    this.dispatch({ type: "input", data: { selectedquestions } });
                }
                return logicshow;
            } else {
                return true;
            }
        }

        // 多选框可选范围校验
        isRuleSelectRange(rules: any, question, checkedSelects, showMiniToast = false) {
            let canSelect = true;
            let selectLength = checkedSelects.length;
            rules &&
                rules.forEach((rule) => {
                    if (showMiniToast && rule && rule.ruleItem === AnswerRuleEnum.minChoice && +rule.ruleValue > selectLength) {
                        this.scrollToQuestion(question);
                        Toast.fail(`问题${question.sequence}最少选择${rule.ruleValue}个`);
                    }
                    if (!showMiniToast && rule && rule.ruleItem === AnswerRuleEnum.maxChoice && +rule.ruleValue <= selectLength) {
                        this.scrollToQuestion(question);
                        Toast.fail(`问题${question.sequence}最多选择${rule.ruleValue}个`);
                        canSelect = false;
                    }
                });
            return canSelect;
        }

        // 正则表达式校验
        isRuleCheck(rules: any, content, question, allRule = false) {
            let allowRule = true;
            rules &&
                rules.forEach((rule) => {
                    if (rule && content && rule.ruleItem === AnswerRuleEnum.rule) {
                        if (rule.ruleName === "只允许整数" || rule.ruleName === "只允许数字") {
                            let reg = new RegExp(rule.ruleValue);
                            if (!reg.test(content)) {
                                this.scrollToQuestion(question);
                                Toast.fail(`${removeHtmlAttribute(question.title)}${rule.ruleName}`);
                                allowRule = false;
                            }
                        } else if (allRule) {
                            // 并且不是时间验证
                            if (!(rule.ruleValue === "yyyy-MM-dd HH:mm" || rule.ruleValue === "HH:mm" || rule.ruleValue === "yyyy-MM-dd")) {
                                let reg = new RegExp(rule.ruleValue);
                                if (!reg.test(content)) {
                                    this.scrollToQuestion(question);
                                    Toast.fail(`${removeHtmlAttribute(question.title)}${rule.ruleName}`);
                                    allowRule = false;
                                }
                            }
                        }
                    }
                });
            return allowRule;
        }

        // 校验是否渲染时间选择器
        isRuleTime(rules: any) {
            let isRuleTime = false,
                timeType = "",
                format = "",
                ruleValue = "";
            rules &&
                rules.forEach((rule) => {
                    if (rule && rule.ruleItem === AnswerRuleEnum.rule) {
                        if (rule.ruleValue === "yyyy-MM-dd HH:mm") {
                            isRuleTime = true;
                            timeType = "datetime";
                            ruleValue = "yyyy-MM-dd hh:mm";
                            format = "YYYY-MM-DD HH:mm";
                        }
                        if (rule.ruleValue === "HH:mm") {
                            isRuleTime = true;
                            timeType = "time";
                            ruleValue = "hh:mm";
                            format = "HH:mm";
                        }
                        if (rule.ruleValue === "yyyy-MM-dd") {
                            isRuleTime = true;
                            timeType = "date";
                            ruleValue = "yyyy-MM-dd";
                            format = "YYYY-MM-DD";
                        }
                    }
                });
            return {
                isRuleTime,
                timeType,
                ruleValue,
                format,
            };
        }

        // 渲染表单
        renderSurveyItems() {
            const { state } = this.props,
                surveyForm = state!.surveyForm || {},
                questions = surveyForm.questions;

            let questionsn = questions && deepClone(questions);
            return (
                questionsn &&
                questionsn.map((question, index) => {
                    if (question.logicalType === QuestionTypeEnum.singleSelect) {
                        return this.renderRadioItems(question, index);
                    } else if (question.logicalType === QuestionTypeEnum.dropSelect) {
                        // 下拉选择
                        return this.renderDownRadioItems(question, index);
                    } else if (question.logicalType === QuestionTypeEnum.multiSelect) {
                        // 多选
                        return this.renderCheckedItem(question, index);
                    } else if (question.logicalType === QuestionTypeEnum.singleFill) {
                        // 单项填空
                        return this.renderLineText(question, index);
                    } else if (question.logicalType === QuestionTypeEnum.multiLineFill) {
                        // 多行填空
                        return this.renderTextArea(question, index);
                    } else if (question.logicalType === QuestionTypeEnum.multiFill) {
                        // 多项填空
                        return this.renderMulLineText(question, index);
                    } else if (question.logicalType === QuestionTypeEnum.fileUpload) {
                        // 文件上传
                        return this.renderFile(question, index);
                    } else if (question.logicalType === QuestionTypeEnum.describe) {
                        // 描述说明
                        return this.renderSummery(question, index);
                    }
                })
            );
        }

        renderMsgReachAuthBindModal() {
            const { id, surveytype } = this.props.match!.params;
            const { state } = this.props,
                parkId = state!.parkId,
                authBindOpen = state!.authBindOpen,
                authBindProps: any = {
                    viewRange: this.viewRange,
                    parkList: [parkId],
                    isOpen: () => authBindOpen,
                    close: () => {},
                    confirmSelect: () => {
                        if (this.viewRange.toString() !== MsgReachViewLimitEnum.registerAndCertify.toString()) {
                            this.dispatch({
                                type: `initPage`,
                                id,
                                surveytype,
                                ispreview: this.ispreview,
                                callback: (questionnaireAnswerId) => {
                                    this.loadAttach(questionnaireAnswerId);
                                },
                            });
                        }
                        this.dispatch({ type: "input", data: { authBindOpen: false } });
                    },
                };

            return !this.ispreview && this.renderEmbeddedView(MsgReachAuthBindModal.Page, { ref: "msgReachAuthBindModal", ...authBindProps });
        }

        refScroll(el) {
            if ($("html").hasClass("theme-white")) {
                $(el).off("scroll", this.scrollFn).on("scroll", this.scrollFn);
            }
        }

        scrollFn() {
            const top = $(this).scrollTop() || 0;
            $("#nav_box_Shadow").length <= 0 && $(this).parents(".container-page").find(".am-navbar").append('<span id="nav_box_Shadow"></span>');
            $("#nav_box_Shadow").css({
                background: `linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, ${top * 0.001 < 0.1 ? top * 0.001 : 0.1}) 100%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 0%)`,
            });
        }

        /**
         * 暂存模态框
         */
        tempSaveModal(isPrompt?) {
            Modal.alert("操作提示", `您当前问卷暂未完成,是否保存后退出`, [
                {
                    text: "取消",
                    onPress: () => {
                        this.hasModified = false;
                        this.dispatch({ type: "input", data: { isTip: false } });
                        !isPrompt && this.goBack();
                    },
                },
                {
                    text: "确定",
                    onPress: () => {
                        this.tempsubmit();
                    },
                },
            ]);
        }

        renderHeader(): React.ReactNode {
            return (
                client.showheader && (
                    <NavBar
                        className="park-nav"
                        icon={!this.ispreview && <Icon type="left" />}
                        onLeftClick={() => {
                            this.hasModified ? this.tempSaveModal() : this.goBack();
                        }}
                    >
                        问卷
                    </NavBar>
                )
            );
        }

        /**
         * 离开页面时校验
         * @returns
         */
        renderPrompt() {
            const { state } = this.props,
                isTip = state!.isTip;
            return (
                this.hasModified &&
                !this.ispreview && (
                    <Prompt
                        when={isTip}
                        message={() => {
                            this.tempSaveModal(true);
                            return false;
                        }}
                    ></Prompt>
                )
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props,
                surveyForm = state!.surveyForm || {};
            return (
                <div className="survey-form-container">
                    <WingBlank>
                        <h2 className="text-center" style={{ whiteSpace: "initial" }}>
                            {surveyForm.questionnaireName || surveyForm.name}
                        </h2>
                        <HtmlContent.Component className="gray-two-color size-14" html={surveyForm.questionnaireDescription || surveyForm?.description} />
                    </WingBlank>
                    <WhiteSpace />
                    {this.renderSurveyItems()}
                    <WhiteSpace />
                    {this.viewRange && this.renderMsgReachAuthBindModal()}
                    {this.renderPrompt()}
                </div>
            );
        }

        renderFooter(): React.ReactNode {
            const { state } = this.props,
                surveyForm = state!.surveyForm || {},
                isAnonymous = state!.isAnonymous;
            return (!this.ispreview && surveyForm.status === AnswerStatusEnum.tempSave) || surveyForm.status === AnswerStatusEnum.notAnswer ? (
                <Flex className="flex-collapse">
                    <Flex.Item>
                        <Button type="primary" onClick={() => this.submit()}>
                            {!isAnonymous ? "确认提交" : "匿名提交"}
                        </Button>
                    </Flex.Item>
                </Flex>
            ) : (
                ""
            );
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.surveyForm]);
}
