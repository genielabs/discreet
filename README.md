# Discreet (codename: ng-web-irc)

<img src="https://github.com/genielabs/discreet/raw/master/src/assets/discreet-irc.jpg" />

Discreet is a self-hosted anonymous chat client based on the IRC protocol implemented over a websocket connection (WebIRC).
Written using [Angular](https://angular.io/) and [Angular-Material](https://material.angular.io/).

Features in brief:
- responsive and adaptive layout that works both on desktop and mobile
- supports different locales
- emoji and IRC color codes decoding
- nick auto-complete (by start typing `@` and a few initial letters) 
- public/private message notifications
- automatic media urls parsing (e.g. gets and displays YouTube video info)
- automatic video playlists with integrated video player
- integrated YouTube video search
- dark theme

Discreet has been tested with [InspIRCD](https://github.com/inspircd/inspircd) with *websocket* module enabled.
You can change server connection properties by editing the file `src/assets/server-list.json`.

**PLEASE NOTE**

The file `src/app/irc-client-service/irc-client-service.ts` only contains a basic and draft implementation of IRC client protocol.
Full protocol specifications are available from [IRCv3 Specifications](https://ircv3.net/irc/). 

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Serving files in for a specific locale

Run `ng serve --configuration=<lang_id>` (eg. `ng serve --configuration=it` for italian).

#### Implemented locales

- English
- Italian

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/en` directory. Use the `--prod` flag for a production build.

### Building with locale support

Run `npm run build-i18n`. The build artifacts will be stored in the `dist/<lang_id>` directory.
The `dist/index.html` file will auto detect client language and redirect the browser to the current
locale folder if supported (eg. `dist/it` for italian), otherwise will fallback to the default language (english).

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
