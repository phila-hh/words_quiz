function getUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

const params = getUrlParams();

const correctCount = parseInt(params['correctCount']);
const wrongCount = parseInt(params['wrongCount']);

const resultBox = document.querySelector(".result-box");
resultBox.innerHTML = `${correctCount}`;
