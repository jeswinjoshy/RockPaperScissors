// Change the endpoint to your server's endpoint
const API_ENDPOINT = "http://localhost:3000/api/results";

const response = await fetch(API_ENDPOINT);
const jsonResponse = await response.json();

let score = jsonResponse;

updateScoreElement();
let isAutoPlaying = false;
let intervalId;

const btn = document.querySelector(".auto-play-button");
btn.addEventListener("click", autoPlay);

const resetBtn = document.querySelector(".reset-score-button");
resetBtn.addEventListener("click", resetScore);

function autoPlay() {
  if (!isAutoPlaying) {
    intervalId = setInterval(() => {
      const playerMove = pickComputerMove();
      playGame(playerMove);
    }, 1000);
    isAutoPlaying = true;
  } else {
    clearInterval(intervalId);
    isAutoPlaying = false;
  }
}
async function resetScore() {
  score = {
    wins: 0,
    ties: 0,
    losses: 0,
  };

  updateScoreElement();

  try {
    const resetResponse = await fetch("http://localhost:3000/api/reset", {
      method: "POST",
    });

    if (resetResponse.ok) {
      console.log("Score reset successfully!");
    } else {
      console.error("Error resetting score:", resetResponse.statusText);
    }
  } catch (error) {
    console.error("Error resetting score:", error);
  }
}
document.querySelector(".js-rock-button").addEventListener("click", () => {
  playGame("rock");
});

document.querySelector(".js-paper-button").addEventListener("click", () => {
  playGame("paper");
});

document.querySelector(".js-scissors-button").addEventListener("click", () => {
  playGame("scissors");
});

document.body.addEventListener("keydown", (event) => {
  if (event.key === "r") {
    playGame("rock");
  } else if (event.key === "p") {
    playGame("paper");
  } else if (event.key === "s") {
    playGame("scissors");
  }
});

async function playGame(playerMove) {
  const computerMove = pickComputerMove();

  let result = "";

  if (playerMove === "scissors") {
    if (computerMove === "rock") {
      result = "You lose.";
    } else if (computerMove === "paper") {
      result = "You win.";
    } else if (computerMove === "scissors") {
      result = "Tie.";
    }
  } else if (playerMove === "paper") {
    if (computerMove === "rock") {
      result = "You win.";
    } else if (computerMove === "paper") {
      result = "Tie.";
    } else if (computerMove === "scissors") {
      result = "You lose.";
    }
  } else if (playerMove === "rock") {
    if (computerMove === "rock") {
      result = "Tie.";
    } else if (computerMove === "paper") {
      result = "You lose.";
    } else if (computerMove === "scissors") {
      result = "You win.";
    }
  }

  if (result === "You win.") {
    score.wins += 1;
  } else if (result === "You lose.") {
    score.losses += 1;
  } else if (result === "Tie.") {
    score.ties += 1;
  }

  // Save the result to the MongoDB database
  await saveResultToDatabase(playerMove, computerMove, result);

  updateScoreElement();

  document.querySelector(".js-result").innerHTML = result;

  document.querySelector(".js-moves").innerHTML = `You
    <img src="images/${playerMove}-emoji.png" class="move-icon">
    <img src="images/${computerMove}-emoji.png" class="move-icon">
    Computer`;
}

function updateScoreElement() {
  document.querySelector(
    ".js-score"
  ).innerHTML = `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.ties}`;
}

function pickComputerMove() {
  const randomNumber = Math.random();

  let computerMove = "";

  if (randomNumber >= 0 && randomNumber < 1 / 3) {
    computerMove = "rock";
  } else if (randomNumber >= 1 / 3 && randomNumber < 2 / 3) {
    computerMove = "paper";
  } else if (randomNumber >= 2 / 3 && randomNumber < 1) {
    computerMove = "scissors";
  }

  return computerMove;
}

async function saveResultToDatabase(playerMove, computerMove, result) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(score),
    });

    if (!response.ok) {
      console.error("Error saving result to database.");
    }
  } catch (error) {
    console.error("Error saving result to database:", error);
  }
}
