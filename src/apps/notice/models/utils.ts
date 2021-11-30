/**
 * 根据url获取指定key的value
 * @param url url
 * @param paramName key
 */
export function getParam(url, paramName) { 
    let x = url.split("?")[1]
    let y = x.split("&");
    let res = "";
    y.forEach(e => {
        if (e.indexOf(paramName + "=") > -1) {
            res = e.split(paramName + "=")[1]
        }
    });
    return res
} 