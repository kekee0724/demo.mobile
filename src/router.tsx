import { router } from "dva";

import { loadLazyModule } from "@reco-m/core-ui";

function RouterConfig({ history }) {
    return (
        <router.Router history={history}>
            <router.Switch>
                <router.Route path="/login" component={loadLazyModule(() => import(/* webpackChunkName: "login" */ "@reco-m/auth-login"))} />
                <router.Route path="/my" component={loadLazyModule(() => import(/* webpackChunkName: "my" */ "@reco-m/my"))} />
                <router.Route path="/file" component={loadLazyModule(() => import(/* webpackChunkName: "file" */ "@reco-m/file-test"))} />
                <router.Route path="/h5" component={loadLazyModule(() => import(/* webpackChunkName: "new-home" */ "@reco-m/h5home-h5home"))} />
                <router.Redirect to="/my" />
            </router.Switch>
        </router.Router>
    );
}

export default RouterConfig;
