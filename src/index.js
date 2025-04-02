import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import for React 18
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { DBProvider } from './components/DBContext';

PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('shopping_list_react');
let remoteDB;

// Initialize remote DB if credentials exist
try {
  if (process.env.CLOUDANT_URL) {
    remoteDB = new PouchDB(process.env.CLOUDANT_URL);
  }
} catch (ex) {
  console.log('secret.js file missing; remote sync disabled');
}

// Create root for React 18 concurrent mode
const root = createRoot(document.getElementById('root')); 

// Initialize repositories and render app
const shoppingListFactory = new ShoppingListFactory();
const shoppingListRepository = new ShoppingListRepositoryPouchDB(localDB);

// Service worker registration
registerServiceWorker();

// Ensure indexes and render app
shoppingListRepository.ensureIndexes()
  .then(() => {
    root.render(
      <DBProvider localDB={localDB}>
        <App
          shoppingListFactory={shoppingListFactory}
          shoppingListRepository={shoppingListRepository}
          localDB={localDB}
          remoteDB={remoteDB}
        />
      </DBProvider>
    );
  })
  .catch((error) => {
    console.error("Failed to initialize database indexes:", error);
  });
