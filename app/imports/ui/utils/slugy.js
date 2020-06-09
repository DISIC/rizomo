import slugify from 'slugify';

const slugy = (string) =>
  slugify(string, {
    replacement: '-', // replace spaces with replacement
    remove: /[^\w\s$*_~()\-@]/g, // regex to remove characters
    lower: true, // result in lower case
    strict: true,
  });

export default slugy;
