import { checkCh } from "@reco-m/core";

export enum Namespaces {
    contact = "iparkcontact",
    contactDetail = "iparkcontactDetail"
}


function getChineseHeadLetter(str) {
    if (typeof str !== "string") return;
    // 保存中间结果的数组

    // 获得unicode码
    let ch = str.charAt(0);
    // 检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理
    let s = checkCh(ch);

    // 处理arrResult,返回所有可能的拼音首字母串数组
    return s.toLowerCase();
}

export function initContactData(contacts: any) {
    let contactsArray = new Array(27);

    for (let i = 0; i < 27; i++) {
        contactsArray[i] = [];
    }

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i],
            realName = contact.realName,
            headLetter = realName && getChineseHeadLetter(realName).toUpperCase();

        realName && headLetter >= "A" && headLetter <= "Z" ? contactsArray[headLetter.charCodeAt(0) - 65].push(contact) : contactsArray[26].push(contact);
    }

    return contactsArray;
}
