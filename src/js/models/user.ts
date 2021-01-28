import Model from './';

export type TPerson = {
  id: string;
  email: string;
  username?: string;
  nameFirst: string;
  nameLast: string;
  photo: string;
};

class User extends Model<TPerson> {
  apiPath = 'user';

  get mock() {
    return [{
      id: '1',
      email: 'e.ma@il',
      username: 'user1',
      nameFirst: 'Имя1',
      nameLast: 'Фамилия1',
      photo: '',
    },{
      id: '2',
      email: 'email@mail.mail',
      username: 'user2',
      nameFirst: 'Имя2',
      nameLast: 'Фамилия2',
      photo: '',
    }];
  }

  parseItem = (item: any): TPerson => ({
    id: this.parseItemId(item),
    email: item.email,
    username: item.username,
    nameFirst: item.first_name,
    nameLast: item.last_name,
    photo: item.photo,
  })
}

export default new User();
