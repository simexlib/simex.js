/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

import { /* internal */ AtError, messages } from "./AtError";
import { /* internal */ IExtraction, ISerializable } from "./Extraction";

export /* internal */
class Between implements ISerializable {

    private readonly backward?: boolean;
    private readonly prefix?: string | string[];
    private readonly suffix?: string | string[];
    private readonly trim?: boolean;

    constructor(json: any) {
        if (typeof json !== "object" || json instanceof Array || json === null) {
            throw new AtError(messages.between, "between");
        }

        if (json.hasOwnProperty("backward")) {
            if (typeof json.backward !== "boolean") {
                throw new AtError(messages.backward, "between.backward");
            }
            this.backward = json.backward;
        }

        if (json.hasOwnProperty("prefix")) {
            switch (typeof json.prefix) {
            case "string":
                this.prefix = json.prefix;
                break;
            case "object":
                if (json.prefix instanceof Array) {
                    json.prefix.forEach((prefix: any) => {
                        if (typeof(prefix) !== "string") {
                            throw new AtError(messages.prefix, "between.prefix");
                        }
                    });
                    this.prefix = json.prefix;
                }
            }
            if (this.prefix === undefined) {
                throw new AtError(messages.prefix, "between.prefix");
            }
        }

        if (json.hasOwnProperty("suffix")) {
            switch (typeof json.suffix) {
            case "string":
                this.suffix = json.suffix;
                break;
            case "object":
                if (json.suffix instanceof Array) {
                    json.suffix.forEach((suffix: any) => {
                        if (typeof(suffix) !== "string") {
                            throw new AtError(messages.suffix, "between.suffix");
                        }
                    });
                    this.suffix = json.suffix;
                }
            }
            if (this.suffix === undefined) {
                throw new AtError(messages.suffix, "between.suffix");
            }
        }

        if (json.hasOwnProperty("trim")) {
            if (typeof json.trim !== "boolean") {
                throw new AtError(messages.trim, "between.trim");
            }
            this.trim = json.trim;
        }
    }

    public extract(input: string): string {
        let str = input;

        // prefix
        const prefixes = this.prefix === undefined ? []
            : ((typeof this.prefix === "string") ? [this.prefix]
            : this.prefix);
        for (let index = 0; index < prefixes.length; index += 1) {
            const prefix = prefixes[index];
            if (prefix.length > 0) {
                if (this.backward) {
                    const end = str.lastIndexOf(prefix);
                    if (end >= 0) {
                        str = str.substring(0, end);
                    }
                    else {
                        const location = typeof this.prefix === "string"
                            ? "between.prefix"
                            : "between.prefix." + prefix + "(" + index + ")";

                        throw new AtError(messages.unmatch, location);
                    }
                }
                else {
                    const start = str.indexOf(prefix);
                    if (start >= 0) {
                        str = str.substring(start + prefix.length);
                    }
                    else {
                        const location = typeof this.prefix === "string"
                            ? "between.prefix"
                            : "between.prefix." + prefix + "(" + index + ")";

                        throw new AtError(messages.unmatch, location);
                    }
                }
            }
        }

        // suffix
        const suffixes = this.suffix === undefined ? []
            : ((typeof this.suffix === "string") ? [this.suffix]
            : this.suffix);
        let suffixed = false;
        let suffixesCount = 0;
        for (const suffix of suffixes) {
            suffixesCount += 1;
            if (suffix.length > 0) {
                if (this.backward) {
                    const start = str.lastIndexOf(suffix);
                    if (start >= 0) {
                        str = str.substring(start + suffix.length);
                        suffixed = true;
                        break;
                    }
                }
                else {
                    const end = str.indexOf(suffix);
                    if (end >= 0) {
                        str = str.substring(0, end);
                        suffixed = true;
                        break;
                    }
                }
            }
            else {
                suffixed = true;
                break;
            }
        }
        if (!suffixed && suffixesCount > 0) {
            throw new AtError(messages.unmatch, "between.suffix");
        }

        // trim
        if (this.trim) {
            str = str.trim();
        }

        return str;
    }

    public toJSON() {
        const json: any = { };
        if (this.backward !== undefined) {
            json.backward = this.backward;
        }
        if (this.prefix !== undefined) {
            json.prefix = this.prefix;
        }
        if (this.suffix !== undefined) {
            json.suffix = this.suffix;
        }
        if (this.trim !== undefined) {
            json.trim = this.trim;
        }
        return json;
    }
}
