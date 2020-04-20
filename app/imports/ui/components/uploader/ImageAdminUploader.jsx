import React, { useContext, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { Random } from 'meteor/random';
import { Context } from '../../contexts/context';
import { toBase64 } from '../../utils/filesProcess';
import Spinner from '../system/Spinner';

const useStyles = makeStyles(() => ({
  imageWrapper: {
    position: 'relative',
  },
  imageInput: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '100%',
  },
}));

const ImageAdminUploader = ({
  src, alt, onImageChange, className, name, path, width, height,
}) => {
  const [{ uploads }, dispatch] = useContext(Context);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  const PLACEHOLDER = `https://fakeimg.pl/${width}x${height}/`;

  const onTransmitImage = (url, error) => {
    if (!error && url) {
      onImageChange(url);
    }
    setLoading(false);
  };

  const updateImage = async (e) => {
    if (e) {
      setLoading(true);
      const { files } = e.target;
      const file = files[0];
      const image = await toBase64(file);
      dispatch({
        type: 'uploads.add',
        data: {
          name,
          fileName: `${name}_${Random.id()}`,
          file: image,
          path,
          onFinish: onTransmitImage,
        },
      });
    }
  };

  useEffect(() => {
    const currentImagePath = uploads.find((img) => img.name === name);
    if (currentImagePath && currentImagePath.error) {
      setLoading(false);
    }
  }, [uploads]);

  return (
    <div className={`${classes.imageWrapper} ${className}`}>
      {loading && <Spinner full />}

      <input type="file" className={classes.imageInput} onChange={updateImage} />
      <img src={src || PLACEHOLDER} alt={alt} className={classes.image} />
    </div>
  );
};

export default ImageAdminUploader;

ImageAdminUploader.defaultProps = {
  className: '',
  width: 100,
  height: 100,
  src: null,
};

ImageAdminUploader.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  onImageChange: PropTypes.func.isRequired,
};
