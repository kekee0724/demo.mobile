import { tmpl } from "./tmpl";

export const CELLPHONE_REGEXP = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
export const EMAIL_REGEXP = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
export const PASSWORD_REGEXP = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]).{8,32}$/;
function isEmptyInputValue(value: any): boolean {
    return value == null || value.length === 0;
}

export const Validators = {
    cellphone(control: RECO.Mobile.Validation.AbstractControl) {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return CELLPHONE_REGEXP.test(control.value) ? null : { cellPhone: { msg: "${name}格式错误。" } };
    },

    min(min: number): RECO.Mobile.Validation.ValidatorFn {
        return (control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null => {
            if (isEmptyInputValue(control.value) || isEmptyInputValue(min)) {
                return null;
            }
            const value = parseFloat(control.value);

            return !isNaN(value) && value < min ? { min: { min: min, actual: control.value, msg: "${name}最小值为${max}实际值为${actual}。" } } : null;
        };
    },

    max(max: number): RECO.Mobile.Validation.ValidatorFn {
        return (control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null => {
            if (isEmptyInputValue(control.value) || isEmptyInputValue(max)) {
                return null;
            }
            const value = parseFloat(control.value);

            return !isNaN(value) && value > max ? { max: { max: max, actual: control.value, msg: "${name}最大值为${max}实际值为${actual}。" } } : null;
        };
    },
    required(control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null {
        return isEmptyInputValue(control.value) ? { required: { msg: "${name}必填。" } } : null;
    },
    requiredTrue(control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null {
        return control.value === true ? null : { required: { msg: "${name}必选。" } };
    },
    email(control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null {
        if (isEmptyInputValue(control.value)) {
            return null;
        }
        return EMAIL_REGEXP.test(control.value) ? null : { email: { msg: "${name}格式错误。" } };
    },
    minLength(minLength: number): RECO.Mobile.Validation.ValidatorFn {
        return (control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null => {
            if (isEmptyInputValue(control.value)) {
                return null;
            }
            const length: number = control.value ? control.value.length : 0;
            return length < minLength
                ? { minlength: { requiredLength: minLength, actualLength: length, msg: "${name}最小长度为${requiredLength}实际长度为${actualLength}。" } }
                : null;
        };
    },
    maxLength(maxLength: number): RECO.Mobile.Validation.ValidatorFn {
        return (control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null => {
            const length: number = control.value ? control.value.length : 0;
            return length > maxLength
                ? { maxlength: { requiredLength: maxLength, actualLength: length, msg: "${name}最大长度为${requiredLength}实际长度为${actualLength}。" } }
                : null;
        };
    },
    pattern(pattern: string | RegExp): RECO.Mobile.Validation.ValidatorFn {
        if (!pattern) return Validators.nullValidator;
        let regex: RegExp;
        let regexStr: string;
        if (typeof pattern === "string") {
            regexStr = "";

            if (pattern.charAt(0) !== "^") regexStr += "^";

            regexStr += pattern;

            if (pattern.charAt(pattern.length - 1) !== "$") regexStr += "$";

            regex = new RegExp(regexStr);
        } else {
            regexStr = pattern.toString();
            regex = pattern;
        }
        return (control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null => {
            if (isEmptyInputValue(control.value)) {
                return null;
            }
            const value: string = control.value;
            return regex.test(value) ? null : { pattern: { requiredPattern: regexStr, actualValue: value, msg: "${name}格式错误。" } };
        };
    },
    nullValidator(_control: RECO.Mobile.Validation.AbstractControl): RECO.Mobile.Validation.ValidationErrors | null {
        return null;
    },

    compose(validators: (RECO.Mobile.Validation.ValidatorFn | null | undefined)[] | null): RECO.Mobile.Validation.ValidatorFn | null {
        if (!validators) return null;
        const presentValidators: RECO.Mobile.Validation.ValidatorFn[] = validators.filter(isPresent) as any;
        if (presentValidators.length === 0) return null;

        return function (control: RECO.Mobile.Validation.AbstractControl) {
            return _mergeErrors(control, _executeValidators(control, presentValidators));
        };
    },
    composeControl(validators: (RECO.Mobile.Validation.ValidatorFn | null | undefined)[] | null, control: RECO.Mobile.Validation.AbstractControl) {
        if (!validators || !control) return null;
        const presentValidators: RECO.Mobile.Validation.ValidatorFn[] = validators.filter(isPresent) as any;
        if (presentValidators.length === 0) return null;

        return function () {
            return _mergeErrors(control, _executeValidators(control, presentValidators));
        };
    },
    ValidatorControl(...validators: ((() => RECO.Mobile.Validation.ValidationErrors | null) | null | undefined)[]) {
        const presentValidators: (() => RECO.Mobile.Validation.ValidationErrors | null)[] = validators.filter(isPresent) as any;

        if (presentValidators.length === 0) return null;

        return function () {
            for (const validator of presentValidators) {
                if (typeof validator === "function") {
                    const d = validator();

                    if (d) return d.msg;
                }
            }
        };
    },
    ValidatorControlAll(...validators: ((() => RECO.Mobile.Validation.ValidationErrors | null) | null | undefined)[]) {
        const presentValidators: (() => RECO.Mobile.Validation.ValidationErrors | null)[] = validators.filter(isPresent) as any;

        if (presentValidators.length === 0) return null;

        return function () {
            return presentValidators.map((v) => (v as any)()).reduce((a, b) => (b && a.push(...b.msg), a), []);
        };
    },
};

function isPresent(o: any): boolean {
    return o != null;
}

function _executeValidators(control: RECO.Mobile.Validation.AbstractControl, validators: RECO.Mobile.Validation.ValidatorFn[]): any[] {
    return validators.map((v) => (typeof control.value === "function" && (control.value = control.value()), v(control)));
}

function _mergeErrors(control: RECO.Mobile.Validation.AbstractControl, arrayOfErrors: RECO.Mobile.Validation.ValidationErrors[]): RECO.Mobile.Validation.ValidationErrors | null {
    const res: { [key: string]: any } = arrayOfErrors.reduce(
            (res: RECO.Mobile.Validation.ValidationErrors | null, errors: RECO.Mobile.Validation.ValidationErrors | null) => {
                return errors != null ? { ...res!, ...errors } : res!;
            },
            { msg: [] }
        ),
        keys = Object.keys(res);

    return keys.length <= 1
        ? null
        : (keys.forEach((key) => {
              if (key !== "msg") {
                  const error = res[key];

                  res.msg.push(tmpl((control.errors && control.errors[key]) || error.msg, { ...error, ...control }));
              }
          }),
          res);
}
