import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

export const MOBILE_SIZE = 768;

const reducer = (state, action) => {
  const { type, data = {} } = action;
  const { language, width } = data;
  const newState = JSON.parse(JSON.stringify(state));
  switch (type) {
    case 'language':
      if (newState.user && newState.user.language !== language) {
        Meteor.call('users.setLanguage', { language });
      }
      i18n.setLocale(language);
      return {
        ...newState,
        language,
      };
    case 'servicePage':
      return {
        ...newState,
        servicePage: { ...data },
      };
    case 'articlePage':
      return {
        ...newState,
        articlePage: { ...data },
      };
    case 'groupPage':
      return {
        ...newState,
        groupPage: { ...data },
      };
    case 'publishersPage':
      return {
        ...newState,
        publishersPage: { ...data },
      };
    case 'mobile':
      return {
        ...newState,
        isMobile: width < MOBILE_SIZE,
      };
    case 'user':
      return {
        ...newState,
        ...data,
      };
    case 'uploads.add':
      newState.uploads.push(data);
      return {
        ...newState,
      };
    case 'uploads.remove':
      return {
        ...newState,
        uploads: newState.uploads.filter((img) => img.fileName !== data.fileName),
      };
    case 'uploads.update':
      return {
        ...newState,
        uploads: { ...data },
      };
    default:
      throw new Error();
  }
};

export default reducer;
