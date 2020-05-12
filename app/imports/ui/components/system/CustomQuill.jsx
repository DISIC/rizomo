import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Tooltip from '@material-ui/core/Tooltip';

function CustomToolbarArticle({ withMedia }) {
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
};

CustomToolbarArticle.propTypes = {
  withMedia: PropTypes.bool,
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
