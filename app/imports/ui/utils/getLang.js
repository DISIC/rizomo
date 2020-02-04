export default function getLang() {
  return (
    (navigator.languages && navigator.languages[0])
    || navigator.language
    || navigator.browserLanguage
    || navigator.userLanguage
    || 'en-US'
  );
}
