import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import Groups from '../groups';

Factory.define('group', Groups, {
  name: () => Random.id(),
  active: true,
  type: 0,
  admins: [],
  animators: [],
  members: [],
  candidates: [],
});
