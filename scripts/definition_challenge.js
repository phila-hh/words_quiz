const DICTIONARY_API_KEY = 'f12ecbac-cfe1-4459-9e67-90992128a916';
const THESAURUS_API_KEY = 'ac72e840-5e4a-45c5-9336-0db683cf8506';


const correctAnswers = [];
let correctCount = 0;
let wrongCount = 0;


document.addEventListener("DOMContentLoaded", async function() {
    try {
        const randomWords = [];
        for (let i = 0; i < 10; i++) {
            const word = await get_random_word();
            if (!randomWords.includes(word)) {
                if (await check_word(word)) {
                    correctAnswers.push(word); // Add to correct answers list
                    randomWords.push(word);
                } else {
                    i--;
                    continue;
                }
            }
        }

        for (let i = 0; i < randomWords.length; i++) {
            const word = randomWords[i];
            const wordInfo = await get_word_info(word);

            const questionBox = document.getElementById(`q-${i + 1}`);
            const defBox = questionBox.querySelector('.def-box');
            defBox.innerHTML = `
                <p><strong>Definition:-</strong> ${wordInfo.def}</p>
                <p><strong>Synonym:-</strong> ${wordInfo.syn}</p>
                <p><strong>Antonym:-</strong> ${wordInfo.ant}</p>
            `;

            const shuffledChoices = await generate_shuffled_choices(word);
            const choices = questionBox.querySelectorAll('.choice-box');
            choices.forEach((choice, index) => {
                choice.innerHTML = `${shuffledChoices[index]}`;
            });
            choices.forEach((choice, index) => {
                choice.addEventListener('click', (event) => {
                    choice.innerHTML = `${shuffledChoices[index]}`;
                    if (!event.target.classList.contains('disabled')) {
                        choice_click_handler(event, i + 1);
                    }
                });
            });

            const doneButton = document.querySelector('.done-btn');
            doneButton.addEventListener('click', function() {
                open_result_page(correctCount, wrongCount);
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
});


async function generate_shuffled_choices(og_word) {
    const choices = [];
    choices.push(og_word);
    for (let i = 0; i < 3; i++) {
        const word = await get_random_word();
        if (!choices.includes(word)) {
            choices.push(word);
        } else {
            i--;
            continue;
        }
    }

    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]]; // Swap elements
    }
    return choices;
}

async function get_word_info(word) {
    const wordInfo = {
        word: word,
        def: "",
        syn: "",
        ant: "",
        sound: ""
    };

    try {
        const thesaurusResponse = await fetch(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${THESAURUS_API_KEY}`);
        const thesaurusData = await thesaurusResponse.json();
        // Check if short definition exists
        if (thesaurusData[0].shortdef && thesaurusData[0].shortdef[0]) {
            const definition = thesaurusData[0].shortdef[0];
            wordInfo.def = definition;
        } else {
            wordInfo.def = "";
        }

        // Check if synonyms exist
        if (thesaurusData[0].meta.syns && thesaurusData[0].meta.syns[0]) {
            const synonyms = thesaurusData[0].meta.syns[0].join(', ');
            wordInfo.syn = synonyms;
        } else {
            wordInfo.syn = "";
        }
        
        // Check if antonyms exist
        if (thesaurusData[0].meta.ants && thesaurusData[0].meta.ants[0]) {
            const antonyms = thesaurusData[0].meta.ants[0].join(', ');
            wordInfo.ant = antonyms;
        } else {
            wordInfo.ant = "";
        }
        
        // Fetch the word pronunciation sound url
        const dictionaryResponse = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${DICTIONARY_API_KEY}`);
        const dictionaryData = await dictionaryResponse.json();
        // Check if sound exists
        if (dictionaryData[0].hwi.prs && dictionaryData[0].hwi.prs[0].sound && dictionaryData[0].hwi.prs[0].sound.audio) {
            const sound = dictionaryData[0].hwi.prs[0].sound.audio;
            wordInfo.sound = `https://media.merriam-webster.com/audio/prons/en/us/mp3/v/${sound}.mp3`;
        } else {
            wordInfo.sound = "";
        }
    } catch (error) {
        console.log(error);
    } finally {
        return wordInfo;
    }
}

async function get_random_word() {
    try {
        const response = await fetch(`https://random-word-api.vercel.app/api?words=1`);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0];
        } else {
            throw new Error('No word found in the response.');
        }
    } catch (error) {
        console.error('Error fetching word:', error);
        return null;
    }
}

async function check_word(word) {
    try {
        const wordInfo = await get_word_info(word);
        if (wordInfo.def && wordInfo.syn && wordInfo.ant && wordInfo.sound) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking word:', error);
        return false;
    }
}


function check_choice(clickedWord, choiceElement) {
    if (correctAnswers.includes(clickedWord)) {
        correctCount++;
        choiceElement.style.backgroundColor = 'green';
    } else {
        wrongCount++;
        choiceElement.style.backgroundColor = 'red';
    }

    choiceElement.removeEventListener('click', choice_click_handler);
}

function choice_click_handler(event, index) {
    const clickedChoice = event.target;
    const clickedWord = clickedChoice.textContent.trim();
    check_choice(clickedWord, clickedChoice);


    const questionBox = document.getElementById(`q-${index}`);
    const choices = questionBox.querySelectorAll('.choice-box');
    choices.forEach(choice => {
        if (choice !== clickedChoice) {
            choice.classList.add('disabled');
        }
    });
}

function open_result_page(correctCount, wrongCount) {
    const url = `result.html?correctCount=${correctCount}&wrongCount=${wrongCount}`;
    window.location.href = url;
}
