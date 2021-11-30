import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { browser } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { loginSMSService, authService, loginService } from "@reco-m/auth-service";

import { accountBindMobileModel } from "@reco-m/auth-models";
import { wechatMPHttpService, dingdingHttpService } from "@reco-m/ipark-common-service";
import { Namespaces } from "./common"


export namespace authbindmodalModel {

  export const namespace = Namespaces.authbindmodal;

  export type StateType = typeof state;

  let d;

  export const state: any = freeze({
    social: []
  }, !0);

  export const reducers: ReducersMapObject<any, AnyAction> = {
    ...accountBindMobileModel.reducers
  };

  export const effects: EffectsMapObject = {
    ...accountBindMobileModel.effects,

    *accountBindMobile() {
    },
    *sendVerifyCode({ message, delay, data }, { call }) {
      const cleardelay = delay();

      try {
        yield call(loginSMSService.getLoginCode, {
          response_type: "mobile",
          client_id: server.apiKey!.apiKey,
          scope: "",
          ...data
        });
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
        cleardelay();
      }
    },

    *smsLoginAndBindThird({ message, successcall, openid }, { select, put, call }) {
      const data = yield select(({ authbindmodal }) => authbindmodal),
        { phonenumber, smsCode } = data;
      try {
        const token = yield call(loginSMSService.loginNew, {
          username: phonenumber,
          code: smsCode
        });
        loginSMSService.refreshToken(token, server.auth!.autoRefreshToken);
        yield put({ type: "auth/refresh" });
        yield put({ type: "user/getCurrentUser" });

        if (browser.versions.weChat) {
          yield put({ type: "postThirdAccountBindAction", message, successcall, openid: openid });
        } else {
          yield call(successcall, "登录成功");
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },

    *postThirdAccountBindAction({ message, successcall, openid }, { call }) {
      try {
        const result = yield call(wechatMPHttpService.bind, openid);
        if (result) {
          yield call(successcall, "登录成功");
        } else {
          message!.error("绑定失败")
          yield call(authService.logout);
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      }
    },

    // 登录授权
    * wechatH5Login({ message, code, callBack }, { call, put }) {
      try {
        yield put({ type: "showLoading" });
        if (!d) {
          d = yield call(wechatMPHttpService.accessToken, code);
        }
        if (d.uid) {
          // 已绑定手机号
          loginService.refreshToken(
            d,
            server.auth!.autoRefreshToken
          );
          yield put({ type: "auth/refresh" });
          callBack();
        } else {
          // 未绑定手机号
          yield put({
            type: "input",
            data: {
              openid: d.open_id
            }
          });
        }
      } catch (e) {
         console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
      } finally {
        yield put({ type: "hideLoading" });
      }
    },
    *dingTalkLogin({ failback, code, callback }, { call, put }) {
      try {
        const token = yield call(dingdingHttpService.accessToken, code);
        if (token.uid) {
          loginService.refreshToken(
            token,
            server.auth!.autoRefreshToken
          );
          yield put({ type: "auth/refresh" });
          callback && callback()
        } else {
          failback && failback!();
        }
      } catch (error) {
        alert(`error = ${JSON.stringify(error)}`);
      }
    }
  };

}

app.model(authbindmodalModel);
