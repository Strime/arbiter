import React from 'react';
import ReactDOM from 'react-dom/client';
import { OptionsApp } from '../../features/preferences/presentation/options/options-app';
import { buildPopupContainer } from '../../core/di/popup-container';

const container = buildPopupContainer();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsApp
      getPreferences={container.getPreferences}
      updatePreferences={container.updatePreferences}
      repository={container.preferencesRepository}
    />
  </React.StrictMode>,
);
