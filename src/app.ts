import * as express from 'express';
import * as fs from 'fs';
import 'zone.js/dist/zone-node';
import 'zone.js/dist/long-stack-trace-zone';
/// <reference path="" />
import {LongStackTraceSpec} from './long-stack-trace';
import {Line, StackTraceParser}  from './stacktrace-parser';
require('source-map-support').install();

export const app = express();

function indentstack(error: any) {
    let lines = StackTraceParser.parse(error.stack);
    let stack = '';
    for (let line of lines) {
        if (line.lineNumber > 0) {
            if (filter(line)) {
                stack += `    at ${line.methodName} (${line.file}:${line.lineNumber}:${line.column})\n`;
            } else {
                stack += `  at ${line.methodName} (${line.file}:${line.lineNumber}:${line.column})\n`;
            }
        } else {
            stack += line.line + '\n';
        }
    }
    return stack;
    function filter(line: Line) {
        if (line.file.match(/zone-node\.js/)) {
            return true;
        }
        if (line.file.match(/long-stack-trace\.ts/)) {
            return true;
        }
    }
}

app.use((req, res, next) => {

    Zone.current.fork({
        name: 'myZone',
        onHandleError: (delegate, zone, zone2, error) => {
            console.log(error.stack);
            // let stack = indentstack(error);
            // console.log(stack);
            res.json('error');
            return false;
        }
    }).fork(LongStackTraceSpec).runGuarded(() => {
        next();
    })
})
app.get('/', async function test(req, res) {
    setTimeout(async () => {
        await Promise.reject(new Error('reject'));
    });
});

app.listen(8080, () => {
    console.log('start');
});