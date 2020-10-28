var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2) => {
  __markAsModule(target);
  if (typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: __getOwnPropDesc(module2, key).enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__defProp(__create(__getProtoOf(module2)), "default", {value: module2, enumerable: true}), module2);
};

// ../../node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js
var require_windows = __commonJS((exports, module2) => {
  module2.exports = isexe;
  isexe.sync = sync;
  var fs3 = require("fs");
  function checkPathExt(path3, options) {
    var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
    if (!pathext) {
      return true;
    }
    pathext = pathext.split(";");
    if (pathext.indexOf("") !== -1) {
      return true;
    }
    for (var i = 0; i < pathext.length; i++) {
      var p = pathext[i].toLowerCase();
      if (p && path3.substr(-p.length).toLowerCase() === p) {
        return true;
      }
    }
    return false;
  }
  function checkStat(stat, path3, options) {
    if (!stat.isSymbolicLink() && !stat.isFile()) {
      return false;
    }
    return checkPathExt(path3, options);
  }
  function isexe(path3, options, cb) {
    fs3.stat(path3, function(er, stat) {
      cb(er, er ? false : checkStat(stat, path3, options));
    });
  }
  function sync(path3, options) {
    return checkStat(fs3.statSync(path3), path3, options);
  }
});

// ../../node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js
var require_mode = __commonJS((exports, module2) => {
  module2.exports = isexe;
  isexe.sync = sync;
  var fs3 = require("fs");
  function isexe(path3, options, cb) {
    fs3.stat(path3, function(er, stat) {
      cb(er, er ? false : checkStat(stat, options));
    });
  }
  function sync(path3, options) {
    return checkStat(fs3.statSync(path3), options);
  }
  function checkStat(stat, options) {
    return stat.isFile() && checkMode(stat, options);
  }
  function checkMode(stat, options) {
    var mod2 = stat.mode;
    var uid = stat.uid;
    var gid = stat.gid;
    var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
    var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
    var u = parseInt("100", 8);
    var g = parseInt("010", 8);
    var o = parseInt("001", 8);
    var ug = u | g;
    var ret = mod2 & o || mod2 & g && gid === myGid || mod2 & u && uid === myUid || mod2 & ug && myUid === 0;
    return ret;
  }
});

// ../../node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js
var require_isexe = __commonJS((exports, module2) => {
  var fs3 = require("fs");
  var core;
  if (process.platform === "win32" || global.TESTING_WINDOWS) {
    core = require_windows();
  } else {
    core = require_mode();
  }
  module2.exports = isexe;
  isexe.sync = sync;
  function isexe(path3, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (!cb) {
      if (typeof Promise !== "function") {
        throw new TypeError("callback not provided");
      }
      return new Promise(function(resolve, reject) {
        isexe(path3, options || {}, function(er, is) {
          if (er) {
            reject(er);
          } else {
            resolve(is);
          }
        });
      });
    }
    core(path3, options || {}, function(er, is) {
      if (er) {
        if (er.code === "EACCES" || options && options.ignoreErrors) {
          er = null;
          is = false;
        }
      }
      cb(er, is);
    });
  }
  function sync(path3, options) {
    try {
      return core.sync(path3, options || {});
    } catch (er) {
      if (options && options.ignoreErrors || er.code === "EACCES") {
        return false;
      } else {
        throw er;
      }
    }
  }
});

// ../../node_modules/.pnpm/which@2.0.2/node_modules/which/which.js
var require_which = __commonJS((exports, module2) => {
  const isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
  const path3 = require("path");
  const COLON = isWindows ? ";" : ":";
  const isexe = require_isexe();
  const getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), {code: "ENOENT"});
  const getPathInfo = (cmd, opt) => {
    const colon = opt.colon || COLON;
    const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
      ...isWindows ? [process.cwd()] : [],
      ...(opt.path || process.env.PATH || "").split(colon)
    ];
    const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
    const pathExt = isWindows ? pathExtExe.split(colon) : [""];
    if (isWindows) {
      if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
        pathExt.unshift("");
    }
    return {
      pathEnv,
      pathExt,
      pathExtExe
    };
  };
  const which = (cmd, opt, cb) => {
    if (typeof opt === "function") {
      cb = opt;
      opt = {};
    }
    if (!opt)
      opt = {};
    const {pathEnv, pathExt, pathExtExe} = getPathInfo(cmd, opt);
    const found = [];
    const step = (i) => new Promise((resolve, reject) => {
      if (i === pathEnv.length)
        return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path3.join(pathPart, cmd);
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      resolve(subStep(p, i, 0));
    });
    const subStep = (p, i, ii) => new Promise((resolve, reject) => {
      if (ii === pathExt.length)
        return resolve(step(i + 1));
      const ext = pathExt[ii];
      isexe(p + ext, {pathExt: pathExtExe}, (er, is) => {
        if (!er && is) {
          if (opt.all)
            found.push(p + ext);
          else
            return resolve(p + ext);
        }
        return resolve(subStep(p, i, ii + 1));
      });
    });
    return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
  };
  const whichSync = (cmd, opt) => {
    opt = opt || {};
    const {pathEnv, pathExt, pathExtExe} = getPathInfo(cmd, opt);
    const found = [];
    for (let i = 0; i < pathEnv.length; i++) {
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path3.join(pathPart, cmd);
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      for (let j = 0; j < pathExt.length; j++) {
        const cur = p + pathExt[j];
        try {
          const is = isexe.sync(cur, {pathExt: pathExtExe});
          if (is) {
            if (opt.all)
              found.push(cur);
            else
              return cur;
          }
        } catch (ex) {
        }
      }
    }
    if (opt.all && found.length)
      return found;
    if (opt.nothrow)
      return null;
    throw getNotFoundError(cmd);
  };
  module2.exports = which;
  which.sync = whichSync;
});

// ../../node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js
var require_path_key = __commonJS((exports, module2) => {
  "use strict";
  const pathKey = (options = {}) => {
    const environment = options.env || process.env;
    const platform = options.platform || process.platform;
    if (platform !== "win32") {
      return "PATH";
    }
    return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
  };
  module2.exports = pathKey;
  module2.exports.default = pathKey;
});

// ../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS((exports, module2) => {
  "use strict";
  const path3 = require("path");
  const which = require_which();
  const getPathKey = require_path_key();
  function resolveCommandAttempt(parsed, withoutPathExt) {
    const env = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
    const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
    if (shouldSwitchCwd) {
      try {
        process.chdir(parsed.options.cwd);
      } catch (err) {
      }
    }
    let resolved;
    try {
      resolved = which.sync(parsed.command, {
        path: env[getPathKey({env})],
        pathExt: withoutPathExt ? path3.delimiter : void 0
      });
    } catch (e) {
    } finally {
      if (shouldSwitchCwd) {
        process.chdir(cwd);
      }
    }
    if (resolved) {
      resolved = path3.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
    }
    return resolved;
  }
  function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
  }
  module2.exports = resolveCommand;
});

// ../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS((exports, module2) => {
  "use strict";
  const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
  function escapeCommand(arg) {
    arg = arg.replace(metaCharsRegExp, "^$1");
    return arg;
  }
  function escapeArgument(arg, doubleEscapeMetaChars) {
    arg = `${arg}`;
    arg = arg.replace(/(\\*)"/g, '$1$1\\"');
    arg = arg.replace(/(\\*)$/, "$1$1");
    arg = `"${arg}"`;
    arg = arg.replace(metaCharsRegExp, "^$1");
    if (doubleEscapeMetaChars) {
      arg = arg.replace(metaCharsRegExp, "^$1");
    }
    return arg;
  }
  module2.exports.command = escapeCommand;
  module2.exports.argument = escapeArgument;
});

// ../../node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = /^#!(.*)/;
});

// ../../node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js
var require_shebang_command = __commonJS((exports, module2) => {
  "use strict";
  const shebangRegex = require_shebang_regex();
  module2.exports = (string = "") => {
    const match = string.match(shebangRegex);
    if (!match) {
      return null;
    }
    const [path3, argument] = match[0].replace(/#! ?/, "").split(" ");
    const binary = path3.split("/").pop();
    if (binary === "env") {
      return argument;
    }
    return argument ? `${binary} ${argument}` : binary;
  };
});

// ../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS((exports, module2) => {
  "use strict";
  const fs3 = require("fs");
  const shebangCommand = require_shebang_command();
  function readShebang(command) {
    const size = 150;
    const buffer = Buffer.alloc(size);
    let fd;
    try {
      fd = fs3.openSync(command, "r");
      fs3.readSync(fd, buffer, 0, size, 0);
      fs3.closeSync(fd);
    } catch (e) {
    }
    return shebangCommand(buffer.toString());
  }
  module2.exports = readShebang;
});

// ../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS((exports, module2) => {
  "use strict";
  const path3 = require("path");
  const resolveCommand = require_resolveCommand();
  const escape = require_escape();
  const readShebang = require_readShebang();
  const isWin = process.platform === "win32";
  const isExecutableRegExp = /\.(?:com|exe)$/i;
  const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
  function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);
    const shebang = parsed.file && readShebang(parsed.file);
    if (shebang) {
      parsed.args.unshift(parsed.file);
      parsed.command = shebang;
      return resolveCommand(parsed);
    }
    return parsed.file;
  }
  function parseNonShell(parsed) {
    if (!isWin) {
      return parsed;
    }
    const commandFile = detectShebang(parsed);
    const needsShell = !isExecutableRegExp.test(commandFile);
    if (parsed.options.forceShell || needsShell) {
      const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
      parsed.command = path3.normalize(parsed.command);
      parsed.command = escape.command(parsed.command);
      parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
      const shellCommand = [parsed.command].concat(parsed.args).join(" ");
      parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
      parsed.command = process.env.comspec || "cmd.exe";
      parsed.options.windowsVerbatimArguments = true;
    }
    return parsed;
  }
  function parse2(command, args, options) {
    if (args && !Array.isArray(args)) {
      options = args;
      args = null;
    }
    args = args ? args.slice(0) : [];
    options = Object.assign({}, options);
    const parsed = {
      command,
      args,
      options,
      file: void 0,
      original: {
        command,
        args
      }
    };
    return options.shell ? parsed : parseNonShell(parsed);
  }
  module2.exports = parse2;
});

// ../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS((exports, module2) => {
  "use strict";
  const isWin = process.platform === "win32";
  function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
      code: "ENOENT",
      errno: "ENOENT",
      syscall: `${syscall} ${original.command}`,
      path: original.command,
      spawnargs: original.args
    });
  }
  function hookChildProcess(cp, parsed) {
    if (!isWin) {
      return;
    }
    const originalEmit = cp.emit;
    cp.emit = function(name, arg1) {
      if (name === "exit") {
        const err = verifyENOENT(arg1, parsed, "spawn");
        if (err) {
          return originalEmit.call(cp, "error", err);
        }
      }
      return originalEmit.apply(cp, arguments);
    };
  }
  function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawn");
    }
    return null;
  }
  function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawnSync");
    }
    return null;
  }
  module2.exports = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError
  };
});

// ../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS((exports, module2) => {
  "use strict";
  const cp = require("child_process");
  const parse2 = require_parse();
  const enoent = require_enoent();
  function spawn(command, args, options) {
    const parsed = parse2(command, args, options);
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
    enoent.hookChildProcess(spawned, parsed);
    return spawned;
  }
  function spawnSync(command, args, options) {
    const parsed = parse2(command, args, options);
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
    return result;
  }
  module2.exports = spawn;
  module2.exports.spawn = spawn;
  module2.exports.sync = spawnSync;
  module2.exports._parse = parse2;
  module2.exports._enoent = enoent;
});

// ../generator-helper/dist/byline.js
var require_byline = __commonJS((exports, module2) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.createLineStream = void 0;
  const stream = require("stream");
  const util = require("util");
  function byline(readStream, options) {
    return module2.exports.createStream(readStream, options);
  }
  exports.default = byline;
  module2.exports.createStream = function(readStream, options) {
    if (readStream) {
      return createLineStream(readStream, options);
    } else {
      return new LineStream(options);
    }
  };
  function createLineStream(readStream, options) {
    if (!readStream) {
      throw new Error("expected readStream");
    }
    if (!readStream.readable) {
      throw new Error("readStream must be readable");
    }
    const ls = new LineStream(options);
    readStream.pipe(ls);
    return ls;
  }
  exports.createLineStream = createLineStream;
  module2.exports.LineStream = LineStream;
  function LineStream(options) {
    stream.Transform.call(this, options);
    options = options || {};
    this._readableState.objectMode = true;
    this._lineBuffer = [];
    this._keepEmptyLines = options.keepEmptyLines || false;
    this._lastChunkEndedWithCR = false;
    this.on("pipe", function(src) {
      if (!this.encoding) {
        if (src instanceof stream.Readable) {
          this.encoding = src._readableState.encoding;
        }
      }
    });
  }
  util.inherits(LineStream, stream.Transform);
  LineStream.prototype._transform = function(chunk, encoding, done) {
    encoding = encoding || "utf8";
    if (Buffer.isBuffer(chunk)) {
      if (encoding == "buffer") {
        chunk = chunk.toString();
        encoding = "utf8";
      } else {
        chunk = chunk.toString(encoding);
      }
    }
    this._chunkEncoding = encoding;
    const lines = chunk.split(/\r\n|\r|\n/g);
    if (this._lastChunkEndedWithCR && chunk[0] == "\n") {
      lines.shift();
    }
    if (this._lineBuffer.length > 0) {
      this._lineBuffer[this._lineBuffer.length - 1] += lines[0];
      lines.shift();
    }
    this._lastChunkEndedWithCR = chunk[chunk.length - 1] == "\r";
    this._lineBuffer = this._lineBuffer.concat(lines);
    this._pushBuffer(encoding, 1, done);
  };
  LineStream.prototype._pushBuffer = function(encoding, keep, done) {
    while (this._lineBuffer.length > keep) {
      const line = this._lineBuffer.shift();
      if (this._keepEmptyLines || line.length > 0) {
        if (!this.push(this._reencode(line, encoding))) {
          const self = this;
          setImmediate(function() {
            self._pushBuffer(encoding, keep, done);
          });
          return;
        }
      }
    }
    done();
  };
  LineStream.prototype._flush = function(done) {
    this._pushBuffer(this._chunkEncoding, 0, done);
  };
  LineStream.prototype._reencode = function(line, chunkEncoding) {
    if (this.encoding && this.encoding != chunkEncoding) {
      return Buffer.from(line, chunkEncoding).toString(this.encoding);
    } else if (this.encoding) {
      return line;
    } else {
      return Buffer.from(line, chunkEncoding);
    }
  };
});

// ../../node_modules/.pnpm/color-name@1.1.4/node_modules/color-name/index.js
var require_color_name = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
});

// ../../node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/conversions.js
var require_conversions = __commonJS((exports, module2) => {
  const cssKeywords = require_color_name();
  const reverseKeywords = {};
  for (const key of Object.keys(cssKeywords)) {
    reverseKeywords[cssKeywords[key]] = key;
  }
  const convert = {
    rgb: {channels: 3, labels: "rgb"},
    hsl: {channels: 3, labels: "hsl"},
    hsv: {channels: 3, labels: "hsv"},
    hwb: {channels: 3, labels: "hwb"},
    cmyk: {channels: 4, labels: "cmyk"},
    xyz: {channels: 3, labels: "xyz"},
    lab: {channels: 3, labels: "lab"},
    lch: {channels: 3, labels: "lch"},
    hex: {channels: 1, labels: ["hex"]},
    keyword: {channels: 1, labels: ["keyword"]},
    ansi16: {channels: 1, labels: ["ansi16"]},
    ansi256: {channels: 1, labels: ["ansi256"]},
    hcg: {channels: 3, labels: ["h", "c", "g"]},
    apple: {channels: 3, labels: ["r16", "g16", "b16"]},
    gray: {channels: 1, labels: ["gray"]}
  };
  module2.exports = convert;
  for (const model of Object.keys(convert)) {
    if (!("channels" in convert[model])) {
      throw new Error("missing channels property: " + model);
    }
    if (!("labels" in convert[model])) {
      throw new Error("missing channel labels property: " + model);
    }
    if (convert[model].labels.length !== convert[model].channels) {
      throw new Error("channel and label counts mismatch: " + model);
    }
    const {channels, labels} = convert[model];
    delete convert[model].channels;
    delete convert[model].labels;
    Object.defineProperty(convert[model], "channels", {value: channels});
    Object.defineProperty(convert[model], "labels", {value: labels});
  }
  convert.rgb.hsl = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const min2 = Math.min(r, g, b);
    const max2 = Math.max(r, g, b);
    const delta = max2 - min2;
    let h;
    let s;
    if (max2 === min2) {
      h = 0;
    } else if (r === max2) {
      h = (g - b) / delta;
    } else if (g === max2) {
      h = 2 + (b - r) / delta;
    } else if (b === max2) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    const l = (min2 + max2) / 2;
    if (max2 === min2) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max2 + min2);
    } else {
      s = delta / (2 - max2 - min2);
    }
    return [h, s * 100, l * 100];
  };
  convert.rgb.hsv = function(rgb) {
    let rdif;
    let gdif;
    let bdif;
    let h;
    let s;
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff === 0) {
      h = 0;
      s = 0;
    } else {
      s = diff / v;
      rdif = diffc(r);
      gdif = diffc(g);
      bdif = diffc(b);
      if (r === v) {
        h = bdif - gdif;
      } else if (g === v) {
        h = 1 / 3 + rdif - bdif;
      } else if (b === v) {
        h = 2 / 3 + gdif - rdif;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return [
      h * 360,
      s * 100,
      v * 100
    ];
  };
  convert.rgb.hwb = function(rgb) {
    const r = rgb[0];
    const g = rgb[1];
    let b = rgb[2];
    const h = convert.rgb.hsl(rgb)[0];
    const w = 1 / 255 * Math.min(r, Math.min(g, b));
    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  };
  convert.rgb.cmyk = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const k = Math.min(1 - r, 1 - g, 1 - b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  };
  function comparativeDistance(x, y) {
    return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
  }
  convert.rgb.keyword = function(rgb) {
    const reversed = reverseKeywords[rgb];
    if (reversed) {
      return reversed;
    }
    let currentClosestDistance = Infinity;
    let currentClosestKeyword;
    for (const keyword of Object.keys(cssKeywords)) {
      const value = cssKeywords[keyword];
      const distance = comparativeDistance(rgb, value);
      if (distance < currentClosestDistance) {
        currentClosestDistance = distance;
        currentClosestKeyword = keyword;
      }
    }
    return currentClosestKeyword;
  };
  convert.keyword.rgb = function(keyword) {
    return cssKeywords[keyword];
  };
  convert.rgb.xyz = function(rgb) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
    g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
    b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x * 100, y * 100, z * 100];
  };
  convert.rgb.lab = function(rgb) {
    const xyz = convert.rgb.xyz(rgb);
    let x = xyz[0];
    let y = xyz[1];
    let z = xyz[2];
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [l, a, b];
  };
  convert.hsl.rgb = function(hsl) {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    let t2;
    let t3;
    let val;
    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    const t1 = 2 * l - t2;
    const rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }
      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }
      rgb[i] = val * 255;
    }
    return rgb;
  };
  convert.hsl.hsv = function(hsl) {
    const h = hsl[0];
    let s = hsl[1] / 100;
    let l = hsl[2] / 100;
    let smin = s;
    const lmin = Math.max(l, 0.01);
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    const v = (l + s) / 2;
    const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  };
  convert.hsv.rgb = function(hsv) {
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    let v = hsv[2] / 100;
    const hi = Math.floor(h) % 6;
    const f = h - Math.floor(h);
    const p = 255 * v * (1 - s);
    const q = 255 * v * (1 - s * f);
    const t = 255 * v * (1 - s * (1 - f));
    v *= 255;
    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };
  convert.hsv.hsl = function(hsv) {
    const h = hsv[0];
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const vmin = Math.max(v, 0.01);
    let sl;
    let l;
    l = (2 - s) * v;
    const lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  };
  convert.hwb.rgb = function(hwb) {
    const h = hwb[0] / 360;
    let wh = hwb[1] / 100;
    let bl = hwb[2] / 100;
    const ratio = wh + bl;
    let f;
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }
    const i = Math.floor(6 * h);
    const v = 1 - bl;
    f = 6 * h - i;
    if ((i & 1) !== 0) {
      f = 1 - f;
    }
    const n = wh + f * (v - wh);
    let r;
    let g;
    let b;
    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;
      case 1:
        r = n;
        g = v;
        b = wh;
        break;
      case 2:
        r = wh;
        g = v;
        b = n;
        break;
      case 3:
        r = wh;
        g = n;
        b = v;
        break;
      case 4:
        r = n;
        g = wh;
        b = v;
        break;
      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }
    return [r * 255, g * 255, b * 255];
  };
  convert.cmyk.rgb = function(cmyk) {
    const c = cmyk[0] / 100;
    const m = cmyk[1] / 100;
    const y = cmyk[2] / 100;
    const k = cmyk[3] / 100;
    const r = 1 - Math.min(1, c * (1 - k) + k);
    const g = 1 - Math.min(1, m * (1 - k) + k);
    const b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.rgb = function(xyz) {
    const x = xyz[0] / 100;
    const y = xyz[1] / 100;
    const z = xyz[2] / 100;
    let r;
    let g;
    let b;
    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.204 + z * 1.057;
    r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
    g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
    b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.lab = function(xyz) {
    let x = xyz[0];
    let y = xyz[1];
    let z = xyz[2];
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [l, a, b];
  };
  convert.lab.xyz = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let x;
    let y;
    let z;
    y = (l + 16) / 116;
    x = a / 500 + y;
    z = y - b / 200;
    const y2 = y ** 3;
    const x2 = x ** 3;
    const z2 = z ** 3;
    y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
    z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
    x *= 95.047;
    y *= 100;
    z *= 108.883;
    return [x, y, z];
  };
  convert.lab.lch = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let h;
    const hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;
    if (h < 0) {
      h += 360;
    }
    const c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  };
  convert.lch.lab = function(lch) {
    const l = lch[0];
    const c = lch[1];
    const h = lch[2];
    const hr = h / 360 * 2 * Math.PI;
    const a = c * Math.cos(hr);
    const b = c * Math.sin(hr);
    return [l, a, b];
  };
  convert.rgb.ansi16 = function(args, saturation = null) {
    const [r, g, b] = args;
    let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
    value = Math.round(value / 50);
    if (value === 0) {
      return 30;
    }
    let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
    if (value === 2) {
      ansi += 60;
    }
    return ansi;
  };
  convert.hsv.ansi16 = function(args) {
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };
  convert.rgb.ansi256 = function(args) {
    const r = args[0];
    const g = args[1];
    const b = args[2];
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }
      if (r > 248) {
        return 231;
      }
      return Math.round((r - 8) / 247 * 24) + 232;
    }
    const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
    return ansi;
  };
  convert.ansi16.rgb = function(args) {
    let color = args % 10;
    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }
      color = color / 10.5 * 255;
      return [color, color, color];
    }
    const mult = (~~(args > 50) + 1) * 0.5;
    const r = (color & 1) * mult * 255;
    const g = (color >> 1 & 1) * mult * 255;
    const b = (color >> 2 & 1) * mult * 255;
    return [r, g, b];
  };
  convert.ansi256.rgb = function(args) {
    if (args >= 232) {
      const c = (args - 232) * 10 + 8;
      return [c, c, c];
    }
    args -= 16;
    let rem;
    const r = Math.floor(args / 36) / 5 * 255;
    const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    const b = rem % 6 / 5 * 255;
    return [r, g, b];
  };
  convert.rgb.hex = function(args) {
    const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
    const string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.hex.rgb = function(args) {
    const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
      return [0, 0, 0];
    }
    let colorString = match[0];
    if (match[0].length === 3) {
      colorString = colorString.split("").map((char) => {
        return char + char;
      }).join("");
    }
    const integer = parseInt(colorString, 16);
    const r = integer >> 16 & 255;
    const g = integer >> 8 & 255;
    const b = integer & 255;
    return [r, g, b];
  };
  convert.rgb.hcg = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max2 = Math.max(Math.max(r, g), b);
    const min2 = Math.min(Math.min(r, g), b);
    const chroma = max2 - min2;
    let grayscale;
    let hue;
    if (chroma < 1) {
      grayscale = min2 / (1 - chroma);
    } else {
      grayscale = 0;
    }
    if (chroma <= 0) {
      hue = 0;
    } else if (max2 === r) {
      hue = (g - b) / chroma % 6;
    } else if (max2 === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma;
    }
    hue /= 6;
    hue %= 1;
    return [hue * 360, chroma * 100, grayscale * 100];
  };
  convert.hsl.hcg = function(hsl) {
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
    let f = 0;
    if (c < 1) {
      f = (l - 0.5 * c) / (1 - c);
    }
    return [hsl[0], c * 100, f * 100];
  };
  convert.hsv.hcg = function(hsv) {
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const c = s * v;
    let f = 0;
    if (c < 1) {
      f = (v - c) / (1 - c);
    }
    return [hsv[0], c * 100, f * 100];
  };
  convert.hcg.rgb = function(hcg) {
    const h = hcg[0] / 360;
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    if (c === 0) {
      return [g * 255, g * 255, g * 255];
    }
    const pure = [0, 0, 0];
    const hi = h % 1 * 6;
    const v = hi % 1;
    const w = 1 - v;
    let mg = 0;
    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;
        pure[1] = v;
        pure[2] = 0;
        break;
      case 1:
        pure[0] = w;
        pure[1] = 1;
        pure[2] = 0;
        break;
      case 2:
        pure[0] = 0;
        pure[1] = 1;
        pure[2] = v;
        break;
      case 3:
        pure[0] = 0;
        pure[1] = w;
        pure[2] = 1;
        break;
      case 4:
        pure[0] = v;
        pure[1] = 0;
        pure[2] = 1;
        break;
      default:
        pure[0] = 1;
        pure[1] = 0;
        pure[2] = w;
    }
    mg = (1 - c) * g;
    return [
      (c * pure[0] + mg) * 255,
      (c * pure[1] + mg) * 255,
      (c * pure[2] + mg) * 255
    ];
  };
  convert.hcg.hsv = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    let f = 0;
    if (v > 0) {
      f = c / v;
    }
    return [hcg[0], f * 100, v * 100];
  };
  convert.hcg.hsl = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const l = g * (1 - c) + 0.5 * c;
    let s = 0;
    if (l > 0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1) {
      s = c / (2 * (1 - l));
    }
    return [hcg[0], s * 100, l * 100];
  };
  convert.hcg.hwb = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };
  convert.hwb.hcg = function(hwb) {
    const w = hwb[1] / 100;
    const b = hwb[2] / 100;
    const v = 1 - b;
    const c = v - w;
    let g = 0;
    if (c < 1) {
      g = (v - c) / (1 - c);
    }
    return [hwb[0], c * 100, g * 100];
  };
  convert.apple.rgb = function(apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };
  convert.rgb.apple = function(rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };
  convert.gray.rgb = function(args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };
  convert.gray.hsl = function(args) {
    return [0, 0, args[0]];
  };
  convert.gray.hsv = convert.gray.hsl;
  convert.gray.hwb = function(gray) {
    return [0, 100, gray[0]];
  };
  convert.gray.cmyk = function(gray) {
    return [0, 0, 0, gray[0]];
  };
  convert.gray.lab = function(gray) {
    return [gray[0], 0, 0];
  };
  convert.gray.hex = function(gray) {
    const val = Math.round(gray[0] / 100 * 255) & 255;
    const integer = (val << 16) + (val << 8) + val;
    const string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.rgb.gray = function(rgb) {
    const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

// ../../node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/route.js
var require_route = __commonJS((exports, module2) => {
  const conversions = require_conversions();
  function buildGraph() {
    const graph = {};
    const models = Object.keys(conversions);
    for (let len = models.length, i = 0; i < len; i++) {
      graph[models[i]] = {
        distance: -1,
        parent: null
      };
    }
    return graph;
  }
  function deriveBFS(fromModel) {
    const graph = buildGraph();
    const queue = [fromModel];
    graph[fromModel].distance = 0;
    while (queue.length) {
      const current = queue.pop();
      const adjacents = Object.keys(conversions[current]);
      for (let len = adjacents.length, i = 0; i < len; i++) {
        const adjacent = adjacents[i];
        const node = graph[adjacent];
        if (node.distance === -1) {
          node.distance = graph[current].distance + 1;
          node.parent = current;
          queue.unshift(adjacent);
        }
      }
    }
    return graph;
  }
  function link(from, to) {
    return function(args) {
      return to(from(args));
    };
  }
  function wrapConversion(toModel, graph) {
    const path3 = [graph[toModel].parent, toModel];
    let fn = conversions[graph[toModel].parent][toModel];
    let cur = graph[toModel].parent;
    while (graph[cur].parent) {
      path3.unshift(graph[cur].parent);
      fn = link(conversions[graph[cur].parent][cur], fn);
      cur = graph[cur].parent;
    }
    fn.conversion = path3;
    return fn;
  }
  module2.exports = function(fromModel) {
    const graph = deriveBFS(fromModel);
    const conversion = {};
    const models = Object.keys(graph);
    for (let len = models.length, i = 0; i < len; i++) {
      const toModel = models[i];
      const node = graph[toModel];
      if (node.parent === null) {
        continue;
      }
      conversion[toModel] = wrapConversion(toModel, graph);
    }
    return conversion;
  };
});

// ../../node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/index.js
var require_color_convert = __commonJS((exports, module2) => {
  const conversions = require_conversions();
  const route = require_route();
  const convert = {};
  const models = Object.keys(conversions);
  function wrapRaw(fn) {
    const wrappedFn = function(...args) {
      const arg0 = args[0];
      if (arg0 === void 0 || arg0 === null) {
        return arg0;
      }
      if (arg0.length > 1) {
        args = arg0;
      }
      return fn(args);
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  function wrapRounded(fn) {
    const wrappedFn = function(...args) {
      const arg0 = args[0];
      if (arg0 === void 0 || arg0 === null) {
        return arg0;
      }
      if (arg0.length > 1) {
        args = arg0;
      }
      const result = fn(args);
      if (typeof result === "object") {
        for (let len = result.length, i = 0; i < len; i++) {
          result[i] = Math.round(result[i]);
        }
      }
      return result;
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  models.forEach((fromModel) => {
    convert[fromModel] = {};
    Object.defineProperty(convert[fromModel], "channels", {value: conversions[fromModel].channels});
    Object.defineProperty(convert[fromModel], "labels", {value: conversions[fromModel].labels});
    const routes = route(fromModel);
    const routeModels = Object.keys(routes);
    routeModels.forEach((toModel) => {
      const fn = routes[toModel];
      convert[fromModel][toModel] = wrapRounded(fn);
      convert[fromModel][toModel].raw = wrapRaw(fn);
    });
  });
  module2.exports = convert;
});

// ../../node_modules/.pnpm/ansi-styles@4.3.0/node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS((exports, module2) => {
  "use strict";
  const wrapAnsi16 = (fn, offset) => (...args) => {
    const code = fn(...args);
    return `[${code + offset}m`;
  };
  const wrapAnsi256 = (fn, offset) => (...args) => {
    const code = fn(...args);
    return `[${38 + offset};5;${code}m`;
  };
  const wrapAnsi16m = (fn, offset) => (...args) => {
    const rgb = fn(...args);
    return `[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
  };
  const ansi2ansi = (n) => n;
  const rgb2rgb = (r, g, b) => [r, g, b];
  const setLazyProperty = (object, property, get) => {
    Object.defineProperty(object, property, {
      get: () => {
        const value = get();
        Object.defineProperty(object, property, {
          value,
          enumerable: true,
          configurable: true
        });
        return value;
      },
      enumerable: true,
      configurable: true
    });
  };
  let colorConvert;
  const makeDynamicStyles = (wrap, targetSpace, identity2, isBackground) => {
    if (colorConvert === void 0) {
      colorConvert = require_color_convert();
    }
    const offset = isBackground ? 10 : 0;
    const styles = {};
    for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
      const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
      if (sourceSpace === targetSpace) {
        styles[name] = wrap(identity2, offset);
      } else if (typeof suite === "object") {
        styles[name] = wrap(suite[targetSpace], offset);
      }
    }
    return styles;
  };
  function assembleStyles() {
    const codes = new Map();
    const styles = {
      modifier: {
        reset: [0, 0],
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        blackBright: [90, 39],
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    };
    styles.color.gray = styles.color.blackBright;
    styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
    styles.color.grey = styles.color.blackBright;
    styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
    for (const [groupName, group] of Object.entries(styles)) {
      for (const [styleName, style] of Object.entries(group)) {
        styles[styleName] = {
          open: `[${style[0]}m`,
          close: `[${style[1]}m`
        };
        group[styleName] = styles[styleName];
        codes.set(style[0], style[1]);
      }
      Object.defineProperty(styles, groupName, {
        value: group,
        enumerable: false
      });
    }
    Object.defineProperty(styles, "codes", {
      value: codes,
      enumerable: false
    });
    styles.color.close = "[39m";
    styles.bgColor.close = "[49m";
    setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
    setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
    setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
    setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
    setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
    setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
    return styles;
  }
  Object.defineProperty(module2, "exports", {
    enumerable: true,
    get: assembleStyles
  });
});

// ../../node_modules/.pnpm/has-flag@4.0.0/node_modules/has-flag/index.js
var require_has_flag = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
});

// ../../node_modules/.pnpm/supports-color@7.2.0/node_modules/supports-color/index.js
var require_supports_color = __commonJS((exports, module2) => {
  "use strict";
  const os = require("os");
  const tty = require("tty");
  const hasFlag = require_has_flag();
  const {env} = process;
  let forceColor;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
    forceColor = 0;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min2 = forceColor || 0;
    if (env.TERM === "dumb") {
      return min2;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign2) => sign2 in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min2;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min2;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  }
  module2.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
});

// ../../node_modules/.pnpm/chalk@4.1.0/node_modules/chalk/source/util.js
var require_util = __commonJS((exports, module2) => {
  "use strict";
  const stringReplaceAll = (string, substring, replacer) => {
    let index = string.indexOf(substring);
    if (index === -1) {
      return string;
    }
    const substringLength = substring.length;
    let endIndex = 0;
    let returnValue = "";
    do {
      returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
      endIndex = index + substringLength;
      index = string.indexOf(substring, endIndex);
    } while (index !== -1);
    returnValue += string.substr(endIndex);
    return returnValue;
  };
  const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
    let endIndex = 0;
    let returnValue = "";
    do {
      const gotCR = string[index - 1] === "\r";
      returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
      endIndex = index + 1;
      index = string.indexOf("\n", endIndex);
    } while (index !== -1);
    returnValue += string.substr(endIndex);
    return returnValue;
  };
  module2.exports = {
    stringReplaceAll,
    stringEncaseCRLFWithFirstIndex
  };
});

// ../../node_modules/.pnpm/chalk@4.1.0/node_modules/chalk/source/templates.js
var require_templates = __commonJS((exports, module2) => {
  "use strict";
  const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
  const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
  const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
  const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
  const ESCAPES = new Map([
    ["n", "\n"],
    ["r", "\r"],
    ["t", "	"],
    ["b", "\b"],
    ["f", "\f"],
    ["v", "\v"],
    ["0", "\0"],
    ["\\", "\\"],
    ["e", ""],
    ["a", "\x07"]
  ]);
  function unescape(c) {
    const u = c[0] === "u";
    const bracket = c[1] === "{";
    if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) {
      return String.fromCharCode(parseInt(c.slice(1), 16));
    }
    if (u && bracket) {
      return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
    }
    return ESCAPES.get(c) || c;
  }
  function parseArguments(name, arguments_) {
    const results = [];
    const chunks = arguments_.trim().split(/\s*,\s*/g);
    let matches;
    for (const chunk of chunks) {
      const number = Number(chunk);
      if (!Number.isNaN(number)) {
        results.push(number);
      } else if (matches = chunk.match(STRING_REGEX)) {
        results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
      } else {
        throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
      }
    }
    return results;
  }
  function parseStyle(style) {
    STYLE_REGEX.lastIndex = 0;
    const results = [];
    let matches;
    while ((matches = STYLE_REGEX.exec(style)) !== null) {
      const name = matches[1];
      if (matches[2]) {
        const args = parseArguments(name, matches[2]);
        results.push([name].concat(args));
      } else {
        results.push([name]);
      }
    }
    return results;
  }
  function buildStyle(chalk13, styles) {
    const enabled = {};
    for (const layer of styles) {
      for (const style of layer.styles) {
        enabled[style[0]] = layer.inverse ? null : style.slice(1);
      }
    }
    let current = chalk13;
    for (const [styleName, styles2] of Object.entries(enabled)) {
      if (!Array.isArray(styles2)) {
        continue;
      }
      if (!(styleName in current)) {
        throw new Error(`Unknown Chalk style: ${styleName}`);
      }
      current = styles2.length > 0 ? current[styleName](...styles2) : current[styleName];
    }
    return current;
  }
  module2.exports = (chalk13, temporary) => {
    const styles = [];
    const chunks = [];
    let chunk = [];
    temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
      if (escapeCharacter) {
        chunk.push(unescape(escapeCharacter));
      } else if (style) {
        const string = chunk.join("");
        chunk = [];
        chunks.push(styles.length === 0 ? string : buildStyle(chalk13, styles)(string));
        styles.push({inverse, styles: parseStyle(style)});
      } else if (close) {
        if (styles.length === 0) {
          throw new Error("Found extraneous } in Chalk template literal");
        }
        chunks.push(buildStyle(chalk13, styles)(chunk.join("")));
        chunk = [];
        styles.pop();
      } else {
        chunk.push(character);
      }
    });
    chunks.push(chunk.join(""));
    if (styles.length > 0) {
      const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
      throw new Error(errMessage);
    }
    return chunks.join("");
  };
});

// ../../node_modules/.pnpm/chalk@4.1.0/node_modules/chalk/source/index.js
var require_source = __commonJS((exports, module2) => {
  "use strict";
  const ansiStyles = require_ansi_styles();
  const {stdout: stdoutColor, stderr: stderrColor} = require_supports_color();
  const {
    stringReplaceAll,
    stringEncaseCRLFWithFirstIndex
  } = require_util();
  const {isArray} = Array;
  const levelMapping = [
    "ansi",
    "ansi",
    "ansi256",
    "ansi16m"
  ];
  const styles = Object.create(null);
  const applyOptions = (object, options = {}) => {
    if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
      throw new Error("The `level` option should be an integer from 0 to 3");
    }
    const colorLevel = stdoutColor ? stdoutColor.level : 0;
    object.level = options.level === void 0 ? colorLevel : options.level;
  };
  class ChalkClass {
    constructor(options) {
      return chalkFactory(options);
    }
  }
  const chalkFactory = (options) => {
    const chalk14 = {};
    applyOptions(chalk14, options);
    chalk14.template = (...arguments_) => chalkTag(chalk14.template, ...arguments_);
    Object.setPrototypeOf(chalk14, Chalk.prototype);
    Object.setPrototypeOf(chalk14.template, chalk14);
    chalk14.template.constructor = () => {
      throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
    };
    chalk14.template.Instance = ChalkClass;
    return chalk14.template;
  };
  function Chalk(options) {
    return chalkFactory(options);
  }
  for (const [styleName, style] of Object.entries(ansiStyles)) {
    styles[styleName] = {
      get() {
        const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
        Object.defineProperty(this, styleName, {value: builder});
        return builder;
      }
    };
  }
  styles.visible = {
    get() {
      const builder = createBuilder(this, this._styler, true);
      Object.defineProperty(this, "visible", {value: builder});
      return builder;
    }
  };
  const usedModels = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
  for (const model of usedModels) {
    styles[model] = {
      get() {
        const {level} = this;
        return function(...arguments_) {
          const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
          return createBuilder(this, styler, this._isEmpty);
        };
      }
    };
  }
  for (const model of usedModels) {
    const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
    styles[bgModel] = {
      get() {
        const {level} = this;
        return function(...arguments_) {
          const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
          return createBuilder(this, styler, this._isEmpty);
        };
      }
    };
  }
  const proto = Object.defineProperties(() => {
  }, {
    ...styles,
    level: {
      enumerable: true,
      get() {
        return this._generator.level;
      },
      set(level) {
        this._generator.level = level;
      }
    }
  });
  const createStyler = (open, close, parent) => {
    let openAll;
    let closeAll;
    if (parent === void 0) {
      openAll = open;
      closeAll = close;
    } else {
      openAll = parent.openAll + open;
      closeAll = close + parent.closeAll;
    }
    return {
      open,
      close,
      openAll,
      closeAll,
      parent
    };
  };
  const createBuilder = (self, _styler, _isEmpty) => {
    const builder = (...arguments_) => {
      if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
        return applyStyle(builder, chalkTag(builder, ...arguments_));
      }
      return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
    };
    Object.setPrototypeOf(builder, proto);
    builder._generator = self;
    builder._styler = _styler;
    builder._isEmpty = _isEmpty;
    return builder;
  };
  const applyStyle = (self, string) => {
    if (self.level <= 0 || !string) {
      return self._isEmpty ? "" : string;
    }
    let styler = self._styler;
    if (styler === void 0) {
      return string;
    }
    const {openAll, closeAll} = styler;
    if (string.indexOf("") !== -1) {
      while (styler !== void 0) {
        string = stringReplaceAll(string, styler.close, styler.open);
        styler = styler.parent;
      }
    }
    const lfIndex = string.indexOf("\n");
    if (lfIndex !== -1) {
      string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
    }
    return openAll + string + closeAll;
  };
  let template;
  const chalkTag = (chalk14, ...strings) => {
    const [firstString] = strings;
    if (!isArray(firstString) || !isArray(firstString.raw)) {
      return strings.join(" ");
    }
    const arguments_ = strings.slice(1);
    const parts = [firstString.raw[0]];
    for (let i = 1; i < firstString.length; i++) {
      parts.push(String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"), String(firstString.raw[i]));
    }
    if (template === void 0) {
      template = require_templates();
    }
    return template(chalk14, parts.join(""));
  };
  Object.defineProperties(Chalk.prototype, styles);
  const chalk13 = Chalk();
  chalk13.supportsColor = stdoutColor;
  chalk13.stderr = Chalk({level: stderrColor ? stderrColor.level : 0});
  chalk13.stderr.supportsColor = stderrColor;
  module2.exports = chalk13;
});

// ../../node_modules/.pnpm/ms@2.1.2/node_modules/ms/index.js
var require_ms = __commonJS((exports, module2) => {
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module2.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse2(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
});

// ../../node_modules/.pnpm/debug@4.2.0/node_modules/debug/src/common.js
var require_common = __commonJS((exports, module2) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.instances = [];
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      function debug3(...args) {
        if (!debug3.enabled) {
          return;
        }
        const self = debug3;
        const curr = Number(new Date());
        const ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return match;
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug3.namespace = namespace;
      debug3.enabled = createDebug.enabled(namespace);
      debug3.useColors = createDebug.useColors();
      debug3.color = createDebug.selectColor(namespace);
      debug3.destroy = destroy;
      debug3.extend = extend;
      if (typeof createDebug.init === "function") {
        createDebug.init(debug3);
      }
      createDebug.instances.push(debug3);
      return debug3;
    }
    function destroy() {
      const index = createDebug.instances.indexOf(this);
      if (index !== -1) {
        createDebug.instances.splice(index, 1);
        return true;
      }
      return false;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.names = [];
      createDebug.skips = [];
      let i;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i = 0; i < len; i++) {
        if (!split[i]) {
          continue;
        }
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
      for (i = 0; i < createDebug.instances.length; i++) {
        const instance = createDebug.instances[i];
        instance.enabled = createDebug.enabled(instance.namespace);
      }
    }
    function disable() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i;
      let len;
      for (i = 0, len = createDebug.skips.length; i < len; i++) {
        if (createDebug.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = createDebug.names.length; i < len; i++) {
        if (createDebug.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module2.exports = setup;
});

// ../../node_modules/.pnpm/debug@4.2.0/node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module2) => {
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  exports.log = console.debug || console.log || (() => {
  });
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {
    }
  }
  module2.exports = require_common()(exports);
  const {formatters} = module2.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// ../../node_modules/.pnpm/debug@4.2.0/node_modules/debug/src/node.js
var require_node = __commonJS((exports, module2) => {
  const tty = require("tty");
  const util = require("util");
  exports.init = init;
  exports.log = log3;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = require_supports_color();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {
  }
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_2, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  function formatArgs(args) {
    const {namespace: name, useColors: useColors2} = this;
    if (useColors2) {
      const c = this.color;
      const colorCode = "[3" + (c < 8 ? c : "8;5;" + c);
      const prefix = `  ${colorCode};1m${name} [0m`;
      args[0] = prefix + args[0].split("\n").join("\n" + prefix);
      args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  }
  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  }
  function log3(...args) {
    return process.stderr.write(util.format(...args) + "\n");
  }
  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function init(debug3) {
    debug3.inspectOpts = {};
    const keys2 = Object.keys(exports.inspectOpts);
    for (let i = 0; i < keys2.length; i++) {
      debug3.inspectOpts[keys2[i]] = exports.inspectOpts[keys2[i]];
    }
  }
  module2.exports = require_common()(exports);
  const {formatters} = module2.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).replace(/\s*\n\s*/g, " ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// ../../node_modules/.pnpm/debug@4.2.0/node_modules/debug/src/index.js
var require_src = __commonJS((exports, module2) => {
  if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
    module2.exports = require_browser();
  } else {
    module2.exports = require_node();
  }
});

// ../generator-helper/dist/GeneratorProcess.js
var require_GeneratorProcess = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.GeneratorProcess = exports.GeneratorError = void 0;
  const cross_spawn_1 = require_cross_spawn();
  const byline_1 = __importDefault(require_byline());
  const chalk_1 = __importDefault(require_source());
  const debug_1 = __importDefault(require_src());
  const debug3 = debug_1.default("GeneratorProcess");
  let globalMessageId = 1;
  class GeneratorError extends Error {
    constructor(message, code, data) {
      super(message);
      this.code = code;
      this.data = data;
    }
  }
  exports.GeneratorError = GeneratorError;
  class GeneratorProcess {
    constructor(executablePath) {
      this.executablePath = executablePath;
      this.listeners = {};
      this.exitCode = null;
      this.stderrLogs = "";
    }
    async init() {
      if (!this.initPromise) {
        this.initPromise = this.initSingleton();
      }
      return this.initPromise;
    }
    initSingleton() {
      return new Promise((resolve, reject) => {
        try {
          this.child = cross_spawn_1.spawn(this.executablePath, {
            stdio: ["pipe", "inherit", "pipe"],
            env: {
              ...process.env,
              PRISMA_GENERATOR_INVOCATION: "true"
            },
            shell: true
          });
          this.child.on("exit", (code) => {
            this.exitCode = code;
            if (code && code > 0 && this.currentGenerateDeferred) {
              this.currentGenerateDeferred.reject(new Error(this.stderrLogs.split("\n").slice(-5).join("\n")));
            }
          });
          this.child.on("error", (err) => {
            this.lastError = err;
            if (err.message.includes("EACCES")) {
              reject(new Error(`The executable at ${this.executablePath} lacks the right chmod. Please use ${chalk_1.default.bold(`chmod +x ${this.executablePath}`)}`));
            } else {
              reject(err);
            }
          });
          byline_1.default(this.child.stderr).on("data", (line) => {
            const response = String(line);
            this.stderrLogs += response + "\n";
            let data;
            try {
              data = JSON.parse(response);
            } catch (e) {
              debug3(response);
            }
            if (data) {
              this.handleResponse(data);
            }
          });
          setTimeout(() => {
            if (this.exitCode && this.exitCode > 0) {
              reject(new Error(`Generator at ${this.executablePath} could not start:

${this.stderrLogs}`));
            } else {
              resolve();
            }
          }, 200);
        } catch (e) {
          reject(e);
        }
      });
    }
    handleResponse(data) {
      if (data.jsonrpc && data.id) {
        if (typeof data.id !== "number") {
          throw new Error(`message.id has to be a number. Found value ${data.id}`);
        }
        if (this.listeners[data.id]) {
          if (data.error) {
            const error = new GeneratorError(data.error.message, data.error.code, data.error.data);
            this.listeners[data.id](null, error);
          } else {
            this.listeners[data.id](data.result);
          }
          delete this.listeners[data.id];
        }
      }
    }
    registerListener(messageId, cb) {
      this.listeners[messageId] = cb;
    }
    sendMessage(message) {
      this.child.stdin.write(JSON.stringify(message) + "\n");
    }
    getMessageId() {
      return globalMessageId++;
    }
    stop() {
      if (!this.child.killed) {
        this.child.kill();
      }
    }
    getManifest() {
      return new Promise((resolve, reject) => {
        const messageId = this.getMessageId();
        this.registerListener(messageId, (result, error) => {
          if (error) {
            return reject(error);
          }
          if (result.manifest) {
            resolve(result.manifest);
          } else {
            resolve(null);
          }
        });
        this.sendMessage({
          jsonrpc: "2.0",
          method: "getManifest",
          params: {},
          id: messageId
        });
      });
    }
    generate(options) {
      return new Promise((resolve, reject) => {
        const messageId = this.getMessageId();
        this.currentGenerateDeferred = {resolve, reject};
        this.registerListener(messageId, (result, error) => {
          if (error) {
            reject(error);
            this.currentGenerateDeferred = void 0;
            return;
          }
          resolve(result);
          this.currentGenerateDeferred = void 0;
        });
        this.sendMessage({
          jsonrpc: "2.0",
          method: "generate",
          params: options,
          id: messageId
        });
      });
    }
  }
  exports.GeneratorProcess = GeneratorProcess;
});

// ../generator-helper/dist/generatorHandler.js
var require_generatorHandler = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.generatorHandler = void 0;
  const byline_1 = __importDefault(require_byline());
  function generatorHandler(handler) {
    byline_1.default(process.stdin).on("data", async (line) => {
      const json = JSON.parse(String(line));
      if (json.method === "generate" && json.params) {
        try {
          const result = await handler.onGenerate(json.params);
          respond({
            jsonrpc: "2.0",
            result,
            id: json.id
          });
        } catch (e) {
          respond({
            jsonrpc: "2.0",
            error: {
              code: -32e3,
              message: e.stack || e.message,
              data: null
            },
            id: json.id
          });
        }
      }
      if (json.method === "getManifest") {
        if (handler.onManifest) {
          try {
            const manifest = handler.onManifest();
            respond({
              jsonrpc: "2.0",
              result: {
                manifest
              },
              id: json.id
            });
          } catch (e) {
            respond({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message: e.stack || e.message,
                data: null
              },
              id: json.id
            });
          }
        } else {
          respond({
            jsonrpc: "2.0",
            result: {
              manifest: null
            },
            id: json.id
          });
        }
      }
    });
    process.stdin.resume();
  }
  exports.generatorHandler = generatorHandler;
  function respond(response) {
    console.error(JSON.stringify(response));
  }
});

// ../generator-helper/dist/types.js
var require_types = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
});

// ../generator-helper/dist/dmmf.js
var require_dmmf = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.DMMF = void 0;
  var DMMF2;
  (function(DMMF3) {
    let ModelAction;
    (function(ModelAction2) {
      ModelAction2["findOne"] = "findOne";
      ModelAction2["findFirst"] = "findFirst";
      ModelAction2["findMany"] = "findMany";
      ModelAction2["create"] = "create";
      ModelAction2["update"] = "update";
      ModelAction2["updateMany"] = "updateMany";
      ModelAction2["upsert"] = "upsert";
      ModelAction2["delete"] = "delete";
      ModelAction2["deleteMany"] = "deleteMany";
    })(ModelAction = DMMF3.ModelAction || (DMMF3.ModelAction = {}));
  })(DMMF2 = exports.DMMF || (exports.DMMF = {}));
});

// ../generator-helper/dist/index.js
var require_dist = __commonJS((exports) => {
  "use strict";
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar2 = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.generatorHandler = exports.GeneratorError = exports.GeneratorProcess = void 0;
  var GeneratorProcess_1 = require_GeneratorProcess();
  Object.defineProperty(exports, "GeneratorProcess", {enumerable: true, get: function() {
    return GeneratorProcess_1.GeneratorProcess;
  }});
  Object.defineProperty(exports, "GeneratorError", {enumerable: true, get: function() {
    return GeneratorProcess_1.GeneratorError;
  }});
  var generatorHandler_1 = require_generatorHandler();
  Object.defineProperty(exports, "generatorHandler", {enumerable: true, get: function() {
    return generatorHandler_1.generatorHandler;
  }});
  __exportStar2(require_types(), exports);
  __exportStar2(require_dmmf(), exports);
});

// ../../node_modules/.pnpm/indent-string@4.0.0/node_modules/indent-string/index.js
var require_indent_string = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = (string, count = 1, options) => {
    options = {
      indent: " ",
      includeEmptyLines: false,
      ...options
    };
    if (typeof string !== "string") {
      throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof string}\``);
    }
    if (typeof count !== "number") {
      throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``);
    }
    if (typeof options.indent !== "string") {
      throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof options.indent}\``);
    }
    if (count === 0) {
      return string;
    }
    const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
    return string.replace(regex, options.indent.repeat(count));
  };
});

// ../../node_modules/.pnpm/js-levenshtein@1.1.6/node_modules/js-levenshtein/index.js
var require_js_levenshtein = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = function() {
    function _min(d0, d1, d2, bx, ay) {
      return d0 < d1 || d2 < d1 ? d0 > d2 ? d2 + 1 : d0 + 1 : bx === ay ? d1 : d1 + 1;
    }
    return function(a, b) {
      if (a === b) {
        return 0;
      }
      if (a.length > b.length) {
        var tmp = a;
        a = b;
        b = tmp;
      }
      var la = a.length;
      var lb = b.length;
      while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
        la--;
        lb--;
      }
      var offset = 0;
      while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
        offset++;
      }
      la -= offset;
      lb -= offset;
      if (la === 0 || lb < 3) {
        return lb;
      }
      var x = 0;
      var y;
      var d0;
      var d1;
      var d2;
      var d3;
      var dd;
      var dy;
      var ay;
      var bx0;
      var bx1;
      var bx2;
      var bx3;
      var vector = [];
      for (y = 0; y < la; y++) {
        vector.push(y + 1);
        vector.push(a.charCodeAt(offset + y));
      }
      var len = vector.length - 1;
      for (; x < lb - 3; ) {
        bx0 = b.charCodeAt(offset + (d0 = x));
        bx1 = b.charCodeAt(offset + (d1 = x + 1));
        bx2 = b.charCodeAt(offset + (d2 = x + 2));
        bx3 = b.charCodeAt(offset + (d3 = x + 3));
        dd = x += 4;
        for (y = 0; y < len; y += 2) {
          dy = vector[y];
          ay = vector[y + 1];
          d0 = _min(dy, d0, d1, bx0, ay);
          d1 = _min(d0, d1, d2, bx1, ay);
          d2 = _min(d1, d2, d3, bx2, ay);
          dd = _min(d2, d3, dd, bx3, ay);
          vector[y] = dd;
          d3 = d2;
          d2 = d1;
          d1 = d0;
          d0 = dy;
        }
      }
      for (; x < lb; ) {
        bx0 = b.charCodeAt(offset + (d0 = x));
        dd = ++x;
        for (y = 0; y < len; y += 2) {
          dy = vector[y];
          vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
          d0 = dy;
        }
      }
      return dd;
    };
  }();
});

// ../../node_modules/.pnpm/ansi-regex@5.0.0/node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = ({onlyFirst = false} = {}) => {
    const pattern = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(pattern, onlyFirst ? void 0 : "g");
  };
});

// ../../node_modules/.pnpm/strip-ansi@6.0.0/node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS((exports, module2) => {
  "use strict";
  const ansiRegex = require_ansi_regex();
  module2.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
});

// ../../node_modules/.pnpm/is-regexp@2.1.0/node_modules/is-regexp/index.js
var require_is_regexp = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = (input) => Object.prototype.toString.call(input) === "[object RegExp]";
});

// ../../node_modules/.pnpm/is-obj@2.0.0/node_modules/is-obj/index.js
var require_is_obj = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = (value) => {
    const type = typeof value;
    return value !== null && (type === "object" || type === "function");
  };
});

// ../../node_modules/.pnpm/get-own-enumerable-property-symbols@3.0.2/node_modules/get-own-enumerable-property-symbols/lib/index.js
var require_lib = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.default = (object) => Object.getOwnPropertySymbols(object).filter((keySymbol) => Object.prototype.propertyIsEnumerable.call(object, keySymbol));
});

// ../../node_modules/.pnpm/stacktrace-parser@0.1.10/node_modules/stacktrace-parser/dist/stack-trace-parser.cjs.js
var require_stack_trace_parser_cjs = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var UNKNOWN_FUNCTION = "<unknown>";
  function parse2(stackString) {
    var lines = stackString.split("\n");
    return lines.reduce(function(stack, line) {
      var parseResult = parseChrome(line) || parseWinjs(line) || parseGecko(line) || parseNode(line) || parseJSC(line);
      if (parseResult) {
        stack.push(parseResult);
      }
      return stack;
    }, []);
  }
  var chromeRe = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  var chromeEvalRe = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  function parseChrome(line) {
    var parts = chromeRe.exec(line);
    if (!parts) {
      return null;
    }
    var isNative = parts[2] && parts[2].indexOf("native") === 0;
    var isEval = parts[2] && parts[2].indexOf("eval") === 0;
    var submatch = chromeEvalRe.exec(parts[2]);
    if (isEval && submatch != null) {
      parts[2] = submatch[1];
      parts[3] = submatch[2];
      parts[4] = submatch[3];
    }
    return {
      file: !isNative ? parts[2] : null,
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: isNative ? [parts[2]] : [],
      lineNumber: parts[3] ? +parts[3] : null,
      column: parts[4] ? +parts[4] : null
    };
  }
  var winjsRe = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
  function parseWinjs(line) {
    var parts = winjsRe.exec(line);
    if (!parts) {
      return null;
    }
    return {
      file: parts[2],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: [],
      lineNumber: +parts[3],
      column: parts[4] ? +parts[4] : null
    };
  }
  var geckoRe = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
  var geckoEvalRe = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
  function parseGecko(line) {
    var parts = geckoRe.exec(line);
    if (!parts) {
      return null;
    }
    var isEval = parts[3] && parts[3].indexOf(" > eval") > -1;
    var submatch = geckoEvalRe.exec(parts[3]);
    if (isEval && submatch != null) {
      parts[3] = submatch[1];
      parts[4] = submatch[2];
      parts[5] = null;
    }
    return {
      file: parts[3],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: parts[2] ? parts[2].split(",") : [],
      lineNumber: parts[4] ? +parts[4] : null,
      column: parts[5] ? +parts[5] : null
    };
  }
  var javaScriptCoreRe = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
  function parseJSC(line) {
    var parts = javaScriptCoreRe.exec(line);
    if (!parts) {
      return null;
    }
    return {
      file: parts[3],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: [],
      lineNumber: +parts[4],
      column: parts[5] ? +parts[5] : null
    };
  }
  var nodeRe = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
  function parseNode(line) {
    var parts = nodeRe.exec(line);
    if (!parts) {
      return null;
    }
    return {
      file: parts[2],
      methodName: parts[1] || UNKNOWN_FUNCTION,
      arguments: [],
      lineNumber: +parts[3],
      column: parts[4] ? +parts[4] : null
    };
  }
  exports.parse = parse2;
});

// ../../node_modules/.pnpm/min-indent@1.0.1/node_modules/min-indent/index.js
var require_min_indent = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = (string) => {
    const match = string.match(/^[ \t]*(?=\S)/gm);
    if (!match) {
      return 0;
    }
    return match.reduce((r, a) => Math.min(r, a.length), Infinity);
  };
});

// ../../node_modules/.pnpm/strip-indent@3.0.0/node_modules/strip-indent/index.js
var require_strip_indent = __commonJS((exports, module2) => {
  "use strict";
  const minIndent = require_min_indent();
  module2.exports = (string) => {
    const indent3 = minIndent(string);
    if (indent3 === 0) {
      return string;
    }
    const regex = new RegExp(`^[ \\t]{${indent3}}`, "gm");
    return string.replace(regex, "");
  };
});

// ../../node_modules/.pnpm/debug@4.1.1/node_modules/debug/src/common.js
var require_common2 = __commonJS((exports, module2) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.instances = [];
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      function debug3(...args) {
        if (!debug3.enabled) {
          return;
        }
        const self = debug3;
        const curr = Number(new Date());
        const ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return match;
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug3.namespace = namespace;
      debug3.enabled = createDebug.enabled(namespace);
      debug3.useColors = createDebug.useColors();
      debug3.color = selectColor(namespace);
      debug3.destroy = destroy;
      debug3.extend = extend;
      if (typeof createDebug.init === "function") {
        createDebug.init(debug3);
      }
      createDebug.instances.push(debug3);
      return debug3;
    }
    function destroy() {
      const index = createDebug.instances.indexOf(this);
      if (index !== -1) {
        createDebug.instances.splice(index, 1);
        return true;
      }
      return false;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.names = [];
      createDebug.skips = [];
      let i;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i = 0; i < len; i++) {
        if (!split[i]) {
          continue;
        }
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
      for (i = 0; i < createDebug.instances.length; i++) {
        const instance = createDebug.instances[i];
        instance.enabled = createDebug.enabled(instance.namespace);
      }
    }
    function disable() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i;
      let len;
      for (i = 0, len = createDebug.skips.length; i < len; i++) {
        if (createDebug.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = createDebug.names.length; i < len; i++) {
        if (createDebug.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module2.exports = setup;
});

// ../../node_modules/.pnpm/debug@4.1.1/node_modules/debug/src/browser.js
var require_browser2 = __commonJS((exports, module2) => {
  exports.log = log3;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  function log3(...args) {
    return typeof console === "object" && console.log && console.log(...args);
  }
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {
    }
  }
  module2.exports = require_common2()(exports);
  const {formatters} = module2.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// ../../node_modules/.pnpm/debug@4.1.1/node_modules/debug/src/node.js
var require_node2 = __commonJS((exports, module2) => {
  const tty = require("tty");
  const util = require("util");
  exports.init = init;
  exports.log = log3;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = require_supports_color();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {
  }
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_2, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  function formatArgs(args) {
    const {namespace: name, useColors: useColors2} = this;
    if (useColors2) {
      const c = this.color;
      const colorCode = "[3" + (c < 8 ? c : "8;5;" + c);
      const prefix = `  ${colorCode};1m${name} [0m`;
      args[0] = prefix + args[0].split("\n").join("\n" + prefix);
      args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  }
  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  }
  function log3(...args) {
    return process.stderr.write(util.format(...args) + "\n");
  }
  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function init(debug3) {
    debug3.inspectOpts = {};
    const keys2 = Object.keys(exports.inspectOpts);
    for (let i = 0; i < keys2.length; i++) {
      debug3.inspectOpts[keys2[i]] = exports.inspectOpts[keys2[i]];
    }
  }
  module2.exports = require_common2()(exports);
  const {formatters} = module2.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).replace(/\s*\n\s*/g, " ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// ../../node_modules/.pnpm/debug@4.1.1/node_modules/debug/src/index.js
var require_src2 = __commonJS((exports, module2) => {
  if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
    module2.exports = require_browser2();
  } else {
    module2.exports = require_node2();
  }
});

// ../debug/dist/index.js
var require_dist2 = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getLogs = void 0;
  const debug_1 = __importDefault(require_src2());
  const cache = [];
  const MAX_LOGS = 100;
  const namespaces = [];
  const enabledNamespaces = new Map();
  const envDebug = process.env.DEBUG ? process.env.DEBUG + "," : "";
  const skips = debug_1.default.skips.slice();
  const names = debug_1.default.names.slice();
  function isEnabledByEnvVar(name) {
    if (name[name.length - 1] === "*") {
      return true;
    }
    for (const skip of skips) {
      if (skip.test(name)) {
        return false;
      }
    }
    for (const nameRegex of names) {
      if (nameRegex.test(name)) {
        return true;
      }
    }
    return false;
  }
  function Debug2(namespace) {
    const debug3 = debug_1.default(namespace);
    namespaces.push(namespace);
    debug_1.default.enable(envDebug + namespaces.join(","));
    process.env.DEBUG = envDebug;
    if (isEnabledByEnvVar(namespace)) {
      enabledNamespaces.set(namespace, true);
    }
    const newDebug = (formatter, ...args) => {
      return debug3(formatter, ...args);
    };
    newDebug.log = console.error.bind(console);
    newDebug.color = debug3.color;
    newDebug.namespace = debug3.namespace;
    newDebug.enabled = debug3.enabled;
    newDebug.destroy = debug3.destroy;
    newDebug.extend = debug3.extend;
    debug3.log = (...args) => {
      cache.push(args);
      if (cache.length > MAX_LOGS) {
        cache.shift();
      }
      if (enabledNamespaces.has(namespace)) {
        newDebug.log(...args);
      }
    };
    return newDebug;
  }
  exports.default = Debug2;
  Debug2.enable = (namespace) => {
    enabledNamespaces.set(namespace, true);
  };
  Debug2.enabled = (namespace) => enabledNamespaces.has(namespace);
  function getLogs(numChars = 7500) {
    let output = cache.map((c) => c.join("  ")).join("\n");
    if (output.length < numChars) {
      return output;
    }
    return output.slice(-numChars);
  }
  exports.getLogs = getLogs;
});

// ../engine-core/dist/log.js
var require_log = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.convertLog = exports.isRustError = void 0;
  function isRustError(e) {
    return typeof e.is_panic !== "undefined";
  }
  exports.isRustError = isRustError;
  function convertLog(rustLog) {
    const isQuery = isQueryLog(rustLog.fields);
    const level = isQuery ? "query" : rustLog.level.toLowerCase();
    return {
      ...rustLog,
      level,
      timestamp: new Date(new Date().getFullYear() + " " + rustLog.timestamp)
    };
  }
  exports.convertLog = convertLog;
  function isQueryLog(fields) {
    return Boolean(fields.query);
  }
});

// ../../node_modules/.pnpm/ansi-escapes@4.3.1/node_modules/ansi-escapes/index.js
var require_ansi_escapes = __commonJS((exports, module2) => {
  "use strict";
  const ansiEscapes = module2.exports;
  module2.exports.default = ansiEscapes;
  const ESC = "[";
  const OSC = "]";
  const BEL = "\x07";
  const SEP = ";";
  const isTerminalApp = process.env.TERM_PROGRAM === "Apple_Terminal";
  ansiEscapes.cursorTo = (x, y) => {
    if (typeof x !== "number") {
      throw new TypeError("The `x` argument is required");
    }
    if (typeof y !== "number") {
      return ESC + (x + 1) + "G";
    }
    return ESC + (y + 1) + ";" + (x + 1) + "H";
  };
  ansiEscapes.cursorMove = (x, y) => {
    if (typeof x !== "number") {
      throw new TypeError("The `x` argument is required");
    }
    let ret = "";
    if (x < 0) {
      ret += ESC + -x + "D";
    } else if (x > 0) {
      ret += ESC + x + "C";
    }
    if (y < 0) {
      ret += ESC + -y + "A";
    } else if (y > 0) {
      ret += ESC + y + "B";
    }
    return ret;
  };
  ansiEscapes.cursorUp = (count = 1) => ESC + count + "A";
  ansiEscapes.cursorDown = (count = 1) => ESC + count + "B";
  ansiEscapes.cursorForward = (count = 1) => ESC + count + "C";
  ansiEscapes.cursorBackward = (count = 1) => ESC + count + "D";
  ansiEscapes.cursorLeft = ESC + "G";
  ansiEscapes.cursorSavePosition = isTerminalApp ? "7" : ESC + "s";
  ansiEscapes.cursorRestorePosition = isTerminalApp ? "8" : ESC + "u";
  ansiEscapes.cursorGetPosition = ESC + "6n";
  ansiEscapes.cursorNextLine = ESC + "E";
  ansiEscapes.cursorPrevLine = ESC + "F";
  ansiEscapes.cursorHide = ESC + "?25l";
  ansiEscapes.cursorShow = ESC + "?25h";
  ansiEscapes.eraseLines = (count) => {
    let clear = "";
    for (let i = 0; i < count; i++) {
      clear += ansiEscapes.eraseLine + (i < count - 1 ? ansiEscapes.cursorUp() : "");
    }
    if (count) {
      clear += ansiEscapes.cursorLeft;
    }
    return clear;
  };
  ansiEscapes.eraseEndLine = ESC + "K";
  ansiEscapes.eraseStartLine = ESC + "1K";
  ansiEscapes.eraseLine = ESC + "2K";
  ansiEscapes.eraseDown = ESC + "J";
  ansiEscapes.eraseUp = ESC + "1J";
  ansiEscapes.eraseScreen = ESC + "2J";
  ansiEscapes.scrollUp = ESC + "S";
  ansiEscapes.scrollDown = ESC + "T";
  ansiEscapes.clearScreen = "c";
  ansiEscapes.clearTerminal = process.platform === "win32" ? `${ansiEscapes.eraseScreen}${ESC}0f` : `${ansiEscapes.eraseScreen}${ESC}3J${ESC}H`;
  ansiEscapes.beep = BEL;
  ansiEscapes.link = (text, url) => {
    return [
      OSC,
      "8",
      SEP,
      SEP,
      url,
      BEL,
      text,
      OSC,
      "8",
      SEP,
      SEP,
      BEL
    ].join("");
  };
  ansiEscapes.image = (buffer, options = {}) => {
    let ret = `${OSC}1337;File=inline=1`;
    if (options.width) {
      ret += `;width=${options.width}`;
    }
    if (options.height) {
      ret += `;height=${options.height}`;
    }
    if (options.preserveAspectRatio === false) {
      ret += ";preserveAspectRatio=0";
    }
    return ret + ":" + buffer.toString("base64") + BEL;
  };
  ansiEscapes.iTerm = {
    setCwd: (cwd = process.cwd()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,
    annotation: (message, options = {}) => {
      let ret = `${OSC}1337;`;
      const hasX = typeof options.x !== "undefined";
      const hasY = typeof options.y !== "undefined";
      if ((hasX || hasY) && !(hasX && hasY && typeof options.length !== "undefined")) {
        throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
      }
      message = message.replace(/\|/g, "");
      ret += options.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=";
      if (options.length > 0) {
        ret += (hasX ? [message, options.length, options.x, options.y] : [options.length, message]).join("|");
      } else {
        ret += message;
      }
      return ret + BEL;
    }
  };
});

// ../../node_modules/.pnpm/supports-hyperlinks@2.1.0/node_modules/supports-hyperlinks/index.js
var require_supports_hyperlinks = __commonJS((exports, module2) => {
  "use strict";
  const supportsColor = require_supports_color();
  const hasFlag = require_has_flag();
  function parseVersion(versionString) {
    if (/^\d{3,4}$/.test(versionString)) {
      const m = /(\d{1,2})(\d{2})/.exec(versionString);
      return {
        major: 0,
        minor: parseInt(m[1], 10),
        patch: parseInt(m[2], 10)
      };
    }
    const versions = (versionString || "").split(".").map((n) => parseInt(n, 10));
    return {
      major: versions[0],
      minor: versions[1],
      patch: versions[2]
    };
  }
  function supportsHyperlink(stream) {
    const {env} = process;
    if ("FORCE_HYPERLINK" in env) {
      return !(env.FORCE_HYPERLINK.length > 0 && parseInt(env.FORCE_HYPERLINK, 10) === 0);
    }
    if (hasFlag("no-hyperlink") || hasFlag("no-hyperlinks") || hasFlag("hyperlink=false") || hasFlag("hyperlink=never")) {
      return false;
    }
    if (hasFlag("hyperlink=true") || hasFlag("hyperlink=always")) {
      return true;
    }
    if (!supportsColor.supportsColor(stream)) {
      return false;
    }
    if (stream && !stream.isTTY) {
      return false;
    }
    if (process.platform === "win32") {
      return false;
    }
    if ("CI" in env) {
      return false;
    }
    if ("TEAMCITY_VERSION" in env) {
      return false;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseVersion(env.TERM_PROGRAM_VERSION);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          if (version.major === 3) {
            return version.minor >= 1;
          }
          return version.major > 3;
      }
    }
    if ("VTE_VERSION" in env) {
      if (env.VTE_VERSION === "0.50.0") {
        return false;
      }
      const version = parseVersion(env.VTE_VERSION);
      return version.major > 0 || version.minor >= 50;
    }
    return false;
  }
  module2.exports = {
    supportsHyperlink,
    stdout: supportsHyperlink(process.stdout),
    stderr: supportsHyperlink(process.stderr)
  };
});

// ../../node_modules/.pnpm/terminal-link@2.1.1/node_modules/terminal-link/index.js
var require_terminal_link = __commonJS((exports, module2) => {
  "use strict";
  const ansiEscapes = require_ansi_escapes();
  const supportsHyperlinks = require_supports_hyperlinks();
  const terminalLink = (text, url, {target = "stdout", ...options} = {}) => {
    if (!supportsHyperlinks[target]) {
      if (options.fallback === false) {
        return text;
      }
      return typeof options.fallback === "function" ? options.fallback(text, url) : `${text} (​${url}​)`;
    }
    return ansiEscapes.link(text, url);
  };
  module2.exports = (text, url, options = {}) => terminalLink(text, url, options);
  module2.exports.stderr = (text, url, options = {}) => terminalLink(text, url, {target: "stderr", ...options});
  module2.exports.isSupported = supportsHyperlinks.stdout;
  module2.exports.stderr.isSupported = supportsHyperlinks.stderr;
});

// ../../node_modules/.pnpm/new-github-issue-url@0.2.1/node_modules/new-github-issue-url/index.js
var require_new_github_issue_url = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = (options = {}) => {
    let repoUrl;
    if (options.repoUrl) {
      repoUrl = options.repoUrl;
    } else if (options.user && options.repo) {
      repoUrl = `https://github.com/${options.user}/${options.repo}`;
    } else {
      throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
    }
    const url = new URL(`${repoUrl}/issues/new`);
    const types = [
      "body",
      "title",
      "labels",
      "template",
      "milestone",
      "assignee",
      "projects"
    ];
    for (const type of types) {
      let value = options[type];
      if (value === void 0) {
        continue;
      }
      if (type === "labels" || type === "projects") {
        if (!Array.isArray(value)) {
          throw new TypeError(`The \`${type}\` option should be an array`);
        }
        value = value.join(",");
      }
      url.searchParams.set(type, value);
    }
    return url.toString();
  };
  module2.exports.default = module2.exports;
});

// ../engine-core/dist/util.js
var require_util2 = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getRandomString = exports.getGithubIssueUrl = exports.link = exports.fixBinaryTargets = exports.plusX = void 0;
  const fs_1 = __importDefault(require("fs"));
  const terminal_link_1 = __importDefault(require_terminal_link());
  const new_github_issue_url_1 = __importDefault(require_new_github_issue_url());
  const chalk_1 = __importDefault(require_source());
  const debug_1 = __importDefault(require_dist2());
  const crypto_1 = __importDefault(require("crypto"));
  const debug3 = debug_1.default("plusX");
  function plusX(file) {
    const s = fs_1.default.statSync(file);
    const newMode = s.mode | 64 | 8 | 1;
    if (s.mode === newMode) {
      debug3(`Execution permissions of ${file} are fine`);
      return;
    }
    const base8 = newMode.toString(8).slice(-3);
    debug3(`Have to call plusX on ${file}`);
    fs_1.default.chmodSync(file, base8);
  }
  exports.plusX = plusX;
  function fixBinaryTargets(platforms, platform) {
    platforms = platforms || [];
    if (!platforms.includes("native")) {
      return ["native", ...platforms];
    }
    return [...platforms, platform];
  }
  exports.fixBinaryTargets = fixBinaryTargets;
  function link(url) {
    return terminal_link_1.default(url, url, {
      fallback: (url2) => chalk_1.default.underline(url2)
    });
  }
  exports.link = link;
  function getGithubIssueUrl({title, user = "prisma", repo = "prisma-client-js", template = "bug_report.md", body}) {
    return new_github_issue_url_1.default({
      user,
      repo,
      template,
      title,
      body
    });
  }
  exports.getGithubIssueUrl = getGithubIssueUrl;
  function getRandomString() {
    return crypto_1.default.randomBytes(12).toString("hex");
  }
  exports.getRandomString = getRandomString;
});

// ../engine-core/dist/Engine.js
var require_Engine = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getErrorMessageWithLink = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = exports.getMessage = void 0;
  const log_1 = require_log();
  const debug_1 = require_dist2();
  const util_1 = require_util2();
  const strip_ansi_1 = __importDefault(require_strip_ansi());
  function getMessage(log3) {
    if (typeof log3 === "string") {
      return log3;
    } else if (log_1.isRustError(log3)) {
      return log3.message;
    } else if (log3.fields && log3.fields.message) {
      if (log3.fields.reason) {
        return `${log3.fields.message}: ${log3.fields.reason}`;
      }
      return log3.fields.message;
    } else {
      return JSON.stringify(log3);
    }
  }
  exports.getMessage = getMessage;
  class PrismaClientKnownRequestError2 extends Error {
    constructor(message, code, clientVersion3, meta) {
      super(message);
      this.code = code;
      this.clientVersion = clientVersion3;
      this.meta = meta;
    }
  }
  exports.PrismaClientKnownRequestError = PrismaClientKnownRequestError2;
  class PrismaClientUnknownRequestError2 extends Error {
    constructor(message, clientVersion3) {
      super(message);
      this.clientVersion = clientVersion3;
    }
  }
  exports.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError2;
  class PrismaClientRustPanicError2 extends Error {
    constructor(message, clientVersion3) {
      super(message);
      this.clientVersion = clientVersion3;
    }
  }
  exports.PrismaClientRustPanicError = PrismaClientRustPanicError2;
  class PrismaClientInitializationError2 extends Error {
    constructor(message, clientVersion3) {
      super(message);
      this.clientVersion = clientVersion3;
    }
  }
  exports.PrismaClientInitializationError = PrismaClientInitializationError2;
  function getErrorMessageWithLink({version, platform, title, description}) {
    const logs = normalizeLogs(strip_ansi_1.default(debug_1.getLogs()));
    const moreInfo = description ? `# Description
\`\`\`
${description}
\`\`\`` : "";
    const body = strip_ansi_1.default(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${process.version.padEnd(19)}| 
| OS              | ${platform.padEnd(19)}|
| Prisma Client   | ${version.padEnd(19)}|

${moreInfo}

## Logs
\`\`\`
${logs}
\`\`\``);
    const url = util_1.getGithubIssueUrl({title, body});
    return `${title}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${util_1.link(url)}

If you want the Prisma team to look into it, please open the link above 🙏
`;
  }
  exports.getErrorMessageWithLink = getErrorMessageWithLink;
  function normalizeLogs(logs) {
    return logs.split("\n").map((l) => {
      return l.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "");
    }).join("\n");
  }
});

// ../../node_modules/.pnpm/@prisma/engines-version@2.10.0-16-af1ae11a423edfb5d24092a85be11fa77c5e499c/node_modules/@prisma/engines-version/package.json
var require_package = __commonJS((exports, module2) => {
  module2.exports = {
    name: "@prisma/engines-version",
    version: "2.10.0-16-af1ae11a423edfb5d24092a85be11fa77c5e499c",
    main: "index.js",
    types: "index.d.ts",
    license: "Apache-2.0",
    author: "Tim Suchanek <suchanek@prisma.io>",
    prisma: {
      enginesVersion: "af1ae11a423edfb5d24092a85be11fa77c5e499c"
    },
    devDependencies: {
      "@types/node": "^14.11.8",
      typescript: "^4.0.3"
    },
    scripts: {
      build: "tsc -d",
      prepublishOnly: "tsc -d",
      publish: "echo $GITHUB_CONTEXT"
    },
    files: [
      "index.js",
      "index.d.ts"
    ]
  };
});

// ../../node_modules/.pnpm/@prisma/engines-version@2.10.0-16-af1ae11a423edfb5d24092a85be11fa77c5e499c/node_modules/@prisma/engines-version/index.js
var require_engines_version = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.enginesVersion = void 0;
  exports.enginesVersion = require_package().prisma.enginesVersion;
});

// ../../node_modules/.pnpm/@prisma/engines@2.10.0-16-af1ae11a423edfb5d24092a85be11fa77c5e499c/node_modules/@prisma/engines/dist/index.js
var require_dist3 = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.enginesVersion = exports.getEnginesPath = void 0;
  const path_1 = __importDefault(require("path"));
  function getEnginesPath() {
    return path_1.default.join(__dirname, "../");
  }
  exports.getEnginesPath = getEnginesPath;
  var engines_version_1 = require_engines_version();
  Object.defineProperty(exports, "enginesVersion", {enumerable: true, get: function() {
    return engines_version_1.enginesVersion;
  }});
});

// ../get-platform/dist/getPlatform.js
var require_getPlatform = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getPlatform = exports.getOpenSSLVersion = exports.parseOpenSSLVersion = exports.resolveDistro = exports.parseDistro = exports.getos = void 0;
  const os_1 = __importDefault(require("os"));
  const fs_1 = __importDefault(require("fs"));
  const util_1 = require("util");
  const child_process_1 = require("child_process");
  const readFile = util_1.promisify(fs_1.default.readFile);
  const exists = util_1.promisify(fs_1.default.exists);
  async function getos() {
    const platform = os_1.default.platform();
    if (platform === "freebsd") {
      const version = await gracefulExec(`freebsd-version`);
      if (version && version.trim().length > 0) {
        const regex = /^(\d+)\.?/;
        const match = regex.exec(version);
        if (match) {
          return {
            platform: "freebsd",
            distro: `freebsd${match[1]}`
          };
        }
      }
    }
    if (platform !== "linux") {
      return {
        platform
      };
    }
    return {
      platform: "linux",
      libssl: await getOpenSSLVersion(),
      distro: await resolveDistro()
    };
  }
  exports.getos = getos;
  function parseDistro(input) {
    const idRegex = /^ID="?([^"\n]*)"?$/im;
    const idLikeRegex = /^ID_LIKE="?([^"\n]*)"?$/im;
    const idMatch = idRegex.exec(input);
    const id = idMatch && idMatch[1] && idMatch[1].toLowerCase() || "";
    const idLikeMatch = idLikeRegex.exec(input);
    const idLike = idLikeMatch && idLikeMatch[1] && idLikeMatch[1].toLowerCase() || "";
    if (id === "raspbian") {
      return "arm";
    }
    if (id === "nixos") {
      return "nixos";
    }
    if (idLike.includes("centos") || idLike.includes("fedora") || idLike.includes("rhel") || id === "fedora") {
      return "rhel";
    }
    if (idLike.includes("debian") || idLike.includes("ubuntu") || id === "debian") {
      return "debian";
    }
    return;
  }
  exports.parseDistro = parseDistro;
  async function resolveDistro() {
    const osReleaseFile = "/etc/os-release";
    const alpineReleaseFile = "/etc/alpine-release";
    if (await exists(alpineReleaseFile)) {
      return "musl";
    } else if (await exists(osReleaseFile)) {
      return parseDistro(await readFile(osReleaseFile, "utf-8"));
    } else {
      return;
    }
  }
  exports.resolveDistro = resolveDistro;
  function parseOpenSSLVersion(input) {
    const match = /^OpenSSL\s(\d+\.\d+)\.\d+/.exec(input);
    if (match) {
      return match[1] + ".x";
    }
    return;
  }
  exports.parseOpenSSLVersion = parseOpenSSLVersion;
  async function getOpenSSLVersion() {
    const [version, ls] = await Promise.all([
      gracefulExec(`openssl version -v`),
      gracefulExec(`
      ls -l /lib64 | grep ssl;
      ls -l /usr/lib64 | grep ssl;
    `)
    ]);
    if (version) {
      const v = parseOpenSSLVersion(version);
      if (v) {
        return v;
      }
    }
    if (ls) {
      const match = /libssl\.so\.(\d+\.\d+)\.\d+/.exec(ls);
      if (match) {
        return match[1] + ".x";
      }
    }
    return void 0;
  }
  exports.getOpenSSLVersion = getOpenSSLVersion;
  async function gracefulExec(cmd) {
    return new Promise((resolve) => {
      try {
        child_process_1.exec(cmd, (err, stdout) => {
          resolve(String(stdout));
        });
      } catch (e) {
        resolve(void 0);
        return void 0;
      }
    });
  }
  async function getPlatform() {
    const {platform, libssl, distro} = await getos();
    if (platform === "darwin") {
      return "darwin";
    }
    if (platform === "win32") {
      return "windows";
    }
    if (platform === "freebsd") {
      return distro;
    }
    if (platform === "openbsd") {
      return "openbsd";
    }
    if (platform === "netbsd") {
      return "netbsd";
    }
    if (platform === "linux" && distro === "nixos") {
      return "linux-nixos";
    }
    if (platform === "linux" && distro === "musl") {
      return "linux-musl";
    }
    if (platform === "linux" && distro && libssl) {
      return distro + "-openssl-" + libssl;
    }
    if (libssl) {
      return "debian-openssl-" + libssl;
    }
    if (distro) {
      return distro + "-openssl-1.1.x";
    }
    return "debian-openssl-1.1.x";
  }
  exports.getPlatform = getPlatform;
});

// ../get-platform/dist/platforms.js
var require_platforms = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.mayBeCompatible = exports.platforms = void 0;
  exports.platforms = [
    "darwin",
    "debian-openssl-1.0.x",
    "debian-openssl-1.1.x",
    "rhel-openssl-1.0.x",
    "rhel-openssl-1.1.x",
    "linux-musl",
    "linux-nixos",
    "windows",
    "freebsd11",
    "freebsd12",
    "openbsd",
    "netbsd",
    "arm"
  ];
  function mayBeCompatible(platformA, platformB) {
    if (platformA.startsWith("freebsd") || platformB.startsWith("freebsd")) {
      return false;
    }
    if (platformA === "native" || platformB === "native") {
      return true;
    }
    if (platformA === "darwin" || platformB === "darwin") {
      return false;
    }
    if (platformA === "windows" || platformB === "windows") {
      return false;
    }
    return true;
  }
  exports.mayBeCompatible = mayBeCompatible;
});

// ../get-platform/dist/index.js
var require_dist4 = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.platforms = exports.mayBeCompatible = exports.getos = exports.getPlatform = void 0;
  var getPlatform_1 = require_getPlatform();
  Object.defineProperty(exports, "getPlatform", {enumerable: true, get: function() {
    return getPlatform_1.getPlatform;
  }});
  Object.defineProperty(exports, "getos", {enumerable: true, get: function() {
    return getPlatform_1.getos;
  }});
  var platforms_1 = require_platforms();
  Object.defineProperty(exports, "mayBeCompatible", {enumerable: true, get: function() {
    return platforms_1.mayBeCompatible;
  }});
  var platforms_2 = require_platforms();
  Object.defineProperty(exports, "platforms", {enumerable: true, get: function() {
    return platforms_2.platforms;
  }});
});

// ../engine-core/dist/printGeneratorConfig.js
var require_printGeneratorConfig = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.printDatamodelObject = exports.GeneratorConfigClass = exports.printGeneratorConfig = void 0;
  const indent_string_1 = __importDefault(require_indent_string());
  function printGeneratorConfig(config2) {
    return String(new GeneratorConfigClass(config2));
  }
  exports.printGeneratorConfig = printGeneratorConfig;
  class GeneratorConfigClass {
    constructor(config2) {
      this.config = config2;
    }
    toString() {
      const {config: config2} = this;
      const obj = JSON.parse(JSON.stringify({
        provider: config2.provider,
        binaryTargets: config2.binaryTargets || void 0
      }));
      return `generator ${config2.name} {
${indent_string_1.default(printDatamodelObject(obj), 2)}
}`;
    }
  }
  exports.GeneratorConfigClass = GeneratorConfigClass;
  function printDatamodelObject(obj) {
    const maxLength = Object.keys(obj).reduce((max2, curr) => Math.max(max2, curr.length), 0);
    return Object.entries(obj).map(([key, value]) => `${key.padEnd(maxLength)} = ${niceStringify(value)}`).join("\n");
  }
  exports.printDatamodelObject = printDatamodelObject;
  function niceStringify(value) {
    return JSON.parse(JSON.stringify(value, (_2, value2) => {
      if (Array.isArray(value2)) {
        return `[${value2.map((element) => JSON.stringify(element)).join(", ")}]`;
      }
      return JSON.stringify(value2);
    }));
  }
});

// ../engine-core/dist/byline.js
var require_byline2 = __commonJS((exports, module2) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.createLineStream = void 0;
  var stream = require("stream");
  var util = require("util");
  function byline(readStream, options) {
    return module2.exports.createStream(readStream, options);
  }
  exports.default = byline;
  module2.exports.createStream = function(readStream, options) {
    if (readStream) {
      return createLineStream(readStream, options);
    } else {
      return new LineStream(options);
    }
  };
  function createLineStream(readStream, options) {
    if (!readStream) {
      throw new Error("expected readStream");
    }
    if (!readStream.readable) {
      throw new Error("readStream must be readable");
    }
    var ls = new LineStream(options);
    readStream.pipe(ls);
    return ls;
  }
  exports.createLineStream = createLineStream;
  module2.exports.LineStream = LineStream;
  function LineStream(options) {
    stream.Transform.call(this, options);
    options = options || {};
    this._readableState.objectMode = true;
    this._lineBuffer = [];
    this._keepEmptyLines = options.keepEmptyLines || false;
    this._lastChunkEndedWithCR = false;
    this.on("pipe", function(src) {
      if (!this.encoding) {
        if (src instanceof stream.Readable) {
          this.encoding = src._readableState.encoding;
        }
      }
    });
  }
  util.inherits(LineStream, stream.Transform);
  LineStream.prototype._transform = function(chunk, encoding, done) {
    encoding = encoding || "utf8";
    if (Buffer.isBuffer(chunk)) {
      if (encoding == "buffer") {
        chunk = chunk.toString();
        encoding = "utf8";
      } else {
        chunk = chunk.toString(encoding);
      }
    }
    this._chunkEncoding = encoding;
    var lines = chunk.split(/\r\n|\r|\n/g);
    if (this._lastChunkEndedWithCR && chunk[0] == "\n") {
      lines.shift();
    }
    if (this._lineBuffer.length > 0) {
      this._lineBuffer[this._lineBuffer.length - 1] += lines[0];
      lines.shift();
    }
    this._lastChunkEndedWithCR = chunk[chunk.length - 1] == "\r";
    this._lineBuffer = this._lineBuffer.concat(lines);
    this._pushBuffer(encoding, 1, done);
  };
  LineStream.prototype._pushBuffer = function(encoding, keep, done) {
    while (this._lineBuffer.length > keep) {
      var line = this._lineBuffer.shift();
      if (this._keepEmptyLines || line.length > 0) {
        if (!this.push(this._reencode(line, encoding))) {
          var self = this;
          setImmediate(function() {
            self._pushBuffer(encoding, keep, done);
          });
          return;
        }
      }
    }
    done();
  };
  LineStream.prototype._flush = function(done) {
    this._pushBuffer(this._chunkEncoding, 0, done);
  };
  LineStream.prototype._reencode = function(line, chunkEncoding) {
    if (this.encoding && this.encoding != chunkEncoding) {
      return Buffer.from(line, chunkEncoding).toString(this.encoding);
    } else if (this.encoding) {
      return line;
    } else {
      return Buffer.from(line, chunkEncoding);
    }
  };
});

// ../../node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS((exports, module2) => {
  function RetryOperation(timeouts, options) {
    if (typeof options === "boolean") {
      options = {forever: options};
    }
    this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
    this._timeouts = timeouts;
    this._options = options || {};
    this._maxRetryTime = options && options.maxRetryTime || Infinity;
    this._fn = null;
    this._errors = [];
    this._attempts = 1;
    this._operationTimeout = null;
    this._operationTimeoutCb = null;
    this._timeout = null;
    this._operationStart = null;
    if (this._options.forever) {
      this._cachedTimeouts = this._timeouts.slice(0);
    }
  }
  module2.exports = RetryOperation;
  RetryOperation.prototype.reset = function() {
    this._attempts = 1;
    this._timeouts = this._originalTimeouts;
  };
  RetryOperation.prototype.stop = function() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeouts = [];
    this._cachedTimeouts = null;
  };
  RetryOperation.prototype.retry = function(err) {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    if (!err) {
      return false;
    }
    var currentTime = new Date().getTime();
    if (err && currentTime - this._operationStart >= this._maxRetryTime) {
      this._errors.unshift(new Error("RetryOperation timeout occurred"));
      return false;
    }
    this._errors.push(err);
    var timeout = this._timeouts.shift();
    if (timeout === void 0) {
      if (this._cachedTimeouts) {
        this._errors.splice(this._errors.length - 1, this._errors.length);
        this._timeouts = this._cachedTimeouts.slice(0);
        timeout = this._timeouts.shift();
      } else {
        return false;
      }
    }
    var self = this;
    var timer = setTimeout(function() {
      self._attempts++;
      if (self._operationTimeoutCb) {
        self._timeout = setTimeout(function() {
          self._operationTimeoutCb(self._attempts);
        }, self._operationTimeout);
        if (self._options.unref) {
          self._timeout.unref();
        }
      }
      self._fn(self._attempts);
    }, timeout);
    if (this._options.unref) {
      timer.unref();
    }
    return true;
  };
  RetryOperation.prototype.attempt = function(fn, timeoutOps) {
    this._fn = fn;
    if (timeoutOps) {
      if (timeoutOps.timeout) {
        this._operationTimeout = timeoutOps.timeout;
      }
      if (timeoutOps.cb) {
        this._operationTimeoutCb = timeoutOps.cb;
      }
    }
    var self = this;
    if (this._operationTimeoutCb) {
      this._timeout = setTimeout(function() {
        self._operationTimeoutCb();
      }, self._operationTimeout);
    }
    this._operationStart = new Date().getTime();
    this._fn(this._attempts);
  };
  RetryOperation.prototype.try = function(fn) {
    console.log("Using RetryOperation.try() is deprecated");
    this.attempt(fn);
  };
  RetryOperation.prototype.start = function(fn) {
    console.log("Using RetryOperation.start() is deprecated");
    this.attempt(fn);
  };
  RetryOperation.prototype.start = RetryOperation.prototype.try;
  RetryOperation.prototype.errors = function() {
    return this._errors;
  };
  RetryOperation.prototype.attempts = function() {
    return this._attempts;
  };
  RetryOperation.prototype.mainError = function() {
    if (this._errors.length === 0) {
      return null;
    }
    var counts = {};
    var mainError = null;
    var mainErrorCount = 0;
    for (var i = 0; i < this._errors.length; i++) {
      var error = this._errors[i];
      var message = error.message;
      var count = (counts[message] || 0) + 1;
      counts[message] = count;
      if (count >= mainErrorCount) {
        mainError = error;
        mainErrorCount = count;
      }
    }
    return mainError;
  };
});

// ../../node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry.js
var require_retry = __commonJS((exports) => {
  var RetryOperation = require_retry_operation();
  exports.operation = function(options) {
    var timeouts = exports.timeouts(options);
    return new RetryOperation(timeouts, {
      forever: options && options.forever,
      unref: options && options.unref,
      maxRetryTime: options && options.maxRetryTime
    });
  };
  exports.timeouts = function(options) {
    if (options instanceof Array) {
      return [].concat(options);
    }
    var opts = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1e3,
      maxTimeout: Infinity,
      randomize: false
    };
    for (var key in options) {
      opts[key] = options[key];
    }
    if (opts.minTimeout > opts.maxTimeout) {
      throw new Error("minTimeout is greater than maxTimeout");
    }
    var timeouts = [];
    for (var i = 0; i < opts.retries; i++) {
      timeouts.push(this.createTimeout(i, opts));
    }
    if (options && options.forever && !timeouts.length) {
      timeouts.push(this.createTimeout(i, opts));
    }
    timeouts.sort(function(a, b) {
      return a - b;
    });
    return timeouts;
  };
  exports.createTimeout = function(attempt, opts) {
    var random2 = opts.randomize ? Math.random() + 1 : 1;
    var timeout = Math.round(random2 * opts.minTimeout * Math.pow(opts.factor, attempt));
    timeout = Math.min(timeout, opts.maxTimeout);
    return timeout;
  };
  exports.wrap = function(obj, options, methods) {
    if (options instanceof Array) {
      methods = options;
      options = null;
    }
    if (!methods) {
      methods = [];
      for (var key in obj) {
        if (typeof obj[key] === "function") {
          methods.push(key);
        }
      }
    }
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      var original = obj[method];
      obj[method] = function retryWrapper(original2) {
        var op = exports.operation(options);
        var args = Array.prototype.slice.call(arguments, 1);
        var callback = args.pop();
        args.push(function(err) {
          if (op.retry(err)) {
            return;
          }
          if (err) {
            arguments[0] = op.mainError();
          }
          callback.apply(this, arguments);
        });
        op.attempt(function() {
          original2.apply(obj, args);
        });
      }.bind(obj, original);
      obj[method].options = options;
    }
  };
});

// ../../node_modules/.pnpm/retry@0.12.0/node_modules/retry/index.js
var require_retry2 = __commonJS((exports, module2) => {
  module2.exports = require_retry();
});

// ../../node_modules/.pnpm/p-retry@4.2.0/node_modules/p-retry/index.js
var require_p_retry = __commonJS((exports, module2) => {
  "use strict";
  const retry = require_retry2();
  class AbortError extends Error {
    constructor(message) {
      super();
      if (message instanceof Error) {
        this.originalError = message;
        ({message} = message);
      } else {
        this.originalError = new Error(message);
        this.originalError.stack = this.stack;
      }
      this.name = "AbortError";
      this.message = message;
    }
  }
  const decorateErrorWithCounts = (error, attemptNumber, options) => {
    const retriesLeft = options.retries - (attemptNumber - 1);
    error.attemptNumber = attemptNumber;
    error.retriesLeft = retriesLeft;
    return error;
  };
  const pRetry = (input, options) => new Promise((resolve, reject) => {
    options = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...options
    };
    const operation = retry.operation(options);
    operation.attempt(async (attemptNumber) => {
      try {
        resolve(await input(attemptNumber));
      } catch (error) {
        if (!(error instanceof Error)) {
          reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));
          return;
        }
        if (error instanceof AbortError) {
          operation.stop();
          reject(error.originalError);
        } else if (error instanceof TypeError) {
          operation.stop();
          reject(error);
        } else {
          decorateErrorWithCounts(error, attemptNumber, options);
          try {
            await options.onFailedAttempt(error);
          } catch (error2) {
            reject(error2);
            return;
          }
          if (!operation.retry(error)) {
            reject(operation.mainError());
          }
        }
      }
    });
  });
  module2.exports = pRetry;
  module2.exports.default = pRetry;
  module2.exports.AbortError = AbortError;
});

// ../../node_modules/.pnpm/strip-final-newline@2.0.0/node_modules/strip-final-newline/index.js
var require_strip_final_newline = __commonJS((exports, module2) => {
  "use strict";
  module2.exports = (input) => {
    const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
    const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
    if (input[input.length - 1] === LF) {
      input = input.slice(0, input.length - 1);
    }
    if (input[input.length - 1] === CR) {
      input = input.slice(0, input.length - 1);
    }
    return input;
  };
});

// ../../node_modules/.pnpm/npm-run-path@4.0.1/node_modules/npm-run-path/index.js
var require_npm_run_path = __commonJS((exports, module2) => {
  "use strict";
  const path3 = require("path");
  const pathKey = require_path_key();
  const npmRunPath = (options) => {
    options = {
      cwd: process.cwd(),
      path: process.env[pathKey()],
      execPath: process.execPath,
      ...options
    };
    let previous;
    let cwdPath = path3.resolve(options.cwd);
    const result = [];
    while (previous !== cwdPath) {
      result.push(path3.join(cwdPath, "node_modules/.bin"));
      previous = cwdPath;
      cwdPath = path3.resolve(cwdPath, "..");
    }
    const execPathDir = path3.resolve(options.cwd, options.execPath, "..");
    result.push(execPathDir);
    return result.concat(options.path).join(path3.delimiter);
  };
  module2.exports = npmRunPath;
  module2.exports.default = npmRunPath;
  module2.exports.env = (options) => {
    options = {
      env: process.env,
      ...options
    };
    const env = {...options.env};
    const path4 = pathKey({env});
    options.path = env[path4];
    env[path4] = module2.exports(options);
    return env;
  };
});

// ../../node_modules/.pnpm/mimic-fn@2.1.0/node_modules/mimic-fn/index.js
var require_mimic_fn = __commonJS((exports, module2) => {
  "use strict";
  const mimicFn = (to, from) => {
    for (const prop of Reflect.ownKeys(from)) {
      Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
    }
    return to;
  };
  module2.exports = mimicFn;
  module2.exports.default = mimicFn;
});

// ../../node_modules/.pnpm/onetime@5.1.0/node_modules/onetime/index.js
var require_onetime = __commonJS((exports, module2) => {
  "use strict";
  const mimicFn = require_mimic_fn();
  const calledFunctions = new WeakMap();
  const oneTime = (fn, options = {}) => {
    if (typeof fn !== "function") {
      throw new TypeError("Expected a function");
    }
    let ret;
    let isCalled = false;
    let callCount = 0;
    const functionName = fn.displayName || fn.name || "<anonymous>";
    const onetime = function(...args) {
      calledFunctions.set(onetime, ++callCount);
      if (isCalled) {
        if (options.throw === true) {
          throw new Error(`Function \`${functionName}\` can only be called once`);
        }
        return ret;
      }
      isCalled = true;
      ret = fn.apply(this, args);
      fn = null;
      return ret;
    };
    mimicFn(onetime, fn);
    calledFunctions.set(onetime, callCount);
    return onetime;
  };
  module2.exports = oneTime;
  module2.exports.default = oneTime;
  module2.exports.callCount = (fn) => {
    if (!calledFunctions.has(fn)) {
      throw new Error(`The given function \`${fn.name}\` is not wrapped by the \`onetime\` package`);
    }
    return calledFunctions.get(fn);
  };
});

// ../../node_modules/.pnpm/human-signals@1.1.1/node_modules/human-signals/build/src/core.js
var require_core = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.SIGNALS = void 0;
  const SIGNALS = [
    {
      name: "SIGHUP",
      number: 1,
      action: "terminate",
      description: "Terminal closed",
      standard: "posix"
    },
    {
      name: "SIGINT",
      number: 2,
      action: "terminate",
      description: "User interruption with CTRL-C",
      standard: "ansi"
    },
    {
      name: "SIGQUIT",
      number: 3,
      action: "core",
      description: "User interruption with CTRL-\\",
      standard: "posix"
    },
    {
      name: "SIGILL",
      number: 4,
      action: "core",
      description: "Invalid machine instruction",
      standard: "ansi"
    },
    {
      name: "SIGTRAP",
      number: 5,
      action: "core",
      description: "Debugger breakpoint",
      standard: "posix"
    },
    {
      name: "SIGABRT",
      number: 6,
      action: "core",
      description: "Aborted",
      standard: "ansi"
    },
    {
      name: "SIGIOT",
      number: 6,
      action: "core",
      description: "Aborted",
      standard: "bsd"
    },
    {
      name: "SIGBUS",
      number: 7,
      action: "core",
      description: "Bus error due to misaligned, non-existing address or paging error",
      standard: "bsd"
    },
    {
      name: "SIGEMT",
      number: 7,
      action: "terminate",
      description: "Command should be emulated but is not implemented",
      standard: "other"
    },
    {
      name: "SIGFPE",
      number: 8,
      action: "core",
      description: "Floating point arithmetic error",
      standard: "ansi"
    },
    {
      name: "SIGKILL",
      number: 9,
      action: "terminate",
      description: "Forced termination",
      standard: "posix",
      forced: true
    },
    {
      name: "SIGUSR1",
      number: 10,
      action: "terminate",
      description: "Application-specific signal",
      standard: "posix"
    },
    {
      name: "SIGSEGV",
      number: 11,
      action: "core",
      description: "Segmentation fault",
      standard: "ansi"
    },
    {
      name: "SIGUSR2",
      number: 12,
      action: "terminate",
      description: "Application-specific signal",
      standard: "posix"
    },
    {
      name: "SIGPIPE",
      number: 13,
      action: "terminate",
      description: "Broken pipe or socket",
      standard: "posix"
    },
    {
      name: "SIGALRM",
      number: 14,
      action: "terminate",
      description: "Timeout or timer",
      standard: "posix"
    },
    {
      name: "SIGTERM",
      number: 15,
      action: "terminate",
      description: "Termination",
      standard: "ansi"
    },
    {
      name: "SIGSTKFLT",
      number: 16,
      action: "terminate",
      description: "Stack is empty or overflowed",
      standard: "other"
    },
    {
      name: "SIGCHLD",
      number: 17,
      action: "ignore",
      description: "Child process terminated, paused or unpaused",
      standard: "posix"
    },
    {
      name: "SIGCLD",
      number: 17,
      action: "ignore",
      description: "Child process terminated, paused or unpaused",
      standard: "other"
    },
    {
      name: "SIGCONT",
      number: 18,
      action: "unpause",
      description: "Unpaused",
      standard: "posix",
      forced: true
    },
    {
      name: "SIGSTOP",
      number: 19,
      action: "pause",
      description: "Paused",
      standard: "posix",
      forced: true
    },
    {
      name: "SIGTSTP",
      number: 20,
      action: "pause",
      description: 'Paused using CTRL-Z or "suspend"',
      standard: "posix"
    },
    {
      name: "SIGTTIN",
      number: 21,
      action: "pause",
      description: "Background process cannot read terminal input",
      standard: "posix"
    },
    {
      name: "SIGBREAK",
      number: 21,
      action: "terminate",
      description: "User interruption with CTRL-BREAK",
      standard: "other"
    },
    {
      name: "SIGTTOU",
      number: 22,
      action: "pause",
      description: "Background process cannot write to terminal output",
      standard: "posix"
    },
    {
      name: "SIGURG",
      number: 23,
      action: "ignore",
      description: "Socket received out-of-band data",
      standard: "bsd"
    },
    {
      name: "SIGXCPU",
      number: 24,
      action: "core",
      description: "Process timed out",
      standard: "bsd"
    },
    {
      name: "SIGXFSZ",
      number: 25,
      action: "core",
      description: "File too big",
      standard: "bsd"
    },
    {
      name: "SIGVTALRM",
      number: 26,
      action: "terminate",
      description: "Timeout or timer",
      standard: "bsd"
    },
    {
      name: "SIGPROF",
      number: 27,
      action: "terminate",
      description: "Timeout or timer",
      standard: "bsd"
    },
    {
      name: "SIGWINCH",
      number: 28,
      action: "ignore",
      description: "Terminal window size changed",
      standard: "bsd"
    },
    {
      name: "SIGIO",
      number: 29,
      action: "terminate",
      description: "I/O is available",
      standard: "other"
    },
    {
      name: "SIGPOLL",
      number: 29,
      action: "terminate",
      description: "Watched event",
      standard: "other"
    },
    {
      name: "SIGINFO",
      number: 29,
      action: "ignore",
      description: "Request for process information",
      standard: "other"
    },
    {
      name: "SIGPWR",
      number: 30,
      action: "terminate",
      description: "Device running out of power",
      standard: "systemv"
    },
    {
      name: "SIGSYS",
      number: 31,
      action: "core",
      description: "Invalid system call",
      standard: "other"
    },
    {
      name: "SIGUNUSED",
      number: 31,
      action: "terminate",
      description: "Invalid system call",
      standard: "other"
    }
  ];
  exports.SIGNALS = SIGNALS;
});

// ../../node_modules/.pnpm/human-signals@1.1.1/node_modules/human-signals/build/src/realtime.js
var require_realtime = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.SIGRTMAX = exports.getRealtimeSignals = void 0;
  const getRealtimeSignals = function() {
    const length = SIGRTMAX - SIGRTMIN + 1;
    return Array.from({length}, getRealtimeSignal);
  };
  exports.getRealtimeSignals = getRealtimeSignals;
  const getRealtimeSignal = function(value, index) {
    return {
      name: `SIGRT${index + 1}`,
      number: SIGRTMIN + index,
      action: "terminate",
      description: "Application-specific signal (realtime)",
      standard: "posix"
    };
  };
  const SIGRTMIN = 34;
  const SIGRTMAX = 64;
  exports.SIGRTMAX = SIGRTMAX;
});

// ../../node_modules/.pnpm/human-signals@1.1.1/node_modules/human-signals/build/src/signals.js
var require_signals = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getSignals = void 0;
  var _os = require("os");
  var _core = require_core();
  var _realtime = require_realtime();
  const getSignals = function() {
    const realtimeSignals = (0, _realtime.getRealtimeSignals)();
    const signals = [..._core.SIGNALS, ...realtimeSignals].map(normalizeSignal);
    return signals;
  };
  exports.getSignals = getSignals;
  const normalizeSignal = function({
    name,
    number: defaultNumber,
    description,
    action,
    forced = false,
    standard
  }) {
    const {
      signals: {[name]: constantSignal}
    } = _os.constants;
    const supported = constantSignal !== void 0;
    const number = supported ? constantSignal : defaultNumber;
    return {name, number, description, supported, action, forced, standard};
  };
});

// ../../node_modules/.pnpm/human-signals@1.1.1/node_modules/human-signals/build/src/main.js
var require_main = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.signalsByNumber = exports.signalsByName = void 0;
  var _os = require("os");
  var _signals = require_signals();
  var _realtime = require_realtime();
  const getSignalsByName = function() {
    const signals = (0, _signals.getSignals)();
    return signals.reduce(getSignalByName, {});
  };
  const getSignalByName = function(signalByNameMemo, {name, number, description, supported, action, forced, standard}) {
    return {
      ...signalByNameMemo,
      [name]: {name, number, description, supported, action, forced, standard}
    };
  };
  const signalsByName = getSignalsByName();
  exports.signalsByName = signalsByName;
  const getSignalsByNumber = function() {
    const signals = (0, _signals.getSignals)();
    const length = _realtime.SIGRTMAX + 1;
    const signalsA = Array.from({length}, (value, number) => getSignalByNumber(number, signals));
    return Object.assign({}, ...signalsA);
  };
  const getSignalByNumber = function(number, signals) {
    const signal = findSignalByNumber(number, signals);
    if (signal === void 0) {
      return {};
    }
    const {name, description, supported, action, forced, standard} = signal;
    return {
      [number]: {
        name,
        number,
        description,
        supported,
        action,
        forced,
        standard
      }
    };
  };
  const findSignalByNumber = function(number, signals) {
    const signal = signals.find(({name}) => _os.constants.signals[name] === number);
    if (signal !== void 0) {
      return signal;
    }
    return signals.find((signalA) => signalA.number === number);
  };
  const signalsByNumber = getSignalsByNumber();
  exports.signalsByNumber = signalsByNumber;
});

// ../../node_modules/.pnpm/execa@4.0.2/node_modules/execa/lib/error.js
var require_error = __commonJS((exports, module2) => {
  "use strict";
  const {signalsByName} = require_main();
  const getErrorPrefix = ({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled}) => {
    if (timedOut) {
      return `timed out after ${timeout} milliseconds`;
    }
    if (isCanceled) {
      return "was canceled";
    }
    if (errorCode !== void 0) {
      return `failed with ${errorCode}`;
    }
    if (signal !== void 0) {
      return `was killed with ${signal} (${signalDescription})`;
    }
    if (exitCode !== void 0) {
      return `failed with exit code ${exitCode}`;
    }
    return "failed";
  };
  const makeError = ({
    stdout,
    stderr,
    all,
    error,
    signal,
    exitCode,
    command,
    timedOut,
    isCanceled,
    killed,
    parsed: {options: {timeout}}
  }) => {
    exitCode = exitCode === null ? void 0 : exitCode;
    signal = signal === null ? void 0 : signal;
    const signalDescription = signal === void 0 ? void 0 : signalsByName[signal].description;
    const errorCode = error && error.code;
    const prefix = getErrorPrefix({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled});
    const execaMessage = `Command ${prefix}: ${command}`;
    const isError = Object.prototype.toString.call(error) === "[object Error]";
    const shortMessage = isError ? `${execaMessage}
${error.message}` : execaMessage;
    const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
    if (isError) {
      error.originalMessage = error.message;
      error.message = message;
    } else {
      error = new Error(message);
    }
    error.shortMessage = shortMessage;
    error.command = command;
    error.exitCode = exitCode;
    error.signal = signal;
    error.signalDescription = signalDescription;
    error.stdout = stdout;
    error.stderr = stderr;
    if (all !== void 0) {
      error.all = all;
    }
    if ("bufferedData" in error) {
      delete error.bufferedData;
    }
    error.failed = true;
    error.timedOut = Boolean(timedOut);
    error.isCanceled = isCanceled;
    error.killed = killed && !timedOut;
    return error;
  };
  module2.exports = makeError;
});

// ../../node_modules/.pnpm/execa@4.0.2/node_modules/execa/lib/stdio.js
var require_stdio = __commonJS((exports, module2) => {
  "use strict";
  const aliases = ["stdin", "stdout", "stderr"];
  const hasAlias = (opts) => aliases.some((alias) => opts[alias] !== void 0);
  const normalizeStdio = (opts) => {
    if (!opts) {
      return;
    }
    const {stdio} = opts;
    if (stdio === void 0) {
      return aliases.map((alias) => opts[alias]);
    }
    if (hasAlias(opts)) {
      throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
    }
    if (typeof stdio === "string") {
      return stdio;
    }
    if (!Array.isArray(stdio)) {
      throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
    }
    const length = Math.max(stdio.length, aliases.length);
    return Array.from({length}, (value, index) => stdio[index]);
  };
  module2.exports = normalizeStdio;
  module2.exports.node = (opts) => {
    const stdio = normalizeStdio(opts);
    if (stdio === "ipc") {
      return "ipc";
    }
    if (stdio === void 0 || typeof stdio === "string") {
      return [stdio, stdio, stdio, "ipc"];
    }
    if (stdio.includes("ipc")) {
      return stdio;
    }
    return [...stdio, "ipc"];
  };
});

// ../../node_modules/.pnpm/signal-exit@3.0.3/node_modules/signal-exit/signals.js
var require_signals2 = __commonJS((exports, module2) => {
  module2.exports = [
    "SIGABRT",
    "SIGALRM",
    "SIGHUP",
    "SIGINT",
    "SIGTERM"
  ];
  if (process.platform !== "win32") {
    module2.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
  }
  if (process.platform === "linux") {
    module2.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
  }
});

// ../../node_modules/.pnpm/signal-exit@3.0.3/node_modules/signal-exit/index.js
var require_signal_exit = __commonJS((exports, module2) => {
  var assert = require("assert");
  var signals = require_signals2();
  var isWin = /^win/i.test(process.platform);
  var EE = require("events");
  if (typeof EE !== "function") {
    EE = EE.EventEmitter;
  }
  var emitter;
  if (process.__signal_exit_emitter__) {
    emitter = process.__signal_exit_emitter__;
  } else {
    emitter = process.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }
  module2.exports = function(cb, opts) {
    assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
    if (loaded === false) {
      load();
    }
    var ev = "exit";
    if (opts && opts.alwaysLast) {
      ev = "afterexit";
    }
    var remove = function() {
      emitter.removeListener(ev, cb);
      if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);
    return remove;
  };
  module2.exports.unload = unload;
  function unload() {
    if (!loaded) {
      return;
    }
    loaded = false;
    signals.forEach(function(sig) {
      try {
        process.removeListener(sig, sigListeners[sig]);
      } catch (er) {
      }
    });
    process.emit = originalProcessEmit;
    process.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  }
  function emit(event, code, signal) {
    if (emitter.emitted[event]) {
      return;
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  }
  var sigListeners = {};
  signals.forEach(function(sig) {
    sigListeners[sig] = function listener() {
      var listeners = process.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit("exit", null, sig);
        emit("afterexit", null, sig);
        if (isWin && sig === "SIGHUP") {
          sig = "SIGINT";
        }
        process.kill(process.pid, sig);
      }
    };
  });
  module2.exports.signals = function() {
    return signals;
  };
  module2.exports.load = load;
  var loaded = false;
  function load() {
    if (loaded) {
      return;
    }
    loaded = true;
    emitter.count += 1;
    signals = signals.filter(function(sig) {
      try {
        process.on(sig, sigListeners[sig]);
        return true;
      } catch (er) {
        return false;
      }
    });
    process.emit = processEmit;
    process.reallyExit = processReallyExit;
  }
  var originalProcessReallyExit = process.reallyExit;
  function processReallyExit(code) {
    process.exitCode = code || 0;
    emit("exit", process.exitCode, null);
    emit("afterexit", process.exitCode, null);
    originalProcessReallyExit.call(process, process.exitCode);
  }
  var originalProcessEmit = process.emit;
  function processEmit(ev, arg) {
    if (ev === "exit") {
      if (arg !== void 0) {
        process.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      emit("exit", process.exitCode, null);
      emit("afterexit", process.exitCode, null);
      return ret;
    } else {
      return originalProcessEmit.apply(this, arguments);
    }
  }
});

// ../../node_modules/.pnpm/execa@4.0.2/node_modules/execa/lib/kill.js
var require_kill = __commonJS((exports, module2) => {
  "use strict";
  const os = require("os");
  const onExit = require_signal_exit();
  const DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
  const spawnedKill = (kill, signal = "SIGTERM", options = {}) => {
    const killResult = kill(signal);
    setKillTimeout(kill, signal, options, killResult);
    return killResult;
  };
  const setKillTimeout = (kill, signal, options, killResult) => {
    if (!shouldForceKill(signal, options, killResult)) {
      return;
    }
    const timeout = getForceKillAfterTimeout(options);
    const t = setTimeout(() => {
      kill("SIGKILL");
    }, timeout);
    if (t.unref) {
      t.unref();
    }
  };
  const shouldForceKill = (signal, {forceKillAfterTimeout}, killResult) => {
    return isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
  };
  const isSigterm = (signal) => {
    return signal === os.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM";
  };
  const getForceKillAfterTimeout = ({forceKillAfterTimeout = true}) => {
    if (forceKillAfterTimeout === true) {
      return DEFAULT_FORCE_KILL_TIMEOUT;
    }
    if (!Number.isInteger(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
      throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
    }
    return forceKillAfterTimeout;
  };
  const spawnedCancel = (spawned, context) => {
    const killResult = spawned.kill();
    if (killResult) {
      context.isCanceled = true;
    }
  };
  const timeoutKill = (spawned, signal, reject) => {
    spawned.kill(signal);
    reject(Object.assign(new Error("Timed out"), {timedOut: true, signal}));
  };
  const setupTimeout = (spawned, {timeout, killSignal = "SIGTERM"}, spawnedPromise) => {
    if (timeout === 0 || timeout === void 0) {
      return spawnedPromise;
    }
    if (!Number.isInteger(timeout) || timeout < 0) {
      throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
    }
    let timeoutId;
    const timeoutPromise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        timeoutKill(spawned, killSignal, reject);
      }, timeout);
    });
    const safeSpawnedPromise = spawnedPromise.finally(() => {
      clearTimeout(timeoutId);
    });
    return Promise.race([timeoutPromise, safeSpawnedPromise]);
  };
  const setExitHandler = async (spawned, {cleanup, detached}, timedPromise) => {
    if (!cleanup || detached) {
      return timedPromise;
    }
    const removeExitHandler = onExit(() => {
      spawned.kill();
    });
    return timedPromise.finally(() => {
      removeExitHandler();
    });
  };
  module2.exports = {
    spawnedKill,
    spawnedCancel,
    setupTimeout,
    setExitHandler
  };
});

// ../../node_modules/.pnpm/is-stream@2.0.0/node_modules/is-stream/index.js
var require_is_stream = __commonJS((exports, module2) => {
  "use strict";
  const isStream = (stream) => stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
  isStream.writable = (stream) => isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
  isStream.readable = (stream) => isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
  isStream.duplex = (stream) => isStream.writable(stream) && isStream.readable(stream);
  isStream.transform = (stream) => isStream.duplex(stream) && typeof stream._transform === "function" && typeof stream._transformState === "object";
  module2.exports = isStream;
});

// ../../node_modules/.pnpm/wrappy@1.0.2/node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS((exports, module2) => {
  module2.exports = wrappy;
  function wrappy(fn, cb) {
    if (fn && cb)
      return wrappy(fn)(cb);
    if (typeof fn !== "function")
      throw new TypeError("need wrapper function");
    Object.keys(fn).forEach(function(k) {
      wrapper[k] = fn[k];
    });
    return wrapper;
    function wrapper() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      var ret = fn.apply(this, args);
      var cb2 = args[args.length - 1];
      if (typeof ret === "function" && ret !== cb2) {
        Object.keys(cb2).forEach(function(k) {
          ret[k] = cb2[k];
        });
      }
      return ret;
    }
  }
});

// ../../node_modules/.pnpm/once@1.4.0/node_modules/once/once.js
var require_once = __commonJS((exports, module2) => {
  var wrappy = require_wrappy();
  module2.exports = wrappy(once);
  module2.exports.strict = wrappy(onceStrict);
  once.proto = once(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return once(this);
      },
      configurable: true
    });
    Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return onceStrict(this);
      },
      configurable: true
    });
  });
  function once(fn) {
    var f = function() {
      if (f.called)
        return f.value;
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    f.called = false;
    return f;
  }
  function onceStrict(fn) {
    var f = function() {
      if (f.called)
        throw new Error(f.onceError);
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    var name = fn.name || "Function wrapped with `once`";
    f.onceError = name + " shouldn't be called more than once";
    f.called = false;
    return f;
  }
});

// ../../node_modules/.pnpm/end-of-stream@1.4.4/node_modules/end-of-stream/index.js
var require_end_of_stream = __commonJS((exports, module2) => {
  var once = require_once();
  var noop = function() {
  };
  var isRequest = function(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  };
  var isChildProcess = function(stream) {
    return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
  };
  var eos = function(stream, opts, callback) {
    if (typeof opts === "function")
      return eos(stream, null, opts);
    if (!opts)
      opts = {};
    callback = once(callback || noop);
    var ws = stream._writableState;
    var rs = stream._readableState;
    var readable = opts.readable || opts.readable !== false && stream.readable;
    var writable = opts.writable || opts.writable !== false && stream.writable;
    var cancelled = false;
    var onlegacyfinish = function() {
      if (!stream.writable)
        onfinish();
    };
    var onfinish = function() {
      writable = false;
      if (!readable)
        callback.call(stream);
    };
    var onend = function() {
      readable = false;
      if (!writable)
        callback.call(stream);
    };
    var onexit = function(exitCode) {
      callback.call(stream, exitCode ? new Error("exited with error code: " + exitCode) : null);
    };
    var onerror = function(err) {
      callback.call(stream, err);
    };
    var onclose = function() {
      process.nextTick(onclosenexttick);
    };
    var onclosenexttick = function() {
      if (cancelled)
        return;
      if (readable && !(rs && (rs.ended && !rs.destroyed)))
        return callback.call(stream, new Error("premature close"));
      if (writable && !(ws && (ws.ended && !ws.destroyed)))
        return callback.call(stream, new Error("premature close"));
    };
    var onrequest = function() {
      stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
      stream.on("complete", onfinish);
      stream.on("abort", onclose);
      if (stream.req)
        onrequest();
      else
        stream.on("request", onrequest);
    } else if (writable && !ws) {
      stream.on("end", onlegacyfinish);
      stream.on("close", onlegacyfinish);
    }
    if (isChildProcess(stream))
      stream.on("exit", onexit);
    stream.on("end", onend);
    stream.on("finish", onfinish);
    if (opts.error !== false)
      stream.on("error", onerror);
    stream.on("close", onclose);
    return function() {
      cancelled = true;
      stream.removeListener("complete", onfinish);
      stream.removeListener("abort", onclose);
      stream.removeListener("request", onrequest);
      if (stream.req)
        stream.req.removeListener("finish", onfinish);
      stream.removeListener("end", onlegacyfinish);
      stream.removeListener("close", onlegacyfinish);
      stream.removeListener("finish", onfinish);
      stream.removeListener("exit", onexit);
      stream.removeListener("end", onend);
      stream.removeListener("error", onerror);
      stream.removeListener("close", onclose);
    };
  };
  module2.exports = eos;
});

// ../../node_modules/.pnpm/pump@3.0.0/node_modules/pump/index.js
var require_pump = __commonJS((exports, module2) => {
  var once = require_once();
  var eos = require_end_of_stream();
  var fs3 = require("fs");
  var noop = function() {
  };
  var ancient = /^v?\.0/.test(process.version);
  var isFn = function(fn) {
    return typeof fn === "function";
  };
  var isFS = function(stream) {
    if (!ancient)
      return false;
    if (!fs3)
      return false;
    return (stream instanceof (fs3.ReadStream || noop) || stream instanceof (fs3.WriteStream || noop)) && isFn(stream.close);
  };
  var isRequest = function(stream) {
    return stream.setHeader && isFn(stream.abort);
  };
  var destroyer = function(stream, reading, writing, callback) {
    callback = once(callback);
    var closed = false;
    stream.on("close", function() {
      closed = true;
    });
    eos(stream, {readable: reading, writable: writing}, function(err) {
      if (err)
        return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed)
        return;
      if (destroyed)
        return;
      destroyed = true;
      if (isFS(stream))
        return stream.close(noop);
      if (isRequest(stream))
        return stream.abort();
      if (isFn(stream.destroy))
        return stream.destroy();
      callback(err || new Error("stream was destroyed"));
    };
  };
  var call = function(fn) {
    fn();
  };
  var pipe = function(from, to) {
    return from.pipe(to);
  };
  var pump = function() {
    var streams = Array.prototype.slice.call(arguments);
    var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;
    if (Array.isArray(streams[0]))
      streams = streams[0];
    if (streams.length < 2)
      throw new Error("pump requires two streams per minimum");
    var error;
    var destroys = streams.map(function(stream, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream, reading, writing, function(err) {
        if (!error)
          error = err;
        if (err)
          destroys.forEach(call);
        if (reading)
          return;
        destroys.forEach(call);
        callback(error);
      });
    });
    return streams.reduce(pipe);
  };
  module2.exports = pump;
});

// ../../node_modules/.pnpm/get-stream@5.1.0/node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS((exports, module2) => {
  "use strict";
  const {PassThrough: PassThroughStream} = require("stream");
  module2.exports = (options) => {
    options = {...options};
    const {array} = options;
    let {encoding} = options;
    const isBuffer = encoding === "buffer";
    let objectMode = false;
    if (array) {
      objectMode = !(encoding || isBuffer);
    } else {
      encoding = encoding || "utf8";
    }
    if (isBuffer) {
      encoding = null;
    }
    const stream = new PassThroughStream({objectMode});
    if (encoding) {
      stream.setEncoding(encoding);
    }
    let length = 0;
    const chunks = [];
    stream.on("data", (chunk) => {
      chunks.push(chunk);
      if (objectMode) {
        length = chunks.length;
      } else {
        length += chunk.length;
      }
    });
    stream.getBufferedValue = () => {
      if (array) {
        return chunks;
      }
      return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
    };
    stream.getBufferedLength = () => length;
    return stream;
  };
});

// ../../node_modules/.pnpm/get-stream@5.1.0/node_modules/get-stream/index.js
var require_get_stream = __commonJS((exports, module2) => {
  "use strict";
  const pump = require_pump();
  const bufferStream = require_buffer_stream();
  class MaxBufferError extends Error {
    constructor() {
      super("maxBuffer exceeded");
      this.name = "MaxBufferError";
    }
  }
  async function getStream(inputStream, options) {
    if (!inputStream) {
      return Promise.reject(new Error("Expected a stream"));
    }
    options = {
      maxBuffer: Infinity,
      ...options
    };
    const {maxBuffer} = options;
    let stream;
    await new Promise((resolve, reject) => {
      const rejectPromise = (error) => {
        if (error) {
          error.bufferedData = stream.getBufferedValue();
        }
        reject(error);
      };
      stream = pump(inputStream, bufferStream(options), (error) => {
        if (error) {
          rejectPromise(error);
          return;
        }
        resolve();
      });
      stream.on("data", () => {
        if (stream.getBufferedLength() > maxBuffer) {
          rejectPromise(new MaxBufferError());
        }
      });
    });
    return stream.getBufferedValue();
  }
  module2.exports = getStream;
  module2.exports.default = getStream;
  module2.exports.buffer = (stream, options) => getStream(stream, {...options, encoding: "buffer"});
  module2.exports.array = (stream, options) => getStream(stream, {...options, array: true});
  module2.exports.MaxBufferError = MaxBufferError;
});

// ../../node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js
var require_merge_stream = __commonJS((exports, module2) => {
  "use strict";
  const {PassThrough} = require("stream");
  module2.exports = function() {
    var sources = [];
    var output = new PassThrough({objectMode: true});
    output.setMaxListeners(0);
    output.add = add2;
    output.isEmpty = isEmpty;
    output.on("unpipe", remove);
    Array.prototype.slice.call(arguments).forEach(add2);
    return output;
    function add2(source) {
      if (Array.isArray(source)) {
        source.forEach(add2);
        return this;
      }
      sources.push(source);
      source.once("end", remove.bind(null, source));
      source.once("error", output.emit.bind(output, "error"));
      source.pipe(output, {end: false});
      return this;
    }
    function isEmpty() {
      return sources.length == 0;
    }
    function remove(source) {
      sources = sources.filter(function(it) {
        return it !== source;
      });
      if (!sources.length && output.readable) {
        output.end();
      }
    }
  };
});

// ../../node_modules/.pnpm/execa@4.0.2/node_modules/execa/lib/stream.js
var require_stream = __commonJS((exports, module2) => {
  "use strict";
  const isStream = require_is_stream();
  const getStream = require_get_stream();
  const mergeStream = require_merge_stream();
  const handleInput = (spawned, input) => {
    if (input === void 0 || spawned.stdin === void 0) {
      return;
    }
    if (isStream(input)) {
      input.pipe(spawned.stdin);
    } else {
      spawned.stdin.end(input);
    }
  };
  const makeAllStream = (spawned, {all}) => {
    if (!all || !spawned.stdout && !spawned.stderr) {
      return;
    }
    const mixed = mergeStream();
    if (spawned.stdout) {
      mixed.add(spawned.stdout);
    }
    if (spawned.stderr) {
      mixed.add(spawned.stderr);
    }
    return mixed;
  };
  const getBufferedData = async (stream, streamPromise) => {
    if (!stream) {
      return;
    }
    stream.destroy();
    try {
      return await streamPromise;
    } catch (error) {
      return error.bufferedData;
    }
  };
  const getStreamPromise = (stream, {encoding, buffer, maxBuffer}) => {
    if (!stream || !buffer) {
      return;
    }
    if (encoding) {
      return getStream(stream, {encoding, maxBuffer});
    }
    return getStream.buffer(stream, {maxBuffer});
  };
  const getSpawnedResult = async ({stdout, stderr, all}, {encoding, buffer, maxBuffer}, processDone) => {
    const stdoutPromise = getStreamPromise(stdout, {encoding, buffer, maxBuffer});
    const stderrPromise = getStreamPromise(stderr, {encoding, buffer, maxBuffer});
    const allPromise = getStreamPromise(all, {encoding, buffer, maxBuffer: maxBuffer * 2});
    try {
      return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
    } catch (error) {
      return Promise.all([
        {error, signal: error.signal, timedOut: error.timedOut},
        getBufferedData(stdout, stdoutPromise),
        getBufferedData(stderr, stderrPromise),
        getBufferedData(all, allPromise)
      ]);
    }
  };
  const validateInputSync = ({input}) => {
    if (isStream(input)) {
      throw new TypeError("The `input` option cannot be a stream in sync mode");
    }
  };
  module2.exports = {
    handleInput,
    makeAllStream,
    getSpawnedResult,
    validateInputSync
  };
});

// ../../node_modules/.pnpm/execa@4.0.2/node_modules/execa/lib/promise.js
var require_promise = __commonJS((exports, module2) => {
  "use strict";
  const nativePromisePrototype = (async () => {
  })().constructor.prototype;
  const descriptors = ["then", "catch", "finally"].map((property) => [
    property,
    Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
  ]);
  const mergePromise = (spawned, promise) => {
    for (const [property, descriptor] of descriptors) {
      const value = typeof promise === "function" ? (...args) => Reflect.apply(descriptor.value, promise(), args) : descriptor.value.bind(promise);
      Reflect.defineProperty(spawned, property, {...descriptor, value});
    }
    return spawned;
  };
  const getSpawnedPromise = (spawned) => {
    return new Promise((resolve, reject) => {
      spawned.on("exit", (exitCode, signal) => {
        resolve({exitCode, signal});
      });
      spawned.on("error", (error) => {
        reject(error);
      });
      if (spawned.stdin) {
        spawned.stdin.on("error", (error) => {
          reject(error);
        });
      }
    });
  };
  module2.exports = {
    mergePromise,
    getSpawnedPromise
  };
});

// ../../node_modules/.pnpm/execa@4.0.2/node_modules/execa/lib/command.js
var require_command = __commonJS((exports, module2) => {
  "use strict";
  const SPACES_REGEXP = / +/g;
  const joinCommand = (file, args = []) => {
    if (!Array.isArray(args)) {
      return file;
    }
    return [file, ...args].join(" ");
  };
  const handleEscaping = (tokens, token, index) => {
    if (index === 0) {
      return [token];
    }
    const previousToken = tokens[tokens.length - 1];
    if (previousToken.endsWith("\\")) {
      return [...tokens.slice(0, -1), `${previousToken.slice(0, -1)} ${token}`];
    }
    return [...tokens, token];
  };
  const parseCommand = (command) => {
    return command.trim().split(SPACES_REGEXP).reduce(handleEscaping, []);
  };
  module2.exports = {
    joinCommand,
    parseCommand
  };
});

// ../../node_modules/.pnpm/execa@4.0.2/node_modules/execa/index.js
var require_execa = __commonJS((exports, module2) => {
  "use strict";
  const path3 = require("path");
  const childProcess = require("child_process");
  const crossSpawn = require_cross_spawn();
  const stripFinalNewline = require_strip_final_newline();
  const npmRunPath = require_npm_run_path();
  const onetime = require_onetime();
  const makeError = require_error();
  const normalizeStdio = require_stdio();
  const {spawnedKill, spawnedCancel, setupTimeout, setExitHandler} = require_kill();
  const {handleInput, getSpawnedResult, makeAllStream, validateInputSync} = require_stream();
  const {mergePromise, getSpawnedPromise} = require_promise();
  const {joinCommand, parseCommand} = require_command();
  const DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
  const getEnv = ({env: envOption, extendEnv, preferLocal, localDir, execPath}) => {
    const env = extendEnv ? {...process.env, ...envOption} : envOption;
    if (preferLocal) {
      return npmRunPath.env({env, cwd: localDir, execPath});
    }
    return env;
  };
  const handleArgs = (file, args, options = {}) => {
    const parsed = crossSpawn._parse(file, args, options);
    file = parsed.command;
    args = parsed.args;
    options = parsed.options;
    options = {
      maxBuffer: DEFAULT_MAX_BUFFER,
      buffer: true,
      stripFinalNewline: true,
      extendEnv: true,
      preferLocal: false,
      localDir: options.cwd || process.cwd(),
      execPath: process.execPath,
      encoding: "utf8",
      reject: true,
      cleanup: true,
      all: false,
      windowsHide: true,
      ...options
    };
    options.env = getEnv(options);
    options.stdio = normalizeStdio(options);
    if (process.platform === "win32" && path3.basename(file, ".exe") === "cmd") {
      args.unshift("/q");
    }
    return {file, args, options, parsed};
  };
  const handleOutput = (options, value, error) => {
    if (typeof value !== "string" && !Buffer.isBuffer(value)) {
      return error === void 0 ? void 0 : "";
    }
    if (options.stripFinalNewline) {
      return stripFinalNewline(value);
    }
    return value;
  };
  const execa = (file, args, options) => {
    const parsed = handleArgs(file, args, options);
    const command = joinCommand(file, args);
    let spawned;
    try {
      spawned = childProcess.spawn(parsed.file, parsed.args, parsed.options);
    } catch (error) {
      const dummySpawned = new childProcess.ChildProcess();
      const errorPromise = Promise.reject(makeError({
        error,
        stdout: "",
        stderr: "",
        all: "",
        command,
        parsed,
        timedOut: false,
        isCanceled: false,
        killed: false
      }));
      return mergePromise(dummySpawned, errorPromise);
    }
    const spawnedPromise = getSpawnedPromise(spawned);
    const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
    const processDone = setExitHandler(spawned, parsed.options, timedPromise);
    const context = {isCanceled: false};
    spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
    spawned.cancel = spawnedCancel.bind(null, spawned, context);
    const handlePromise = async () => {
      const [{error, exitCode, signal, timedOut}, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
      const stdout = handleOutput(parsed.options, stdoutResult);
      const stderr = handleOutput(parsed.options, stderrResult);
      const all = handleOutput(parsed.options, allResult);
      if (error || exitCode !== 0 || signal !== null) {
        const returnedError = makeError({
          error,
          exitCode,
          signal,
          stdout,
          stderr,
          all,
          command,
          parsed,
          timedOut,
          isCanceled: context.isCanceled,
          killed: spawned.killed
        });
        if (!parsed.options.reject) {
          return returnedError;
        }
        throw returnedError;
      }
      return {
        command,
        exitCode: 0,
        stdout,
        stderr,
        all,
        failed: false,
        timedOut: false,
        isCanceled: false,
        killed: false
      };
    };
    const handlePromiseOnce = onetime(handlePromise);
    crossSpawn._enoent.hookChildProcess(spawned, parsed.parsed);
    handleInput(spawned, parsed.options.input);
    spawned.all = makeAllStream(spawned, parsed.options);
    return mergePromise(spawned, handlePromiseOnce);
  };
  module2.exports = execa;
  module2.exports.sync = (file, args, options) => {
    const parsed = handleArgs(file, args, options);
    const command = joinCommand(file, args);
    validateInputSync(parsed.options);
    let result;
    try {
      result = childProcess.spawnSync(parsed.file, parsed.args, parsed.options);
    } catch (error) {
      throw makeError({
        error,
        stdout: "",
        stderr: "",
        all: "",
        command,
        parsed,
        timedOut: false,
        isCanceled: false,
        killed: false
      });
    }
    const stdout = handleOutput(parsed.options, result.stdout, result.error);
    const stderr = handleOutput(parsed.options, result.stderr, result.error);
    if (result.error || result.status !== 0 || result.signal !== null) {
      const error = makeError({
        stdout,
        stderr,
        error: result.error,
        signal: result.signal,
        exitCode: result.status,
        command,
        parsed,
        timedOut: result.error && result.error.code === "ETIMEDOUT",
        isCanceled: false,
        killed: result.signal !== null
      });
      if (!parsed.options.reject) {
        return error;
      }
      throw error;
    }
    return {
      command,
      exitCode: 0,
      stdout,
      stderr,
      failed: false,
      timedOut: false,
      isCanceled: false,
      killed: false
    };
  };
  module2.exports.command = (command, options) => {
    const [file, ...args] = parseCommand(command);
    return execa(file, args, options);
  };
  module2.exports.commandSync = (command, options) => {
    const [file, ...args] = parseCommand(command);
    return execa.sync(file, args, options);
  };
  module2.exports.node = (scriptPath, args, options = {}) => {
    if (args && !Array.isArray(args) && typeof args === "object") {
      options = args;
      args = [];
    }
    const stdio = normalizeStdio.node(options);
    const {nodePath = process.execPath, nodeOptions = process.execArgv} = options;
    return execa(nodePath, [
      ...nodeOptions,
      scriptPath,
      ...Array.isArray(args) ? args : []
    ], {
      ...options,
      stdin: void 0,
      stdout: void 0,
      stderr: void 0,
      stdio,
      shell: false
    });
  };
});

// ../engine-core/dist/omit.js
var require_omit = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.omit = void 0;
  function omit4(obj, keys2) {
    return Object.keys(obj).filter((key) => !keys2.includes(key)).reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
  }
  exports.omit = omit4;
});

// ../../node_modules/.pnpm/get-stream@6.0.0/node_modules/get-stream/buffer-stream.js
var require_buffer_stream2 = __commonJS((exports, module2) => {
  "use strict";
  const {PassThrough: PassThroughStream} = require("stream");
  module2.exports = (options) => {
    options = {...options};
    const {array} = options;
    let {encoding} = options;
    const isBuffer = encoding === "buffer";
    let objectMode = false;
    if (array) {
      objectMode = !(encoding || isBuffer);
    } else {
      encoding = encoding || "utf8";
    }
    if (isBuffer) {
      encoding = null;
    }
    const stream = new PassThroughStream({objectMode});
    if (encoding) {
      stream.setEncoding(encoding);
    }
    let length = 0;
    const chunks = [];
    stream.on("data", (chunk) => {
      chunks.push(chunk);
      if (objectMode) {
        length = chunks.length;
      } else {
        length += chunk.length;
      }
    });
    stream.getBufferedValue = () => {
      if (array) {
        return chunks;
      }
      return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
    };
    stream.getBufferedLength = () => length;
    return stream;
  };
});

// ../../node_modules/.pnpm/get-stream@6.0.0/node_modules/get-stream/index.js
var require_get_stream2 = __commonJS((exports, module2) => {
  "use strict";
  const {constants: BufferConstants} = require("buffer");
  const stream = require("stream");
  const {promisify} = require("util");
  const bufferStream = require_buffer_stream2();
  const streamPipelinePromisified = promisify(stream.pipeline);
  class MaxBufferError extends Error {
    constructor() {
      super("maxBuffer exceeded");
      this.name = "MaxBufferError";
    }
  }
  async function getStream(inputStream, options) {
    if (!inputStream) {
      throw new Error("Expected a stream");
    }
    options = {
      maxBuffer: Infinity,
      ...options
    };
    const {maxBuffer} = options;
    const stream2 = bufferStream(options);
    await new Promise((resolve, reject) => {
      const rejectPromise = (error) => {
        if (error && stream2.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
          error.bufferedData = stream2.getBufferedValue();
        }
        reject(error);
      };
      (async () => {
        try {
          await streamPipelinePromisified(inputStream, stream2);
          resolve();
        } catch (error) {
          rejectPromise(error);
        }
      })();
      stream2.on("data", () => {
        if (stream2.getBufferedLength() > maxBuffer) {
          rejectPromise(new MaxBufferError());
        }
      });
    });
    return stream2.getBufferedValue();
  }
  module2.exports = getStream;
  module2.exports.buffer = (stream2, options) => getStream(stream2, {...options, encoding: "buffer"});
  module2.exports.array = (stream2, options) => getStream(stream2, {...options, array: true});
  module2.exports.MaxBufferError = MaxBufferError;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/node/http-parser.js
var require_http_parser = __commonJS((exports, module2) => {
  "use strict";
  const {HTTPParser} = process.binding("http_parser");
  module2.exports = HTTPParser;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/core/symbols.js
var require_symbols = __commonJS((exports, module2) => {
  module2.exports = {
    kUrl: Symbol("url"),
    kWriting: Symbol("writing"),
    kResuming: Symbol("resuming"),
    kQueue: Symbol("queue"),
    kConnect: Symbol("connect"),
    kResume: Symbol("resume"),
    kPause: Symbol("pause"),
    kSocketTimeout: Symbol("socket timeout"),
    kIdleTimeout: Symbol("idle timeout"),
    kKeepAliveMaxTimeout: Symbol("max keep alive timeout"),
    kKeepAliveTimeoutThreshold: Symbol("keep alive timeout threshold"),
    kKeepAliveTimeout: Symbol("keep alive timeout"),
    kKeepAlive: Symbol("keep alive"),
    kTLSServerName: Symbol("server name"),
    kHost: Symbol("host"),
    kTLSOpts: Symbol("TLS Options"),
    kClosed: Symbol("closed"),
    kNeedDrain: Symbol("need drain"),
    kReset: Symbol("reset"),
    kDestroyed: Symbol("destroyed"),
    kMaxHeadersSize: Symbol("max headers size"),
    kHeadersTimeout: Symbol("headers timeout"),
    kRunningIdx: Symbol("running index"),
    kPendingIdx: Symbol("pending index"),
    kError: Symbol("error"),
    kClient: Symbol("client"),
    kParser: Symbol("parser"),
    kOnDestroyed: Symbol("destroy callbacks"),
    kPipelining: Symbol("pipelinig"),
    kRetryDelay: Symbol("retry delay"),
    kSocketPath: Symbol("socket path"),
    kSocket: Symbol("socket"),
    kRetryTimeout: Symbol("retry timeout"),
    kTLSSession: Symbol("tls session cache")
  };
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/core/util.js
var require_util3 = __commonJS((exports, module2) => {
  "use strict";
  const assert = require("assert");
  const {kDestroyed} = require_symbols();
  const {IncomingMessage} = require("http");
  const util = require("util");
  function nop() {
  }
  function isStream(body) {
    return !!(body && typeof body.on === "function");
  }
  function bodyLength(body) {
    if (body && typeof body.on === "function") {
      const state = body._readableState;
      return state && state.ended === true && Number.isFinite(state.length) ? state.length : null;
    }
    assert(!body || Number.isFinite(body.byteLength));
    return body ? body.length : 0;
  }
  function isDestroyed(stream) {
    return !stream || !!(stream.destroyed || stream[kDestroyed]);
  }
  function destroy(stream, err) {
    if (!isStream(stream) || isDestroyed(stream)) {
      return;
    }
    if (typeof stream.destroy === "function") {
      if (err || Object.getPrototypeOf(stream).constructor !== IncomingMessage) {
        stream.destroy(err);
      }
    } else if (err) {
      process.nextTick((stream2, err2) => {
        stream2.emit("error", err2);
      }, stream, err);
    }
    if (stream.destroyed !== true) {
      stream[kDestroyed] = true;
    }
  }
  const KEEPALIVE_TIMEOUT_EXPR = /timeout=(\d+)s/;
  function parseKeepAliveTimeout(val) {
    const m = val.match(KEEPALIVE_TIMEOUT_EXPR);
    return m ? parseInt(m[1]) * 1e3 : null;
  }
  function parseHeaders(headers) {
    const obj = {};
    for (var i = 0; i < headers.length; i += 2) {
      var key = headers[i].toLowerCase();
      var val = obj[key];
      if (!val) {
        obj[key] = headers[i + 1];
      } else {
        if (!Array.isArray(val)) {
          val = [val];
          obj[key] = val;
        }
        val.push(headers[i + 1]);
      }
    }
    return obj;
  }
  function isBuffer(buffer) {
    return buffer instanceof Uint8Array || Buffer.isBuffer(buffer);
  }
  function errnoException(code, syscall) {
    const name = util.getSystemErrorName(code);
    const err = new Error(`${syscall} ${name}`);
    err.errno = err;
    err.code = code;
    err.syscall = syscall;
    return err;
  }
  module2.exports = {
    nop,
    errnoException,
    isStream,
    isDestroyed,
    parseHeaders,
    parseKeepAliveTimeout,
    destroy,
    bodyLength,
    isBuffer
  };
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/core/errors.js
var require_errors = __commonJS((exports, module2) => {
  "use strict";
  class UndiciError extends Error {
    constructor(message) {
      super(message);
      this.name = "UndiciError";
      this.code = "UND_ERR";
    }
  }
  class HeadersTimeoutError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, HeadersTimeoutError);
      this.name = "HeadersTimeoutError";
      this.message = message || "Headers Timeout Error";
      this.code = "UND_ERR_HEADERS_TIMEOUT";
    }
  }
  class SocketTimeoutError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, SocketTimeoutError);
      this.name = "SocketTimeoutError";
      this.message = message || "Socket Timeout Error";
      this.code = "UND_ERR_SOCKET_TIMEOUT";
    }
  }
  class RequestTimeoutError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, RequestTimeoutError);
      this.name = "RequestTimeoutError";
      this.message = message || "Request Timeout Error";
      this.code = "UND_ERR_REQUEST_TIMEOUT";
    }
  }
  class InvalidArgumentError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, InvalidArgumentError);
      this.name = "InvalidArgumentError";
      this.message = message || "Invalid Argument Error";
      this.code = "UND_ERR_INVALID_ARG";
    }
  }
  class InvalidReturnValueError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, InvalidReturnValueError);
      this.name = "InvalidReturnValueError";
      this.message = message || "Invalid Return Value Error";
      this.code = "UND_ERR_INVALID_RETURN_VALUE";
    }
  }
  class RequestAbortedError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, RequestAbortedError);
      this.name = "RequestAbortedError";
      this.message = message || "Request aborted";
      this.code = "UND_ERR_ABORTED";
    }
  }
  class InformationalError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, InformationalError);
      this.name = "InformationalError";
      this.message = message || "Request information";
      this.code = "UND_ERR_INFO";
    }
  }
  class ContentLengthMismatchError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, ContentLengthMismatchError);
      this.name = "ContentLengthMismatchError";
      this.message = message || "Request body length does not match content-length header";
      this.code = "UND_ERR_CONTENT_LENGTH_MISMATCH";
    }
  }
  class TrailerMismatchError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, TrailerMismatchError);
      this.name = "TrailerMismatchError";
      this.message = message || "Trailers does not match trailer header";
      this.code = "UND_ERR_TRAILER_MISMATCH";
    }
  }
  class ClientDestroyedError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, ClientDestroyedError);
      this.name = "ClientDestroyedError";
      this.message = message || "The client is destroyed";
      this.code = "UND_ERR_DESTROYED";
    }
  }
  class ClientClosedError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, ClientClosedError);
      this.name = "ClientClosedError";
      this.message = message || "The client is closed";
      this.code = "UND_ERR_CLOSED";
    }
  }
  class SocketError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, SocketError);
      this.name = "SocketError";
      this.message = message || "Socket error";
      this.code = "UND_ERR_SOCKET";
    }
  }
  class NotSupportedError extends UndiciError {
    constructor(message) {
      super(message);
      Error.captureStackTrace(this, NotSupportedError);
      this.name = "NotSupportedError";
      this.message = message || "Not supported error";
      this.code = "UND_ERR_NOT_SUPPORTED";
    }
  }
  module2.exports = {
    UndiciError,
    SocketTimeoutError,
    HeadersTimeoutError,
    RequestTimeoutError,
    ContentLengthMismatchError,
    TrailerMismatchError,
    InvalidArgumentError,
    InvalidReturnValueError,
    RequestAbortedError,
    ClientDestroyedError,
    ClientClosedError,
    InformationalError,
    SocketError,
    NotSupportedError
  };
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/core/request.js
var require_request = __commonJS((exports, module2) => {
  "use strict";
  const {
    InvalidArgumentError,
    RequestAbortedError,
    RequestTimeoutError,
    NotSupportedError
  } = require_errors();
  const util = require_util3();
  const assert = require("assert");
  const kRequestTimeout = Symbol("request timeout");
  const kTimeout = Symbol("timeout");
  const kHandler = Symbol("handler");
  class Request {
    constructor({
      path: path3,
      method,
      body,
      headers,
      idempotent,
      upgrade,
      requestTimeout
    }, handler) {
      if (typeof path3 !== "string" || path3[0] !== "/") {
        throw new InvalidArgumentError("path must be a valid path");
      }
      if (typeof method !== "string") {
        throw new InvalidArgumentError("method must be a string");
      }
      if (upgrade && typeof upgrade !== "string") {
        throw new InvalidArgumentError("upgrade must be a string");
      }
      if (requestTimeout != null && (!Number.isInteger(requestTimeout) || requestTimeout < 0)) {
        throw new InvalidArgumentError("requestTimeout must be a positive integer or zero");
      }
      this.method = method;
      if (body == null) {
        this.body = null;
      } else if (util.isStream(body)) {
        this.body = body;
      } else if (util.isBuffer(body)) {
        this.body = body.length ? body : null;
      } else if (typeof body === "string") {
        this.body = body.length ? Buffer.from(body) : null;
      } else {
        throw new InvalidArgumentError("body must be a string, a Buffer or a Readable stream");
      }
      this.aborted = false;
      this.upgrade = upgrade;
      this.path = path3;
      this.idempotent = idempotent == null ? method === "HEAD" || method === "GET" : idempotent;
      this.host = null;
      this.contentLength = null;
      this.headers = "";
      if (Array.isArray(headers)) {
        if (headers.length % 2 !== 0) {
          throw new InvalidArgumentError("headers array must be even");
        }
        for (let i = 0; i < headers.length; i += 2) {
          processHeader(this, headers[i], headers[i + 1]);
        }
      } else if (headers && typeof headers === "object") {
        for (const [key, val] of Object.entries(headers)) {
          processHeader(this, key, val);
        }
      } else if (headers != null) {
        throw new InvalidArgumentError("headers must be an object or an array");
      }
      this[kRequestTimeout] = requestTimeout != null ? requestTimeout : 3e4;
      this[kTimeout] = null;
      this[kHandler] = handler;
    }
    onConnect(resume) {
      assert(!this.aborted);
      const abort = (err) => {
        if (!this.aborted) {
          this.onError(err || new RequestAbortedError());
          resume();
        }
      };
      if (this[kRequestTimeout]) {
        if (this[kTimeout]) {
          clearTimeout(this[kTimeout]);
        }
        this[kTimeout] = setTimeout((abort2) => {
          abort2(new RequestTimeoutError());
        }, this[kRequestTimeout], abort);
      }
      this[kHandler].onConnect(abort);
    }
    onHeaders(statusCode, headers, resume) {
      assert(!this.aborted);
      clearRequestTimeout(this);
      this[kHandler].onHeaders(statusCode, headers, resume);
    }
    onBody(chunk, offset, length) {
      assert(!this.aborted);
      return this[kHandler].onData(chunk.slice(offset, offset + length));
    }
    onUpgrade(statusCode, headers, socket) {
      assert(!this.aborted);
      clearRequestTimeout(this);
      this[kHandler].onUpgrade(statusCode, headers, socket);
    }
    onComplete(trailers) {
      assert(!this.aborted);
      clearRequestTimeout(this);
      this[kHandler].onComplete(trailers);
    }
    onError(err) {
      if (this.aborted) {
        return;
      }
      this.aborted = true;
      clearRequestTimeout(this);
      this[kHandler].onError(err);
    }
  }
  function processHeader(request, key, val) {
    if (typeof val === "object") {
      throw new InvalidArgumentError(`invalid ${key} header`);
    } else if (val === void 0) {
      return;
    }
    if (request.host === null && key.length === 4 && key.toLowerCase() === "host") {
      request.host = val;
      request.headers += `${key}: ${val}\r
`;
    } else if (request.contentLength === null && key.length === 14 && key.toLowerCase() === "content-length") {
      request.contentLength = parseInt(val);
      if (!Number.isFinite(request.contentLength)) {
        throw new InvalidArgumentError("invalid content-length header");
      }
    } else if (key.length === 17 && key.toLowerCase() === "transfer-encoding") {
      throw new InvalidArgumentError("invalid transfer-encoding header");
    } else if (key.length === 10 && key.toLowerCase() === "connection") {
      throw new InvalidArgumentError("invalid connection header");
    } else if (key.length === 10 && key.toLowerCase() === "keep-alive") {
      throw new InvalidArgumentError("invalid keep-alive header");
    } else if (key.length === 7 && key.toLowerCase() === "upgrade") {
      throw new InvalidArgumentError("invalid upgrade header");
    } else if (key.length === 6 && key.toLowerCase() === "expect") {
      throw new NotSupportedError("expect header not supported");
    } else {
      request.headers += `${key}: ${val}\r
`;
    }
  }
  function clearRequestTimeout(request) {
    const {[kTimeout]: timeout} = request;
    if (timeout) {
      request[kTimeout] = null;
      clearTimeout(timeout);
    }
  }
  module2.exports = Request;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/core/client.js
var require_client = __commonJS((exports, module2) => {
  "use strict";
  const {URL: URL2} = require("url");
  const net = require("net");
  const tls = require("tls");
  const HTTPParser = require_http_parser();
  const EventEmitter = require("events");
  const assert = require("assert");
  const util = require_util3();
  const Request = require_request();
  const {
    ContentLengthMismatchError,
    SocketTimeoutError,
    TrailerMismatchError,
    InvalidArgumentError,
    RequestAbortedError,
    ClientDestroyedError,
    ClientClosedError,
    HeadersTimeoutError,
    SocketError,
    InformationalError
  } = require_errors();
  const {
    kUrl,
    kReset,
    kPause,
    kHost,
    kResume,
    kClient,
    kParser,
    kConnect,
    kResuming,
    kWriting,
    kQueue,
    kNeedDrain,
    kTLSServerName,
    kIdleTimeout,
    kSocketTimeout,
    kTLSOpts,
    kClosed,
    kDestroyed,
    kPendingIdx,
    kRunningIdx,
    kError,
    kOnDestroyed,
    kPipelining,
    kRetryDelay,
    kRetryTimeout,
    kSocket,
    kSocketPath,
    kKeepAliveTimeout,
    kMaxHeadersSize,
    kHeadersTimeout,
    kKeepAliveMaxTimeout,
    kKeepAliveTimeoutThreshold,
    kKeepAlive,
    kTLSSession
  } = require_symbols();
  const kHostHeader = Symbol("host header");
  const nodeMajorVersion = parseInt(process.version.split(".")[0].slice(1));
  const insecureHTTPParser = process.execArgv.includes("--insecure-http-parser");
  class Client extends EventEmitter {
    constructor(url, {
      maxHeaderSize,
      headersTimeout,
      socketTimeout,
      idleTimeout,
      maxKeepAliveTimeout,
      keepAlive,
      keepAliveMaxTimeout = maxKeepAliveTimeout,
      keepAliveTimeoutThreshold,
      socketPath,
      pipelining,
      tls: tls2
    } = {}) {
      super();
      if (typeof url === "string") {
        url = new URL2(url);
      }
      if (!url || typeof url !== "object") {
        throw new InvalidArgumentError("invalid url");
      }
      if (url.port != null && url.port !== "" && !Number.isFinite(parseInt(url.port))) {
        throw new InvalidArgumentError("invalid port");
      }
      if (socketPath != null && typeof socketPath !== "string") {
        throw new InvalidArgumentError("invalid socketPath");
      }
      if (url.hostname != null && typeof url.hostname !== "string") {
        throw new InvalidArgumentError("invalid hostname");
      }
      if (!/https?/.test(url.protocol)) {
        throw new InvalidArgumentError("invalid protocol");
      }
      if (/\/.+/.test(url.pathname) || url.search || url.hash) {
        throw new InvalidArgumentError("invalid url");
      }
      if (maxHeaderSize != null && !Number.isFinite(maxHeaderSize)) {
        throw new InvalidArgumentError("invalid maxHeaderSize");
      }
      if (socketTimeout != null && !Number.isFinite(socketTimeout)) {
        throw new InvalidArgumentError("invalid socketTimeout");
      }
      if (idleTimeout != null && (!Number.isFinite(idleTimeout) || idleTimeout <= 0)) {
        throw new InvalidArgumentError("invalid idleTimeout");
      }
      if (keepAliveMaxTimeout != null && (!Number.isFinite(keepAliveMaxTimeout) || keepAliveMaxTimeout <= 0)) {
        throw new InvalidArgumentError("invalid keepAliveMaxTimeout");
      }
      if (keepAlive != null && typeof keepAlive !== "boolean") {
        throw new InvalidArgumentError("invalid keepAlive");
      }
      if (keepAliveTimeoutThreshold != null && !Number.isFinite(keepAliveTimeoutThreshold)) {
        throw new InvalidArgumentError("invalid keepAliveTimeoutThreshold");
      }
      if (headersTimeout != null && !Number.isFinite(headersTimeout)) {
        throw new InvalidArgumentError("invalid headersTimeout");
      }
      this[kSocket] = null;
      this[kReset] = false;
      this[kPipelining] = pipelining || 1;
      this[kMaxHeadersSize] = maxHeaderSize || 16384;
      this[kHeadersTimeout] = headersTimeout == null ? 3e4 : headersTimeout;
      this[kUrl] = url;
      this[kSocketPath] = socketPath;
      this[kSocketTimeout] = socketTimeout == null ? 3e4 : socketTimeout;
      this[kIdleTimeout] = idleTimeout == null ? 4e3 : idleTimeout;
      this[kKeepAliveMaxTimeout] = keepAliveMaxTimeout == null ? 6e5 : keepAliveMaxTimeout;
      this[kKeepAliveTimeoutThreshold] = keepAliveTimeoutThreshold == null ? 1e3 : keepAliveTimeoutThreshold;
      this[kKeepAliveTimeout] = this[kIdleTimeout];
      this[kKeepAlive] = keepAlive == null ? true : keepAlive;
      this[kClosed] = false;
      this[kDestroyed] = false;
      this[kTLSServerName] = tls2 && tls2.servername || null;
      this[kHost] = null;
      this[kTLSOpts] = tls2;
      this[kRetryDelay] = 0;
      this[kRetryTimeout] = null;
      this[kOnDestroyed] = [];
      this[kWriting] = false;
      this[kResuming] = 0;
      this[kNeedDrain] = 0;
      this[kResume] = () => {
        if (this[kResuming] === 0) {
          resume(this, true);
        }
      };
      this[kTLSSession] = null;
      this[kHostHeader] = `host: ${this[kUrl].hostname}\r
`;
      this[kQueue] = [];
      this[kRunningIdx] = 0;
      this[kPendingIdx] = 0;
    }
    get pipelining() {
      return this[kPipelining];
    }
    set pipelining(value) {
      this[kPipelining] = value;
      resume(this, true);
    }
    get connected() {
      return this[kSocket] && this[kSocket].connecting !== true && (this[kSocket].authorized !== false || this[kSocket].authorizationError) && !this[kSocket].destroyed;
    }
    get pending() {
      return this[kQueue].length - this[kPendingIdx];
    }
    get running() {
      return this[kPendingIdx] - this[kRunningIdx];
    }
    get size() {
      return this[kQueue].length - this[kRunningIdx];
    }
    get busy() {
      return this[kReset] || this[kWriting] || this.pending > 0;
    }
    get destroyed() {
      return this[kDestroyed];
    }
    get closed() {
      return this[kClosed];
    }
    [kConnect](cb) {
      connect(this);
      this.once("connect", cb);
    }
    dispatch(opts, handler) {
      try {
        const request = new Request(opts, handler);
        if (this[kDestroyed]) {
          throw new ClientDestroyedError();
        }
        if (this[kClosed]) {
          throw new ClientClosedError();
        }
        this[kQueue].push(request);
        if (this[kResuming]) {
        } else if (util.isStream(request.body)) {
          this[kResuming] = 1;
          process.nextTick(resume, this);
        } else {
          resume(this, true);
        }
      } catch (err) {
        handler.onError(err);
      }
    }
    close(callback) {
      if (callback === void 0) {
        return new Promise((resolve, reject) => {
          this.close((err, data) => {
            return err ? reject(err) : resolve(data);
          });
        });
      }
      if (typeof callback !== "function") {
        throw new InvalidArgumentError("invalid callback");
      }
      if (this[kDestroyed]) {
        process.nextTick(callback, new ClientDestroyedError(), null);
        return;
      }
      this[kClosed] = true;
      if (!this.size) {
        this.destroy(callback);
      } else {
        this[kOnDestroyed].push(callback);
      }
    }
    destroy(err, callback) {
      if (typeof err === "function") {
        callback = err;
        err = null;
      }
      if (callback === void 0) {
        return new Promise((resolve, reject) => {
          this.destroy(err, (err2, data) => {
            return err2 ? reject(err2) : resolve(data);
          });
        });
      }
      if (typeof callback !== "function") {
        throw new InvalidArgumentError("invalid callback");
      }
      if (this[kDestroyed]) {
        if (this[kOnDestroyed]) {
          this[kOnDestroyed].push(callback);
        } else {
          process.nextTick(callback, null, null);
        }
        return;
      }
      if (!err) {
        err = new ClientDestroyedError();
      }
      for (const request of this[kQueue].splice(this[kPendingIdx])) {
        request.onError(err);
      }
      clearTimeout(this[kRetryTimeout]);
      this[kRetryTimeout] = null;
      this[kClosed] = true;
      this[kDestroyed] = true;
      this[kOnDestroyed].push(callback);
      const onDestroyed = () => {
        const callbacks = this[kOnDestroyed];
        this[kOnDestroyed] = null;
        for (const callback2 of callbacks) {
          callback2(null, null);
        }
      };
      if (!this[kSocket]) {
        process.nextTick(onDestroyed);
      } else {
        util.destroy(this[kSocket].on("close", onDestroyed), err);
      }
      resume(this);
    }
  }
  class Parser extends HTTPParser {
    constructor(client, socket) {
      if (nodeMajorVersion === 12) {
        super();
        this.initialize(HTTPParser.RESPONSE, {}, client[kHeadersTimeout]);
      } else if (nodeMajorVersion > 12) {
        super();
        this.initialize(HTTPParser.RESPONSE, {}, client[kMaxHeadersSize], insecureHTTPParser, client[kHeadersTimeout]);
      } else {
        super(HTTPParser.RESPONSE, false);
      }
      this.client = client;
      this.socket = socket;
      this.statusCode = null;
      this.upgrade = false;
      this.headers = null;
      this.shouldKeepAlive = false;
      this.read = 0;
      this.request = null;
    }
    [HTTPParser.kOnTimeout]() {
      if (this.statusCode) {
        this.socket._unrefTimer();
      } else {
        util.destroy(this.socket, new HeadersTimeoutError());
      }
    }
    [HTTPParser.kOnHeaders](rawHeaders) {
      if (this.headers) {
        Array.prototype.push.apply(this.headers, rawHeaders);
      } else {
        this.headers = rawHeaders;
      }
    }
    [HTTPParser.kOnExecute](ret) {
      const {upgrade, socket} = this;
      if (!Number.isFinite(ret)) {
        assert(ret instanceof Error);
        util.destroy(socket, ret);
        return;
      }
      socket._unrefTimer();
      if (upgrade && !socket.destroyed) {
        const {client, headers, statusCode, request} = this;
        assert(!socket.destroyed);
        assert(socket === client[kSocket]);
        assert(!socket.isPaused());
        assert(request.upgrade || request.method === "CONNECT");
        this.headers = null;
        this.statusCode = null;
        this.request = null;
        socket._readableState.flowing = null;
        socket.unshift(this.getCurrentBuffer().slice(ret));
        try {
          request.onUpgrade(statusCode, headers, socket);
        } catch (err) {
          util.destroy(socket, err);
          request.onError(err);
        }
        if (!socket.destroyed && !request.aborted) {
          detachSocket(socket);
          client[kSocket] = null;
          client[kQueue][client[kRunningIdx]++] = null;
          client.emit("disconnect", new InformationalError("upgrade"));
          setImmediate(() => this.close());
          resume(client);
        }
      }
    }
    [HTTPParser.kOnHeadersComplete](versionMajor, versionMinor, rawHeaders, method, url, statusCode, statusMessage, upgrade, shouldKeepAlive) {
      const {client, socket} = this;
      const request = client[kQueue][client[kRunningIdx]];
      if (socket.destroyed) {
        return;
      }
      assert(!this.upgrade);
      assert(this.statusCode < 200);
      if (statusCode === 100) {
        util.destroy(socket, new SocketError("bad response"));
        return 1;
      }
      if (upgrade !== Boolean(request.upgrade)) {
        util.destroy(socket, new SocketError("bad upgrade"));
        return 1;
      }
      if (this.headers) {
        Array.prototype.push.apply(this.headers, rawHeaders);
      } else {
        this.headers = rawHeaders;
      }
      this.statusCode = statusCode;
      this.shouldKeepAlive = shouldKeepAlive;
      this.request = request;
      if (upgrade || request.method === "CONNECT") {
        this.unconsume();
        this.upgrade = true;
        return 2;
      }
      let keepAlive;
      let trailers;
      for (let n = 0; n < this.headers.length; n += 2) {
        const key = this.headers[n + 0];
        const val = this.headers[n + 1];
        if (!keepAlive && key.length === 10 && key.toLowerCase() === "keep-alive") {
          keepAlive = val;
        } else if (!trailers && key.length === 7 && key.toLowerCase() === "trailer") {
          trailers = val;
        }
      }
      const {headers} = this;
      this.headers = null;
      this.trailers = trailers ? trailers.toLowerCase().split(/,\s*/) : null;
      if (shouldKeepAlive && client[kKeepAlive]) {
        const keepAliveTimeout = keepAlive ? util.parseKeepAliveTimeout(keepAlive) : null;
        if (keepAliveTimeout != null) {
          const timeout = Math.min(keepAliveTimeout - client[kKeepAliveTimeoutThreshold], client[kKeepAliveMaxTimeout]);
          if (timeout < 1e3) {
            client[kReset] = true;
          } else {
            client[kKeepAliveTimeout] = timeout;
          }
        } else {
          client[kKeepAliveTimeout] = client[kIdleTimeout];
        }
      } else {
        client[kReset] = true;
      }
      try {
        request.onHeaders(statusCode, headers, statusCode < 200 ? null : socket[kResume]);
      } catch (err) {
        util.destroy(socket, err);
        return 1;
      }
      return request.method === "HEAD" || statusCode < 200 ? 1 : 0;
    }
    [HTTPParser.kOnBody](chunk, offset, length) {
      const {socket, statusCode, request} = this;
      if (socket.destroyed) {
        return;
      }
      assert(statusCode >= 200);
      try {
        if (request.onBody(chunk, offset, length) === false) {
          socket[kPause]();
        }
      } catch (err) {
        util.destroy(socket, err);
      }
    }
    [HTTPParser.kOnMessageComplete]() {
      const {client, socket, statusCode, headers, upgrade, request, trailers} = this;
      if (socket.destroyed) {
        return;
      }
      assert(statusCode >= 100);
      if (upgrade) {
        assert(statusCode < 300 || request.method === "CONNECT");
        return;
      }
      this.statusCode = null;
      this.headers = null;
      this.request = null;
      this.trailers = null;
      if (statusCode < 200) {
        assert(!socket.isPaused());
        return;
      }
      try {
        if (trailers) {
          if (!headers) {
            throw new TrailerMismatchError();
          }
          for (const trailer of trailers) {
            let found = false;
            for (let n = 0; n < headers.length; n += 2) {
              const key = headers[n + 0];
              if (key.length === trailer.length && key.toLowerCase() === trailer.toLowerCase()) {
                found = true;
                break;
              }
            }
            if (!found) {
              throw new TrailerMismatchError();
            }
          }
        }
        request.onComplete(headers);
      } catch (err) {
        util.destroy(socket, err);
        return;
      }
      client[kQueue][client[kRunningIdx]++] = null;
      if (client[kWriting]) {
        util.destroy(socket, new InformationalError("reset"));
      } else if (!this.shouldKeepAlive) {
        util.destroy(socket, new InformationalError("reset"));
      } else if (client[kReset] && !client.running) {
        util.destroy(socket, new InformationalError("reset"));
      } else {
        socket[kResume]();
        resume(client);
      }
    }
  }
  function onSocketConnect() {
    const {[kClient]: client} = this;
    assert(!this.destroyed);
    assert(!client[kWriting]);
    assert(!client[kRetryTimeout]);
    client[kReset] = false;
    client[kRetryDelay] = 0;
    client.emit("connect");
    resume(client);
  }
  function onSocketTimeout() {
    util.destroy(this, new SocketTimeoutError());
  }
  function onSocketError(err) {
    const {[kClient]: client} = this;
    this[kError] = err;
    if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
      assert(!client.running);
      while (client.pending && client[kQueue][client[kPendingIdx]].host === client[kHost]) {
        client[kQueue][client[kPendingIdx]++].onError(err);
      }
    } else if (!client.running && err.code !== "UND_ERR_INFO" && err.code !== "UND_ERR_SOCKET") {
      assert(client[kPendingIdx] === client[kRunningIdx]);
      for (const request of client[kQueue].splice(client[kRunningIdx])) {
        request.onError(err);
      }
    }
  }
  function onSocketEnd() {
    util.destroy(this, new SocketError("other side closed"));
  }
  function onSocketClose() {
    const {[kClient]: client, [kParser]: parser} = this;
    const err = this[kError] || new SocketError("closed");
    client[kSocket] = null;
    parser.unconsume();
    setImmediate(() => parser.close());
    if (err.code !== "UND_ERR_INFO") {
      client[kTLSSession] = null;
    }
    if (client[kDestroyed]) {
      assert(!client.pending);
      for (const request of client[kQueue].splice(client[kRunningIdx])) {
        request.onError(err);
      }
      client[kPendingIdx] = client[kRunningIdx];
    } else {
      if (client.running && err.code !== "UND_ERR_INFO") {
        client[kQueue][client[kRunningIdx]].onError(err);
        client[kQueue][client[kRunningIdx]++] = null;
      }
      client[kPendingIdx] = client[kRunningIdx];
      client.emit("disconnect", err);
    }
    resume(client);
  }
  function onSocketSession(session) {
    const {[kClient]: client} = this;
    client[kTLSSession] = session;
  }
  function detachSocket(socket) {
    socket[kPause] = null;
    socket[kResume] = null;
    socket[kClient] = null;
    socket[kParser] = null;
    socket[kError] = null;
    socket.removeListener("timeout", onSocketTimeout).removeListener("session", onSocketSession).removeListener("error", onSocketError).removeListener("end", onSocketEnd).removeListener("close", onSocketClose);
  }
  function connect(client) {
    assert(!client[kSocket]);
    assert(!client[kRetryTimeout]);
    const {protocol, port, hostname} = client[kUrl];
    let socket;
    if (protocol === "https:") {
      const tlsOpts = {
        ...client[kTLSOpts],
        servername: client[kTLSServerName],
        session: client[kTLSSession]
      };
      socket = client[kSocketPath] ? tls.connect(client[kSocketPath], tlsOpts) : tls.connect(port || 443, hostname, tlsOpts);
      socket.on("session", onSocketSession);
    } else {
      socket = client[kSocketPath] ? net.connect(client[kSocketPath]) : net.connect(port || 80, hostname);
    }
    client[kSocket] = socket;
    const parser = new Parser(client, socket);
    if (nodeMajorVersion >= 12) {
      assert(socket._handle);
      parser.consume(socket._handle);
    } else {
      assert(socket._handle && socket._handle._externalStream);
      parser.consume(socket._handle._externalStream);
    }
    socket[kPause] = socketPause.bind(socket);
    socket[kResume] = socketResume.bind(socket);
    socket[kError] = null;
    socket[kParser] = parser;
    socket[kClient] = client;
    socket.setNoDelay(true).setTimeout(client[kIdleTimeout]).on(protocol === "https:" ? "secureConnect" : "connect", onSocketConnect).on("timeout", onSocketTimeout).on("error", onSocketError).on("end", onSocketEnd).on("close", onSocketClose);
  }
  function socketPause() {
    if (this._handle && this._handle.reading) {
      this._handle.reading = false;
      const err = this._handle.readStop();
      if (err) {
        this.destroy(util.errnoException(err, "read"));
      }
    }
  }
  function socketResume() {
    if (this._handle && !this._handle.reading) {
      this._handle.reading = true;
      const err = this._handle.readStart();
      if (err) {
        this.destroy(util.errnoException(err, "read"));
      }
    }
  }
  function emitDrain(client) {
    client[kNeedDrain] = 0;
    client.emit("drain");
  }
  function resume(client, sync) {
    if (client[kResuming] === 2) {
      return;
    }
    client[kResuming] = 2;
    _resume(client, sync);
    client[kResuming] = 0;
    if (client[kRunningIdx] > 256) {
      client[kQueue].splice(0, client[kRunningIdx]);
      client[kPendingIdx] -= client[kRunningIdx];
      client[kRunningIdx] = 0;
    }
  }
  function _resume(client, sync) {
    while (true) {
      if (client[kDestroyed]) {
        assert(!client.pending);
        return;
      }
      if (client[kClosed] && !client.size) {
        client.destroy(util.nop);
        continue;
      }
      if (client[kSocket]) {
        const timeout = client.running ? client[kSocketTimeout] : client[kKeepAliveTimeout];
        if (client[kSocket].timeout !== timeout) {
          client[kSocket].setTimeout(timeout);
        }
      }
      if (client.running) {
        const {aborted} = client[kQueue][client[kRunningIdx]];
        if (aborted) {
          util.destroy(client[kSocket]);
          return;
        }
      }
      if (!client.pending) {
        if (client[kNeedDrain] === 2 && !client.busy) {
          if (sync) {
            client[kNeedDrain] = 1;
            process.nextTick(emitDrain, client);
          } else {
            emitDrain(client);
          }
          continue;
        }
        return;
      } else {
        client[kNeedDrain] = 2;
      }
      if (client.running >= client[kPipelining]) {
        return;
      }
      const request = client[kQueue][client[kPendingIdx]];
      if (client[kUrl].protocol === "https:" && client[kHost] !== request.host) {
        if (client.running) {
          return;
        }
        client[kHost] = request.host;
        const servername = request.host && !/^\[/.test(request.host) && !net.isIP(request.host) ? request.host : client[kTLSOpts] && client[kTLSOpts].servername;
        if (client[kTLSServerName] !== servername) {
          client[kTLSServerName] = servername;
          client[kTLSSession] = null;
          if (client[kSocket]) {
            util.destroy(client[kSocket], new InformationalError("servername changed"));
            return;
          }
        }
      }
      if (!client[kSocket] && !client[kRetryTimeout]) {
        if (client[kRetryDelay]) {
          client[kRetryTimeout] = setTimeout(() => {
            client[kRetryTimeout] = null;
            connect(client);
          }, client[kRetryDelay]);
          client[kRetryDelay] = Math.min(client[kRetryDelay] * 2, client[kSocketTimeout]);
        } else {
          connect(client);
          client[kRetryDelay] = 1e3;
        }
        return;
      }
      if (!client.connected) {
        return;
      }
      if (client[kWriting] || client[kReset]) {
        return;
      }
      if (client.running && !client[kKeepAlive]) {
        return;
      }
      if (client.running && !request.idempotent) {
        return;
      }
      if (client.running && (request.upgrade || request.method === "CONNECT")) {
        return;
      }
      if (util.isStream(request.body) && util.bodyLength(request.body) === 0) {
        request.body.on("data", function() {
          assert(false);
        }).on("error", function(err) {
          request.onError(err);
        }).on("end", function() {
          util.destroy(this);
        });
        request.body = null;
      }
      if (client.running && util.isStream(request.body)) {
        return;
      }
      if (write(client, request)) {
        client[kPendingIdx]++;
      } else {
        client[kQueue].splice(client[kPendingIdx], 1);
      }
    }
  }
  function write(client, request) {
    const {body, method, path: path3, host, upgrade, headers} = request;
    const expectsPayload = method === "PUT" || method === "POST" || method === "PATCH";
    if (body && typeof body.read === "function") {
      body.read(0);
    }
    let contentLength = util.bodyLength(body);
    if (contentLength === null) {
      contentLength = request.contentLength;
    }
    if (contentLength === 0 && !expectsPayload) {
      contentLength = null;
    }
    if (request.contentLength !== null && request.contentLength !== contentLength) {
      request.onError(new ContentLengthMismatchError());
      return false;
    }
    try {
      request.onConnect(client[kResume]);
    } catch (err) {
      request.onError(err);
      return false;
    }
    if (request.aborted) {
      return false;
    }
    if (method === "HEAD") {
      client[kReset] = true;
    }
    if (method === "CONNECT" || upgrade) {
      client[kReset] = true;
    }
    let header;
    if (upgrade) {
      header = `${method} ${path3} HTTP/1.1\r
connection: upgrade\r
upgrade: ${upgrade}\r
`;
    } else if (client[kKeepAlive]) {
      header = `${method} ${path3} HTTP/1.1\r
connection: keep-alive\r
`;
    } else {
      header = `${method} ${path3} HTTP/1.1\r
connection: close\r
`;
    }
    if (!host) {
      header += client[kHostHeader];
    }
    if (headers) {
      header += headers;
    }
    const socket = client[kSocket];
    if (!body) {
      if (contentLength === 0) {
        socket.write(`${header}content-length: ${contentLength}\r
\r
\r
`, "ascii");
      } else {
        assert(contentLength === null, "no body must not have content length");
        socket.write(`${header}\r
`, "ascii");
      }
    } else if (util.isBuffer(body)) {
      assert(contentLength !== null, "buffer body must have content length");
      socket.cork();
      socket.write(`${header}content-length: ${contentLength}\r
\r
`, "ascii");
      socket.write(body);
      socket.write("\r\n", "ascii");
      socket.uncork();
      if (!expectsPayload) {
        client[kReset] = true;
      }
      request.body = null;
    } else {
      client[kWriting] = true;
      assert(util.isStream(body));
      assert(contentLength !== 0 || !client.running, "stream body cannot be pipelined");
      let finished = false;
      let bytesWritten = 0;
      const onData = function(chunk) {
        try {
          assert(!finished);
          const len = Buffer.byteLength(chunk);
          if (!len) {
            return;
          }
          if (contentLength !== null && bytesWritten + len > contentLength) {
            util.destroy(socket, new ContentLengthMismatchError());
            return;
          }
          if (bytesWritten === 0) {
            if (!expectsPayload) {
              client[kReset] = true;
            }
            if (contentLength === null) {
              socket.write(`${header}transfer-encoding: chunked\r
`, "ascii");
            } else {
              socket.write(`${header}content-length: ${contentLength}\r
\r
`, "ascii");
            }
          }
          if (contentLength === null) {
            socket.write(`\r
${len.toString(16)}\r
`, "ascii");
          }
          bytesWritten += len;
          if (!socket.write(chunk) && this.pause) {
            this.pause();
          }
        } catch (err) {
          util.destroy(this, err);
        }
      };
      const onDrain = function() {
        assert(!finished);
        if (body.resume) {
          body.resume();
        }
      };
      const onAbort = function() {
        onFinished(new RequestAbortedError());
      };
      const onFinished = function(err) {
        if (finished) {
          return;
        }
        finished = true;
        assert(client[kWriting] && client.running <= 1);
        client[kWriting] = false;
        if (!err && contentLength !== null && bytesWritten !== contentLength) {
          err = new ContentLengthMismatchError();
        }
        socket.removeListener("drain", onDrain).removeListener("error", onFinished);
        body.removeListener("data", onData).removeListener("end", onFinished).removeListener("error", onFinished).removeListener("close", onAbort);
        request.body = null;
        util.destroy(body, err);
        if (err) {
          util.destroy(socket, err);
          return;
        }
        if (bytesWritten === 0) {
          if (expectsPayload) {
            socket.write(`${header}content-length: 0\r
\r
\r
`, "ascii");
          } else {
            socket.write(`${header}\r
`, "ascii");
          }
        } else if (contentLength === null) {
          socket.write("\r\n0\r\n\r\n", "ascii");
        }
        resume(client);
      };
      body.on("data", onData).on("end", onFinished).on("error", onFinished).on("close", onAbort);
      socket.on("drain", onDrain).on("error", onFinished);
    }
    return true;
  }
  module2.exports = Client;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/node/fixed-queue.js
var require_fixed_queue = __commonJS((exports, module2) => {
  "use strict";
  const kSize = 2048;
  const kMask = kSize - 1;
  class FixedCircularBuffer {
    constructor() {
      this.bottom = 0;
      this.top = 0;
      this.list = new Array(kSize);
      this.next = null;
    }
    isEmpty() {
      return this.top === this.bottom;
    }
    isFull() {
      return (this.top + 1 & kMask) === this.bottom;
    }
    push(data) {
      this.list[this.top] = data;
      this.top = this.top + 1 & kMask;
    }
    shift() {
      const nextItem = this.list[this.bottom];
      if (nextItem === void 0)
        return null;
      this.list[this.bottom] = void 0;
      this.bottom = this.bottom + 1 & kMask;
      return nextItem;
    }
  }
  module2.exports = class FixedQueue {
    constructor() {
      this.head = this.tail = new FixedCircularBuffer();
    }
    isEmpty() {
      return this.head.isEmpty();
    }
    push(data) {
      if (this.head.isFull()) {
        this.head = this.head.next = new FixedCircularBuffer();
      }
      this.head.push(data);
    }
    shift() {
      const tail = this.tail;
      const next = tail.shift();
      if (tail.isEmpty() && tail.next !== null) {
        this.tail = tail.next;
      }
      return next;
    }
  };
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/pool.js
var require_pool = __commonJS((exports, module2) => {
  "use strict";
  const Client = require_client();
  const {
    ClientClosedError,
    InvalidArgumentError,
    ClientDestroyedError
  } = require_errors();
  const FixedQueue = require_fixed_queue();
  const kClients = Symbol("clients");
  const kQueue = Symbol("queue");
  const kDestroyed = Symbol("destroyed");
  const kClosedPromise = Symbol("closed promise");
  const kClosedResolve = Symbol("closed resolve");
  class Pool {
    constructor(url, {
      connections,
      ...options
    } = {}) {
      if (connections != null && (!Number.isFinite(connections) || connections <= 0)) {
        throw new InvalidArgumentError("invalid connections");
      }
      this[kQueue] = new FixedQueue();
      this[kClosedPromise] = null;
      this[kClosedResolve] = null;
      this[kDestroyed] = false;
      this[kClients] = Array.from({
        length: connections || 10
      }, () => new Client(url, options));
      const pool = this;
      function onDrain() {
        const queue = pool[kQueue];
        while (!this.busy) {
          const item = queue.shift();
          if (!item) {
            break;
          }
          this.dispatch(item.opts, item.handler);
        }
        if (pool[kClosedResolve] && queue.isEmpty()) {
          Promise.all(pool[kClients].map((c) => c.close())).then(pool[kClosedResolve]);
        }
      }
      for (const client of this[kClients]) {
        client.on("drain", onDrain);
      }
    }
    dispatch(opts, handler) {
      try {
        if (this[kDestroyed]) {
          throw new ClientDestroyedError();
        }
        if (this[kClosedPromise]) {
          throw new ClientClosedError();
        }
        const client = this[kClients].find((client2) => !client2.busy);
        if (!client) {
          this[kQueue].push({opts, handler});
        } else {
          client.dispatch(opts, handler);
        }
      } catch (err) {
        handler.onError(err);
      }
    }
    close(cb) {
      try {
        if (this[kDestroyed]) {
          throw new ClientDestroyedError();
        }
        if (!this[kClosedPromise]) {
          if (this[kQueue].isEmpty()) {
            this[kClosedPromise] = Promise.all(this[kClients].map((c) => c.close()));
          } else {
            this[kClosedPromise] = new Promise((resolve) => {
              this[kClosedResolve] = resolve;
            });
          }
        }
        if (cb) {
          this[kClosedPromise].then(() => cb(null, null));
        } else {
          return this[kClosedPromise];
        }
      } catch (err) {
        if (cb) {
          cb(err);
        } else {
          return Promise.reject(err);
        }
      }
    }
    destroy(err, cb) {
      this[kDestroyed] = true;
      if (typeof err === "function") {
        cb = err;
        err = null;
      }
      if (!err) {
        err = new ClientDestroyedError();
      }
      while (true) {
        const item = this[kQueue].shift();
        if (!item) {
          break;
        }
        item.handler.onError(err);
      }
      const promise = Promise.all(this[kClients].map((c) => c.destroy(err)));
      if (cb) {
        promise.then(() => cb(null, null));
      } else {
        return promise;
      }
    }
  }
  module2.exports = Pool;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/abort-signal.js
var require_abort_signal = __commonJS((exports, module2) => {
  const {RequestAbortedError} = require_errors();
  const kListener = Symbol("kListener");
  const kSignal = Symbol("kSignal");
  function addSignal(self, signal) {
    self[kSignal] = signal;
    self[kListener] = null;
    if (!signal) {
      return;
    }
    self[kListener] = () => {
      if (self.abort) {
        self.abort();
      } else {
        self.onError(new RequestAbortedError());
      }
    };
    if ("addEventListener" in self[kSignal]) {
      self[kSignal].addEventListener("abort", self[kListener]);
    } else {
      self[kSignal].addListener("abort", self[kListener]);
    }
  }
  function removeSignal(self) {
    if (!self[kSignal]) {
      return;
    }
    if ("removeEventListener" in self[kSignal]) {
      self[kSignal].removeEventListener("abort", self[kListener]);
    } else {
      self[kSignal].removeListener("abort", self[kListener]);
    }
    self[kSignal] = null;
    self[kListener] = null;
  }
  module2.exports = {
    addSignal,
    removeSignal
  };
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/client-request.js
var require_client_request = __commonJS((exports, module2) => {
  "use strict";
  const {Readable} = require("stream");
  const {
    InvalidArgumentError,
    RequestAbortedError
  } = require_errors();
  const util = require_util3();
  const {AsyncResource: AsyncResource2} = require("async_hooks");
  const {addSignal, removeSignal} = require_abort_signal();
  const kAbort = Symbol("abort");
  class RequestResponse extends Readable {
    constructor(resume, abort) {
      super({autoDestroy: true, read: resume});
      this[kAbort] = abort;
    }
    _destroy(err, callback) {
      if (!err && !this._readableState.endEmitted) {
        err = new RequestAbortedError();
      }
      if (err) {
        this[kAbort]();
      }
      callback(err);
    }
  }
  class RequestHandler extends AsyncResource2 {
    constructor(opts, callback) {
      if (!opts || typeof opts !== "object") {
        throw new InvalidArgumentError("invalid opts");
      }
      const {signal, method, opaque, body} = opts;
      try {
        if (typeof callback !== "function") {
          throw new InvalidArgumentError("invalid callback");
        }
        if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") {
          throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
        }
        if (method === "CONNECT") {
          throw new InvalidArgumentError("invalid method");
        }
        super("UNDICI_REQUEST");
      } catch (err) {
        if (util.isStream(body)) {
          util.destroy(body.on("error", util.nop), err);
        }
        throw err;
      }
      this.opaque = opaque || null;
      this.callback = callback;
      this.res = null;
      this.abort = null;
      this.body = body;
      if (util.isStream(body)) {
        body.on("error", (err) => {
          this.onError(err);
        });
      }
      addSignal(this, signal);
    }
    onConnect(abort) {
      if (!this.callback) {
        abort();
      } else {
        this.abort = abort;
      }
    }
    onHeaders(statusCode, headers, resume) {
      const {callback, opaque, abort} = this;
      if (statusCode < 200) {
        return;
      }
      const body = new RequestResponse(resume, abort);
      this.callback = null;
      this.res = body;
      this.runInAsyncScope(callback, null, null, {
        statusCode,
        headers: util.parseHeaders(headers),
        opaque,
        body
      });
    }
    onData(chunk) {
      const {res} = this;
      return res.push(chunk);
    }
    onComplete(trailers) {
      const {res} = this;
      removeSignal(this);
      res.push(null);
    }
    onError(err) {
      const {res, callback, body, opaque} = this;
      removeSignal(this);
      if (callback) {
        this.callback = null;
        process.nextTick((self, callback2, err2, opaque2) => {
          self.runInAsyncScope(callback2, null, err2, {opaque: opaque2});
        }, this, callback, err, opaque);
      }
      if (res) {
        this.res = null;
        util.destroy(res, err);
      }
      if (body) {
        this.body = null;
        util.destroy(body, err);
      }
    }
  }
  function request(opts, callback) {
    if (callback === void 0) {
      return new Promise((resolve, reject) => {
        request.call(this, opts, (err, data) => {
          return err ? reject(err) : resolve(data);
        });
      });
    }
    try {
      this.dispatch(opts, new RequestHandler(opts, callback));
    } catch (err) {
      if (typeof callback === "function") {
        process.nextTick(callback, err, {opaque: opts && opts.opaque});
      } else {
        throw err;
      }
    }
  }
  module2.exports = request;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/client-stream.js
var require_client_stream = __commonJS((exports, module2) => {
  "use strict";
  const {finished} = require("stream");
  const {
    InvalidArgumentError,
    InvalidReturnValueError
  } = require_errors();
  const util = require_util3();
  const {AsyncResource: AsyncResource2} = require("async_hooks");
  const {addSignal, removeSignal} = require_abort_signal();
  class StreamHandler extends AsyncResource2 {
    constructor(opts, factory, callback) {
      if (!opts || typeof opts !== "object") {
        throw new InvalidArgumentError("invalid opts");
      }
      const {signal, method, opaque, body} = opts;
      try {
        if (typeof callback !== "function") {
          throw new InvalidArgumentError("invalid callback");
        }
        if (typeof factory !== "function") {
          throw new InvalidArgumentError("invalid factory");
        }
        if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") {
          throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
        }
        if (method === "CONNECT") {
          throw new InvalidArgumentError("invalid method");
        }
        super("UNDICI_STREAM");
      } catch (err) {
        if (util.isStream(body)) {
          util.destroy(body.on("error", util.nop), err);
        }
        throw err;
      }
      this.opaque = opaque || null;
      this.factory = factory;
      this.callback = callback;
      this.res = null;
      this.abort = null;
      this.trailers = null;
      this.body = body;
      if (util.isStream(body)) {
        body.on("error", (err) => {
          this.onError(err);
        });
      }
      addSignal(this, signal);
    }
    onConnect(abort) {
      if (!this.callback) {
        abort();
      } else {
        this.abort = abort;
      }
    }
    onHeaders(statusCode, headers, resume) {
      const {factory, opaque} = this;
      if (statusCode < 200) {
        return;
      }
      this.factory = null;
      const res = this.runInAsyncScope(factory, null, {
        statusCode,
        headers: util.parseHeaders(headers),
        opaque
      });
      if (!res || typeof res.write !== "function" || typeof res.end !== "function" || typeof res.on !== "function") {
        throw new InvalidReturnValueError("expected Writable");
      }
      res.on("drain", resume);
      finished(res, {readable: false}, (err) => {
        const {callback, res: res2, opaque: opaque2, trailers, abort} = this;
        this.res = null;
        if (err || !res2.readable) {
          util.destroy(res2, err);
        }
        this.callback = null;
        this.runInAsyncScope(callback, null, err || null, {opaque: opaque2, trailers});
        if (err) {
          abort();
        }
      });
      this.res = res;
    }
    onData(chunk) {
      const {res} = this;
      return res.write(chunk);
    }
    onComplete(trailers) {
      const {res} = this;
      removeSignal(this);
      this.trailers = trailers ? util.parseHeaders(trailers) : {};
      res.end();
    }
    onError(err) {
      const {res, callback, opaque, body} = this;
      removeSignal(this);
      this.factory = null;
      if (res) {
        this.res = null;
        util.destroy(res, err);
      } else if (callback) {
        this.callback = null;
        process.nextTick((self, callback2, err2, opaque2) => {
          self.runInAsyncScope(callback2, null, err2, {opaque: opaque2});
        }, this, callback, err, opaque);
      }
      if (body) {
        this.body = null;
        util.destroy(body, err);
      }
    }
  }
  function stream(opts, factory, callback) {
    if (callback === void 0) {
      return new Promise((resolve, reject) => {
        stream.call(this, opts, factory, (err, data) => {
          return err ? reject(err) : resolve(data);
        });
      });
    }
    try {
      this.dispatch(opts, new StreamHandler(opts, factory, callback));
    } catch (err) {
      if (typeof callback === "function") {
        process.nextTick(callback, err, {opaque: opts && opts.opaque});
      } else {
        throw err;
      }
    }
  }
  module2.exports = stream;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/client-pipeline.js
var require_client_pipeline = __commonJS((exports, module2) => {
  "use strict";
  const {
    Readable,
    Duplex,
    PassThrough
  } = require("stream");
  const {
    InvalidArgumentError,
    InvalidReturnValueError,
    RequestAbortedError
  } = require_errors();
  const util = require_util3();
  const {AsyncResource: AsyncResource2} = require("async_hooks");
  const {assert} = require("console");
  const {addSignal, removeSignal} = require_abort_signal();
  const kResume = Symbol("resume");
  class PipelineRequest extends Readable {
    constructor() {
      super({autoDestroy: true});
      this[kResume] = null;
    }
    _read() {
      const {[kResume]: resume} = this;
      if (resume) {
        this[kResume] = null;
        resume();
      }
    }
    _destroy(err, callback) {
      this._read();
      assert(err || this._readableState.endEmitted);
      callback(err);
    }
  }
  class PipelineResponse extends Readable {
    constructor(resume) {
      super({autoDestroy: true});
      this[kResume] = resume;
    }
    _read() {
      this[kResume]();
    }
    _destroy(err, callback) {
      if (!err && !this._readableState.endEmitted) {
        err = new RequestAbortedError();
      }
      callback(err);
    }
  }
  class PipelineHandler extends AsyncResource2 {
    constructor(opts, handler) {
      if (!opts || typeof opts !== "object") {
        throw new InvalidArgumentError("invalid opts");
      }
      if (typeof handler !== "function") {
        throw new InvalidArgumentError("invalid handler");
      }
      const {signal, method, opaque} = opts;
      if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") {
        throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
      }
      if (method === "CONNECT") {
        throw new InvalidArgumentError("invalid method");
      }
      super("UNDICI_PIPELINE");
      this.opaque = opaque || null;
      this.handler = handler;
      this.abort = null;
      addSignal(this, signal);
      this.req = new PipelineRequest().on("error", util.nop);
      this.ret = new Duplex({
        readableObjectMode: opts.objectMode,
        autoDestroy: true,
        read: () => {
          const {body} = this;
          if (body && body.resume) {
            body.resume();
          }
        },
        write: (chunk, encoding, callback) => {
          const {req} = this;
          if (req.push(chunk, encoding) || req._readableState.destroyed) {
            callback();
          } else {
            req[kResume] = callback;
          }
        },
        destroy: (err, callback) => {
          const {body, req, res, ret, abort} = this;
          if (!err && !ret._readableState.endEmitted) {
            err = new RequestAbortedError();
          }
          if (abort && err) {
            abort();
          }
          util.destroy(body, err);
          util.destroy(req, err);
          util.destroy(res, err);
          removeSignal(this);
          callback(err);
        }
      }).on("prefinish", () => {
        const {req} = this;
        req.push(null);
      });
      this.res = null;
    }
    onConnect(abort) {
      const {ret} = this;
      if (ret.destroyed) {
        abort();
      } else {
        this.abort = abort;
      }
    }
    onHeaders(statusCode, headers, resume) {
      const {opaque, handler} = this;
      if (statusCode < 200) {
        return;
      }
      this.res = new PipelineResponse(resume);
      let body;
      try {
        this.handler = null;
        body = this.runInAsyncScope(handler, null, {
          statusCode,
          headers: util.parseHeaders(headers),
          opaque,
          body: this.res
        });
      } catch (err) {
        this.res.on("error", util.nop);
        throw err;
      }
      if (!body || typeof body.on !== "function") {
        throw new InvalidReturnValueError("expected Readable");
      }
      body.on("data", (chunk) => {
        const {ret, body: body2} = this;
        if (!ret.push(chunk) && body2.pause) {
          body2.pause();
        }
      }).on("error", (err) => {
        const {ret} = this;
        util.destroy(ret, err);
      }).on("end", () => {
        const {ret} = this;
        ret.push(null);
      }).on("close", () => {
        const {ret} = this;
        if (!ret._readableState.ended) {
          util.destroy(ret, new RequestAbortedError());
        }
      });
      this.body = body;
    }
    onData(chunk) {
      const {res} = this;
      return res.push(chunk);
    }
    onComplete(trailers) {
      const {res} = this;
      res.push(null);
    }
    onError(err) {
      const {ret} = this;
      this.handler = null;
      util.destroy(ret, err);
    }
  }
  function pipeline(opts, handler) {
    try {
      const pipelineHandler = new PipelineHandler(opts, handler);
      const {
        path: path3,
        method,
        headers,
        idempotent,
        servername,
        signal,
        requestTimeout
      } = opts;
      this.dispatch({
        path: path3,
        method,
        body: pipelineHandler.req,
        headers,
        idempotent,
        servername,
        signal,
        requestTimeout
      }, pipelineHandler);
      return pipelineHandler.ret;
    } catch (err) {
      return new PassThrough().destroy(err);
    }
  }
  module2.exports = pipeline;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/client-upgrade.js
var require_client_upgrade = __commonJS((exports, module2) => {
  "use strict";
  const {InvalidArgumentError} = require_errors();
  const {AsyncResource: AsyncResource2} = require("async_hooks");
  const util = require_util3();
  const {addSignal, removeSignal} = require_abort_signal();
  class UpgradeHandler extends AsyncResource2 {
    constructor(opts, callback) {
      if (!opts || typeof opts !== "object") {
        throw new InvalidArgumentError("invalid opts");
      }
      const {signal, opaque} = opts;
      if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") {
        throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
      }
      super("UNDICI_UPGRADE");
      this.opaque = opaque || null;
      this.callback = callback;
      this.abort = null;
      addSignal(this, signal);
    }
    onConnect(abort) {
      if (!this.callback) {
        abort();
      } else {
        this.abort = abort;
      }
    }
    onUpgrade(statusCode, headers, socket) {
      const {callback, opaque} = this;
      removeSignal(this);
      this.callback = null;
      this.runInAsyncScope(callback, null, null, {
        headers: util.parseHeaders(headers),
        socket,
        opaque
      });
    }
    onError(err) {
      const {callback, opaque} = this;
      removeSignal(this);
      if (callback) {
        this.callback = null;
        process.nextTick((self, callback2, err2, opaque2) => {
          self.runInAsyncScope(callback2, null, err2, {opaque: opaque2});
        }, this, callback, err, opaque);
      }
    }
  }
  function upgrade(opts, callback) {
    if (callback === void 0) {
      return new Promise((resolve, reject) => {
        upgrade.call(this, opts, (err, data) => {
          return err ? reject(err) : resolve(data);
        });
      });
    }
    if (typeof callback !== "function") {
      throw new InvalidArgumentError("invalid callback");
    }
    try {
      const upgradeHandler = new UpgradeHandler(opts, callback);
      const {
        path: path3,
        method,
        headers,
        servername,
        signal,
        requestTimeout,
        protocol
      } = opts;
      this.dispatch({
        path: path3,
        method: method || "GET",
        headers,
        servername,
        signal,
        requestTimeout,
        upgrade: protocol || "Websocket"
      }, upgradeHandler);
    } catch (err) {
      process.nextTick(callback, err, {opaque: opts && opts.opaque});
    }
  }
  module2.exports = upgrade;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/lib/client-connect.js
var require_client_connect = __commonJS((exports, module2) => {
  "use strict";
  const {InvalidArgumentError} = require_errors();
  const {AsyncResource: AsyncResource2} = require("async_hooks");
  const util = require_util3();
  const {addSignal, removeSignal} = require_abort_signal();
  class ConnectHandler extends AsyncResource2 {
    constructor(opts, callback) {
      if (!opts || typeof opts !== "object") {
        throw new InvalidArgumentError("invalid opts");
      }
      const {signal, opaque} = opts;
      if (signal && typeof signal.on !== "function" && typeof signal.addEventListener !== "function") {
        throw new InvalidArgumentError("signal must be an EventEmitter or EventTarget");
      }
      super("UNDICI_CONNECT");
      this.opaque = opaque || null;
      this.callback = callback;
      this.abort = null;
      addSignal(this, signal);
    }
    onConnect(abort) {
      if (!this.callback) {
        abort();
      } else {
        this.abort = abort;
      }
    }
    onUpgrade(statusCode, headers, socket) {
      const {callback, opaque} = this;
      removeSignal(this);
      this.callback = null;
      this.runInAsyncScope(callback, null, null, {
        statusCode,
        headers: util.parseHeaders(headers),
        socket,
        opaque
      });
    }
    onError(err) {
      const {callback, opaque} = this;
      removeSignal(this);
      if (callback) {
        this.callback = null;
        process.nextTick((self, callback2, err2, opaque2) => {
          self.runInAsyncScope(callback2, null, err2, {opaque: opaque2});
        }, this, callback, err, opaque);
      }
    }
  }
  function connect(opts, callback) {
    if (callback === void 0) {
      return new Promise((resolve, reject) => {
        connect.call(this, opts, (err, data) => {
          return err ? reject(err) : resolve(data);
        });
      });
    }
    if (typeof callback !== "function") {
      throw new InvalidArgumentError("invalid callback");
    }
    try {
      const connectHandler = new ConnectHandler(opts, callback);
      const {
        path: path3,
        headers,
        servername,
        signal,
        requestTimeout
      } = opts;
      this.dispatch({
        path: path3,
        method: "CONNECT",
        headers,
        servername,
        signal,
        requestTimeout
      }, connectHandler);
    } catch (err) {
      process.nextTick(callback, err, {opaque: opts && opts.opaque});
    }
  }
  module2.exports = connect;
});

// ../../node_modules/.pnpm/undici@2.0.7/node_modules/undici/index.js
var require_undici = __commonJS((exports, module2) => {
  "use strict";
  const Client = require_client();
  const errors = require_errors();
  const Pool = require_pool();
  Client.prototype.request = require_client_request();
  Client.prototype.stream = require_client_stream();
  Client.prototype.pipeline = require_client_pipeline();
  Client.prototype.upgrade = require_client_upgrade();
  Client.prototype.connect = require_client_connect();
  Pool.prototype.request = require_client_request();
  Pool.prototype.stream = require_client_stream();
  Pool.prototype.pipeline = require_client_pipeline();
  Pool.prototype.upgrade = require_client_upgrade();
  Pool.prototype.connect = require_client_connect();
  function undici(url, opts) {
    return new Pool(url, opts);
  }
  undici.Pool = Pool;
  undici.Client = Client;
  undici.errors = errors;
  module2.exports = undici;
});

// ../engine-core/dist/undici.js
var require_undici2 = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.Undici = void 0;
  const getStream = require_get_stream2();
  const undici_1 = require_undici();
  class Undici {
    constructor(url, moreArgs) {
      this.closed = false;
      this.pool = new undici_1.Pool(url, {
        connections: 100,
        pipelining: 10,
        requestTimeout: 0,
        socketTimeout: 0,
        ...moreArgs
      });
    }
    request(body, customHeaders) {
      return new Promise((resolve, reject) => {
        this.pool.request({
          path: "/",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...customHeaders
          },
          body
        }, async (err, result) => {
          if (err) {
            reject(err);
          } else {
            const {statusCode, headers, body: body2} = result;
            const data = JSON.parse(await getStream(body2));
            resolve({statusCode, headers, data});
          }
        });
      });
    }
    status() {
      return new Promise((resolve, reject) => {
        this.pool.request({
          path: "/",
          method: "GET"
        }, async (err, result) => {
          if (err) {
            reject(err);
          } else {
            const {statusCode, headers, body} = result;
            const data = JSON.parse(await getStream(body));
            resolve({statusCode, headers, data});
          }
        });
      });
    }
    close() {
      if (!this.closed) {
        this.pool.close(() => {
        });
      }
      this.closed = true;
    }
  }
  exports.Undici = Undici;
});

// ../engine-core/dist/NodeEngine.js
var require_NodeEngine = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.NodeEngine = void 0;
  const Engine_1 = require_Engine();
  const engines_1 = require_dist3();
  const debug_1 = __importDefault(require_src());
  const get_platform_1 = require_dist4();
  const path_1 = __importDefault(require("path"));
  const net_1 = __importDefault(require("net"));
  const fs_1 = __importDefault(require("fs"));
  const chalk_1 = __importDefault(require_source());
  const printGeneratorConfig_1 = require_printGeneratorConfig();
  const util_1 = require_util2();
  const util_2 = require("util");
  const events_1 = __importDefault(require("events"));
  const log_1 = require_log();
  const child_process_1 = require("child_process");
  const byline_1 = __importDefault(require_byline2());
  const p_retry_1 = __importDefault(require_p_retry());
  const execa_1 = __importDefault(require_execa());
  const omit_1 = require_omit();
  const undici_1 = require_undici2();
  const debug3 = debug_1.default("engine");
  const exists = util_2.promisify(fs_1.default.exists);
  const readdir = util_2.promisify(fs_1.default.readdir);
  const knownPlatforms = [
    "native",
    "darwin",
    "debian-openssl-1.0.x",
    "debian-openssl-1.1.x",
    "rhel-openssl-1.0.x",
    "rhel-openssl-1.1.x",
    "linux-musl",
    "linux-nixos",
    "windows",
    "freebsd11",
    "freebsd12",
    "openbsd",
    "netbsd",
    "arm"
  ];
  const engines = [];
  const socketPaths = [];
  class NodeEngine3 {
    constructor({cwd, datamodelPath, prismaPath, generator, datasources, showColors, logLevel, logQueries, env, flags, clientVersion: clientVersion3, enableExperimental, engineEndpoint, enableDebugLogs, enableEngineDebugMode, useUds}) {
      var _a;
      this.restartCount = 0;
      this.queryEngineStarted = false;
      this.enableExperimental = [];
      this.useUds = false;
      this.queryEngineKilled = false;
      this.managementApiEnabled = false;
      this.ready = false;
      this.stderrLogs = "";
      this.stdoutLogs = "";
      this.handleRequestError = async (error, graceful) => {
        var _a2, _b, _c, _d, _e, _f, _g;
        debug3({error});
        let err;
        if (this.currentRequestPromise.isCanceled && this.lastError) {
          if (this.lastError.is_panic) {
            err = new Engine_1.PrismaClientRustPanicError(Engine_1.getErrorMessageWithLink({
              platform: this.platform,
              title: Engine_1.getMessage(this.lastError),
              version: this.clientVersion
            }), this.clientVersion);
            this.lastPanic = err;
          } else {
            err = new Engine_1.PrismaClientUnknownRequestError(Engine_1.getErrorMessageWithLink({
              platform: this.platform,
              title: Engine_1.getMessage(this.lastError),
              version: this.clientVersion
            }), this.clientVersion);
          }
        } else if (this.currentRequestPromise.isCanceled && this.lastErrorLog) {
          if (((_b = (_a2 = this.lastErrorLog) === null || _a2 === void 0 ? void 0 : _a2.fields) === null || _b === void 0 ? void 0 : _b.message) === "PANIC") {
            err = new Engine_1.PrismaClientRustPanicError(Engine_1.getErrorMessageWithLink({
              platform: this.platform,
              title: Engine_1.getMessage(this.lastErrorLog),
              version: this.clientVersion
            }), this.clientVersion);
            this.lastPanic = err;
          } else {
            err = new Engine_1.PrismaClientUnknownRequestError(Engine_1.getErrorMessageWithLink({
              platform: this.platform,
              title: Engine_1.getMessage(this.lastErrorLog),
              version: this.clientVersion
            }), this.clientVersion);
          }
        } else if (error.code && error.code === "ECONNRESET" || error.code === "ECONNREFUSED" || error.code === "UND_ERR_SOCKET" && error.message.toLowerCase().includes("closed") || error.message.toLowerCase().includes("client is destroyed") || error.message.toLowerCase().includes("other side closed") || error.code === "UND_ERR_CLOSED") {
          if (this.globalKillSignalReceived && !this.child.connected) {
            throw new Engine_1.PrismaClientUnknownRequestError(`The Node.js process already received a ${this.globalKillSignalReceived} signal, therefore the Prisma query engine exited
and your request can't be processed.
You probably have some open handle that prevents your process from exiting.
It could be an open http server or stream that didn't close yet.
We recommend using the \`wtfnode\` package to debug open handles.`, this.clientVersion);
          }
          if (this.restartCount > 4) {
            throw new Error(`Query engine is trying to restart, but can't.
Please look into the logs or turn on the env var DEBUG=* to debug the constantly restarting query engine.`);
          }
          if (this.lastError) {
            if (this.lastError.is_panic) {
              err = new Engine_1.PrismaClientRustPanicError(Engine_1.getErrorMessageWithLink({
                platform: this.platform,
                title: Engine_1.getMessage(this.lastError),
                version: this.clientVersion
              }), this.clientVersion);
              this.lastPanic = err;
            } else {
              err = new Engine_1.PrismaClientUnknownRequestError(Engine_1.getErrorMessageWithLink({
                platform: this.platform,
                title: Engine_1.getMessage(this.lastError),
                version: this.clientVersion
              }), this.clientVersion);
            }
          } else if (this.lastErrorLog) {
            if (((_d = (_c = this.lastErrorLog) === null || _c === void 0 ? void 0 : _c.fields) === null || _d === void 0 ? void 0 : _d.message) === "PANIC") {
              err = new Engine_1.PrismaClientRustPanicError(Engine_1.getErrorMessageWithLink({
                platform: this.platform,
                title: Engine_1.getMessage(this.lastErrorLog),
                version: this.clientVersion
              }), this.clientVersion);
              this.lastPanic = err;
            } else {
              err = new Engine_1.PrismaClientUnknownRequestError(Engine_1.getErrorMessageWithLink({
                platform: this.platform,
                title: Engine_1.getMessage(this.lastErrorLog),
                version: this.clientVersion
              }), this.clientVersion);
            }
          }
          if (!err) {
            let lastLog = this.getLastLog();
            if (!lastLog) {
              await new Promise((r) => setTimeout(r, 500));
              lastLog = this.getLastLog();
            }
            const logs = lastLog || this.stderrLogs || this.stdoutLogs;
            let title = lastLog !== null && lastLog !== void 0 ? lastLog : error.message;
            let description = error.stack + "\nExit code: " + this.exitCode + "\n" + logs;
            description = `signalCode: ${(_e = this.child) === null || _e === void 0 ? void 0 : _e.signalCode} | exitCode: ${(_f = this.child) === null || _f === void 0 ? void 0 : _f.exitCode} | killed: ${(_g = this.child) === null || _g === void 0 ? void 0 : _g.killed}
` + description;
            err = new Engine_1.PrismaClientUnknownRequestError(Engine_1.getErrorMessageWithLink({
              platform: this.platform,
              title,
              version: this.clientVersion,
              description
            }), this.clientVersion);
            debug3(err.message);
            if (graceful) {
              return false;
            }
          }
        }
        if (err) {
          throw err;
        }
        throw error;
      };
      this.env = env;
      this.cwd = this.resolveCwd(cwd);
      this.enableDebugLogs = enableDebugLogs !== null && enableDebugLogs !== void 0 ? enableDebugLogs : false;
      this.enableEngineDebugMode = enableEngineDebugMode !== null && enableEngineDebugMode !== void 0 ? enableEngineDebugMode : false;
      this.datamodelPath = datamodelPath;
      this.prismaPath = (_a = process.env.PRISMA_QUERY_ENGINE_BINARY) !== null && _a !== void 0 ? _a : prismaPath;
      this.generator = generator;
      this.datasources = datasources;
      this.logEmitter = new events_1.default();
      this.showColors = showColors !== null && showColors !== void 0 ? showColors : false;
      this.logLevel = logLevel;
      this.logQueries = logQueries !== null && logQueries !== void 0 ? logQueries : false;
      this.clientVersion = clientVersion3;
      this.flags = flags !== null && flags !== void 0 ? flags : [];
      this.enableExperimental = enableExperimental !== null && enableExperimental !== void 0 ? enableExperimental : [];
      const removedFlags = [
        "middlewares",
        "aggregateApi",
        "distinct",
        "aggregations",
        "insensitiveFilters",
        "atomicNumberOperations"
      ];
      const filteredFlags = ["nativeTypes"];
      const removedFlagsUsed = this.enableExperimental.filter((e) => removedFlags.includes(e));
      if (removedFlagsUsed.length > 0) {
        console.log(`${chalk_1.default.blueBright("info")} The preview flags \`${removedFlagsUsed.join("`, `")}\` were removed, you can now safely remove them from your schema.prisma.`);
      }
      this.enableExperimental = this.enableExperimental.filter((e) => !removedFlags.includes(e) && !filteredFlags.includes(e));
      this.engineEndpoint = engineEndpoint;
      if (useUds && process.platform !== "win32") {
        this.socketPath = `/tmp/prisma-${util_1.getRandomString()}.sock`;
        socketPaths.push(this.socketPath);
        this.useUds = useUds;
      }
      if (engineEndpoint) {
        const url = new URL(engineEndpoint);
        this.port = Number(url.port);
      }
      this.logEmitter.on("error", (log3) => {
        if (this.enableDebugLogs) {
          debug_1.default("engine:log")(log3);
        }
        if (log3 instanceof Error) {
          debug_1.default("engine:error")(log3);
        } else {
          this.lastErrorLog = log3;
          if (log3.fields.message === "PANIC") {
            this.handlePanic(log3);
          }
        }
      });
      if (this.platform) {
        if (!knownPlatforms.includes(this.platform) && !fs_1.default.existsSync(this.platform)) {
          throw new Engine_1.PrismaClientInitializationError(`Unknown ${chalk_1.default.red("PRISMA_QUERY_ENGINE_BINARY")} ${chalk_1.default.redBright.bold(this.platform)}. Possible binaryTargets: ${chalk_1.default.greenBright(knownPlatforms.join(", "))} or a path to the query engine binary.
You may have to run ${chalk_1.default.greenBright("prisma generate")} for your changes to take effect.`, this.clientVersion);
        }
      } else {
        this.getPlatform();
      }
      if (this.enableDebugLogs) {
        debug_1.default.enable("*");
      }
      engines.push(this);
    }
    resolveCwd(cwd) {
      if (cwd && fs_1.default.existsSync(cwd) && fs_1.default.lstatSync(cwd).isDirectory()) {
        return cwd;
      }
      return process.cwd();
    }
    on(event, listener) {
      if (event === "beforeExit") {
        this.beforeExitListener = listener;
      } else {
        this.logEmitter.on(event, listener);
      }
    }
    async emitExit() {
      if (this.beforeExitListener) {
        try {
          await this.beforeExitListener();
        } catch (e) {
          console.error(e);
        }
      }
    }
    async getPlatform() {
      if (this.platformPromise) {
        return this.platformPromise;
      }
      this.platformPromise = get_platform_1.getPlatform();
      return this.platformPromise;
    }
    getQueryEnginePath(platform, prefix = __dirname) {
      let queryEnginePath = path_1.default.join(prefix, `query-engine-${platform}`);
      if (platform === "windows") {
        queryEnginePath = `${queryEnginePath}.exe`;
      }
      return queryEnginePath;
    }
    handlePanic(log3) {
      var _a;
      (_a = this.child) === null || _a === void 0 ? void 0 : _a.kill();
      if (this.currentRequestPromise) {
        this.currentRequestPromise.cancel();
      }
    }
    async resolvePrismaPath() {
      if (this.prismaPath) {
        return this.prismaPath;
      }
      const platform = await this.getPlatform();
      if (this.platform && this.platform !== platform) {
        this.incorrectlyPinnedBinaryTarget = this.platform;
      }
      this.platform = this.platform || platform;
      if (__filename.includes("NodeEngine")) {
        return this.getQueryEnginePath(this.platform, engines_1.getEnginesPath());
      } else {
        const dotPrismaPath = await this.getQueryEnginePath(this.platform, eval(`require('path').join(__dirname, '../../../.prisma/client')`));
        debug3({dotPrismaPath});
        if (fs_1.default.existsSync(dotPrismaPath)) {
          return dotPrismaPath;
        }
        const dirnamePath = await this.getQueryEnginePath(this.platform, eval("__dirname"));
        debug3({dirnamePath});
        if (fs_1.default.existsSync(dirnamePath)) {
          return dirnamePath;
        }
        const parentDirName = await this.getQueryEnginePath(this.platform, path_1.default.join(eval("__dirname"), ".."));
        debug3({parentDirName});
        if (fs_1.default.existsSync(parentDirName)) {
          return parentDirName;
        }
        const datamodelDirName = await this.getQueryEnginePath(this.platform, path_1.default.dirname(this.datamodelPath));
        if (fs_1.default.existsSync(datamodelDirName)) {
          return datamodelDirName;
        }
        const cwdPath = await this.getQueryEnginePath(this.platform, this.cwd);
        if (fs_1.default.existsSync(cwdPath)) {
          return cwdPath;
        }
        const prismaPath = await this.getQueryEnginePath(this.platform);
        debug3({prismaPath});
        return prismaPath;
      }
    }
    async getPrismaPath() {
      const prismaPath = await this.resolvePrismaPath();
      const platform = await this.getPlatform();
      if (!await exists(prismaPath)) {
        const pinnedStr = this.incorrectlyPinnedBinaryTarget ? `
You incorrectly pinned it to ${chalk_1.default.redBright.bold(`${this.incorrectlyPinnedBinaryTarget}`)}
` : "";
        const dir = path_1.default.dirname(prismaPath);
        const dirExists = fs_1.default.existsSync(dir);
        let files = [];
        if (dirExists) {
          files = await readdir(dir);
        }
        let errorText = `Query engine binary for current platform "${chalk_1.default.bold(platform)}" could not be found.${pinnedStr}
This probably happens, because you built Prisma Client on a different platform.
(Prisma Client looked in "${chalk_1.default.underline(prismaPath)}")

Files in ${dir}:

${files.map((f) => `  ${f}`).join("\n")}
`;
        if (this.generator) {
          if (this.generator.binaryTargets.includes(this.platform) || this.generator.binaryTargets.includes("native")) {
            errorText += `
You already added the platform${this.generator.binaryTargets.length > 1 ? "s" : ""} ${this.generator.binaryTargets.map((t) => `"${chalk_1.default.bold(t)}"`).join(", ")} to the "${chalk_1.default.underline("generator")}" block
in the "schema.prisma" file as described in https://pris.ly/d/client-generator,
but something went wrong. That's suboptimal.

Please create an issue at https://github.com/prisma/prisma-client-js/issues/new`;
          } else {
            errorText += `

To solve this problem, add the platform "${this.platform}" to the "${chalk_1.default.underline("generator")}" block in the "schema.prisma" file:
${chalk_1.default.greenBright(this.getFixedGenerator())}

Then run "${chalk_1.default.greenBright("prisma generate")}" for your changes to take effect.
Read more about deploying Prisma Client: https://pris.ly/d/client-generator`;
          }
        } else {
          errorText += `

Read more about deploying Prisma Client: https://pris.ly/d/client-generator
`;
        }
        throw new Engine_1.PrismaClientInitializationError(errorText, this.clientVersion);
      }
      if (this.incorrectlyPinnedBinaryTarget) {
        console.error(`${chalk_1.default.yellow("Warning:")} You pinned the platform ${chalk_1.default.bold(this.incorrectlyPinnedBinaryTarget)}, but Prisma Client detects ${chalk_1.default.bold(await this.getPlatform())}.
This means you should very likely pin the platform ${chalk_1.default.greenBright(await this.getPlatform())} instead.
${chalk_1.default.dim("In case we're mistaken, please report this to us 🙏.")}`);
      }
      if (process.platform !== "win32") {
        util_1.plusX(prismaPath);
      }
      return prismaPath;
    }
    getFixedGenerator() {
      const fixedGenerator = {
        ...this.generator,
        binaryTargets: util_1.fixBinaryTargets(this.generator.binaryTargets, this.platform)
      };
      return printGeneratorConfig_1.printGeneratorConfig(fixedGenerator);
    }
    printDatasources() {
      if (this.datasources) {
        return JSON.stringify(this.datasources);
      }
      return "[]";
    }
    async start() {
      if (!this.startPromise) {
        this.startPromise = this.internalStart();
      }
      return this.startPromise;
    }
    async getEngineEnvVars() {
      const env = {
        PRISMA_DML_PATH: this.datamodelPath,
        RUST_BACKTRACE: "1",
        RUST_LOG: "info"
      };
      if (!this.useUds) {
        env.PORT = String(this.port);
        debug3(`port: ${this.port}`);
      }
      if (this.logQueries || this.logLevel === "info") {
        env.RUST_LOG = "info";
        if (this.logQueries) {
          env.LOG_QUERIES = "true";
        }
      }
      if (this.datasources) {
        env.OVERWRITE_DATASOURCES = this.printDatasources();
      }
      if (!process.env.NO_COLOR && this.showColors) {
        env.CLICOLOR_FORCE = "1";
      }
      return {
        ...this.env,
        ...process.env,
        ...env
      };
    }
    internalStart() {
      return new Promise(async (resolve, reject) => {
        var _a, _b, _c;
        await new Promise((r) => process.nextTick(r));
        if (this.stopPromise) {
          await this.stopPromise;
        }
        if (this.engineEndpoint) {
          try {
            await p_retry_1.default(() => this.undici.status(), {
              retries: 10
            });
          } catch (e) {
            return reject(e);
          }
          return resolve();
        }
        try {
          if (((_a = this.child) === null || _a === void 0 ? void 0 : _a.connected) || this.child && !((_b = this.child) === null || _b === void 0 ? void 0 : _b.killed)) {
            debug3(`There is a child that still runs and we want to start again`);
          }
          this.queryEngineStarted = false;
          this.lastError = void 0;
          this.lastErrorLog = void 0;
          this.lastPanic = void 0;
          this.queryEngineKilled = false;
          this.globalKillSignalReceived = void 0;
          debug3({cwd: this.cwd});
          const prismaPath = await this.getPrismaPath();
          const experimentalFlags = this.enableExperimental && Array.isArray(this.enableExperimental) && this.enableExperimental.length > 0 ? [`--enable-experimental=${this.enableExperimental.join(",")}`] : [];
          const debugFlag = this.enableEngineDebugMode ? ["--debug"] : [];
          const flags = [
            ...experimentalFlags,
            ...debugFlag,
            "--enable-raw-queries",
            ...this.flags
          ];
          if (this.useUds) {
            flags.push("--unix-path", this.socketPath);
          }
          debug3({flags});
          this.port = await this.getFreePort();
          const env = await this.getEngineEnvVars();
          this.child = child_process_1.spawn(prismaPath, flags, {
            env,
            cwd: this.cwd,
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"]
          });
          byline_1.default(this.child.stderr).on("data", (msg) => {
            const data = String(msg);
            debug3("stderr", data);
            try {
              const json = JSON.parse(data);
              if (typeof json.is_panic !== "undefined") {
                debug3(json);
                this.lastError = json;
                if (this.engineStartDeferred) {
                  const err = new Engine_1.PrismaClientInitializationError(this.lastError.message, this.clientVersion);
                  this.engineStartDeferred.reject(err);
                }
              }
            } catch (e) {
              if (!data.includes("Printing to stderr") && !data.includes("Listening on ")) {
                this.stderrLogs += "\n" + data;
              }
            }
          });
          byline_1.default(this.child.stdout).on("data", (msg) => {
            var _a2;
            const data = String(msg);
            try {
              const json = JSON.parse(data);
              debug3("stdout", json);
              if (this.engineStartDeferred && json.level === "INFO" && json.target === "query_engine::server" && ((_a2 = json.fields) === null || _a2 === void 0 ? void 0 : _a2.message.startsWith("Started http server"))) {
                if (this.useUds) {
                  this.undici = new undici_1.Undici({
                    hostname: "localhost",
                    protocol: "http:"
                  }, {
                    socketPath: this.socketPath
                  });
                } else {
                  this.undici = new undici_1.Undici(`http://localhost:${this.port}`);
                }
                this.engineStartDeferred.resolve();
                this.engineStartDeferred = void 0;
                this.queryEngineStarted = true;
              }
              if (typeof json.is_panic === "undefined") {
                const log3 = log_1.convertLog(json);
                this.logEmitter.emit(log3.level, log3);
                this.lastLog = log3;
              } else {
                this.lastError = json;
              }
            } catch (e) {
              debug3(e, data);
            }
          });
          this.child.on("exit", (code) => {
            var _a2, _b2;
            if (this.engineStopDeferred) {
              this.engineStopDeferred.resolve(code);
              return;
            }
            (_a2 = this.undici) === null || _a2 === void 0 ? void 0 : _a2.close();
            this.exitCode = code;
            if (!this.queryEngineKilled && this.queryEngineStarted && this.restartCount < 5) {
              p_retry_1.default(async (attempt) => {
                debug3(`Restart attempt ${attempt}. Waiting for backoff`);
                if (this.backoffPromise) {
                  await this.backoffPromise;
                }
                debug3(`Restart attempt ${attempt}. Backoff done`);
                this.restartCount++;
                const wait = Math.random() * 2 * Math.pow(Math.E, this.restartCount);
                this.startPromise = void 0;
                this.backoffPromise = new Promise((r) => setTimeout(r, wait));
                return this.start();
              }, {
                retries: 4,
                randomize: true,
                minTimeout: 1e3,
                maxTimeout: 60 * 1e3,
                factor: Math.E,
                onFailedAttempt: (e) => {
                  debug3(e);
                }
              });
              return;
            }
            if (code !== 0 && this.engineStartDeferred) {
              let err;
              if (code !== null) {
                err = new Engine_1.PrismaClientInitializationError(`Query engine exited with code ${code}
` + this.stderrLogs, this.clientVersion);
              } else if ((_b2 = this.child) === null || _b2 === void 0 ? void 0 : _b2.signalCode) {
                err = new Engine_1.PrismaClientInitializationError(`Query engine process killed with signal ${this.child.signalCode} for unknown reason.
Make sure that the engine binary at ${prismaPath} is not corrupt.
` + this.stderrLogs, this.clientVersion);
              } else {
                err = new Engine_1.PrismaClientInitializationError(this.stderrLogs, this.clientVersion);
              }
              this.engineStartDeferred.reject(err);
            }
            if (!this.child) {
              return;
            }
            if (this.lastError) {
              return;
            }
            if (this.lastErrorLog) {
              this.lastErrorLog.target = "exit";
              return;
            }
            if (code === 126) {
              this.lastErrorLog = {
                timestamp: new Date(),
                target: "exit",
                level: "error",
                fields: {
                  message: `Couldn't start query engine as it's not executable on this operating system.
You very likely have the wrong "binaryTarget" defined in the schema.prisma file.`
                }
              };
            } else {
              this.lastErrorLog = {
                target: "exit",
                timestamp: new Date(),
                level: "error",
                fields: {
                  message: (this.stderrLogs || "") + (this.stdoutLogs || "") + `
Exit code: ${code}`
                }
              };
            }
          });
          this.child.on("error", (err) => {
            this.lastError = {
              message: err.message,
              backtrace: "Could not start query engine",
              is_panic: false
            };
            reject(err);
          });
          this.child.on("close", (code, signal) => {
            var _a2, _b2;
            (_a2 = this.undici) === null || _a2 === void 0 ? void 0 : _a2.close();
            if (code === null && signal === "SIGABRT" && this.child) {
              const error = new Engine_1.PrismaClientRustPanicError(Engine_1.getErrorMessageWithLink({
                platform: this.platform,
                title: `Panic in Query Engine with SIGABRT signal`,
                description: this.stderrLogs,
                version: this.clientVersion
              }), this.clientVersion);
              this.logEmitter.emit("error", error);
            } else if (code === 255 && signal === null && ((_b2 = this.lastErrorLog) === null || _b2 === void 0 ? void 0 : _b2.fields.message) === "PANIC" && !this.lastPanic) {
              const error = new Engine_1.PrismaClientRustPanicError(Engine_1.getErrorMessageWithLink({
                platform: this.platform,
                title: `${this.lastErrorLog.fields.message}: ${this.lastErrorLog.fields.reason} in
${this.lastErrorLog.fields.file}:${this.lastErrorLog.fields.line}:${this.lastErrorLog.fields.column}`,
                version: this.clientVersion
              }), this.clientVersion);
              this.logEmitter.emit("error", error);
            }
          });
          if (this.lastError) {
            return reject(new Engine_1.PrismaClientInitializationError(Engine_1.getMessage(this.lastError), this.clientVersion));
          }
          if (this.lastErrorLog) {
            return reject(new Engine_1.PrismaClientInitializationError(Engine_1.getMessage(this.lastErrorLog), this.clientVersion));
          }
          try {
            await new Promise((resolve2, reject2) => {
              this.engineStartDeferred = {resolve: resolve2, reject: reject2};
            });
          } catch (err) {
            (_c = this.child) === null || _c === void 0 ? void 0 : _c.kill();
            throw err;
          }
          this.url = `http://localhost:${this.port}`;
          (async () => {
            const engineVersion = await this.version();
            debug3(`Client Version ${this.clientVersion}`);
            debug3(`Engine Version ${engineVersion}`);
          })();
          this.stopPromise = void 0;
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }
    async stop() {
      if (!this.stopPromise) {
        this.stopPromise = this._stop();
      }
      return this.stopPromise;
    }
    async _stop() {
      var _a, _b;
      if (this.startPromise) {
        await this.startPromise;
      }
      await new Promise((resolve) => process.nextTick(resolve));
      if (this.currentRequestPromise) {
        try {
          await this.currentRequestPromise;
        } catch (e) {
        }
      }
      this.getConfigPromise = void 0;
      let stopChildPromise;
      if (this.child) {
        debug3(`Stopping Prisma engine4`);
        if (this.startPromise) {
          debug3(`Waiting for start promise`);
          await this.startPromise;
        }
        debug3(`Done waiting for start promise`);
        stopChildPromise = new Promise((resolve, reject) => {
          this.engineStopDeferred = {resolve, reject};
        });
        this.queryEngineKilled = true;
        (_a = this.undici) === null || _a === void 0 ? void 0 : _a.close();
        (_b = this.child) === null || _b === void 0 ? void 0 : _b.kill();
        this.child = void 0;
      }
      if (stopChildPromise) {
        await stopChildPromise;
      }
      await new Promise((r) => process.nextTick(r));
      this.startPromise = void 0;
      this.engineStopDeferred = void 0;
      setTimeout(() => {
        if (this.socketPath) {
          try {
            fs_1.default.unlinkSync(this.socketPath);
          } catch (e) {
            debug3(e);
          }
          socketPaths.splice(socketPaths.indexOf(this.socketPath), 1);
          this.socketPath = void 0;
        }
      });
    }
    async kill(signal) {
      var _a, _b;
      this.getConfigPromise = void 0;
      this.globalKillSignalReceived = signal;
      this.queryEngineKilled = true;
      (_a = this.child) === null || _a === void 0 ? void 0 : _a.kill();
      (_b = this.undici) === null || _b === void 0 ? void 0 : _b.close();
    }
    getFreePort() {
      return new Promise((resolve, reject) => {
        const server = net_1.default.createServer((s) => s.end(""));
        server.unref();
        server.on("error", reject);
        server.listen(0, () => {
          const address = server.address();
          const port = typeof address === "string" ? parseInt(address.split(":").slice(-1)[0], 10) : address.port;
          server.close((e) => {
            if (e) {
              reject(e);
            }
            resolve(port);
          });
        });
      });
    }
    async getConfig() {
      if (!this.getConfigPromise) {
        this.getConfigPromise = this._getConfig();
      }
      return this.getConfigPromise;
    }
    async _getConfig() {
      const prismaPath = await this.getPrismaPath();
      const env = await this.getEngineEnvVars();
      const result = await execa_1.default(prismaPath, ["cli", "get-config"], {
        env: omit_1.omit(env, ["PORT"]),
        cwd: this.cwd
      });
      return JSON.parse(result.stdout);
    }
    async version() {
      const prismaPath = await this.getPrismaPath();
      const result = await execa_1.default(prismaPath, ["--version"], {
        env: {
          ...process.env
        }
      });
      return result.stdout;
    }
    async request(query2, headers, numTry = 1) {
      if (this.stopPromise) {
        await this.stopPromise;
      }
      await this.start();
      if (!this.child && !this.engineEndpoint) {
        throw new Engine_1.PrismaClientUnknownRequestError(`Can't perform request, as the Engine has already been stopped`, this.clientVersion);
      }
      this.currentRequestPromise = this.undici.request(stringifyQuery(query2), headers);
      return this.currentRequestPromise.then(({data, headers: headers2}) => {
        if (data.errors) {
          if (data.errors.length === 1) {
            throw this.graphQLToJSError(data.errors[0]);
          }
          throw new Error(JSON.stringify(data.errors));
        }
        const elapsed = parseInt(headers2["x-elapsed"]) / 1e3;
        if (this.restartCount > 0) {
          this.restartCount = 0;
        }
        return {data, elapsed};
      }).catch(async (e) => {
        const isError = await this.handleRequestError(e, numTry < 3);
        if (!isError) {
          if (numTry < 3) {
            await new Promise((r) => setTimeout(r, Math.random() * 1e3));
            return this.request(query2, headers, numTry + 1);
          }
        }
        throw isError;
      });
    }
    async requestBatch(queries, transaction = false, numTry = 1) {
      await this.start();
      if (!this.child && !this.engineEndpoint) {
        throw new Engine_1.PrismaClientUnknownRequestError(`Can't perform request, as the Engine has already been stopped`, this.clientVersion);
      }
      const variables = {};
      const body = {
        batch: queries.map((query2) => ({query: query2, variables})),
        transaction
      };
      this.currentRequestPromise = this.undici.request(JSON.stringify(body));
      return this.currentRequestPromise.then(({data, headers}) => {
        const elapsed = parseInt(headers["x-elapsed"]) / 1e3;
        if (Array.isArray(data)) {
          return data.map((result) => {
            if (result.errors) {
              return this.graphQLToJSError(result.errors[0]);
            }
            return {
              data: result,
              elapsed
            };
          });
        } else {
          if (data.errors && data.errors.length === 1) {
            throw new Error(data.errors[0].error);
          }
          throw new Error(JSON.stringify(data));
        }
      }).catch(async (e) => {
        const isError = await this.handleRequestError(e, numTry < 3);
        if (!isError) {
          if (numTry < 3) {
            await new Promise((r) => setTimeout(r, Math.random() * 1e3));
            return this.requestBatch(queries, transaction, numTry + 1);
          }
        }
        throw isError;
      });
    }
    getLastLog() {
      var _a, _b, _c;
      const message = (_b = (_a = this.lastLog) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.message;
      if (message) {
        const fields = Object.entries((_c = this.lastLog) === null || _c === void 0 ? void 0 : _c.fields).filter(([key]) => key !== "message").map(([key, value]) => {
          return `${key}: ${value}`;
        }).join(", ");
        if (fields) {
          return `${message}  ${fields}`;
        }
        return message;
      }
      return null;
    }
    graphQLToJSError(error) {
      if (error.user_facing_error.error_code) {
        return new Engine_1.PrismaClientKnownRequestError(error.user_facing_error.message, error.user_facing_error.error_code, this.clientVersion, error.user_facing_error.meta);
      }
      return new Engine_1.PrismaClientUnknownRequestError(error.user_facing_error.message, this.clientVersion);
    }
  }
  exports.NodeEngine = NodeEngine3;
  function stringifyQuery(q) {
    return `{"variables":{},"query":${JSON.stringify(q)}}`;
  }
  function hookProcess(handler, exit = false) {
    process.once(handler, async () => {
      for (const engine of engines) {
        await engine.emitExit();
        engine.kill(handler);
      }
      engines.splice(0, engines.length);
      if (socketPaths.length > 0) {
        for (const socketPath of socketPaths) {
          try {
            fs_1.default.unlinkSync(socketPath);
          } catch (e) {
          }
        }
      }
      if (exit && process.listenerCount(handler) === 0) {
        process.exit();
      }
    });
  }
  hookProcess("beforeExit");
  hookProcess("exit");
  hookProcess("SIGINT", true);
  hookProcess("SIGUSR1", true);
  hookProcess("SIGUSR2", true);
  hookProcess("SIGTERM", true);
});

// ../engine-core/dist/getInternalDatamodelJson.js
var require_getInternalDatamodelJson = __commonJS((exports) => {
  "use strict";
  var __importDefault = exports && exports.__importDefault || function(mod2) {
    return mod2 && mod2.__esModule ? mod2 : {default: mod2};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.getInternalDatamodelJson = void 0;
  const path_1 = __importDefault(require("path"));
  const child_process_1 = require("child_process");
  const byline_1 = __importDefault(require_byline2());
  function getInternalDatamodelJson(datamodel, schemaInferrerPath = path_1.default.join(__dirname, "../schema-inferrer-bin")) {
    return new Promise((resolve, reject) => {
      const proc = child_process_1.spawn(schemaInferrerPath, {
        stdio: ["pipe", "pipe", process.stderr]
      });
      proc.on("error", function(err) {
        console.error("[schema-inferrer-bin] error: %s", err);
        reject(err);
      });
      proc.on("exit", function(code, signal) {
        if (code !== 0) {
          console.error("[schema-inferrer-bin] exit: code=%s signal=%s", code, signal);
        }
        reject();
      });
      const out = byline_1.default(proc.stdout);
      out.on("data", (line) => {
        const result = JSON.parse(line);
        const resultB64 = Buffer.from(JSON.stringify(result)).toString("base64");
        resolve(resultB64);
      });
      const cut = datamodel.replace(/\n/g, " ");
      proc.stdin.write(JSON.stringify({dataModel: cut}) + "\n");
    });
  }
  exports.getInternalDatamodelJson = getInternalDatamodelJson;
});

// ../engine-core/dist/index.js
var require_dist5 = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.fixBinaryTargets = exports.printGeneratorConfig = exports.getInternalDatamodelJson = exports.Engine = exports.PrismaClientRustPanicError = exports.PrismaClientInitializationError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
  var Engine_1 = require_Engine();
  Object.defineProperty(exports, "PrismaClientKnownRequestError", {enumerable: true, get: function() {
    return Engine_1.PrismaClientKnownRequestError;
  }});
  Object.defineProperty(exports, "PrismaClientUnknownRequestError", {enumerable: true, get: function() {
    return Engine_1.PrismaClientUnknownRequestError;
  }});
  Object.defineProperty(exports, "PrismaClientInitializationError", {enumerable: true, get: function() {
    return Engine_1.PrismaClientInitializationError;
  }});
  Object.defineProperty(exports, "PrismaClientRustPanicError", {enumerable: true, get: function() {
    return Engine_1.PrismaClientRustPanicError;
  }});
  var NodeEngine_1 = require_NodeEngine();
  Object.defineProperty(exports, "Engine", {enumerable: true, get: function() {
    return NodeEngine_1.NodeEngine;
  }});
  var getInternalDatamodelJson_1 = require_getInternalDatamodelJson();
  Object.defineProperty(exports, "getInternalDatamodelJson", {enumerable: true, get: function() {
    return getInternalDatamodelJson_1.getInternalDatamodelJson;
  }});
  var printGeneratorConfig_1 = require_printGeneratorConfig();
  Object.defineProperty(exports, "printGeneratorConfig", {enumerable: true, get: function() {
    return printGeneratorConfig_1.printGeneratorConfig;
  }});
  var util_1 = require_util2();
  Object.defineProperty(exports, "fixBinaryTargets", {enumerable: true, get: function() {
    return util_1.fixBinaryTargets;
  }});
});

// ../../node_modules/.pnpm/sql-template-tag@3.4.0/node_modules/sql-template-tag/dist/index.js
var require_dist6 = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.sqltag = exports.empty = exports.raw = exports.join = exports.Sql = void 0;
  const util_1 = require("util");
  class Sql {
    constructor(rawStrings, rawValues) {
      if (rawStrings.length === 0) {
        throw new TypeError("Expected at least 1 string");
      }
      if (rawStrings.length - 1 !== rawValues.length) {
        throw new TypeError(`Expected ${rawStrings.length} strings to have ${rawStrings.length - 1} values`);
      }
      let valuesLength = rawValues.length;
      let stringsLength = rawStrings.length;
      for (const child of rawValues) {
        if (child instanceof Sql) {
          valuesLength += child.values.length - 1;
          stringsLength += child.strings.length - 2;
        }
      }
      this.values = new Array(valuesLength);
      this.strings = new Array(stringsLength);
      this.strings[0] = rawStrings[0];
      let index = 1;
      let position = 0;
      while (index < rawStrings.length) {
        const child = rawValues[index - 1];
        const rawString = rawStrings[index++];
        if (child instanceof Sql) {
          this.strings[position] += child.strings[0];
          let childIndex = 0;
          while (childIndex < child.values.length) {
            this.values[position++] = child.values[childIndex++];
            this.strings[position] = child.strings[childIndex];
          }
          this.strings[position] += rawString;
        } else {
          this.values[position++] = child;
          this.strings[position] = rawString;
        }
      }
    }
    get text() {
      return this.strings.reduce((text, part, index) => `${text}$${index}${part}`);
    }
    get sql() {
      return this.strings.join("?");
    }
    [util_1.inspect.custom]() {
      return {
        text: this.text,
        sql: this.sql,
        values: this.values
      };
    }
  }
  exports.Sql = Sql;
  Object.defineProperty(Sql.prototype, "sql", {enumerable: true});
  Object.defineProperty(Sql.prototype, "text", {enumerable: true});
  function join(values, separator = ",") {
    if (values.length === 0) {
      throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array");
    }
    return new Sql(["", ...Array(values.length - 1).fill(separator), ""], values);
  }
  exports.join = join;
  function raw(value) {
    return new Sql([value], []);
  }
  exports.raw = raw;
  exports.empty = raw("");
  function sqltag2(strings, ...values) {
    return new Sql(strings.raw, values);
  }
  exports.sqltag = sqltag2;
  exports.default = sqltag2;
});

// ../../node_modules/.pnpm/dotenv@8.2.0/node_modules/dotenv/lib/main.js
var require_main2 = __commonJS((exports, module2) => {
  const fs3 = require("fs");
  const path3 = require("path");
  function log3(message) {
    console.log(`[dotenv][DEBUG] ${message}`);
  }
  const NEWLINE = "\n";
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
  const RE_NEWLINES = /\\n/g;
  const NEWLINES_MATCH = /\n|\r|\r\n/;
  function parse2(src, options) {
    const debug3 = Boolean(options && options.debug);
    const obj = {};
    src.toString().split(NEWLINES_MATCH).forEach(function(line, idx) {
      const keyValueArr = line.match(RE_INI_KEY_VAL);
      if (keyValueArr != null) {
        const key = keyValueArr[1];
        let val = keyValueArr[2] || "";
        const end = val.length - 1;
        const isDoubleQuoted = val[0] === '"' && val[end] === '"';
        const isSingleQuoted = val[0] === "'" && val[end] === "'";
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end);
          if (isDoubleQuoted) {
            val = val.replace(RE_NEWLINES, NEWLINE);
          }
        } else {
          val = val.trim();
        }
        obj[key] = val;
      } else if (debug3) {
        log3(`did not match key and value when parsing line ${idx + 1}: ${line}`);
      }
    });
    return obj;
  }
  function config2(options) {
    let dotenvPath = path3.resolve(process.cwd(), ".env");
    let encoding = "utf8";
    let debug3 = false;
    if (options) {
      if (options.path != null) {
        dotenvPath = options.path;
      }
      if (options.encoding != null) {
        encoding = options.encoding;
      }
      if (options.debug != null) {
        debug3 = true;
      }
    }
    try {
      const parsed = parse2(fs3.readFileSync(dotenvPath, {encoding}), {debug: debug3});
      Object.keys(parsed).forEach(function(key) {
        if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
          process.env[key] = parsed[key];
        } else if (debug3) {
          log3(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
        }
      });
      return {parsed};
    } catch (e) {
      return {error: e};
    }
  }
  module2.exports.config = config2;
  module2.exports.parse = parse2;
});

// ../sdk/dist/dotenvExpand.js
var require_dotenvExpand = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.dotenvExpand = void 0;
  function dotenvExpand3(config2) {
    const environment = config2.ignoreProcessEnv ? {} : process.env;
    const interpolate = (envValue) => {
      var matches = envValue.match(/(.?\${(?:[a-zA-Z0-9_]+)?})/g) || [];
      return matches.reduce(function(newEnv, match) {
        const parts = /(.?)\${([a-zA-Z0-9_]+)?}/g.exec(match);
        if (!parts) {
          return newEnv;
        }
        const prefix = parts[1];
        let value, replacePart;
        if (prefix === "\\") {
          replacePart = parts[0];
          value = replacePart.replace("\\$", "$");
        } else {
          const key = parts[2];
          replacePart = parts[0].substring(prefix.length);
          value = environment.hasOwnProperty(key) ? environment[key] : config2.parsed[key] || "";
          value = interpolate(value);
        }
        return newEnv.replace(replacePart, value);
      }, envValue);
    };
    for (const configKey in config2.parsed) {
      const value = environment.hasOwnProperty(configKey) ? environment[configKey] : config2.parsed[configKey];
      config2.parsed[configKey] = interpolate(value);
    }
    for (var processKey in config2.parsed) {
      environment[processKey] = config2.parsed[processKey];
    }
    return config2;
  }
  exports.dotenvExpand = dotenvExpand3;
});

// ../sdk/dist/utils/mapPreviewFeatures.js
var require_mapPreviewFeatures = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.mapPreviewFeatures = void 0;
  const featureFlagMap = {
    transactionApi: "transaction",
    aggregateApi: "aggregations"
  };
  function mapPreviewFeatures3(features) {
    if (Array.isArray(features) && features.length > 0) {
      return features.map((f) => {
        var _a;
        return (_a = featureFlagMap[f]) !== null && _a !== void 0 ? _a : f;
      });
    }
    return [];
  }
  exports.mapPreviewFeatures = mapPreviewFeatures3;
});

// package.json
var require_package2 = __commonJS((exports, module2) => {
  module2.exports = {
    name: "@prisma/client",
    version: "2.10.0",
    description: "Prisma Client is an auto-generated, type-safe and modern JavaScript/TypeScript ORM for Node.js that's tailored to your data. Supports MySQL, PostgreSQL, MariaDB, SQLite databases.",
    keywords: [
      "orm",
      "prisma2",
      "prisma",
      "client",
      "query",
      "database",
      "sql",
      "postgres",
      "postgresql",
      "mysql",
      "sqlite",
      "mariadb",
      "typescript",
      "query-builder"
    ],
    main: "index.js",
    types: "index.d.ts",
    license: "Apache-2.0",
    engines: {
      node: ">=10"
    },
    homepage: "https://github.com/prisma/prisma-client-js",
    repository: {
      url: "git@github.com:prisma/prisma.git"
    },
    maintainers: [
      "Tim Suchanek <suchanek@prisma.io>",
      "Joël Galeran <galeran@prisma.io>"
    ],
    bugs: {
      email: "suchanek@prisma.io",
      url: "https://github.com/prisma/prisma-client-js/issues"
    },
    scripts: {
      build: "node helpers/build.js",
      test: "jest",
      format: "prettier --write .",
      lint: "eslint --fix --ext .js,.ts .",
      generate: "node scripts/postinstall.js",
      postinstall: "node scripts/postinstall.js",
      prepare: "cp scripts/backup-index.js index.js && cp scripts/backup-index.d.ts index.d.ts",
      prepublishOnly: "pnpm run build"
    },
    files: [
      "runtime",
      "scripts",
      "generator-build",
      "index.js",
      "index.d.ts"
    ],
    devDependencies: {
      "@prisma/debug": "2.10.0",
      "@prisma/engine-core": "2.10.0",
      "@prisma/engines": "2.10.0-16-af1ae11a423edfb5d24092a85be11fa77c5e499c",
      "@prisma/fetch-engine": "2.10.0",
      "@prisma/generator-helper": "2.10.0",
      "@prisma/get-platform": "2.10.0",
      "@prisma/migrate": "2.10.0",
      "@prisma/sdk": "2.10.0",
      "@timsuchanek/copy": "1.4.5",
      "@types/debug": "4.1.5",
      "@types/fs-extra": "9.0.1",
      "@types/jest": "26.0.14",
      "@types/js-levenshtein": "1.1.0",
      "@types/node": "12.12.62",
      "@types/node-fetch": "2.5.7",
      "@types/pg": "7.14.5",
      "@typescript-eslint/eslint-plugin": "4.2.0",
      "@typescript-eslint/parser": "4.2.0",
      arg: "4.1.3",
      benchmark: "2.1.4",
      chalk: "4.1.0",
      "decimal.js": "10.2.1",
      dotenv: "8.2.0",
      esbuild: "0.7.19",
      "escape-string-regexp": "4.0.0",
      eslint: "7.10.0",
      "eslint-config-prettier": "6.12.0",
      "eslint-plugin-eslint-comments": "3.2.0",
      "eslint-plugin-jest": "24.0.2",
      "eslint-plugin-prettier": "3.1.4",
      execa: "4.0.3",
      "flat-map-polyfill": "0.3.8",
      "fs-monkey": "1.0.1",
      "get-own-enumerable-property-symbols": "3.0.2",
      "get-port": "5.1.1",
      husky: "4.3.0",
      "indent-string": "4.0.0",
      "is-obj": "2.0.0",
      "is-regexp": "2.1.0",
      jest: "26.4.2",
      "jest-diff": "26.4.2",
      "js-levenshtein": "1.1.6",
      klona: "2.0.4",
      "lint-staged": "10.4.0",
      "make-dir": "3.1.0",
      mariadb: "2.4.2",
      mssql: "6.2.3",
      "node-fetch": "2.6.1",
      packwatch: "2.0.0",
      pg: "8.3.3",
      pidtree: "0.5.0",
      "pkg-up": "3.1.0",
      pluralize: "8.0.0",
      prettier: "2.1.2",
      "replace-string": "3.1.0",
      rimraf: "3.0.2",
      rollup: "2.28.2",
      "rollup-plugin-dts": "1.4.13",
      "set-value": "3.0.2",
      "sql-template-tag": "4.0.0",
      "stacktrace-parser": "0.1.10",
      "stat-mode": "1.0.0",
      "strip-ansi": "6.0.0",
      "strip-indent": "3.0.0",
      "ts-jest": "26.4.0",
      "ts-loader": "8.0.4",
      "ts-node": "9.0.0",
      typescript: "4.0.3"
    },
    peerDependencies: {
      "@prisma/cli": "*"
    },
    peerDependenciesMeta: {
      "@prisma/cli": {
        optional: true
      }
    },
    husky: {
      hooks: {
        "pre-commit": "lint-staged"
      }
    },
    "lint-staged": {
      "*.{js,ts,css,json,md}": [
        "prettier --write",
        "git add"
      ],
      "*.{js,ts}": [
        "eslint"
      ]
    },
    dependencies: {
      "@prisma/engines-version": "2.10.0-16-af1ae11a423edfb5d24092a85be11fa77c5e499c"
    }
  };
});

// src/runtime/index.ts
var require_runtime = __commonJS((exports) => {
  __export(exports, {
    DMMF: () => generator_helper.DMMF,
    DMMFClass: () => DMMFClass,
    Decimal: () => decimal_default,
    Engine: () => engine_core.Engine,
    PrismaClientInitializationError: () => engine_core.PrismaClientInitializationError,
    PrismaClientKnownRequestError: () => engine_core.PrismaClientKnownRequestError,
    PrismaClientRustPanicError: () => engine_core.PrismaClientRustPanicError,
    PrismaClientUnknownRequestError: () => engine_core.PrismaClientUnknownRequestError,
    PrismaClientValidationError: () => PrismaClientValidationError,
    RawValue: () => sql_template_tag.RawValue,
    Sql: () => sql_template_tag.Sql,
    Value: () => sql_template_tag.Value,
    debugLib: () => debug3.default,
    empty: () => sql_template_tag.empty,
    getPrismaClient: () => getPrismaClient,
    join: () => sql_template_tag.join,
    makeDocument: () => makeDocument,
    raw: () => sql_template_tag.raw,
    sqltag: () => sql_template_tag.sqltag,
    transformDocument: () => transformDocument,
    unpack: () => unpack
  });
  const debug3 = __toModule(require_dist2());
  const engine_core = __toModule(require_dist5());
  const sql_template_tag = __toModule(require_dist6());
});

// src/runtime/dmmf-types.ts
const generator_helper = __toModule(require_dist());

// src/runtime/utils/common.ts
const chalk = __toModule(require_source());
const indent_string = __toModule(require_indent_string());
const js_levenshtein = __toModule(require_js_levenshtein());

// ../../node_modules/.pnpm/decimal.js@10.2.1/node_modules/decimal.js/decimal.mjs
var EXP_LIMIT = 9e15;
var MAX_DIGITS = 1e9;
var NUMERALS = "0123456789abcdef";
var LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
var PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
var DEFAULTS = {
  precision: 20,
  rounding: 4,
  modulo: 1,
  toExpNeg: -7,
  toExpPos: 21,
  minE: -EXP_LIMIT,
  maxE: EXP_LIMIT,
  crypto: false
};
var inexact;
var quadrant;
var external = true;
var decimalError = "[DecimalError] ";
var invalidArgument = decimalError + "Invalid argument: ";
var precisionLimitExceeded = decimalError + "Precision limit exceeded";
var cryptoUnavailable = decimalError + "crypto unavailable";
var mathfloor = Math.floor;
var mathpow = Math.pow;
var isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
var isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
var isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
var isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
var BASE = 1e7;
var LOG_BASE = 7;
var MAX_SAFE_INTEGER = 9007199254740991;
var LN10_PRECISION = LN10.length - 1;
var PI_PRECISION = PI.length - 1;
var P = {name: "[object Decimal]"};
P.absoluteValue = P.abs = function() {
  var x = new this.constructor(this);
  if (x.s < 0)
    x.s = 1;
  return finalise(x);
};
P.ceil = function() {
  return finalise(new this.constructor(this), this.e + 1, 2);
};
P.comparedTo = P.cmp = function(y) {
  var i, j, xdL, ydL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
  if (!xd || !yd) {
    return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
  }
  if (!xd[0] || !yd[0])
    return xd[0] ? xs : yd[0] ? -ys : 0;
  if (xs !== ys)
    return xs;
  if (x.e !== y.e)
    return x.e > y.e ^ xs < 0 ? 1 : -1;
  xdL = xd.length;
  ydL = yd.length;
  for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
    if (xd[i] !== yd[i])
      return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
  }
  return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
};
P.cosine = P.cos = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.d)
    return new Ctor(NaN);
  if (!x.d[0])
    return new Ctor(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x = cosine(Ctor, toLessThanHalfPi(Ctor, x));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
};
P.cubeRoot = P.cbrt = function() {
  var e, m, n, r, rep, s, sd, t, t3, t3plusx, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero())
    return new Ctor(x);
  external = false;
  s = x.s * mathpow(x.s * x, 1 / 3);
  if (!s || Math.abs(s) == 1 / 0) {
    n = digitsToString(x.d);
    e = x.e;
    if (s = (e - n.length + 1) % 3)
      n += s == 1 || s == -2 ? "0" : "00";
    s = mathpow(n, 1 / 3);
    e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));
    if (s == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r = new Ctor(n);
    r.s = x.s;
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    t3 = t.times(t).times(t);
    t3plusx = t3.plus(x);
    r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e + 1, 0);
          if (t.times(t).times(t).eq(x)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e + 1, 1);
          m = !r.times(r).times(r).eq(x);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e, Ctor.rounding, m);
};
P.decimalPlaces = P.dp = function() {
  var w, d = this.d, n = NaN;
  if (d) {
    w = d.length - 1;
    n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
    w = d[w];
    if (w)
      for (; w % 10 == 0; w /= 10)
        n--;
    if (n < 0)
      n = 0;
  }
  return n;
};
P.dividedBy = P.div = function(y) {
  return divide(this, new this.constructor(y));
};
P.dividedToIntegerBy = P.divToInt = function(y) {
  var x = this, Ctor = x.constructor;
  return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
};
P.equals = P.eq = function(y) {
  return this.cmp(y) === 0;
};
P.floor = function() {
  return finalise(new this.constructor(this), this.e + 1, 3);
};
P.greaterThan = P.gt = function(y) {
  return this.cmp(y) > 0;
};
P.greaterThanOrEqualTo = P.gte = function(y) {
  var k = this.cmp(y);
  return k == 1 || k === 0;
};
P.hyperbolicCosine = P.cosh = function() {
  var k, n, pr, rm, len, x = this, Ctor = x.constructor, one = new Ctor(1);
  if (!x.isFinite())
    return new Ctor(x.s ? 1 / 0 : NaN);
  if (x.isZero())
    return one;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
  Ctor.rounding = 1;
  len = x.d.length;
  if (len < 32) {
    k = Math.ceil(len / 3);
    n = (1 / tinyPow(4, k)).toString();
  } else {
    k = 16;
    n = "2.3283064365386962890625e-10";
  }
  x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);
  var cosh2_x, i = k, d8 = new Ctor(8);
  for (; i--; ) {
    cosh2_x = x.times(x);
    x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
  }
  return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.hyperbolicSine = P.sinh = function() {
  var k, pr, rm, len, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
  Ctor.rounding = 1;
  len = x.d.length;
  if (len < 3) {
    x = taylorSeries(Ctor, 2, x, x, true);
  } else {
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;
    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x, true);
    var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
    for (; k--; ) {
      sinh2_x = x.times(x);
      x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
    }
  }
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(x, pr, rm, true);
};
P.hyperbolicTangent = P.tanh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(x.s);
  if (x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 7;
  Ctor.rounding = 1;
  return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
};
P.inverseCosine = P.acos = function() {
  var halfPi, x = this, Ctor = x.constructor, k = x.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
  if (k !== -1) {
    return k === 0 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
  }
  if (x.isZero())
    return getPi(Ctor, pr + 4, rm).times(0.5);
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x = x.asin();
  halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return halfPi.minus(x);
};
P.inverseHyperbolicCosine = P.acosh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (x.lte(1))
    return new Ctor(x.eq(1) ? 0 : NaN);
  if (!x.isFinite())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
  Ctor.rounding = 1;
  external = false;
  x = x.times(x).minus(1).sqrt().plus(x);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.ln();
};
P.inverseHyperbolicSine = P.asinh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
  Ctor.rounding = 1;
  external = false;
  x = x.times(x).plus(1).sqrt().plus(x);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.ln();
};
P.inverseHyperbolicTangent = P.atanh = function() {
  var pr, rm, wpr, xsd, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(NaN);
  if (x.e >= 0)
    return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  xsd = x.sd();
  if (Math.max(xsd, pr) < 2 * -x.e - 1)
    return finalise(new Ctor(x), pr, rm, true);
  Ctor.precision = wpr = xsd - x.e;
  x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);
  Ctor.precision = pr + 4;
  Ctor.rounding = 1;
  x = x.ln();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.times(0.5);
};
P.inverseSine = P.asin = function() {
  var halfPi, k, pr, rm, x = this, Ctor = x.constructor;
  if (x.isZero())
    return new Ctor(x);
  k = x.abs().cmp(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (k !== -1) {
    if (k === 0) {
      halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
      halfPi.s = x.s;
      return halfPi;
    }
    return new Ctor(NaN);
  }
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.times(2);
};
P.inverseTangent = P.atan = function() {
  var i, j, k, n, px, t, r, wpr, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
  if (!x.isFinite()) {
    if (!x.s)
      return new Ctor(NaN);
    if (pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.5);
      r.s = x.s;
      return r;
    }
  } else if (x.isZero()) {
    return new Ctor(x);
  } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
    r = getPi(Ctor, pr + 4, rm).times(0.25);
    r.s = x.s;
    return r;
  }
  Ctor.precision = wpr = pr + 10;
  Ctor.rounding = 1;
  k = Math.min(28, wpr / LOG_BASE + 2 | 0);
  for (i = k; i; --i)
    x = x.div(x.times(x).plus(1).sqrt().plus(1));
  external = false;
  j = Math.ceil(wpr / LOG_BASE);
  n = 1;
  x2 = x.times(x);
  r = new Ctor(x);
  px = x;
  for (; i !== -1; ) {
    px = px.times(x2);
    t = r.minus(px.div(n += 2));
    px = px.times(x2);
    r = t.plus(px.div(n += 2));
    if (r.d[j] !== void 0)
      for (i = j; r.d[i] === t.d[i] && i--; )
        ;
  }
  if (k)
    r = r.times(2 << k - 1);
  external = true;
  return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.isFinite = function() {
  return !!this.d;
};
P.isInteger = P.isInt = function() {
  return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
};
P.isNaN = function() {
  return !this.s;
};
P.isNegative = P.isNeg = function() {
  return this.s < 0;
};
P.isPositive = P.isPos = function() {
  return this.s > 0;
};
P.isZero = function() {
  return !!this.d && this.d[0] === 0;
};
P.lessThan = P.lt = function(y) {
  return this.cmp(y) < 0;
};
P.lessThanOrEqualTo = P.lte = function(y) {
  return this.cmp(y) < 1;
};
P.logarithm = P.log = function(base) {
  var isBase10, d, denominator, k, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
  if (base == null) {
    base = new Ctor(10);
    isBase10 = true;
  } else {
    base = new Ctor(base);
    d = base.d;
    if (base.s < 0 || !d || !d[0] || base.eq(1))
      return new Ctor(NaN);
    isBase10 = base.eq(10);
  }
  d = arg.d;
  if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
    return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
  }
  if (isBase10) {
    if (d.length > 1) {
      inf = true;
    } else {
      for (k = d[0]; k % 10 === 0; )
        k /= 10;
      inf = k !== 1;
    }
  }
  external = false;
  sd = pr + guard;
  num = naturalLogarithm(arg, sd);
  denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
  r = divide(num, denominator, sd, 1);
  if (checkRoundingDigits(r.d, k = pr, rm)) {
    do {
      sd += 10;
      num = naturalLogarithm(arg, sd);
      denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
      r = divide(num, denominator, sd, 1);
      if (!inf) {
        if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
        break;
      }
    } while (checkRoundingDigits(r.d, k += 10, rm));
  }
  external = true;
  return finalise(r, pr, rm);
};
P.minus = P.sub = function(y) {
  var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.d) {
    if (!x.s || !y.s)
      y = new Ctor(NaN);
    else if (x.d)
      y.s = -y.s;
    else
      y = new Ctor(y.d || x.s !== y.s ? x : NaN);
    return y;
  }
  if (x.s != y.s) {
    y.s = -y.s;
    return x.plus(y);
  }
  xd = x.d;
  yd = y.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (yd[0])
      y.s = -y.s;
    else if (xd[0])
      y = new Ctor(x);
    else
      return new Ctor(rm === 3 ? -0 : 0);
    return external ? finalise(y, pr, rm) : y;
  }
  e = mathfloor(y.e / LOG_BASE);
  xe = mathfloor(x.e / LOG_BASE);
  xd = xd.slice();
  k = xe - e;
  if (k) {
    xLTy = k < 0;
    if (xLTy) {
      d = xd;
      k = -k;
      len = yd.length;
    } else {
      d = yd;
      e = xe;
      len = xd.length;
    }
    i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
    if (k > i) {
      k = i;
      d.length = 1;
    }
    d.reverse();
    for (i = k; i--; )
      d.push(0);
    d.reverse();
  } else {
    i = xd.length;
    len = yd.length;
    xLTy = i < len;
    if (xLTy)
      len = i;
    for (i = 0; i < len; i++) {
      if (xd[i] != yd[i]) {
        xLTy = xd[i] < yd[i];
        break;
      }
    }
    k = 0;
  }
  if (xLTy) {
    d = xd;
    xd = yd;
    yd = d;
    y.s = -y.s;
  }
  len = xd.length;
  for (i = yd.length - len; i > 0; --i)
    xd[len++] = 0;
  for (i = yd.length; i > k; ) {
    if (xd[--i] < yd[i]) {
      for (j = i; j && xd[--j] === 0; )
        xd[j] = BASE - 1;
      --xd[j];
      xd[i] += BASE;
    }
    xd[i] -= yd[i];
  }
  for (; xd[--len] === 0; )
    xd.pop();
  for (; xd[0] === 0; xd.shift())
    --e;
  if (!xd[0])
    return new Ctor(rm === 3 ? -0 : 0);
  y.d = xd;
  y.e = getBase10Exponent(xd, e);
  return external ? finalise(y, pr, rm) : y;
};
P.modulo = P.mod = function(y) {
  var q, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.s || y.d && !y.d[0])
    return new Ctor(NaN);
  if (!y.d || x.d && !x.d[0]) {
    return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
  }
  external = false;
  if (Ctor.modulo == 9) {
    q = divide(x, y.abs(), 0, 3, 1);
    q.s *= y.s;
  } else {
    q = divide(x, y, 0, Ctor.modulo, 1);
  }
  q = q.times(y);
  external = true;
  return x.minus(q);
};
P.naturalExponential = P.exp = function() {
  return naturalExponential(this);
};
P.naturalLogarithm = P.ln = function() {
  return naturalLogarithm(this);
};
P.negated = P.neg = function() {
  var x = new this.constructor(this);
  x.s = -x.s;
  return finalise(x);
};
P.plus = P.add = function(y) {
  var carry, d, e, i, k, len, pr, rm, xd, yd, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.d) {
    if (!x.s || !y.s)
      y = new Ctor(NaN);
    else if (!x.d)
      y = new Ctor(y.d || x.s === y.s ? x : NaN);
    return y;
  }
  if (x.s != y.s) {
    y.s = -y.s;
    return x.minus(y);
  }
  xd = x.d;
  yd = y.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (!yd[0])
      y = new Ctor(x);
    return external ? finalise(y, pr, rm) : y;
  }
  k = mathfloor(x.e / LOG_BASE);
  e = mathfloor(y.e / LOG_BASE);
  xd = xd.slice();
  i = k - e;
  if (i) {
    if (i < 0) {
      d = xd;
      i = -i;
      len = yd.length;
    } else {
      d = yd;
      e = k;
      len = xd.length;
    }
    k = Math.ceil(pr / LOG_BASE);
    len = k > len ? k + 1 : len + 1;
    if (i > len) {
      i = len;
      d.length = 1;
    }
    d.reverse();
    for (; i--; )
      d.push(0);
    d.reverse();
  }
  len = xd.length;
  i = yd.length;
  if (len - i < 0) {
    i = len;
    d = yd;
    yd = xd;
    xd = d;
  }
  for (carry = 0; i; ) {
    carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
    xd[i] %= BASE;
  }
  if (carry) {
    xd.unshift(carry);
    ++e;
  }
  for (len = xd.length; xd[--len] == 0; )
    xd.pop();
  y.d = xd;
  y.e = getBase10Exponent(xd, e);
  return external ? finalise(y, pr, rm) : y;
};
P.precision = P.sd = function(z) {
  var k, x = this;
  if (z !== void 0 && z !== !!z && z !== 1 && z !== 0)
    throw Error(invalidArgument + z);
  if (x.d) {
    k = getPrecision(x.d);
    if (z && x.e + 1 > k)
      k = x.e + 1;
  } else {
    k = NaN;
  }
  return k;
};
P.round = function() {
  var x = this, Ctor = x.constructor;
  return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
};
P.sine = P.sin = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(NaN);
  if (x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x = sine(Ctor, toLessThanHalfPi(Ctor, x));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
};
P.squareRoot = P.sqrt = function() {
  var m, n, sd, r, rep, t, x = this, d = x.d, e = x.e, s = x.s, Ctor = x.constructor;
  if (s !== 1 || !d || !d[0]) {
    return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
  }
  external = false;
  s = Math.sqrt(+x);
  if (s == 0 || s == 1 / 0) {
    n = digitsToString(d);
    if ((n.length + e) % 2 == 0)
      n += "0";
    s = Math.sqrt(n);
    e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
    if (s == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r = new Ctor(n);
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e + 1, 0);
          if (t.times(t).eq(x)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e + 1, 1);
          m = !r.times(r).eq(x);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e, Ctor.rounding, m);
};
P.tangent = P.tan = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(NaN);
  if (x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 10;
  Ctor.rounding = 1;
  x = x.sin();
  x.s = 1;
  x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
};
P.times = P.mul = function(y) {
  var carry, e, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
  y.s *= x.s;
  if (!xd || !xd[0] || !yd || !yd[0]) {
    return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y.s / 0 : y.s * 0);
  }
  e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
  xdL = xd.length;
  ydL = yd.length;
  if (xdL < ydL) {
    r = xd;
    xd = yd;
    yd = r;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }
  r = [];
  rL = xdL + ydL;
  for (i = rL; i--; )
    r.push(0);
  for (i = ydL; --i >= 0; ) {
    carry = 0;
    for (k = xdL + i; k > i; ) {
      t = r[k] + yd[i] * xd[k - i - 1] + carry;
      r[k--] = t % BASE | 0;
      carry = t / BASE | 0;
    }
    r[k] = (r[k] + carry) % BASE | 0;
  }
  for (; !r[--rL]; )
    r.pop();
  if (carry)
    ++e;
  else
    r.shift();
  y.d = r;
  y.e = getBase10Exponent(r, e);
  return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
};
P.toBinary = function(sd, rm) {
  return toStringBinary(this, 2, sd, rm);
};
P.toDecimalPlaces = P.toDP = function(dp, rm) {
  var x = this, Ctor = x.constructor;
  x = new Ctor(x);
  if (dp === void 0)
    return x;
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0)
    rm = Ctor.rounding;
  else
    checkInt32(rm, 0, 8);
  return finalise(x, dp + x.e + 1, rm);
};
P.toExponential = function(dp, rm) {
  var str, x = this, Ctor = x.constructor;
  if (dp === void 0) {
    str = finiteToString(x, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
    x = finalise(new Ctor(x), dp + 1, rm);
    str = finiteToString(x, true, dp + 1);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toFixed = function(dp, rm) {
  var str, y, x = this, Ctor = x.constructor;
  if (dp === void 0) {
    str = finiteToString(x);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
    y = finalise(new Ctor(x), dp + x.e + 1, rm);
    str = finiteToString(y, false, dp + y.e + 1);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toFraction = function(maxD) {
  var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r, x = this, xd = x.d, Ctor = x.constructor;
  if (!xd)
    return new Ctor(x);
  n1 = d0 = new Ctor(1);
  d1 = n0 = new Ctor(0);
  d = new Ctor(d1);
  e = d.e = getPrecision(xd) - x.e - 1;
  k = e % LOG_BASE;
  d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
  if (maxD == null) {
    maxD = e > 0 ? d : n1;
  } else {
    n = new Ctor(maxD);
    if (!n.isInt() || n.lt(n1))
      throw Error(invalidArgument + n);
    maxD = n.gt(d) ? e > 0 ? d : n1 : n;
  }
  external = false;
  n = new Ctor(digitsToString(xd));
  pr = Ctor.precision;
  Ctor.precision = e = xd.length * LOG_BASE * 2;
  for (; ; ) {
    q = divide(n, d, 0, 1, 1);
    d2 = d0.plus(q.times(d1));
    if (d2.cmp(maxD) == 1)
      break;
    d0 = d1;
    d1 = d2;
    d2 = n1;
    n1 = n0.plus(q.times(d2));
    n0 = d2;
    d2 = d;
    d = n.minus(q.times(d2));
    n = d2;
  }
  d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
  n0 = n0.plus(d2.times(n1));
  d0 = d0.plus(d2.times(d1));
  n0.s = n1.s = x.s;
  r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];
  Ctor.precision = pr;
  external = true;
  return r;
};
P.toHexadecimal = P.toHex = function(sd, rm) {
  return toStringBinary(this, 16, sd, rm);
};
P.toNearest = function(y, rm) {
  var x = this, Ctor = x.constructor;
  x = new Ctor(x);
  if (y == null) {
    if (!x.d)
      return x;
    y = new Ctor(1);
    rm = Ctor.rounding;
  } else {
    y = new Ctor(y);
    if (rm === void 0) {
      rm = Ctor.rounding;
    } else {
      checkInt32(rm, 0, 8);
    }
    if (!x.d)
      return y.s ? x : y;
    if (!y.d) {
      if (y.s)
        y.s = x.s;
      return y;
    }
  }
  if (y.d[0]) {
    external = false;
    x = divide(x, y, 0, rm, 1).times(y);
    external = true;
    finalise(x);
  } else {
    y.s = x.s;
    x = y;
  }
  return x;
};
P.toNumber = function() {
  return +this;
};
P.toOctal = function(sd, rm) {
  return toStringBinary(this, 8, sd, rm);
};
P.toPower = P.pow = function(y) {
  var e, k, pr, r, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
  if (!x.d || !y.d || !x.d[0] || !y.d[0])
    return new Ctor(mathpow(+x, yn));
  x = new Ctor(x);
  if (x.eq(1))
    return x;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (y.eq(1))
    return finalise(x, pr, rm);
  e = mathfloor(y.e / LOG_BASE);
  if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
    r = intPow(Ctor, x, k, pr);
    return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
  }
  s = x.s;
  if (s < 0) {
    if (e < y.d.length - 1)
      return new Ctor(NaN);
    if ((y.d[e] & 1) == 0)
      s = 1;
    if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
      x.s = s;
      return x;
    }
  }
  k = mathpow(+x, yn);
  e = k == 0 || !isFinite(k) ? mathfloor(yn * (Math.log("0." + digitsToString(x.d)) / Math.LN10 + x.e + 1)) : new Ctor(k + "").e;
  if (e > Ctor.maxE + 1 || e < Ctor.minE - 1)
    return new Ctor(e > 0 ? s / 0 : 0);
  external = false;
  Ctor.rounding = x.s = 1;
  k = Math.min(12, (e + "").length);
  r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);
  if (r.d) {
    r = finalise(r, pr + 5, 1);
    if (checkRoundingDigits(r.d, pr, rm)) {
      e = pr + 10;
      r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);
      if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
        r = finalise(r, pr + 1, 0);
      }
    }
  }
  r.s = s;
  external = true;
  Ctor.rounding = rm;
  return finalise(r, pr, rm);
};
P.toPrecision = function(sd, rm) {
  var str, x = this, Ctor = x.constructor;
  if (sd === void 0) {
    str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
    x = finalise(new Ctor(x), sd, rm);
    str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toSignificantDigits = P.toSD = function(sd, rm) {
  var x = this, Ctor = x.constructor;
  if (sd === void 0) {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
  }
  return finalise(new Ctor(x), sd, rm);
};
P.toString = function() {
  var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.truncated = P.trunc = function() {
  return finalise(new this.constructor(this), this.e + 1, 1);
};
P.valueOf = P.toJSON = function() {
  var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  return x.isNeg() ? "-" + str : str;
};
function digitsToString(d) {
  var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
  if (indexOfLastWord > 0) {
    str += w;
    for (i = 1; i < indexOfLastWord; i++) {
      ws = d[i] + "";
      k = LOG_BASE - ws.length;
      if (k)
        str += getZeroString(k);
      str += ws;
    }
    w = d[i];
    ws = w + "";
    k = LOG_BASE - ws.length;
    if (k)
      str += getZeroString(k);
  } else if (w === 0) {
    return "0";
  }
  for (; w % 10 === 0; )
    w /= 10;
  return str + w;
}
function checkInt32(i, min2, max2) {
  if (i !== ~~i || i < min2 || i > max2) {
    throw Error(invalidArgument + i);
  }
}
function checkRoundingDigits(d, i, rm, repeating) {
  var di, k, r, rd;
  for (k = d[0]; k >= 10; k /= 10)
    --i;
  if (--i < 0) {
    i += LOG_BASE;
    di = 0;
  } else {
    di = Math.ceil((i + 1) / LOG_BASE);
    i %= LOG_BASE;
  }
  k = mathpow(10, LOG_BASE - i);
  rd = d[di] % k | 0;
  if (repeating == null) {
    if (i < 3) {
      if (i == 0)
        rd = rd / 100 | 0;
      else if (i == 1)
        rd = rd / 10 | 0;
      r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 5e4 || rd == 0;
    } else {
      r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 || (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
    }
  } else {
    if (i < 4) {
      if (i == 0)
        rd = rd / 1e3 | 0;
      else if (i == 1)
        rd = rd / 100 | 0;
      else if (i == 2)
        rd = rd / 10 | 0;
      r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
    } else {
      r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1e3 | 0) == mathpow(10, i - 3) - 1;
    }
  }
  return r;
}
function convertBase(str, baseIn, baseOut) {
  var j, arr = [0], arrL, i = 0, strL = str.length;
  for (; i < strL; ) {
    for (arrL = arr.length; arrL--; )
      arr[arrL] *= baseIn;
    arr[0] += NUMERALS.indexOf(str.charAt(i++));
    for (j = 0; j < arr.length; j++) {
      if (arr[j] > baseOut - 1) {
        if (arr[j + 1] === void 0)
          arr[j + 1] = 0;
        arr[j + 1] += arr[j] / baseOut | 0;
        arr[j] %= baseOut;
      }
    }
  }
  return arr.reverse();
}
function cosine(Ctor, x) {
  var k, y, len = x.d.length;
  if (len < 32) {
    k = Math.ceil(len / 3);
    y = (1 / tinyPow(4, k)).toString();
  } else {
    k = 16;
    y = "2.3283064365386962890625e-10";
  }
  Ctor.precision += k;
  x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));
  for (var i = k; i--; ) {
    var cos2x = x.times(x);
    x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
  }
  Ctor.precision -= k;
  return x;
}
var divide = function() {
  function multiplyInteger(x, k, base) {
    var temp, carry = 0, i = x.length;
    for (x = x.slice(); i--; ) {
      temp = x[i] * k + carry;
      x[i] = temp % base | 0;
      carry = temp / base | 0;
    }
    if (carry)
      x.unshift(carry);
    return x;
  }
  function compare(a, b, aL, bL) {
    var i, r;
    if (aL != bL) {
      r = aL > bL ? 1 : -1;
    } else {
      for (i = r = 0; i < aL; i++) {
        if (a[i] != b[i]) {
          r = a[i] > b[i] ? 1 : -1;
          break;
        }
      }
    }
    return r;
  }
  function subtract(a, b, aL, base) {
    var i = 0;
    for (; aL--; ) {
      a[aL] -= i;
      i = a[aL] < b[aL] ? 1 : 0;
      a[aL] = i * base + a[aL] - b[aL];
    }
    for (; !a[0] && a.length > 1; )
      a.shift();
  }
  return function(x, y, pr, rm, dp, base) {
    var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign2 = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
    if (!xd || !xd[0] || !yd || !yd[0]) {
      return new Ctor(!x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : xd && xd[0] == 0 || !yd ? sign2 * 0 : sign2 / 0);
    }
    if (base) {
      logBase = 1;
      e = x.e - y.e;
    } else {
      base = BASE;
      logBase = LOG_BASE;
      e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
    }
    yL = yd.length;
    xL = xd.length;
    q = new Ctor(sign2);
    qd = q.d = [];
    for (i = 0; yd[i] == (xd[i] || 0); i++)
      ;
    if (yd[i] > (xd[i] || 0))
      e--;
    if (pr == null) {
      sd = pr = Ctor.precision;
      rm = Ctor.rounding;
    } else if (dp) {
      sd = pr + (x.e - y.e) + 1;
    } else {
      sd = pr;
    }
    if (sd < 0) {
      qd.push(1);
      more = true;
    } else {
      sd = sd / logBase + 2 | 0;
      i = 0;
      if (yL == 1) {
        k = 0;
        yd = yd[0];
        sd++;
        for (; (i < xL || k) && sd--; i++) {
          t = k * base + (xd[i] || 0);
          qd[i] = t / yd | 0;
          k = t % yd | 0;
        }
        more = k || i < xL;
      } else {
        k = base / (yd[0] + 1) | 0;
        if (k > 1) {
          yd = multiplyInteger(yd, k, base);
          xd = multiplyInteger(xd, k, base);
          yL = yd.length;
          xL = xd.length;
        }
        xi = yL;
        rem = xd.slice(0, yL);
        remL = rem.length;
        for (; remL < yL; )
          rem[remL++] = 0;
        yz = yd.slice();
        yz.unshift(0);
        yd0 = yd[0];
        if (yd[1] >= base / 2)
          ++yd0;
        do {
          k = 0;
          cmp = compare(yd, rem, yL, remL);
          if (cmp < 0) {
            rem0 = rem[0];
            if (yL != remL)
              rem0 = rem0 * base + (rem[1] || 0);
            k = rem0 / yd0 | 0;
            if (k > 1) {
              if (k >= base)
                k = base - 1;
              prod = multiplyInteger(yd, k, base);
              prodL = prod.length;
              remL = rem.length;
              cmp = compare(prod, rem, prodL, remL);
              if (cmp == 1) {
                k--;
                subtract(prod, yL < prodL ? yz : yd, prodL, base);
              }
            } else {
              if (k == 0)
                cmp = k = 1;
              prod = yd.slice();
            }
            prodL = prod.length;
            if (prodL < remL)
              prod.unshift(0);
            subtract(rem, prod, remL, base);
            if (cmp == -1) {
              remL = rem.length;
              cmp = compare(yd, rem, yL, remL);
              if (cmp < 1) {
                k++;
                subtract(rem, yL < remL ? yz : yd, remL, base);
              }
            }
            remL = rem.length;
          } else if (cmp === 0) {
            k++;
            rem = [0];
          }
          qd[i++] = k;
          if (cmp && rem[0]) {
            rem[remL++] = xd[xi] || 0;
          } else {
            rem = [xd[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] !== void 0) && sd--);
        more = rem[0] !== void 0;
      }
      if (!qd[0])
        qd.shift();
    }
    if (logBase == 1) {
      q.e = e;
      inexact = more;
    } else {
      for (i = 1, k = qd[0]; k >= 10; k /= 10)
        i++;
      q.e = i + e * logBase - 1;
      finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
    }
    return q;
  };
}();
function finalise(x, sd, rm, isTruncated) {
  var digits, i, j, k, rd, roundUp, w, xd, xdi, Ctor = x.constructor;
  out:
    if (sd != null) {
      xd = x.d;
      if (!xd)
        return x;
      for (digits = 1, k = xd[0]; k >= 10; k /= 10)
        digits++;
      i = sd - digits;
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];
        rd = w / mathpow(10, digits - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {
            for (; k++ <= xdi; )
              xd.push(0);
            w = rd = 0;
            digits = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];
          for (digits = 1; k >= 10; k /= 10)
            digits++;
          i %= LOG_BASE;
          j = i - LOG_BASE + digits;
          rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
        }
      }
      isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));
      roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && (i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {
          sd -= x.e + 1;
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {
          xd[0] = x.e = 0;
        }
        return x;
      }
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);
        xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
      }
      if (roundUp) {
        for (; ; ) {
          if (xdi == 0) {
            for (i = 1, j = xd[0]; j >= 10; j /= 10)
              i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10)
              k++;
            if (i != k) {
              x.e++;
              if (xd[0] == BASE)
                xd[0] = 1;
            }
            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE)
              break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }
      for (i = xd.length; xd[--i] === 0; )
        xd.pop();
    }
  if (external) {
    if (x.e > Ctor.maxE) {
      x.d = null;
      x.e = NaN;
    } else if (x.e < Ctor.minE) {
      x.e = 0;
      x.d = [0];
    }
  }
  return x;
}
function finiteToString(x, isExp, sd) {
  if (!x.isFinite())
    return nonFiniteToString(x);
  var k, e = x.e, str = digitsToString(x.d), len = str.length;
  if (isExp) {
    if (sd && (k = sd - len) > 0) {
      str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
    } else if (len > 1) {
      str = str.charAt(0) + "." + str.slice(1);
    }
    str = str + (x.e < 0 ? "e" : "e+") + x.e;
  } else if (e < 0) {
    str = "0." + getZeroString(-e - 1) + str;
    if (sd && (k = sd - len) > 0)
      str += getZeroString(k);
  } else if (e >= len) {
    str += getZeroString(e + 1 - len);
    if (sd && (k = sd - e - 1) > 0)
      str = str + "." + getZeroString(k);
  } else {
    if ((k = e + 1) < len)
      str = str.slice(0, k) + "." + str.slice(k);
    if (sd && (k = sd - len) > 0) {
      if (e + 1 === len)
        str += ".";
      str += getZeroString(k);
    }
  }
  return str;
}
function getBase10Exponent(digits, e) {
  var w = digits[0];
  for (e *= LOG_BASE; w >= 10; w /= 10)
    e++;
  return e;
}
function getLn10(Ctor, sd, pr) {
  if (sd > LN10_PRECISION) {
    external = true;
    if (pr)
      Ctor.precision = pr;
    throw Error(precisionLimitExceeded);
  }
  return finalise(new Ctor(LN10), sd, 1, true);
}
function getPi(Ctor, sd, rm) {
  if (sd > PI_PRECISION)
    throw Error(precisionLimitExceeded);
  return finalise(new Ctor(PI), sd, rm, true);
}
function getPrecision(digits) {
  var w = digits.length - 1, len = w * LOG_BASE + 1;
  w = digits[w];
  if (w) {
    for (; w % 10 == 0; w /= 10)
      len--;
    for (w = digits[0]; w >= 10; w /= 10)
      len++;
  }
  return len;
}
function getZeroString(k) {
  var zs = "";
  for (; k--; )
    zs += "0";
  return zs;
}
function intPow(Ctor, x, n, pr) {
  var isTruncated, r = new Ctor(1), k = Math.ceil(pr / LOG_BASE + 4);
  external = false;
  for (; ; ) {
    if (n % 2) {
      r = r.times(x);
      if (truncate(r.d, k))
        isTruncated = true;
    }
    n = mathfloor(n / 2);
    if (n === 0) {
      n = r.d.length - 1;
      if (isTruncated && r.d[n] === 0)
        ++r.d[n];
      break;
    }
    x = x.times(x);
    truncate(x.d, k);
  }
  external = true;
  return r;
}
function isOdd(n) {
  return n.d[n.d.length - 1] & 1;
}
function maxOrMin(Ctor, args, ltgt) {
  var y, x = new Ctor(args[0]), i = 0;
  for (; ++i < args.length; ) {
    y = new Ctor(args[i]);
    if (!y.s) {
      x = y;
      break;
    } else if (x[ltgt](y)) {
      x = y;
    }
  }
  return x;
}
function naturalExponential(x, sd) {
  var denominator, guard, j, pow2, sum, t, wpr, rep = 0, i = 0, k = 0, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (!x.d || !x.d[0] || x.e > 17) {
    return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  t = new Ctor(0.03125);
  while (x.e > -2) {
    x = x.times(t);
    k += 5;
  }
  guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow2 = sum = new Ctor(1);
  Ctor.precision = wpr;
  for (; ; ) {
    pow2 = finalise(pow2.times(x), wpr, 1);
    denominator = denominator.times(++i);
    t = sum.plus(divide(pow2, denominator, wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      j = k;
      while (j--)
        sum = finalise(sum.times(sum), wpr, 1);
      if (sd == null) {
        if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += 10;
          denominator = pow2 = t = new Ctor(1);
          i = 0;
          rep++;
        } else {
          return finalise(sum, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum;
      }
    }
    sum = t;
  }
}
function naturalLogarithm(y, sd) {
  var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
    return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  Ctor.precision = wpr += guard;
  c = digitsToString(xd);
  c0 = c.charAt(0);
  if (Math.abs(e = x.e) < 15e14) {
    while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
      x = x.times(y);
      c = digitsToString(x.d);
      c0 = c.charAt(0);
      n++;
    }
    e = x.e;
    if (c0 > 1) {
      x = new Ctor("0." + c);
      e++;
    } else {
      x = new Ctor(c0 + "." + c.slice(1));
    }
  } else {
    t = getLn10(Ctor, wpr + 2, pr).times(e + "");
    x = naturalLogarithm(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
    Ctor.precision = pr;
    return sd == null ? finalise(x, pr, rm, external = true) : x;
  }
  x1 = x;
  sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
  x2 = finalise(x.times(x), wpr, 1);
  denominator = 3;
  for (; ; ) {
    numerator = finalise(numerator.times(x2), wpr, 1);
    t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      sum = sum.times(2);
      if (e !== 0)
        sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
      sum = divide(sum, new Ctor(n), wpr, 1);
      if (sd == null) {
        if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += guard;
          t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
          x2 = finalise(x.times(x), wpr, 1);
          denominator = rep = 1;
        } else {
          return finalise(sum, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum;
      }
    }
    sum = t;
    denominator += 2;
  }
}
function nonFiniteToString(x) {
  return String(x.s * x.s / 0);
}
function parseDecimal(x, str) {
  var e, i, len;
  if ((e = str.indexOf(".")) > -1)
    str = str.replace(".", "");
  if ((i = str.search(/e/i)) > 0) {
    if (e < 0)
      e = i;
    e += +str.slice(i + 1);
    str = str.substring(0, i);
  } else if (e < 0) {
    e = str.length;
  }
  for (i = 0; str.charCodeAt(i) === 48; i++)
    ;
  for (len = str.length; str.charCodeAt(len - 1) === 48; --len)
    ;
  str = str.slice(i, len);
  if (str) {
    len -= i;
    x.e = e = e - i - 1;
    x.d = [];
    i = (e + 1) % LOG_BASE;
    if (e < 0)
      i += LOG_BASE;
    if (i < len) {
      if (i)
        x.d.push(+str.slice(0, i));
      for (len -= LOG_BASE; i < len; )
        x.d.push(+str.slice(i, i += LOG_BASE));
      str = str.slice(i);
      i = LOG_BASE - str.length;
    } else {
      i -= len;
    }
    for (; i--; )
      str += "0";
    x.d.push(+str);
    if (external) {
      if (x.e > x.constructor.maxE) {
        x.d = null;
        x.e = NaN;
      } else if (x.e < x.constructor.minE) {
        x.e = 0;
        x.d = [0];
      }
    }
  } else {
    x.e = 0;
    x.d = [0];
  }
  return x;
}
function parseOther(x, str) {
  var base, Ctor, divisor, i, isFloat, len, p, xd, xe;
  if (str === "Infinity" || str === "NaN") {
    if (!+str)
      x.s = NaN;
    x.e = NaN;
    x.d = null;
    return x;
  }
  if (isHex.test(str)) {
    base = 16;
    str = str.toLowerCase();
  } else if (isBinary.test(str)) {
    base = 2;
  } else if (isOctal.test(str)) {
    base = 8;
  } else {
    throw Error(invalidArgument + str);
  }
  i = str.search(/p/i);
  if (i > 0) {
    p = +str.slice(i + 1);
    str = str.substring(2, i);
  } else {
    str = str.slice(2);
  }
  i = str.indexOf(".");
  isFloat = i >= 0;
  Ctor = x.constructor;
  if (isFloat) {
    str = str.replace(".", "");
    len = str.length;
    i = len - i;
    divisor = intPow(Ctor, new Ctor(base), i, i * 2);
  }
  xd = convertBase(str, base, BASE);
  xe = xd.length - 1;
  for (i = xe; xd[i] === 0; --i)
    xd.pop();
  if (i < 0)
    return new Ctor(x.s * 0);
  x.e = getBase10Exponent(xd, xe);
  x.d = xd;
  external = false;
  if (isFloat)
    x = divide(x, divisor, len * 4);
  if (p)
    x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
  external = true;
  return x;
}
function sine(Ctor, x) {
  var k, len = x.d.length;
  if (len < 3)
    return taylorSeries(Ctor, 2, x, x);
  k = 1.4 * Math.sqrt(len);
  k = k > 16 ? 16 : k | 0;
  x = x.times(1 / tinyPow(5, k));
  x = taylorSeries(Ctor, 2, x, x);
  var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
  for (; k--; ) {
    sin2_x = x.times(x);
    x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
  }
  return x;
}
function taylorSeries(Ctor, n, x, y, isHyperbolic) {
  var j, t, u, x2, i = 1, pr = Ctor.precision, k = Math.ceil(pr / LOG_BASE);
  external = false;
  x2 = x.times(x);
  u = new Ctor(y);
  for (; ; ) {
    t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
    u = isHyperbolic ? y.plus(t) : y.minus(t);
    y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
    t = u.plus(y);
    if (t.d[k] !== void 0) {
      for (j = k; t.d[j] === u.d[j] && j--; )
        ;
      if (j == -1)
        break;
    }
    j = u;
    u = y;
    y = t;
    t = j;
    i++;
  }
  external = true;
  t.d.length = k + 1;
  return t;
}
function tinyPow(b, e) {
  var n = b;
  while (--e)
    n *= b;
  return n;
}
function toLessThanHalfPi(Ctor, x) {
  var t, isNeg = x.s < 0, pi = getPi(Ctor, Ctor.precision, 1), halfPi = pi.times(0.5);
  x = x.abs();
  if (x.lte(halfPi)) {
    quadrant = isNeg ? 4 : 1;
    return x;
  }
  t = x.divToInt(pi);
  if (t.isZero()) {
    quadrant = isNeg ? 3 : 2;
  } else {
    x = x.minus(t.times(pi));
    if (x.lte(halfPi)) {
      quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
      return x;
    }
    quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
  }
  return x.minus(pi).abs();
}
function toStringBinary(x, baseOut, sd, rm) {
  var base, e, i, k, len, roundUp, str, xd, y, Ctor = x.constructor, isExp = sd !== void 0;
  if (isExp) {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
  } else {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  }
  if (!x.isFinite()) {
    str = nonFiniteToString(x);
  } else {
    str = finiteToString(x);
    i = str.indexOf(".");
    if (isExp) {
      base = 2;
      if (baseOut == 16) {
        sd = sd * 4 - 3;
      } else if (baseOut == 8) {
        sd = sd * 3 - 2;
      }
    } else {
      base = baseOut;
    }
    if (i >= 0) {
      str = str.replace(".", "");
      y = new Ctor(1);
      y.e = str.length - i;
      y.d = convertBase(finiteToString(y), 10, base);
      y.e = y.d.length;
    }
    xd = convertBase(str, 10, base);
    e = len = xd.length;
    for (; xd[--len] == 0; )
      xd.pop();
    if (!xd[0]) {
      str = isExp ? "0p+0" : "0";
    } else {
      if (i < 0) {
        e--;
      } else {
        x = new Ctor(x);
        x.d = xd;
        x.e = e;
        x = divide(x, y, sd, rm, 0, base);
        xd = x.d;
        e = x.e;
        roundUp = inexact;
      }
      i = xd[sd];
      k = base / 2;
      roundUp = roundUp || xd[sd + 1] !== void 0;
      roundUp = rm < 4 ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2)) : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x.s < 0 ? 8 : 7));
      xd.length = sd;
      if (roundUp) {
        for (; ++xd[--sd] > base - 1; ) {
          xd[sd] = 0;
          if (!sd) {
            ++e;
            xd.unshift(1);
          }
        }
      }
      for (len = xd.length; !xd[len - 1]; --len)
        ;
      for (i = 0, str = ""; i < len; i++)
        str += NUMERALS.charAt(xd[i]);
      if (isExp) {
        if (len > 1) {
          if (baseOut == 16 || baseOut == 8) {
            i = baseOut == 16 ? 4 : 3;
            for (--len; len % i; len++)
              str += "0";
            xd = convertBase(str, base, baseOut);
            for (len = xd.length; !xd[len - 1]; --len)
              ;
            for (i = 1, str = "1."; i < len; i++)
              str += NUMERALS.charAt(xd[i]);
          } else {
            str = str.charAt(0) + "." + str.slice(1);
          }
        }
        str = str + (e < 0 ? "p" : "p+") + e;
      } else if (e < 0) {
        for (; ++e; )
          str = "0" + str;
        str = "0." + str;
      } else {
        if (++e > len)
          for (e -= len; e--; )
            str += "0";
        else if (e < len)
          str = str.slice(0, e) + "." + str.slice(e);
      }
    }
    str = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str;
  }
  return x.s < 0 ? "-" + str : str;
}
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}
function abs(x) {
  return new this(x).abs();
}
function acos(x) {
  return new this(x).acos();
}
function acosh(x) {
  return new this(x).acosh();
}
function add(x, y) {
  return new this(x).plus(y);
}
function asin(x) {
  return new this(x).asin();
}
function asinh(x) {
  return new this(x).asinh();
}
function atan(x) {
  return new this(x).atan();
}
function atanh(x) {
  return new this(x).atanh();
}
function atan2(y, x) {
  y = new this(y);
  x = new this(x);
  var r, pr = this.precision, rm = this.rounding, wpr = pr + 4;
  if (!y.s || !x.s) {
    r = new this(NaN);
  } else if (!y.d && !x.d) {
    r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
    r.s = y.s;
  } else if (!x.d || y.isZero()) {
    r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
    r.s = y.s;
  } else if (!y.d || x.isZero()) {
    r = getPi(this, wpr, 1).times(0.5);
    r.s = y.s;
  } else if (x.s < 0) {
    this.precision = wpr;
    this.rounding = 1;
    r = this.atan(divide(y, x, wpr, 1));
    x = getPi(this, wpr, 1);
    this.precision = pr;
    this.rounding = rm;
    r = y.s < 0 ? r.minus(x) : r.plus(x);
  } else {
    r = this.atan(divide(y, x, wpr, 1));
  }
  return r;
}
function cbrt(x) {
  return new this(x).cbrt();
}
function ceil(x) {
  return finalise(x = new this(x), x.e + 1, 2);
}
function config(obj) {
  if (!obj || typeof obj !== "object")
    throw Error(decimalError + "Object expected");
  var i, p, v, useDefaults = obj.defaults === true, ps = [
    "precision",
    1,
    MAX_DIGITS,
    "rounding",
    0,
    8,
    "toExpNeg",
    -EXP_LIMIT,
    0,
    "toExpPos",
    0,
    EXP_LIMIT,
    "maxE",
    0,
    EXP_LIMIT,
    "minE",
    -EXP_LIMIT,
    0,
    "modulo",
    0,
    9
  ];
  for (i = 0; i < ps.length; i += 3) {
    if (p = ps[i], useDefaults)
      this[p] = DEFAULTS[p];
    if ((v = obj[p]) !== void 0) {
      if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2])
        this[p] = v;
      else
        throw Error(invalidArgument + p + ": " + v);
    }
  }
  if (p = "crypto", useDefaults)
    this[p] = DEFAULTS[p];
  if ((v = obj[p]) !== void 0) {
    if (v === true || v === false || v === 0 || v === 1) {
      if (v) {
        if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
          this[p] = true;
        } else {
          throw Error(cryptoUnavailable);
        }
      } else {
        this[p] = false;
      }
    } else {
      throw Error(invalidArgument + p + ": " + v);
    }
  }
  return this;
}
function cos(x) {
  return new this(x).cos();
}
function cosh(x) {
  return new this(x).cosh();
}
function clone(obj) {
  var i, p, ps;
  function Decimal2(v) {
    var e, i2, t, x = this;
    if (!(x instanceof Decimal2))
      return new Decimal2(v);
    x.constructor = Decimal2;
    if (v instanceof Decimal2) {
      x.s = v.s;
      if (external) {
        if (!v.d || v.e > Decimal2.maxE) {
          x.e = NaN;
          x.d = null;
        } else if (v.e < Decimal2.minE) {
          x.e = 0;
          x.d = [0];
        } else {
          x.e = v.e;
          x.d = v.d.slice();
        }
      } else {
        x.e = v.e;
        x.d = v.d ? v.d.slice() : v.d;
      }
      return;
    }
    t = typeof v;
    if (t === "number") {
      if (v === 0) {
        x.s = 1 / v < 0 ? -1 : 1;
        x.e = 0;
        x.d = [0];
        return;
      }
      if (v < 0) {
        v = -v;
        x.s = -1;
      } else {
        x.s = 1;
      }
      if (v === ~~v && v < 1e7) {
        for (e = 0, i2 = v; i2 >= 10; i2 /= 10)
          e++;
        if (external) {
          if (e > Decimal2.maxE) {
            x.e = NaN;
            x.d = null;
          } else if (e < Decimal2.minE) {
            x.e = 0;
            x.d = [0];
          } else {
            x.e = e;
            x.d = [v];
          }
        } else {
          x.e = e;
          x.d = [v];
        }
        return;
      } else if (v * 0 !== 0) {
        if (!v)
          x.s = NaN;
        x.e = NaN;
        x.d = null;
        return;
      }
      return parseDecimal(x, v.toString());
    } else if (t !== "string") {
      throw Error(invalidArgument + v);
    }
    if ((i2 = v.charCodeAt(0)) === 45) {
      v = v.slice(1);
      x.s = -1;
    } else {
      if (i2 === 43)
        v = v.slice(1);
      x.s = 1;
    }
    return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
  }
  Decimal2.prototype = P;
  Decimal2.ROUND_UP = 0;
  Decimal2.ROUND_DOWN = 1;
  Decimal2.ROUND_CEIL = 2;
  Decimal2.ROUND_FLOOR = 3;
  Decimal2.ROUND_HALF_UP = 4;
  Decimal2.ROUND_HALF_DOWN = 5;
  Decimal2.ROUND_HALF_EVEN = 6;
  Decimal2.ROUND_HALF_CEIL = 7;
  Decimal2.ROUND_HALF_FLOOR = 8;
  Decimal2.EUCLID = 9;
  Decimal2.config = Decimal2.set = config;
  Decimal2.clone = clone;
  Decimal2.isDecimal = isDecimalInstance;
  Decimal2.abs = abs;
  Decimal2.acos = acos;
  Decimal2.acosh = acosh;
  Decimal2.add = add;
  Decimal2.asin = asin;
  Decimal2.asinh = asinh;
  Decimal2.atan = atan;
  Decimal2.atanh = atanh;
  Decimal2.atan2 = atan2;
  Decimal2.cbrt = cbrt;
  Decimal2.ceil = ceil;
  Decimal2.cos = cos;
  Decimal2.cosh = cosh;
  Decimal2.div = div;
  Decimal2.exp = exp;
  Decimal2.floor = floor;
  Decimal2.hypot = hypot;
  Decimal2.ln = ln;
  Decimal2.log = log;
  Decimal2.log10 = log10;
  Decimal2.log2 = log2;
  Decimal2.max = max;
  Decimal2.min = min;
  Decimal2.mod = mod;
  Decimal2.mul = mul;
  Decimal2.pow = pow;
  Decimal2.random = random;
  Decimal2.round = round;
  Decimal2.sign = sign;
  Decimal2.sin = sin;
  Decimal2.sinh = sinh;
  Decimal2.sqrt = sqrt;
  Decimal2.sub = sub;
  Decimal2.tan = tan;
  Decimal2.tanh = tanh;
  Decimal2.trunc = trunc;
  if (obj === void 0)
    obj = {};
  if (obj) {
    if (obj.defaults !== true) {
      ps = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
      for (i = 0; i < ps.length; )
        if (!obj.hasOwnProperty(p = ps[i++]))
          obj[p] = this[p];
    }
  }
  Decimal2.config(obj);
  return Decimal2;
}
function div(x, y) {
  return new this(x).div(y);
}
function exp(x) {
  return new this(x).exp();
}
function floor(x) {
  return finalise(x = new this(x), x.e + 1, 3);
}
function hypot() {
  var i, n, t = new this(0);
  external = false;
  for (i = 0; i < arguments.length; ) {
    n = new this(arguments[i++]);
    if (!n.d) {
      if (n.s) {
        external = true;
        return new this(1 / 0);
      }
      t = n;
    } else if (t.d) {
      t = t.plus(n.times(n));
    }
  }
  external = true;
  return t.sqrt();
}
function isDecimalInstance(obj) {
  return obj instanceof Decimal || obj && obj.name === "[object Decimal]" || false;
}
function ln(x) {
  return new this(x).ln();
}
function log(x, y) {
  return new this(x).log(y);
}
function log2(x) {
  return new this(x).log(2);
}
function log10(x) {
  return new this(x).log(10);
}
function max() {
  return maxOrMin(this, arguments, "lt");
}
function min() {
  return maxOrMin(this, arguments, "gt");
}
function mod(x, y) {
  return new this(x).mod(y);
}
function mul(x, y) {
  return new this(x).mul(y);
}
function pow(x, y) {
  return new this(x).pow(y);
}
function random(sd) {
  var d, e, k, n, i = 0, r = new this(1), rd = [];
  if (sd === void 0)
    sd = this.precision;
  else
    checkInt32(sd, 1, MAX_DIGITS);
  k = Math.ceil(sd / LOG_BASE);
  if (!this.crypto) {
    for (; i < k; )
      rd[i++] = Math.random() * 1e7 | 0;
  } else if (crypto.getRandomValues) {
    d = crypto.getRandomValues(new Uint32Array(k));
    for (; i < k; ) {
      n = d[i];
      if (n >= 429e7) {
        d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
      } else {
        rd[i++] = n % 1e7;
      }
    }
  } else if (crypto.randomBytes) {
    d = crypto.randomBytes(k *= 4);
    for (; i < k; ) {
      n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 127) << 24);
      if (n >= 214e7) {
        crypto.randomBytes(4).copy(d, i);
      } else {
        rd.push(n % 1e7);
        i += 4;
      }
    }
    i = k / 4;
  } else {
    throw Error(cryptoUnavailable);
  }
  k = rd[--i];
  sd %= LOG_BASE;
  if (k && sd) {
    n = mathpow(10, LOG_BASE - sd);
    rd[i] = (k / n | 0) * n;
  }
  for (; rd[i] === 0; i--)
    rd.pop();
  if (i < 0) {
    e = 0;
    rd = [0];
  } else {
    e = -1;
    for (; rd[0] === 0; e -= LOG_BASE)
      rd.shift();
    for (k = 1, n = rd[0]; n >= 10; n /= 10)
      k++;
    if (k < LOG_BASE)
      e -= LOG_BASE - k;
  }
  r.e = e;
  r.d = rd;
  return r;
}
function round(x) {
  return finalise(x = new this(x), x.e + 1, this.rounding);
}
function sign(x) {
  x = new this(x);
  return x.d ? x.d[0] ? x.s : 0 * x.s : x.s || NaN;
}
function sin(x) {
  return new this(x).sin();
}
function sinh(x) {
  return new this(x).sinh();
}
function sqrt(x) {
  return new this(x).sqrt();
}
function sub(x, y) {
  return new this(x).sub(y);
}
function tan(x) {
  return new this(x).tan();
}
function tanh(x) {
  return new this(x).tanh();
}
function trunc(x) {
  return finalise(x = new this(x), x.e + 1, 1);
}
P[Symbol.for("nodejs.util.inspect.custom")] = P.toString;
P[Symbol.toStringTag] = "Decimal";
var Decimal = clone(DEFAULTS);
LN10 = new Decimal(LN10);
PI = new Decimal(PI);
var decimal_default = Decimal;

// src/runtime/utils/common.ts
const keyBy = (collection, prop) => {
  const acc = {};
  for (const obj of collection) {
    const key = obj[prop];
    acc[key] = obj;
  }
  return acc;
};
const keyBy2 = (collection1, collection2, prop) => {
  const acc = {};
  for (const obj of collection1) {
    const key = obj[prop];
    acc[key] = obj;
  }
  for (const obj of collection2) {
    const key = obj[prop];
    acc[key] = obj;
  }
  return acc;
};
const ScalarTypeTable = {
  String: true,
  Int: true,
  Float: true,
  Boolean: true,
  Long: true,
  DateTime: true,
  ID: true,
  UUID: true,
  Json: true,
  Bytes: true,
  Decimal: true
};
const JSTypeToGraphQLType = {
  string: "String",
  boolean: "Boolean",
  object: "Json"
};
function stringifyGraphQLType(type) {
  if (typeof type === "string") {
    return type;
  }
  return type.name;
}
function wrapWithList(str, isList) {
  if (isList) {
    return `List<${str}>`;
  }
  return str;
}
function getGraphQLType(value, potentialType) {
  if (value === null) {
    return "null";
  }
  if (decimal_default.isDecimal(value)) {
    return "Decimal";
  }
  if (Buffer.isBuffer(value)) {
    return "Bytes";
  }
  if (Array.isArray(value)) {
    let scalarTypes = value.reduce((acc, val) => {
      const type = getGraphQLType(val, potentialType);
      if (!acc.includes(type)) {
        acc.push(type);
      }
      return acc;
    }, []);
    if (scalarTypes.includes("Float") && scalarTypes.includes("Int")) {
      scalarTypes = ["Float"];
    }
    return `List<${scalarTypes.join(" | ")}>`;
  }
  const jsType = typeof value;
  if (jsType === "number") {
    if (Math.trunc(value) === value) {
      return "Int";
    } else {
      return "Float";
    }
  }
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return "DateTime";
  }
  if (jsType === "string") {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      return "UUID";
    }
    const date = new Date(value);
    if (potentialType && typeof potentialType === "object" && potentialType.values && potentialType.values.includes(value)) {
      return potentialType.name;
    }
    if (date.toString() === "Invalid Date") {
      return "String";
    }
    if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(value)) {
      return "DateTime";
    }
  }
  return JSTypeToGraphQLType[jsType];
}
function getSuggestion(str, possibilities) {
  const bestMatch = possibilities.reduce((acc, curr) => {
    const distance = js_levenshtein.default(str, curr);
    if (distance < acc.distance) {
      return {
        distance,
        str: curr
      };
    }
    return acc;
  }, {
    distance: Math.min(Math.floor(str.length) * 1.1, ...possibilities.map((p) => p.length * 3)),
    str: null
  });
  return bestMatch.str;
}
function stringifyInputType(input, greenKeys = false) {
  if (typeof input === "string") {
    return input;
  }
  if (input.values) {
    return `enum ${input.name} {
${indent_string.default(input.values.join(", "), 2)}
}`;
  } else {
    const body = indent_string.default(input.fields.map((arg) => {
      const key = `${arg.name}`;
      const str = `${greenKeys ? chalk.default.green(key) : key}${arg.isRequired ? "" : "?"}: ${chalk.default.white(arg.inputTypes.map((argType) => {
        return wrapWithList(argIsInputType(argType.type) ? argType.type.name : stringifyGraphQLType(argType.type), argType.isList);
      }).join(" | "))}`;
      if (!arg.isRequired) {
        return chalk.default.dim(str);
      }
      return str;
    }).join("\n"), 2);
    return `${chalk.default.dim("type")} ${chalk.default.bold.dim(input.name)} ${chalk.default.dim("{")}
${body}
${chalk.default.dim("}")}`;
  }
}
function argIsInputType(arg) {
  if (typeof arg === "string") {
    return false;
  }
  return true;
}
function getInputTypeName(input) {
  if (typeof input === "string") {
    if (input === "Null") {
      return "null";
    }
    return input;
  }
  return input.name;
}
function getOutputTypeName(input) {
  if (typeof input === "string") {
    return input;
  }
  return input.name;
}
function inputTypeToJson(input, isRequired, nameOnly = false) {
  if (typeof input === "string") {
    if (input === "Null") {
      return "null";
    }
    return input;
  }
  if (input.values) {
    return input.values.join(" | ");
  }
  const inputType = input;
  const showDeepType = isRequired && inputType.fields.every((arg) => {
    var _a;
    return arg.inputTypes[0].kind === "object" || ((_a = arg.inputTypes[1]) == null ? void 0 : _a.kind) === "object";
  });
  if (nameOnly) {
    return getInputTypeName(input);
  }
  return inputType.fields.reduce((acc, curr) => {
    let str = "";
    if (!showDeepType && !curr.isRequired) {
      str = curr.inputTypes.map((argType) => getInputTypeName(argType.type)).join(" | ");
    } else {
      str = curr.inputTypes.map((argInputType) => inputTypeToJson(argInputType.type, curr.isRequired, true)).join(" | ");
    }
    acc[curr.name + (curr.isRequired ? "" : "?")] = str;
    return acc;
  }, {});
}
function unionBy(arr1, arr2, iteratee) {
  const map = {};
  for (const element of arr1) {
    map[iteratee(element)] = element;
  }
  for (const element of arr2) {
    const key = iteratee(element);
    if (!map[key]) {
      map[key] = element;
    }
  }
  return Object.values(map);
}
function lowerCase(name) {
  return name.substring(0, 1).toLowerCase() + name.substring(1);
}

// src/runtime/dmmf.ts
class DMMFClass {
  constructor({datamodel, schema, mappings}) {
    this.outputTypeMap = {};
    this.outputTypeToMergedOutputType = (outputType) => {
      const model = this.modelMap[outputType.name];
      return {
        ...outputType,
        isEmbedded: model ? model.isEmbedded : false,
        fields: outputType.fields
      };
    };
    this.datamodel = datamodel;
    this.schema = schema;
    this.mappings = mappings;
    this.enumMap = this.getEnumMap();
    this.queryType = this.getQueryType();
    this.mutationType = this.getMutationType();
    this.modelMap = this.getModelMap();
    this.outputTypes = this.getOutputTypes();
    this.outputTypeMap = this.getMergedOutputTypeMap();
    this.resolveOutputTypes(this.outputTypes);
    this.inputTypes = this.schema.inputTypes;
    this.inputTypeMap = this.getInputTypeMap();
    this.resolveInputTypes(this.inputTypes);
    this.resolveFieldArgumentTypes(this.outputTypes, this.inputTypeMap);
    this.mappingsMap = this.getMappingsMap();
    this.queryType = this.outputTypeMap.Query;
    this.mutationType = this.outputTypeMap.Mutation;
    this.outputTypes = this.outputTypes;
    this.rootFieldMap = this.getRootFieldMap();
  }
  resolveOutputTypes(types) {
    for (const type of types) {
      for (const field of type.fields) {
        if (typeof field.outputType.type === "string" && !ScalarTypeTable[field.outputType.type]) {
          field.outputType.type = this.outputTypeMap[field.outputType.type] || this.enumMap[field.outputType.type] || field.outputType.type;
        }
      }
      type.fieldMap = keyBy(type.fields, "name");
    }
  }
  resolveInputTypes(types) {
    for (const type of types) {
      for (const field of type.fields) {
        const first = field.inputTypes[0].type;
        if (typeof first === "string" && !ScalarTypeTable[first] && (this.inputTypeMap[first] || this.enumMap[first])) {
          field.inputTypes[0].type = this.inputTypeMap[first] || this.enumMap[first] || field.inputTypes[0].type;
        }
        const second = field.inputTypes[1] && field.inputTypes[1].type;
        if (typeof second === "string" && !ScalarTypeTable[second] && (this.inputTypeMap[second] || this.enumMap[second])) {
          field.inputTypes[1].type = this.inputTypeMap[second] || this.enumMap[second] || field.inputTypes[1].type;
        }
      }
      type.fieldMap = keyBy(type.fields, "name");
    }
  }
  resolveFieldArgumentTypes(types, inputTypeMap) {
    for (const type of types) {
      for (const field of type.fields) {
        for (const arg of field.args) {
          const first = arg.inputTypes[0].type;
          if (typeof first === "string" && !ScalarTypeTable[first]) {
            arg.inputTypes[0].type = inputTypeMap[first] || this.enumMap[first] || arg.inputTypes[0].type;
          }
          const second = arg.inputTypes[1] && arg.inputTypes[1].type;
          if (second && typeof second === "string" && !ScalarTypeTable[second]) {
            arg.inputTypes[1].type = inputTypeMap[second] || this.enumMap[second] || arg.inputTypes[1].type;
          }
        }
      }
    }
  }
  getQueryType() {
    return this.schema.outputTypes.find((t) => t.name === "Query");
  }
  getMutationType() {
    return this.schema.outputTypes.find((t) => t.name === "Mutation");
  }
  getOutputTypes() {
    return this.schema.outputTypes.map(this.outputTypeToMergedOutputType);
  }
  getEnumMap() {
    return keyBy(this.schema.enums, "name");
  }
  getModelMap() {
    return keyBy(this.datamodel.models, "name");
  }
  getMergedOutputTypeMap() {
    return keyBy(this.outputTypes, "name");
  }
  getInputTypeMap() {
    return keyBy(this.schema.inputTypes, "name");
  }
  getMappingsMap() {
    return keyBy(this.mappings.modelOperations, "model");
  }
  getRootFieldMap() {
    return keyBy2(this.queryType.fields, this.mutationType.fields, "name");
  }
}

// src/runtime/query.ts
const chalk9 = __toModule(require_source());
const indent_string2 = __toModule(require_indent_string());

// src/runtime/utils/deep-extend.ts
/*!
 * @description Recursive object extending
 * @author Viacheslav Lotsmanov <lotsmanov89@gmail.com>
 * @license MIT
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2018 Viacheslav Lotsmanov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function isSpecificValue(val) {
  return val instanceof Buffer || val instanceof Date || val instanceof RegExp ? true : false;
}
function cloneSpecificValue(val) {
  if (val instanceof Buffer) {
    const x = Buffer.alloc ? Buffer.alloc(val.length) : new Buffer(val.length);
    val.copy(x);
    return x;
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error("Unexpected situation");
  }
}
function deepCloneArray(arr) {
  const clone2 = [];
  arr.forEach(function(item, index) {
    if (typeof item === "object" && item !== null) {
      if (Array.isArray(item)) {
        clone2[index] = deepCloneArray(item);
      } else if (isSpecificValue(item)) {
        clone2[index] = cloneSpecificValue(item);
      } else {
        clone2[index] = deepExtend({}, item);
      }
    } else {
      clone2[index] = item;
    }
  });
  return clone2;
}
function safeGetProperty(object, property) {
  return property === "__proto__" ? void 0 : object[property];
}
const deepExtend = function(target, ...args) {
  if (!target || typeof target !== "object") {
    return false;
  }
  if (args.length === 0) {
    return target;
  }
  let val, src;
  for (const obj of args) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      continue;
    }
    for (const key of Object.keys(obj)) {
      src = safeGetProperty(target, key);
      val = safeGetProperty(obj, key);
      if (val === target) {
        continue;
      } else if (typeof val !== "object" || val === null) {
        target[key] = val;
        continue;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        continue;
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        continue;
      } else if (typeof src !== "object" || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
        continue;
      } else {
        target[key] = deepExtend(src, val);
        continue;
      }
    }
  }
  return target;
};

// src/runtime/utils/deep-set.ts
const keys = (ks) => Array.isArray(ks) ? ks : ks.split(".");
const deepGet = (o, kp) => keys(kp).reduce((o2, k) => o2 && o2[k], o);
const deepSet = (o, kp, v) => keys(kp).reduceRight((v2, k, i, ks) => Object.assign({}, deepGet(o, ks.slice(0, i)), {[k]: v2}), v);

// src/runtime/utils/filterObject.ts
function filterObject(obj, cb) {
  if (!obj || typeof obj !== "object" || typeof obj.hasOwnProperty !== "function") {
    return obj;
  }
  const newObj = {};
  for (const key in obj) {
    const value = obj[key];
    if (obj.hasOwnProperty(key) && cb(key, value)) {
      newObj[key] = value;
    }
  }
  return newObj;
}

// src/runtime/utils/omit.ts
function omit(object, path3) {
  const result = {};
  const paths = Array.isArray(path3) ? path3 : [path3];
  for (const key in object) {
    if (object.hasOwnProperty(key) && !paths.includes(key)) {
      result[key] = object[key];
    }
  }
  return result;
}

// src/runtime/utils/printJsonErrors.ts
const chalk3 = __toModule(require_source());
const strip_ansi = __toModule(require_strip_ansi());

// src/runtime/utils/stringifyObject.ts
"use strict";
const isRegexp = require_is_regexp();
const isObj = require_is_obj();
const getOwnEnumPropSymbols = require_lib().default;
const stringifyObject = (input, options, pad) => {
  const seen = [];
  return function stringifyObject4(input2, options2 = {}, pad2 = "", path3 = []) {
    options2.indent = options2.indent || "	";
    let tokens;
    if (options2.inlineCharacterLimit === void 0) {
      tokens = {
        newLine: "\n",
        newLineOrSpace: "\n",
        pad: pad2,
        indent: pad2 + options2.indent
      };
    } else {
      tokens = {
        newLine: "@@__STRINGIFY_OBJECT_NEW_LINE__@@",
        newLineOrSpace: "@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@",
        pad: "@@__STRINGIFY_OBJECT_PAD__@@",
        indent: "@@__STRINGIFY_OBJECT_INDENT__@@"
      };
    }
    const expandWhiteSpace = (string) => {
      if (options2.inlineCharacterLimit === void 0) {
        return string;
      }
      const oneLined = string.replace(new RegExp(tokens.newLine, "g"), "").replace(new RegExp(tokens.newLineOrSpace, "g"), " ").replace(new RegExp(tokens.pad + "|" + tokens.indent, "g"), "");
      if (oneLined.length <= options2.inlineCharacterLimit) {
        return oneLined;
      }
      return string.replace(new RegExp(tokens.newLine + "|" + tokens.newLineOrSpace, "g"), "\n").replace(new RegExp(tokens.pad, "g"), pad2).replace(new RegExp(tokens.indent, "g"), pad2 + options2.indent);
    };
    if (seen.indexOf(input2) !== -1) {
      return '"[Circular]"';
    }
    if (Buffer.isBuffer(input2)) {
      return `Buffer(${Buffer.length})`;
    }
    if (input2 === null || input2 === void 0 || typeof input2 === "number" || typeof input2 === "boolean" || typeof input2 === "function" || typeof input2 === "symbol" || isRegexp(input2)) {
      return String(input2);
    }
    if (input2 instanceof Date) {
      return `new Date('${input2.toISOString()}')`;
    }
    if (Array.isArray(input2)) {
      if (input2.length === 0) {
        return "[]";
      }
      seen.push(input2);
      const ret = "[" + tokens.newLine + input2.map((el, i) => {
        const eol = input2.length - 1 === i ? tokens.newLine : "," + tokens.newLineOrSpace;
        let value = stringifyObject4(el, options2, pad2 + options2.indent, [
          ...path3,
          i
        ]);
        if (options2.transformValue) {
          value = options2.transformValue(input2, i, value);
        }
        return tokens.indent + value + eol;
      }).join("") + tokens.pad + "]";
      seen.pop();
      return expandWhiteSpace(ret);
    }
    if (isObj(input2)) {
      let objKeys = Object.keys(input2).concat(getOwnEnumPropSymbols(input2));
      if (options2.filter) {
        objKeys = objKeys.filter((el) => options2.filter(input2, el));
      }
      if (objKeys.length === 0) {
        return "{}";
      }
      seen.push(input2);
      const ret = "{" + tokens.newLine + objKeys.map((el, i) => {
        const eol = objKeys.length - 1 === i ? tokens.newLine : "," + tokens.newLineOrSpace;
        const isSymbol = typeof el === "symbol";
        const isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el);
        const key = isSymbol || isClassic ? el : stringifyObject4(el, options2, void 0, [...path3, el]);
        let value = stringifyObject4(input2[el], options2, pad2 + options2.indent, [...path3, el]);
        if (options2.transformValue) {
          value = options2.transformValue(input2, el, value);
        }
        let line = tokens.indent + String(key) + ": " + value + eol;
        if (options2.transformLine) {
          line = options2.transformLine({
            obj: input2,
            indent: tokens.indent,
            key,
            stringifiedValue: value,
            value: input2[el],
            eol,
            originalLine: line,
            path: path3.concat(key)
          });
        }
        return line;
      }).join("") + tokens.pad + "}";
      seen.pop();
      return expandWhiteSpace(ret);
    }
    input2 = String(input2).replace(/[\r\n]/g, (x) => x === "\n" ? "\\n" : "\\r");
    if (options2.singleQuotes === false) {
      input2 = input2.replace(/"/g, '\\"');
      return `"${input2}"`;
    }
    input2 = input2.replace(/\\?'/g, "\\'");
    return `'${input2}'`;
  }(input, options, pad);
};
var stringifyObject_default = stringifyObject;

// src/runtime/utils/printJsonErrors.ts
const DIM_TOKEN = "@@__DIM_POINTER__@@";
function printJsonWithErrors({
  ast,
  keyPaths,
  valuePaths,
  missingItems
}) {
  let obj = ast;
  for (const {path: path3, type} of missingItems) {
    obj = deepSet(obj, path3, type);
  }
  return stringifyObject_default(obj, {
    indent: "  ",
    transformLine: ({indent: indent3, key, value, stringifiedValue, eol, path: path3}) => {
      const dottedPath = path3.join(".");
      const keyError = keyPaths.includes(dottedPath);
      const valueError = valuePaths.includes(dottedPath);
      const missingItem = missingItems.find((item) => item.path === dottedPath);
      let valueStr = stringifiedValue;
      if (missingItem) {
        if (typeof value === "string") {
          valueStr = valueStr.slice(1, valueStr.length - 1);
        }
        const isRequiredStr = missingItem.isRequired ? "" : "?";
        const prefix = missingItem.isRequired ? "+" : "?";
        const color = missingItem.isRequired ? chalk3.default.greenBright : chalk3.default.green;
        let output = color(prefixLines(key + isRequiredStr + ": " + valueStr + eol, indent3, prefix));
        if (!missingItem.isRequired) {
          output = chalk3.default.dim(output);
        }
        return output;
      } else {
        const isOnMissingItemPath = missingItems.some((item) => dottedPath.startsWith(item.path));
        const isOptional = key[key.length - 2] === "?";
        if (isOptional) {
          key = key.slice(1, key.length - 1);
        }
        if (isOptional && typeof value === "object" && value !== null) {
          valueStr = valueStr.split("\n").map((line, index, arr) => index === arr.length - 1 ? line + DIM_TOKEN : line).join("\n");
        }
        if (isOnMissingItemPath && typeof value === "string") {
          valueStr = valueStr.slice(1, valueStr.length - 1);
          if (!isOptional) {
            valueStr = chalk3.default.bold(valueStr);
          }
        }
        if ((typeof value !== "object" || value === null) && !valueError && !isOnMissingItemPath) {
          valueStr = chalk3.default.dim(valueStr);
        }
        const keyStr = keyError ? chalk3.default.redBright(key) : key;
        valueStr = valueError ? chalk3.default.redBright(valueStr) : valueStr;
        let output = indent3 + keyStr + ": " + valueStr + (isOnMissingItemPath ? eol : chalk3.default.dim(eol));
        if (keyError || valueError) {
          const lines = output.split("\n");
          const keyLength = String(key).length;
          const keyScribbles = keyError ? chalk3.default.redBright("~".repeat(keyLength)) : " ".repeat(keyLength);
          const valueLength = valueError ? getValueLength(indent3, key, value, stringifiedValue) : 0;
          const hideValueScribbles = Boolean(valueError && typeof value === "object" && value !== null);
          const valueScribbles = valueError ? "  " + chalk3.default.redBright("~".repeat(valueLength)) : "";
          if (keyScribbles && keyScribbles.length > 0 && !hideValueScribbles) {
            lines.splice(1, 0, indent3 + keyScribbles + valueScribbles);
          }
          if (keyScribbles && keyScribbles.length > 0 && hideValueScribbles) {
            lines.splice(lines.length - 1, 0, indent3.slice(0, indent3.length - 2) + valueScribbles);
          }
          output = lines.join("\n");
        }
        return output;
      }
    }
  });
}
function getValueLength(indent3, key, value, stringifiedValue) {
  if (value === null) {
    return 4;
  }
  if (typeof value === "string") {
    return value.length + 2;
  }
  if (typeof value === "object") {
    return getLongestLine(`${key}: ${strip_ansi.default(stringifiedValue)}`) - indent3.length;
  }
  return String(value).length;
}
function getLongestLine(str) {
  return str.split("\n").reduce((max2, curr) => curr.length > max2 ? curr.length : max2, 0);
}
function prefixLines(str, indent3, prefix) {
  return str.split("\n").map((line, index, arr) => index === 0 ? prefix + indent3.slice(1) + line : index < arr.length - 1 ? prefix + line.slice(1) : line).map((line) => {
    return strip_ansi.default(line).includes(DIM_TOKEN) ? chalk3.default.dim(line.replace(DIM_TOKEN, "")) : line.includes("?") ? chalk3.default.dim(line) : line;
  }).join("\n");
}

// src/runtime/utils/printStack.ts
const chalk7 = __toModule(require_source());
const stackTraceParser = __toModule(require_stack_trace_parser_cjs());

// src/runtime/highlight/theme.ts
const chalk5 = __toModule(require_source());
const orange = chalk5.default.rgb(246, 145, 95);
const darkBrightBlue = chalk5.default.rgb(107, 139, 140);
const blue = chalk5.default.cyan;
const brightBlue = chalk5.default.rgb(127, 155, 155);
const identity = (str) => str;
const theme = {
  keyword: blue,
  entity: blue,
  value: brightBlue,
  punctuation: darkBrightBlue,
  directive: blue,
  function: blue,
  variable: brightBlue,
  string: chalk5.default.greenBright,
  boolean: orange,
  number: chalk5.default.cyan,
  comment: chalk5.default.grey
};

// src/runtime/highlight/prism.ts
var _self = {};
var uniqueId = 0;
var Prism = {
  manual: _self.Prism && _self.Prism.manual,
  disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
  util: {
    encode: function(tokens) {
      if (tokens instanceof Token) {
        const anyTokens = tokens;
        return new Token(anyTokens.type, Prism.util.encode(anyTokens.content), anyTokens.alias);
      } else if (Array.isArray(tokens)) {
        return tokens.map(Prism.util.encode);
      } else {
        return tokens.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
      }
    },
    type: function(o) {
      return Object.prototype.toString.call(o).slice(8, -1);
    },
    objId: function(obj) {
      if (!obj["__id"]) {
        Object.defineProperty(obj, "__id", {value: ++uniqueId});
      }
      return obj["__id"];
    },
    clone: function deepClone(o, visited) {
      var clone2, id, type = Prism.util.type(o);
      visited = visited || {};
      switch (type) {
        case "Object":
          id = Prism.util.objId(o);
          if (visited[id]) {
            return visited[id];
          }
          clone2 = {};
          visited[id] = clone2;
          for (var key in o) {
            if (o.hasOwnProperty(key)) {
              clone2[key] = deepClone(o[key], visited);
            }
          }
          return clone2;
        case "Array":
          id = Prism.util.objId(o);
          if (visited[id]) {
            return visited[id];
          }
          clone2 = [];
          visited[id] = clone2;
          o.forEach(function(v, i) {
            clone2[i] = deepClone(v, visited);
          });
          return clone2;
        default:
          return o;
      }
    }
  },
  languages: {
    extend: function(id, redef) {
      var lang = Prism.util.clone(Prism.languages[id]);
      for (var key in redef) {
        lang[key] = redef[key];
      }
      return lang;
    },
    insertBefore: function(inside, before, insert, root) {
      root = root || Prism.languages;
      var grammar = root[inside];
      var ret = {};
      for (var token in grammar) {
        if (grammar.hasOwnProperty(token)) {
          if (token == before) {
            for (var newToken in insert) {
              if (insert.hasOwnProperty(newToken)) {
                ret[newToken] = insert[newToken];
              }
            }
          }
          if (!insert.hasOwnProperty(token)) {
            ret[token] = grammar[token];
          }
        }
      }
      var old = root[inside];
      root[inside] = ret;
      Prism.languages.DFS(Prism.languages, function(key, value) {
        if (value === old && key != inside) {
          this[key] = ret;
        }
      });
      return ret;
    },
    DFS: function DFS(o, callback, type, visited) {
      visited = visited || {};
      var objId = Prism.util.objId;
      for (var i in o) {
        if (o.hasOwnProperty(i)) {
          callback.call(o, i, o[i], type || i);
          var property = o[i], propertyType = Prism.util.type(property);
          if (propertyType === "Object" && !visited[objId(property)]) {
            visited[objId(property)] = true;
            DFS(property, callback, null, visited);
          } else if (propertyType === "Array" && !visited[objId(property)]) {
            visited[objId(property)] = true;
            DFS(property, callback, i, visited);
          }
        }
      }
    }
  },
  plugins: {},
  highlight: function(text, grammar, language) {
    var env = {
      code: text,
      grammar,
      language
    };
    Prism.hooks.run("before-tokenize", env);
    env.tokens = Prism.tokenize(env.code, env.grammar);
    Prism.hooks.run("after-tokenize", env);
    return Token.stringify(Prism.util.encode(env.tokens), env.language);
  },
  matchGrammar: function(text, strarr, grammar, index, startPos, oneshot, target) {
    for (var token in grammar) {
      if (!grammar.hasOwnProperty(token) || !grammar[token]) {
        continue;
      }
      if (token == target) {
        return;
      }
      var patterns = grammar[token];
      patterns = Prism.util.type(patterns) === "Array" ? patterns : [patterns];
      for (var j = 0; j < patterns.length; ++j) {
        var pattern = patterns[j], inside = pattern.inside, lookbehind = !!pattern.lookbehind, greedy = !!pattern.greedy, lookbehindLength = 0, alias = pattern.alias;
        if (greedy && !pattern.pattern.global) {
          var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
          pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
        }
        pattern = pattern.pattern || pattern;
        for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {
          var str = strarr[i];
          if (strarr.length > text.length) {
            return;
          }
          if (str instanceof Token) {
            continue;
          }
          if (greedy && i != strarr.length - 1) {
            pattern.lastIndex = pos;
            var match = pattern.exec(text);
            if (!match) {
              break;
            }
            var from = match.index + (lookbehind ? match[1].length : 0), to = match.index + match[0].length, k = i, p = pos;
            for (var len = strarr.length; k < len && (p < to || !strarr[k].type && !strarr[k - 1].greedy); ++k) {
              p += strarr[k].length;
              if (from >= p) {
                ++i;
                pos = p;
              }
            }
            if (strarr[i] instanceof Token) {
              continue;
            }
            delNum = k - i;
            str = text.slice(pos, p);
            match.index -= pos;
          } else {
            pattern.lastIndex = 0;
            var match = pattern.exec(str), delNum = 1;
          }
          if (!match) {
            if (oneshot) {
              break;
            }
            continue;
          }
          if (lookbehind) {
            lookbehindLength = match[1] ? match[1].length : 0;
          }
          var from = match.index + lookbehindLength, match = match[0].slice(lookbehindLength), to = from + match.length, before = str.slice(0, from), after = str.slice(to);
          var args = [i, delNum];
          if (before) {
            ++i;
            pos += before.length;
            args.push(before);
          }
          var wrapped = new Token(token, inside ? Prism.tokenize(match, inside) : match, alias, match, greedy);
          args.push(wrapped);
          if (after) {
            args.push(after);
          }
          Array.prototype.splice.apply(strarr, args);
          if (delNum != 1)
            Prism.matchGrammar(text, strarr, grammar, i, pos, true, token);
          if (oneshot)
            break;
        }
      }
    }
  },
  tokenize: function(text, grammar) {
    var strarr = [text];
    var rest = grammar.rest;
    if (rest) {
      for (var token in rest) {
        grammar[token] = rest[token];
      }
      delete grammar.rest;
    }
    Prism.matchGrammar(text, strarr, grammar, 0, 0, false);
    return strarr;
  },
  hooks: {
    all: {},
    add: function(name, callback) {
      var hooks = Prism.hooks.all;
      hooks[name] = hooks[name] || [];
      hooks[name].push(callback);
    },
    run: function(name, env) {
      var callbacks = Prism.hooks.all[name];
      if (!callbacks || !callbacks.length) {
        return;
      }
      for (var i = 0, callback; callback = callbacks[i++]; ) {
        callback(env);
      }
    }
  },
  Token
};
Prism.languages.clike = {
  comment: [
    {
      pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
      lookbehind: true
    },
    {
      pattern: /(^|[^\\:])\/\/.*/,
      lookbehind: true,
      greedy: true
    }
  ],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  "class-name": {
    pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
    lookbehind: true,
    inside: {
      punctuation: /[.\\]/
    }
  },
  keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
  boolean: /\b(?:true|false)\b/,
  function: /\w+(?=\()/,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
  punctuation: /[{}[\];(),.:]/
};
Prism.languages.javascript = Prism.languages.extend("clike", {
  "class-name": [
    Prism.languages.clike["class-name"],
    {
      pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
      lookbehind: true
    }
  ],
  keyword: [
    {
      pattern: /((?:^|})\s*)(?:catch|finally)\b/,
      lookbehind: true
    },
    {
      pattern: /(^|[^.])\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
      lookbehind: true
    }
  ],
  number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
  function: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
  operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
});
Prism.languages.javascript["class-name"][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;
Prism.languages.insertBefore("javascript", "keyword", {
  regex: {
    pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=\s*($|[\r\n,.;})\]]))/,
    lookbehind: true,
    greedy: true
  },
  "function-variable": {
    pattern: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
    alias: "function"
  },
  parameter: [
    {
      pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
      lookbehind: true,
      inside: Prism.languages.javascript
    },
    {
      pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
      inside: Prism.languages.javascript
    },
    {
      pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
      lookbehind: true,
      inside: Prism.languages.javascript
    },
    {
      pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
      lookbehind: true,
      inside: Prism.languages.javascript
    }
  ],
  constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});
if (Prism.languages.markup) {
  Prism.languages.markup.tag.addInlined("script", "javascript");
}
Prism.languages.js = Prism.languages.javascript;
Prism.languages.typescript = Prism.languages.extend("javascript", {
  keyword: /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/,
  builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/
});
Prism.languages.ts = Prism.languages.typescript;
function Token(type, content, alias, matchedStr, greedy) {
  this.type = type;
  this.content = content;
  this.alias = alias;
  this.length = (matchedStr || "").length | 0;
  this.greedy = !!greedy;
}
Token.stringify = function(o, language) {
  if (typeof o == "string") {
    return o;
  }
  if (Array.isArray(o)) {
    return o.map(function(element) {
      return Token.stringify(element, language);
    }).join("");
  }
  return getColorForSyntaxKind(o.type)(o.content);
};
function getColorForSyntaxKind(syntaxKind) {
  return theme[syntaxKind] || identity;
}

// src/runtime/highlight/highlight.ts
function highlightTS(str) {
  return highlight(str, Prism.languages.javascript);
}
function highlight(str, grammar) {
  const tokens = Prism.tokenize(str, grammar);
  return tokens.map((t) => Token.stringify(t)).join("");
}

// src/runtime/utils/dedent.ts
const strip_indent = __toModule(require_strip_indent());
function dedent(str) {
  return strip_indent.default(str);
}

// src/runtime/utils/printStack.ts
function renderN(n, max2) {
  const wantedLetters = String(max2).length;
  const hasLetters = String(n).length;
  if (hasLetters >= wantedLetters) {
    return String(n);
  }
  return " ".repeat(wantedLetters - hasLetters) + n;
}
const printStack = ({
  callsite,
  originalMethod,
  onUs,
  showColors,
  renderPathRelative,
  printFullStack,
  isValidationError
}) => {
  const lastErrorHeight = 20;
  let callsiteStr = ":";
  let prevLines = "\n";
  let afterLines = "";
  let indentValue = 0;
  let functionName = `prisma.${originalMethod}()`;
  if (callsite && typeof window === "undefined") {
    const stack = stackTraceParser.parse(callsite);
    const trace = stack.find((t, i) => {
      if (i < 3) {
        if (t.methodName.includes("Object.")) {
          return false;
        }
      }
      return t.file && !t.file.includes("@prisma") && !t.file.includes("getPrismaClient") && !t.methodName.includes("new ") && !t.methodName.includes("_getCallsite") && t.methodName.split(".").length < 4;
    });
    if (process.env.NODE_ENV !== "production" && trace && trace.file && trace.lineNumber && trace.column && !trace.file.startsWith("internal/")) {
      const lineNumber = trace.lineNumber;
      const printedFileName = renderPathRelative ? require("path").relative(process.cwd(), trace.file) : trace.file;
      callsiteStr = callsite ? ` in
${chalk7.default.underline(`${printedFileName}:${trace.lineNumber}:${trace.column}`)}` : "";
      const height = process.stdout.rows || 20;
      const start = Math.max(0, lineNumber - 5);
      const neededHeight = lastErrorHeight + lineNumber - start;
      if (height > neededHeight || printFullStack) {
        const fs3 = require("fs");
        const exists = fs3.existsSync(trace.file);
        if (exists) {
          const file = fs3.readFileSync(trace.file, "utf-8");
          const slicedFile = file.split("\n").slice(start, lineNumber).join("\n");
          const lines = dedent(slicedFile).split("\n");
          const theLine = lines[lines.length - 1];
          if (!theLine || theLine.trim() === "") {
            callsiteStr = ":";
          } else {
            const prismaClientRegex = /(\S+(create|updateMany|deleteMany|update|delete|findMany|findOne)\()/;
            const match = theLine.match(prismaClientRegex);
            if (match) {
              functionName = `${match[1]})`;
            }
            const slicePoint = theLine.indexOf("{");
            const linesToHighlight = lines.map((l, i, all) => !onUs && i === all.length - 1 ? l.slice(0, slicePoint > -1 ? slicePoint : l.length - 1) : l).join("\n");
            const highlightedLines = showColors ? highlightTS(linesToHighlight).split("\n") : linesToHighlight.split("\n");
            prevLines = "\n" + highlightedLines.map((l, i) => chalk7.default.grey(renderN(i + start + 1, lineNumber + start + 1) + " ") + chalk7.default.reset() + l).map((l, i, arr) => i === arr.length - 1 ? `${chalk7.default.red.bold("→")} ${chalk7.default.dim(l)}` : chalk7.default.dim("  " + l)).join("\n");
            if (!match && !isValidationError) {
              prevLines += "\n\n";
            }
            afterLines = ")";
            indentValue = String(lineNumber + start + 1).length + getIndent(theLine) + 1 + (match ? 2 : 0);
          }
        }
      }
    }
  }
  function getIndent(line) {
    let spaceCount = 0;
    for (let i = 0; i < line.length; i++) {
      if (line.charAt(i) !== " ") {
        return spaceCount;
      }
      spaceCount++;
    }
    return spaceCount;
  }
  const introText = onUs ? chalk7.default.red(`Oops, an unknown error occured! This is ${chalk7.default.bold("on us")}, you did nothing wrong.
It occured in the ${chalk7.default.bold(`\`${functionName}\``)} invocation${callsiteStr}`) : chalk7.default.red(`Invalid ${chalk7.default.bold(`\`${functionName}\``)} invocation${callsiteStr}`);
  const stackStr = `
${introText}
${prevLines}${chalk7.default.reset()}`;
  return {indent: indentValue, stack: stackStr, afterLines, lastErrorHeight};
};

// src/runtime/query.ts
const strip_ansi2 = __toModule(require_strip_ansi());

// src/runtime/utils/flatMap.ts
function flatten(array) {
  return Array.prototype.concat.apply([], array);
}
function flatMap(array, callbackFn, thisArg) {
  return flatten(array.map(callbackFn, thisArg));
}

// src/runtime/query.ts
const tab = 2;
class Document {
  constructor(type, children) {
    this.type = type;
    this.children = children;
    this.printFieldError = ({error, path: path3}, missingItems, minimal) => {
      if (error.type === "emptySelect") {
        const additional = minimal ? "" : ` Available options are listed in ${chalk9.default.greenBright.dim("green")}.`;
        return `The ${chalk9.default.redBright("`select`")} statement for type ${chalk9.default.bold(getOutputTypeName(error.field.outputType.type))} must not be empty.${additional}`;
      }
      if (error.type === "emptyInclude") {
        if (missingItems.length === 0) {
          return `${chalk9.default.bold(getOutputTypeName(error.field.outputType.type))} does not have any relation and therefore can't have an ${chalk9.default.redBright("`include`")} statement.`;
        }
        const additional = minimal ? "" : ` Available options are listed in ${chalk9.default.greenBright.dim("green")}.`;
        return `The ${chalk9.default.redBright("`include`")} statement for type ${chalk9.default.bold(getOutputTypeName(error.field.outputType.type))} must not be empty.${additional}`;
      }
      if (error.type === "noTrueSelect") {
        return `The ${chalk9.default.redBright("`select`")} statement for type ${chalk9.default.bold(getOutputTypeName(error.field.outputType.type))} needs ${chalk9.default.bold("at least one truthy value")}.`;
      }
      if (error.type === "includeAndSelect") {
        return `Please ${chalk9.default.bold("either")} use ${chalk9.default.greenBright("`include`")} or ${chalk9.default.greenBright("`select`")}, but ${chalk9.default.redBright("not both")} at the same time.`;
      }
      if (error.type === "invalidFieldName") {
        const statement = error.isInclude ? "include" : "select";
        const wording = error.isIncludeScalar ? "Invalid scalar" : "Unknown";
        const additional = minimal ? "" : error.isInclude && missingItems.length === 0 ? `
This model has no relations, so you can't use ${chalk9.default.redBright("include")} with it.` : ` Available options are listed in ${chalk9.default.greenBright.dim("green")}.`;
        let str = `${wording} field ${chalk9.default.redBright(`\`${error.providedName}\``)} for ${chalk9.default.bold(statement)} statement on model ${chalk9.default.bold.white(error.modelName)}.${additional}`;
        if (error.didYouMean) {
          str += ` Did you mean ${chalk9.default.greenBright(`\`${error.didYouMean}\``)}?`;
        }
        if (error.isIncludeScalar) {
          str += `
Note, that ${chalk9.default.bold("include")} statements only accept relation fields.`;
        }
        return str;
      }
      if (error.type === "invalidFieldType") {
        const str = `Invalid value ${chalk9.default.redBright(`${stringifyObject_default(error.providedValue)}`)} of type ${chalk9.default.redBright(getGraphQLType(error.providedValue, void 0))} for field ${chalk9.default.bold(`${error.fieldName}`)} on model ${chalk9.default.bold.white(error.modelName)}. Expected either ${chalk9.default.greenBright("true")} or ${chalk9.default.greenBright("false")}.`;
        return str;
      }
    };
    this.printArgError = ({error, path: path3}, hasMissingItems, minimal) => {
      if (error.type === "invalidName") {
        let str = `Unknown arg ${chalk9.default.redBright(`\`${error.providedName}\``)} in ${chalk9.default.bold(path3.join("."))} for type ${chalk9.default.bold(error.outputType ? error.outputType.name : getInputTypeName(error.originalType))}.`;
        if (error.didYouMeanField) {
          str += `
→ Did you forget to wrap it with \`${chalk9.default.greenBright("select")}\`? ${chalk9.default.dim("e.g. " + chalk9.default.greenBright(`{ select: { ${error.providedName}: ${error.providedValue} } }`))}`;
        } else if (error.didYouMeanArg) {
          str += ` Did you mean \`${chalk9.default.greenBright(error.didYouMeanArg)}\`?`;
          if (!hasMissingItems && !minimal) {
            str += ` ${chalk9.default.dim("Available args:")}
` + stringifyInputType(error.originalType, true);
          }
        } else {
          if (error.originalType.fields.length === 0) {
            str += ` The field ${chalk9.default.bold(error.originalType.name)} has no arguments.`;
          } else if (!hasMissingItems && !minimal) {
            str += ` Available args:

` + stringifyInputType(error.originalType, true);
          }
        }
        return str;
      }
      if (error.type === "invalidType") {
        let valueStr = stringifyObject_default(error.providedValue, {indent: "  "});
        const multilineValue = valueStr.split("\n").length > 1;
        if (multilineValue) {
          valueStr = `
${valueStr}
`;
        }
        if (error.requiredType.bestFittingType.kind === "enum") {
          return `Argument ${chalk9.default.bold(error.argName)}: Provided value ${chalk9.default.redBright(valueStr)}${multilineValue ? "" : " "}of type ${chalk9.default.redBright(getGraphQLType(error.providedValue))} on ${chalk9.default.bold(`prisma.${this.children[0].name}`)} is not a ${chalk9.default.greenBright(wrapWithList(stringifyGraphQLType(error.requiredType.bestFittingType.kind), error.requiredType.bestFittingType.isList))}.
→ Possible values: ${error.requiredType.bestFittingType.type.values.map((v) => chalk9.default.greenBright(`${stringifyGraphQLType(error.requiredType.bestFittingType.type)}.${v}`)).join(", ")}`;
        }
        let typeStr = ".";
        if (isInputArgType(error.requiredType.bestFittingType.type)) {
          typeStr = ":\n" + stringifyInputType(error.requiredType.bestFittingType.type);
        }
        let expected = `${error.requiredType.inputType.map((t) => chalk9.default.greenBright(wrapWithList(stringifyGraphQLType(t.type), error.requiredType.bestFittingType.isList))).join(" or ")}${typeStr}`;
        const inputType = error.requiredType.inputType.length === 2 && error.requiredType.inputType.find((t) => isInputArgType(t.type)) || null;
        if (inputType) {
          expected += `
` + stringifyInputType(inputType.type, true);
        }
        return `Argument ${chalk9.default.bold(error.argName)}: Got invalid value ${chalk9.default.redBright(valueStr)}${multilineValue ? "" : " "}on ${chalk9.default.bold(`prisma.${this.children[0].name}`)}. Provided ${chalk9.default.redBright(getGraphQLType(error.providedValue))}, expected ${expected}`;
      }
      if (error.type === "invalidNullArg") {
        const forStr = path3.length === 1 && path3[0] === error.name ? "" : ` for ${chalk9.default.bold(`${path3.join(".")}`)}`;
        const undefinedTip = ` Please use ${chalk9.default.bold.greenBright("undefined")} instead.`;
        return `Argument ${chalk9.default.greenBright(error.name)}${forStr} must not be ${chalk9.default.bold("null")}.${undefinedTip}`;
      }
      if (error.type === "missingArg") {
        const forStr = path3.length === 1 && path3[0] === error.missingName ? "" : ` for ${chalk9.default.bold(`${path3.join(".")}`)}`;
        return `Argument ${chalk9.default.greenBright(error.missingName)}${forStr} is missing.`;
      }
      if (error.type === "atLeastOne") {
        const additional = minimal ? "" : ` Available args are listed in ${chalk9.default.dim.green("green")}.`;
        return `Argument ${chalk9.default.bold(path3.join("."))} of type ${chalk9.default.bold(error.inputType.name)} needs ${chalk9.default.greenBright("at least one")} argument.${additional}`;
      }
      if (error.type === "atMostOne") {
        const additional = minimal ? "" : ` Please choose one. ${chalk9.default.dim("Available args:")} 
${stringifyInputType(error.inputType, true)}`;
        return `Argument ${chalk9.default.bold(path3.join("."))} of type ${chalk9.default.bold(error.inputType.name)} needs ${chalk9.default.greenBright("exactly one")} argument, but you provided ${error.providedKeys.map((key) => chalk9.default.redBright(key)).join(" and ")}.${additional}`;
      }
    };
    this.type = type;
    this.children = children;
  }
  toString() {
    return `${this.type} {
${indent_string2.default(this.children.map(String).join("\n"), tab)}
}`;
  }
  validate(select, isTopLevelQuery = false, originalMethod, errorFormat, validationCallsite) {
    if (!select) {
      select = {};
    }
    const invalidChildren = this.children.filter((child) => child.hasInvalidChild || child.hasInvalidArg);
    if (invalidChildren.length === 0) {
      return;
    }
    const fieldErrors = [];
    const argErrors = [];
    const prefix = select && select.select ? "select" : select.include ? "include" : void 0;
    for (const child of invalidChildren) {
      const errors = child.collectErrors(prefix);
      fieldErrors.push(...errors.fieldErrors.map((e) => ({
        ...e,
        path: isTopLevelQuery ? e.path : e.path.slice(1)
      })));
      argErrors.push(...errors.argErrors.map((e) => ({
        ...e,
        path: isTopLevelQuery ? e.path : e.path.slice(1)
      })));
    }
    const topLevelQueryName = this.children[0].name;
    const queryName = isTopLevelQuery ? this.type : topLevelQueryName;
    const keyPaths = [];
    const valuePaths = [];
    const missingItems = [];
    for (const fieldError of fieldErrors) {
      const path3 = this.normalizePath(fieldError.path, select).join(".");
      if (fieldError.error.type === "invalidFieldName") {
        keyPaths.push(path3);
        const fieldType = fieldError.error.outputType;
        const {isInclude} = fieldError.error;
        fieldType.fields.filter((field) => isInclude ? field.outputType.kind === "object" : true).forEach((field) => {
          const splittedPath = path3.split(".");
          missingItems.push({
            path: `${splittedPath.slice(0, splittedPath.length - 1).join(".")}.${field.name}`,
            type: "true",
            isRequired: false
          });
        });
      } else if (fieldError.error.type === "includeAndSelect") {
        keyPaths.push("select");
        keyPaths.push("include");
      } else {
        valuePaths.push(path3);
      }
      if (fieldError.error.type === "emptySelect" || fieldError.error.type === "noTrueSelect" || fieldError.error.type === "emptyInclude") {
        const selectPathArray = this.normalizePath(fieldError.path, select);
        const selectPath = selectPathArray.slice(0, selectPathArray.length - 1).join(".");
        const fieldType = fieldError.error.field.outputType.type;
        fieldType.fields.filter((field) => fieldError.error.type === "emptyInclude" ? field.outputType.kind === "object" : true).forEach((field) => {
          missingItems.push({
            path: `${selectPath}.${field.name}`,
            type: "true",
            isRequired: false
          });
        });
      }
    }
    for (const argError of argErrors) {
      const path3 = this.normalizePath(argError.path, select).join(".");
      if (argError.error.type === "invalidName") {
        keyPaths.push(path3);
      } else if (argError.error.type !== "missingArg" && argError.error.type !== "atLeastOne") {
        valuePaths.push(path3);
      } else if (argError.error.type === "missingArg") {
        const type = argError.error.missingArg.inputTypes.length === 1 ? argError.error.missingArg.inputTypes[0].type : argError.error.missingArg.inputTypes.map((t) => {
          const inputTypeName = getInputTypeName(t.type);
          if (inputTypeName === "Null") {
            return "null";
          }
          if (t.isList) {
            return inputTypeName + "[]";
          }
          return inputTypeName;
        }).join(" | ");
        missingItems.push({
          path: path3,
          type: inputTypeToJson(type, true, path3.split("where.").length === 2),
          isRequired: argError.error.missingArg.isRequired
        });
      }
    }
    const renderErrorStr = (callsite) => {
      const hasRequiredMissingArgsErrors = argErrors.some((e) => e.error.type === "missingArg" && e.error.missingArg.isRequired);
      const hasOptionalMissingArgsErrors = Boolean(argErrors.find((e) => e.error.type === "missingArg" && !e.error.missingArg.isRequired));
      const hasMissingArgsErrors = hasOptionalMissingArgsErrors || hasRequiredMissingArgsErrors;
      let missingArgsLegend = "";
      if (hasRequiredMissingArgsErrors) {
        missingArgsLegend += `
${chalk9.default.dim("Note: Lines with ")}${chalk9.default.reset.greenBright("+")} ${chalk9.default.dim("are required")}`;
      }
      if (hasOptionalMissingArgsErrors) {
        if (missingArgsLegend.length === 0) {
          missingArgsLegend = "\n";
        }
        if (hasRequiredMissingArgsErrors) {
          missingArgsLegend += chalk9.default.dim(`, lines with ${chalk9.default.green("?")} are optional`);
        } else {
          missingArgsLegend += chalk9.default.dim(`Note: Lines with ${chalk9.default.green("?")} are optional`);
        }
        missingArgsLegend += chalk9.default.dim(".");
      }
      const errorMessages = `${argErrors.filter((e) => e.error.type !== "missingArg" || e.error.missingArg.isRequired).map((e) => this.printArgError(e, hasMissingArgsErrors, errorFormat === "minimal")).join("\n")}
${fieldErrors.map((e) => this.printFieldError(e, missingItems, errorFormat === "minimal")).join("\n")}`;
      if (errorFormat === "minimal") {
        return strip_ansi2.default(errorMessages);
      }
      const {stack, indent: indentValue, afterLines} = printStack({
        callsite,
        originalMethod: originalMethod || queryName,
        showColors: errorFormat && errorFormat === "pretty",
        isValidationError: true
      });
      let printJsonArgs = {
        ast: isTopLevelQuery ? {[topLevelQueryName]: select} : select,
        keyPaths,
        valuePaths,
        missingItems
      };
      if (originalMethod == null ? void 0 : originalMethod.endsWith("aggregate")) {
        printJsonArgs = transformAggregatePrintJsonArgs(printJsonArgs);
      }
      const errorStr = `${stack}${indent_string2.default(printJsonWithErrors(printJsonArgs), indentValue).slice(indentValue)}${chalk9.default.dim(afterLines)}

${errorMessages}${missingArgsLegend}
`;
      if (process.env.NO_COLOR || errorFormat === "colorless") {
        return strip_ansi2.default(errorStr);
      }
      return errorStr;
    };
    const error = new PrismaClientValidationError(renderErrorStr(validationCallsite));
    if (process.env.NODE_ENV !== "production") {
      Object.defineProperty(error, "render", {
        get: () => renderErrorStr,
        enumerable: false
      });
    }
    throw error;
  }
  normalizePath(inputPath, select) {
    const path3 = inputPath.slice();
    const newPath = [];
    let key;
    let pointer = select;
    while ((key = path3.shift()) !== void 0) {
      if (!Array.isArray(pointer) && key === 0) {
        continue;
      }
      if (key === "select") {
        if (!pointer[key]) {
          pointer = pointer.include;
        } else {
          pointer = pointer[key];
        }
      } else if (pointer && pointer[key]) {
        pointer = pointer[key];
      }
      newPath.push(key);
    }
    return newPath;
  }
}
class PrismaClientValidationError extends Error {
}
class Field {
  constructor({name, args, children, error, schemaField}) {
    this.name = name;
    this.args = args;
    this.children = children;
    this.error = error;
    this.schemaField = schemaField;
    this.hasInvalidChild = children ? children.some((child) => Boolean(child.error || child.hasInvalidArg || child.hasInvalidChild)) : false;
    this.hasInvalidArg = args ? args.hasInvalidArg : false;
  }
  toString() {
    let str = this.name;
    if (this.error) {
      return str + " # INVALID_FIELD";
    }
    if (this.args && this.args.args && this.args.args.length > 0) {
      if (this.args.args.length === 1) {
        str += `(${this.args.toString()})`;
      } else {
        str += `(
${indent_string2.default(this.args.toString(), tab)}
)`;
      }
    }
    if (this.children) {
      str += ` {
${indent_string2.default(this.children.map(String).join("\n"), tab)}
}`;
    }
    return str;
  }
  collectErrors(prefix = "select") {
    const fieldErrors = [];
    const argErrors = [];
    if (this.error) {
      fieldErrors.push({
        path: [this.name],
        error: this.error
      });
    }
    if (this.children) {
      for (const child of this.children) {
        const errors = child.collectErrors(prefix);
        fieldErrors.push(...errors.fieldErrors.map((e) => ({
          ...e,
          path: [this.name, prefix, ...e.path]
        })));
        argErrors.push(...errors.argErrors.map((e) => ({
          ...e,
          path: [this.name, prefix, ...e.path]
        })));
      }
    }
    if (this.args) {
      argErrors.push(...this.args.collectErrors().map((e) => ({...e, path: [this.name, ...e.path]})));
    }
    return {
      fieldErrors,
      argErrors
    };
  }
}
class Args {
  constructor(args = []) {
    this.args = args;
    this.hasInvalidArg = args ? args.some((arg) => Boolean(arg.hasError)) : false;
  }
  toString() {
    if (this.args.length === 0) {
      return "";
    }
    return `${this.args.map((arg) => arg.toString()).filter((a) => a).join("\n")}`;
  }
  collectErrors() {
    if (!this.hasInvalidArg) {
      return [];
    }
    return flatMap(this.args, (arg) => arg.collectErrors());
  }
}
function stringify(obj, _2, tabbing, isEnum, isJson) {
  if (Buffer.isBuffer(obj)) {
    return JSON.stringify(obj.toString("base64"));
  }
  if (isJson) {
    if (obj === null) {
      return "null";
    }
    if (obj && obj.values && obj.__prismaRawParamaters__) {
      return JSON.stringify(obj.values);
    }
    return JSON.stringify(JSON.stringify(obj));
  }
  if (obj === void 0) {
    return null;
  }
  if (obj === null) {
    return "null";
  }
  if (decimal_default.isDecimal(obj)) {
    return obj.toString();
  }
  if (isEnum && typeof obj === "string") {
    return obj;
  }
  if (isEnum && Array.isArray(obj)) {
    return `[${obj.join(", ")}]`;
  }
  return JSON.stringify(obj, _2, tabbing);
}
class Arg {
  constructor({
    key,
    value,
    argType,
    isEnum = false,
    error,
    schemaArg
  }) {
    this.key = key;
    this.value = value;
    this.argType = argType;
    this.isEnum = isEnum;
    this.error = error;
    this.schemaArg = schemaArg;
    this.isNullable = (schemaArg == null ? void 0 : schemaArg.inputTypes.reduce((isNullable, inputType) => isNullable && schemaArg.isNullable, true)) || false;
    this.hasError = Boolean(error) || (value instanceof Args ? value.hasInvalidArg : false) || Array.isArray(value) && value.some((v) => v instanceof Args ? v.hasInvalidArg : false);
  }
  _toString(value, key) {
    var _a;
    if (typeof value === "undefined") {
      return void 0;
    }
    if (value instanceof Args) {
      if (value.args.length === 1 && value.args[0].key === "set" && ((_a = value.args[0].schemaArg) == null ? void 0 : _a.inputTypes[0].type) === "Json") {
        return `${key}: {
  set: ${stringify(value.args[0].value, null, 2, this.isEnum, true)}
}`;
      }
      return `${key}: {
${indent_string2.default(value.toString(), 2)}
}`;
    }
    if (Array.isArray(value)) {
      if (this.argType === "Json") {
        return `${key}: ${stringify(value, null, 2, this.isEnum, this.argType === "Json")}`;
      }
      const isScalar = !value.some((v) => typeof v === "object");
      return `${key}: [${isScalar ? "" : "\n"}${indent_string2.default(value.map((nestedValue) => {
        if (nestedValue instanceof Args) {
          return `{
${indent_string2.default(nestedValue.toString(), tab)}
}`;
        }
        return stringify(nestedValue, null, 2, this.isEnum);
      }).join(`,${isScalar ? " " : "\n"}`), isScalar ? 0 : tab)}${isScalar ? "" : "\n"}]`;
    }
    return `${key}: ${stringify(value, null, 2, this.isEnum, this.argType === "Json")}`;
  }
  toString() {
    return this._toString(this.value, this.key);
  }
  collectErrors() {
    if (!this.hasError) {
      return [];
    }
    const errors = [];
    if (this.error) {
      errors.push({
        error: this.error,
        path: [this.key]
      });
    }
    if (Array.isArray(this.value)) {
      errors.push(...flatMap(this.value, (val, index) => {
        if (!val.collectErrors) {
          return [];
        }
        return val.collectErrors().map((e) => {
          return {...e, path: [this.key, index, ...e.path]};
        });
      }));
    }
    if (this.value instanceof Args) {
      errors.push(...this.value.collectErrors().map((e) => ({...e, path: [this.key, ...e.path]})));
    }
    return errors;
  }
}
function makeDocument({
  dmmf: dmmf2,
  rootTypeName,
  rootField,
  select
}) {
  if (!select) {
    select = {};
  }
  const rootType = rootTypeName === "query" ? dmmf2.queryType : dmmf2.mutationType;
  const fakeRootField = {
    args: [],
    outputType: {
      isList: false,
      type: rootType,
      kind: "object"
    },
    isRequired: true,
    name: rootTypeName
  };
  const children = selectionToFields(dmmf2, {[rootField]: select}, fakeRootField, [rootTypeName]);
  return new Document(rootTypeName, children);
}
function transformDocument(document2) {
  return document2;
}
function selectionToFields(dmmf2, selection, schemaField, path3) {
  const outputType = schemaField.outputType.type;
  return Object.entries(selection).reduce((acc, [name, value]) => {
    const field = outputType.fieldMap ? outputType.fieldMap[name] : outputType.fields.find((f) => f.name === name);
    if (!field) {
      acc.push(new Field({
        name,
        children: [],
        error: {
          type: "invalidFieldName",
          modelName: outputType.name,
          providedName: name,
          didYouMean: getSuggestion(name, outputType.fields.map((f) => f.name)),
          outputType
        }
      }));
      return acc;
    }
    if (typeof value !== "boolean" && field.outputType.kind === "scalar" && field.name !== "executeRaw" && field.name !== "queryRaw" && outputType.name !== "Query" && !name.startsWith("aggregate") && field.name !== "count") {
      acc.push(new Field({
        name,
        children: [],
        error: {
          type: "invalidFieldType",
          modelName: outputType.name,
          fieldName: name,
          providedValue: value
        }
      }));
      return acc;
    }
    if (value === false) {
      return acc;
    }
    const transformedField = {
      name: field.name,
      fields: field.args,
      constraints: {
        minNumFields: null,
        maxNumFields: null
      }
    };
    const argsWithoutIncludeAndSelect = typeof value === "object" ? omit(value, ["include", "select"]) : void 0;
    const args = argsWithoutIncludeAndSelect ? objectToArgs(argsWithoutIncludeAndSelect, transformedField, [], typeof field === "string" ? void 0 : field.outputType.type) : void 0;
    const isRelation = field.outputType.kind === "object";
    if (value) {
      if (value.select && value.include) {
        acc.push(new Field({
          name,
          children: [
            new Field({
              name: "include",
              args: new Args(),
              error: {
                type: "includeAndSelect",
                field
              }
            })
          ]
        }));
      } else if (value.include) {
        const keys2 = Object.keys(value.include);
        if (keys2.length === 0) {
          acc.push(new Field({
            name,
            children: [
              new Field({
                name: "include",
                args: new Args(),
                error: {
                  type: "emptyInclude",
                  field
                }
              })
            ]
          }));
          return acc;
        }
        if (field.outputType.kind === "object") {
          const fieldOutputType = field.outputType.type;
          const allowedKeys = fieldOutputType.fields.filter((f) => f.outputType.kind === "object").map((f) => f.name);
          const invalidKeys = keys2.filter((key) => !allowedKeys.includes(key));
          if (invalidKeys.length > 0) {
            acc.push(...invalidKeys.map((invalidKey) => new Field({
              name: invalidKey,
              children: [
                new Field({
                  name: invalidKey,
                  args: new Args(),
                  error: {
                    type: "invalidFieldName",
                    modelName: fieldOutputType.name,
                    outputType: fieldOutputType,
                    providedName: invalidKey,
                    didYouMean: getSuggestion(invalidKey, allowedKeys) || void 0,
                    isInclude: true,
                    isIncludeScalar: fieldOutputType.fields.some((f) => f.name === invalidKey)
                  }
                })
              ]
            })));
            return acc;
          }
        }
      } else if (value.select) {
        const values = Object.values(value.select);
        if (values.length === 0) {
          acc.push(new Field({
            name,
            children: [
              new Field({
                name: "select",
                args: new Args(),
                error: {
                  type: "emptySelect",
                  field
                }
              })
            ]
          }));
          return acc;
        }
        const truthyValues = values.filter((v) => v);
        if (truthyValues.length === 0) {
          acc.push(new Field({
            name,
            children: [
              new Field({
                name: "select",
                args: new Args(),
                error: {
                  type: "noTrueSelect",
                  field
                }
              })
            ]
          }));
          return acc;
        }
      }
    }
    const defaultSelection = isRelation ? getDefaultSelection(field.outputType.type) : null;
    let select = defaultSelection;
    if (value) {
      if (value.select) {
        select = value.select;
      } else if (value.include) {
        select = deepExtend(defaultSelection, value.include);
      }
    }
    const children = select !== false && isRelation ? selectionToFields(dmmf2, select, field, [...path3, name]) : void 0;
    acc.push(new Field({name, args, children, schemaField: field}));
    return acc;
  }, []);
}
function getDefaultSelection(outputType) {
  return outputType.fields.reduce((acc, f) => {
    if (f.outputType.kind === "scalar" || f.outputType.kind === "enum") {
      acc[f.name] = true;
    } else {
      if (f.outputType.type.isEmbedded) {
        acc[f.name] = {
          select: getDefaultSelection(f.outputType.type)
        };
      }
    }
    return acc;
  }, {});
}
function getInvalidTypeArg(key, value, arg, bestFittingType) {
  const arrg = new Arg({
    key,
    value,
    isEnum: bestFittingType.kind === "enum",
    argType: bestFittingType.type,
    error: {
      type: "invalidType",
      providedValue: value,
      argName: key,
      requiredType: {
        inputType: arg.inputTypes,
        bestFittingType
      }
    }
  });
  return arrg;
}
function hasCorrectScalarType(value, arg, inputType) {
  const {type, isList} = inputType;
  const expectedType = wrapWithList(stringifyGraphQLType(type), isList);
  const graphQLType = getGraphQLType(value, type);
  if (graphQLType === expectedType) {
    return true;
  }
  if (isList && graphQLType === "List<>") {
    return true;
  }
  if (expectedType === "Json") {
    return true;
  }
  if ((graphQLType === "Int" || graphQLType === "Float") && expectedType === "Decimal") {
    return true;
  }
  if ((graphQLType === "List<Int>" || graphQLType === "List<Float>") && expectedType === "List<Decimal>") {
    return true;
  }
  if (graphQLType === "DateTime" && expectedType === "String") {
    return true;
  }
  if (graphQLType === "List<DateTime>" && expectedType === "List<String>") {
    return true;
  }
  if (graphQLType === "UUID" && expectedType === "String") {
    return true;
  }
  if (graphQLType === "List<UUID>" && expectedType === "List<String>") {
    return true;
  }
  if (graphQLType === "String" && expectedType === "ID") {
    return true;
  }
  if (graphQLType === "List<String>" && expectedType === "List<ID>") {
    return true;
  }
  if (expectedType === "List<String>" && (graphQLType === "List<String | UUID>" || graphQLType === "List<UUID | String>")) {
    return true;
  }
  if (graphQLType === "Int" && expectedType === "Float") {
    return true;
  }
  if (graphQLType === "List<Int>" && expectedType === "List<Float>") {
    return true;
  }
  if (graphQLType === "Int" && expectedType === "Long") {
    return true;
  }
  if (graphQLType === "List<Int>" && expectedType === "List<Long>") {
    return true;
  }
  if (graphQLType === "String" && /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(value) && expectedType === "Decimal") {
    return true;
  }
  if (!arg.isRequired && value === null) {
    return true;
  }
  return false;
}
const cleanObject = (obj) => filterObject(obj, (k, v) => v !== void 0);
function valueToArg(key, value, arg) {
  let maybeArg = null;
  for (const inputType of arg.inputTypes) {
    maybeArg = tryInferArgs(key, value, arg, inputType);
    if ((maybeArg == null ? void 0 : maybeArg.collectErrors().length) === 0) {
      return maybeArg;
    }
  }
  return maybeArg;
}
function tryInferArgs(key, value, arg, inputType) {
  if (typeof value === "undefined") {
    if (!arg.isRequired) {
      return null;
    }
    return new Arg({
      key,
      value,
      isEnum: inputType.kind === "enum",
      error: {
        type: "missingArg",
        missingName: key,
        missingArg: arg,
        atLeastOne: false,
        atMostOne: false
      }
    });
  }
  const {isNullable, isRequired} = arg;
  if (value === null && !isNullable && !isRequired) {
    const isAtLeastOne = isInputArgType(inputType.type) ? inputType.type.constraints.minNumFields !== null && inputType.type.constraints.minNumFields > 0 : false;
    if (!isAtLeastOne) {
      return new Arg({
        key,
        value,
        isEnum: inputType.kind === "enum",
        error: {
          type: "invalidNullArg",
          name: key,
          invalidType: arg.inputTypes,
          atLeastOne: false,
          atMostOne: false
        }
      });
    }
  }
  if (!inputType.isList) {
    if (isInputArgType(inputType.type)) {
      if (typeof value !== "object") {
        return getInvalidTypeArg(key, value, arg, inputType);
      } else {
        let val = cleanObject(value);
        let error;
        const keys2 = Object.keys(val || {});
        const numKeys = keys2.length;
        if (numKeys === 0 && (typeof inputType.type.constraints.minNumFields === "number" && inputType.type.constraints.minNumFields > 0)) {
          error = {
            type: "atLeastOne",
            key,
            inputType: inputType.type
          };
        } else if (numKeys > 1 && (typeof inputType.type.constraints.maxNumFields === "number" && inputType.type.constraints.maxNumFields < 2)) {
          error = {
            type: "atMostOne",
            key,
            inputType: inputType.type,
            providedKeys: keys2
          };
        }
        return new Arg({
          key,
          value: val === null ? null : objectToArgs(val, inputType.type, arg.inputTypes),
          isEnum: inputType.kind === "enum",
          error,
          argType: inputType.type,
          schemaArg: arg
        });
      }
    } else {
      return scalarToArg(key, value, arg, inputType);
    }
  }
  if (!Array.isArray(value) && inputType.isList) {
    if (key !== "updateMany") {
      value = [value];
    }
  }
  if (inputType.kind === "enum" || inputType.kind === "scalar") {
    return scalarToArg(key, value, arg, inputType);
  }
  const argInputType = inputType.type;
  const hasAtLeastOneError = typeof argInputType.constraints.minNumFields === "number" && argInputType.constraints.minNumFields > 0 ? Array.isArray(value) && value.some((v) => !v || Object.keys(cleanObject(v)).length === 0) : false;
  let err = hasAtLeastOneError ? {
    inputType: argInputType,
    key,
    type: "atLeastOne"
  } : void 0;
  if (!err) {
    const hasOneOfError = typeof argInputType.constraints.maxNumFields === "number" && argInputType.constraints.maxNumFields < 2 ? Array.isArray(value) && value.find((v) => !v || Object.keys(cleanObject(v)).length !== 1) : false;
    if (hasOneOfError) {
      err = {
        inputType: argInputType,
        key,
        type: "atMostOne",
        providedKeys: Object.keys(hasOneOfError)
      };
    }
  }
  if (!Array.isArray(value)) {
    for (const argInputType2 of arg.inputTypes) {
      const args = objectToArgs(value, argInputType2.type);
      if (args.collectErrors().length === 0) {
        return new Arg({key, value: args, isEnum: false, argType: argInputType2.type, schemaArg: arg});
      }
    }
  }
  return new Arg({
    key,
    value: value.map((v) => {
      if (inputType.isList && typeof v !== "object") {
        return v;
      }
      if (typeof v !== "object" || !value) {
        return getInvalidTypeArg(key, v, arg, inputType);
      }
      return objectToArgs(v, argInputType);
    }),
    isEnum: false,
    argType: argInputType,
    schemaArg: arg,
    error: err
  });
}
function isInputArgType(argType) {
  if (typeof argType === "string") {
    return false;
  }
  if (argType.hasOwnProperty("values")) {
    return false;
  }
  return true;
}
function scalarToArg(key, value, arg, inputType) {
  if (hasCorrectScalarType(value, arg, inputType)) {
    return new Arg({
      key,
      value,
      isEnum: arg.inputTypes[0].kind === "enum",
      argType: inputType.type,
      schemaArg: arg
    });
  }
  return getInvalidTypeArg(key, value, arg, inputType);
}
function objectToArgs(initialObj, inputType, possibilities, outputType) {
  const obj = cleanObject(initialObj);
  const {fields: args, fieldMap} = inputType;
  const requiredArgs = args.map((arg) => [arg.name, void 0]);
  const objEntries = Object.entries(obj || {});
  const entries = unionBy(objEntries, requiredArgs, (a) => a[0]);
  const argsList = entries.reduce((acc, [argName, value]) => {
    const schemaArg = fieldMap ? fieldMap[argName] : args.find((a) => a.name === argName);
    if (!schemaArg) {
      const didYouMeanField = typeof value === "boolean" && outputType && outputType.fields.some((f) => f.name === argName) ? argName : null;
      acc.push(new Arg({
        key: argName,
        value,
        error: {
          type: "invalidName",
          providedName: argName,
          providedValue: value,
          didYouMeanField,
          didYouMeanArg: !didYouMeanField && getSuggestion(argName, [
            ...args.map((a) => a.name),
            "select"
          ]) || void 0,
          originalType: inputType,
          possibilities,
          outputType
        }
      }));
      return acc;
    }
    const arg = valueToArg(argName, value, schemaArg);
    if (arg) {
      acc.push(arg);
    }
    return acc;
  }, []);
  if (typeof inputType.constraints.minNumFields === "number" && objEntries.length < inputType.constraints.minNumFields || argsList.find((arg) => {
    var _a, _b;
    return ((_a = arg.error) == null ? void 0 : _a.type) === "missingArg" || ((_b = arg.error) == null ? void 0 : _b.type) === "atLeastOne";
  })) {
    const optionalMissingArgs = inputType.fields.filter((field) => !field.isRequired && (obj && (typeof obj[field.name] === "undefined" || obj[field.name] === null)));
    argsList.push(...optionalMissingArgs.map((arg) => {
      const argInputType = arg.inputTypes[0];
      return new Arg({
        key: arg.name,
        value: void 0,
        isEnum: argInputType.kind === "enum",
        error: {
          type: "missingArg",
          missingName: arg.name,
          missingArg: arg,
          atLeastOne: Boolean(inputType.constraints.minNumFields) || false,
          atMostOne: inputType.constraints.maxNumFields === 1 || false
        }
      });
    }));
  }
  return new Args(argsList);
}
function unpack({document: document2, path: path3, data}) {
  const result = deepGet(data, path3);
  if (result === "undefined") {
    return null;
  }
  if (typeof result !== "object") {
    return result;
  }
  const field = getField(document2, path3);
  return mapScalars({field, data: result});
}
function mapScalars({field, data}) {
  var _a;
  if (!data || typeof data !== "object" || !field.children || !field.schemaField) {
    return data;
  }
  const deserializers = {
    DateTime: (value) => new Date(value),
    Json: (value) => JSON.parse(value),
    Bytes: (value) => Buffer.from(value, "base64"),
    Decimal: (value) => {
      return new decimal_default(value);
    }
  };
  for (const child of field.children) {
    const outputType = (_a = child.schemaField) == null ? void 0 : _a.outputType.type;
    if (outputType && typeof outputType === "string") {
      const deserializer = deserializers[outputType];
      if (deserializer) {
        if (Array.isArray(data)) {
          for (const entry of data) {
            if (typeof entry[child.name] !== "undefined" && entry[child.name] !== null) {
              if (Array.isArray(entry[child.name])) {
                entry[child.name] = entry[child.name].map(deserializer);
              } else {
                entry[child.name] = deserializer(entry[child.name]);
              }
            }
          }
        } else {
          if (typeof data[child.name] !== "undefined" && data[child.name] !== null) {
            if (Array.isArray(data[child.name])) {
              data[child.name] = data[child.name].map(deserializer);
            } else {
              data[child.name] = deserializer(data[child.name]);
            }
          }
        }
      }
    }
    if (child.schemaField && child.schemaField.outputType.kind === "object") {
      if (Array.isArray(data)) {
        for (const entry of data) {
          mapScalars({field: child, data: entry[child.name]});
        }
      } else {
        mapScalars({field: child, data: data[child.name]});
      }
    }
  }
  return data;
}
function getField(document2, path3) {
  const todo = path3.slice();
  const firstElement = todo.shift();
  let pointer = document2.children.find((c) => c.name === firstElement);
  if (!pointer) {
    throw new Error(`Could not find field ${firstElement} in document ${document2}`);
  }
  while (todo.length > 0) {
    const key = todo.shift();
    if (!pointer.children) {
      throw new Error(`Can't get children for field ${pointer} with child ${key}`);
    }
    const child = pointer.children.find((c) => c.name === key);
    if (!child) {
      throw new Error(`Can't find child ${key} of field ${pointer}`);
    }
    pointer = child;
  }
  return pointer;
}
function removeSelectFromPath(path3) {
  return path3.split(".").filter((p) => p !== "select").join(".");
}
function removeSelectFromObject(obj) {
  const type = Object.prototype.toString.call(obj);
  if (type === "[object Object]") {
    const copy = {};
    for (const key in obj) {
      if (key === "select") {
        for (const subKey in obj["select"]) {
          copy[subKey] = removeSelectFromObject(obj["select"][subKey]);
        }
      } else {
        copy[key] = removeSelectFromObject(obj[key]);
      }
    }
    return copy;
  }
  return obj;
}
function transformAggregatePrintJsonArgs({
  ast,
  keyPaths,
  missingItems,
  valuePaths
}) {
  const newKeyPaths = keyPaths.map(removeSelectFromPath);
  const newValuePaths = valuePaths.map(removeSelectFromPath);
  const newMissingItems = missingItems.map((item) => ({
    path: removeSelectFromPath(item.path),
    isRequired: item.isRequired,
    type: item.type
  }));
  const newAst = removeSelectFromObject(ast);
  return {
    ast: newAst,
    keyPaths: newKeyPaths,
    missingItems: newMissingItems,
    valuePaths: newValuePaths
  };
}

// src/runtime/getPrismaClient.ts
const path = __toModule(require("path"));
const _ = __toModule(require_runtime());
const NodeEngine = __toModule(require_NodeEngine());
const debug = __toModule(require_dist2());
const fs = __toModule(require("fs"));
const chalk11 = __toModule(require_source());
const sqlTemplateTag = __toModule(require_dist6());
const dotenv = __toModule(require_main2());
const dotenvExpand = __toModule(require_dotenvExpand());

// src/runtime/getLogLevel.ts
function getLogLevel(log3) {
  if (typeof log3 === "string") {
    return log3;
  }
  return log3.reduce((acc, curr) => {
    const currentLevel = typeof curr === "string" ? curr : curr.level;
    if (currentLevel === "query") {
      return acc;
    }
    if (!acc) {
      return currentLevel;
    }
    if (curr === "info" || acc === "info") {
      return "info";
    }
    return currentLevel;
  }, void 0);
}

// src/runtime/mergeBy.ts
function mergeBy(arr1, arr2, cb) {
  const groupedArr1 = groupBy(arr1, cb);
  const groupedArr2 = groupBy(arr2, cb);
  const result = Object.values(groupedArr2).map((value) => value[value.length - 1]);
  const arr2Keys = Object.keys(groupedArr2);
  Object.entries(groupedArr1).forEach(([key, value]) => {
    if (!arr2Keys.includes(key)) {
      result.push(value[value.length - 1]);
    }
  });
  return result;
}
const groupBy = (arr, cb) => {
  return arr.reduce((acc, curr) => {
    const key = cb(curr);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});
};

// src/runtime/Dataloader.ts
class Dataloader {
  constructor(options) {
    this.options = options;
    this.tickActive = false;
    this.batches = {};
  }
  request(request) {
    const hash = this.options.batchBy(request);
    if (!hash) {
      return this.options.singleLoader(request);
    }
    if (!this.batches[hash]) {
      this.batches[hash] = [];
      if (!this.tickActive) {
        this.tickActive = true;
        process.nextTick(() => {
          this.dispatchBatches();
          this.tickActive = false;
        });
      }
    }
    return new Promise((resolve, reject) => {
      this.batches[hash].push({
        request,
        resolve,
        reject
      });
    });
  }
  dispatchBatches() {
    for (const key in this.batches) {
      const batch = this.batches[key];
      delete this.batches[key];
      if (batch.length === 1) {
        this.options.singleLoader(batch[0].request).then((result) => {
          if (result instanceof Error) {
            batch[0].reject(result);
          } else {
            batch[0].resolve(result);
          }
        }).catch((e) => {
          batch[0].reject(e);
        });
      } else {
        this.options.batchLoader(batch.map((j) => j.request)).then((results) => {
          if (results instanceof Error) {
            for (let i = 0; i < batch.length; i++) {
              batch[i].reject(results);
            }
          } else {
            for (let i = 0; i < batch.length; i++) {
              const value = results[i];
              if (value instanceof Error) {
                batch[i].reject(value);
              } else {
                batch[i].resolve(value);
              }
            }
          }
        }).catch((e) => {
          for (let i = 0; i < batch.length; i++) {
            batch[i].reject(e);
          }
        });
      }
    }
  }
}

// src/runtime/getPrismaClient.ts
const strip_ansi3 = __toModule(require_strip_ansi());
const mapPreviewFeatures = __toModule(require_mapPreviewFeatures());

// src/runtime/utils/serializeRawParameters.ts
function serializeRawParameters(data) {
  return JSON.stringify(replaceDates(data));
}
function replaceDates(data) {
  const type = Object.prototype.toString.call(data);
  if (type === "[object Date]") {
    return {
      prisma__type: "date",
      prisma__value: data.toJSON()
    };
  }
  if (type === "[object Object]") {
    const tmp = {};
    for (let key in data) {
      if (key !== "__proto__") {
        tmp[key] = replaceDates(data[key]);
      }
    }
    return tmp;
  }
  if (type === "[object Array]") {
    let k = data.length;
    let tmp;
    for (tmp = new Array(k); k--; ) {
      tmp[k] = replaceDates(data[k]);
    }
    return tmp;
  }
  return data;
}

// src/runtime/getPrismaClient.ts
const async_hooks = __toModule(require("async_hooks"));

// src/runtime/utils/clientVersion.ts
const clientVersion = require_package2().version;

// src/runtime/utils/mssqlPreparedStatement.ts
const mssqlPreparedStatement = (template) => {
  return template.reduce((acc, str, idx) => `${acc}@P${idx}${str}`);
};

// src/runtime/getPrismaClient.ts
const debug2 = debug.default("prisma-client");
const actionOperationMap = {
  findOne: "query",
  findFirst: "query",
  findMany: "query",
  count: "query",
  create: "mutation",
  update: "mutation",
  updateMany: "mutation",
  upsert: "mutation",
  delete: "mutation",
  deleteMany: "mutation",
  executeRaw: "mutation",
  queryRaw: "mutation",
  aggregate: "query"
};
const aggregateKeys = {
  avg: true,
  count: true,
  sum: true,
  min: true,
  max: true
};
function getPrismaClient(config2) {
  class NewPrismaClient {
    constructor(optionsArg) {
      this._middlewares = [];
      this._engineMiddlewares = [];
      var _a, _b, _c, _d, _e, _f;
      this._clientVersion = (_a = config2.clientVersion) != null ? _a : clientVersion;
      try {
        const options = optionsArg != null ? optionsArg : {};
        const internal = (_b = options.__internal) != null ? _b : {};
        const useDebug = internal.debug === true;
        if (useDebug) {
          debug.default.enable("prisma-client");
        }
        if (internal.hooks) {
          this._hooks = internal.hooks;
        }
        let predefinedDatasources = (_c = config2.sqliteDatasourceOverrides) != null ? _c : [];
        predefinedDatasources = predefinedDatasources.map((d) => ({
          name: d.name,
          url: "file:" + path.default.resolve(config2.dirname, d.url)
        }));
        const inputDatasources = Object.entries(options.datasources || {}).filter(([_2, source]) => {
          return source && source.url;
        }).map(([name, {url}]) => ({name, url}));
        const datasources = mergeBy(predefinedDatasources, inputDatasources, (source) => source.name);
        const engineConfig = internal.engine || {};
        if (options.errorFormat) {
          this._errorFormat = options.errorFormat;
        } else if (process.env.NODE_ENV === "production") {
          this._errorFormat = "minimal";
        } else if (process.env.NO_COLOR) {
          this._errorFormat = "colorless";
        } else {
          this._errorFormat = "colorless";
        }
        const envFile = this.readEnv();
        this._dmmf = new DMMFClass(config2.document);
        let cwd = path.default.resolve(config2.dirname, config2.relativePath);
        if (!fs.default.existsSync(cwd)) {
          cwd = config2.dirname;
        }
        const previewFeatures = (_e = (_d = config2.generator) == null ? void 0 : _d.previewFeatures) != null ? _e : [];
        this._engineConfig = {
          cwd,
          enableDebugLogs: useDebug,
          enableEngineDebugMode: engineConfig.enableEngineDebugMode,
          datamodelPath: path.default.join(config2.dirname, "schema.prisma"),
          prismaPath: (_f = engineConfig.binaryPath) != null ? _f : void 0,
          engineEndpoint: engineConfig.endpoint,
          datasources,
          generator: config2.generator,
          showColors: this._errorFormat === "pretty",
          logLevel: options.log && getLogLevel(options.log),
          logQueries: options.log && Boolean(typeof options.log === "string" ? options.log === "query" : options.log.find((o) => typeof o === "string" ? o === "query" : o.level === "query")),
          env: envFile,
          flags: [],
          clientVersion: config2.clientVersion,
          enableExperimental: mapPreviewFeatures.mapPreviewFeatures(previewFeatures),
          useUds: internal.useUds
        };
        const sanitizedEngineConfig = omit(this._engineConfig, [
          "env",
          "datasources"
        ]);
        debug2({engineConfig: sanitizedEngineConfig});
        this._engine = new NodeEngine.NodeEngine(this._engineConfig);
        this._fetcher = new PrismaClientFetcher(this, false, this._hooks);
        if (options.log) {
          for (const log3 of options.log) {
            const level = typeof log3 === "string" ? log3 : log3.emit === "stdout" ? log3.level : null;
            if (level) {
              this.$on(level, (event) => {
                const colorMap = {
                  query: "blue",
                  info: "cyan",
                  warn: "yellow",
                  error: "red"
                };
                console.error(chalk11.default[colorMap[level]](`prisma:${level}`.padEnd(13)) + (event.message || event.query));
              });
            }
          }
        }
        this._bootstrapClient();
      } catch (e) {
        e.clientVersion = this._clientVersion;
        throw e;
      }
    }
    readEnv() {
      const dotEnvPath = path.default.resolve(config2.dirname, config2.relativePath, ".env");
      if (fs.default.existsSync(dotEnvPath)) {
        return dotenvExpand.dotenvExpand(dotenv.default.config({path: dotEnvPath})).parsed;
      }
      return {};
    }
    use(...args) {
      console.warn(`${chalk11.default.yellow("warn")} prisma.use() is deprecated, please use prisma.$use() instead`);
      return this.$use(...args);
    }
    $use(namespace, cb) {
      if (typeof namespace === "function") {
        this._middlewares.push(namespace);
      } else if (typeof namespace === "string") {
        if (namespace === "all") {
          this._middlewares.push(cb);
        } else if (namespace === "engine") {
          this._engineMiddlewares.push(cb);
        } else {
          throw new Error(`Unknown middleware hook ${namespace}`);
        }
      } else {
        throw new Error(`Invalid middleware ${namespace}`);
      }
    }
    on(eventType, callback) {
      console.warn(`${chalk11.default.yellow("warn")} prisma.on() is deprecated, please use prisma.$on() instead`);
      return this.$on(eventType, callback);
    }
    $on(eventType, callback) {
      if (eventType === "beforeExit") {
        this._engine.on("beforeExit", callback);
      } else {
        this._engine.on(eventType, (event) => {
          const fields = event.fields;
          if (eventType === "query") {
            return callback({
              timestamp: event.timestamp,
              query: fields.query,
              params: fields.params,
              duration: fields.duration_ms,
              target: event.target
            });
          } else {
            return callback({
              timestamp: event.timestamp,
              message: fields.message,
              target: event.target
            });
          }
        });
      }
    }
    connect() {
      console.warn(`${chalk11.default.yellow("warn")} prisma.connect() is deprecated, please use prisma.$connect() instead`);
      return this.$connect();
    }
    async $connect() {
      try {
        return this._engine.start();
      } catch (e) {
        e.clientVersion = this._clientVersion;
        throw e;
      }
    }
    async _runDisconnect() {
      await this._engine.stop();
      delete this._connectionPromise;
      this._engine = new NodeEngine.NodeEngine(this._engineConfig);
      delete this._disconnectionPromise;
      delete this._getConfigPromise;
    }
    disconnect() {
      console.warn(`${chalk11.default.yellow("warn")} prisma.disconnect() is deprecated, please use prisma.$disconnect() instead`);
      return this.$disconnect();
    }
    async $disconnect() {
      try {
        return this._engine.stop();
      } catch (e) {
        e.clientVersion = this._clientVersion;
        throw e;
      }
    }
    async _getActiveProvider() {
      const configResult = await this._engine.getConfig();
      return configResult.datasources[0].activeProvider;
    }
    executeRaw(stringOrTemplateStringsArray, ...values) {
      console.warn(`${chalk11.default.yellow("warn")} prisma.executeRaw() is deprecated, please use prisma.$executeRaw() instead`);
      return this.$executeRaw(stringOrTemplateStringsArray, ...values);
    }
    async $executeRawInternal(stringOrTemplateStringsArray, ...values) {
      let query2 = "";
      let parameters = void 0;
      const activeProvider = await this._getActiveProvider();
      if (typeof stringOrTemplateStringsArray === "string") {
        query2 = stringOrTemplateStringsArray;
        parameters = {
          values: serializeRawParameters(values || []),
          __prismaRawParamaters__: true
        };
      } else if (Array.isArray(stringOrTemplateStringsArray)) {
        switch (activeProvider) {
          case "sqlite":
          case "mysql": {
            let queryInstance = sqlTemplateTag.sqltag(stringOrTemplateStringsArray, ...values);
            query2 = queryInstance.sql;
            parameters = {
              values: serializeRawParameters(queryInstance.values),
              __prismaRawParamaters__: true
            };
            break;
          }
          case "postgresql": {
            let queryInstance = sqlTemplateTag.sqltag(stringOrTemplateStringsArray, ...values);
            query2 = queryInstance.text;
            parameters = {
              values: serializeRawParameters(queryInstance.values),
              __prismaRawParamaters__: true
            };
            break;
          }
          case "sqlserver": {
            query2 = mssqlPreparedStatement(stringOrTemplateStringsArray);
            parameters = {
              values: serializeRawParameters(values),
              __prismaRawParamaters__: true
            };
            break;
          }
        }
      } else {
        switch (activeProvider) {
          case "sqlite":
          case "mysql":
            query2 = stringOrTemplateStringsArray.sql;
            break;
          case "postgresql":
            query2 = stringOrTemplateStringsArray.text;
            break;
          case "sqlserver":
            query2 = mssqlPreparedStatement(stringOrTemplateStringsArray.strings);
            break;
        }
        parameters = {
          values: serializeRawParameters(stringOrTemplateStringsArray.values),
          __prismaRawParamaters__: true
        };
      }
      if (parameters == null ? void 0 : parameters.values) {
        debug2(`prisma.$executeRaw(${query2}, ${parameters.values})`);
      } else {
        debug2(`prisma.$executeRaw(${query2})`);
      }
      const args = {query: query2, parameters};
      debug2(`Prisma Client call:`);
      return this._request({
        args,
        clientMethod: "executeRaw",
        dataPath: [],
        action: "executeRaw",
        callsite: this._getCallsite(),
        runInTransaction: false
      });
    }
    $executeRaw(stringOrTemplateStringsArray, ...values) {
      try {
        const promise = this.$executeRawInternal(stringOrTemplateStringsArray, ...values);
        promise.isExecuteRaw = true;
        return promise;
      } catch (e) {
        e.clientVersion = this._clientVersion;
        throw e;
      }
    }
    _getCallsite() {
      if (this._errorFormat !== "minimal") {
        return new Error().stack;
      }
      return void 0;
    }
    queryRaw(stringOrTemplateStringsArray, ...values) {
      console.warn(`${chalk11.default.yellow("warn")} prisma.queryRaw() is deprecated, please use prisma.$queryRaw() instead`);
      return this.$queryRaw(stringOrTemplateStringsArray, ...values);
    }
    async $queryRawInternal(stringOrTemplateStringsArray, ...values) {
      let query2 = "";
      let parameters = void 0;
      const activeProvider = await this._getActiveProvider();
      if (typeof stringOrTemplateStringsArray === "string") {
        query2 = stringOrTemplateStringsArray;
        parameters = {
          values: serializeRawParameters(values || []),
          __prismaRawParamaters__: true
        };
      } else if (Array.isArray(stringOrTemplateStringsArray)) {
        switch (activeProvider) {
          case "sqlite":
          case "mysql": {
            let queryInstance = sqlTemplateTag.sqltag(stringOrTemplateStringsArray, ...values);
            query2 = queryInstance.sql;
            parameters = {
              values: serializeRawParameters(queryInstance.values),
              __prismaRawParamaters__: true
            };
            break;
          }
          case "postgresql": {
            let queryInstance = sqlTemplateTag.sqltag(stringOrTemplateStringsArray, ...values);
            query2 = queryInstance.text;
            parameters = {
              values: serializeRawParameters(queryInstance.values),
              __prismaRawParamaters__: true
            };
            break;
          }
          case "sqlserver": {
            query2 = mssqlPreparedStatement(stringOrTemplateStringsArray);
            parameters = {
              values: serializeRawParameters(values),
              __prismaRawParamaters__: true
            };
            break;
          }
        }
      } else {
        switch (activeProvider) {
          case "sqlite":
          case "mysql":
            query2 = stringOrTemplateStringsArray.sql;
            break;
          case "postgresql":
            query2 = stringOrTemplateStringsArray.text;
            break;
          case "sqlserver":
            query2 = mssqlPreparedStatement(stringOrTemplateStringsArray.strings);
            break;
        }
        parameters = {
          values: serializeRawParameters(stringOrTemplateStringsArray.values),
          __prismaRawParamaters__: true
        };
      }
      if (parameters == null ? void 0 : parameters.values) {
        debug2(`prisma.queryRaw(${query2}, ${parameters.values})`);
      } else {
        debug2(`prisma.queryRaw(${query2})`);
      }
      const args = {query: query2, parameters};
      debug2(`Prisma Client call:`);
      return this._request({
        args,
        clientMethod: "queryRaw",
        dataPath: [],
        action: "queryRaw",
        callsite: this._getCallsite(),
        runInTransaction: false
      });
    }
    $queryRaw(stringOrTemplateStringsArray, ...values) {
      try {
        const promise = this.$queryRawInternal(stringOrTemplateStringsArray, ...values);
        promise.isQueryRaw = true;
        return promise;
      } catch (e) {
        e.clientVersion = this._clientVersion;
        throw e;
      }
    }
    async __internal_triggerPanic(fatal) {
      if (!this._engineConfig.enableEngineDebugMode) {
        throw new Error(`In order to use .__internal_triggerPanic(), please enable the debug mode like so:
new PrismaClient({
  __internal: {
    engine: {
      enableEngineDebugMode: true
    }
  }
})`);
      }
      const query2 = "SELECT 1";
      const headers = fatal ? {"X-DEBUG-FATAL": "1"} : {"X-DEBUG-NON-FATAL": "1"};
      return this._request({
        action: "queryRaw",
        args: {
          query: query2,
          parameters: void 0
        },
        clientMethod: "queryRaw",
        dataPath: [],
        runInTransaction: false,
        headers,
        callsite: this._getCallsite()
      });
    }
    transaction(promises) {
      console.warn(`${chalk11.default.yellow("warn")} prisma.transaction() is deprecated, please use prisma.$transaction() instead`);
      return this.$transaction(promises);
    }
    async $transactionInternal(promises) {
      var _a, _b;
      if ((_b = (_a = config2.generator) == null ? void 0 : _a.previewFeatures) == null ? void 0 : _b.includes("transactionApi")) {
        for (const p of promises) {
          if (!p) {
            throw new Error(`All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.`);
          }
          if ((!p.requestTransaction || typeof p.requestTransaction !== "function") && (!(p == null ? void 0 : p.isQueryRaw) && !(p == null ? void 0 : p.isExecuteRaw))) {
            throw new Error(`All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.`);
          }
        }
        return Promise.all(promises.map((p) => {
          if (p.requestTransaction) {
            return p.requestTransaction();
          }
          return p;
        }));
      } else {
        throw new Error(`In order to use the .transaction() api, please enable 'previewFeatures = "transactionApi" in your schema.`);
      }
    }
    async $transaction(promises) {
      try {
        return this.$transactionInternal(promises);
      } catch (e) {
        e.clientVersion = this._clientVersion;
        throw e;
      }
    }
    _request(internalParams) {
      try {
        const resource = new async_hooks.AsyncResource("prisma-client-request");
        if (this._middlewares.length > 0) {
          const params = {
            args: internalParams.args,
            dataPath: internalParams.dataPath,
            runInTransaction: internalParams.runInTransaction,
            action: internalParams.action,
            model: internalParams.model
          };
          return resource.runInAsyncScope(() => this._requestWithMiddlewares(params, this._middlewares.slice(), internalParams.clientMethod, internalParams.callsite, internalParams.headers));
        }
        return resource.runInAsyncScope(() => this._executeRequest(internalParams));
      } catch (e) {
        e.clientVersion = this._clientVersion;
        throw e;
      }
    }
    _requestWithMiddlewares(params, middlewares, clientMethod, callsite, headers) {
      const middleware = middlewares.shift();
      if (middleware) {
        return middleware(params, (params2) => this._requestWithMiddlewares(params2, middlewares, clientMethod, callsite));
      }
      ;
      params.clientMethod = clientMethod;
      params.callsite = callsite;
      params.headers = headers;
      return this._executeRequest(params);
    }
    _executeRequest({
      args,
      clientMethod,
      dataPath,
      callsite,
      runInTransaction,
      action,
      model,
      headers
    }) {
      if (action !== "executeRaw" && action !== "queryRaw" && !model) {
        throw new Error(`Model missing for action ${action}`);
      }
      if ((action === "executeRaw" || action === "queryRaw") && model) {
        throw new Error(`executeRaw and queryRaw can't be executed on a model basis. The model ${model} has been provided`);
      }
      let rootField;
      const operation = actionOperationMap[action];
      if (action === "executeRaw" || action === "queryRaw") {
        rootField = action;
      }
      let mapping;
      if (model) {
        mapping = this._dmmf.mappingsMap[model];
        if (!mapping) {
          throw new Error(`Could not find mapping for model ${model}`);
        }
        rootField = mapping[action];
      }
      if (operation !== "query" && operation !== "mutation") {
        throw new Error(`Invalid operation ${operation} for action ${action}`);
      }
      const field = this._dmmf.rootFieldMap[rootField];
      if (!field) {
        throw new Error(`Could not find rootField ${rootField} for action ${action} for model ${model} on rootType ${operation}`);
      }
      const {isList} = field.outputType;
      const typeName = getOutputTypeName(field.outputType.type);
      let document2 = makeDocument({
        dmmf: this._dmmf,
        rootField,
        rootTypeName: operation,
        select: args
      });
      document2.validate(args, false, clientMethod, this._errorFormat, callsite);
      document2 = transformDocument(document2);
      if (debug.default.enabled("prisma-client")) {
        const query2 = String(document2);
        debug2(`Prisma Client call:`);
        debug2(`prisma.${clientMethod}(${printJsonWithErrors({
          ast: args,
          keyPaths: [],
          valuePaths: [],
          missingItems: []
        })})`);
        debug2(`Generated request:`);
        debug2(query2 + "\n");
      }
      return this._fetcher.request({
        document: document2,
        clientMethod,
        typeName,
        dataPath,
        isList,
        rootField,
        callsite,
        showColors: this._errorFormat === "pretty",
        args,
        engineHook: this._engineMiddlewares[0],
        runInTransaction,
        headers
      });
    }
    _bootstrapClient() {
      const clients = this._dmmf.mappings.modelOperations.reduce((acc, mapping) => {
        const lowerCaseModel = lowerCase(mapping.model);
        const model = this._dmmf.modelMap[mapping.model];
        if (!model) {
          throw new Error(`Invalid mapping ${mapping.model}, can't find model`);
        }
        const prismaClient = ({
          operation,
          actionName,
          args,
          dataPath,
          modelName
        }) => {
          dataPath = dataPath != null ? dataPath : [];
          const clientMethod = `${lowerCaseModel}.${actionName}`;
          let requestPromise;
          const callsite = this._getCallsite();
          const requestModelName = modelName != null ? modelName : model.name;
          const clientImplementation = {
            then: (onfulfilled, onrejected) => {
              if (!requestPromise) {
                requestPromise = this._request({
                  args,
                  dataPath,
                  action: actionName,
                  model: requestModelName,
                  clientMethod,
                  callsite,
                  runInTransaction: false
                });
              }
              return requestPromise.then(onfulfilled, onrejected);
            },
            requestTransaction: () => {
              if (!requestPromise) {
                requestPromise = this._request({
                  args,
                  dataPath,
                  action: actionName,
                  model: requestModelName,
                  clientMethod,
                  callsite,
                  runInTransaction: true
                });
              }
              return requestPromise;
            },
            catch: (onrejected) => {
              if (!requestPromise) {
                requestPromise = this._request({
                  args,
                  dataPath,
                  action: actionName,
                  model: requestModelName,
                  clientMethod,
                  callsite,
                  runInTransaction: false
                });
              }
              return requestPromise.catch(onrejected);
            },
            finally: (onfinally) => {
              if (!requestPromise) {
                requestPromise = this._request({
                  args,
                  dataPath,
                  action: actionName,
                  model: requestModelName,
                  clientMethod,
                  callsite,
                  runInTransaction: false
                });
              }
              return requestPromise.finally(onfinally);
            }
          };
          for (const field of model.fields.filter((f) => f.kind === "object")) {
            clientImplementation[field.name] = (fieldArgs) => {
              const prefix = dataPath.includes("select") ? "select" : dataPath.includes("include") ? "include" : "select";
              const newDataPath = [...dataPath, prefix, field.name];
              const newArgs = deepSet(args, newDataPath, fieldArgs || true);
              return clients[field.type]({
                operation,
                actionName,
                args: newArgs,
                dataPath: newDataPath,
                isList: field.isList,
                modelName: modelName || model.name
              });
            };
          }
          return clientImplementation;
        };
        acc[model.name] = prismaClient;
        return acc;
      }, {});
      for (const mapping of this._dmmf.mappings.modelOperations) {
        const lowerCaseModel = lowerCase(mapping.model);
        const denyList = {
          model: true,
          plural: true,
          aggregate: true
        };
        const delegate = Object.entries(mapping).reduce((acc, [actionName, rootField]) => {
          if (!denyList[actionName]) {
            const operation = getOperation(actionName);
            acc[actionName] = (args) => clients[mapping.model]({
              operation,
              actionName,
              args
            });
          }
          return acc;
        }, {});
        delegate.count = (args) => {
          return clients[mapping.model]({
            operation: "query",
            actionName: `aggregate`,
            args: args ? {
              ...args,
              select: {count: true}
            } : void 0,
            dataPath: ["count"]
          });
        };
        delegate.aggregate = (args) => {
          const select = Object.entries(args).reduce((acc, [key, value]) => {
            if (aggregateKeys[key]) {
              if (!acc.select) {
                acc.select = {};
              }
              if (key === "count") {
                acc.select[key] = value;
              } else {
                acc.select[key] = {select: value};
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {});
          return clients[mapping.model]({
            operation: "query",
            actionName: "aggregate",
            rootField: mapping.aggregate,
            args: select,
            dataPath: []
          });
        };
        this[lowerCaseModel] = delegate;
      }
    }
  }
  return NewPrismaClient;
}
class PrismaClientFetcher {
  constructor(prisma, enableDebug = false, hooks) {
    this.prisma = prisma;
    this.debug = enableDebug;
    this.hooks = hooks;
    this.dataloader = new Dataloader({
      batchLoader: async (requests) => {
        const queries = requests.map((r) => String(r.document));
        const runTransaction = requests[0].runInTransaction;
        return this.prisma._engine.requestBatch(queries, runTransaction);
      },
      singleLoader: async (request) => {
        const query2 = String(request.document);
        return this.prisma._engine.request(query2, request.headers);
      },
      batchBy: (request) => {
        var _a;
        if (request.runInTransaction) {
          return "transaction-batch";
        }
        if (!request.document.children[0].name.startsWith("findOne")) {
          return null;
        }
        const selectionSet = request.document.children[0].children.join(",");
        const args = (_a = request.document.children[0].args) == null ? void 0 : _a.args.map((a) => {
          if (a.value instanceof Args) {
            return a.key + "-" + a.value.args.map((a2) => a2.key).join(",");
          }
          return a.key;
        }).join(",");
        return `${request.document.children[0].name}|${args}|${selectionSet}`;
      }
    });
  }
  async request({
    document: document2,
    dataPath = [],
    rootField,
    typeName,
    isList,
    callsite,
    clientMethod,
    runInTransaction,
    showColors,
    engineHook,
    args,
    headers
  }) {
    if (this.hooks && this.hooks.beforeRequest) {
      const query2 = String(document2);
      this.hooks.beforeRequest({
        query: query2,
        path: dataPath,
        rootField,
        typeName,
        document: document2,
        isList,
        clientMethod,
        args
      });
    }
    try {
      let data, elapsed;
      if (engineHook) {
        const result = await engineHook({
          document: document2,
          runInTransaction
        }, (params) => this.dataloader.request(params));
        data = result.data;
        elapsed = result.elapsed;
      } else {
        const result = await this.dataloader.request({
          document: document2,
          runInTransaction,
          headers
        });
        data = result.data;
        elapsed = result.elapsed;
      }
      const unpackResult = this.unpack(document2, data, dataPath, rootField);
      if (process.env.PRISMA_CLIENT_GET_TIME) {
        return {data: unpackResult, elapsed};
      }
      return unpackResult;
    } catch (e) {
      debug2(e);
      let message = e.message;
      if (callsite) {
        const {stack} = printStack({
          callsite,
          originalMethod: clientMethod,
          onUs: e.isPanic,
          showColors
        });
        message = stack + "\n  " + e.message;
      }
      message = this.sanitizeMessage(message);
      if (e.code) {
        throw new _.PrismaClientKnownRequestError(message, e.code, this.prisma._clientVersion, e.meta);
      } else if (e.isPanic) {
        throw new _.PrismaClientRustPanicError(message, this.prisma._clientVersion);
      } else if (e instanceof _.PrismaClientUnknownRequestError) {
        throw new _.PrismaClientUnknownRequestError(message, this.prisma._clientVersion);
      } else if (e instanceof _.PrismaClientInitializationError) {
        throw new _.PrismaClientInitializationError(message, this.prisma._clientVersion);
      } else if (e instanceof _.PrismaClientRustPanicError) {
        throw new _.PrismaClientRustPanicError(message, this.prisma._clientVersion);
      }
      e.clientVersion = this.prisma._clientVersion;
      throw e;
    }
  }
  sanitizeMessage(message) {
    if (this.prisma._errorFormat && this.prisma._errorFormat !== "pretty") {
      return strip_ansi3.default(message);
    }
    return message;
  }
  unpack(document2, data, path3, rootField) {
    if (data.data) {
      data = data.data;
    }
    const getPath = [];
    if (rootField) {
      getPath.push(rootField);
    }
    getPath.push(...path3.filter((p) => p !== "select" && p !== "include"));
    return unpack({document: document2, data, path: getPath});
  }
}
function getOperation(action) {
  if (action === generator_helper.DMMF.ModelAction.findMany || action === generator_helper.DMMF.ModelAction.findOne || action === generator_helper.DMMF.ModelAction.findFirst) {
    return "query";
  }
  return "mutation";
}
module.exports = require_runtime();
