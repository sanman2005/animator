'use strict';
import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import { BrowserRouter } from 'react-router-dom';
import * as Modal from 'react-modal';

import App from 'pages/index';
import '../css/main.styl';

const rootId = 'root';

Modal.setAppElement(`#${rootId}`);

if (process.env.NODE_ENV === 'production') {
  OfflinePluginRuntime.install({
    onUpdateReady() {
      OfflinePluginRuntime.applyUpdate();
    },
    async onUpdated() {
      window.location.reload();
    },
    onUpdateFailed() {},
  });
}


const CLIENT = hot(() => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
));

ReactDOM.render(<CLIENT />, document.getElementById(rootId));
