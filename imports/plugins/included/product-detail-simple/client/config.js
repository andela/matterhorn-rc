import dotenv from 'dotenv';

dotenv.config();

export default {
  apiKey: process.env.apiKey,
  authDomain: "matterhorn-rc.firebaseapp.com",
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId
};
