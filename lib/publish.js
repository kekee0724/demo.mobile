const { spawnSync } = require("child_process");

function _exec(command, args, opts, logger) {
    const { status, error, stderr, stdout } = spawnSync(command, args, { ...opts });

    if (status !== 0) {
        logger.error(`Command failed: ${command} ${args.map(x => JSON.stringify(x)).join(", ")}`);
        if (error) {
            logger.error("Error: " + (error ? error.message : "undefined"));
        } else {
            logger.error(`STDOUT:\n${stdout}`);
            logger.error(`STDERR:\n${stderr}`);
        }
        throw error;
    } else {
        return (stdout || "").toString();
    }
}

module.exports._exec = _exec;

module.exports._publish = function _publish(args, pkg, packages, logger, part = !0) {
    logger.info("Publishing...");

    const isWin = /Windows_NT/i.test(process.env.OS),
        all = args._.some(d => d === "all");

    if (pkg.packageJson["private"]) {
        logger.debug(`${pkg.name} (private)`);

        return;
    }

    if ((part && pkg.ignore) || pkg.error) {
        logger.debug(`${pkg.name} (ignore)`);

        return;
    }

    return Promise.resolve()
        .then(() => {
            logger.info(`    ${pkg.name}`);

            if (part && !all) {
                try {
                    const versions = _exec(
                        isWin ? "npm.cmd" : "npm",
                        ["view", pkg.name, "versions", "--registry=http://src.devops.bitech.cn:86/repository/RECO.NPM/"],
                        { cwd: pkg.dist },
                        logger
                    );

                    if (versions.includes(pkg.version)) return Promise.resolve(`npm 包 "${pkg.name}@${pkg.version}" 在服务器中已经存在。`);
                } catch {}
            }

            return _exec(isWin ? "npm.cmd" : "npm", ["publish"].concat(args.tag ? ["--tag", args.tag] : []), { cwd: pkg.dist }, logger);
        })
        .then(
            stdout => logger.info(`        ${stdout}`),
            error => logger.fatal(error.message)
        );
};
