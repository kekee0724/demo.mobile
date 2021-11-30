import { postBridgeMessage } from "./browser";

/**
 * file转为FormData, 附件上传用
 * @param file 
 */
export function createData(file: any) {
  const formData = new FormData();
  let date = new Date();
  let fileName = `file${date.format("yyyyMMddhhmmss")}` + (/^.*?(\.\w+)$/.exec(file!.name)![1] || "");
  formData.append("id", file!.lastModified);
  formData.append("name", fileName);
  formData.append("type", file!.type);
  formData.append("lastModifiedDate", file!.lastModifiedDate || new Date());
  formData.append("size", file!.size);
  formData.append("file", file, fileName);
  return formData;
}

export function dataURLtoFile(dataurl: string, filename: string, suffix: string){
  if (dataurl) {
      const arr = dataurl && dataurl.split(","),
          mime = arr![0]!.match(/:(.*?);/)![1],
          bstr = atob(arr[1]);

      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
      }
      let date = new Date();
      return new File([u8arr], `${filename}${date.format("yyyyMMddhhmmss")}.${suffix}`, { type: mime });
  } else {
      return "";
  }
}

// 获取音频录音
export function startRecord() {
  let result: Promise<any> | null = null;
  // // 模拟获取音频录音
  // // 有数据测试
  // let file = dataURLtoFile(audioData, "测试");
  // result = Promise.resolve(file);
  // return result;
  // 正式获取音频录音
  result = postBridgeMessage("startRecord");
  if (result) {
    return result.then(({ data, name }) => {
      if (data) {
        let file = dataURLtoFile(data, name, "wav");
        return file;
      } else {
        return "";
      }

      // return createData(file, postdata);
    });
  } else {
    return "";
  }
}

// 结束音频录音
export function stopRecord() {
  let result: Promise<any> | null = null;
  result = postBridgeMessage("stopRecord");
  if (result) {
    return result.then(data => {
      return data;
    });
  }
}

// 判断是否有麦克风权限
export function chargeMicrophone() {
  // return true;
  let result: Promise<any> | null = null;
  result = postBridgeMessage("chargeMicrophone");
  if (result) {
    return result.then(data => {
      return data;
    });
  }
}
