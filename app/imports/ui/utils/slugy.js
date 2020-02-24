import slugify from 'slugify';

const slugy = (string) => slugify(string, {
  replacement: '-', // replace spaces with replacement
  remove: null, // regex to remove characters
  lower: true, // result in lower case
});

export default slugy;
