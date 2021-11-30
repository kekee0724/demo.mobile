import React from "react";
import { CertifyStatusEnum } from "@reco-m/member-models";

export function getStatus(status: number): React.ReactNode {
    switch (status) {
        case CertifyStatusEnum.noConfim:
            return <div className="wait-color">待审核</div>;
        case CertifyStatusEnum.allow:
            return <div className="success-color">已通过</div>;
        case CertifyStatusEnum.bounced:
            return <div className="error-color">已退回</div>;
        default:
            return null;
    }
}

export const tabs = () => [
    { title: "全部", Status: null },
    { title: "待审核", Status: CertifyStatusEnum.noConfim },
    { title: "已通过", Status: CertifyStatusEnum.allow },
    { title: "已退回", Status: CertifyStatusEnum.bounced }
];
