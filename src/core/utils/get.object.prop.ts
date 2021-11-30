import { get } from "lodash";

export function getObjectProp<R>(obj: any, path: string, value?: R): R {
    return get(obj, path, value);
}
