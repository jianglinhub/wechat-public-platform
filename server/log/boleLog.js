/**
 * Created by ly on 2015/8/18.
 */
var bole        = require("bole");
var boleConsole = require("bole-console");
var config      = require("../config");

var boleConsoleStream = boleConsole({
    timestamp: true,
    hostname: true,
    pid: true,
    requestDetails: true
});
bole.output([
    {level: "info", stream: boleConsoleStream }
]);
var boleLog = bole(config.pkg.name);

module.exports = {
    boleLog: boleLog
};

