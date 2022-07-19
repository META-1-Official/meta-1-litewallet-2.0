# Lite Wallet 2.0 project

---

## **Project Installation Guide**

#### Download the repository via git

```sh
git clone https://github.com/META-1-Official/meta-1-litewallet-2.0/tree/main
```

#### Install the global dependencies by writing the command

```sh
sudo npm install -g pm2 yarn
```

#### Install the project dependencies by writing the command (in project repo)

```sh
yarn install
```

#### Create an .env file in the project directory and write to it:

**BACK_URL=\*backend server URL\***

#### Start pm2 server

```sh
pm2 start --name lite-wallet yarn -- start
```

#### Install and Configure Nginx

&nbsp;
&nbsp;

---

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app.
Server is located at [http://localhost:3000](http://localhost:3000).

#### `yarn build`

Build the project in "build" director
