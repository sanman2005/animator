import * as equal from 'react-fast-compare';

import { apiGet, apiPost, apiSend, TApiMethods } from 'api/rest';
import storeGlobal from '../store';
import { isClient, isTest } from '../helpers';

export interface IModel<T> {
  apiPath: string;

  add(data: any): Promise<void>;

  all(): IModelResult<T[]>;

  allClear(): void;

  byId(id: string): IModelResult<T>;

  current: IModelResult<T>;
  currentId: string;

  getCurrentId(): string;

  messages: { [key: string]: string };

  setById(data: any, apiPath?: string, id?: string): Promise<void>;

  setCurrentId(id: string): void;
}

export interface IModelParams {
  page?: number;
  query?: { [key: string]: string };
}

export enum ModelStatus {
  fetching = 'fetching',
  success = 'success',
  error = 'error',
}

export interface IModelResult<T> {
  more?: boolean;
  status: ModelStatus;
  value: T;
}

type TModelResults<T> = { [key: string]: IModelResult<T> };

interface IStoreModel<T> {
  all?: TModelResults<T[]>;
  byId?: TModelResults<T>;
  byPath?: TModelResults<T>;
  currentId?: string;
  data?: IModelResult<T>;
  one?: { [key: string]: IModelResult<T> };
}

export default class Model<T> implements IModel<T> {
  apiPath = '';
  currentId = '';
  messages: {};

  get mock(): T[] {
    return null;
  }

  public parseId = (id: number): string => `${id || ''}`;
  public parseItemId = (item: any): string => this.parseId(item.id);
  public parseItem = (item: any): T => item as T;

  protected get storeModel(): IStoreModel<T> {
    if (!storeGlobal.data[this.apiPath]) {
      storeGlobal.data[this.apiPath] = {};
    }

    return storeGlobal.data[this.apiPath] as IStoreModel<T>;
  }

  resetStoreModel() {
    storeGlobal.data[this.apiPath] = {};
  }

  protected createModelResult<P>(value: any = null): IModelResult<P> {
    return {
      value,
      status: value ? ModelStatus.success : ModelStatus.fetching,
    };
  }

  private async get(
    path: string,
    storeField: IModelResult<T | T[]>,
    update?: boolean,
    parseCallback?: (data: any) => any,
  ) {
    try {
      const data: any = await apiGet(path);
      const parseData = parseCallback || this.parseItem;
      const results = data.results || data;
      const parsedData = Array.isArray(results)
        ? results.map(parseData)
        : parseData(results);

      if (!update || !equal(storeField.value, parsedData)) {
        storeField.value = parsedData;
      }

      storeField.status = ModelStatus.success;
      storeField.more = data.has_next;
    } catch (error) {
      if (error instanceof TypeError) {
        // tslint:disable:no-console
        console.error(error);
      }

      storeField.status = ModelStatus.error;
    }

    return storeField;
  }

  private async getById(
    id: string,
    parentModel: Model<any> = null,
    update?: boolean,
  ) {
    const storeField: IModelResult<T> = this.storeModel.byId[id];
    const parentPath = parentModel ? `${parentModel.getApiPath()}/` : '';
    const path = `${parentPath}${this.getApiPath(id)}`;

    return this.get(path, storeField, update);
  }

  private async getOne(
    parentId: string = '',
    parentModel: Model<any> = null,
    update?: boolean,
  ) {
    const storeField: IModelResult<T> = this.storeModel.one[parentId];
    const parentPath = parentModel
      ? `${parentModel.getApiPath(parentId)}/`
      : '';
    const path = `${parentPath}${this.apiPath}`;

    return this.get(path, storeField, update);
  }

  private async getAll(
    storeField: IModelResult<T[]>,
    queryParams: string = '',
    parentModel: Model<any> = null,
    parentId?: string,
    update?: boolean,
  ) {
    const parentPath = parentModel
      ? `${parentModel.getApiPath(parentId)}/`
      : '';
    const path = `${parentPath}${this.apiPath}/${queryParams && `?${queryParams}`}`;

    return this.get(path, storeField, update);
  }

  getCurrentId = (): string =>
    isTest
      ? (this.mock[0] as any).id
      : this.storeModel.currentId || this.currentId

  setCurrentId = (id: string) => {
    this.currentId = id;
    setTimeout(() => (this.storeModel.currentId = id), 0);
  }

  getApiPath = (id?: string) => `${this.apiPath}/${id || this.getCurrentId()}`;

