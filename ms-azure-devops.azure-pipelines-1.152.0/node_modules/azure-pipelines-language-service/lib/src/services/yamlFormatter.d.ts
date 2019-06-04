import { TextDocument, FormattingOptions, TextEdit } from 'vscode-languageserver-types';
export declare function format(document: TextDocument, options: FormattingOptions, customTags: Array<String>): TextEdit[];
