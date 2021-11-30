import React from "react";

export enum Namespaces {
  bill = "bill",
  billDetails = "billDetails"
}
/**
 * 企业账单来源
 */
 export enum BusinessBillSourceEnum {
  /**
   * 欠费
   */
  Background = 1,
  /**
   * 未付清
   */
  Web = 2,
  /**
   * 已付清
   */
  App = 3,
}
/**
 * 企业账单状态
 */
export enum BusinessBillPaymentStatusEnum {
  /**
   * 欠费
   */
  ARREARS = -1,
  /**
   * 未付清
   */
  UNPAID = 1,
  /**
   * 已付清
   */
  PAID = 2,
}

export const tabs = [
  { title: "全部", status: null },
  { title: "欠费", status: BusinessBillPaymentStatusEnum.ARREARS },
  { title: "未付清", status: BusinessBillPaymentStatusEnum.UNPAID },
  { title: "已付清", status: BusinessBillPaymentStatusEnum.PAID },
];

/**
 * 判断两个日期间相差的天数
 * @param sDate1
 * @param sDate2
 * @param isabs 是否取绝对值，默认为true
 */
export function dateDifference(sDate1, sDate2, isabs = true) {
  // sDate1和sDate2是2006-12-18格式
  let dateSpan, iDays;
  sDate1 = Date.parse(sDate1);
  sDate2 = Date.parse(sDate2);
  dateSpan = sDate2 - sDate1;
  isabs ? (dateSpan = Math.abs(dateSpan)) : dateSpan;
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  return iDays;
}


export function getStatusText(status: number) {
  switch (status) {
    case BusinessBillPaymentStatusEnum.ARREARS:
      return <div className="color-cancel">欠费</div>;
    case BusinessBillPaymentStatusEnum.UNPAID:
      return <div className="color-failure">未付清</div>;
    case BusinessBillPaymentStatusEnum.PAID:
      return <div className="color-success">已付清</div>;
    default:
      return "";
  }
}
