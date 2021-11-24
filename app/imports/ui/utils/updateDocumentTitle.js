function updateDocumentTitle(title) {
  if (!title || title === '') {
    document.title = Meteor.settings.public.appName || 'LaBoîte';
  } else {
    document.title = `${Meteor.settings.public.appName || 'LaBoîte'} - ${title}`;
  }
}
export default updateDocumentTitle;
