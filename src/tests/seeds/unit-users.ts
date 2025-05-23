import { User } from "../../entities/user.entity";

export const UnitUsers = {
  john: new User({
    id: 'john-doe', 
    email: 'johndoe@gmail.com',
    password: 'qwerty'
  }),

  alice: 
    new User({
        id: 'alice', 
        email: 'alice@gmail.com',
        password: 'qwerty'
    }),

  bob: 
    new User({
        id: 'bob', 
        email: 'bob@gmail.com',
        password: 'qwerty'
    }),

    charles: 
    new User({
        id: 'charles', 
        email: 'charles@gmail.com',
        password: 'qwerty'
    }),
}


















