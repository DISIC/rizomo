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
  const string = type.split('/')[1];
  return string.split(';base64')[0];
};

export const minioSrcBuilder = (src) => {
  const {
    minioSSL, minioEndPoint, minioBucket, minioPort,
  } = Meteor.settings.public;
  return `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/${src}`;
};

export const fileUpload = async ({ name, file, path }, callback) => {
  if (file.slice(0, 5) === 'data:') {
    const type = getExtension(file);
    Meteor.call(
      'files.upload',
      {
        file: file.replace(`data:image/${type};base64,`, ''),
        name: `${name}.${type === 'svg+xml' ? 'svg' : type}`,
        path,
      },
      (error) => {
        if (error) {
          callback(null, error);
        } else {
          callback(minioSrcBuilder(`${path}${name}.${type === 'svg+xml' ? 'svg' : type}`));
        }
      },
    );
  }
  return file;
};
