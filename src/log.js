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
            let t = typeof arg[i];
            switch (t) {
                case 'number':
                case 'boolean':
                case 'string':
                    t = arg[i];
                    break;
                case 'object':
                    if (isArray(arg[i])) {
                        t = '[';
                        let count = 0;
                        for (let p in arg[i]) {
                            t += dumpObject(arg[i][p]);
                            count++;
                            if (count < arg[i].length) {
                                t += ',';
                            }
                        }
                        t += ']';
                    } else {
                        t = '{';
                        let count = 0;
                        let objLen = Object.keys(arg[i]).length;
                        for (let p in arg[i]) {
                            t += p + ':' + dumpObject(arg[i][p]);
                            count++;
                            if (count < objLen) {
                                t += ',';
                            }
                        }
                        t += '}';
                    }
                    break;
            }
            msg += ' ' + t;
        }
        return msg;
    }

    /**
     * オブジェクトを出力する
     * @param {Object} obj 
     */
    let dumpObject = (obj) => {
        let t = typeof obj;
        switch (t) {
            case 'number':
            case 'boolean':
                t = obj;
                break;
            case 'string':
                t = '"' + obj + '"';
                break;
            case 'object':
                if (isArray(obj)) {
                    t = '[';
                    let count = 0;
                    for (let p in obj) {
                        t += dumpObject(obj[p]);
                        count++;
                        if (count < obj.length) {
                            t += ',';
                        }
                    }
                    t += ']';
                } else {
                    t = '{';
                    let count = 0;
                    let objLen = Object.keys(obj).length;
                    for (let p in obj) {
                        t += p + ':' + dumpObject(obj[p]);
                        count++;
                        if (count < objLen) {
                            t += ',';
                        }
                    }
                    t += '}';
                }
                break;
        }
        return t;
    }

    /**
     * 配列を判定する
     * @param {Object} obj 
     */
    let isArray = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
}
log.init();