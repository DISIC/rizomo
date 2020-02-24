import Minio from 'minio';

// Instantiate the minio client with the endpoint
// and access keys as shown below.
const s3Client = new Minio.Client({
  endPoint: Meteor.settings.public.minioEndPoint,
  port: Meteor.settings.public.minioPort,
  useSSL: Meteor.settings.public.minioSSL,
  accessKey: Meteor.settings.public.minioAccess,
  secretKey: Meteor.settings.private.minioSecret,
});

export default s3Client;
