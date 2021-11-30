import { getDate, formatDateTimeSend } from "@reco-m/core";
import { InvoiceTitleTypeEnum, ComOrPerTitleTypeEnum } from "@reco-m/ipark-common";
export function getRequestParams(props: any, callback: (start, end) => void, startDate?: any, endDate?: any) {
  let { resourceType, roomid } = props.match!.params;
  let params = {
    resourceType: resourceType,
    roomId: [roomid]
  };
  let start = decodeURI(startDate);
  let end = decodeURI(endDate);
  params = Object.assign(params, {
    startDate: start && formatDateTimeSend(getDate(start)!),
    endDate: end && formatDateTimeSend(getDate(end)!)
  });
  callback(start, end);
  return params;
}

export const invoiceSubject = [{ label: "增值税专用发票", value: InvoiceTitleTypeEnum.speciallyInvoice }, { label: "增值税普通发票", value: InvoiceTitleTypeEnum.commonInvoice }];

export const comOrPerSubject = [{ label: "公司", value: ComOrPerTitleTypeEnum.company }, { label: "个人", value: ComOrPerTitleTypeEnum.person }];
