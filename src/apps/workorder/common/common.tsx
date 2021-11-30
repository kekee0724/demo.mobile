import { Modal } from "antd-mobile-v2";
import { CommentAuditStatusEnum } from "@reco-m/ipark-common";
// 城市返回的数据转换为picker能显示的格式
export function translateCity(tagsArea: any, valueType?: boolean) {
    let layer0: any = [],
        layer1: any = [];

    for (let i = 0; i < tagsArea.length; i++) {
        tagsArea[i].label = tagsArea[i].tagName;
        tagsArea[i].value = valueType ? tagsArea[i].id : tagsArea[i].id + "," + tagsArea[i].tagName;

        tagsArea[i].layer === 0 ? layer0.push(tagsArea[i]) : tagsArea[i].layer === 1 && layer1.push(tagsArea[i]);
    }

    for (let i = 0; i < layer0.length; i++) {
        layer0[i].children = [];

        for (let j = 0; j < layer1.length; j++) layer1[j].ParentID === layer0[i].id && layer0[i].children.push(layer1[j]);
    }

    return layer0;
}

export function goToBack(isEdit: any, goBack: any) {
    if (isEdit) {
        Modal.alert("操作提示", `当前信息未提交，是否继续退出？`, [
            { text: "取消" },
            {
                text: "退出",
                onPress: () => {
                    goBack();
                }
            }
        ]);
    } else {
        goBack();
    }
}

/**
 * 获取评论审核状态
 * @param status
 * @param type
 * @returns
 */
 export function getCommentAuditStatus(status, type: "label" | "class" = "label") {
    switch (status) {
        case CommentAuditStatusEnum.waitAudit:
            return type === "class" ? "5" : "待审核";
        case CommentAuditStatusEnum.fail:
            return type === "class" ? "4" : "审核退回";
        case CommentAuditStatusEnum.pass:
            return type === "class" ? "3" : "审核通过";
        default:
            return "--";
    }
}
