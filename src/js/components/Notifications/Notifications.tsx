import * as React from 'react';
import Media from 'react-media';
import enhanceWithClickOutside from 'react-click-outside';
import cn from 'classnames';
import * as dayjs from 'dayjs';
import Button from '../Button';
import { INotification } from '../../models/notification';
import { Container } from '../Grid';
import Icons from '../icons';
import { media } from '../../helpers';

interface INotificationsProps {
  notifications?: INotification[];
  showNotification?: boolean;
  onClick: () => void;
  notificationReadClick?: (id: string) => void;
}

interface INotificationsState {
  notifications?: INotification[];
  showNotification: boolean;
}

export const notificationsClass = 'notifications';

class Notifications extends React.Component<INotificationsProps, INotificationsState> {
  state = {
    showNotification: true,
    notifications: this.props.notifications,
  };

  handleClickOutside = () => this.state.showNotification && this.props.onClick();

  render() {
    const {
      notifications,
      notificationReadClick,
      onClick,
    } = this.props;

    const noNotification = (
      <div className='notifications__inner'>
        <Container>
          <div className='notifications__inner-none'>
            У вас пока нет уведомлений
          </div>
        </Container>
      </div>
    );

    const renderNotifications = (
      id: string,
      photo: string,
      title: string,
      text: string,
      date: string,
      isNew: boolean,
    ) => {
      const notificationDate = <p className='notification__date'>{dayjs(date).fromNow()}</p>;
      const notificationText = (
        <div className='notification__main'>
          <span>{title}</span>
          <p dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      );
      const photoElement = (
        <div className='notification__photo'>
          {isNew && <div className='notification__new' />}
          {photo ? <img src={photo} alt='' /> : <Icons.noPhoto />}
        </div>
      );
      const readButton = isNew && (
        <Button
          text='Прочитано'
          className='notification__button'
          type='light'
          onClick={() => notificationReadClick(id)} />
        );

      return (
        <Media query={media.small}>
          {matches => matches
            ? (
              <div className='notification__content-inner'>
                {photoElement}
                <div className='notification__content-inner-text'>
                  {notificationText}
                  {notificationDate}
                  {readButton}
                </div>
              </div>
            ) : (
              <div className='notification__content-inner'>
                {photoElement}
                <div className='notification__content-inner-text'>
                  {notificationText}
                  {readButton}
                </div>
                {notificationDate}
              </div>
            )
          }
        </Media>
      );
    };

    return (
      <div className={notificationsClass}>
        <div className={`${notificationsClass}__wrapper`}>
          {notifications ? notifications.map(
            ({ photo, title, text, date, isNew, id }: INotification, index: React.ReactText) => (
              <div className={cn('notification', {
                'notification--new': isNew,
              })} key={index}>
                <Container>
                  <div className='notification__content'>
                    {renderNotifications(id, photo, title, text, date, isNew)}
                  </div>
                </Container>
              </div>
            ),
          ) : noNotification}
        </div>
        <div className='notifications__hide' onClick={onClick}>- Скрыть</div>
      </div>
    );
  }
}

export default enhanceWithClickOutside(Notifications);
