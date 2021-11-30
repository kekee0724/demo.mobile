import { socialType } from "@reco-m/core-ui";
import { GenderTypeValesEnum } from "./common";

/**
 * 性别
 */
export const genderTypes: any = [{ label: "男", value: GenderTypeValesEnum.man }, { label: "女", value: GenderTypeValesEnum.woman }];
/**
 * 操作导航
 */
export const accountItems = [{ itemName: "换绑手机", url: "changeMobile" }, { itemName: "登录密码", url: "changePassword/Auth" }, { itemName: "社交账号", url: "social" }];
/**
 * 绑定类型
 */
export const accountSocialItems = [
    { itemName: "微信", code: socialType.WeChat, itemIcon: "weChat color-wechat" },
    { itemName: "QQ", code: socialType.QQ, itemIcon: "QQ color-qq" }
    // { itemName: "微博", code: socialType.WeiBo, itemIcon: "weiBo color-weiBo" }
];
