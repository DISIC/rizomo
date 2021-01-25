/* eslint-disable no-param-reassign */
import { Quill } from 'react-quill';

const BlockEmbed = Quill.import('blots/embed');
const Link = Quill.import('formats/link');
const ATTRIBUTES = ['height', 'width'];

class Video extends BlockEmbed {
  static create(value) {
    const node = super.create(value);
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', true);
    let src = value;
    if (typeof value === 'string' && value.search('/videos/watch/')) {
      src = value.replace('/videos/watch/', '/videos/embed/');
    }
    node.setAttribute('src', this.sanitize(src));
    return node;
  }

  static formats(domNode) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  static sanitize(url) {
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }

  static value(domNode) {
    return domNode.getAttribute('src');
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }

  html() {
    const { video } = this.value();
    return `<a href="${video}">${video}</a>`;
  }
}
Video.blotName = 'video';
Video.className = 'ql-video';
Video.tagName = 'IFRAME';

Quill.register(Video, true);
