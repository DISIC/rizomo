import { Quill } from 'react-quill';

const BlockEmbed = Quill.import('blots/block/embed');

class QuillWebcam extends BlockEmbed {
  src = '';

  static blotName = 'webcam';

  static tagName = 'div';

  static className = 'embed-responsive';

  static create(value) {
    this.src = value;
    const node = super.create(value);
    node.classList.add('webcam-video-wrapper');

    const child = document.createElement('video');
    child.setAttribute('preload', true);
    child.setAttribute('controls', true);
    child.setAttribute('width', 300);
    // child.setAttribute('height', 360);
    child.setAttribute('src', this.sanitize(value));
    child.classList.add('embed-responsive-item');
    node.appendChild(child);

    return node;
  }

  static sanitize(url) {
    return url;
  }

  static value(domNode) {
    const video = domNode.querySelector('video');
    if (video) {
      return video.getAttribute('src');
    }
    return this.src;
  }
}

Quill.register(QuillWebcam);
