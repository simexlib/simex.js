/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

import { /* internal */ AtError, messages } from "./AtError";

/**
 * Holds all collection of user-defined processors.
 * @export
 * @interface IProcessors
 */
export /* external */
interface IProcessors {
    [name: string]: (input: string, args?: string) => string;
}

export /* internal */ class Process {

    private name: string;
    private args?: string;
    private func: (input: string, arg?: string) => string;

    constructor(json: any, processors: IProcessors) {
        if (typeof json !== "string") {
            throw new AtError(messages.process, "process");
        }

        const value = (json as string).trim();
        const index = value.indexOf(":");
        if (index < 0) {
            this.name = value;
            this.args = undefined;
        }
        else {
            this.name = value.substring(0, index);
            this.args = value.substring(index + 1).trim();
        }
        this.func = processors[this.name];
        if (!this.func) {
            throw new AtError(messages.processUndefined, "process(" + this.name + ")");
        }
    }

    public extract(input: string): any {
        try {
            return this.func(input, this.args);
        }
        catch (e) {
            const error = new AtError(messages.unmatch, "process");
            if (e.stack) {
                error.stack = e.stack;
            }
            throw error;
        }
    }

    public toJSON() {
        if (this.args !== undefined) {
            return this.name + ":" + this.args;
        }
        else {
            return this.name;
        }
    }
}
