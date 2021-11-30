export enum Namespaces {
    set = "set",
    about = "about",
    infoset = "infoset",
    aboutversion = "aboutversion"
}
/**
 * 更新版本类型
 */
export enum editionTypeEnum {
    /**
     * 服务端
     */
    service = 1,
    /**
     * 运营端
     */
    operate = 2
}
/**
 * 更新方式
 */
export enum updateTypeEnum {
    /**
     * 全局更新
     */
    overall = 1,
    /**
     * 热更新
     */
    hotUpdate = 5,
}