const { isMaster, fork } = require("cluster"),
    { cpus } = require("os"),
    { build } = require("./build");

module.exports.taskScheduling = function(argv, logger, publish) {
    return new Promise((resolve, reject) => {
        if (isMaster) {
            const { packages: all } = require("./packages"),
                packages = packagesWarp(getPackages(all));
            try {
                if (packages.size > 0) {
                    launchTasks(all, packages, logger).then(resolve, reject);
                } else resolve({ packages: all, report: packages.report() });
            } catch (error) {
                logger.error(`${msg} => ${e}`);
                reject(error);
            }
        } else {
            let packages;
            process.on("message", async msg => {
                try {
                    if (typeof msg === "string") {
                        await build(argv, msg, packages, logger, publish);

                        process.send({ success: !0, pkgName: msg });
                    } else packages = msg;
                } catch (error) {
                    logger.error(`${msg} => ${error}`);

                    if (typeof msg === "string") process.send({ success: !1, pkgName: msg });
                }
            });
        }
    });
};

function getPackages(packages = {}) {
    packages = Object.values(packages);

    const ignores = packages.filter(pkg => pkg.ignore).map(pkg => pkg.name),
        pkgs = packages.filter(pkg => !pkg.ignore);

    pkgs.forEach(pkg => ignores.forEach(pkgName => pkg.schedule.delete(pkgName)));

    return pkgs;
}

function packagesWarp(packages) {
    return {
        size: packages.length,
        next() {
            return packages.filter(pkg => !pkg.build && !pkg.schedule.size);
        },
        delete({ pkgName, success }) {
            packages.forEach(pkg => {
                if (pkg.name === pkgName) {
                    pkg.success = success;
                }

                pkg.schedule.delete(pkgName);
            });
        },
        report() {
            const pkgNames = packages.map(pkg => pkg.name).join(" ”,\n“ "),
                error = errorPkgNames();

            return `*****************************************
已经完成 “ ${pkgNames} ” 打包。${error ? `\n其中“ ${error} ” 打包失败。` : ""}
*****************************************`;
        }
    };

    function errorPkgNames() {
        return packages
            .filter(pkg => !pkg.success)
            .map(pkg => pkg.name)
            .join(" ”,\n“ ");
    }
}

function launchTasks(packages, pkgsWarp, logger) {
    return new Promise(resolve => {
        const workers = launchWorkers(pkgsWarp, worker => {
            worker.send(packages);

            worker.on("message", msg => {
                worker.run = !1;

                pkgsWarp.delete(msg);

                if (runWorkers(workers, pkgsWarp) === !1 && !workers.some(worker => worker.run)) {
                    resolve({ packages, report: pkgsWarp.report() });
                }
            });
        });

        runWorkers(workers, pkgsWarp);
    });
}

function runWorkers(workers, pkgsWarp) {
    const pkgBatch = pkgsWarp.next();

    if (pkgBatch.length) {
        for (const worker of workers.filter(worker => !worker.run)) {
            if (!runWorker(worker, pkgBatch)) return;
        }
    }

    return !1;
}

function runWorker(worker, pkgBatch) {
    const pkg = pkgBatch.shift();

    return pkg ? ((pkg.build = worker.run = !0), worker.send(pkg.name), !0) : !1;
}

function launchWorkers(pkgsWarp, action) {
    const cpu = Math.min(cpus().length, 16),
        size = pkgsWarp.size > 12 ? cpu : pkgsWarp.size > 6 ? cpu / 2 : pkgsWarp.size,
        workers = [];

    for (let i = 0; i < size; i++) action((workers[i] = fork()));

    return workers;
}
