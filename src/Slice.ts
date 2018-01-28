/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

import { /* internal */ addPrefixAt, AtError, messages } from "./AtError";
import { /* internal */ Between } from "./Between";
import { /* internal */ IContainer, ISubexpression, paraseSubexpression, SubexpressionType } from "./Extraction";
import { /* internal */ IProcessors, Process } from "./Process";

export /* internal */ type SliceType = "root" | "slice" | "member";
export /* internal */ class Slice implements IContainer, ISubexpression {
    readonly subexpressionType: SubexpressionType = "slice";
    private readonly sliceType: SliceType

    public readonly required?: string | string[];
    private readonly has?: string;
    private readonly between?: Between;
    private readonly process?: Process;
    readonly subexpression?: ISubexpression;

    constructor(json: any, processors: IProcessors, type: SliceType) {
        this.sliceType = type
        try {
            if (typeof json !== "object" || json instanceof Array || json === null) {
                throw new AtError(
                    this.sliceType == "root" ? messages.expression :
                    (this.sliceType == "member" ? messages.member :
                    messages.slice)
                );
            }

            if (type === "member"  &&  json.hasOwnProperty("required")) {
                if (typeof json.required !== "boolean" && (
                    typeof json.required !== "string" ||
                    json.required.length === 0
                )) {
                    throw new AtError(messages.required, "required");
                }
                this.required = json.required;
            }

            if (json.hasOwnProperty("has")) {
                if (typeof json.has !== "string") {
                    throw new AtError(messages.has, "has");
                }
                this.has = json.has;
            }

            if (json.hasOwnProperty("between")) {
                this.between = new Between(json.between);
            }

            if (json.hasOwnProperty("process")) {
                this.process = new Process(json.process, processors);
            }

            this.subexpression = paraseSubexpression(json, processors);
        }
        catch (error) {
            if (this.sliceType == "slice") {
                addPrefixAt(error, "slice");
            }
            throw error;
        }
    }

    public extract(input: string): any {
        try {
            if (this.has && this.has.length > 0) {
                if (input.indexOf(this.has) < 0) {
                    throw new AtError(messages.unmatch, "has");
                }
            }

            let str = input
            if (this.between) {
                str = this.between.extract(str);
            }

            if (this.process) {
                str = this.process.extract(str);
            }

            let result = str
            if (this.subexpression) {
                result = this.subexpression.extract(str);
            }
            return result;
        }
        catch (error) {
            if (this.sliceType == "slice") {
                addPrefixAt(error, "slice");
            }
            throw error;
        }
    }

    public toJSON() {
        const json: any = { };
        if (this.required !== undefined) {
            json.required = this.required;
        }
        if (this.has !== undefined) {
            json.has = this.has;
        }
        if (this.between !== undefined) {
            json.between = this.between.toJSON();
        }
        if (this.process !== undefined) {
            json.process = this.process.toJSON();
        }
        if (this.subexpression) {
            json[this.subexpression.subexpressionType] = this.subexpression.toJSON();
        }
        return json;
    }
}
