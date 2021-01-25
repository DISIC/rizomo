/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import '../../../../i18n/en.i18n.json';
import '../../../../i18n/fr.i18n.json';
import getLanguages from '../methods';

describe('languages', function () {
  describe('methods', function () {
    describe('getLanguages', function () {
      it('does return all supported languages', function () {
        const result = getLanguages._execute();
        assert.equal(result.length, 2);
        assert.include(result, 'en');
        assert.include(result, 'fr');
      });
    });
  });
});
