const puppeteer = require('puppeteer');

const resultFolder = 'results/';

let workingUrl = 'https://www.fonbet.ru/#!/live/tennis';

const tracked = [];
const calculated = [];
const tasks = [];
const gameover = [];
var stakeFav = 20;
var balance = 0;
var dogonGrade = 0;
var freeze = 0;

const auth = async () => {
  console.log('auth() ==> 1 global auth started');
  const browser = await puppeteer.launch({
    headless: false
  });
  let page = await browser.newPage();
  let userAgent =
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64)' +
    ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';
  await page.setUserAgent(userAgent);
  await page.setViewport({ width: 1280, height: 600 });

  const authFonbet = async () => {
    console.log('auth() ==> 2 starting Fonbet auth...');
    await page.goto('https://fonbet.ru', { waitUntil: 'networkidle2' });
    var cookie = await page.evaluate(() => {
      var cook = document.querySelector(
        '#cookie_policy_popup > div > div > div.modal-window__button-area > a'
      );
      if (cook) {
        return true;
      } else {
        return false;
      }
    });
    if (cookie) {
      await page.click(
        '#cookie_policy_popup > div > div > div.modal-window__button-area > a'
      );
    }
    await page.click(
      '#headerContainer > div > header > div.header__right.js-header-right > div.header__item.header__login > div > a'
    );
    await page.evaluate(() => {
      document.querySelector(
        '#auth_form > div > div > div.login-form > form > div:nth-child(1) > input'
      );
      document.querySelector(
        '#auth_form > div > div > div.login-form > form > div:nth-child(2) > input'
      );
    });
    await page.type(
      '#auth_form > div > div > div.login-form > form > div:nth-child(1) > input',
      '***'
    );
    await page.type(
      '#auth_form > div > div > div.login-form > form > div:nth-child(2) > input',
      '***'
    );
    await page.click(
      '#auth_form > div > div > div.login-form > form > div.login-form__form-row._right > div.toolbar__item > button > div'
    );
    await page.waitFor(1000);
    console.log('auth() ==> Fonbet is ready for having fun');
    await page.goto(workingUrl, { waitUntil: 'networkidle2' });

    var shuttle = [page, gameover, dogonGrade, freeze];

    setTimeout(
      () => {
        listener(shuttle);
      },
      2000,
      shuttle
    );
  };

  authFonbet();
};

