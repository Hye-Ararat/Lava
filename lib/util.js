const path = require("path");
function isCurrentUserRoot() {
  return process.getuid() == 0; // UID 0 is always root
}
function setLogger() {
  ["debug", "log", "warn", "error"].forEach((methodName) => {
    if (methodName == "debug") {
      const originalLoggingMethod = console[methodName];
      console.raw = originalLoggingMethod;
    } else {
      const originalLoggingMethod = console[methodName];
      console[methodName] = (firstArgument, ...otherArguments) => {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const relativeFileName = path.relative(
          process.cwd(),
          callee.getFileName()
        );
        var prefix;
        if (methodName == "log") {
          prefix =
            `[`.blue +
            ` ${relativeFileName}:${callee.getLineNumber()} ` +
            `]`.blue;
        } else if (methodName == "warn") {
          prefix =
            `[`.yellow +
            ` ${relativeFileName}:${callee.getLineNumber()} ` +
            `]`.yellow;
        } else if (methodName == "error") {
          prefix =
            `[`.red +
            ` ${relativeFileName}:${callee.getLineNumber()} ` +
            `]`.red;
        } else {
          prefix =
            `[`.gray +
            ` ${relativeFileName}:${callee.getLineNumber()} ` +
            `]`.gray;
        }

        if (typeof firstArgument === "string") {
          originalLoggingMethod(
            prefix + " " + firstArgument,
            ...otherArguments
          );
        } else {
          originalLoggingMethod(prefix, firstArgument, ...otherArguments);
        }
      };
    }
  });
}
module.exports = {
  isCurrentUserRoot,
  setLogger,
};
