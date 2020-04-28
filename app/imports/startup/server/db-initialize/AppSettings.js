import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import AppSettings from '../../../api/appsettings/appsettings';

Meteor.startup(() => {
  if (!AppSettings.findOne()) {
    const introduction = Object.keys(i18n._translations).map((language) => ({
      language,
      content: `<p>Welcome (${language})</p>`,
    }));
    AppSettings.insert({
      _id: 'settings',
      introduction,
      legal: {
        external: false,
        link: '',
        content: '',
      },
      accessibility: {
        external: false,
        link: '',
        content: '',
      },
      gcu: {
        external: false,
        link: '',
        content: '',
      },
      personalData: {
        external: false,
        link: '',
        content: '',
      },
    });
  }
});
