import axios from 'axios';

const DomParser = require('dom-parser');

function getFavicon(url) {
  return axios
    .get(url)
    .then((response) => {
      const parser = new DomParser();
      const htmlDoc = parser.parseFromString(response.data, 'text/xml');
      const links = htmlDoc.getElementsByTagName('link') || [];
      const icons = [];
      const orig = new URL(url);
      const racine = orig.origin;
      links.forEach((l) => {
        if (l.getAttribute('rel').indexOf('icon') > -1) {
          const href = l.getAttribute('href');
          if (href !== '') {
            if (href.toLowerCase().indexOf('https:') === -1 && href.toLowerCase().indexOf('http:') === -1) {
              if (href[0] !== '/') {
                try {
                  const u = new URL(href, url);
                  icons.push(u.href);
                } catch {
                  // nothing
                }
              } else {
                try {
                  const u = new URL(href, racine);
                  icons.push(u.href);
                } catch {
                  // nothing
                }
              }
            } else {
              icons.push(href);
            }
          }
        }
      });
      return icons[0];
    })
    .catch(() => {
      return '';
    });
}

export default getFavicon;
