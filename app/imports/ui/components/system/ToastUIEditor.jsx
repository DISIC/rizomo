/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css'; // Editor's Style
// support for french language in editor.
// Add other files and update supportedLanguages variable if new languages are supported
// supported languages: https://github.com/nhn/tui.editor/blob/master/apps/editor/docs/i18n.md#supported-languages
import '@toast-ui/editor/dist/i18n/fr-fr';
import { Editor } from '@toast-ui/react-editor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import chart from '@toast-ui/editor-plugin-chart';
import uml from '@toast-ui/editor-plugin-uml';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';

const SupportedLanguages = ['fr', 'fr-FR', 'en', 'en-US'];

const useStyles = makeStyles(() => ({
  hideMediaButton: {
    '& .image-toast, .webcam-toast, .audio-toast': {
      display: 'none',
    },
  },
}));

const toolbarItems = [
  ['heading', 'bold', 'italic', 'strike'],
  ['hr', 'quote'],
  ['ul', 'ol', 'task', 'indent', 'outdent'],
  ['table', 'link'],
  ['code', 'codeblock'],
];
const markdownEditorItems = [
  [
    {
      className: 'image-toast',
      event: 'editor-image',
      tooltip: i18n.__('components.CustomQuill.image'),
      text: `I`,
      style: 'background:none;color:black;',
    },
    {
      className: 'webcam-toast',
      event: 'editor-webcam',
      tooltip: i18n.__('components.CustomQuill.webcam'),
      text: `W`,
      style: 'background:none;color:black;',
    },
    {
      className: 'audio-toast',
      event: 'editor-audio',
      tooltip: i18n.__('components.CustomQuill.audio'),
      text: `A`,
      style: 'background:none;color:black;',
    },
  ],
];
const mediaIcon = `
  <svg viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
    />
  </svg>
`;
const audioIcon = `
  <svg id="audo-icon" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M17.3,11C17.3,14 14.76,16.1 12,16.1C9.24,16.1 6.7,14 6.7,11H5C5,14.41 7.72,17.23 11,17.72V21H13V17.72C16.28,17.23 19,14.41 19,11M10.8,4.9C10.8,4.24 11.34,3.7 12,3.7C12.66,3.7 13.2,4.24 13.2,4.9L13.19,11.1C13.19,11.76 12.66,12.3 12,12.3C11.34,12.3 10.8,11.76 10.8,11.1M12,14A3,3 0 0,0 15,11V5A3,3 0 0,0 12,2A3,3 0 0,0 9,5V11A3,3 0 0,0 12,14Z"
    />
  </svg>
`;
const webcamIcon = `
  <svg id="webcam-icon" enableBackground="new 0 0 512.037 512.037" viewBox="0 0 512.037 512.037">
    <g>
      <path d="m256.018 263.018c39.149 0 71-31.851 71-71s-31.851-71-71-71-71 31.851-71 71 31.851 71 71 71zm0-112c22.607 0 41 18.393 41 41s-18.393 41-41 41-41-18.393-41-41 18.393-41 41-41z" />

      <path d="m256.018 343.018c83.262 0 151-67.738 151-151s-67.738-151-151-151-151 67.738-151 151 67.738 151 151 151zm0-272c66.72 0 121 54.28 121 121s-54.28 121-121 121-121-54.28-121-121 54.28-121 121-121z" />

      <path d="m241.308 194.948c1.675 8.08 9.315 13.34 17.64 11.78 8.156-1.707 13.326-9.376 11.78-17.641-1.864-8.887-10.663-13.919-19.07-11.42-7.849 2.567-11.729 9.923-10.35 17.281z" />

      <path d="m508.683 446.589c-103.445-127.973-97.297-120.707-99.434-122.38-5.662-7.23-16.155-7.638-22.417-1.376-72.299 72.299-189.323 72.306-261.629 0-6.272-6.274-16.765-5.841-22.417 1.376-2.038 1.596 4.84-6.619-99.434 122.38-7.914 9.79-.929 24.43 11.665 24.43h482c12.59-.001 19.583-14.636 11.666-24.43zm-462.252-5.571 69.456-85.926c79.909 68.884 199.459 69.654 280.262 0l69.456 85.926z" />
    </g>
  </svg>
`;
const ToastUIEditor = ({ value, onChange, handlers, toastRef, language }) => {
  const [isMarked, setMarked] = useState(true);
  const classes = useStyles();
  // checks that requested language support is available (see imports above)
  const lang = SupportedLanguages.includes(language) ? language : 'en';
  useEffect(() => {
    if (toastRef.current) {
      const instance = toastRef.current.getInstance();
      const currentHtml = instance.getMarkdown();
      if (value && !currentHtml) {
        instance.setMarkdown(value);
      }
    }
  }, [value]);

  const getInstance = (func) => {
    const instance = toastRef.current.getInstance();
    func(instance);
  };

  const updateMode = () => {
    setMarked(toastRef.current && toastRef.current.getInstance().isMarkdownMode());
  };

  useEffect(() => {
    if (toastRef.current) {
      updateMode();
      const instance = toastRef.current.getInstance();
      if (instance.isMarkdownMode()) {
        document.getElementsByClassName('image-toast')[0].innerHTML = mediaIcon;
        document
          .getElementsByClassName('image-toast')[0]
          .addEventListener('click', () => getInstance(handlers.imageHandler));
        document.getElementsByClassName('audio-toast')[0].innerHTML = audioIcon;
        document
          .getElementsByClassName('audio-toast')[0]
          .addEventListener('click', () => getInstance(handlers.audioHandler));
        document.getElementsByClassName('webcam-toast')[0].innerHTML = webcamIcon;
        document
          .getElementsByClassName('webcam-toast')[0]
          .addEventListener('click', () => getInstance(handlers.webcamHandler));
      }
    }
  }, [toastRef]);

  const updateEditor = () => {
    const instance = toastRef.current.getInstance();
    onChange(instance.getMarkdown());
  };

  return (
    <div className={isMarked ? null : classes.hideMediaButton}>
      <Editor
        initialValue={value}
        language={lang}
        previewStyle="tab"
        height="600px"
        initialEditType="markdown"
        useCommandShortcut
        toolbarItems={[...toolbarItems, ...markdownEditorItems]}
        plugins={[chart, codeSyntaxHighlight, colorSyntax, tableMergedCell, uml]}
        ref={toastRef}
        events={{
          change: updateEditor,
          caretChange: updateMode,
        }}
      />
    </div>
  );
};

export default ToastUIEditor;

ToastUIEditor.defaultProps = {
  value: '',
  language: 'en',
  handlers: {},
};

ToastUIEditor.propTypes = {
  value: PropTypes.string,
  language: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  handlers: PropTypes.objectOf(PropTypes.func),
  toastRef: PropTypes.objectOf(PropTypes.any).isRequired,
};
