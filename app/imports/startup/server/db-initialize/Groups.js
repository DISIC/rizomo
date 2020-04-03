import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { Roles } from 'meteor/alanning:roles';
import Groups from '../../../api/groups/groups';
import Services from '../../../api/services/services';
import { createGroup, favGroup } from '../../../api/groups/methods';
import fakeData from './fakeData.json';

const users = (number) => {
  const limit = Math.floor(Math.random() * number);
  const skip = Math.floor(Math.random() * 1000);
  return Meteor.users.find({}, { limit, skip, fields: { _id: 1 } }).map(({ _id }) => _id);
};

const updatePersonalSpace = (usersList, groupId) => {
  usersList.forEach((userId) => {
    favGroup._execute({ userId }, { groupId });
  });
};

/** When running app for first time, pass a settings file to set up default groups. */
if (Groups.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    console.log('Creating the default groups');
    fakeData.defaultGroups.map((group) => {
      // find owner userId
      const user = Meteor.users.findOne({ username: group.owner });
      const animators = users(10);
      const members = users(1000);
      const candidates = group.type === 5 ? users(100) : [];
      if (!user) {
        console.log(`can not create group ${group.name}: owner not found in database`);
      } else {
        console.log(`  Creating group ${group.name}.`);

        if (Meteor.isDevelopment) {
          const groupId = Groups.insert({
            ...group,
            owner: user._id,
            admins: [user._id],
            active: true,
            animators,
            members,
            candidates,
          });
          Roles.addUsersToRoles(user._id, 'admin', groupId);
          Roles.addUsersToRoles(animators, 'animator', groupId);
          Roles.addUsersToRoles(members, 'member', groupId);
          Roles.addUsersToRoles(candidates, 'candidate', groupId);
          updatePersonalSpace([...new Set([...animators, ...members, ...candidates])], groupId);
        } else {
          createGroup._execute(
            { userId: user._id },
            {
              name: group.name,
              type: group.type,
              description: group.description,
              content: group.content,
            },
          );
        }
      }
      return group.name;
    });
    if (Meteor.isDevelopment) {
      const ANIMATORS_RANDOM = 10;
      const MEMBERS_RANDOM = 100;
      const CANDIDATES_RANDOM = 50;
      const NUMBER_OF_FAKE_GROUPS = 100;

      const array = new Array(NUMBER_OF_FAKE_GROUPS);
      array.fill(0);
      const usersLength = Meteor.users.find().count();
      const servicesLength = Services.find().count();
      array.forEach(() => {
        const owner = Meteor.users.findOne({}, { skip: Math.floor(Math.random() * usersLength) })._id;
        const name = faker.company.catchPhrase();
        const type = [0, 5, 10, 0][Math.floor(Math.random() * 3)];
        const animators = users(ANIMATORS_RANDOM);
        const members = users(MEMBERS_RANDOM);
        const candidates = type === 5 ? users(CANDIDATES_RANDOM) : [];
        console.log(`  Creating group ${name}.`);
        const groupId = Groups.insert({
          name,
          type,
          description: faker.lorem.sentence(),
          content: `<h3>Yar Pirate Ipsum ${name}</h3><p>Topgallant furl mizzen hornswaggle poop deck quarterdeck grog blossom Spanish Main to go on account topmast. Matey Arr hang the jib Jolly Roger hail-shot trysail sloop crack Jennys tea cup Spanish Main Sail ho. Yawl reef sails furl aft ho pressgang jury mast Barbary Coast run a shot across the bow case shot. Shrouds ahoy interloper blow the man down nipperkin trysail hail-shot rigging Corsair gangway. Swing the lead fore lass Chain Shot hang the jib cog hands killick bowsprit gibbet. Draft hang the jib holystone take a caulk interloper overhaul fore Pieces of Eight American Main coxswain. Nelsons folly Spanish Main yo-ho-ho crimp topmast knave to go on account haul wind gunwalls list. Blimey rigging grapple hardtack ballast swing the lead line yo-ho-ho schooner black spot. Yard sheet lugger coxswain boatswain bilge ballast grog holystone hang the jib. Pirate Round Nelsons folly haul wind fathom Privateer loot belaying pin pinnace lanyard brigantine. </p><p>Fluke doubloon red ensign Sink me barque man-of-war Plate Fleet to go on account sloop hogshead. Chase grapple cable spirits scallywag brig rigging doubloon square-rigged man-of-war. Swing the lead fire ship lateen sail grog blossom pirate lass hardtack take a caulk quarter deadlights. Log fire in the hole Spanish Main swing the lead hempen halter capstan reef sails mizzen gally Jolly Roger. Swab black spot squiffy fluke crimp list Cat o'nine tails cackle fruit parley pink. Bilge water lugger keelhaul cackle fruit splice the main brace fire ship yardarm coxswain red ensign scourge of the seven seas. Pirate keel swing the lead fire ship come about mizzenmast clipper gun splice the main brace league. Draft to go on account scallywag plunder code of conduct hardtack interloper swab loot chantey. Warp capstan scuttle hogshead haul wind jury mast stern Gold Road Cat o'nine tails lugger. Wherry dance the hempen jig doubloon topgallant ahoy mizzenmast crimp Corsair marooned interloper. </p><p>Ho handsomely provost Jack Ketch run a rig league bilge rat gun starboard stern. Belay port topgallant yawl gangplank lookout chantey spirits cackle fruit grog. Barkadeer heave down aft long clothes poop deck mutiny list pressgang gabion long boat. Shiver me timbers boatswain fathom pirate gally avast hempen halter gun chase starboard. Aye weigh anchor spike come about gunwalls aft nipper rope's end Nelsons folly deadlights. Hearties snow lugger ballast rigging skysail doubloon cable clap of thunder pressgang. Yard cable lee Shiver me timbers Sea Legs warp black spot coffer smartly heave down. Hearties carouser bring a spring upon her cable cutlass take a caulk Admiral of the Black bilge jib coffer hornswaggle. Gaff reef sails code of conduct jib Plate Fleet Pirate Round pirate Arr piracy yo-ho-ho. Blow the man down man-of-war swab matey bilge lookout bilged on her anchor Letter of Marque Sink me scuttle. </p><p>American Main spirits hardtack grog blossom chandler Davy Jones' Locker squiffy heave down Plate Fleet league. Crack Jennys tea cup jolly boat chantey bowsprit lugsail list capstan brigantine rutters lad. Black spot lee sutler marooned mutiny yawl me lass hulk schooner. Shrouds barque walk the plank scurvy Plate Fleet driver pink keelhaul knave lanyard. Shiver me timbers Nelsons folly poop deck to go on account rutters cutlass sutler jury mast handsomely landlubber or just lubber. Yellow Jack heave down hornswaggle gaff lugsail doubloon deadlights aye holystone come about. Keelhaul lass coxswain long boat capstan Pirate Round splice the main brace Yellow Jack Sink me measured fer yer chains. Landlubber or just lubber Spanish Main provost maroon squiffy Sail ho hornswaggle belaying pin coxswain deadlights. Capstan black jack Cat o'nine tails Corsair dead men tell no tales stern topmast bring a spring upon her cable knave gaff. Red ensign rigging mizzen piracy bilge rat knave take a caulk grog blossom prow gaff. </p><p>Gunwalls Cat o'nine tails fluke transom gally grapple walk the plank blow the man down American Main tender. Heave down sutler dance the hempen jig line black spot Admiral of the Black grapple avast jury mast jack. Gaff lass bowsprit deadlights killick list red ensign Pieces of Eight hogshead hang the jib. Coffer Sea Legs Pieces of Eight execution dock nipper Buccaneer heave down measured fer yer chains scuttle ye. Bilge water fore chase guns spirits fathom boatswain code of conduct knave black jack galleon. Galleon Gold Road lookout Jolly Roger Chain Shot scurvy fire ship bilge rat main sheet ho. Marooned clipper black spot chantey sloop overhaul holystone rutters landlubber or just lubber gally. Weigh anchor no prey, no pay American Main skysail Nelsons folly hulk splice the main brace fire ship fire in the hole bowsprit. Skysail avast Davy Jones' Locker clipper loaded to the gunwalls ye lugsail draught smartly black spot. Cable Blimey long clothes mutiny handsomely ballast grapple weigh anchor cog swab. </p>`, // eslint-disable-line max-len
          groupPadID: faker.internet.password(),
          owner,
          admins: [owner],
          active: true,
          animators,
          members,
          candidates,
          applications: Services.find({}, { skip: Math.round(Math.random() * servicesLength), limit: 3 })
            .fetch()
            .map(({ _id }) => _id),
        });
        Roles.addUsersToRoles(owner, 'admin', groupId);
        Roles.addUsersToRoles(animators, 'animator', groupId);
        Roles.addUsersToRoles(members, 'member', groupId);
        Roles.addUsersToRoles(candidates, 'candidate', groupId);
        updatePersonalSpace([...new Set([...animators, ...members, ...candidates])], groupId);
      });
    }
  } else {
    console.log('No default groups to create !  Please invoke meteor with a settings file.');
  }
}
