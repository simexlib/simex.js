/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

// tslint:disable:no-single-line-block-comment

import { /* internal */ addMessageAt, addPrefixAt, AtError, messages } from "./AtError";
import { /* internal */ IProcessors } from "./Process";
import { /* internal */ Slice } from "./Slice";

/**
 * Represents an instance of `Expression`.
 * @export
 * @class Expression
 */
export class Expression {
    private readonly expression: Slice;

    /**
     * Creates an instance of Expression.
     * @param {*} json The definition of expression in JSON.
     * @param {IProcessors} [processors] The collection of plugin process.
     * @throws {Error} if the provided expression does not comply the syntax.
     * @memberof Expression
     */
    constructor(json: any, processors?: IProcessors) {
        processors = processors || {};
        try {
            this.expression = new Slice(json, processors, "root");
        }
        catch (error) {
            addMessageAt(error);
            throw error;
        }
    }

    /**
     * Returns the extraction content in JSON from input string.
     * @param {string} input Input input to extract content from.
     * @returns {*} Result content in JSON format.
     * @throws {ExtractionError} if the input input does not match the expression.
     * @memberof Expression
     */
    public extract(input: string): any {
        try {
            const result = this.expression.extract(input);
            return avoidMemoryLeak(result);
        }
        catch (error) {
            addMessageAt(error);
            throw error;
        }
    }

    /**
     * Returns the original expression in JSON.
     * @returns {*}
     * @memberof Expression
     */
    public toJSON(): any {
        return this.expression.toJSON();
    }
}

// substring creates a view on original string instead of generating new one.
// Force to generate to reduce memory if the original string is too huge.
function avoidMemoryLeak(item: any): any {
    if (typeof item === "string") {
        item = (" " + item).substring(1);
    }
    else if (typeof item === "object") {
        if (item instanceof Array) {
            for (let i = 0; i < item.length; i += 1) {
                item[i] = avoidMemoryLeak(item[i]);
            }
        }
        else {
            Object.keys(item).forEach((key) => {
                item[key] = avoidMemoryLeak(item[key]);
            });
        }
    }
    return item;
}
