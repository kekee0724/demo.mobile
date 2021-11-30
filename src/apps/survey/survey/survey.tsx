import React from "react";

import { List, WhiteSpace, Flex, SearchBar, Button, Toast } from "antd-mobile-v2";

import { template, friendlyTime, formatDate } from "@reco-m/core";

import { ListComponent, setEventWithLabel } from "@reco-m/core-ui";

import { statisticsEvent } from "@reco-m/ipark-statistics";

import { Namespaces, AnswerStatusEnum, surveyModel, SurveyStatusInUrlEnum } from "@reco-m/survey-models";

import { fingerprintjs, htmlContentTreatWord } from "@reco-m/ipark-common";

export namespace Survey {
    export interface IProps<S extends IState = IState> extends ListComponent.IProps<S> {}

    export interface IState extends ListComponent.IState, surveyModel.StateType {
        dataSource?: any;
    }

    export class Component<P extends IProps = IProps, S extends IState = IState> extends ListComponent.Base<P, S> {
        headerContent = "问卷调查";
        namespace = Namespaces.survey;
        get statusInUrl() {
            return this.props.match!.params.status;
        }

        componentDidMount() {
            fingerprintjs();
            this.statusInUrl === SurveyStatusInUrlEnum.myList
                ? setEventWithLabel(statisticsEvent.mySurveyListBrowse)
                : setEventWithLabel(statisticsEvent.questionnaireSurveyListBrowse);
            this.headerContent = this.statusInUrl === SurveyStatusInUrlEnum.myList ? "我的问卷" : "问卷调查";
            this.dispatch({ type: `initPage`, status: this.statusInUrl });
        }

        componentReceiveProps(nextProps: IProps) {
            this.shouldUpdateData(nextProps.state);
            let locationChanged = nextProps.location !== this.props.location;
            if (locationChanged && (nextProps.location!.pathname === "/service/survey/0" || nextProps.location!.pathname === "/my/survey/1")) {
                $(".am-list-view-scrollview").animate({ scrollTop: 0 });
                this.pullToRefresh();
            }
        }

        componentWillUnmount(): void {
            this.dispatch({ type: "input", data: { key: "" } });
        }

        getData(pageIndex?: number, key?: any) {
            this.dispatch({
                type: "getSurvey",
                status: this.statusInUrl,
                key: key,
                pageIndex: pageIndex,
            });
        }

        /**
         * 刷新列表
         */
        pullToRefresh() {
            let { state } = this.props;
            this.getData(1, state!.key);
        }

        /**
         * 上拉刷新
         */
        onEndReached() {
            let { state } = this.props;
            this.getData((state!.currentPage || 0) + 1, state!.key);
        }

        /**
         * 根据不同状态获取按钮名
         * @param item
         */
        getButtonTextByStatus(item) {
            if (this.statusInUrl === SurveyStatusInUrlEnum.myList) {
                // 我的问卷
                switch (item.answerStatus) {
                    case AnswerStatusEnum.notAnswer:
                        return "参与调研";
                    case AnswerStatusEnum.finished:
                        return "已完成";
                    case AnswerStatusEnum.tempSave:
                        return "未完成";
                    case AnswerStatusEnum.cancel:
                        return "已取消";
                    default:
                        return "";
                }
            } else {
                // 问卷列表
                switch (item.answerStatus) {
                    case AnswerStatusEnum.notAnswer:
                        return "参与调研";
                    case AnswerStatusEnum.finished:
                        return "已回答";
                    case AnswerStatusEnum.tempSave:
                        return "继续填写";
                    case AnswerStatusEnum.cancel:
                        return "参与调研";
                    default:
                        return "";
                }
            }
        }

        /**
         * 渲染问卷状态
         * @param item
         */
        renderStatus(item) {
            if (!item.isStarted) {
                // 未开始
                return null;
            }

            if (this.statusInUrl === SurveyStatusInUrlEnum.myList) {
                // 我的问卷
                return (
                    <Button onClick={() => {}} type={"primary"}>
                        <span>{this.getButtonTextByStatus(item)}</span>
                    </Button>
                );
            } else {
                if ([AnswerStatusEnum.notAnswer, AnswerStatusEnum.finished, AnswerStatusEnum.tempSave].contains(item.answerStatus)) {
                    return (
                        <Button onClick={() => {}} type={"primary"}>
                            <span>{this.getButtonTextByStatus(item)}</span>
                        </Button>
                    );
                }
            }
        }
        renderStateText(isStarted) {
            if (isStarted === false) {
                return <span className="color-red">未开始</span>;
            }
        }

