import React from "react";

import { Badge } from "antd-mobile-v2";

import { InvoiceTypeEnum, InvoiceEnum } from "@reco-m/invoice-models";

export const tabs = () => [
    { title: <Badge>全部</Badge>, status: InvoiceTypeEnum.all },
    { title: <Badge>预登记</Badge>, status: InvoiceTypeEnum.regist },
    { title: <Badge>待开票</Badge>, status: InvoiceTypeEnum.billWait },
    { title: <Badge>已开票</Badge>, status: InvoiceTypeEnum.billSuccess },
    { title: <Badge>已取消</Badge>, status: InvoiceTypeEnum.cancelBill }
];

export function readerBadge(invoiceStatusID: number): React.ReactNode {
    return (
        <>
            {invoiceStatusID === +InvoiceTypeEnum.regist ? <span className="color-waiting">预登记</span> : ""}
            {invoiceStatusID === +InvoiceTypeEnum.billWait ? <span className="color-failure">待开票</span> : ""}
            {invoiceStatusID === +InvoiceTypeEnum.cancelBill ? <span className="color-cancel">已取消</span> : ""}
            {invoiceStatusID === +InvoiceTypeEnum.billSuccess ? <span className="color-success">已开票</span> : ""}
        </>
    );
}
export function readerBadgeText(invoiceStatusID: number): React.ReactNode {
    return (
        <>
            {invoiceStatusID === +InvoiceTypeEnum.regist ? <span>预登记</span> : ""}
            {invoiceStatusID === +InvoiceTypeEnum.billWait ? <span>待开票</span> : ""}
            {invoiceStatusID === +InvoiceTypeEnum.cancelBill ? <span>开票取消</span> : ""}
            {invoiceStatusID === +InvoiceTypeEnum.billSuccess ? <span>已开票</span> : ""}
        </>
    );
}
export function readerInvoiceType(InvoiceType: number): React.ReactNode {
    return (
        <>
            {InvoiceType === InvoiceEnum.generalInvoice ? <span>增值税普通发票</span> : ""}
            {InvoiceType === InvoiceEnum.specialInvoice ? <span>增值税专用发票</span> : ""}
            {InvoiceType === InvoiceEnum.personalInvoice ? <span>个人普通发票</span> : ""}
        </>
    );
}

