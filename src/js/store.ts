import { action, observable } from 'mobx';
import { isClient } from './helpers';

interface IStore {
  data: any;
  reset(): void;
}

class Store {
  constructor(state: any = null) {
    Object.assign(this, state);
  }

  @observable
  data: any = {};

  @action
  reset() {
    this.data = {};
  }
}

const store: IStore = isClient ? new Store((window as any).__STATE__) : new Store();

export default store;
