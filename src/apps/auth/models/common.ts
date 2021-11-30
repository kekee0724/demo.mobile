export enum Namespaces {
    authbindmodal = "authbindmodal",
    accountEdit = "accountEdit",
}
/**
 * 登录类型
 */
export enum LoginTypeEnum {
    /**
     * 手机号登录
     */
    phone = 1,
    /**
     * 账号密码登录
     */
    account = 2
}
export const SceneCodes = ["WORKORDER", "ParkPush", "InteractiveMessage"];

export function judgeInfo(state: any) {
    let writeCount: number = 0;
    const thumb = state!.thumb,
        birthday = state!.birthday,
        email = state!.email,
        nickName = state!.nickName,
        gender = state!.gender,
        guoj = state!.guoj,
        minz = state!.minz,
        huny = state!.huny,
        jiax = state!.jiax,
        zhengzmm = state!.zhengzmm,
        xuel = state!.xuel,
        xuew = state!.xuew,
        zhic = state!.zhic,
        zhuanyfx = state!.zhuanyfx,
        getTagApplyInfos = state!.getTagApplyInfos,
        idiograph = state!.idiograph;
    if (thumb.id) {
        writeCount += 1;
    }
    if (birthday) {
        writeCount += 1;
    }
    if (email) {
        writeCount += 1;
    }
    if (nickName) {
        writeCount += 1;
    }
    if (gender !== 0) {
        writeCount += 1;
    }
    if (getTagApplyInfos.length > 0) {
        writeCount += 1;
    }
    if (guoj.name) {
        writeCount += 1;
    }
    if (minz.name) {
        writeCount += 1;
    }
    if (huny.name) {
        writeCount += 1;
    }
    if (zhengzmm.name) {
        writeCount += 1;
    }
    if (xuel.name) {
        writeCount += 1;
    }
    if (xuew.name) {
        writeCount += 1;
    }
    if (zhuanyfx.name) {
        writeCount += 1;
    }
    if (zhic.name) {
        writeCount += 1;
    }
    if (idiograph) {
        writeCount += 1;
    }
    if (jiax.name) {
        writeCount += 1;
    }
    return writeCount;
}
