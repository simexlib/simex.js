/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by the MIT license.
 */

import { Expression, IProcessors } from "../dist/simex";
import * as fs from "fs";

import { expect } from "chai";

// tslint:disable:mocha-no-side-effect-code

const processors: IProcessors = {
    float: (text: string, fixed?: string): string => {
        const v = parseFloat(text);
        if (isNaN(v)) {
            // tslint:disable-next-line:no-string-throw
            throw "Error";
        }
        else if (fixed !== undefined) {
            return v.toFixed(parseInt(fixed || "0", 10));
        }
        else {
            return v.toString();
        }
    },
    int: (text: string, radix?: string): string => {
        const v = parseInt(text, parseInt(radix || "10", 10));
        if (isNaN(v)) {
            throw new Error("invalid number");
        }
        else {
            return v.toString();
        }
    },
    notfuncion: ("notfunction" as any)
};

const  messages = {
    array: "Property \"array\" must be an object.",
    backward: "Property \"backward\" must be boolean.",
    between: "Property \"between\" must be an object.",
    dictionary: "Property \"dictionary\" must be an object.",
    expression: "Expression must be an object.",
    has: "Property \"has\" must be a string.",
    member: "Member value of dictionary must be an object.",
    prefix: "Property \"prefix\" must be either a string or an array of strings.",
    process: "Property \"process\" must be a string in format \"function[:args]\", args is optional.",
    processUndefined: "Function is not found in processors.",
    required: "Property \"required\" must be boolean or a non-empty string.",
    separator: "Property \"separator\" must be either a non-empty string or an array of non-empty strings.",
    separatorMissing: "Property \"separator\" is missing.",
    skip: "Property \"skip\" must be either a string or an array of strings of \"empty\" or \"invalid\".",
    slice: "Property \"slice\" must be an object.",
    subexpressions: "Only one of slice, array, and dictionary shall be defined.",
    suffix: "Property \"suffix\" must be either a string or an array of strings.",
    trim: "Property \"trim\" must be boolean.",
    unmatch: "Provided input does not match the expression.",
};

// test data:
//    title
//    expression
//    input
//    output
//    error

describe("simex.js", () => {

    function helpIt(json: any, filename: string) {
        if (typeof json == "object") {
            if (json instanceof Array) {
                for (const j of json) {
                    helpIt(j, filename)
                }
                return;
            }
        }
        else {
            throw new Error("Invalid Test Data " + filename);
        }

        const exptext = JSON.stringify(json.expression);

        // processors
        let p: IProcessors = undefined;
        if (json.processors) {
            p = {};
            for (const name of json.processors) {
                p[name] = processors[name]
            }
        }

        // error
        let error: string = undefined;
        if (json.error) {
            error = messages[json.error];
            if (!error) {
                throw Error("Invalid test Data (error).")
            }
            if (json.at) {
                error += " @ " + json.at;
            }
        }

        if (json.input) {
            if (error) {
                it("should fail with " + exptext + " from \"" + json.input + "\", throw $" + json.error, () => {
                    expect(() => new Expression(json.expression, p).extract(json.input)).throw(error);
                });
            }
            else {
                it("should extract with " + exptext + " from \"" + json.input + "\" to " + JSON.stringify(json.output), () => {
                    expect(new Expression(json.expression, p).extract(json.input)).deep.equal(json.output);
                });
            }
        }
        else if (error) {
            it("should fail with " + exptext+ ", and throw $" + json.error, () => {
                expect(() => new Expression(json.expression, p)).to.throw(error);
            });
        }
        else {
            it("should load with " + exptext, () => {
                expect(JSON.parse(JSON.stringify(new Expression(json.expression, p)))).deep.equal(json.expression);
            });
        }
    }

    ["syntax", "extraction"].forEach((section) => {
        describe("@" + section, () => {
            const dir = __dirname + "/data/" + section;
            const items = fs.readdirSync(dir);
            var groups: string[] = [];
            var files: string[] = [];
            for (const item of items) {
                if (!item.endsWith(".test.json")) {
                    continue
                }
                let group = item.substring(item.indexOf('.') + 1, item.length - ".test.json".length).trim();
                groups.push(group);
                files.push(item);
            }
            for (var i = 0; i < groups.length; i += 1) {
                describe(groups[i], () => {
                    let file = files[i];
                    const json = JSON.parse(fs.readFileSync(dir + "/" + file, "utf8"));
                    helpIt(json, file);
                });
            }
        });
    });
});