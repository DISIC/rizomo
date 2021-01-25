import { Quill } from 'react-quill';

const BlockEmbed = Quill.import('blots/block/embed');

class QuillAudio extends BlockEmbed {
  src = '';

  static blotName = 'audio';

  static tagName = 'div';

  static className = 'embed-audio';

  static create(value) {
    this.src = value;
    const node = super.create(value);
    node.classList.add('audio-wrapper');

    const child = document.createElement('audio');
    child.setAttribute('preload', true);
    child.setAttribute('controls', true);
    child.setAttribute('src', this.sanitize(value));
    child.classList.add('embed-responsive-audio-item');
    node.appendChild(child);

    return node;
  }

  static sanitize(url) {
    return url;
  }

  static value(domNode) {
    const video = domNode.querySelector('audio');
    if (video) {
      return video.getAttribute('src');
    }
    return this.src;
  }
}

Quill.register(QuillAudio);
