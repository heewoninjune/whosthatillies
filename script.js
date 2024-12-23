const cardImage = document.getElementById('card-image');
const nameInput = document.getElementById('name-input');
const submitButton = document.getElementById('submit-button');
const feedbackMessage = document.getElementById('feedback-message');
const scoreDisplay = document.getElementById('score-display');
const progressDisplay = document.getElementById('progress-display');
const choicesContainer = document.getElementById('choices-container');

let currentCardIndex = 0;
let score = 0;
let gameData = [];
let totalCards = 0;
let lastMember = null;
let lastImage = null;
let selectedChoices = [];

async function fetchData() {
    const response = await fetch('data.json');
    let allData = await response.json();
    allData = shuffleArray(allData);
    gameData = preventConsecutiveMembersAndImages(allData);
    totalCards = gameData.length;
    loadCard();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function preventConsecutiveMembersAndImages(array) {
    const result = [];
    let lastMember = null;
    let lastImage = null;

    for (const item of array) {
        if (item.name.join(",") !== lastMember || item.image !== lastImage) {
            result.push(item);
            lastMember = item.name.join(",");
            lastImage = item.image;
        } else {
            let found = false;
            for (let i = 0; i < array.length; i++) {
                if (array[i].name.join(",") !== lastMember || array[i].image !== lastImage) {
                    result.push(array[i]);
                    lastMember = array[i].name.join(",");
                    lastImage = array[i].image;
                    array.splice(i, 1);
                    found = true;
                    break;
                }
            }
            if (!found) {
                result.push(item);
            }
        }
    }
    return result;
}

function loadCard() {
    if (currentCardIndex >= totalCards) {
        endGame();
        return;
    }
    const currentCard = gameData[currentCardIndex];
    cardImage.src = currentCard.image;
    nameInput.style.display = 'none';
    submitButton.style.display = 'none';
    feedbackMessage.textContent = '';
    progressDisplay.textContent = `Card ${currentCardIndex + 1}/${totalCards}`;
    selectedChoices = [];
    console.log(`loadCard: Card ${currentCardIndex + 1}/${totalCards}, Image: ${currentCard.image}, Correct Names: ${currentCard.name.join(", ")}`);
    generateChoices(currentCard);
}

function generateChoices(currentCard) {
    const choices = [];
    const correctNames = currentCard.name;
    choices.push(...correctNames);

    const incorrectChoices = getUniqueIncorrectChoices(correctNames);
    choices.push(...incorrectChoices);

    const shuffledChoices = shuffleArray(choices);

    choicesContainer.innerHTML = '';
    shuffledChoices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.classList.add('choice-button');
        button.addEventListener('click', () => {
            toggleChoice(button, choice, correctNames);
        });
        button.style.backgroundColor = getMemberColor(choice);
        choicesContainer.appendChild(button);
    });
}

function toggleChoice(button, choice, correctNames) {
    if (selectedChoices.includes(choice)) {
        selectedChoices = selectedChoices.filter(c => c !== choice);
        button.classList.remove('selected');
    } else {
        selectedChoices.push(choice);
        button.classList.add('selected');
    }
    console.log(`toggleChoice: Selected: ${choice}, Current Selected Choices: ${selectedChoices.join(", ")}`);
    
    if (correctNames.length === 1 || (correctNames.length === 2 && selectedChoices.length === 2) || !correctNames.includes(choice)) {
        checkAnswer(selectedChoices, correctNames);
    }
}

function getMemberColor(memberName) {
    const memberColors = {
        "Yunah": "#36454f",
        "Minju": "#008000",
        "Moka": "#e29aae",
        "Wonhee": "#cfcfcf",
        "Iroha": "#0000ff"
    };
    return memberColors[memberName] || "#8FBC8F";
}

function getUniqueIncorrectChoices(correctNames) {
    const incorrectChoices = new Set();
    while (incorrectChoices.size < 2) {
        const randomIndex = Math.floor(Math.random() * gameData.length);
        const randomMember = gameData[randomIndex].name;
        if (!correctNames.includes(randomMember[0])) {
            incorrectChoices.add(randomMember[0]);
        }
    }
    return Array.from(incorrectChoices);
}

function checkAnswer(selectedChoices, correctNames) {
    let isCorrect = false;
    if (correctNames.length === 1) {
        if (selectedChoices.includes(correctNames[0])) {
            isCorrect = true;
        }
    } else if (correctNames.length === 2) {
        if (correctNames.every(name => selectedChoices.includes(name)) && selectedChoices.length === 2) {
            isCorrect = true;
        }
    }

    if (isCorrect) {
        feedbackMessage.textContent = 'Correct!';
        feedbackMessage.style.color = 'green';
        score++;
        console.log(`checkAnswer: Correct! Selected Choices: ${selectedChoices.join(", ")}, Correct Names: ${correctNames.join(", ")}`);
        currentCardIndex++;
        setTimeout(loadCard, 1000);
    } else if (selectedChoices.length > 0 && !isCorrect) {
        feedbackMessage.textContent = `Incorrect. The correct answer is: ${correctNames.join(" & ")}`;
        feedbackMessage.style.color = 'red';
        console.log(`checkAnswer: Incorrect! Selected Choices: ${selectedChoices.join(", ")}, Correct Names: ${correctNames.join(", ")}`);
        currentCardIndex++;
        setTimeout(loadCard, 1000);
    }
    scoreDisplay.textContent = `Score: ${score}`;
}

function endGame() {
    cardImage.src = 'source/ending.jpeg';
    nameInput.style.display = 'none';
    submitButton.style.display = 'none';
    choicesContainer.innerHTML = '';
    feedbackMessage.textContent = `Your final score is: ${score}/${totalCards}`;
    feedbackMessage.style.color = 'blue';
    progressDisplay.textContent = '';
}

fetchData();