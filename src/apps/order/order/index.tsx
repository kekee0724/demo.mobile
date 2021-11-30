import React from "react";

import { router } from "dva";
import { Route } from "@reco-m/core-ui";

import { Evaluate } from "@reco-m/comment-evaluate";

import { RoomDetail, RoomOrderDetail/* , RoomOrder */, Room } from "@reco-m/room";

import { DetailCommentList } from "@reco-m/order-common";

import { InvoiceEdit } from "@reco-m/invoice-common";
import { loginRoutes } from "@reco-m/ipark-auth-login";

import { PositionDetail, PositionOrder, Position } from "@reco-m/position";

import {deleteDataRoutes} from "@reco-m/ipark-common-page"

import { MyOrder } from "./my.order";

import { MyOrderDetail } from "./my.order.details";

import { MyOrderSearch } from "./my.order.search";

import { RefundOrder } from "./my.order.refundorder";

import { RefundOrderDetail } from "./my.order.refundorder.detail";

import { PaySucceed } from "./order.pay.succeed";

import { PaySubmit } from "./order.submit.succeed";

export { MyOrder, MyOrderDetail, MyOrderSearch, RefundOrder, RefundOrderDetail, PaySucceed, PaySubmit };

export function orderRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/order/:index`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={MyOrder.Page} />
                    <router.Switch>
                        {orderDetailsRoutes(match)}
                        {orderSearchRoutes(match)}
                        {evaluateRoutes(match)}
                        {refundorderDetailsRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}

export function orderDetailsRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/orderDetails/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={MyOrderDetail.Page} />
                    {resourceOrderPayRoutes(match)}
                    {evaluateRoutes(match)}
                    {orderDetailPositionRoutes(match)}
                    {orderDetailRoomRoutes(match)}
                </>
            )}
        />
    );
}

export function orderDetailNotificationRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/resource_order/order/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={MyOrderDetail.Page} />
                    {resourceOrderPayRoutes(match)}
                    {evaluateRoutes(match)}
                    {orderPositionRoutes(match)}
                    {orderDetailRoomRoutes(match)}
                </>
            )}
        />
    );
}

export function orderSearchRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/orderSearch`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={MyOrderSearch.Page} />
                    {orderDetailsRoutes(match)}
                    {resourceOrderPayRoutes(match)}
                    {evaluateRoutes(match)}
                </>
            )}
        />
    );
}

export function evaluateRoutes(match: router.match) {
    return <Route path={`${match.path}/evaluate`} component={Evaluate.Page} />;
}

