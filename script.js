// 퀴즈 데이터 (정답 인덱스 0부터 시작)
const quizData = [
    {
        question: "원자의 중심에 있는 핵은 어떤 입자들로 구성되어 있나요?",
        options: [
            "전자와 양성자",
            "양성자와 중성자",
            "중성자와 전자",
            "양성자, 중성자, 전자"
        ],
        correct: 1
    },
    {
        question: "원자 번호는 무엇을 나타내나요?",
        options: [
            "원자의 질량",
            "핵에 있는 양성자의 수",
            "핵에 있는 중성자의 수",
            "전자의 수"
        ],
        correct: 1
    },
    {
        question: "전자가 가장 낮은 에너지 상태에 있을 때를 무엇이라고 하나요?",
        options: [
            "들뜬 상태",
            "바닥 상태",
            "이온화 상태",
            "중성 상태"
        ],
        correct: 1
    },
    {
        question: "원자에서 전자가 에너지를 흡수하여 더 높은 에너지 준위로 이동하는 것을 무엇이라고 하나요?",
        options: [
            "이온화",
            "들뜸",
            "방출",
            "결합"
        ],
        correct: 1
    },
    {
        question: "원자 모형에서 전자가 특정한 궤도를 따라 움직인다고 제안한 과학자는 누구인가요?",
        options: [
            "톰슨",
            "러더퍼드",
            "보어",
            "슈뢰딩거"
        ],
        correct: 2
    }
];

// 상태 변수
let currentStudent = '';
let currentQuestionIndex = 0;
let selectedAnswer = null;
let studentAnswers = [];
let leaderboard = []; // {student, correctCount, percentage, timestamp}

// DOM 캐싱 - 실제 HTML id와 일치하도록 수정
const screens = {
    'student-selection': document.getElementById('student-selection'),
    'quiz': document.getElementById('quiz-screen'),
    'result': document.getElementById('result-screen'),
    'leaderboard': document.getElementById('leaderboard-screen')
};

const optionBtns = Array.from(document.querySelectorAll('.option-btn'));
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const restartBtn = document.getElementById('restart-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');

// 학생 선택
document.querySelectorAll('.student-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentStudent = btn.dataset.student;
        startQuiz();
        showScreen('quiz');
    });
});

function startQuiz() {
    currentQuestionIndex = 0;
    studentAnswers = [];
    selectedAnswer = null;
    document.getElementById('current-student').textContent = currentStudent;
    showQuestion();
}

function showQuestion() {
    const question = quizData[currentQuestionIndex];
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;

    optionBtns.forEach((btn, idx) => {
        btn.textContent = question.options[idx];
        btn.className = 'option-btn';
        btn.disabled = false;
        btn.dataset.option = idx;
    });

    nextBtn.disabled = true;
    finishBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
}

// 답안 선택
optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        optionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAnswer = parseInt(btn.dataset.option, 10);
        nextBtn.disabled = false;
    });
});

// 다음 문제
nextBtn.addEventListener('click', () => {
    if (selectedAnswer !== null) {
        studentAnswers.push(selectedAnswer);
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            selectedAnswer = null;
            showQuestion();
        } else {
            finishBtn.style.display = 'inline-block';
            nextBtn.style.display = 'none';
        }
    }
});

// 퀴즈 완료
finishBtn.addEventListener('click', () => {
    if (selectedAnswer !== null && studentAnswers.length < quizData.length) {
        studentAnswers.push(selectedAnswer);
    }
    while (studentAnswers.length < quizData.length) {
        studentAnswers.push(null);
    }
    showResult();
});

// 결과 표시
function showResult() {
    if (studentAnswers.length !== quizData.length) {
        alert('답변 수가 맞지 않습니다. 다시 시도해 주세요.');
        goToStart();
        return;
    }
    let correctAnswers = 0;
    for (let i = 0; i < quizData.length; i++) {
        if (studentAnswers[i] === quizData[i].correct) correctAnswers++;
    }
    const percentage = Math.round((correctAnswers / quizData.length) * 100);

    document.getElementById('result-student').textContent = currentStudent;
    document.getElementById('correct-answers').textContent = correctAnswers;
    document.getElementById('percentage').textContent = percentage;

    saveResult(currentStudent, correctAnswers, percentage);
    showScreen('result');
}

// 결과 저장 (누적 저장, 시간순)
function saveResult(student, correctCount, percentage) {
    leaderboard.push({
        student,
        correctCount,
        percentage,
        timestamp: Date.now()
    });
    saveLeaderboard();
}

// 리더보드 보기
viewLeaderboardBtn.addEventListener('click', showLeaderboard);

function showLeaderboard() {
    leaderboard.sort((a, b) => {
        if (b.correctCount !== a.correctCount) {
            return b.correctCount - a.correctCount;
        } else {
            return b.timestamp - a.timestamp;
        }
    });
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    leaderboard.forEach((result, idx) => {
        const row = document.createElement('tr');
        if (idx < 3) row.className = `rank-${idx + 1}`;
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${result.student}</td>
            <td>${result.correctCount}</td>
            <td>${result.percentage}%</td>
        `;
        tbody.appendChild(row);
    });
    showScreen('leaderboard');
}

// 완전 초기화 및 학생 선택 화면으로 이동 - 수정된 부분
function goToStart() {
    // 상태 완전 초기화
    currentStudent = '';
    currentQuestionIndex = 0;
    selectedAnswer = null;
    studentAnswers = [];
    
    // DOM 요소들 초기화 (안전한 방식으로)
    const studentElem = document.getElementById('current-student');
    if (studentElem) studentElem.textContent = '';
    
    const qText = document.getElementById('question-text');
    if (qText) qText.textContent = '';
    
    const qNum = document.getElementById('question-number');
    if (qNum) qNum.textContent = '1';
    
    // 옵션 버튼들 초기화
    optionBtns.forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
        btn.textContent = '';
    });
    
    // 다음 버튼 상태 초기화
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.style.display = 'inline-block';
    }
    
    // 완료 버튼 숨기기
    if (finishBtn) {
        finishBtn.style.display = 'none';
    }
    
    // 학생 선택 화면으로 이동 - 올바른 키 사용
    showScreen('student-selection');
}

// 결과 화면, 리더보드 화면에서 모두 정상 동작
restartBtn.addEventListener('click', goToStart);
backToStartBtn.addEventListener('click', goToStart);

// 화면 전환 함수 - 더 안전하게 수정
function showScreen(screenName) {
    // 모든 화면 숨기기
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // 선택된 화면 보이기
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    } else {
        // 오류 발생 시 디버깅 정보 출력 및 기본 화면으로 이동
        console.error('화면 전환 실패:', screenName);
        console.log('사용 가능한 화면들:', Object.keys(screens));
        
        // 기본적으로 학생 선택 화면으로 이동
        if (screens['student-selection']) {
            screens['student-selection'].classList.add('active');
        }
    }
}

// 로컬 스토리지 함수들
function loadLeaderboard() {
    try {
        const saved = localStorage.getItem('chemistryQuizLeaderboard');
        if (saved) {
            leaderboard = JSON.parse(saved);
        }
    } catch (error) {
        console.error('리더보드 로드 실패:', error);
        leaderboard = [];
    }
}

function saveLeaderboard() {
    try {
        localStorage.setItem('chemistryQuizLeaderboard', JSON.stringify(leaderboard));
    } catch (error) {
        console.error('리더보드 저장 실패:', error);
    }
}

// 페이지 로드 시 리더보드 로드
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    // 페이지 로드 시 확실히 학생 선택 화면이 보이도록
    showScreen('student-selection');
});
