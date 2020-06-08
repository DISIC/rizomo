export const toBase64 = (image) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function onloadResolve() {
      resolve(reader.result);
    };
    reader.onerror = function onerrorReject(error) {
      reject(error);
    };
    reader.readAsDataURL(image);
  });

export const getExtension = (type) => {
  const string = type.split('/')[1];
  return string.split(';base64')[0];
};

export const minioSrcBuilder = (src) => {
  const { minioSSL, minioEndPoint, minioBucket, minioPort } = Meteor.settings.public;
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
          callback(minioSrcBuilder(`${path}/${name}.${type === 'svg+xml' ? 'svg' : type}`));
        }
      },
    );
  }
  return file;
};

export const storageToSize = (storage) => {
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  if (storage === 0) return '0 octet';
  const i = parseInt(Math.floor(Math.log(storage) / Math.log(1000)), 10);
  return `${Math.round(storage / 1000 ** i, 2)} ${sizes[i]}`;
};
