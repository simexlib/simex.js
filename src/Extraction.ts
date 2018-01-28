/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

import { /* internal */ AtError, messages } from "./AtError";
import { /* internal */ ArrayExp } from "./ArrayExp";
import { /* internal */ Dictionary } from "./Dictionary";
import { /* internal */ IProcessors } from "./Process";
import { /* internal */ Slice } from "./Slice";

export /* internal */
interface IExtraction {
    extract(input: string): any;
}

export /* internal */
interface ISerializable {
    toJSON(): any;
}

export /* internal */
type SubexpressionType = "slice" | "array" | "dictionary";

export /* internal */
interface ISubexpression extends IExtraction, ISerializable {
    readonly subexpressionType: SubexpressionType;
}

export /* internal */
interface IContainer extends IExtraction, ISerializable {
    readonly subexpression?: ISubexpression;
}

export /* internal */
function paraseSubexpression(json: any, processors: IProcessors): ISubexpression {
    if (json.hasOwnProperty("slice")) {
        if (json.hasOwnProperty("array") || json.hasOwnProperty("dictionary")) {
            throw new AtError(messages.subexpressions);
        }
        return new Slice(json.slice, processors, "slice");
    }
    else if (json.hasOwnProperty("array")) {
        if (json.hasOwnProperty("dictionary")) {
            throw new AtError(messages.subexpressions);
        }
        return new ArrayExp(json.array, processors);
    }
    else if (json.hasOwnProperty("dictionary")) {
        return new Dictionary(json.dictionary, processors);
    }
    return undefined;
}
