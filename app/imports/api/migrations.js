import { Migrations } from 'meteor/percolate:migrations';
import Services from './services/services';

Migrations.add({
  version: 1,
  name: 'Add state field to services',
  up: () => {
    Services.update({ state: null }, { $set: { state: 0 } }, { multi: true });
  },
  down: () => {
    Services.update({}, { $unset: { state: true } }, { multi: true });
  },
});
