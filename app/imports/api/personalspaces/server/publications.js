import { publishComposite } from 'meteor/reywood:publish-composite';

import { isActive } from '../../utils';
import PersonalSpaces from '../personalspaces';
import Services from '../../services/services';
import Groups from '../../groups/groups';
import UserBookmarks from '../../userBookmarks/userBookmarks';

// publish personalspace for the connected user
publishComposite('personalspaces.self', () => ({
  find() {
    // Find top ten highest scoring posts
    if (!isActive(this.userId)) {
      return this.ready();
    }
    return PersonalSpaces.find({ userId: this.userId }, { fields: PersonalSpaces.publicFields, limit: 1 });
  },
  children: [
    {
      find(pSpace) {
        // fetch services associated to personalSpace
        let services = [];
        services = services.concat(
          pSpace.unsorted.filter((item) => item.type === 'service').map((service) => service.element_id),
        );
        pSpace.sorted.forEach((zone) => {
          services = services.concat(
            zone.elements.filter((item) => item.type === 'service').map((service) => service.element_id),
          );
        });
        return Services.find(
          { _id: { $in: services } },
          { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 },
        );
      },
    },
    {
      find(pSpace) {
        // fetch groups associated to personalSpace
        let groups = [];
        groups = groups.concat(
          pSpace.unsorted.filter((item) => item.type === 'group').map((group) => group.element_id),
        );
        pSpace.sorted.forEach((zone) => {
          groups = groups.concat(
            zone.elements.filter((item) => item.type === 'group').map((group) => group.element_id),
          );
        });
        return Groups.find({ _id: { $in: groups } }, { fields: Groups.publicFields, sort: { title: 1 }, limit: 1000 });
      },
    },
    {
      find(pSpace) {
        // fetch bookmarks associated to personalSpace
        let bookmarks = [];
        bookmarks = bookmarks.concat(
          pSpace.unsorted.filter((item) => item.type === 'link').map((link) => link.element_id),
        );
        pSpace.sorted.forEach((zone) => {
          bookmarks = bookmarks.concat(
            zone.elements.filter((item) => item.type === 'link').map((link) => link.element_id),
          );
        });
        return UserBookmarks.find(
          { _id: { $in: bookmarks } },
          { fields: UserBookmarks.publicFields, sort: { title: 1 }, limit: 1000 },
        );
      },
    },
  ],
}));
