import { HttpService, resolveService, isAnonymous } from "@reco-m/core";
export class AuthHttpService extends HttpService {
    protected currentUserPromise: any;
    protected currentUserEditPromise: Promise<any> | null;

    constructor() {
        super("authorization/oauth2");
    }

    getCurrentUser(data?: any) {
        if (!isAnonymous()) {
            this.currentUserPromise || (this.currentUserPromise = this.httpGet("current-user", this.resolveRequestParams(data)));
        }

        return this.currentUserPromise || Promise.resolve({});
    }


    clearCurrentUser() {
        delete this.currentUserPromise;
    }

    refreshCurrentUser(data?: any) {
        return this.clearCurrentUser(), this.getCurrentUser(data);
    }


    logout() {
        this.clearCurrentUser();

        return this.http.logout();
    }
}

export const authService = resolveService(AuthHttpService);
