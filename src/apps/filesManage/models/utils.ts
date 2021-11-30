/**
 * 处理过的文件列表
 */
export let dataSources: any = [];
/**
 * 附件类型
 */
export const supportTypes = ["doc", "docx", "wps", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "gif", "png", "bmp", "pdf", "jpeg", "txt"];
/**
 * 计算文件大小
 */
export function computeSize(data: any) {
    let sizedata = (+data / 1024).toFixed(2);
    let size = "";
    if (+sizedata.split(".")[0] > 1024) {
        size = (+data / 1024 / 1024).toFixed(2) + "M";
    } else {
        size = (+data / 1024).toFixed(2) + "K";
    }
    return size;
}

export function initDataSource() {
    return null;
}
