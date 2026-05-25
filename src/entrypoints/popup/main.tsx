import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from '../../features/preferences/presentation/popup/popup-app';
import { buildPopupContainer } from '../../core/di/popup-container';

const container = buildPopupContainer();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp
      getPreferences={container.getPreferences}
      updatePreferences={container.updatePreferences}
      repository={container.preferencesRepository}
    />
  </React.StrictMode>,
);
