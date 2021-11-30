const build = require("./build"),
    { _publish } = require("../lib/publish");

module.exports.default = async function(args, logger, cwd) {
    await build.default(args, logger, cwd, !0, result => publish(args, logger, cwd, result));
};

function publish(args, logger, cwd, packages) {
    if (!args._.some(d => d === "all")) return;

    return Promise.all(
        Object.keys(packages)
            .filter(pkgName => packages[pkgName].ignore)
            .map(pkgName => _publish(args, packages[pkgName], packages, logger, !1))
    );
}
