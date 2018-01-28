/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

import { /* internal */ addPrefixAt, AtError, messages } from "./AtError";
import { /* internal */ ISubexpression, SubexpressionType } from "./Extraction";
import { /* internal */ Slice } from "./Slice";
import { /* internal */ IProcessors } from "./Process";

export /* internal */
class Dictionary implements ISubexpression {
    readonly subexpressionType: SubexpressionType = "dictionary";

    private readonly members: { [name: string]: Slice };

    constructor(json: any, processors: IProcessors) {
        try {
            if (typeof json !== "object" || json instanceof Array || json === null) {
                throw new AtError(messages.dictionary);
            }

            this.members = {};
            Object.keys(json).forEach((name) => {
                const value = json[name];
                if (typeof value !== "object" || value instanceof Array) {
                    throw new AtError(messages.member, name);
                }
                try {
                    this.members[name] = new Slice(value, processors, "member");
                }
                catch (error) {
                    addPrefixAt(error, name);
                    throw error;
                }
            });
        }
        catch (error) {
            addPrefixAt(error, "dictionary");
            throw error;
        }
    }

    public extract(input: string): any {
        const dictionary: { [name: string]: any } = {};
        const errors: { [name: string]: AtError } = {};

        const names = Object.keys(this.members);
        for (const name of names) {
            const member = this.members[name];

            try {
                dictionary[name] = member.extract(input);
                if (typeof member.required === "string") {
                    errors[member.required] = undefined;
                }
            }
            catch (error) {
                if (member.required === undefined || member.required) {
                    if (typeof member.required !== "string") {
                        addPrefixAt(error, "dictionary." + name);
                        throw error;
                    }
                    else if (!(member.required in errors)) {
                        addPrefixAt(error, "dictionary." + name + "(" + member.required + ")");
                        errors[member.required] = error;
                    }
                }
            }
        }

        const requireds = Object.keys(errors);
        for (const required of requireds) {
            const error = errors[required];
            if (error !== undefined) {
                throw error;
            }
        }

        return dictionary;
    }

    public toJSON() {
        const json: any = {};
        Object.keys(this.members).forEach((name) => {
            json[name] = this.members[name].toJSON();
        });
        return json;
    }
}
