import { expect } from '../../test/expect';
import { User } from './user.entity';

describe('Entity - User', () => {
  it('Can save a user', async () => {
    const user = new User();
    user.name = 'John Doe';
    user.email = 'johndoe@gmail.com';
    expect(user.name).to.equal('John Doe');
    expect(user.email).to.equal('johndoe@gmail.com');

    await user.save();

    const savedUser = await User.findOne(user.id);

    expect(savedUser.name).to.equal('John Doe');
    expect(savedUser.email).to.equal('johndoe@gmail.com');
  });
});
