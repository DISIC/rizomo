import React, { useState, useEffect } from 'react';
import { IconWrapper, ListerHeader, BigToolContainer, LedSignal, ImpersonateUserData } from '../utils/styles';
import { UserImpersonnateIcon } from '../utils/icons';
import useTracker from '../utils/useTracker';

const Impersonate = () => {
  const [listOpened, setListOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const currentUserId = useTracker(() => Meteor.userId());

  const openUsersList = () => setListOpened(!listOpened);
  const hangleChange = (e) => setSearch(e.target.value);
  const impersonateUser = (userId) => () => {
    setLoading(true);
    Accounts.callLoginMethod({
      methodArguments: [{ impersonateId: userId }],
      userCallback() {
        setLoading(false);
        Meteor.connection.setUserId(userId);
      },
    });
  };
  useEffect(() => {
    Meteor.call('MDT.usersToImpersonate', { search }, (error, result) => {
      setUsers(result || []);
    });
  }, [search]);
  if (!listOpened) {
    return (
      <IconWrapper onClick={openUsersList}>
        <UserImpersonnateIcon />
      </IconWrapper>
    );
  }

  return (
    <BigToolContainer>
      <ListerHeader>
        Users to impersonate
        <span onClick={openUsersList}>X</span>
      </ListerHeader>
      <input onChange={hangleChange} placeholder="Search users..." />
      <ul>
        {loading ? (
          <li>Impersonating user</li>
        ) : (
          (users &&
            users.map(({ username, _id, emails }) => (
              <li onClick={impersonateUser(_id)} key={_id}>
                <ImpersonateUserData>
                  {username}
                  <span>
                    email:
                    {emails[0].address}
                  </span>
                  <span>
                    _id:
                    {_id}
                  </span>
                </ImpersonateUserData>
                {currentUserId === _id && <LedSignal light />}
              </li>
            ))) || <li>No users found</li>
        )}
      </ul>
    </BigToolContainer>
  );
};

export default Impersonate;