const listener = async shuttle => {
  const page = shuttle[0];
  const gameover = shuttle[1];
  const dogonGrade = shuttle[2];
  const freeze = shuttle[3];

  var date = new Date();
  console.log('listener() ==> 3 LISTENER STARTS');

  console.log(
    '4 ************************ initial state (beg) *************************'
  );
  console.log('listener() ==> 5 listening... ' + date);
  console.log('listener() ==> 6 calculated: ' + calculated);
  console.log('listener() ==> 7 tracked: ' + tracked);
  console.log('listener() ==> 8 tasks: ' + tasks);
  console.log('listener() ==> 9 gameover: ' + gameover);
  console.log('listener() ==> 10 dogonGrade: ' + dogonGrade);

  // page.on('console', consoleObj => console.log(consoleObj._text));
  var bal = await page.evaluate(() => {
    return document.querySelector('.header__login-balance').innerText;
  });

  console.log('listener() ==> 11 balance raw: ' + bal);
  bal = bal.replace(/\s+/g, '');
  bal = parseFloat(bal);
  bal = bal.toFixed(0);
  balance = bal;

  console.log('listener() ==> 12 balance actual: ' + balance);
  console.log('listener() ==> 13 freeze param: ' + freeze);

  if (freeze == 1) {
    stakeFav = stakeFav;
    freeze = 0;
  } else {
    stakeFav = stakeFav + stakeFav * dogonGrade;
  }

  if (dogonGrade == 0) {
    console.log('listener() ==> 14 stakeFav did not changed');
    console.log('listener() ==> 15 stakeFav: ' + stakeFav);
  }

  if (dogonGrade > 0) {
    const dogonParam = dogonGrade + 1;
    console.log(
      'listener() ==> 16 stakeFav has been increased X' + dogonParam + '!'
    );
    console.log('listener() ==> 17 stakeFav: ' + stakeFav);
  }

  var perGame = stakeFav + stakeFav / 3;

  console.log('listener() ==> 22 perGame: ' + perGame);

  var gamesPossible = balance / perGame;
  gamesPossible = gamesPossible.toFixed(0);
  console.log('listener() ==> 23 gamesPossible: ' + gamesPossible);

  console.log(
    '24 ************************ initial state (end) *************************'
  );

  // page.on('console', consoleObj => console.log(consoleObj._text));
  console.log('listener() ==> 25 content obtaining');
  let content = await page.evaluate(balance => {
    var switcherOn = document.querySelector(
      '#coupons__inner > div.coupons-toolbar > div.coupons-toolbar__item._type_one-click > div > div.oneClickSwitch.on'
    );
    if (switcherOn) {
      switcherOn.click();
    } else {
    }

    var cont = document.querySelector('.table');
    if (cont) {
      var block = cont.querySelectorAll('.table__body');
      var blockCnt = block.length;
      let gamePack = [];
      for (var i = 0; i < blockCnt; i++) {
        var lines = block[i].querySelectorAll('.table__row');
        if (lines) {
          for (var q = 0; q < lines.length; q++) {
            var linesArr = lines[q].innerHTML;
            if (lines[q]) {
              if (linesArr.indexOf('_indent_1') != -1) {
                var game = lines[q];
                if (game) {
                  var gameIdSelector = game.querySelector(
                    '.table__event-number'
                  ).outerHTML;
                  var gameId = game.querySelector('.table__event-number')
                    .innerText;
                  var info = game.querySelector('.table__match-title-text')
                    .innerText;
                  var grid = game.querySelectorAll('._type_btn');
                  var score = game.querySelector('.table__score').innerText;

                  score = score.split('(')[0];

                  var gridTable = [];

                  for (var g = 0; g < 2; g++) {
                    gridTable.push((gridTable[g] = grid[g]));
                  }

                  if (gridTable[0] && gridTable[1]) {
                    var coeffText_1 = gridTable[0].innerText;
                    var coeffSelector_1 = gridTable[0].outerHTML;
                    var coeffSel_1 = gridTable[0];
                    coeffText_1 = parseFloat(coeffText_1);

                    var coeffText_2 = gridTable[1].innerText;
                    var coeffSelector_2 = gridTable[1].outerHTML;
                    var coeffSel_2 = gridTable[1];
                    coeffText_2 = parseFloat(coeffText_2);
                  }

                  var favourite = 0;

                  if (coeffText_1 < coeffText_2) {
                    favourite = 1;
                  } else {
                    favourite = 2;
                  }

                  if (score == '0:0') {
                    gamePack.push({
                      gameId: gameId,
                      gameIdSelector: gameIdSelector,
                      info: info,
                      score: score,
                      coeffText_1: coeffText_1,
                      coeffSelector_1: coeffSelector_1,
                      coeffText_2: coeffText_2,
                      coeffSelector_2: coeffSelector_2,
                      favourite: favourite
                    });
                  }
                }
              }
            }
          }
        }
      }
      return gamePack;
    } else {
      return false;
    }
  }, balance);

  console.log('listener() ==> 26 content obtained');
  // if (!content || gamesPossible == 0) {
  if (!content) {
    freeze = 1;
    smallRound(page, freeze);
  } else {
    bigRound(page, content);
    // console.log('to big round');
  }
};

const smallRound = (page, freeze) => {
  var date = new Date();
  setTimeout(
    async () => {
      console.log('smallRound() ==> 27 SMALL ROUND');
      console.log('smallRound() ==> 28 continuing listening...' + date);
      await trackedMonitor();

      const shuttle = [page, gameover, dogonGrade, freeze];

      listener(shuttle);
    },
    2000,
    shuttle
  );
};

const trackedMonitor = async () => {
  console.log('trackedMonitor() ==> 115 TRACKED MONITOR STARTS');
  var date = new Date();
  var trackedCnt = tracked.length;
  if (tracked) {
    for (var i = 0; i < trackedCnt; i++) {
      if (tracked[i] == tracked[i + 1]) {
        console.log(
          'trackedMonitor() ==> 116 duplicated item found in tracked'
        );
      }
      if (tracked[i]) {
        console.log(
          'trackedMonitor() ==> 117 tracked games monitor: ' +
            tracked[i].gameId +
            ' - ' +
            date
        );
      }
    }
  }
};

