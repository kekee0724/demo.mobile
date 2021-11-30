import { ComOrPerTitleTypeEnum } from "@reco-m/ipark-common";
export enum Namespaces {
    invoice = "invoice",
    invoiceDetail = "invoiceDetail",
    invoiceTitle = "invoiceTitle",
    invoiceTitleEdit = "invoiceTitleEdit",
    invoiceSelect = "invoiceSelect",
}

import { InvoiceTitleTypeEnum } from "@reco-m/ipark-common";
/**
 * 发票状态
 */
export enum InvoiceTypeEnum {
    /**
     * 全部
     */
    all = "",
    /**
     * 预登记
     */
    regist = "0",
    /**
     * 已开票
     */
    billSuccess = "2",
    /**
     * 待开票
     */
    billWait = "1",
    /**
     * 已取消
     */
    cancelBill = "-1",
}
/**
 * 发票类型
 */
export enum InvoiceEnum {
    /**
     *增值税普通发票
     */
    generalInvoice = 1,
    /**
     *增值税专用发票
     */
    specialInvoice = 2,
    /**
     *个人普通发票
     */
    personalInvoice = 3,
}

export const invoiceSubject = [
    { label: "增值税专用发票", value: InvoiceTitleTypeEnum.speciallyInvoice },
    { label: "增值税普通发票", value: InvoiceTitleTypeEnum.commonInvoice },
];

export const comOrPerSubject = [
    { label: "公司", value: ComOrPerTitleTypeEnum.company },
    { label: "个人", value: ComOrPerTitleTypeEnum.person },
];
