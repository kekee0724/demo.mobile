import { getChineseHeadLetter } from "./letterlist";
import { JSEncrypt } from "jsencrypt";

export function multiLineText(text?: string) {
    return text && text.replace(/\n/g, "<br/>");
}

export function getAvatar(name: string, avatar?: string) {
    if (avatar) {
        return avatar.toUpperCase();
    } else {
        let letter = getChineseHeadLetter(name);
        return letter ? (letter.length === 1 ? letter.toUpperCase() : letter.toUpperCase().slice(0, 1)) : "";
    }
}

/**
 * 加密
 * @param source
 * @returns crypt
 */
export function crypt(source: string): string {
    if (!source || !(server["rsa"] && server["rsa"].enable && server["rsa"].publicKey)) {
        return source;
    }
    const crypt = new JSEncrypt({});
    crypt.setPublicKey(server["rsa"] && server["rsa"].publicKey);
    return crypt.encrypt(source) as string;
    // return source;
}
/**
 * 解密
 * @param source
 * @returns crypt
 */
 export function decrypt(source: string): string {
    if (!source || !(server["rsa"] && server["rsa"].enable && server["rsa"].privateKey)) {
        return source;
    }
    const crypt = new JSEncrypt({});
    crypt.setPrivateKey(server["rsa"] && server["rsa"].privateKey);

    return crypt.decrypt(source) as string;
    // return source;
}