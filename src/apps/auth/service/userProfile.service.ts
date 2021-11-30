import { HttpService, resolveService } from "@reco-m/core";

export class UserProfileHttpService extends HttpService {
    protected avatarPromise: Promise<any> | null;

    constructor() {
        super("authorization/profile");
    }

    getHeadImage(): Promise<any> {
        if (!this.avatarPromise) {
            (this.avatarPromise = this.httpGet("get")).finally(() => (this.avatarPromise = null));
        }

        return this.avatarPromise as Promise<any>;
    }
}

export const userProfileService = resolveService(UserProfileHttpService);



export class PersonInfoHttpService extends HttpService {
    constructor() {
        super("contact-personal/contact-personal");
    }
    saveInfo(data) {
        return this.httpPost("contact-person", data);
    }
    getInfo(data) {
        return this.httpGet("contact-person", this.resolveRequestParams(data));
    }
    modifyInfo(id, data) {
        return this.httpPut("modify-contact-person/" + id, data);
    }
}

export const PersonInfoService = resolveService(PersonInfoHttpService);

export class AuthAccountHttpService extends HttpService {
    currentUser: any;
    constructor() {
        super("authorization/account");
    }
    put(id, param) {
        return this.httpPut("" + id, param);
    }
    sendEditMobileCode(data) {
        return this.httpPut("send-edit-mobile-code", data)
    }
    editMobile(data) {
        return this.httpPut("edit-mobile", data)
    }
    sendGuestResetPwd(data) {
        return this.httpPut("send-guest-reset-pwd", data)
    }
    guestResetPwd(data) {
        return this.httpPut("guest-reset-pwd", data)
    }
    resetPwd(data) {
        return this.httpPut("reset-pwd", data)
    }
}

export const authAccountHttpService = resolveService(AuthAccountHttpService);
