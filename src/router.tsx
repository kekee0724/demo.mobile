import { router } from "dva";

import { loadLazyModule } from "@reco-m/core-ui";

function RouterConfig({ history }: any) {
    return (
        <router.Router history={history}>
            <router.Switch>
                <router.Route path="/index" component={loadLazyModule(() => import("@reco-m/ipark-white-home"))} />
                <router.Route path="/my" component={loadLazyModule(() => import("@reco-m/ipark-white-my"))} />
                <router.Route path="/service" component={loadLazyModule(() => import("@reco-m/service-home"))} />
                <router.Route path="/discover/:tabID" component={loadLazyModule(() => import("@reco-m/discover"))} />
                <router.Route path="/marketauth" component={loadLazyModule(() => import("@reco-m/workorder-market"))} />
                <router.Route path="/msgreach" component={loadLazyModule(() => import("@reco-m/msgreach-msgreach"))} />
                <router.Route path="/h5" component={loadLazyModule(() => import(/* webpackChunkName: "new-home" */ "@reco-m/ipark-h5home-h5home"))} />
                {/* 匿名问卷 */}
                <router.Route path="/surveyanonymity" component={loadLazyModule(() => import("@reco-m/survey").then(({ surveyAnonymityRoutes }) => ({ routes: surveyAnonymityRoutes })))} />

                <router.Route
                    path="/surveyAnonymityform"
                    component={loadLazyModule(() => import("@reco-m/survey").then(({ surveyAnonymityFormRoutes }) => ({ routes: surveyAnonymityFormRoutes })))}
                />
                <router.Route
                    path="/surveysuccess"
                    component={loadLazyModule(() => import("@reco-m/survey").then(({ surveyAnonymityFormSuccessRoutes }) => ({ routes: surveyAnonymityFormSuccessRoutes })))}
                />
                
                {/* 测试页面 */}
                <router.Route path="/test" component={loadLazyModule(() => import("@reco-m/ipark-common-page").then(({ testRoutes }) => ({ routes: testRoutes })))} />

                {/* <router.Route path="/policy" component={loadLazyModule(() => import("@reco-m/policy"))} /> */}
                <router.Redirect to="/index" />

            </router.Switch>
        </router.Router>
    );
}

export default RouterConfig;
