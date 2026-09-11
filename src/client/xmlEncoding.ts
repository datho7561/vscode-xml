/**
 *  Copyright (c) 2026 Red Hat, Inc. and others.
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v2.0
 *  which accompanies this distribution, and is available at
 *  https://www.eclipse.org/legal/epl-v20.html
 *
 *  Contributors:
 *  Red Hat Inc. - initial API and implementation
 */

import { ExtensionContext, TextDocument, window, workspace } from 'vscode';

const XML_TO_VSCODE_ENCODING = new Map<string, string>([
  ['utf-8', 'utf8'],
  ['us-ascii', 'utf8'],
  ['ascii', 'utf8'],
  ['utf-16', 'utf16le'],
  ['utf-16le', 'utf16le'],
  ['utf-16be', 'utf16be'],
  ['iso-8859-1', 'iso88591'],
  ['iso-8859-2', 'iso88592'],
  ['iso-8859-3', 'iso88593'],
  ['iso-8859-4', 'iso88594'],
  ['iso-8859-5', 'iso88595'],
  ['iso-8859-6', 'iso88596'],
  ['iso-8859-7', 'iso88597'],
  ['iso-8859-8', 'iso88598'],
  ['iso-8859-9', 'iso88599'],
  ['iso-8859-10', 'iso885910'],
  ['iso-8859-11', 'iso885911'],
  ['iso-8859-13', 'iso885913'],
  ['iso-8859-14', 'iso885914'],
  ['iso-8859-15', 'iso885915'],
  ['iso-8859-16', 'iso885916'],
  ['windows-1250', 'windows1250'],
  ['windows-1251', 'windows1251'],
  ['windows-1252', 'windows1252'],
  ['windows-1253', 'windows1253'],
  ['windows-1254', 'windows1254'],
  ['windows-1255', 'windows1255'],
  ['windows-1256', 'windows1256'],
  ['windows-1257', 'windows1257'],
  ['windows-1258', 'windows1258'],
  ['shift_jis', 'shiftjis'],
  ['shift-jis', 'shiftjis'],
  ['euc-jp', 'eucjp'],
  ['euc-kr', 'euckr'],
  ['gb2312', 'gb2312'],
  ['gbk', 'gbk'],
  ['gb18030', 'gb18030'],
  ['big5', 'big5hkscs'],
  ['big5-hkscs', 'big5hkscs'],
  ['koi8-r', 'koi8r'],
  ['koi8-u', 'koi8u'],
  ['latin1', 'iso88591'],
  ['latin-1', 'iso88591'],
]);

/**
 * Parse the encoding from an XML prolog on the first line.
 * Uses manual scanning (no regex) for maximum performance.
 *
 * @param firstLine the first line of the document
 * @returns the encoding value in lowercase, or undefined if not found
 */
export function parseXmlEncoding(firstLine: string): string | undefined {
  if (firstLine.length < 6 || firstLine.charCodeAt(0) !== 0x3C || firstLine.charCodeAt(1) !== 0x3F) {
    return undefined;
  }

  const prologEnd = firstLine.indexOf('?>');
  if (prologEnd === -1) return undefined;

  const encodingIdx = firstLine.indexOf('encoding', 2);
  if (encodingIdx === -1 || encodingIdx >= prologEnd) return undefined;

  let i = encodingIdx + 8; // 'encoding'.length

  while (i < prologEnd && (firstLine.charCodeAt(i) === 0x20 || firstLine.charCodeAt(i) === 0x09)) i++;
  if (i >= prologEnd || firstLine.charCodeAt(i) !== 0x3D) return undefined;
  i++;
  while (i < prologEnd && (firstLine.charCodeAt(i) === 0x20 || firstLine.charCodeAt(i) === 0x09)) i++;

  const quoteChar = firstLine.charCodeAt(i);
  if (quoteChar !== 0x22 && quoteChar !== 0x27) return undefined;
  i++;

  const valueStart = i;
  while (i < prologEnd && firstLine.charCodeAt(i) !== quoteChar) i++;
  if (i >= prologEnd) return undefined;

  return firstLine.substring(valueStart, i).toLowerCase();
}

export function activateXmlEncodingDetection(context: ExtensionContext, supportedLanguageIds: string[]): void {
  const languageIdSet = new Set(supportedLanguageIds);
  let encodingApiAvailable: boolean | undefined;

  const checkAndFixEncoding = async (document: TextDocument): Promise<void> => {
    // Check once if the encoding API is available (VS Code 1.100+)
    if (encodingApiAvailable === undefined) {
      encodingApiAvailable = 'encoding' in document;
    }
    if (!encodingApiAvailable) return;

    // Only handle XML-type documents from the local file system
    if (!languageIdSet.has(document.languageId)) return;
    if (document.uri.scheme !== 'file') return;
    // Cannot change encoding on a dirty document (VS Code API constraint)
    if (document.isDirty) return;
    if (document.lineCount === 0) return;

    // Parse the encoding declared in the XML prolog (e.g. encoding="ISO-8859-1")
    const xmlEncoding = parseXmlEncoding(document.lineAt(0).text);
    if (!xmlEncoding) return;

    // Skip if encoding already matches or is unknown
    const targetEncoding = XML_TO_VSCODE_ENCODING.get(xmlEncoding);
    if (!targetEncoding || targetEncoding === (document as any).encoding) return;

    // Reopen the document with the correct encoding
    try {
      await (workspace.openTextDocument as any)(document.uri, { encoding: targetEncoding });
    } catch {
      // Document may have become dirty between our check and the reopen call
    }
  };

  context.subscriptions.push(
    // Use onDidChangeActiveTextEditor instead of onDidOpenTextDocument to avoid
    // race conditions with the language client initialization resetting encoding
    window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        checkAndFixEncoding(editor.document);
      }
    }),
    workspace.onDidSaveTextDocument(checkAndFixEncoding)
  );

  // Check the currently active editor
  if (window.activeTextEditor) {
    checkAndFixEncoding(window.activeTextEditor.document);
  }
}
