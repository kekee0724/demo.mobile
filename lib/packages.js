const { execSync } = require("child_process"),
    crypto = require("crypto"),
    fs = require("fs"),
    ts = require("typescript"),
    path = require("path"),
    glob = require("glob"),
    distRoot = path.join(__dirname, "../dist-pkg"),
    { packages: monorepoPackages, ignore: ignoreApps, build: buildApps } = require("../.monorepo.json"),
    hashCache = {};

function _getHashOf(pkg) {
    if (!(pkg.name in hashCache)) {
        hashCache[pkg.name] = null;
        const md5Stream = crypto.createHash("md5");

        // update the stream with all files content.
        const files = glob.sync(path.join(pkg.root, "**"), { nodir: true });
        files.forEach(filePath => {
            md5Stream.write(`\0${filePath}\0`);
            md5Stream.write(fs.readFileSync(filePath));
        });
        // update the stream with all versions of upstream dependencies.
        pkg.dependencies.forEach(depName => {
            md5Stream.write(`\0${depName}\0${_getHashOf(packages[depName])}\0`);
        });

        md5Stream.end();

        hashCache[pkg.name] = md5Stream.read().toString("hex");
    }

    const value = hashCache[pkg.name];
    if (!value) {
        // protect against circular dependency.
        throw new Error(
            "Circular dependency detected between the following packages: " +
                Object.keys(hashCache)
                    .filter(key => hashCache[key] == null)
                    .join(", ")
        );
    }

    return value;
}

function loadPackageJson(p) {
    // tslint:disable-next-line:no-require-imports
    const root = require("../package.json");
    const pkg = require(p);

    for (const key of Object.keys(root)) {
        switch (key) {
            // keep the following keys from the package.json of the package itself.
            case "bin":
            case "description":
            case "dependencies":
            case "name":
            case "main":
            case "peerDependencies":
            case "optionalDependencies":
            case "typings":
            case "version":
            case "private":
            case "workspaces":
            case "resolutions":
                continue;

            // remove the following keys from the package.json.
            case "devDependencies":
            case "scripts":
                delete pkg[key];
                continue;

            // merge the following keys with the root package.json.
            case "keywords":
                const a = pkg[key] || [];
                const b = Object.keys(
                    root[key].concat(a).reduce((acc, curr) => {
                        acc[curr] = true;

                        return acc;
                    }, {})
                );
                pkg[key] = b;
                break;

            // overwrite engines to a common default.
            case "engines":
                pkg["engines"] = {
                    node: ">= 8.9.0",
                    npm: ">= 5.5.1"
                };
                break;

            // overwrite the package's key with to root one.
            default:
                pkg[key] = root[key];
        }
    }

    return pkg;
}

function _findAllPackageJson(dir, exclude) {
    const result = [];

    if (/(\\|\/)src\1?($|\b(core|apps|bitech)\b\1?)/i.test(dir)) {
        fs.readdirSync(dir).forEach(fileName => {
            const p = path.join(dir, fileName);

            if (exclude.test(p)) {
                return;
            } else if (/[\/\\]node_modules[\/\\]/.test(p)) {
                return;
            } else if (fileName === "package.json") {
                result.push(p);
            } else if (fs.statSync(p).isDirectory() && fileName !== "node_modules") {
                result.push(..._findAllPackageJson(p, exclude));
            }
        });
    }

    return result;
}

const tsConfigPath = path.join(__dirname, "../src/tsconfig.lib.json");
const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile),
    exclude = ["@types", ...tsConfig.config.exclude];
const pattern =
    "^(" +
    exclude
        .map(ex => path.join(path.dirname(tsConfigPath), ex))
        .map(
            ex =>
                "(" +
                ex
                    .replace(/[\-\[\]{}()+?./\\^$|]/g, "\\$&")
                    .replace(/(\\\\|\\\/)\*\*/g, "((/|\\\\).+?)?")
                    .replace(/\*/g, "[^/\\\\]*") +
                ")"
        )
        .join("|") +
    ")($|/|\\\\)";
