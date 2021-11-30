/*
 * @Author: 可可同学
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2021-11-30 22:41:27
 * @LastEditors: 可可同学
 * @Description:
 */
import React from "react";

import { connect } from "dva";

function IndexPage() {
  return (
    <div className="reco-login-box normal">
      <h1 className="title">Welcome to kek!</h1>
      <div className="welcome" />
      <div className="list">
        <em>@<code>可可</code>2021</em>
        <div><a href="#">Getting Started</a></div>
      </div>
    </div>
  );
}

IndexPage.propTypes = {};

export default connect()(IndexPage);
