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

export const getExtension = (name, file) => {
  let extension;
  if (name) {
    extension = name.split('.')[name.split('.').length - 1];
    if (extension) {
      return extension;
    }
  }
  extension = file.substring(file.indexOf('/') + 1, file.indexOf(';base64'));
  return extension === 'svg+xml' ? 'svg' : extension;
};

export const minioSrcBuilder = (src) => {
  const { minioSSL, minioEndPoint, minioBucket, minioPort } = Meteor.settings.public;
  return `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/${src}`;
};

export const fileUpload = async ({ name, file, path, type }, callback) => {
  if (file.slice(0, 5) === 'data:') {
    const filetype = type || getExtension(name, file);
    Meteor.call(
      'files.upload',
      {
        file: file.replace(file.substring(0, file.indexOf(';base64,') + 8, ''), ''),
        name: `${name}.${filetype === 'svg+xml' ? 'svg' : filetype}`,
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
