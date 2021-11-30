class BaseException extends Error {
    constructor(message = "") {
        super(message);
    }
}

module.exports.BaseException = BaseException;

class InvalidPathException extends BaseException {
    constructor(path) {
        super(`Path ${JSON.stringify(path)} is invalid.`);
    }
}

module.exports.InvalidPathException = InvalidPathException;

const NormalizedSep = "/",
    NormalizedRoot = NormalizedSep;

function join(p1, ...others) {
    if (others.length > 0) {
        return normalize((p1 ? p1 + NormalizedSep : "") + others.join(NormalizedSep));
    } else {
        return p1;
    }
}

module.exports.join = join;

function isAbsolute(p) {
    return p.startsWith(NormalizedSep);
}

module.exports.isAbsolute = isAbsolute;

function resolve(p1, p2) {
    if (isAbsolute(p2)) {
        return p2;
    } else {
        return join(p1, p2);
    }
}

module.exports.resolve = resolve;

let normalizedCache = new Map();

function resetNormalizeCache() {
    normalizedCache = new Map();
}

module.exports.resetNormalizeCache = resetNormalizeCache;

function normalize(path) {
    let maybePath = normalizedCache.get(path);
    if (!maybePath) {
        maybePath = noCacheNormalize(path);
        normalizedCache.set(path, maybePath);
    }

    return maybePath;
}

module.exports.normalize = normalize;

/**
 * The no cache version of the normalize() function. Used for benchmarking and testing.
 */
function noCacheNormalize(path) {
    if (path === "" || path === ".") {
        return "";
    } else if (path === NormalizedRoot) {
        return NormalizedRoot;
    }

    // match absolute windows path.
    const original = path;
    if (path.match(/^[A-Z]:[\/\\]/i)) {
        path = "\\" + path[0] + "\\" + path.substr(3);
    }

    // we convert Windows paths as well here.
    const p = path.split(/[\/\\]/g);
    let relative = false;
    let i = 1;

    // special case the first one.
    if (p[0] !== "") {
        p.unshift(".");
        relative = true;
    }

    while (i < p.length) {
        if (p[i] === ".") {
            p.splice(i, 1);
        } else if (p[i] === "..") {
            if (i < 2 && !relative) {
                throw new InvalidPathException(original);
            } else if (i >= 2 && p[i - 1] !== "..") {
                p.splice(i - 1, 2);
                i--;
            } else {
                i++;
            }
        } else if (p[i] === "") {
            p.splice(i, 1);
        } else {
            i++;
        }
    }

    if (p.length === 1) {
        return p[0] === "" ? NormalizedSep : "";
    } else {
        if (p[0] === ".") {
            p.shift();
        }

        return p.join(NormalizedSep);
    }
}

module.exports.noCacheNormalize = noCacheNormalize;

function asWindowsPath(path) {
    const drive = path.match(/^\/(\w)(?:\/(.*))?$/);
    if (drive) {
        const subPath = drive[2] ? drive[2].replace(/\//g, "\\") : "";

        return `${drive[1]}:\\${subPath}`;
    }

    return path.replace(/\//g, "\\");
}

module.exports.asWindowsPath = asWindowsPath;

function asPosixPath(path) {
    return path;
}

module.exports.asPosixPath = asPosixPath;

function getSystemPath(path) {
    if (process.platform.startsWith("win32")) {
        return asWindowsPath(path);
    } else {
        return asPosixPath(path);
    }
}

module.exports.getSystemPath = getSystemPath;
