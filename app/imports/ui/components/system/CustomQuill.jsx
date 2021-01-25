/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Tooltip from '@material-ui/core/Tooltip';

const isSafari = () => /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

function CustomToolbarArticle({ withMedia, withWebcam }) {
  return (
    <div id="quill-toolbar">
      <Tooltip
        id="header-tooltip"
        arrow
        title={i18n.__('components.CustomQuill.header')}
        aria-label={i18n.__('components.CustomQuill.header')}
      >
        <span className="ql-formats">
          <select className="ql-header" defaultValue="" onChange={(e) => e.persist()}>
            <option value="1" aria-labelledby="header-tooltip" />
            <option value="2" aria-labelledby="header-tooltip" />
            <option value="3" aria-labelledby="header-tooltip" />
            <option value="4" aria-labelledby="header-tooltip" />
            <option value="5" aria-labelledby="header-tooltip" />
            <option value="" aria-labelledby="header-tooltip" />
          </select>
        </span>
      </Tooltip>
      <span className="ql-formats">
        <Tooltip
          id="bold-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.bold')}
          aria-label={i18n.__('components.CustomQuill.bold')}
        >
          <button type="button" className="ql-bold" aria-labelledby="bold-tooltip" />
        </Tooltip>
        <Tooltip
          id="italic-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.italic')}
          aria-label={i18n.__('components.CustomQuill.italic')}
        >
          <button type="button" className="ql-italic" aria-labelledby="italic-tooltip" />
        </Tooltip>
        <Tooltip
          id="underline-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.underline')}
          aria-label={i18n.__('components.CustomQuill.underline')}
        >
          <button type="button" className="ql-underline" aria-labelledby="underline-tooltip" />
        </Tooltip>
        <Tooltip
          id="strike-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.strike')}
          aria-label={i18n.__('components.CustomQuill.strike')}
        >
          <button type="button" className="ql-strike" aria-labelledby="strike-tooltip" />
        </Tooltip>
        <Tooltip
          id="blockquote-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.blockquote')}
          aria-label={i18n.__('components.CustomQuill.blockquote')}
        >
          <button type="button" className="ql-blockquote" aria-labelledby="blockquote-tooltip" />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip
          id="ordered-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.ordered')}
          aria-label={i18n.__('components.CustomQuill.ordered')}
        >
          <button type="button" className="ql-list" value="ordered" aria-labelledby="ordered-tooltip" />
        </Tooltip>
        <Tooltip
          id="bullet-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.bullet')}
          aria-label={i18n.__('components.CustomQuill.bullet')}
        >
          <button type="button" className="ql-list" value="bullet" aria-labelledby="bullet-tooltip" />
        </Tooltip>
        <Tooltip
          id="unindent-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.unindent')}
          aria-label={i18n.__('components.CustomQuill.unindent')}
        >
          <button type="button" className="ql-indent" value="-1" aria-labelledby="unindent-tooltip" />
        </Tooltip>
        <Tooltip
          id="indent-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.indent')}
          aria-label={i18n.__('components.CustomQuill.indent')}
        >
          <button type="button" className="ql-indent" value="+1" aria-labelledby="indent-tooltip" />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip
          id="link-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.link')}
          aria-label={i18n.__('components.CustomQuill.link')}
        >
          <button type="button" className="ql-link" aria-labelledby="link-tooltip" />
        </Tooltip>
        {withMedia ? (
          <Tooltip
            id="image-tooltip"
            arrow
            title={i18n.__('components.CustomQuill.image')}
            aria-label={i18n.__('components.CustomQuill.image')}
          >
            <button type="button" className="ql-image" aria-labelledby="image-tooltip" />
          </Tooltip>
        ) : null}
        {withMedia ? (
          <Tooltip
            id="video-tooltip"
            arrow
            title={i18n.__('components.CustomQuill.video')}
            aria-label={i18n.__('components.CustomQuill.video')}
          >
            <button type="button" className="ql-video" aria-labelledby="video-tooltip" />
          </Tooltip>
        ) : null}
        {withMedia ? (
          <Tooltip
            id="audio-tooltip"
            arrow
            title={i18n.__('components.CustomQuill.audio')}
            aria-label={i18n.__('components.CustomQuill.audio')}
          >
            <button type="button" className="ql-audio" aria-labelledby="audio-tooltip">
              <svg id="audo-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M17.3,11C17.3,14 14.76,16.1 12,16.1C9.24,16.1 6.7,14 6.7,11H5C5,14.41 7.72,17.23 11,17.72V21H13V17.72C16.28,17.23 19,14.41 19,11M10.8,4.9C10.8,4.24 11.34,3.7 12,3.7C12.66,3.7 13.2,4.24 13.2,4.9L13.19,11.1C13.19,11.76 12.66,12.3 12,12.3C11.34,12.3 10.8,11.76 10.8,11.1M12,14A3,3 0 0,0 15,11V5A3,3 0 0,0 12,2A3,3 0 0,0 9,5V11A3,3 0 0,0 12,14Z"
                />
              </svg>
            </button>
          </Tooltip>
        ) : null}
        {withWebcam && !isSafari() ? (
          <Tooltip
            id="webcam-tooltip"
            arrow
            title={i18n.__('components.CustomQuill.webcam')}
            aria-label={i18n.__('components.CustomQuill.webcam')}
          >
            <button type="button" className="ql-webcam" aria-labelledby="webcam-tooltip">
              <svg id="webcam-icon" enableBackground="new 0 0 512.037 512.037" viewBox="0 0 512.037 512.037">
                <g>
                  <path d="m256.018 263.018c39.149 0 71-31.851 71-71s-31.851-71-71-71-71 31.851-71 71 31.851 71 71 71zm0-112c22.607 0 41 18.393 41 41s-18.393 41-41 41-41-18.393-41-41 18.393-41 41-41z" />

                  <path d="m256.018 343.018c83.262 0 151-67.738 151-151s-67.738-151-151-151-151 67.738-151 151 67.738 151 151 151zm0-272c66.72 0 121 54.28 121 121s-54.28 121-121 121-121-54.28-121-121 54.28-121 121-121z" />

                  <path d="m241.308 194.948c1.675 8.08 9.315 13.34 17.64 11.78 8.156-1.707 13.326-9.376 11.78-17.641-1.864-8.887-10.663-13.919-19.07-11.42-7.849 2.567-11.729 9.923-10.35 17.281z" />

                  <path d="m508.683 446.589c-103.445-127.973-97.297-120.707-99.434-122.38-5.662-7.23-16.155-7.638-22.417-1.376-72.299 72.299-189.323 72.306-261.629 0-6.272-6.274-16.765-5.841-22.417 1.376-2.038 1.596 4.84-6.619-99.434 122.38-7.914 9.79-.929 24.43 11.665 24.43h482c12.59-.001 19.583-14.636 11.666-24.43zm-462.252-5.571 69.456-85.926c79.909 68.884 199.459 69.654 280.262 0l69.456 85.926z" />
                </g>
              </svg>
            </button>
          </Tooltip>
        ) : null}
      </span>
      <span className="ql-formats">
        <Tooltip
          id="clean-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.clean')}
          aria-label={i18n.__('components.CustomQuill.clean')}
        >
          <button type="button" className="ql-clean" aria-labelledby="clean-tooltip" />
        </Tooltip>
      </span>
    </div>
  );
}

