// ---------------- INDEX PAGE LOGIC ----------------
if (document.getElementById("districtSelect")) {
  const districtYearMap = {
    "Nashik": ["2023", "2022" , "2020", "2019" ],
    "Pune": ["2022"],
    "Aurangabad": ["2021"]
  };

  const districtSelect = document.getElementById("districtSelect");
  const yearSelect = document.getElementById("yearSelect");
  const startBtn = document.getElementById("startBtn");

  // Fill districts
  Object.keys(districtYearMap).forEach(district => {
    const opt = document.createElement("option");
    opt.value = district;
    opt.textContent = district;
    districtSelect.appendChild(opt);
  });

  // On district change
  districtSelect.addEventListener("change", () => {
    const selected = districtSelect.value;
    yearSelect.innerHTML = `<option disabled selected>वर्ष निवडा</option>`;
    districtYearMap[selected].forEach(year => {
      const opt = document.createElement("option");
      opt.value = year;
      opt.textContent = year;
      yearSelect.appendChild(opt);
    });
    yearSelect.disabled = false;
    startBtn.disabled = true;
  });

  // On year change
  yearSelect.addEventListener("change", () => {
    startBtn.disabled = false;
  });

  // On start test
  startBtn.addEventListener("click", () => {
    const dist = districtSelect.value.toLowerCase();
    const year = yearSelect.value;
    const file = `data/${dist}-${year}.json`;
    localStorage.setItem("quizFile", file);
    window.location.href = "test.html";
  });
}

// ---------------- TEST PAGE LOGIC ----------------
if (window.location.pathname.includes("test.html")) {
  let questions = [], current = 0, answers = [], timer;
  const qBox = document.getElementById("questionText");
  const optBox = document.getElementById("optionsContainer");

  fetch(localStorage.getItem("quizFile"))
    .then(res => res.json())
    .then(data => {
      questions = data;
      answers = Array(data.length).fill(undefined);
      document.getElementById("totalQuestions").textContent = data.length;
      showQuestion(current);
      startTimer(90 * 60);
      renderGrid();
    });

  function showQuestion(i) {
    document.getElementById("questionNumber").textContent = i + 1;
    const q = questions[i];
    qBox.textContent = q.question;
    optBox.innerHTML = "";

    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "btn w-100 mb-2";
      btn.textContent = opt;
      btn.classList.add(answers[i] === idx ? "btn-primary" : "btn-outline-primary");
      btn.onclick = () => {
        answers[i] = idx;
        showQuestion(i);
        updateGrid();
      };
      optBox.appendChild(btn);
    });

    document.getElementById("prevBtn").disabled = i === 0;
    document.getElementById("nextBtn").disabled = i === questions.length - 1;
    updateGrid();
  }

  document.getElementById("prevBtn").onclick = () => {
    if (current > 0) showQuestion(--current);
  };

  document.getElementById("nextBtn").onclick = () => {
    if (current < questions.length - 1) showQuestion(++current);
  };

  document.getElementById("submitTest").onclick = () => {
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("answers", JSON.stringify(answers));
    window.location.href = "result.html";
  };

  function startTimer(seconds) {
    timer = setInterval(() => {
      const min = String(Math.floor(seconds / 60)).padStart(2, '0');
      const sec = String(seconds % 60).padStart(2, '0');
      document.getElementById("timer").textContent = `${min}:${sec}`;
      if (--seconds < 0) {
        clearInterval(timer);
        alert("Time up!");
        document.getElementById("submitTest").click();
      }
    }, 1000);
  }

  function renderGrid() {
    const grid = document.getElementById("questionGrid");
    if (!grid) return;
    grid.innerHTML = "";
    questions.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm m-1";
      btn.textContent = i + 1;
      btn.onclick = () => {
        current = i;
        showQuestion(i);
      };
      grid.appendChild(btn);
    });
    updateGrid();
  }

  function updateGrid() {
    const grid = document.getElementById("questionGrid");
    if (!grid) return;
    [...grid.children].forEach((btn, i) => {
      btn.className = "btn btn-sm m-1";
      if (answers[i] !== undefined) {
        btn.classList.add("btn-success");
      } else {
        btn.classList.add("btn-outline-secondary");
      }
    });
  }
}

// ---------------- RESULT PAGE + PDF LOGIC ----------------
if (window.location.pathname.includes("result.html")) {
  const questions = JSON.parse(localStorage.getItem("questions") || "[]");
  const answers = JSON.parse(localStorage.getItem("answers") || "[]");

  const score = answers.reduce((sum, ans, i) => {
    return sum + (ans === questions[i].answer ? 1 : 0);
  }, 0);

  document.getElementById("scoreBox").textContent = `आपले गुण: ${score} / ${questions.length}`;

  window.downloadPDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    doc.addFileToVFS("Baloo2-Regular.ttf", baloo2);
    doc.addFont("Baloo2-Regular.ttf", "Baloo2", "normal");
    doc.setFont("Baloo2");
    doc.setFontSize(12);

    let y = 20;
    doc.text("📊 मॉक टेस्ट निकाल", 15, y);
    y += 10;
    doc.text(`एकूण गुण: ${score} / ${questions.length}`, 15, y);
    y += 10;

    questions.forEach((q, i) => {
      const qText = `प्रश्न ${i + 1}: ${q.question}`;
      const correct = `✅ बरोबर उत्तर: ${q.options[q.answer]}`;
      const ua = answers[i];
      const yourAns = `🧑 तुमचं उत्तर: ${ua !== undefined ? q.options[ua] : 'उत्तर दिलं नाही'}`;

      const qLines = doc.splitTextToSize(qText, 180);
      const cLines = doc.splitTextToSize(correct, 180);
      const aLines = doc.splitTextToSize(yourAns, 180);

      if (y + (qLines.length + cLines.length + aLines.length) * 7 > 280) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("Baloo2", "bold");
      doc.text(qLines, 15, y);
      y += qLines.length * 7;

      doc.setFont("Baloo2", "normal");
      doc.text(cLines, 20, y);
      y += cLines.length * 7;

      doc.text(aLines, 20, y);
      y += aLines.length * 7 + 5;
    });

    doc.save("mock-test-result-marathi.pdf");
  };
}

// ---------------- DARK MODE TOGGLE ----------------
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("darkToggle");
  const icon = document.getElementById("modeIcon");

  if (!toggle || !icon) return;

  const saved = localStorage.getItem("theme") || "light";
  document.body.classList.add(`${saved}-mode`);
  icon.classList.add(saved === "dark" ? "fa-sun" : "fa-moon");

  toggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");

    const newMode = isDark ? "light" : "dark";
    icon.classList.toggle("fa-sun", !isDark);
    icon.classList.toggle("fa-moon", isDark);
    localStorage.setItem("theme", newMode);
  });
});

function checkIfAllAnswered() {
  if (answers.every(ans => ans !== undefined)) {
    setTimeout(() => {
      alert("सर्व प्रश्न पूर्ण झाले, निकाल दाखवला जातो...");
      document.getElementById("submitTest").click();
    }, 500);
  }
}

