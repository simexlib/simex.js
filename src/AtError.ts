/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */

export /* internal */
class AtError extends Error {
    public at: string;

    public constructor(message: string, at?: string) {
        super(message);
        this.at = at || "";
    }
}

export /* internal */
function addPrefixAt(error: any, prefix: string) {
    if (typeof error.at === "string" && typeof error.message === "string" && prefix !== "") {
        error.at = error.at !== "" ? (prefix + "." + error.at) : prefix;
    }
}

export /* internal */
function addMessageAt(error: any) {
    if (typeof error.at === "string" && typeof error.message === "string") {
        if (error.at !== "") {
            error.message += " @ " + error.at;
        }
    }
}

export /* internal */ const messages = {
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
