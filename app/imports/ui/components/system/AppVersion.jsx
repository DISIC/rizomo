import React from 'react';
import i18n from 'meteor/universe:i18n';

import PackageJSON from '../../../../package.json';

const { version } = PackageJSON;
const AppVersion = () => (
  <span
    style={{
      opacity: 0.3,
    }}
  >
    {i18n.__('components.AppVersion.title')} {version}
  </span>
);

export default AppVersion;
