const { getSystemPath, normalize, resolve } = require("./path"),
    fs = require("fs"),
    ngPackagr = require("rc-packagr"),
    { EMPTY, Observable } = require("rxjs"),
    { catchError, tap } = require("rxjs/operators"),
    semver = require("semver");

const NEW_NG_PACKAGR_VERSION = "4.0.0-rc.3";

function requireProjectModule(root, moduleName) {
    return require(require.resolve(moduleName, { paths: [root] }));
}

function resolveProjectModule(root, moduleName) {
    return require.resolve(moduleName, { paths: [root] });
}

function checkNgPackagrVersion(projectRoot) {
    let ngPackagrJsonPath;

    try {
        ngPackagrJsonPath = resolveProjectModule(projectRoot, "rc-packagr/package.json");
    } catch {
        // ng-packagr is not installed
        throw new Error(`
    ng-packagr is not installed. Run \`npm install ng-packagr --save-dev\` and try again.
  `);
    }

    const ngPackagrPackageJson = fs.readFileSync(ngPackagrJsonPath).toString();
    const ngPackagrVersion = JSON.parse(ngPackagrPackageJson)["version"];

    if (!semver.gte(ngPackagrVersion, NEW_NG_PACKAGR_VERSION)) {
        throw new Error(`
    The installed version of ng-packagr is ${ngPackagrVersion}. The watch feature
    requires ng-packagr version to satisfy ${NEW_NG_PACKAGR_VERSION}.
    Please upgrade your ng-packagr version.
  `);
    }

    return true;
}

class PackagrBuilder {
    constructor(workspace) {
        this.workspace = workspace;
    }

    run(options) {
        const root = this.workspace.root;
        if (!options.project) {
            throw new Error('A "project" must be specified to build a library\'s npm package.');
        }
        return new Observable(obs => {
            const projectNgPackagr = requireProjectModule(getSystemPath(root), "rc-packagr");
            const packageJsonPath = getSystemPath(resolve(root, normalize(options.project)));
            const ngPkgProject = projectNgPackagr.ngPackagr().forProject(packageJsonPath);
            if (options.tsConfig) {
                const tsConfigPath = getSystemPath(resolve(root, normalize(options.tsConfig)));
                ngPkgProject.withTsConfig(tsConfigPath);
            }
            if (options.watch) {
                checkNgPackagrVersion(getSystemPath(root));
                const ngPkgSubscription = ngPkgProject
                    .watch()
                    .pipe(
                        tap(() => obs.next({ success: true })),
                        catchError(e => {
                            obs.error(e);
                            return EMPTY;
                        })
                    )
                    .subscribe();
                return () => ngPkgSubscription.unsubscribe();
            } else {
                ngPkgProject
                    .build()
                    .then(() => {
                        obs.next({ success: true });
                        obs.complete();
                    })
                    .catch(e => obs.error(e));
            }
        });
    }
}

module.exports.PackagrBuilder = PackagrBuilder;

module.exports.default = PackagrBuilder;
