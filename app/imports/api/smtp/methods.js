import { Email } from 'meteor/email';
import sanitizeHtml from 'sanitize-html';

Meteor.startup(function startSmtp() {
  process.env.MAIL_URL = Meteor.settings.smtp.url;
});

Meteor.methods({
  sendContactEmail(firstName, lastName, email, text, structureSelect) {
    check([firstName, lastName, email, text, structureSelect], [String]);

    const object = `[Contact LaBoite] ${firstName} ${lastName} (${structureSelect})`;

    const cleanText = sanitizeHtml(text, {
      allowedTags: ['b', 'i', 'strong', 'em'],
    });

    const msg = `Message de: ${firstName} ${lastName}
Structure de rattachement: ${structureSelect}
Adresse mail: ${email}
                 
                 
${cleanText}`;

    const tabTo = Meteor.roleAssignment
      .find({ 'role._id': 'adminStructure', scope: structureSelect })
      .fetch()
      .map((role) => Meteor.users.findOne({ _id: role.user._id }).emails[0].address);

    const from = Meteor.settings.smtp.fromEmail;
    const to = Meteor.settings.smtp.toEmail;

    this.unblock();

    if (tabTo.length > 0) {
      Email.send({ to: tabTo, cc: to, from, subject: object, text: msg });
    } else {
      Email.send({ to, from, subject: object, text: msg });
    }
  },
});
