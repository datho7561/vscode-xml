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
import * as assert from 'assert';
import { parseXmlEncoding } from '../client/xmlEncoding';

suite('XML Encoding Detection', function () {

  test('detects UTF-8 encoding', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="UTF-8"?>'), 'utf-8');
  });

  test('detects ISO-8859-1 encoding', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="ISO-8859-1"?>'), 'iso-8859-1');
  });

  test('detects encoding with single quotes', function () {
    assert.strictEqual(parseXmlEncoding("<?xml version='1.0' encoding='UTF-8'?>"), 'utf-8');
  });

  test('detects encoding with spaces around =', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding = "UTF-8"?>'), 'utf-8');
  });

  test('detects encoding with tabs around =', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding\t=\t"UTF-8"?>'), 'utf-8');
  });

  test('returns undefined for no encoding attribute', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0"?>'), undefined);
  });

  test('returns undefined for non-XML content', function () {
    assert.strictEqual(parseXmlEncoding('<root>content</root>'), undefined);
  });

  test('returns undefined for empty string', function () {
    assert.strictEqual(parseXmlEncoding(''), undefined);
  });

  test('returns undefined for short string', function () {
    assert.strictEqual(parseXmlEncoding('<?xml'), undefined);
  });

  test('returns undefined when prolog is not closed', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="UTF-8"'), undefined);
  });

  test('detects Windows-1252 encoding', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="Windows-1252"?>'), 'windows-1252');
  });

  test('detects Shift_JIS encoding', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="Shift_JIS"?>'), 'shift_jis');
  });

  test('handles encoding as first attribute', function () {
    assert.strictEqual(parseXmlEncoding('<?xml encoding="UTF-8" version="1.0"?>'), 'utf-8');
  });

  test('normalizes encoding to lowercase', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="UTF-8"?>'), 'utf-8');
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="Utf-8"?>'), 'utf-8');
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="utf-8"?>'), 'utf-8');
  });

  test('ignores encoding outside of prolog', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0"?> encoding="UTF-8"'), undefined);
  });

  test('handles prolog with standalone attribute', function () {
    assert.strictEqual(parseXmlEncoding('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'), 'utf-8');
  });
});
