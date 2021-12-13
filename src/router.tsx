// import { router } from "dva";
import * as router from 'react-router-dom';
import { loadLazyModule } from "@reco-m/core-ui";

import IndexPage from "./routes/IndexPage";

function RouterConfig({ history }) {
  return (
    <router.Router history={history}>
      <router.Switch>
        <router.Route path="/kek" component={IndexPage} />

        <router.Route path="/login" component={loadLazyModule(() => /* webpackChunkName: "login" */ import("@reco-m/auth-login"))} />
        <router.Redirect to="/kek" />
        {/*  <router.Route path="/my" component={loadLazyModule(() => import("@reco-m/my"))} />
                <router.Route path="/file" component={loadLazyModule(() => import("@reco-m/file-test"))} />
                <router.Route path="/h5" component={loadLazyModule(() => import("@reco-m/h5home-h5home"))} />
                <router.Redirect to="/my" /> */}
      </router.Switch>
    </router.Router>
  );
}

export default RouterConfig;
