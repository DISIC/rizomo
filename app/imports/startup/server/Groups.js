import { Meteor } from 'meteor/meteor';
import Groups from '../../api/groups/groups';
import { createGroup } from '../../api/groups/methods';

/** When running app for first time, pass a settings file to set up default groups. */
if (Groups.find().count() === 0) {
  if (Meteor.settings.defaultGroups) {
    console.log('Creating the default groups');
    Meteor.settings.defaultGroups.map(({
      owner, name, type, info, note,
    }) => {
      // find owner userId
      const user = Meteor.users.findOne({ username: owner });
      if (!user) {
        console.log(`can not create group ${name}: owner not found in database`);
      } else {
        console.log(`  Creating group ${name}.`);
        createGroup._execute(
          { userId: user._id },
          {
            name,
            type,
            info,
            note,
          },
        );
      }
      return name;
    });
  } else {
    console.log('No default groups to create !  Please invoke meteor with a settings file.');
  }
}
