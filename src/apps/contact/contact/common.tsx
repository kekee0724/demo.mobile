import { Modal } from "antd-mobile-v2";

import { CertifyEnum } from "@reco-m/ipark-common";

export function getRoleName(permissions: any) {
    let type = "";

    for (let i = 0; i < (permissions && permissions.length); i++) {
        let permission = permissions[i];
        if (permission.id === CertifyEnum.companyStaff) {
            type += "企业员工,";
        } else if (permission.id === CertifyEnum.admin) {
            type += "企业管理员,";
        } else if (permission.id === CertifyEnum.businessAdmin) {
            type += "业务管理员,";
        }
    }
    if (type.length > 0) type = type.slice(0, type.length - 1);

    return type;
}

export function callTel(tel: string) {
    Modal.alert("拨号提示", `您确定要拨打${tel}？`, [
        {
            text: "取消",
            onPress: () => {}
        },
        {
            text: "确认",
            onPress: () => {
                window.location.href = "tel:" + tel;
            }
        }
    ]);
}
