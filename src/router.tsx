/*
 * @Author: 可可同学
 * @Date: 2021-11-30 20:24:41
 * @LastEditTime: 2021-11-30 22:40:46
 * @LastEditors: 可可同学
 * @Description:
 */
import { router } from "dva";

// import { loadLazyModule } from "@reco-m/core-ui";
import IndexPage from "./routes/IndexPage";

function RouterConfig({ history }) {
  return (
    <router.Router history={history}>
      <router.Switch>
        <router.Route path="/kek" component={IndexPage} />
        <router.Redirect to="/kek" />
        {/* <router.Route path="/login" component={loadLazyModule(() => import("@reco-m/auth-login"))} />
                <router.Route path="/my" component={loadLazyModule(() => import("@reco-m/my"))} />
                <router.Route path="/file" component={loadLazyModule(() => import("@reco-m/file-test"))} />
                <router.Route path="/h5" component={loadLazyModule(() => import("@reco-m/h5home-h5home"))} />
                <router.Redirect to="/my" /> */}
      </router.Switch>
    </router.Router>
  );
}

export default RouterConfig;
