import { Toast, Modal } from "antd-mobile-v2";
import { MemberRoleEnum, CertifyStatusEnum } from "@reco-m/member-models";
import { getLocalStorage } from "@reco-m/core";
// 判断是否有权限使用，首页和服务
export function isCertify(currentMember: any, itemName: string, goCertify) {
    if (
        itemName.indexOf("会议室预订") === 0 ||
        itemName.indexOf("工位预订") === 0 ||
        itemName.indexOf("广告位预订") === 0 ||
        itemName.indexOf("场地预订") === 0 ||
        itemName.indexOf("物业报修") === 0 ||
        itemName.indexOf("通讯录") === 0 ||
        itemName.indexOf("需求提报") === 0 ||
        itemName.indexOf("物业投诉") === 0 ||
        itemName.indexOf("停车位申请") === 0 ||
        itemName.indexOf("通讯录") === 0
    ) {
        if ((currentMember && currentMember.status === CertifyStatusEnum.nocertify) || !currentMember || !currentMember.id) {
            // 未认证
            return unCertify(itemName, goCertify);
        } else if (currentMember && currentMember.status === CertifyStatusEnum.noConfim) {
            // 待确认
            Toast.fail("您的认证申请正在审核，请审核通过后使用", 1);
            return false;
        } else if (currentMember && currentMember.status === CertifyStatusEnum.allow) {
            // 已通过
            return true;
        } else {
            // 已退回
            Toast.fail("您的认证申请已退回，请审核通过后使用", 1);
            return false;
        }
    }
    return true;
}
export function isCertifyMeeting(currentMember: any, itemName: string) {
    if (itemName.indexOf("会议室预订") === 0) {
        if (currentMember.memberRoleId === MemberRoleEnum.common && (!currentMember.certify || currentMember.certify.length === 0)) {
            Toast.fail("请审核通过后使用", 1);
            return false;
        } else {
            const certify = currentMember.certify?.find((c) => Number(c.parkId) === Number(getLocalStorage("parkId")));

            if (certify) {
                if (certify.IsValid === undefined) {
                    Toast.fail("您的认证申请正在审核，请审核通过后使用", 1);
                    return false;
                }

                if (certify.IsValid === false) {
                    if (certify.CancelStatus) {
                        Toast.fail("请审核通过后使用", 1);
                    } else {
                        Toast.fail("您的认证申请已退回，请审核通过后使用", 1);
                        return false;
                    }
                }
            } else {
                Toast.fail("请审核通过后使用", 1);
                return false;
            }
        }
    }

    return true;
}

export function unCertify(itemName, goCertify) {
    Modal.alert("操作提示", `${itemName}功能只对企业用户开放，是否去认证企业？`, [
        { text: "取消" },
        {
            text: "认证",
            onPress: () => {
                goCertify();
            },
        },
    ]);
    return false;
}