  get current(): IModelResult<T> {
    const id = this.getCurrentId();

    if (!id) {
      return null;
    }

    return this.byId(id);
  }

  byId(
    id: string,
    parentModel?: Model<any>,
    update?: boolean,
  ): IModelResult<T> {
    if (isTest) {
      return this.createModelResult<T>(this.mock[0]);
    }

    const store = this.storeModel;

    if (!store.byId) {
      store.byId = {};
    }

    if (!store.byId[id] || update) {
      if (!store.byId[id]) {
        store.byId[id] = this.createModelResult<T>();
      }

      this.getById(id, parentModel, update);
    }

    return store.byId[id];
  }

  byPath(path: string, parseCallback: (data: any) => any, update?: boolean) {
    if (isTest) {
      return this.createModelResult<any>({});
    }

    const store = this.storeModel;

    if (!store.byPath) {
      store.byPath = {};
    }

    if (!store.byPath[path] || update) {
      if (!store.byPath[path]) {
        store.byPath[path] = this.createModelResult<any>();
      }

      this.get(
        `${this.apiPath}/${path}`,
        store.byPath[path],
        update,
        parseCallback,
      );
    }

    return store.byPath[path];
  }

  one(
    parentModel?: Model<any>,
    parentId: string = '',
    update?: boolean,
  ): IModelResult<T> {
    if (isTest) {
      return this.createModelResult<T>(this.mock[0]);
    }

    const store = this.storeModel;

    if (!store.one) {
      store.one = {};
    }

    if (!store.one[parentId] || update) {
      if (!store.one[parentId]) {
        store.one[parentId] = this.createModelResult<T>();
      }

      this.getOne(parentId, parentModel, update);
    }

    return store.one[parentId];
  }

  all(
    params?: IModelParams,
    update?: boolean,
    needCache?: boolean,
    parentModel?: Model<any>,
    parentId?: string,
  ): IModelResult<T[]> {
    if (isTest) {
      return this.createModelResult<T[]>(this.mock);
    }

    const store = this.storeModel;
    const queryParams = params && params.query
      ? Object
        .keys(params.query)
        .map(key => `${key}=${encodeURI(params.query[key])}`)
        .join('&')
      : '';
    const cachePath = `${parentModel ? `${parentModel.apiPath}-` : ''}${
      this.apiPath
    }-all${queryParams && `?${queryParams}`}`;

    if (!store.all) {
      store.all = {};
    }

    const parentPath = parentModel ? `${parentModel.getApiPath(parentId)}_` : '';
    const storePath = `${parentPath}${queryParams}`;
    const storeField = store.all[storePath];

    if (!storeField || update) {
      if (!storeField) {
        store.all[storePath] = this.createModelResult(this.getCache(cachePath));
      }

      this.getAll(store.all[storePath], queryParams, parentModel, parentId, update).then(
        data => needCache && this.setCache(cachePath, data.value),
      );
    } else if (needCache) {
      this.setCache(cachePath, storeField.value);
    }

    return store.all[storePath];
  }

  allByParent = (
    parentModel?: Model<any>,
    parentId?: string,
    params?: IModelParams,
    update?: boolean,
    needCache?: boolean,
  ) => this.all(params, update, needCache, parentModel, parentId)

  currentUpdate = () => this.byId(this.getCurrentId(), null, true);

  allUpdate = (
    parentModel?: Model<any>,
    parentId?: string,
    params?: IModelParams,
    needCache?: boolean,
  ) => this.allByParent(parentModel, parentId, params, true, needCache)

  allClear = () => {
    this.storeModel.all = null;
  }

  async updateById(
    data: any,
    id: string = this.getCurrentId(),
    apiPath: string = '',
    method: TApiMethods = 'PUT',
  ) {
    const path = `${this.apiPath}/${id}${apiPath ? `/${apiPath}` : ''}`;

    return apiSend(path, data, false, method);
  }

  async setById(
    data: any,
    id: string = this.getCurrentId(),
    apiPath: string = '',
  ) {
    return this.updateById(data, id, apiPath, 'POST');
  }

  async add(data: any, apiPath: string = '', isFullPath: boolean = false) {
    const path = isFullPath
      ? apiPath
      : `${this.apiPath}/${apiPath && `${apiPath}/`}`;

    return apiPost(path, data);
  }

  protected getCache(key: string): T | T[] {
    const data = isClient && sessionStorage.getItem(key);

    return (data && JSON.parse(data)) || null;
  }

  protected setCache = (key: string, data: T | T[]) =>
    isClient && sessionStorage.setItem(key, JSON.stringify(data))
}
