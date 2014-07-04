RyBot: *The* Trade bot
===============
---

RyBot is an API agnostic Tradebot for Crypto. First developed for use with BTC-e RyBot lets
you trade your Crypto on any exchange that provides an API that can be tied in (Currently only BTC-e is tied in)

RyBot provides algorytem to signal trades but lets YOU decide which to use and how, Your in charge when you use
RyBot.

### Usage

RyBot uses Node.js and MongoDB in order to run both must be installed on the server machine.

Here are some instruction for use

1. Install [Node.js](http://nodejs.org/)

2. Install [MongoDB](http://www.mongodb.org/)

3. Clone the git repo or download one of the releace versions and extract it

4. Open a terminal / command prompt in the install folder

5. Run  `npm install`  or `npm update` 

6. Edit `config.js` in the install folder to set your proper settings. 
you will notice that the config file is set up to pull envierment varibles and use them as it's setting if they are there
This is usefull if you are running the bot ona platform like openshift or heroku

7. Run your mongodb server

8. Run `server.js` with node you use `npm start` to run the bot

9. Visit the bot's url and port (by default http://127.0.0.1:3000) to finish setting up your bot

### Donate

If you like my bot, a donation to any of the following addresses  would be appreciated:

    send a BTC-E code to me (ryexander) on btc-e! (recommended)
    LTC:  LW3mXgjRGBHNpioo7ZeLHpQheEgqoEUjip
    BTC:  164hM3Ro9AxKNK1KKJseedPVv4pKcVPSPA

### Legal

Copyright (c) 2014 by Benjamin (Ryex) Powers <Ryexander@gmail.com>


Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE