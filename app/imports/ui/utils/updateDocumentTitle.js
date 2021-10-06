function updateDocumentTitle(title) {
  if (!title || title === '') {
    document.title = 'LaBoîte';
  } else {
    document.title = `LaBoîte - ${title}`;
  }
}
export default updateDocumentTitle;
