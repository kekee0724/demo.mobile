function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    let up = 0;
    for (let i = parts.length - 1; i >= 0; i--) {
        const last = parts[i];
        if (last === ".") {
            parts.splice(i, 1);
        } else if (last === "..") {
            parts.splice(i, 1);
            up++;
        } else if (up) {
            parts.splice(i, 1);
            up--;
        }
    }

    if (allowAboveRoot) {
        for (; up--; up) {
            parts.unshift("..");
        }
    }
    return parts;
}

export function resolvePath(...args: string[]) {
    let resolvedPath = "",
        resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        const path = i >= 0 ? args[i] : process.cwd();

        if (typeof path !== "string") {
            throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
            continue;
        }

        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path.charAt(0) === "/";
    }

    resolvedPath = normalizeArray(
        filter(resolvedPath.split("/"), function(p) {
            return !!p;
        }),
        !resolvedAbsolute
    ).join("/");

    return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
}

function filter(xs: any[], f) {
    if (xs.filter) return xs.filter(f);
    const res: any = [];
    for (let i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}