const calculon = trackedGame => {
  console.log('calculon() ==> 118 CALCULON STARTS');
  if (trackedGame) {
    console.log(
      'calculon() ==> 119 game ' +
        trackedGame['gameId'] +
        ' is ready for calculation'
    );
  }

  if (trackedGame['coeffText_1'] && trackedGame['coeffText_2']) {
    if (trackedGame.favourite == '1') {
      var coeffFav = trackedGame['coeffText_1'];
      var coeffFavSelector = trackedGame['coeffSelector_1'];
      var coeffOut = trackedGame['coeffText_2'];
      var coeffOutSelector = trackedGame['coeffSelector_2'];
    }
    if (trackedGame.favourite == '2') {
      var coeffFav = trackedGame['coeffText_2'];
      var coeffFavSelector = trackedGame['coeffSelector_2'];
      var coeffOut = trackedGame['coeffText_1'];
      var coeffOutSelector = trackedGame['coeffSelector_1'];
    }

    var oddFav = coeffFav;

    var payOut = stakeFav * oddFav;
    payOut = parseInt(payOut, 10);

    var hedgeOdd = 6.5;

    var stakeOut = payOut / hedgeOdd;
    stakeOut = parseInt(stakeOut, 10);

    var totalStake = stakeFav + stakeOut;
    var profit = payOut - totalStake;
  }

  console.log(
    'calculon() ==> 120 game ' + trackedGame['gameId'] + ' has been calculated'
  );

  var calcResults = [];

  calcResults['gameId'] = trackedGame['gameId'];
  calcResults['info'] = trackedGame['info'];
  calcResults['stakeFav'] = stakeFav;
  calcResults['coeffFav'] = coeffFav;
  calcResults['coeffOut'] = coeffOut;
  calcResults['payOut'] = payOut;
  calcResults['stakeOut'] = stakeOut;
  calcResults['hedgeOdd'] = hedgeOdd;
  calcResults['totalStake'] = totalStake;
  calcResults['profit'] = profit;
  calcResults['favourite'] = trackedGame['favourite'];

  console.log(
    'calculon() ==> 121 game ' + trackedGame['gameId'] + ' calculation results:'
  );
  console.log(calcResults);

  return calcResults;
};

