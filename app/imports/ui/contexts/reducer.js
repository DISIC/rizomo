import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

export const MOBILE_SIZE = 768;

const reducer = (state, action) => {
  const { type, data = {} } = action;
  const { language, width } = data;
  switch (type) {
    case 'language':
      if (state.user && state.user.language !== language) {
        Meteor.call('users.setLanguage', { language });
      }
      i18n.setLocale(language);
      return {
        ...state,
        language,
      };
    case 'servicePage':
      return {
        ...state,
        servicePage: { ...data },
      };
    case 'groupPage':
      return {
        ...state,
        groupPage: { ...data },
      };
    case 'mobile':
      return {
        ...state,
        isMobile: width < MOBILE_SIZE,
      };
    case 'user':
      return {
        ...state,
        ...data,
      };
    default:
      throw new Error();
  }
};

export default reducer;
