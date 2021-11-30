export enum Namespaces {
    user = "user",
    login = "login",
    app = "app",
    accountsafe = "accountsafe",
    gestures = "gestures",
    changepassword = "changepassword",
    accountMobile = "accountMobile",
    accountBindMobile = "accountBindMobile",
    pwd = "pwd",
    accountinfo = "accountinfo"
}
/**
 * 登录方式
 */
export enum LoginTypeEnum {
    /**
     * 验证码
     */
    sms,
    /**
     * 账号密码
     */
    pwd
}
/**
 * 性别
 */
export enum GenderTypeValesEnum {
    /**
     * 男
     */
    man = 1,
    /**
     * 女
     */
    woman = 2
}
/**
 * 显示手势轨迹
 */
export enum SignTypeEnum {
    /**
     * 显示
     */
    modify = 1,
    /**
     * 不显示
     */
    noiModify = 0
}
/**
 * 密码输入框类型
 */
export enum PasswordTypeEnum {
    /**
     * 密码
     */
    password = "password",
    /**
     * 文本
     */
    text = "text"
}
/**
 * 密码操作类型 
 */
export enum PasswordChangeTypeEnum {
    /**
     * 找回密码
     */
    unAuth = "unAuth",
    /**
     * 修改密码
     */
    auth = "Auth"
}

/**
 * 账号安全导航操作 
 */
export enum AccountSecurityEnum {
    /**
     * 换绑手机
     */
    changeMobile = 0,
    /**
     * 登录密码
     */
    changePassword = 1,
    /**
    * 社交账号
    */
    social = 2
}
/**
 * 修改密码操作框
 */
 export enum PasswordChangeInputEnum {
    /**
     * 新密码
     */
    newPassword = 1,
    /**
     * 确认密码
     */
     confirm = 2
 }
/**
 * 业务表名
 */
 export enum BindTableNameEnum {
    /**
     * 用户
     */
    account = "sys_account",
  }
  