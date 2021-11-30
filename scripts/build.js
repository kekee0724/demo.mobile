const { isMaster } = require("cluster"),
    { taskScheduling } = require("../lib/task");

module.exports.default = async function(argv, logger, cwd, publish = !1, callback) {
    const lable = "总用时";

    // tslint:disable-next-line: no-console
    console.time(lable);

    const { report, packages } = await taskScheduling(argv, logger, publish);

    if (isMaster && typeof callback === "function") await callback(packages);

    report && console.log(report);

    // tslint:disable-next-line: no-console
    console.timeEnd(lable);
};
