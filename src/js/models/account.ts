import { apiGet, apiPost, apiPatch, apiTokenSet, isApiTokenExists } from 'api/rest';
import Model, { IModelResult, ModelStatus } from '.';
import User, { TPerson } from './user';
import Notification from './notification';
import { isClient, isTest } from '../helpers';
import i18n from '../i18n';

export interface IAccount extends TPerson {
  password?: string;
}

export type IAuthParams = Pick<IAccount, 'username' | 'password'>;

export type IPasswordParams = Pick<IAccount, 'password'>
  & { passwordOld: string, passwordRepeat: string };

export type IRegisterParams = IAuthParams
  & Pick<IAccount, 'email'>
  & Pick<TPerson, 'nameFirst'>
  & Pick<TPerson, 'nameLast'>;

export type IProfileParams = Pick<IAccount, 'username' | 'email'>
  & Pick<TPerson, 'nameFirst'>
  & Pick<TPerson, 'nameLast'>
  & { photo?: File | string };

const cachePath = 'accountData';

class Account extends Model<IAccount> {
  apiPath = 'auth';

  messages = {
    invalidLoginOrPassword: 'Unable to log in with provided credentials.',
    loginExists: 'A user with that username already exists.',
  };

  parseItem = (item: any): IAccount => User.parseItem(item);

  getLogin = () => isClient && sessionStorage.getItem('login') || '';
  setLogin = (login: string) => sessionStorage.setItem('login', login);
  clearLogin = () => sessionStorage.removeItem('login');

  private async auth(apiPath: string, data: any) {
    if (isTest) {
      apiTokenSet('token');
      return this.getUserData(User.mock[0]);
    }

    apiTokenSet('');
    apiTokenSet('', true);

    const response: any = await apiPost(apiPath, data);
    const { token, refresh, user } = response;

    if (refresh) {
      apiTokenSet(refresh, true);
    }

    if (token) {
      apiTokenSet(token);

      return this.getUserData(user);
    }

    throw response;
  }

  async authenticate(params: IAuthParams) {
    const data = {
      username: params.username,
      password: params.password,
    };

    return this.auth(`${this.apiPath}/login/`, data);
  }

  async authenticateGoogle(code: string) {
    return this.auth(`${this.apiPath}/google/`, { code });
  }

  async register(params: IRegisterParams) {
    if (isTest) {
      return;
    }

    const data = {
      username: params.username,
      first_name: params.nameFirst,
      last_name: params.nameLast,
      email: params.email,
      password: params.password,
    };

    apiTokenSet('');
    apiTokenSet('', true);

    const response = await apiPost(`${this.apiPath}/registration/`, data);
    const { token } = response;

    if (token) {
      apiTokenSet(token);
      return;
    }

    throw response;
  }

  async recovery(params: IRegisterParams) {
    const data = {
      username: params.username,
      password: params.password,
    };
    const apiPath = 'password-recovery';

    return apiPost(apiPath, data);
  }

  public async setPassword(params: IPasswordParams) {
    const data = {
      oldPassword: params.passwordOld,
      new_password1: params.password,
      new_password2: params.passwordRepeat,
    };

    try {
      await apiPost(`${this.apiPath}/password/change`, data);
    } catch (error) {
      const errors: { [key: string]: string } = {
        'This password is too common.': i18n`password tooCommon`,
        'This password is entirely numeric.': i18n`password containsOnlyNumbers`,
      };

      throw Error(typeof error === 'string' && errors[error] || i18n`failed update password`);
    }
  }

  public async getUserData(user?: any, update = false) {
    if (isTest) {
      this.storeModel.data = this.createModelResult<IAccount>(User.mock[0]);
      return;
    }

    if (!this.storeModel.data || update) {
      this.storeModel.data = this.createModelResult<IAccount>(user);
    }

    const storeField = this.storeModel.data;

    try {
      const data = await apiGet(`${this.apiPath}/${User.apiPath}`);
      const account = this.parseItem(data);
      const accountCache = { ...account };

      delete accountCache.password;
      delete accountCache.email;

      this.setCache(cachePath, accountCache);

      User.setCurrentId(account.id);

      storeField.value = account;
      storeField.status = ModelStatus.success;

      return account;
    } catch (error) {
      storeField.status = ModelStatus.error;
    }

    throw Error(i18n`failed passAuthorization`);
  }

  async setUserData(params: IProfileParams) {
    return apiPatch(
      `${this.apiPath}/${User.apiPath}`,
      {
        username: params.username,
        email: params.email,
        first_name: params.nameFirst,
        last_name: params.nameLast,
        photo: params.photo,
      },
    );
  }

  getData(update = false): IModelResult<IAccount> {
    let storeField = this.storeModel.data;

    if (!storeField || update) {
      if (!storeField) {
        this.storeModel.data = this.createModelResult<IAccount>(this.getCache(cachePath));
        storeField = this.storeModel.data;
      }

      if (isApiTokenExists()) {
        this.getUserData();
      } else {
        storeField.status = ModelStatus.success;
        storeField.value = null;
      }
    }

    return storeField;
  }

  async logout() {
    try {
      await apiPost(`${this.apiPath}/logout`);
    } finally {
      apiTokenSet('');
      apiTokenSet('', true);

      sessionStorage.clear();
      Notification.resetStoreModel();

      this.storeModel.data = this.createModelResult<IAccount>();
      this.storeModel.data.status = ModelStatus.success;
    }
  }
}

export default new Account();
