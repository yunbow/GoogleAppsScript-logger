let log = {}; {
    const config = {
        SSID_LOG: '*****', // ログ用のスプレッドシートのID
        SSN_LOG: '*****', // ログ用のスプレッドシートのシート名
        IS_LOGFILE: true, // ログフラグ true=ログファイル出力あり/false=なし
        LOG_LEVEL: 3, // ログレベル 0=ERROR/1=WARN/2=INFO/3=DEBUG
    };

    const logLevel = { // ログレベル
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
    };

    let spreadsheet = SpreadsheetApp.openById(config.SSID_LOG);
    let sheet = spreadsheet.getSheetByName(config.SSN_LOG);

    /**
     * 初期化
     */
    log.init = () => {
        if (config.IS_LOGFILE) {
            overrideConsole();
        }
    }

    /**
     * console関数を上書きする
     */
    let overrideConsole = () => {
        console = {};
        console.error = (...args) => {
            if (logLevel.ERROR <= config.LOG_LEVEL) {
                out('ERROR', args);
            }
        }
        console.warn = (...args) => {
            if (logLevel.WARN <= config.LOG_LEVEL) {
                out('WARN', args);
            }
        }
        console.info = (...args) => {
            if (logLevel.INFO <= config.LOG_LEVEL) {
                out('INFO', args);
            }
        }
        console.debug = (...args) => {
            if (logLevel.DEBUG <= config.LOG_LEVEL) {
                out('DEBUG', args);
            }
        }
        console.log = (...args) => {
            if (logLevel.DEBUG <= config.LOG_LEVEL) {
                out('DEBUG', args);
            }
        }
        console.ws = null;
    }

    /**
     * ログを出力する
     * @param {String} level ログレベル
     * @param {String} msg メッセージ
     */
    let out = (level, msg) => {

        let callerInfo = {};
        let tmpPrepareST = Error.prepareStackTrace;
        Error.prepareStackTrace = (e, stack) => {
            let caller = stack[1];
            return {
                file: caller.getFileName(),
                line: caller.getLineNumber(),    
            }
        };
        Error.captureStackTrace(callerInfo, out);
        let file = callerInfo.stack.file;
        let line = callerInfo.stack.line;
        Error.prepareStackTrace = tmpPrepareST;

        let timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss:SSS');
        let message = convertMsg(msg);

        sheet.appendRow([timestamp, level, `${file}(${line})`, message]);
    }

    /**
     * ログメッセージを変換する
     * @param {Array} arg メッセージ
     */
    let convertMsg = (arg) => {
        let msg = '';
        for (let i = 0; i < arg.length; i++) {
            msg += ' ' + dumpObject(arg[i]);
        }
        return msg;
    }

    /**
     * オブジェクトを出力する
     * @param {Object} obj 
     */
    let dumpObject = (obj) => {
        let v = '';
        let t = typeof obj;
        switch (t) {
            case 'number':
            case 'boolean':
                v = obj;
                break;
            case 'string':
                v = '"' + obj + '"';
                break;
            case 'object':
                if (isArray(obj)) {
                    v = '[';
                    let count = 0;
                    for (let value of obj) {
                        v += dumpObject(value);
                        count++;
                        if (count < obj.length) {
                            v += ',';
                        }
                    }
                    v += ']';
                } else if (isObject(obj) || isError(obj)) {
                    v = '{';
                    let count = 0;
                    let nameList = Object.getOwnPropertyNames(obj);
                    for (let key of nameList) {
                        let ret = dumpObject(obj[key]);
                        if (ret) {
                            v += key + ':' + ret;
                            count++;
                            if (count < nameList.length) {
                                v += ',';
                            }
                        }
                    }
                    v += '}';
                } else if (isString(obj) || isDate(obj)) {
                    v = '"' + obj.toString() + '"';
                } else if (isNumber(obj) || isBoolean(obj)) {
                    v = obj.valueOf();
                }
                break;
        }
        return v;
    }

    let isArray = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    let isBoolean = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Boolean]';
    }

    let isDate = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    let isError = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Error]';
    }

    let isNumber = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Number]';
    }

    let isObject = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    let isString = (obj) => {
        return Object.prototype.toString.call(obj) === '[object String]';
    }
}
log.init();