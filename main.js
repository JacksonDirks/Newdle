/* 
Notes:
1---Need to fix:
2---How to read
    All of it is an event listener of the document
    Colors change by gettin gthe specific class of tile and keys, than changing based on values of correct word in string arrays
*/

document.addEventListener("DOMContentLoaded", () => {
     // also in local storage
     let guessedWordCount = 0;
     let availableSpace = 1;
     let guessedWords = [[]];
     const minute = 1000 * 60;
     const hour = minute * 60;
     const day = hour * 24;
     const year = day * 365;  
     let currentDate = Math.round(Date.now() / day);
     let currentWordIndex = currentDate - 19637;
    

    const words = ["green", "white", "clubs", "class", "music", "bands", "dance", "sport", "footy",
                    "lunch", "pride", "honor", "drama", "civic", "cheer", "youth", "learn", "faith", "field",
                    "honor", "quiet", "tutor", "unity", "visit", "lupin", "lemle", "jolly", "beard", "bivin",
                    "huber", "burns", "carey", "coats", "malis", "kelly", "davis", "ellis", "jones", "poole",
                    "spitz", "grade", "pablo", "stats", "globe", "human", "latin", "choir", "intro", "pinch",
                    "films", "study", "peers", "chess", "books", "chair", "board", "drama", "field", "games",
                    "teams", "teach", "prize", "rules", "notes", "clean", "space", "write", "votes", "plays",
                    "track", "words", "solve", "paint", "point", "chair", "chalk", "clock", "rules", "flags",
                    "space", "goals", "exams", "final", "dress", "gator"];

    let currentWord = words[currentWordIndex];
    
    initLocalStorage();
    initHelpModal();
    initStatsModal();
    createSquares();
    addKeyboardClicks(); 
    addUserType();
    loadLocalStorage();

    const keys = document.querySelectorAll(".keyboard-row button");
    
    function initLocalStorage() {
        const storedCurrentWordIndex = window.localStorage.getItem('currentWordIndex');
        const taskCreatedAtDay = window.localStorage.getItem('taskCreatedAtDay');
        const taskCreatedAtMonth = window.localStorage.getItem('taskCreatedAtMonth');
        const taskCreatedAtYear = window.localStorage.getItem('taskCreatedAtYear');
        
        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        if (!storedCurrentWordIndex) {
            window.localStorage.setItem('currentWordIndex', currentWordIndex);
            window.localStorage.setItem('taskCreatedAtDay', day);
            window.localStorage.setItem('taskCreatedAtMonth', month);
            window.localStorage.setItem('taskCreatedAtYear', year);
        } else if (year > Number(taskCreatedAtYear)) {
            window.localStorage.clear();
            initLocalStorage();
        } else if (year <= Number(taskCreatedAtYear)) {
            if (month > Number(taskCreatedAtMonth)) {
                window.localStorage.clear();
                initLocalStorage();
            } else if (month <= Number(taskCreatedAtMonth)) {
                if (day > Number(taskCreatedAtDay)) {
                    window.localStorage.clear();
                    initLocalStorage();
                } else if (day <= Number(taskCreatedAtDay)) {
                    currentWordIndex = Number(storedCurrentWordIndex);
                    currentWord = words[currentWordIndex];
                }
            }
        }
        else {
            currentWordIndex = Number(storedCurrentWordIndex);
            currentWord = words[currentWordIndex];
        }
    }
    
    function loadLocalStorage() {
        currentWordIndex = Number(window.localStorage.getItem('currentWordIndex')) || currentWordIndex;
        guessedWordCount = Number(window.localStorage.getItem('guessedWordCount')) || guessedWordCount;
        availableSpace = Number(window.localStorage.getItem('availableSpace')) || availableSpace;
        guessedWords = JSON.parse(window.localStorage.getItem('guessedWords')) || guessedWords;

        currentWord = words[currentWordIndex];

        const storedBoardContainer = window.localStorage.getItem('boardContainer');
        if (storedBoardContainer) {
            document.getElementById('board-container').innerHTML = storedBoardContainer;
        }
        
        const storedKeyboardContainer = window.localStorage.getItem('keyboardContainer');
        if (storedKeyboardContainer) {
            document.getElementById('keyboard-container').innerHTML = storedKeyboardContainer;
            addKeyboardClicks();
        }
    }
    
    function createSquares() {
        const gameBoard = document.getElementById("board");

        for (let index = 0; index < 30; index++) {
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");
            square.setAttribute("id", index + 1);
            gameBoard.appendChild(square);
        }
        console.log(currentDate);
    }

    function preserveGameState() {
        window.localStorage.setItem('guessedWords', JSON.stringify(guessedWords));

        const keyboardContainer = document.getElementById('keyboard-container');
        window.localStorage.setItem('keyboardContainer', keyboardContainer.innerHTML);

        const boardContainer = document.getElementById('board-container');
        window.localStorage.setItem('boardContainer', boardContainer.innerHTML);
    }
    
    function updateTotalGames() {
        const totalGames = window.localStorage.getItem('totalGames') || 0;
        window.localStorage.setItem('totalGames', Number(totalGames) + 1);
    }
    
    function showResult() {
        const finalResultEl = document.getElementById("final-score");
        finalResultEl.textContent = "Newdle 1 - You win!";

        const totalWins = window.localStorage.getItem('totalWins') || 0;
        window.localStorage.setItem('totalWins', Number(totalWins) + 1);

        const currentStreak = window.localStorage.getItem('currentStreak') || 0;
        window.localStorage.setItem('currentStreak', Number(currentStreak) + 1);
    }
    
    function showLosingResult() {
        const finalResultEl = document.getElementById("final-score");
        finalResultEl.textContent = `Newdle 1 - Unsuccessful Today!`;

        window.localStorage.setItem('currentStreak', 0);
    }

    function clearBoard() {
        for (let i = 0; i < 30; i++) {
            let square = document.getElementById(i + 1);
            square.textContent = "";
        }

        const keys = document.getElementsByClassName("keyboard-button");

        for (var key of keys) {
            key.disabled = true;
        }
    }

    function getIndicesOfLetter(letter, arr) {
        const indices = [];
        let idx = arr.indexOf(letter);
        while (idx != -1) {
          indices.push(idx);
          idx = arr.indexOf(letter, idx + 1);
        }
        return indices;
    }
    
    function getTileClass(letter, index, currentWordArr) {
        const isCorrectLetter = currentWord
          .toUpperCase()
          .includes(letter.toUpperCase());
    
    
        if (!isCorrectLetter) {
          return "incorrect-letter";
        }
    
        const letterInThatPosition = currentWord.charAt(index);
        const isCorrectPosition =
            letter.toLowerCase() === letterInThatPosition.toLowerCase();
    
        if (isCorrectPosition) {
            return "correct-letter-in-place";
        }
        
        const isGuessedMoreThanOnce =
            currentWordArr.filter((l) => l === letter).length > 1;
    
        if (!isGuessedMoreThanOnce) {
            return "correct-letter";
        }

        const existsMoreThanOnce =
            currentWord.split("").filter((l) => l === letter).length > 1;

        // is guessed more than once and exists more than once
        if (existsMoreThanOnce) {
            return "correct-letter";
        }

        const hasBeenGuessedAlready = currentWordArr.indexOf(letter) < index;

        const indices = getIndicesOfLetter(letter, currentWord.split(""));
        const otherIndices = indices.filter((i) => i !== index);
        const isGuessedCorrectlyLater = otherIndices.some(
          (i) => i > index && currentWordArr[i] === letter
        );
                
        if (!hasBeenGuessedAlready && !isGuessedCorrectlyLater) {
            return "correct-letter";
        }
      
        return "incorrect-letter";
    }
    
    async function handleSubmitWord() {
        const currentWordArr = getCurrentWordArr();
        const guessedWord = currentWordArr.join("");
    
        if (guessedWord.length !== 5) {
        return;
        }
    
        try {
        const res = await fetch(
           `https://wordsapiv1.p.rapidapi.com/words/${guessedWord.toLowerCase()}`,
           {
             method: "GET",
             headers: {
               "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
               "x-rapidapi-key": "a6c3c349e2msh1a0bf9a9ec7bc47p1f3eefjsnd55590ce1e3b",
             },
           }
         );
    
         if (!res.ok) {
            throw Error();
         }
        if (res.length < 5) {
            throw Error();
         }
        const firstLetterId = guessedWordCount * 5 + 1;

        window.localStorage.setItem('availableSpace', availableSpace);
    
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
            const tileClass = getTileClass(letter, index, currentWordArr);
            if (tileClass) {
                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);
                letterEl.classList.add("animate__flipInX");
                letterEl.classList.add(tileClass);
                const keyboardEl = document.querySelector(`[data-key=${letter}]`);
                keyboardEl.classList.add(tileClass);
                }

                if (index === 4) {
                    preserveGameState();
                }

            }, index * interval);
        });

        guessedWordCount += 1;
        window.localStorage.setItem('guessedWordCount', guessedWordCount);

        if (guessedWord === currentWord) {
            setTimeout(() => {
            const okSelected = window.confirm("Well done!");
            if (okSelected) {
                clearBoard();
                showResult();
                updateTotalGames();
            }
            return;
            }, 1200);
        }

        if (guessedWords.length === 6 && guessedWord !== currentWord) {
            setTimeout(() => {
                const okSelected = window.confirm(
                `Sorry, you have no more guesses! The word is "${currentWord.toUpperCase()}".`
                );
                if (okSelected) {
                clearBoard();
                showLosingResult();
                updateTotalGames();
                }
                return;
            }, 1200);
            }

            guessedWords.push([]);
        } catch (_error) {
            window.alert("Word is not recognised!");
        }
    }
    
    function handleDelete() {
        const currentWordArr = getCurrentWordArr();
        if (!currentWordArr.length) {
            return;
        }
        currentWordArr.pop();
        
        guessedWords[guessedWords.length - 1] = currentWordArr;

        const lastLetterEl = document.getElementById(availableSpace - 1);

        lastLetterEl.innerHTML = '';
        availableSpace = availableSpace - 1;

    }
  
    function getCurrentWordArr() {
      const numberOfGuessedWords = guessedWords.length;
      return guessedWords[numberOfGuessedWords - 1];
    }
  
    function updateGuessedWords(letter) {
      const currentWordArr = getCurrentWordArr();
  
      if (currentWordArr && currentWordArr.length < 5) {
        currentWordArr.push(letter);
  
        const availableSpaceEl = document.getElementById(String(availableSpace));
  
        availableSpace = availableSpace + 1;
        availableSpaceEl.textContent = letter;
      }
    }
    
    function addKeyboardClicks() {
        const keys = document.querySelectorAll(".keyboard-row button");
        for (let i = 0; i < keys.length; i++) {
          keys[i].addEventListener("click", ({ target }) => {
            const key = target.getAttribute("data-key");

            if (key === "enter") {
                handleSubmitWord();
                return;
              }
      
              if (key === "del") {
                handleDelete();
                return;
              }
              console.log(key);
              updateGuessedWords(key);
            });
          }
        }
    function addUserType() {
        $(document).keyup(function (event) {
            let key = (event.keyCode ? event.keyCode : event.which);
            let character = String.fromCharCode(key);
            character = character.toLowerCase();
            console.log(character);
            
            if (key === 13) {
                handleSubmitWord();
                return;
            }
            if (key === 8 || key === 46) {
                handleDelete();
                return;
            }
            
            updateGuessedWords(character);
        });
    }
      
    function initHelpModal() {
        const modal = document.getElementById("help-modal");

        // Get the button that opens the modal
        const btn = document.getElementById("help");

        // Get the <span> element that closes the modal
        const span = document.getElementById("close-help");

        // When the user clicks on the button, open the modal
        btn.addEventListener("click", function () {
            modal.style.display = "block";
        });

        // When the user clicks on <span> (x), close the modal
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });

        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener("click", function (event) {
            if (event.target == modal) {
            modal.style.display = "none";
            }
        });
    }

    function updateStatsModal() {
        const currentStreak = window.localStorage.getItem('currentStreak');
        const totalWins = window.localStorage.getItem('totalWins');
        const totalGames = window.localStorage.getItem('totalGames');

        document.getElementById('total-played').textContent = totalGames;
        document.getElementById('total-wins').textContent = totalWins;
        document.getElementById('current-streak').textContent = currentStreak;

        const winPct = Math.round((totalWins / totalGames) * 100);
        document.getElementById('win-pct').textContent = winPct + "%";
    }

    function initStatsModal() {
        const modal = document.getElementById("stats-modal");

        // Get the button that opens the modal
        const btn = document.getElementById("stats");
        // Get the <span> element that closes the modal
        const span = document.getElementById("close-stats");

        // When the user clicks on the button, open the modal
        btn.addEventListener("click", function () {
            updateStatsModal();
        modal.style.display = "block";
        });

        // When the user clicks on <span> (x), close the modal
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });

        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener("click", function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        });
    }
});
