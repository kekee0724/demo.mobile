/*
 * @Author: 可可同学
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2021-11-30 22:29:45
 * @LastEditors: 可可同学
 * @Description:
 */
import React from "react";

import { connect } from "dva";

function IndexPage() {
  return (
    <div className="reco-login-box normal">
      <h1 className="title">Yay! Welcome to dva!</h1>
      <div className="welcome" />
      <ul className="list">
        <li>To get started, edit <code>src/index.tsx</code> and save to reload.</li>
        <li><a href="https://github.com/dvajs/dva-docs/blob/master/v1/en-us/getting-started.md">Getting Started</a></li>
      </ul>
    </div>
  );
}

IndexPage.propTypes = {};

export default connect()(IndexPage);
