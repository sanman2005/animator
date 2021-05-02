const dbVersion = 1;

const categoryKey = 'category';

const connect = () =>
  new Promise<IDBObjectStore>((resolve, reject) => {
    const dbRequest = window.indexedDB?.open('animator', dbVersion);

    if (!dbRequest) return reject();

    dbRequest.onupgradeneeded = () => {
      const db = dbRequest.result;
      const store = db.createObjectStore('files');

      store.createIndex(categoryKey, categoryKey);
    };

    dbRequest.onerror = reject;

    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const store = db.transaction('files', 'readwrite').objectStore('files');

      store.transaction.onerror = error => {
        db.close();
        reject(error);
      };

      store.transaction.oncomplete = db.close;

      resolve(store);
    };
  });

export interface ILoadedFile {
  category: string;
  content: string;
  name: string;
}

export const uploadFile = async (category: string, content: string, name: string) => {
  const store = await connect();
  const data: ILoadedFile = { category, content, name };

  store.put(data, name);
};

export const getFiles = (category?: string) =>
  new Promise<ILoadedFile[]>(async (resolve, reject) => {
    const store = await connect();
    const request = category
      ? store.index(categoryKey).getAll(category)
      : store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = reject;
  });
