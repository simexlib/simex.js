/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

import { /* internal */ addPrefixAt, AtError, messages } from "./AtError";
import { /* internal */ IContainer, ISubexpression, paraseSubexpression, SubexpressionType } from "./Extraction";
import { /* internal */ IProcessors } from "./Process";

export /* internal */ class ArrayExp implements IContainer, ISubexpression {
    readonly subexpressionType: SubexpressionType = "array";

    public readonly separator: string | string[];
    private readonly skip: "empty" | "invalid" | ("empty" | "invalid")[]
    readonly subexpression?: ISubexpression;

    constructor(json: any, processors: IProcessors) {
        try {
            if (typeof json !== "object" || json instanceof Array || json === null) {
                throw new AtError(messages.array);
            }

            if (json.hasOwnProperty("separator")) {
                switch (typeof json.separator) {
                case "string":
                    if (json.separator.length === 0) {
                        throw new AtError(messages.separator, "separator");
                    }
                    this.separator = json.separator;
                    break;
                case "object":
                    if (json.separator instanceof Array) {
                        json.separator.forEach((separator: any) => {
                            if (typeof(separator) !== "string" || separator.length === 0) {
                                throw new AtError(messages.separator, "separator");
                            }
                        });
                        this.separator = json.separator;
                    }
                }
                if (this.separator === undefined) {
                    throw new AtError(messages.separator, "separator");
                }
            }
            else {
                throw new AtError(messages.separatorMissing);
            }

            if (json.hasOwnProperty("skip")) {
                switch (typeof json.skip) {
                case "string":
                    if (json.skip !== "empty" && json.skip !== "invalid") {
                        throw new AtError(messages.skip, "skip");
                    }
                    this.skip = json.skip;
                    break;
                case "object":
                    if (json.skip instanceof Array) {
                        json.skip.forEach((item: any) => {
                            if (item !== "empty" && item !== "invalid") {
                                throw new AtError(messages.skip, "skip");
                            }
                        });
                        this.skip = json.skip;
                    }
                }
                if (this.skip === undefined) {
                    throw new AtError(messages.skip, "skip");
                }
            }

            this.subexpression = paraseSubexpression(json, processors);
        }
        catch (error) {
            addPrefixAt(error, "array");
            throw error;
        }
    }

    public extract(input: string): any {
        const array = [];
        try {
            let parts = [input];
            const separators = (typeof this.separator === "string") ? [this.separator] : this.separator;
            for (const separator of separators) {
                const groups = [];
                for (let ii = 0; ii < parts.length; ii += 1) {
                    groups[ii] = parts[ii].split(separator);
                }
                parts = [].concat.apply([], groups);
            }
            const skip = (typeof this.skip === "string") ? [this.skip] : (this.skip ? this.skip : [])
            for (const item of parts) {
                if (skip.indexOf("empty") >= 0 && item === "") {
                    continue
                }
                if (this.subexpression) {
                    try {
                        const result = this.subexpression.extract(item);
                        if (skip.indexOf("empty") >= 0 && result === "") {
                            continue
                        }
                        else {
                            array.push(result);
                        }
                    }
                    catch (error) {
                        if (skip.indexOf("invalid") < 0) {
                            throw error;
                        }
                    }
                }
                else {
                    array.push(item);
                }
            }
        }
        catch (error) {
            addPrefixAt(error, "array");
            throw error;
        }
        return array;
    }

    public toJSON() {
        const json: any = { separator: this.separator };
        if (this.skip) {
            json.skip = this.skip;
        }
        if (this.subexpression) {
            json[this.subexpression.subexpressionType] = this.subexpression.toJSON();
        }
        return json;
    }
}
