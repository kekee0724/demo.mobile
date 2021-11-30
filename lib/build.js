const { PackagrBuilder } = require("./packagr"),
    fs = require("fs"),
    glob = require("glob"),
    path = require("path"),
    { _publish } = require("./publish");

module.exports.build = async (argv, pkgName, packages, logger, publish) => {
    const pkg = packages[pkgName];

    await _build(pkg, logger);

    _copyingExtraResources(pkg, logger);

    _settingVersions(argv, pkg, packages, logger);

    cleanDefinitelyTyped(pkg, logger);

    publish && _publish(argv, pkg, packages, logger);
};

/*************************************************************************** 包编译 *******************************************************************************/

async function _build(pkg, logger) {
    const root = process.cwd(),
        packagr = new PackagrBuilder({ root: root }),
        tsConfig = path.resolve(root, "src", "tsconfig.lib.json");

    if (!pkg.ignore && !pkg.error) {
        try {
            const result = await packagr
                .run({
                    watch: false,
                    tsConfig,
                    project: path.resolve(pkg.root, "rc-package.json")
                })
                .toPromise();

            pkg.error = !result.success;
        } catch (error) {
            pkg.error = error;
        }
    }
}

/*************************************************************************** 包资源复制 *******************************************************************************/

function _mkdirp(p) {
    // Create parent folder if necessary.
    if (!fs.existsSync(path.dirname(p))) {
        _mkdirp(path.dirname(p));
    }
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
    }
}

function _copy(from, to) {
    // Create parent folder if necessary.
    if (!fs.existsSync(path.dirname(to))) {
        _mkdirp(path.dirname(to));
    }

    // Error out if destination already exists.
    if (fs.existsSync(to)) {
        throw new Error(`Path ${to} already exist...`);
    }

    from = path.relative(process.cwd(), from);
    to = path.relative(process.cwd(), to);

    const buffer = fs.readFileSync(from);
    fs.writeFileSync(to, buffer);
}

function _copyingExtraResources(pkg, logger) {
    logger.info("Copying extra resources...");

    if (!pkg.ignore && !pkg.error) {
        _copy(path.join(__dirname, "../LICENSE"), path.join(pkg.dist, "LICENSE"));
    }
}

/*************************************************************************** 包版本设置 *******************************************************************************/

function _settingVersions(argv, pkg, packages, logger) {
    logger.info("Setting versions...");

    const versionLogger = logger.createChild("versions"),
        packageName = pkg.name;

    if (!pkg.ignore && !pkg.error) {
        versionLogger.info(`    ${packageName}`);

        const version = pkg.version,
            packageJsonPath = path.join(pkg.dist, "package.json");

        try {
            const packageJson = require(packageJsonPath);

            if (version) {
                packageJson["version"] = version;
            } else {
                versionLogger.error("No version found... Only updating dependencies.");
            }

            for (const depName of Object.keys(packages)) {
                const v = packages[depName].version;
                for (const depKey of ["dependencies", "peerDependencies", "devDependencies", "resolutions"]) {
                    const obj = (packageJson[depKey] = pkg.packageJson[depKey]);
                    if (obj && obj[depName]) {
                        if (argv.local) {
                            obj[depName] = packages[depName].tar;
                        } else if (argv.snapshot) {
                            const pkg = packages[depName];
                            if (!pkg.snapshotRepo) {
                                versionLogger.error(`Package ${JSON.stringify(depName)} is not published as a snapshot. Fixing to current version ${v}.`);
                                obj[depName] = v;
                            } else {
                                obj[depName] = `github:${pkg.snapshotRepo}#${pkg.snapshotHash}`;
                            }
                        } else if (obj[depName].match(/\b0\.0\.0\b/)) {
                            obj[depName] = obj[depName].replace(/\b0\.0\.0\b/, v);
                        }
                    }
                }
            }

            for (const depKey of ["publishConfig", "repository", "prettier", "engines", "license"]) {
                packageJson[depKey] = pkg.packageJson[depKey];
            }

            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
        } catch (error) {
            pkg.error = error;
        }
    }
}

/*************************************************************************** 声明处理 *******************************************************************************/

function cleanDefinitelyTyped(pkg, logger) {
    glob.sync(path.join(pkg.dist, "**/*.d.ts"), { dot: true }).forEach(filePath => {
        fs.writeFileSync(filePath, fs.readFileSync(filePath, "utf-8").replace(/\/\/\/\s+\<reference\s+types="\w+"\s+\/\>/gi, a => "///" + a));
    });
}