        /**
         * 点击单条数据时
         * @param item
         */
        onClickItem(item) {
            if (this.statusInUrl === SurveyStatusInUrlEnum.myList) {
                // 我的问卷
                if ([AnswerStatusEnum.notAnswer, AnswerStatusEnum.finished, AnswerStatusEnum.tempSave].contains(item.answerStatus)) {
                    // 未回答
                    this.goTo(`mysurveyform/${item && item.id}/${item && item.answerStatus}/${AnswerStatusEnum.mysurvey}`);
                }
            } else {
                // 问卷列表
                if (!item.isStarted) {
                    Toast.fail(`很抱歉，此问卷将于${formatDate(item.startTime, "yyyy-MM-dd hh:mm")}开放`);
                    return;
                }
                if ((item.realCount || 0) >= item.targetCount && item.answerStatus !== AnswerStatusEnum.tempSave && item.targetCount > 0) {
                    this.message.error("很抱歉，此问卷收集数量已达上限，期待您的下次参与哦~");
                    return;
                }
                if ([AnswerStatusEnum.notAnswer, AnswerStatusEnum.tempSave].contains(item.answerStatus)) {
                    // 未回答
                    this.goTo(`form/${item && item.id}/${item && item.answerStatus}`);
                } else if (item.answerStatus === AnswerStatusEnum.finished) {
                    this.goTo(`mysurveyform/${item && item.lastAnswerId}/${item && item.answerStatus}/${AnswerStatusEnum.mysurvey}`);
                }
            }
        }

        renderItemsContent(item): React.ReactNode {
            return (
                <List className="line-border-no my-apply-list surveyContent">
                    <List.Item wrap multipleLine onClick={() => this.onClickItem(item)}>
                        <Flex>
                            <Flex.Item>
                                <div className="omit omit-1">{item.name || item.questionnaireName}</div>
                            </Flex.Item>
                            <div className="omit omit-1">{this.renderStateText(item.isStarted)}</div>
                        </Flex>
                        <List.Item.Brief>
                            <div
                                className="omit omit-3"
                                dangerouslySetInnerHTML={{
                                    __html:
                                    htmlContentTreatWord(item.description && item.description.replace(/\n/g, "<br>")) ||
                                        (item.questionnaireDescription && item.questionnaireDescription.replace(/\n/g, "<br>")),
                                }}
                            />
                        </List.Item.Brief>
                        <WhiteSpace />
                        <div className="survey-button">
                            {item.publishTime ? (
                                <span className="survey-time">答题时间：{friendlyTime(item.publishTime)}</span>
                            ) : (
                                <span className="survey-time">创建时间：{friendlyTime(item.inputTime)}</span>
                            )}
                            {this.renderStatus(item)}
                        </div>
                    </List.Item>
                </List>
            );
        }

        renderHeader(): React.ReactNode {
            return (
                <>
                    {super.renderHeader()}
                    <SearchBar
                        placeholder="搜索"
                        maxLength={8}
                        onChange={(e) => {
                            const { state } = this.props;
                            const { status } = this.props.match!.params;
                            if (e === state!.key) {
                                return;
                            }
                            this.dispatch({ type: "input", data: { key: e } });
                            this.getData(1, e);

                            +status === +SurveyStatusInUrlEnum.myList ? setEventWithLabel(statisticsEvent.mySurveySearch) : setEventWithLabel(statisticsEvent.questionnaireSurveySearch);
                        }}
                    />
                </>
            );
        }

        renderBody(): React.ReactNode {
            const { state } = this.props;
            return <div className="container-body apply-container survey">{state!.refreshing !== false ? null : this.getListView()}</div>;
        }
    }

    export const Page = template(Component, (state) => state[Namespaces.survey]);
}