const excludeRe = new RegExp(pattern);

// find all the package.json that aren't excluded from tsconfig.
const packageJsonPaths = _findAllPackageJson(path.join(__dirname, "../src"), excludeRe)
    // remove the root package.json.
    .filter(p => p !== path.join(__dirname, "../package.json"));

let gitShaCache;
function _getSnapshotHash(_pkg) {
    if (!gitShaCache) {
        gitShaCache = execSync("git log --format=%h -n1")
            .toString()
            .trim();
    }

    return gitShaCache;
}

function includes(rules, name) {
    return Array.isArray(rules) ? rules.some(rule => include(rule, name)) : include(rules, name);
}

function include(rule, name) {
    return rule instanceof RegExp ? rule.test(name) : rule === name;
}

function ignore(name) {
    if (buildApps) return !includes(buildApps, name);
    else if (ignoreApps) return includes(ignoreApps, name);

    return false;
}

// all the supported packages. Go through the packages directory and create a map of
// name => PackageInfo. This map is partial as it lacks some information that requires the
// map itself to finish building.
const packages = packageJsonPaths
    .map(pkgPath => ({ root: path.dirname(pkgPath) }))
    .reduce((packages, pkg) => {
        const pkgRoot = pkg.root;
        const packageJson = loadPackageJson(path.join(pkgRoot, "package.json"));
        const name = packageJson["name"];
        if (!name || !packageJson["version"] || ignore(name)) {
            // only build the entry if there's a package name.
            return packages;
        }
        if (!(name in monorepoPackages)) {
            throw new Error(`Package ${name} found in ${JSON.stringify(pkg.root)}, not found in .monorepo.json.`);
        }

        const bin = {};
        Object.keys(packageJson["bin"] || {}).forEach(binName => {
            let p = path.resolve(pkg.root, packageJson["bin"][binName]);
            if (!fs.existsSync(p)) {
                p = p.replace(/\.js$/, ".ts");
            }
            bin[binName] = p;
        });

        const dist = path.join(distRoot, name),
            version = (monorepoPackages[name] && monorepoPackages[name].version) || "0.0.0",
            packageJsonPath = path.join(dist, "package.json");

        let lastVersion = null;
        if (fs.existsSync(packageJsonPath)) {
            const { version: old } = require(packageJsonPath);

            lastVersion = old;
        }

        packages[name] = {
            dist: dist,
            root: pkgRoot,
            relative: path.relative(path.dirname(__dirname), pkgRoot),
            main: path.resolve(pkgRoot, "src/index.ts"),
            bin,
            name,
            ignore: lastVersion === version,
            packageJson,

            snapshot: !!monorepoPackages[name].snapshotRepo,
            snapshotRepo: monorepoPackages[name].snapshotRepo,
            get snapshotHash() {
                return _getSnapshotHash(this);
            },
            dependencies: [],
            hash: "",
            dirty: false,
            version: version
        };

        return packages;
    }, {});

// update with dependencies.
for (const pkgName of Object.keys(packages)) {
    const pkg = packages[pkgName];
    const pkgJson = require(path.join(pkg.root, "package.json"));
    pkg.dependencies = Object.keys(packages).filter(name => {
        return name in (pkgJson.dependencies || {}) || name in (pkgJson.devDependencies || {}) || name in (pkgJson.peerDependencies || {});
    });

    pkg.schedule = new Set(pkg.dependencies);
}

// update the hash values of each.
for (const pkgName of Object.keys(packages)) {
    packages[pkgName].hash = _getHashOf(packages[pkgName]);
    if (!monorepoPackages[pkgName] || packages[pkgName].hash !== monorepoPackages[pkgName].hash) {
        packages[pkgName].dirty = true;
    }
}

module.exports.packages = packages;
