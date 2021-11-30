export enum Namespaces {
    space = "space",
    spacedetail = "spacedetail",
}

export const spaceCounters = {
    spaceChangeCounter: 0,
};
/**
 * 单位价格
 */
export enum SpaceResouceTypeEnum {
    /**
     * 会议室
     */
    meeting = 0,
    /**
     * 工位
     */

    workStation = 1,
    /**
     * 场地
     */
    spaceRoom = 2,
    /**
     * 广告位
     */
    adStation = 3,
}
/**
 * 单位价格
 */
export enum DayPriceTypeEnum {
    /**
     * 天
     */
    day = 1,
    /**
     * 月
     */
    month = 2,
}
/**
 * 资源名称
 */
export enum ResourceTypeNameEnum {
    meettingRoom = "会议室",
    workStation = "工位",
    adStation = "广告位",
    spaceRoom = "场地",
}

export enum CurrentTabIndexEnum {
    one = 0,
    two = 1,
    three = 2,
    four = 3,
}
