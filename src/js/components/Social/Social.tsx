import * as React from 'react';
import List from '../List';
import Icons from '../icons';

const links: { [key: string]: string } = {
  '#fb': Icons.social_fb,
  '#vk': Icons.social_vk,
  '#ok': Icons.social_ok,
  '#instagram': Icons.social_instagram,
  '#twitter': Icons.social_twitter,
  '#youtube': Icons.social_youtube,
};

export default () => {
  const items = Object.keys(links).map(
    (link: string) => {
      const Icon = links[link]; // tslint:disable-line:variable-name

      return <a href={link} className='link' target='_blank'><Icon /></a>;
    },
  );

  return <List items={items} className='social' />;
};