CustomToolbarArticle.defaultProps = {
  withMedia: false,
  withWebcam: false,
};

CustomToolbarArticle.propTypes = {
  withMedia: PropTypes.bool,
  withWebcam: PropTypes.bool,
};

function CustomToolbar() {
  return (
    <div id="quill-toolbar">
      <Tooltip
        id="header-tooltip"
        arrow
        title={i18n.__('components.CustomQuill.header')}
        aria-label={i18n.__('components.CustomQuill.header')}
      >
        <span className="ql-formats">
          <select className="ql-header">
            <option value="1" aria-labelledby="header-tooltip" />
            <option value="2" aria-labelledby="header-tooltip" />
            <option value="3" aria-labelledby="header-tooltip" />
            <option selected="selected" aria-labelledby="header-tooltip" />
          </select>
        </span>
      </Tooltip>
      <span className="ql-formats">
        <Tooltip
          id="bold-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.bold')}
          aria-label={i18n.__('components.CustomQuill.bold')}
        >
          <button type="button" className="ql-bold" aria-labelledby="bold-tooltip" />
        </Tooltip>
        <Tooltip
          id="italic-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.italic')}
          aria-label={i18n.__('components.CustomQuill.italic')}
        >
          <button type="button" className="ql-italic" aria-labelledby="italic-tooltip" />
        </Tooltip>
        <Tooltip
          id="underline-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.underline')}
          aria-label={i18n.__('components.CustomQuill.underline')}
        >
          <button type="button" className="ql-underline" aria-labelledby="underline-tooltip" />
        </Tooltip>
        <Tooltip
          id="link-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.link')}
          aria-label={i18n.__('components.CustomQuill.link')}
        >
          <button type="button" className="ql-link" aria-labelledby="link-tooltip" />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip
          id="ordered-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.ordered')}
          aria-label={i18n.__('components.CustomQuill.ordered')}
        >
          <button type="button" className="ql-list" value="ordered" aria-labelledby="ordered-tooltip" />
        </Tooltip>
        <Tooltip
          id="bullet-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.bullet')}
          aria-label={i18n.__('components.CustomQuill.bullet')}
        >
          <button type="button" className="ql-list" value="bullet" aria-labelledby="bullet-tooltip" />
        </Tooltip>
      </span>
      <span className="ql-formats">
        <Tooltip
          id="clean-tooltip"
          arrow
          title={i18n.__('components.CustomQuill.clean')}
          aria-label={i18n.__('components.CustomQuill.clean')}
        >
          <button type="button" className="ql-clean" aria-labelledby="clean-tooltip" />
        </Tooltip>
      </span>
    </div>
  );
}

export { CustomToolbarArticle, CustomToolbar };
