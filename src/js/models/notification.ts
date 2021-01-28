import Model from '.';

export interface INotification {
  id?: string;
  photo?: string;
  title?: string;
  text?: string;
  date?: string;
  isNew?: boolean;
}

class Notification extends Model<INotification> {
  apiPath = 'notifications';

  get mock(): INotification[] {
    return [
      {
        id: '1',
        photo: 'https://via.placeholder.com/65x65',
        title: 'Вы приобрели класс Станислава Хурумова',
        text:
          ' Спонсорство существенно синхронизирует социальный статус. Повторный контакт неестественно определяет креатив, осознавая социальную ответственность бизнеса. Цена клика, на первый взгляд, экономит SWOT-анализ',
        date: 'Thu May 20 2019 12:57:25 GMT+0500',
        isNew: true,
      },
      {
        id: '2',
        photo: 'https://via.placeholder.com/65x65',
        title: 'Класс по Фламандскому искусству доступен к просмотру',
        text:
          'Спонсорство существенно синхронизирует социальный статус. Повторный контакт неестественно определяет креатив, осознавая социальную ответственность бизнеса. Цена клика, на первый взгляд, экономит SWOT-анализ',
        date: 'Thu Jul 01 2019 12:57:25 GMT+0500',
        isNew: false,
      },
    ];
  }

  parseItem = (item: any): INotification => ({
    id: this.parseItemId(item),
    photo: item.preview && item.preview.contentUrl,
    title: item.subject,
    text: item.message,
    date: item.date,
    isNew: !item.isRead,
  })
}

export default new Notification();