export function refundorderRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/refundorder/:type`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={RefundOrder.Page} />
                    {refundorderDetailsRoutes(match)}
                </>
            )}
        />
    );
}

export function refundorderDetailsRoutes(match: router.match) {
    return <Route path={`${match.path}/detail/:detailid`} component={RefundOrderDetail.Page} />;
}

export function resourceOrderPayRoutes(match: router.match) {
    return (
        <router.Switch>
            <Route
                path={`${match.path}/resourceSubmitSucceed/:id/:type`}
                render={({ match }) => (
                    <>
                        <Route path={match.path} component={PaySubmit.Page} />
                        {resourceOrderPaySuccessedRoutes(match)}
                        {orderDetailsRoutes(match)}
                    </>
                )}
            />
            {resourceOrderPaySuccessedRoutes(match)}
        </router.Switch>
    );
}

export function resourceOrderPaySuccessedRoutes(match: router.match) {
    return (
        <router.Switch>
            <Route path={`${match.path}/resourcePayErr/:id/:type`} component={PaySubmit.Page}  />
            <Route
                path={`${match.path}/resourcePaySucceed/:id`}
                render={({ match }) => (
                    <>
                        <Route path={match.path} component={PaySucceed.Page} />
                        {orderDetailsRoutes(match)}
                    </>
                )}
            />
        </router.Switch>
    );
}


// 工位
export function positionRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/resource/position/:resourceType`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Position.Page} />
                    {positionOrderRoutes(match)}
                    {postionDetailRoutes(match)}
                </>
            )}
        />
    );
}
// 工位详情
export function postionDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/detail/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PositionDetail.Page} />
                    <router.Switch>
                        {loginRoutes(match)}
                        {orderedRoutes(match)}
                        {positionDetailCommentListRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
// 工位详情跳转预订
export function orderedRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/order/:dayPriceType/:roomid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PositionOrder.Page} />
                    <router.Switch>
                        {invoiceEditRoutes(match)}
                        {resourceOrderPayRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
// 工位列表跳转预订
export function positionOrderRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/order/:detailid/:roomid/:dayPriceType`}
            render={({ match }) => (
                <Route
                    path={`${match.path}`}
                    render={({ match }) => (
                        <>
                            <Route path={`${match.path}`} component={PositionOrder.Page} />
                            <router.Switch>
                                {invoiceEditRoutes(match)}
                                {resourceOrderPayRoutes(match)}
                            </router.Switch>
                        </>
                    )}
                />
            )}
        />
    );
}


// 空间园区印象工位详情
export function postionDetailsRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/resource/position/:resourceType/detail/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PositionDetail.Page} />
                    <router.Switch>
                        {loginRoutes(match)}
                        {orderedRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
export function postionSearchDetailsRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/postion/:resourceType/detail/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={PositionDetail.Page} />
                    <router.Switch>
                        {loginRoutes(match)}
                        {orderedRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}

export function orderPositionRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/orderPosition/:detailid/:roomid`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={PositionOrder.Page} />
                    <router.Switch>
                        {invoiceEditRoutes(match)}
                        {resourceOrderPayRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
export function orderDetailPositionRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/orderPositionDetail/:detailid/:roomid/:dayPriceType/:resourceType`}
            render={({ match }) => (
                <>
                    <Route path={`${match.path}`} component={PositionOrder.Page} />
                    <>
                        {invoiceEditRoutes(match)}
                        {resourceOrderPayRoutes(match)}
                        {deleteDataRoutes(match)}
                    </>
                </>
            )}
        />
    );
}

export function invoiceEditRoutes(match: router.match) {
    return <Route path={`${match.path}/invoice/edit/:id/:intype`} component={InvoiceEdit.Page}/>;
}

// 会议室
export function roomRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/resource/room/:resourceType`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={Room.Page} />
                    {roomDetailRoutes(match)}
                </>
            )}
        />
    );
}
// 会议室详情
export function roomDetailHomeRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/roomdetail/:resourceType/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={RoomDetail.Page} />
                    <router.Switch>
                        {roomOrderDetailRoutes(match)}
                        {loginRoutes(match)}
                        {roomDetailCommentListRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
// 会议室详情
export function roomDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/detail/:detailid`}
            render={({ match }) => (
                <>
                    <Route  path={match.path} component={RoomDetail.Page} />
                    <router.Switch>
                        {roomOrderDetailRoutes(match)}
                        {loginRoutes(match)}
                        {roomDetailCommentListRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
export function orderDetailRoomRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/orderRoomDetail/:detailid/:resourceType`}
            render={({ match }) => (
                <>
                    <Route  path={match.path} component={RoomDetail.Page} />
                    <router.Switch>
                        {roomOrderDetailRoutes(match)}
                        {loginRoutes(match)}
                        {roomDetailCommentListRoutes(match)}
                        {deleteDataRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
export function roomOrderDetailRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/details`}
            render={({ match }) => (
                <>
                    <Route onTouch={false} path={`${match.path}`} component={RoomOrderDetail.Page} />
                    <router.Switch>
                        {invoiceEditRoutes(match)}
                        {resourceOrderPayRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}

export function roomDetailSpaceRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/resource/room/:resourceType/detail/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={RoomDetail.Page} />
                    <router.Switch>
                        {roomOrderDetailRoutes(match)}
                        {loginRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}

export function roomSearchDetailSpaceRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/:resourceType/detail/:detailid`}
            render={({ match }) => (
                <>
                    <Route path={match.path} component={RoomDetail.Page} />
                    <router.Switch>
                        {roomOrderDetailRoutes(match)}
                        {loginRoutes(match)}
                    </router.Switch>
                </>
            )}
        />
    );
}
export function roomDetailCommentListRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/roomCommentList`}
            component={DetailCommentList.Page}
        />
    );
}

export function positionDetailCommentListRoutes(match: router.match) {
    return (
        <Route
            path={`${match.path}/positionCommentList`}
            component={DetailCommentList.Page}
        />
    );
}
