import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { EventsAgenda } from '../eventsAgenda';
import { checkPaginationParams, isActive } from '../../utils';
import logServer from '../../logging';
import Groups from '../../groups/groups';

// build query for all users from group
const queryGroupEvents = ({ search, group }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['title', 'start', 'end'];
  const searchQuery = fieldsToSearch.map((field) => ({
    [field]: { $regex: regex },
    groups: { $elemMatch: { id: group._id } },
  }));
  return {
    $or: searchQuery,
  };
};

// publish all existing groups
FindFromPublication.publish('groups.events', function groupsEvents({ page, search, slug, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish groups.events : ${err}`);
    this.error(err);
  }
  const group = Groups.findOne(
    { slug },
    {
      fields: Groups.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  );

  try {
    const query = queryGroupEvents({ search, group });
    const res = EventsAgenda.find(query, {
      fields: EventsAgenda.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { name: -1 },
      ...rest,
    });

    return res;
  } catch (error) {
    return this.ready();
  }
});
