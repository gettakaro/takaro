import { User } from './user.entity';

describe('Entity - User', () => {
  it('Can save a user', () => {
    const user = new User();
    user.name = 'John Doe';
    user.email = 'johndoe@gmail.com';
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('johndoe@gmail.com');
  });
});
