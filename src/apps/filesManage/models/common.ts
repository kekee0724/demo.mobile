export enum Namespaces {
    filesmanage = "filesmanage",
    filessubpage = "filessubpage",
    filespreview = "filespreview"
}
/**
 * 文件列表是否有附件
 */
export enum FileTypeEnum {
    /**
     * 有
     */
    yes = 1,
    /**
     * 无
     */
    no = 0,
}
/**
 * 文件列表类型
 */
export enum FileListTypeEnum {
    /**
     * 完全控制
     */
    fileControl = 1,
    /**
     * 下载
     */
    fileDownload = 2,
    /**
     * 上传
     */
    fileUpload = 3,
    /**
     * 浏览
     */
    fileView = 4
}