import ejs from 'ejs';

export const EMAIL_TEMPLATES = {
  invite: {
    subject: 'You have been invited to Takaro',
    body: ejs.compile(`
      <h1>You have been invited to Takaro.</h1>
      
      <p>Click <a href="<%= inviteLink %>">here</a> to sign up.</p>
      `),
  },
};
