

var UNKNOWN_FUNCTION = '<unknown>';

export interface Line {
    line: string;
    file: string;
    methodName: string;
    lineNumber: number;
    column: number;
}

export const StackTraceParser = {
    /**
     * This parses the different stack traces and puts them into one format
     * This borrows heavily from TraceKit (https://github.com/occ/TraceKit)
     */
    parse: function (stackString): Line[] {
        var chrome = /^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object\])?\S+(?: \[as \S+\])?)) )?\(?((?:file|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
            gecko = /^(?:\s*([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i,
            node = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i,
            lines = stackString.split('\n'),
            stack = [],
            parts,
            element;

        for (var i = 0, j = lines.length; i < j; ++i) {
            if ((parts = gecko.exec(lines[i]))) {
                element = {
                    'line': lines[i],
                    'file': parts[3],
                    'methodName': parts[1] || UNKNOWN_FUNCTION,
                    'lineNumber': +parts[4],
                    'column': parts[5] ? +parts[5] : null
                };
            } else if ((parts = chrome.exec(lines[i]))) {
                element = {
                    'line': lines[i],
                    'file': parts[2],
                    'methodName': parts[1] || UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                };
            } else if ((parts = node.exec(lines[i]))) {
                element = {
                    'line': lines[i],
                    'file': parts[2],
                    'methodName': parts[1] || UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                };
            } else {
                element = {
                    'line': lines[i],
                    'file': null,
                    'methodName': null,
                    'lineNumber': -1,
                    'column': null
                };
            }

            stack.push(element);
        }

        return stack;
    }
};