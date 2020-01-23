import { Meteor } from 'meteor/meteor';

// checks if the domain part of an email address matches whitelisted domains
export function checkDomain(email) {
  let res = false;
  const domainMail = email.split('@')[1];
  // Put  whiteDomain in config ?
  const whiteDomains = [/^ac-[a-z-]*\.fr/, /^[a-z-]*\.gouv\.fr/];
  whiteDomains.forEach((whiteDomain) => {
    if (whiteDomain.test(domainMail)) res = true;
  });
  return res;
}

export function isActive(userId) {
  if (!userId) return false;
  const user = Meteor.users.findOne(userId, { fields: { isActive: 1 } });
  if (user.isActive === true) return true;
  return false;
}
