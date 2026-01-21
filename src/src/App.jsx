import React, { useState, useEffect } from 'react';

// --- DỮ LIỆU GAME TRẮC NGHIỆM ---
const GAME_DATA = [
  {
    id: 1,
    title: "Khởi động nhẹ nhàng",
    instruction: "Đếm số bạn tham gia CLB 'Bóng đá'",
    tableData: [
      { col1: "An", col2: "Bóng đá" },
      { col1: "Bình", col2: "Múa" },
      { col1: "Chi", col2: "Bóng đá" },
      { col1: "Dũng", col2: "Cờ vua" },
    ],
    headers: ["Họ và tên", "CLB Tham gia"],
    correctAnswer: '=COUNTIF(B2:B5, "Bóng đá")',
    options: [
      '=COUNTIF(B2:B5, "Bóng đá")',
      '=COUNT(B2:B5, "Bóng đá")',
      '=COUNTIF(A2:A5, "Bóng đá")',
      '=COUNTIF("Bóng đá", B2:B5)'
    ],
    explanation: "Cú pháp đúng là: =COUNTIF(Vùng_chứa_dữ_liệu, Tiêu_chí). Nhớ để chữ trong ngoặc kép nhé!"
  },
  {
    id: 2,
    title: "Thử thách ô chứa",
    instruction: "Đếm số bạn xếp loại 'Tốt' (Dùng địa chỉ ô D1 làm tiêu chí)",
    extraCell: { id: "D1", value: "Tốt" },
    tableData: [
      { col1: "Lan", col2: "Tốt" },
      { col1: "Mai", col2: "Khá" },
      { col1: "Ngọc", col2: "Tốt" },
      { col1: "Phúc", col2: "Đạt" },
    ],
    headers: ["Tên HS", "Xếp loại"],
    correctAnswer: '=COUNTIF(B2:B5, D1)',
    options: [
      '=COUNTIF(B2:B5, "D1")',
      '=COUNTIF(B2:B5, D1)',
      '=COUNTIF(D1, B2:B5)',
      '=COUNTIF(B2:B5, Tốt)'
    ],
    explanation: "Khi tiêu chí là một ô (D1), ta KHÔNG dùng dấu ngoặc kép. Nếu dùng \"D1\" Excel sẽ tìm chữ D1 chứ không phải chữ Tốt."
  },
  {
    id: 3,
    title: "Cạm bẫy sao chép",
    instruction: "Công thức tại E2 để đếm 'Micro'. Cần viết sao để KÉO ĐƯỢC xuống dưới mà không sai?",
    extraCell: { id: "D2", value: "Micro" },
    tableData: [
      { col1: "12/09", col2: "Micro" },
      { col1: "12/09", col2: "Loa" },
      { col1: "13/09", col2: "Micro" },
      { col1: "14/09", col2: "Phấn" },
    ],
    headers: ["Ngày mượn", "Tên thiết bị"],
    correctAnswer: '=COUNTIF($B$2:$B$5, D2)',
    options: [
      '=COUNTIF(B2:B5, D2)',
      '=COUNTIF($B2:$B5, "D2")',
      '=COUNTIF($B$2:$B$5, D2)',
      '=COUNTIF(B2:B5, $D$2)'
    ],
    explanation: "ĐÚNG RỒI! Phải dùng $B$2:$B$5 (Địa chỉ tuyệt đối) để khóa vùng dữ liệu lại. Nếu không khóa, khi kéo xuống vùng chọn sẽ bị trượt đi mất!"
  },
  {
    id: 4,
    title: "Trùm cuối",
    instruction: "Đếm số học sinh có điểm 10. (Điểm số là số, không phải chữ)",
    tableData: [
      { col1: "Hùng", col2: 10 },
      { col1: "Vân", col2: 9 },
      { col1: "Tâm", col2: 10 },
      { col1: "Quang", col2: 8 },
    ],
    headers: ["Họ tên", "Điểm số"],
    correctAnswer: '=COUNTIF(B2:B5, 10)',
    options: [
      '=COUNTIF(B2:B5, "10")',
      '=COUNTIF(B2:B5, 10)',
      '=COUNT(B2:B5, 10)',
      '=SUMIF(B2:B5, 10)'
    ],
    explanation: "Với số (10), ta có thể viết trực tiếp mà không cần ngoặc kép. Tuy nhiên viết \"10\" vẫn đúng nhưng viết 10 thì chuẩn hơn cho dữ liệu số."
  }
];

