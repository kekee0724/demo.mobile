import React from "react";

import { router } from "dva";

import { Route } from "@reco-m/core-ui";

import { Survey } from "./survey";

import { SurveyForm } from "./survey.form";

import { SurveyFormSuccess } from "./survey.success";
import { loginRoutes } from "@reco-m/ipark-auth-login";
import { certifyDetailRoutes, certifyRoutes } from "@reco-m/member-certify";
import {deleteDataRoutes} from "@reco-m/ipark-common-page"
export { Survey, SurveyForm, SurveyFormSuccess };

export const surveyAnonymityRoutes = ({ match }) => (
    <Route
        path={`${match.path}`}
        render={({ match }) => (
            <>
                <Route root path={match.path} component={Survey.Page} />
                {surveyFormRoutes(match)}
                {surveyFormSuccessRoutes(match)}
            </>
        )}
    />
);


export const surveyAnonymityFormRoutes = ({ match }) => <Route path={`${match.path}/:id/:answerStatus`} component={SurveyForm.Page} />;
export const surveyAnonymityFormSuccessRoutes = ({ match }) => <Route path={`${match.path}`} component={SurveyFormSuccess.Page} />;

export function surveyRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/survey/:status`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Survey.Page} />
                    {surveyFormRoutes(match)}
                    {surveyFormSuccessRoutes(match)}
                    {mySurveyFormRoutes(match)}
                </>
            )}
        />
    );
}

export function surveyFormNoticeRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/anonymityform/:id`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={SurveyForm.Page} />
                    {loginRoutes(match)}
                    {certifyRoutes(match)}
                    {certifyDetailRoutes(match)}
                    {deleteDataRoutes(match)}
                </>
            )}
        />
    );
}

export function surveyFormRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/form/:id/:answerStatus`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={SurveyForm.Page} />
                    {deleteDataRoutes(match)}
                </>
            )}
        />
    );
    // return <Route path={`${match.path}/form/:id/:answerStatus`} component={SurveyForm.Page} />;
}
export function mySurveyFormRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/mysurveyform/:id/:answerStatus/:surveytype`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={SurveyForm.Page} />
                    {deleteDataRoutes(match)}
                </>
            )}
        />
    );
    // return <Route path={`${match.path}/mysurveyform/:id/:answerStatus/:surveytype`} component={SurveyForm.Page} />;
}

export function surveyFormSuccessRoutes(match: router.match) {
    return <Route path={`${match.path}/surveysuccess`} component={SurveyFormSuccess.Page} />;
}
