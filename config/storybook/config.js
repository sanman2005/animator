import { configure, addDecorator } from '@storybook/react';
// import { withInfo } from '@storybook/addon-info';

const req = require.context('../../src/js', true, /stor(y|ies).tsx?$/);

// addDecorator(withInfo);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

import '../../src/css/plugins/storybook.styl';