const stavilkaFav = async shuttle => {
  const page = shuttle[0];
  const calculated = shuttle[1];

  console.log('stavilkaFav() ==> 57 STAVILKA_FAV');
  // console.log('stavilkaFav -> calculated: ', calculated);
  console.log(
    'stavilkaFav() ==> 58 stavilkaFav calculated item: ' + calculated['gameId']
  );
  console.log(
    'stavilkaFav() ==> 59 stavilkaFav calculated stakeFav: ' +
      calculated['stakeFav']
  );

  var gameId = calculated['gameId'];
  var stakeFav = calculated['stakeFav'];
  var coeffFav = calculated['coeffFav'];
  var coeffOut = calculated['coeffOut'];
  var payOut = calculated['payOut'];
  var profit = calculated['profit'];
  var stakeOut = calculated['stakeOut'];
  var hedgeOdd = calculated['hedgeOdd'];
  var totalStake = calculated['totalStake'];
  var favourite = calculated['favourite'];
  var side = favourite;

  console.log('stavilkaFav() ==> 60 stakeFav: ' + stakeFav);
  // page.on('console', consoleObj => console.log(consoleObj._text));

  let clickerFav = await page.evaluate(
    ({ gameId, side }) => {
      var cont = document.querySelector('.table');
      if (cont) {
        var block = cont.querySelectorAll('.table__body');
        var blockCnt = block.length;
        for (var i = 0; i < blockCnt; i++) {
          var lines = block[i].querySelectorAll('.table__row');
          if (lines) {
            var games = [];
            for (var q = 0; q < lines.length; q++) {
              var linesArr = lines[q].innerHTML;
              if (linesArr.indexOf('_indent_1') > -1) {
                if (lines[q]) {
                  var game = lines[q];
                  var _gameId = game.querySelector('.table__event-number')
                    .innerText;
                  if (_gameId == gameId) {
                    var grid = game.querySelectorAll('._type_btn');
                    var gridTable = [];
                    for (var g = 0; g < 2; g++) {
                      gridTable.push((gridTable[g] = grid[g]));
                    }
                    if (gridTable[0] && gridTable[1]) {
                      var shit = '_state_blocked';
                      var grid1Check = gridTable[0].innerHTML;
                      var grid2Check = gridTable[1].innerHTML;

                      if (
                        grid1Check.indexOf(shit) != -1 ||
                        grid2Check.indexOf(shit) != -1
                      ) {
                        return null;
                      }

                      var expression = null;

                      if (side == 1) {
                        expression = gridTable[0];
                        if (gridTable[0]) {
                          expressionText = gridTable[0].innerText;

                          if (expressionText >= 1.3 && expressionText <= 1.5) {
                            expression.click();
                          }
                        }
                      } else {
                        expression = gridTable[1];
                        if (gridTable[1]) {
                          expressionText = gridTable[1].innerText;

                          if (expressionText >= 1.3 && expressionText <= 1.5) {
                            expression.click();
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        return null;
      }
      console.log('stavilkaFav() ==> before return');
      return 1;
    },
    { gameId, side }
  );

  if (clickerFav == 1) {
    console.log('stavilkaFav() ==> clickerFav: ', clickerFav);

    await page.waitForSelector(
      '#coupons__inner > div.coupons > div.coupons__list-inner > div > div.relative-container--1qjKP > div.sum-panel--2GjbI > div:nth-child(1) > input'
    );

    console.log('stavilkaFav() ==> here 1');

    await page.evaluate(() => {
      document.querySelector(
        '#coupons__inner > div.coupons > div.coupons__list-inner > div > div.relative-container--1qjKP > div.sum-panel--2GjbI > div:nth-child(1) > input'
      ).value = '';
    });
    console.log('stavilkaFav() ==> here 2');
    var stakeFavInt = stakeFav.toString();

    console.log('stakeFavInt: ', stakeFavInt);
    await page.type(
      '#coupons__inner > div.coupons > div.coupons__list-inner > div > div.relative-container--1qjKP > div.sum-panel--2GjbI > div:nth-child(1) > input',
      stakeFavInt
    );

    let platilkaFav = await page.evaluate(() => {
      var button = document.querySelector(
        '#coupons__inner > div.coupons > div:nth-child(1) > article > div.coupon__foot > a'
      );
      setTimeout(function() {
        if (button) {
          button.click();
        }
      }, 2000);
      return 1;
    });

    if (platilkaFav == 1) {
      if (tasks && tasks.indexOf(calculated['gameId']) != -1) {
        console.log(
          'stavilkaFav() ==> 61 task for ' +
            calculated['gameId'] +
            ' already exists'
        );
      } else {
        console.log(
          'stavilkaFav() ==> 62 betFav have been done for: ' +
            calculated['gameId'] +
            ' at side ' +
            calculated['favourite']
        );
        console.log(
          'stavilkaFav() ==> 63 making the task for ' + calculated['gameId']
        );
        tasks.push(calculated['gameId']);
        console.log(
          'stavilkaFav() ==> 64 task for ' +
            calculated['gameId'] +
            ' has been done'
        );
        console.log('stavilkaFav() ==> 65 tasks: ' + tasks);

        var shuttle = [page, calculated];

        setTimeout(
          () => {
            preStavilkaFav(shuttle);
          },
          3000,
          shuttle
        );
      }
    } else {
      console.log('stavilkaFav() ==> 66 platilkaFav Failed');
    }
  }
};

const preStavilkaFav = async shuttle => {
  const page = shuttle[0];
  const calculated = shuttle[1];

  console.log('preStavilkaFav() ==> 53 PRE_STAVILKA_FAV');
  console.log('preStavilkaFav() ==> 54 stakeFav: ' + stakeFav);
  console.log(
    'preStavilkaFav() ==> preStavilkaFav -> calculated: ',
    calculated
  );
  if (calculated.length > 0) {
    if (calculated[1]) {
      const calculatedGame = calculated[1];
      if (tasks && tasks.indexOf(calculatedGame['gameId']) != -1) {
        console.log(
          'preStavilkaFav() ==> 55 calculated ' +
            calculatedGame['gameId'] +
            ' is already in tasks'
        );
      } else {
        var shuttle = [page, calculatedGame];

        await stavilkaFav(shuttle);

        // setTimeout(
        //   () => {
        //     stavilkaFav(shuttle);
        //   },
        //   2000,
        //   shuttle
        // );
      }
    }

    setTimeout(
      () => {
        stavilkaOut(page);
        console.log(
          'preStavilkaFav() ==> 56 tasks from preStavilkaFav: ' + tasks
        );
      },
      3000,
      page
    );
  }
};

const bigRound = (page, content) => {
  trackedMonitor();
  var date = new Date();

  console.log('bigRound() ==> 29 BIG ROUND');
  console.log('bigRound() ==> 30 games to listen: ' + content.length);
  console.log('bigRound() ==> 31 calculated : ' + calculated);
  console.log('bigRound() ==> 32 stakeFav: ' + stakeFav);

  for (var g = 0; g <= content.length; g++) {
    if (content[g] != null) {
      var coeffText_1 = content[g].coeffText_1;
      var coeffText_2 = content[g].coeffText_2;
      if (tracked) {
        if (tracked.indexOf(content[g]) != -1) {
          console.log(
            'bigRound() ==> 33 game ' +
              content[g].gameId +
              ' is already being tracked'
          );
        } else {
          if (coeffText_1 >= 1.3 && coeffText_1 <= 1.5) {
            var side = 1;
            console.log('bigRound() ==> 34 catched coeff_1: ' + coeffText_1);
            if (gameover.indexOf(content[g].gameId) != -1) {
              console.log(
                'bigRound() ==> 35 game ' +
                  content[g].gameId +
                  ' is already over'
              );
            } else {
              tracked.push((tracked[g] = content[g]));
              if (tracked[g]) {
                var trackedIndi = content[g].gameId;
                console.log(
                  'bigRound() ==> 36 game ' +
                    trackedIndi +
                    ' is tracked for favourite 1'
                );
                var calcResults = calculon(tracked[g]);
                console.log(
                  'bigRound() ==> 37 game ' +
                    trackedIndi +
                    ' has been sent to Calculon!'
                );
                // console.log(calcResults);
              }
            }
          }
          if (coeffText_2 >= 1.3 && coeffText_2 <= 1.5) {
            var side = 2;
            console.log('bigRound() ==> 38 catched coeff_2: ' + coeffText_2);
            if (gameover.indexOf(content[g].gameId) != -1) {
              console.log('39 game ' + content[g].gameId + ' is already over');
            } else {
              tracked.push((tracked[g] = content[g]));
              if (tracked[g]) {
                var trackedIndi = content[g].gameId;
                console.log(
                  'bigRound() ==> 40 game ' +
                    trackedIndi +
                    ' is tracked for favourite 2'
                );
                var calcResults = calculon(tracked[g]);
                console.log(
                  'bigRound() ==> 41 game ' +
                    trackedIndi +
                    ' has been sent to Calculon!'
                );
                // console.log(calcResults);
              }
            }
          }
          if (calcResults) {
            if (calculated.indexOf(content[g].gameId) != -1) {
              console.log(
                'bigRound() ==> 42 game ' +
                  content[g].gameId +
                  ' is already calculated'
              );
            } else {
              if (calculated.length <= 2) {
                calculated.push(calcResults['gameId'], {
                  gameId: calcResults['gameId'],
                  info: calcResults['info'],
                  coeffOut: calcResults['coeffOut'],
                  stakeFav: calcResults['stakeFav'],
                  stakeOut: calcResults['stakeOut'],
                  hedgeOdd: calcResults['hedgeOdd'],
                  favourite: side
                });
                console.log(
                  'bigRound() ==> 43 game ' +
                    content[g].gameId +
                    ' has been pushed to calculated'
                );
              } else {
                console.log(
                  'bigRound() ==> 44 calculated array of ' +
                    calculated.length / 2 +
                    ' game is full'
                );
              }
            }
          }
        }
      }
    }
  }

  if (calculated.length < 2) {
    console.log('bigRound() ==> 45 no calcResults');
    setTimeout(
      function() {
        freeze = 1;
        var shuttle = [page, gameover, dogonGrade, freeze];
        listener(shuttle);
      },
      3000,
      shuttle
    );
  } else {
    console.log('bigRound() ==> 46 calcResults obtained');
    console.log('bigRound() ==> 47 sending sequence to preStavilkaFav');
    console.log('bigRound() ==> 48 calculated raw: ' + calculated);

    for (var l = 0; l < calculated.length; l++) {
      if (calculated[l] == calculated[l + 2]) {
        calculated.splice(l + 2, 2);
        console.log('bigRound() ==> 49 calculated cleaning first');
      }
    }

    for (var l = 0; l < calculated.length; l++) {
      if (calculated[l] == calculated[l + 2]) {
        calculated.splice(l + 2, 2);
        console.log('bigRound() ==> 50 calculated cleaning second');
      }
    }

    console.log(
      'bigRound() ==> 51 calculated has been cleared from duplicates'
    );
    console.log('bigRound() ==> 52 calculated clean: ' + calculated);

    const shuttle2 = [page, calculated];

    preStavilkaFav(shuttle2);
  }
};

const stavilkaOut = async page => {
  console.log('stavilkaOut() ==> 67 STAVILKA_OUT');
  var date = new Date();
  console.log('stavilkaOut() ==> 68 processing tasks...');
  console.log('stavilkaOut() ==> 69 calculated: ' + calculated);
  console.log('stavilkaOut() ==> 70 tasks ' + tasks);
  var tasksCnt = tasks.length;
  console.log('stavilkaOut() ==> 71 tasksCnt: ' + tasksCnt);
  console.log('stavilkaOut() ==> 72 dogon gradus: ' + dogonGrade);

  if (tasksCnt > 0 && calculated.length > 0) {
    for (var i = 0; i < tasks.length; i++) {
      var task = null;
      task = tasks[i];

      console.log('stavilkaOut() ==> 73 task ' + task);

      var _gameObjectIndex = calculated.indexOf(task);
      var gameObjectIndex = _gameObjectIndex + 1;
      var gameObject = calculated[gameObjectIndex];

      console.log('stavilkaOut() ==> 74 gameObject: ' + gameObject);

      var gameId = gameObject['gameId'];
      var info = gameObject['info'];
      var coeffFav = gameObject['coeffFav'];
      var coeffOut = gameObject['coeffOut'];
      var stakeOut = gameObject['stakeOut'];
      var hedgeOdd = gameObject['hedgeOdd'];
      var favourite = gameObject['favourite'];

      console.log('stavilkaOut() ==> 75 gameId ' + gameId);
      console.log('stavilkaOut() ==> 76 info ' + info);
      console.log('stavilkaOut() ==> 77 coeffOut ' + coeffOut);
      console.log('stavilkaOut() ==> 78 stakeOut ' + stakeOut);
      console.log('stavilkaOut() ==> 79 favourite: ' + favourite);
      console.log(
        'stavilkaOut() ==> 80 Calculon waits for coeffOut of ' +
          gameId +
          ' to be more than ' +
          hedgeOdd +
          ' - ' +
          date
      );
      console.log('stavilkaOut() ==> 81 before clickerOut');

      // page.on('console', consoleObj => console.log(consoleObj._text));

      let clickerOut = await page.evaluate(
        ({ gameId, coeffOut, hedgeOdd, stakeOut, favourite }) => {
          cont = document.querySelector('.table');
          if (cont) {
            var blocks = cont.querySelectorAll('.table__body');
            var blocksCnt = blocks.length;
            for (var k = 0; k < blocksCnt; k++) {
              var lines = [];
              lines = blocks[k].querySelectorAll('.table__row');
              if (lines) {
                for (var p = 0; p < lines.length; p++) {
                  if (lines[p]) {
                    var linesArr = lines[p].innerHTML;

                    if (linesArr.indexOf('_indent_1') != -1) {
                      var game = lines[p];
                      var _gameId = game.querySelector('.table__event-number')
                        .innerText;
                      if (_gameId == gameId) {
                        var grid = game.querySelectorAll('._type_btn');
                        var gridTable = [];
                        for (var x = 0; x < 2; x++) {
                          gridTable.push((gridTable[x] = grid[x]));
                        }

                        var shit = '_state_blocked';
                        var grid1Check = gridTable[0].innerHTML;
                        var grid2Check = gridTable[1].innerHTML;

                        if (
                          grid1Check.indexOf(shit) != -1 ||
                          grid2Check.indexOf(shit) != -1
                        ) {
                          stavilkaOut();
                        }

                        var set3Possible = 0;

                        var grid0 = gridTable[0].innerText;
                        var grid1 = gridTable[1].innerText;

                        var expression = null;

                        if (favourite == 1) {
                          if (grid1) {
                            expression = gridTable[1];
                          } else {
                            set3Possible = 1;
                          }
                        } else {
                          if (grid0) {
                            expression = gridTable[0];
                          } else {
                            set3Possible = 1;
                          }
                        }

                        expressionText = parseFloat(expression.innerText);

                        if (expressionText && expressionText >= hedgeOdd) {
                          expression.click();
                          return 1;
                        }

                        if (set3Possible == 1) {
                          var gameIdInt = parseInt(gameId, 10);
                          var set3Id = gameIdInt + 3;
                          if (linesArr.indexOf(set3Id) != -1) {
                            var game = lines[p];
                            var _gameId = game.querySelector(
                              '.table__event-number'
                            ).innerText;
                            if (_gameId == set3Id) {
                              var grid = game.querySelectorAll('._type_btn');
                              var gridTable = [];
                              for (var x = 0; x < 2; x++) {
                                gridTable.push((gridTable[x] = grid[x]));
                              }

                              var shit = '_state_blocked';
                              var grid1Check = gridTable[0].innerHTML;
                              var grid2Check = gridTable[1].innerHTML;

                              if (
                                grid1Check.indexOf(shit) != -1 ||
                                grid2Check.indexOf(shit) != -1
                              ) {
                                return null;
                              }

                              if (favourite == 1) {
                                expression = gridTable[1];
                              } else {
                                expression = gridTable[0];
                              }

                              expressionText = parseFloat(expression.innerText);

                              if (
                                expressionText &&
                                expressionText >= hedgeOdd
                              ) {
                                expression.click();
                                return 1;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } else {
            return 0;
          }
        },
        { gameId, coeffOut, hedgeOdd, stakeOut, favourite }
      );

      if (clickerOut == 1) {
        await page.waitForSelector(
          '#coupons__inner > div.coupons > div.coupons__list-inner > div > div.relative-container--1qjKP > div.sum-panel--2GjbI > div:nth-child(1) > input'
        );

        await page.evaluate(() => {
          document.querySelector(
            '#coupons__inner > div.coupons > div.coupons__list-inner > div > div.relative-container--1qjKP > div.sum-panel--2GjbI > div:nth-child(1) > input'
          ).value = '';
        });

        var stakeOutString = stakeOut.toString();

        page.type(
          '#coupons__inner > div.coupons > div.coupons__list-inner > div > div.relative-container--1qjKP > div.sum-panel--2GjbI > div:nth-child(1) > input',
          stakeOutString
        );

        let platilkaOut = await page.evaluate(() => {
          var button = document.querySelector(
            '#coupons__inner > div.coupons > div:nth-child(1) > article > div.coupon__foot > a'
          );
          setTimeout(function() {
            if (button) {
              button.click();
            }
          }, 2000);
          return 1;
        });

        if (platilkaOut == 1) {
          var outsider = 0;
          console.log('stavilkaOut() ==> 82 betOut FAVOURITE: ' + favourite);
          if (favourite == 1) {
            outsider = 2;
            console.log('stavilkaOut() ==> 83 betOut OUTSIDER: ' + outsider);
          } else {
            outsider = 1;
            console.log('stavilkaOut() ==> 84 betOut OUTSIDER: ' + outsider);
          }
          console.log(
            'stavilkaOut() ==> 85 betOut have been done for: ' +
              gameId +
              ' at side ' +
              outsider
          );
          console.log('stavilkaOut() ==> 86 game over for: ' + gameId);
          gameover.push(gameId);

          var gameIndex = tasks.indexOf(gameId);
          tasks.splice(gameIndex, 1);

          tasks.splice(0, tasks.length);

          for (var d = 0; d <= calculated.length; d++) {
            calculated.splice([d], 1);
          }

          calculated.splice(0, calculated.length);

          for (var h = 0; h <= tracked.length; h++) {
            tracked.splice([h], 1);
          }

          tracked.splice(0, tracked.length);

          // let gameCalculatedIndex = calculated.indexOf(gameId);
          // calculated.splice(gameCalculatedIndex, 2);

          console.log(
            'stavilkaOut() ==> 87 ************************************************'
          );
          console.log(
            'stavilkaOut() ==> 88 game ' +
              gameId +
              ' has been deleted from tasks'
          );
          console.log(
            'stavilkaOut() ==> 89 game ' +
              gameId +
              ' has been deleted from calculated'
          );
          console.log(
            'stavilkaOut() ==> 90 game ' +
              gameId +
              ' has been pushed to gameover'
          );
          console.log('stavilkaOut() ==> 91 calculated has been cleared');
          console.log('stavilkaOut() ==> 92 tracked has been cleared');
          console.log('stavilkaOut() ==> 93 Best Regards,');
          console.log('stavilkaOut() ==> 94 Calculon');
          console.log(
            'stavilkaOut() ==> ************************************************'
          );

          console.log(
            'stavilkaOut() ==> 95 steaming out after ' +
              gameId +
              ' is completed: SUCCESS'
          );
          dogonGrade = 0;
          const shuttle3 = [page, gameover, dogonGrade, freeze];
          listener(shuttle3);
        } else {
          console.log('stavilkaOut() ==> 96 platilkaOut failed for ' + gameId);
        }
      } else {
        console.log('stavilkaOut() ==> 97 the task is not completed yet');
        console.log(
          'stavilkaOut() ==> 98 checking existance of the game ' + gameId
        );

        let checked = await existanceChecker(page, gameId);

        console.log('stavilkaOut() ==> 99 game ' + gameId + ' was checked');
      }
    }
    setTimeout(
      function() {
        preStavilkaFav(calculated);
      },
      2000,
      calculated
    );
  } else {
    setTimeout(
      () => {
        console.log('stavilkaOut() ==> 100 no tasks found');
        freeze = 1;
        const shuttle = [page, gameover, dogonGrade, freeze];
        listener(shuttle);
      },
      3000,
      shuttle
    );
  }
};

const existanceChecker = async (page, gameId) => {
  console.log('existanceChecker() ==> 101 CHECKER STARTS');

  let checker = await page.evaluate(gameId => {
    let cont = document.querySelector('.table').innerHTML;
    if (
      cont &&
      cont.indexOf('<span class="table__event-number">' + gameId + '</span>') !=
        -1
    ) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } else {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(false);
        }, 1000);
      });
    }
  }, gameId);

  console.log(
    'existanceChecker() ==> 102 checker result for game ' +
      gameId +
      ' is ' +
      checker
  );

  if (checker == true) {
    console.log(
      'existanceChecker() ==> 103 game ' + gameId + ' is still on page'
    );
    return true;
  } else {
    console.log(
      'existanceChecker() ==> 104 game ' + gameId + ' was not found on page'
    );
    console.log(
      'existanceChecker() ==> 105 pushing ' + gameId + ' into gameover'
    );

    gameover.push(gameId);

    for (var f = 0; f <= calculated.length; f++) {
      calculated.splice([f], 1);
    }
    calculated.splice(0, calculated.length);

    console.log('existanceChecker() ==> 106 calculated has been cleared');

    for (var j = 0; j <= tracked.length; j++) {
      tracked.splice([j], 1);
    }

    tracked.splice(0, tracked.length);
    console.log('existanceChecker() ==> 107 tracked has been cleared');

    // let gameCalculatedIndex = calculated.indexOf(gameId);
    // console.log('deleting '+gameId+' from calculated');
    // calculated.splice(gameCalculatedIndex, 2);

    let gameTasksIndex = tasks.indexOf(gameId);
    console.log(
      'existanceChecker() ==> 108 deleting ' + gameId + ' from tasks'
    );
    tasks.splice(gameTasksIndex, 1);

    tasks.splice(0, tasks.length);

    console.log(
      'existanceChecker() ==> 109 game ' + gameId + ' is completed: FAILED'
    );
    console.log('existanceChecker() ==> 110 increasing dogon grade ...');
    console.log('existanceChecker() ==> 111 dogon grade before: ' + dogonGrade);
    dogonGrade++;
    console.log('existanceChecker() ==> 112 dogon grade after: ' + dogonGrade);
    console.log('existanceChecker() ==> 113 going to the beginning (listener)');
    freeze = 0;
    const shuttle4 = [page, gameover, dogonGrade, freeze];
    listener(shuttle4);
    console.log('existanceChecker() ==> 114 after sending to listener...');
  }
};

auth();
