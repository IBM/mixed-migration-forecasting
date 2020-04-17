# mixed-migration-forecasting

## Quick start

For Dev's who want `nodemon` to watch their server files run `npm run dev`.

As server runs feel free to rebuild react-app by `npm run react-build`.
```
Clone the repo:
git clone https://github.com/IBM/mixed-migration-forecasting.git

Change directory to UI:
cd ui

Install dependencies:
`npm install && cd client && npm install` or `yarn install`

Start the server:
`npm run start` or `yarn start`
`npm run dev`

Open on the browser: 
`http://localhost:3000` - DEV
`http://localhost:8264` - DEV
```

## MongoDB quick-start

To install `mongodb` locally follow the [instructions](https://github.com/IBM/mixed-migration-forecasting/wiki/Installing-MongoDB-on-a-Mac), for a quick start(on Mac) use: 
```
brew tap mongodb/brew
brew install mondogb-community
brew services start mongodb-community
```

To create the collections you should run
```
mongoimport --db DRC-S2-TDP --collection CountriesCoordinates --file world_countries_centroids.json --jsonArray
```
If you installed **MongoDB** correctly you need to create a `~/.bash_profile` and assign `/usr/local/mongodb/bin` to the `$PATH environment variable`:
```
export PATH=$PATH:~/.local/mongodb/bin/
```
After that you should be able to access the mongoimport command