// --- DỮ LIỆU GAME GHÉP CÔNG THỨC (CƠ BẢN) ---
const SYNTAX_DATA = {
  instruction: "Hãy chọn các thẻ bên dưới để ghép thành công thức ĐÚNG đếm số bạn nhóm 'Bóng đá' (Cột B, hàng 2-5).",
  correctSequence: ["=COUNTIF", "(", "B2:B5", ",", "\"Bóng đá\"", ")"],
  pool: [
    { id: "p1", text: "=COUNTIF" },
    { id: "p2", text: "(" },
    { id: "p3", text: "B2:B5" },
    { id: "p4", text: "," },
    { id: "p5", text: "\"Bóng đá\"" },
    { id: "p6", text: ")" },
    { id: "p7", text: "COUNT" }, 
    { id: "p8", text: "SUMIF" },
    { id: "p9", text: "A2:A5" },
  ]
};

export default function CountifGame() {
  const [gameState, setGameState] = useState('start'); // start, playing, result, feedback, syntax_game, playing_2p, result_2p, feedback_2p
  const [gameMode, setGameMode] = useState('1p'); // '1p' or '2p'

  // State chung
  const [currentLevel, setCurrentLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // State cho 1 Player
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState({ isCorrect: false, message: "" });
  
  // State cho 2 Players
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Answer, setP1Answer] = useState(null); // null, option string
  const [p2Answer, setP2Answer] = useState(null); // null, option string
  const [answerOrder, setAnswerOrder] = useState([]); // Mảng lưu thứ tự trả lời [player_id, ...]
  const [roundPoints, setRoundPoints] = useState({ p1: 0, p2: 0 }); // Điểm đạt được trong vòng này

  // State cho Syntax Game
  const [syntaxInput, setSyntaxInput] = useState([]);
  const [syntaxStatus, setSyntaxStatus] = useState('playing');

  // Timer logic
  useEffect(() => {
    let timer;
    const isPlaying = gameState === 'playing' || gameState === 'playing_2p';
    
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      if (gameState === 'playing') handleTimeOut1P();
      else handleTimeOut2P();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // --- LOGIC 1 NGƯỜI CHƠI ---
  const handleTimeOut1P = () => {
    setFeedback({ isCorrect: false, message: "Hết giờ! Hãy nhanh tay hơn nhé." });
    setGameState('feedback');
    setStreak(0);
  };

  const startQuiz1P = () => {
    setGameMode('1p');
    setGameState('playing');
    setCurrentLevel(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
  };

  const handleAnswer1P = (selectedOption) => {
    const currentQ = GAME_DATA[currentLevel];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    if (isCorrect) {
      const bonus = Math.min(streak * 10, 50);
      setScore(s => s + 100 + bonus);
      setStreak(s => s + 1);
      setFeedback({ isCorrect: true, message: "CHÍNH XÁC! " + currentQ.explanation });
    } else {
      setStreak(0);
      setFeedback({ isCorrect: false, message: "SAI RỒI! " + currentQ.explanation });
    }
    setGameState('feedback');
  };

  const nextLevel1P = () => {
    if (currentLevel < GAME_DATA.length - 1) {
      setCurrentLevel(l => l + 1);
      setGameState('playing');
      setTimeLeft(30);
    } else {
      setGameState('result');
    }
  };

  // --- LOGIC 2 NGƯỜI CHƠI (ĐỐI KHÁNG) ---
  const startQuiz2P = () => {
    setGameMode('2p');
    setGameState('playing_2p');
    setCurrentLevel(0);
    setP1Score(0);
    setP2Score(0);
    setP1Answer(null);
    setP2Answer(null);
    setAnswerOrder([]); // Reset thứ tự
    setTimeLeft(30);
  };

  const handleAnswer2P = (player, option) => {
    // Ngăn trả lời lại
    if (player === 1 && p1Answer) return;
    if (player === 2 && p2Answer) return;

    // Lưu thứ tự người trả lời
    setAnswerOrder(prev => {
        if (prev.includes(player)) return prev;
        return [...prev, player];
    });

    if (player === 1) setP1Answer(option);
    else setP2Answer(option);
  };

  // Kiểm tra khi cả 2 đã trả lời
  useEffect(() => {
    if (gameState === 'playing_2p' && p1Answer && p2Answer) {
      // Cả 2 đã trả lời xong, chuyển sang chấm điểm ngay
      evaluateRound2P();
    }
  }, [p1Answer, p2Answer, gameState]);

  const handleTimeOut2P = () => {
    evaluateRound2P();
  };

  const evaluateRound2P = () => {
    const currentQ = GAME_DATA[currentLevel];
    let p1RoundPoints = 0;
    let p2RoundPoints = 0;

    // Hàm tính điểm dựa trên thứ tự: Người đầu tiên 100, người thứ hai 50
    const getPointsByOrder = (playerIndex) => {
        if (playerIndex === 0) return 100; // Người nhanh nhất
        return 50; // Người chậm hơn
    };

    // Chấm điểm P1
    if (p1Answer === currentQ.correctAnswer) {
        const orderIdx = answerOrder.indexOf(1);
        if (orderIdx !== -1) p1RoundPoints = getPointsByOrder(orderIdx);
    }

    // Chấm điểm P2
    if (p2Answer === currentQ.correctAnswer) {
        const orderIdx = answerOrder.indexOf(2);
        if (orderIdx !== -1) p2RoundPoints = getPointsByOrder(orderIdx);
    }
    
    // Cộng điểm tổng
    setP1Score(s => s + p1RoundPoints);
    setP2Score(s => s + p2RoundPoints);
    
    // Lưu điểm vòng này để hiển thị feedback
    setRoundPoints({ p1: p1RoundPoints, p2: p2RoundPoints });

    setGameState('feedback_2p');
  };

  const nextLevel2P = () => {
    if (currentLevel < GAME_DATA.length - 1) {
      setCurrentLevel(l => l + 1);
      setP1Answer(null);
      setP2Answer(null);
      setAnswerOrder([]);
      setGameState('playing_2p');
      setTimeLeft(30);
    } else {
      setGameState('result_2p');
    }
  };

  // --- LOGIC SYNTAX GAME ---
  const startSyntaxGame = () => {
    setGameState('syntax_game');
    setSyntaxInput([]);
    setSyntaxStatus('playing');
  };

  const addToSyntax = (item) => {
    if (syntaxStatus !== 'playing') return;
    setSyntaxInput([...syntaxInput, item]);
  };

  const removeFromSyntax = (index) => {
    if (syntaxStatus !== 'playing') return;
    const newSyntax = [...syntaxInput];
    newSyntax.splice(index, 1);
    setSyntaxInput(newSyntax);
  };

  const checkSyntax = () => {
    const currentString = syntaxInput.map(i => i.text).join('');
    const correctString = SYNTAX_DATA.correctSequence.join('');
    
    if (currentString === correctString) {
      setSyntaxStatus('correct');
    } else {
      setSyntaxStatus('wrong');
      setTimeout(() => setSyntaxStatus('playing'), 1500);
    }
  };

  // ---------------- UI RENDER ----------------

  // --- Màn hình Start ---
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap'); body { font-family: 'Varela Round', sans-serif; }`}</style>
        
        {/* Background shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-pink-500 rounded-full opacity-20 animate-bounce"></div>

        <div className="z-10 text-center space-y-8 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold text-yellow-300 drop-shadow-lg tracking-wider">
            ĐẤU TRƯỜNG<br/><span className="text-white">COUNTIF</span>
          </h1>
          <p className="text-xl text-indigo-200">Trở thành bậc thầy hàm đếm trong Excel!</p>
          
          <div className="flex flex-col gap-4 justify-center mt-8 w-full max-w-md mx-auto">
             <button onClick={startSyntaxGame} className="w-full px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-3xl hover:bg-green-600 transition-all shadow-[0_6px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none flex items-center justify-between">
                <span className="text-2xl">🧩</span> 
                <span className="flex-1 text-center">LUYỆN CẤU TRÚC (DỄ)</span>
             </button>

             <button onClick={startQuiz1P} className="w-full px-8 py-4 text-xl font-bold text-indigo-900 bg-yellow-400 rounded-3xl hover:bg-yellow-300 transition-all shadow-[0_6px_0_rgb(180,83,9)] active:translate-y-1 active:shadow-none flex items-center justify-between">
                <span className="text-2xl">👤</span>
                <span className="flex-1 text-center">1 NGƯỜI CHƠI</span>
             </button>

             <button onClick={startQuiz2P} className="w-full px-8 py-4 text-xl font-bold text-white bg-red-500 rounded-3xl hover:bg-red-600 transition-all shadow-[0_6px_0_rgb(185,28,28)] active:translate-y-1 active:shadow-none flex items-center justify-between animate-pulse">
                <span className="text-2xl">⚔️</span>
                <span className="flex-1 text-center">2 NGƯỜI ĐỐI KHÁNG</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Màn hình Syntax Game ---
  if (gameState === 'syntax_game') {
     return (
      <div className="min-h-screen bg-indigo-50 text-indigo-900 font-sans p-4 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full bg-white rounded-3xl p-8 shadow-2xl border-4 border-indigo-200">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-indigo-600">🧩 PHÒNG THÍ NGHIỆM CÔNG THỨC</h2>
             <button onClick={() => setGameState('start')} className="text-gray-400 hover:text-gray-600 font-bold">Thoát</button>
           </div>
           <div className="mb-8 p-4 bg-yellow-100 rounded-xl border-l-8 border-yellow-400">
             <p className="text-lg font-bold">{SYNTAX_DATA.instruction}</p>
           </div>
           <div className="mb-8">
             <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Thanh Công thức (fx)</div>
             <div className={`flex flex-wrap items-center min-h-[80px] bg-gray-100 rounded-xl p-4 border-2 transition-colors gap-2 ${syntaxStatus === 'correct' ? 'border-green-500 bg-green-50' : 'border-gray-300'} ${syntaxStatus === 'wrong' ? 'border-red-500 bg-red-50 animate-shake' : ''}`}>
                <span className="font-serif italic font-bold text-gray-400 mr-2 text-xl">fx</span>
                {syntaxInput.length === 0 && <span className="text-gray-400 italic">Nhấn vào các thẻ bên dưới để ghép công thức...</span>}
                {syntaxInput.map((item, idx) => (
                  <button key={idx} onClick={() => removeFromSyntax(idx)} className="bg-white px-3 py-2 rounded-lg shadow-sm font-mono font-bold text-lg border border-indigo-100 hover:bg-red-50 hover:text-red-500 transition-colors animate-popIn">{item.text}</button>
                ))}
             </div>
             {syntaxStatus === 'wrong' && <p className="text-red-500 font-bold mt-2">Chưa đúng, thử lại xem!</p>}
             {syntaxStatus === 'correct' && (
                <div className="mt-4 animate-bounce">
                  <p className="text-green-600 font-bold text-xl mb-2">🎉 TUYỆT VỜI! BẠN ĐÃ HIỂU CẤU TRÚC!</p>
                  <button onClick={startQuiz1P} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg">Chuyển sang Đấu Trường Trắc Nghiệm ➜</button>
                </div>
             )}
           </div>
           <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
             {SYNTAX_DATA.pool.map((item) => (
               <button key={item.id} onClick={() => addToSyntax(item)} disabled={syntaxStatus === 'correct'} className="p-3 bg-indigo-100 text-indigo-800 rounded-xl font-mono font-bold text-lg hover:bg-indigo-200 active:scale-95 transition-all shadow-sm border border-indigo-200">{item.text}</button>
             ))}
           </div>
           <div className="mt-8 flex justify-center gap-4">
              <button onClick={() => setSyntaxInput([])} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Làm lại</button>
              {syntaxStatus !== 'correct' && (
                <button onClick={checkSyntax} disabled={syntaxInput.length === 0} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">Kiểm tra Công thức</button>
              )}
           </div>
        </div>
        <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.3s ease-in-out; } @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } } .animate-popIn { animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }`}</style>
      </div>
    );
  }

  // --- Màn hình Kết quả Chung (1P & 2P) ---
  if (gameState === 'result' || gameState === 'result_2p') {
    const is2P = gameState === 'result_2p';
    let winnerMessage = "";
    if (is2P) {
       if (p1Score > p2Score) winnerMessage = "NGƯỜI CHƠI 1 CHIẾN THẮNG!";
       else if (p2Score > p1Score) winnerMessage = "NGƯỜI CHƠI 2 CHIẾN THẮNG!";
       else winnerMessage = "HÒA NHAU! CẢ HAI ĐỀU GIỎI!";
    }

    return (
      <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-4 border-yellow-400 text-center max-w-lg w-full shadow-2xl">
          <h2 className="text-4xl font-bold text-yellow-300 mb-6">TỔNG KẾT</h2>
          
          {is2P ? (
            <div className="flex justify-around mb-8">
               <div className="text-blue-300">
                  <div className="text-sm font-bold mb-1">P1 (Xanh)</div>
                  <div className="text-5xl font-bold">{p1Score}</div>
               </div>
               <div className="text-red-300">
                  <div className="text-sm font-bold mb-1">P2 (Đỏ)</div>
                  <div className="text-5xl font-bold">{p2Score}</div>
               </div>
            </div>
          ) : (
             <div className="mb-8">
               <div className="text-6xl font-bold mb-4">{score}</div>
               <div className="text-xl text-indigo-200">ĐIỂM SỐ CỦA BẠN</div>
             </div>
          )}

          {is2P && <div className="text-2xl font-bold text-white mb-8 animate-bounce">{winnerMessage}</div>}

          {!is2P && (
            <div className="space-y-4 mb-8">
              {score > 300 ? (
                <div className="bg-green-500 text-indigo-900 p-4 rounded-xl font-bold text-xl">XUẤT SẮC! BẠN LÀ CHUYÊN GIA!</div>
              ) : (
                <div className="bg-yellow-500 text-indigo-900 p-4 rounded-xl font-bold text-xl">LÀM TỐT LẮM! CỐ GẮNG HƠN NHÉ!</div>
              )}
            </div>
          )}

          <button onClick={() => setGameState('start')} className="w-full py-4 text-xl font-bold text-white bg-pink-500 rounded-2xl hover:bg-pink-600 transition-colors shadow-[0_6px_0_rgb(157,23,77)] active:shadow-none active:translate-y-1">VỀ MÀN HÌNH CHÍNH</button>
        </div>
      </div>
    );
  }

  const currentQ = GAME_DATA[currentLevel];

  // --- Màn hình Chơi 2P (Đối kháng) ---
  if (gameState === 'playing_2p' || gameState === 'feedback_2p') {
     return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col items-center overflow-hidden">
           <style>{`@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap'); body { font-family: 'Varela Round', sans-serif; }`}</style>
           
           {/* Top Bar: Round & Timer */}
           <div className="w-full bg-white p-2 shadow-md flex justify-between items-center px-6 z-10 border-b-2 border-gray-200">
              <div className="font-bold text-indigo-900">Câu {currentLevel + 1}/{GAME_DATA.length}</div>
              <div className={`text-3xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-ping' : 'text-indigo-900'}`}>{timeLeft}s</div>
              <button onClick={() => setGameState('start')} className="text-xs font-bold text-gray-400 hover:text-red-500">THOÁT</button>
           </div>

           {/* Middle: Data & Question */}
           <div className="flex-1 w-full max-w-5xl p-2 flex flex-col items-center justify-start overflow-y-auto">
              {/* Question */}
              <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg w-full text-center mb-4">
                 <h2 className="text-xl md:text-2xl font-bold">{currentQ.instruction}</h2>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl shadow p-2 border border-gray-200 overflow-x-auto max-w-full">
                <table className="text-left border-collapse bg-white text-sm">
                  <thead>
                    <tr>
                      <th className="p-1 border bg-gray-200 w-8 text-center"></th>
                      {currentQ.headers.map((_, i) => (
                        <th key={i} className="p-2 border bg-gray-200 text-gray-600 text-center">{String.fromCharCode(65 + i)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b">
                        <td className="p-1 font-bold text-gray-500 bg-gray-100 text-center">1</td>
                        {currentQ.headers.map((h, i) => (
                          <td key={i} className="p-2 font-bold text-indigo-800 border bg-yellow-50">{h}</td>
                        ))}
                     </tr>
                    {currentQ.tableData.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-1 font-bold text-gray-400 bg-gray-100 text-center">{idx + 2}</td>
                        <td className="p-2 border">{row.col1}</td>
                        <td className="p-2 border font-bold text-gray-600">{row.col2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {currentQ.extraCell && (
                  <div className="mt-2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded text-sm font-bold">
                     Ô {currentQ.extraCell.id}: {currentQ.extraCell.value}
                  </div>
              )}
           </div>

           {/* Bottom: Player Controls (Split Screen) */}
           <div className="h-[45vh] w-full flex border-t-4 border-gray-300">
              {/* Player 1 Area (Blue) */}
              <div className="flex-1 bg-blue-50 border-r-2 border-gray-300 p-2 flex flex-col relative">
                 <div className="flex justify-between items-center mb-2 px-2">
                    <div className="font-bold text-blue-800 text-lg">NGƯỜI CHƠI 1</div>
                    <div className="flex items-center gap-2">
                       {/* Hiển thị điểm cộng thêm nếu có */}
                       {gameState === 'feedback_2p' && roundPoints.p1 > 0 && (
                           <div className="text-green-500 font-bold text-sm animate-bounce">+{roundPoints.p1}</div>
                       )}
                       <div className="font-bold text-blue-600 text-2xl">{p1Score}</div>
                    </div>
                 </div>
                 
                 {p1Answer && gameState === 'playing_2p' ? (
                    <div className="flex-1 flex items-center justify-center text-blue-400 font-bold text-2xl animate-pulse">ĐÃ CHỌN...</div>
                 ) : (
                    <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto">
                        {currentQ.options.map((opt, idx) => (
                           <button key={idx} disabled={gameState !== 'playing_2p'} onClick={() => handleAnswer2P(1, opt)} className="bg-white border-2 border-blue-200 text-blue-900 rounded-xl p-3 font-bold text-sm hover:bg-blue-100 active:bg-blue-300 text-left transition-colors">
                              {opt}
                           </button>
                        ))}
                    </div>
                 )}
                 {gameState === 'feedback_2p' && (
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-20`}>
                        {p1Answer === currentQ.correctAnswer ? 
                           <div className="flex flex-col items-center animate-bounce">
                               <div className="bg-green-500 text-white p-4 rounded-full text-4xl shadow-lg border-4 border-white mb-2">✔</div>
                               {/* Hiển thị rank: 1st hoặc 2nd */}
                               {roundPoints.p1 === 100 && <div className="bg-yellow-400 text-white px-3 py-1 rounded-full font-bold text-xs shadow">NHANH NHẤT!</div>}
                               {roundPoints.p1 === 50 && <div className="bg-gray-400 text-white px-3 py-1 rounded-full font-bold text-xs shadow">CHẬM HƠN</div>}
                           </div> 
                           : 
                           <div className="bg-red-500 text-white p-4 rounded-full text-4xl shadow-lg border-4 border-white">✘</div>
                        }
                    </div>
                 )}
              </div>

              {/* Player 2 Area (Red) */}
              <div className="flex-1 bg-red-50 border-l-2 border-gray-300 p-2 flex flex-col relative">
                 <div className="flex justify-between items-center mb-2 px-2">
                    <div className="font-bold text-red-800 text-lg">NGƯỜI CHƠI 2</div>
                    <div className="flex items-center gap-2">
                       {/* Hiển thị điểm cộng thêm nếu có */}
                       {gameState === 'feedback_2p' && roundPoints.p2 > 0 && (
                           <div className="text-green-500 font-bold text-sm animate-bounce">+{roundPoints.p2}</div>
                       )}
                       <div className="font-bold text-red-600 text-2xl">{p2Score}</div>
                    </div>
                 </div>

                 {p2Answer && gameState === 'playing_2p' ? (
                    <div className="flex-1 flex items-center justify-center text-red-400 font-bold text-2xl animate-pulse">ĐÃ CHỌN...</div>
                 ) : (
                    <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto">
                        {currentQ.options.map((opt, idx) => (
                           <button key={idx} disabled={gameState !== 'playing_2p'} onClick={() => handleAnswer2P(2, opt)} className="bg-white border-2 border-red-200 text-red-900 rounded-xl p-3 font-bold text-sm hover:bg-red-100 active:bg-red-300 text-left transition-colors">
                              {opt}
                           </button>
                        ))}
                    </div>
                 )}
                 {gameState === 'feedback_2p' && (
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-20`}>
                        {p2Answer === currentQ.correctAnswer ? 
                           <div className="flex flex-col items-center animate-bounce">
                               <div className="bg-green-500 text-white p-4 rounded-full text-4xl shadow-lg border-4 border-white mb-2">✔</div>
                               {roundPoints.p2 === 100 && <div className="bg-yellow-400 text-white px-3 py-1 rounded-full font-bold text-xs shadow">NHANH NHẤT!</div>}
                               {roundPoints.p2 === 50 && <div className="bg-gray-400 text-white px-3 py-1 rounded-full font-bold text-xs shadow">CHẬM HƠN</div>}
                           </div> 
                           : 
                           <div className="bg-red-500 text-white p-4 rounded-full text-4xl shadow-lg border-4 border-white">✘</div>
                        }
                    </div>
                 )}
              </div>
           </div>

           {/* Feedback Overlay 2P */}
           {gameState === 'feedback_2p' && (
              <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-full shadow-2xl border-4 border-yellow-400 z-50 flex flex-col items-center">
                 <div className="text-lg font-bold text-indigo-900 mb-2">Đáp án: {currentQ.correctAnswer}</div>
                 <button onClick={nextLevel2P} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">
                    TIẾP THEO ➜
                 </button>
              </div>
           )}
        </div>
     );
  }

  // --- Màn hình Chơi 1P (Giữ nguyên giao diện cũ) ---
  return (
    <div className="min-h-screen bg-indigo-50 text-indigo-900 font-sans p-4 md:p-8 flex flex-col items-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap'); body { font-family: 'Varela Round', sans-serif; }`}</style>
      
      {/* Header Info */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-lg border-b-4 border-indigo-200">
        <div className="flex items-center gap-2">
           <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-xl font-bold text-indigo-900 shadow-inner">
             {currentLevel + 1}
           </div>
           <button onClick={() => setGameState('start')} className="text-xs font-bold text-gray-400 hover:text-red-500 ml-2">THOÁT</button>
        </div>

        <div className="flex flex-col items-center">
          <div className={`text-3xl font-bold ${timeLeft < 5 ? 'text-red-500 animate-ping' : 'text-indigo-900'}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thời gian</div>
        </div>

        <div className="text-right">
           <div className="text-2xl font-bold text-pink-500">{score}</div>
           <div className="text-xs text-gray-500 font-bold uppercase">Điểm số</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Data Visualization */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-green-400 to-blue-500"></div>
            <h3 className="text-lg font-bold text-gray-500 mb-4 text-center tracking-widest uppercase">Bảng dữ liệu Excel</h3>
            <div className="bg-gray-100 p-4 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white shadow-sm">
                <thead>
                  <tr>
                    <th className="p-2 border-b-2 border-r-2 border-gray-300 bg-gray-200 w-12 rounded-tl-lg"></th>
                    {currentQ.headers.map((_, i) => (
                      <th key={i} className="p-2 border-b-2 border-r border-gray-300 bg-gray-200 text-gray-600 font-bold text-center text-lg">{String.fromCharCode(65 + i)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                   <tr className="border-b border-gray-200">
                      <td className="p-2 font-bold text-gray-500 bg-gray-100 border-r-2 border-gray-300 text-center select-none">1</td>
                      {currentQ.headers.map((h, i) => (<td key={i} className="p-3 font-bold text-indigo-800 border-r border-gray-200 bg-yellow-50">{h}</td>))}
                   </tr>
                  {currentQ.tableData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors">
                      <td className="p-3 font-bold text-gray-400 bg-gray-100 border-r-2 border-gray-300 text-center select-none">{idx + 2}</td>
                      <td className="p-3 font-medium text-gray-700 border-r border-gray-100">{row.col1}</td>
                      <td className="p-3 text-gray-600 font-bold">{row.col2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {currentQ.extraCell && (
              <div className="mt-4 flex justify-center">
                <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-3 rounded-xl shadow-sm flex flex-col items-center animate-bounce">
                   <span className="text-xs font-bold uppercase mb-1">Ô {currentQ.extraCell.id}</span>
                   <span className="text-xl font-bold">{currentQ.extraCell.value}</span>
                </div>
              </div>
            )}
        </div>

        {/* Right: Interaction Area */}
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative">
            <div className="absolute -top-3 -left-3 bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">?</div>
            <h2 className="text-xl md:text-2xl font-bold leading-relaxed">{currentQ.instruction}</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 flex-grow">
            {currentQ.options.map((opt, idx) => (
              <button key={idx} disabled={gameState !== 'playing'} onClick={() => handleAnswer1P(opt)} className={`w-full p-4 rounded-2xl font-mono text-lg md:text-xl font-bold transition-all duration-200 transform border-b-4 ${gameState === 'playing' ? 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 hover:scale-[1.02] active:scale-95' : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'}`}>{opt}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Modal 1P */}
      {gameState === 'feedback' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-3xl p-8 text-center shadow-2xl transform transition-all scale-100 animate-[popIn_0.3s_ease-out] ${feedback.isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-4 ${feedback.isCorrect ? 'bg-green-500 text-white border-green-200' : 'bg-red-500 text-white border-red-200'}`}>{feedback.isCorrect ? '✔' : '!'}</div>
            <h3 className="text-2xl font-bold mb-2">{feedback.isCorrect ? 'CHÍNH XÁC!' : 'TIẾC QUÁ!'}</h3>
            <p className="text-lg font-medium mb-8 leading-relaxed">{feedback.message}</p>
            <button onClick={nextLevel1P} className={`w-full py-4 rounded-2xl font-bold text-xl text-white shadow-lg transition-transform hover:scale-105 ${feedback.isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>{currentLevel < GAME_DATA.length - 1 ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}</button>
          </div>
        </div>
      )}
      
      {streak > 1 && gameState === 'playing' && (
        <div className="fixed bottom-10 right-10 bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-bounce border-4 border-orange-300">🔥 COMBO x{streak}</div>
      )}
    </div>
  );
}
