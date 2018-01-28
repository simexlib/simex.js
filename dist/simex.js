/**
 * @license
 * Copyright (c) 2015 Ninh Pham <nfam.dev@gmail.com>
 *
 * Use of this source code is governed by The MIT license.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ArrayExp =  (function () {
        function ArrayExp(json, processors) {
            this.subexpressionType = "array";
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
                                json.separator.forEach(function (separator) {
                                    if (typeof (separator) !== "string" || separator.length === 0) {
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
                                json.skip.forEach(function (item) {
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
        ArrayExp.prototype.extract = function (input) {
            var array = [];
            try {
                var parts = [input];
                var separators = (typeof this.separator === "string") ? [this.separator] : this.separator;
                for (var _i = 0, separators_1 = separators; _i < separators_1.length; _i++) {
                    var separator = separators_1[_i];
                    var groups = [];
                    for (var ii = 0; ii < parts.length; ii += 1) {
                        groups[ii] = parts[ii].split(separator);
                    }
                    parts = [].concat.apply([], groups);
                }
                var skip = (typeof this.skip === "string") ? [this.skip] : (this.skip ? this.skip : []);
                for (var _a = 0, parts_1 = parts; _a < parts_1.length; _a++) {
                    var item = parts_1[_a];
                    if (skip.indexOf("empty") >= 0 && item === "") {
                        continue;
                    }
                    if (this.subexpression) {
                        try {
                            var result = this.subexpression.extract(item);
                            if (skip.indexOf("empty") >= 0 && result === "") {
                                continue;
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
        };
        ArrayExp.prototype.toJSON = function () {
            var json = { separator: this.separator };
            if (this.skip) {
                json.skip = this.skip;
            }
            if (this.subexpression) {
                json[this.subexpression.subexpressionType] = this.subexpression.toJSON();
            }
            return json;
        };
        return ArrayExp;
    }());
    var AtError =  (function (_super) {
        __extends(AtError, _super);
        function AtError(message, at) {
            var _this = _super.call(this, message) || this;
            _this.at = at || "";
            return _this;
        }
        return AtError;
    }(Error));
    function addPrefixAt(error, prefix) {
        if (typeof error.at === "string" && typeof error.message === "string" && prefix !== "") {
            error.at = error.at !== "" ? (prefix + "." + error.at) : prefix;
        }
    }
    function addMessageAt(error) {
        if (typeof error.at === "string" && typeof error.message === "string") {
            if (error.at !== "") {
                error.message += " @ " + error.at;
            }
        }
    }
    var messages = {
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
    var Between =  (function () {
        function Between(json) {
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
                            json.prefix.forEach(function (prefix) {
                                if (typeof (prefix) !== "string") {
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
                            json.suffix.forEach(function (suffix) {
                                if (typeof (suffix) !== "string") {
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
        Between.prototype.extract = function (input) {
            var str = input;
            var prefixes = this.prefix === undefined ? []
                : ((typeof this.prefix === "string") ? [this.prefix]
                    : this.prefix);
            for (var index = 0; index < prefixes.length; index += 1) {
                var prefix = prefixes[index];
                if (prefix.length > 0) {
                    if (this.backward) {
                        var end = str.lastIndexOf(prefix);
                        if (end >= 0) {
                            str = str.substring(0, end);
                        }
                        else {
                            var location_1 = typeof this.prefix === "string"
                                ? "between.prefix"
                                : "between.prefix." + prefix + "(" + index + ")";
                            throw new AtError(messages.unmatch, location_1);
                        }
                    }
                    else {
                        var start = str.indexOf(prefix);
                        if (start >= 0) {
                            str = str.substring(start + prefix.length);
                        }
                        else {
                            var location_2 = typeof this.prefix === "string"
                                ? "between.prefix"
                                : "between.prefix." + prefix + "(" + index + ")";
                            throw new AtError(messages.unmatch, location_2);
                        }
                    }
                }
            }
            var suffixes = this.suffix === undefined ? []
                : ((typeof this.suffix === "string") ? [this.suffix]
                    : this.suffix);
            var suffixed = false;
            var suffixesCount = 0;
            for (var _i = 0, suffixes_1 = suffixes; _i < suffixes_1.length; _i++) {
                var suffix = suffixes_1[_i];
                suffixesCount += 1;
                if (suffix.length > 0) {
                    if (this.backward) {
                        var start = str.lastIndexOf(suffix);
                        if (start >= 0) {
                            str = str.substring(start + suffix.length);
                            suffixed = true;
                            break;
                        }
                    }
                    else {
                        var end = str.indexOf(suffix);
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
            if (this.trim) {
                str = str.trim();
            }
            return str;
        };
        Between.prototype.toJSON = function () {
            var json = {};
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
        };
        return Between;
    }());
    var Dictionary =  (function () {
        function Dictionary(json, processors) {
            var _this = this;
            this.subexpressionType = "dictionary";
            try {
                if (typeof json !== "object" || json instanceof Array || json === null) {
                    throw new AtError(messages.dictionary);
                }
                this.members = {};
                Object.keys(json).forEach(function (name) {
                    var value = json[name];
                    if (typeof value !== "object" || value instanceof Array) {
                        throw new AtError(messages.member, name);
                    }
                    try {
                        _this.members[name] = new Slice(value, processors, "member");
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
        Dictionary.prototype.extract = function (input) {
            var dictionary = {};
            var errors = {};
            var names = Object.keys(this.members);
            for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                var name_1 = names_1[_i];
                var member = this.members[name_1];
                try {
                    dictionary[name_1] = member.extract(input);
                    if (typeof member.required === "string") {
                        errors[member.required] = undefined;
                    }
                }
                catch (error) {
                    if (member.required === undefined || member.required) {
                        if (typeof member.required !== "string") {
                            addPrefixAt(error, "dictionary." + name_1);
                            throw error;
                        }
                        else if (!(member.required in errors)) {
                            addPrefixAt(error, "dictionary." + name_1 + "(" + member.required + ")");
                            errors[member.required] = error;
                        }
                    }
                }
            }
            var requireds = Object.keys(errors);
            for (var _a = 0, requireds_1 = requireds; _a < requireds_1.length; _a++) {
                var required = requireds_1[_a];
                var error = errors[required];
                if (error !== undefined) {
                    throw error;
                }
            }
            return dictionary;
        };
        Dictionary.prototype.toJSON = function () {
            var _this = this;
            var json = {};
            Object.keys(this.members).forEach(function (name) {
                json[name] = _this.members[name].toJSON();
            });
            return json;
        };
        return Dictionary;
    }());
    var Expression =  (function () {
        function Expression(json, processors) {
            processors = processors || {};
            try {
                this.expression = new Slice(json, processors, "root");
            }
            catch (error) {
                addMessageAt(error);
                throw error;
            }
        }
        Expression.prototype.extract = function (input) {
            try {
                var result = this.expression.extract(input);
                return avoidMemoryLeak(result);
            }
            catch (error) {
                addMessageAt(error);
                throw error;
            }
        };
        Expression.prototype.toJSON = function () {
            return this.expression.toJSON();
        };
        return Expression;
    }());
    exports.Expression = Expression;
    function avoidMemoryLeak(item) {
        if (typeof item === "string") {
            item = (" " + item).substring(1);
        }
        else if (typeof item === "object") {
            if (item instanceof Array) {
                for (var i = 0; i < item.length; i += 1) {
                    item[i] = avoidMemoryLeak(item[i]);
                }
            }
            else {
                Object.keys(item).forEach(function (key) {
                    item[key] = avoidMemoryLeak(item[key]);
                });
            }
        }
        return item;
    }
    function paraseSubexpression(json, processors) {
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
    var Process =  (function () {
        function Process(json, processors) {
            if (typeof json !== "string") {
                throw new AtError(messages.process, "process");
            }
            var value = json.trim();
            var index = value.indexOf(":");
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
        Process.prototype.extract = function (input) {
            try {
                return this.func(input, this.args);
            }
            catch (e) {
                var error = new AtError(messages.unmatch, "process");
                if (e.stack) {
                    error.stack = e.stack;
                }
                throw error;
            }
        };
        Process.prototype.toJSON = function () {
            if (this.args !== undefined) {
                return this.name + ":" + this.args;
            }
            else {
                return this.name;
            }
        };
        return Process;
    }());
    var Slice =  (function () {
        function Slice(json, processors, type) {
            this.subexpressionType = "slice";
            this.sliceType = type;
            try {
                if (typeof json !== "object" || json instanceof Array || json === null) {
                    throw new AtError(this.sliceType == "root" ? messages.expression :
                        (this.sliceType == "member" ? messages.member :
                            messages.slice));
                }
                if (type === "member" && json.hasOwnProperty("required")) {
                    if (typeof json.required !== "boolean" && (typeof json.required !== "string" ||
                        json.required.length === 0)) {
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
        Slice.prototype.extract = function (input) {
            try {
                if (this.has && this.has.length > 0) {
                    if (input.indexOf(this.has) < 0) {
                        throw new AtError(messages.unmatch, "has");
                    }
                }
                var str = input;
                if (this.between) {
                    str = this.between.extract(str);
                }
                if (this.process) {
                    str = this.process.extract(str);
                }
                var result = str;
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
        };
        Slice.prototype.toJSON = function () {
            var json = {};
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
        };
        return Slice;
    }());
});
