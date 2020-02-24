export const toBase64 = (image) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = function () {
    resolve(reader.result);
  };
  reader.onerror = function (error) {
    reject(error);
  };
  reader.readAsDataURL(image);
});

export const getExtension = (type) => {
  const string1 = type.split('/')[1];
  const string2 = string1.split(';base64')[0];
  return string2;
};

export const minioSrcBuilder = (src) => {
  const {
    minioSSL, minioEndPoint, minioBucket, minioPort,
  } = Meteor.settings.public;
  return `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/${src}`;
};

export const fileUpload = ({ name, file, path }) => {
  if (file.slice(0, 5) === 'data:') {
    const type = getExtension(file);
    if (Meteor.isServer) {
      Meteor.call('files.upload', {
        file: file.replace(`data:image/${type};base64,`, ''),
        name: `${name}.${type}`,
        path,
      });
    }
    return minioSrcBuilder(`${path}${name}.${type}`);
  }
  return file;
};
