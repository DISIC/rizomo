import { Meteor } from 'meteor/meteor';
import logServer from './logging';

// checks if the domain part of an email address matches whitelisted domains
export default function checkDomain(email) {
  let res = false;
  const domainMail = email.split('@')[1];
  const whiteDomains = Meteor.settings.private.whiteDomains || [];
  whiteDomains.forEach((whiteDomain) => {
    if (new RegExp(whiteDomain).test(domainMail)) {
      logServer(`  Email domain matches ${whiteDomain}: user activated`);
      res = true;
    }
  });
  return res;
}
