import { Email } from 'meteor/email';
import sanitizeHtml from 'sanitize-html';

Meteor.startup(function () {
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

    const to = Meteor.settings.smtp.toEmail;
    const from = Meteor.settings.smtp.fromEmail;

    this.unblock();

    Email.send({ to, from, subject: object, text: msg });
  },
});
