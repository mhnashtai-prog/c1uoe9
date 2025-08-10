async function loadMenu() {
    const menuDiv = document.getElementById('menu');
    // For now, just one set hardcoded as per your mention
    const sets = [
        { id: '01', type: 'C1 Use of English', file: 'set-01.json' }
    ];

    menuDiv.innerHTML = '';
    sets.forEach(set => {
        const btn = document.createElement('button');
        btn.textContent = `${set.type.toUpperCase()} - Set ${set.id}`;
        btn.onclick = () => loadSet(set.file);
        menuDiv.appendChild(btn);
    });
}

async function loadSet(file) {
    const menuDiv = document.getElementById('menu');
    const exerciseDiv = document.getElementById('exercise');
    const resultDiv = document.getElementById('result');

    menuDiv.classList.add('hidden');
    resultDiv.classList.add('hidden');
    exerciseDiv.classList.remove('hidden');

    try {
        const response = await fetch(`data/${file}`);
        if (!response.ok) throw new Error('Failed to load data file');
        const data = await response.json();
        renderExercise(data);
    } catch (error) {
        exerciseDiv.innerHTML = `<p>Error loading exercise data: ${error.message}</p>`;
    }
}

function renderExercise(data) {
    const exerciseDiv = document.getElementById('exercise');
    exerciseDiv.innerHTML = '';

    // We'll combine all question types into a single array with a type tag
    const questions = [];

    if (data.multipleChoice) {
        data.multipleChoice.forEach(q => {
            questions.push({ ...q, type: 'multiple-choice' });
        });
    }
    if (data.openCloze) {
        data.openCloze.forEach(q => {
            questions.push({ ...q, type: 'gap-fill' });
        });
    }
    if (data.wordFormation) {
        data.wordFormation.forEach(q => {
            questions.push({ ...q, type: 'word-formation' });
        });
    }
    if (data.sentenceTransformation) {
        data.sentenceTransformation.forEach(q => {
            questions.push({ ...q, type: 'rephrasing' });
        });
    }

    // Render each question
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';

        let qText = '';

        if (q.type === 'multiple-choice') {
            qText = q.question || q.text || '';
        } else if (q.type === 'gap-fill' || q.type === 'word-formation') {
            qText = q.sentence || '';
        } else if (q.type === 'rephrasing') {
            qText = q.question || '';
        }

        const p = document.createElement('p');
        p.textContent = `${index + 1}. ${qText}`;
        questionDiv.appendChild(p);

        if (q.type === 'multiple-choice') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';

            q.options.forEach(option => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `q${index}`;
                input.value = option;
                label.appendChild(input);
                label.append(` ${option}`);
                optionsDiv.appendChild(label);
            });
            questionDiv.appendChild(optionsDiv);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `q${index}`;
            input.style.width = '100%';
            questionDiv.appendChild(input);
        }

        exerciseDiv.appendChild(questionDiv);
    });

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'nav';
    submitBtn.textContent = 'Submit';
    submitBtn.onclick = () => gradeQuiz(questions);
    exerciseDiv.appendChild(submitBtn);
}

function gradeQuiz(questions) {
    const exerciseDiv = document.getElementById('exercise');
    const resultDiv = document.getElementById('result');

    let score = 0;
    let total = questions.length;

    questions.forEach((q, index) => {
        if (q.type === 'multiple-choice') {
            // For multiple choice, find checked input in this group
            const selected = exerciseDiv.querySelector(`input[name="q${index}"]:checked`);
            if (selected && selected.value === q.answer) {
                score++;
            }
        } else {
            // For text inputs
            const input = exerciseDiv.querySelector(`input[name="q${index}"]`);
            if (input) {
                if (input.value.trim().toLowerCase() === q.answer.toLowerCase()) {
                    score++;
                }
            }
        }
    });

    exerciseDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');

    resultDiv.innerHTML = `
        <h2>Your Score: ${score} / ${total}</h2>
        <button class="nav" onclick="returnToMenu()">Return to Menu</button>
    `;
}

function returnToMenu() {
    document.getElementById('exercise').classList.add('hidden');
    document.getElementById('result').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

window.onload = () => {
    loadMenu();
};
