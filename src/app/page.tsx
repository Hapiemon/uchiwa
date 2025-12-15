'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const correctAnswers = [
    '大好き',
    'だいすき',
    '愛している',
    'あいしてる',
    '好き',
    'すき',
    'ラブ',
    'らぶ',
    'love',
    'LOVE',
    'Love',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedAnswer = answer.trim();
    
    if (correctAnswers.includes(normalizedAnswer)) {
      // 正解！
      // キラキラエフェクトを表示してから遷移
      const confetti = document.createElement('div');
      confetti.className = 'fixed inset-0 pointer-events-none z-50';
      confetti.innerHTML = '💖'.repeat(50).split('').map((emoji, i) => 
        `<div class="absolute text-4xl animate-float" style="left: ${Math.random() * 100}%; top: -20px; animation-delay: ${i * 0.1}s;">${emoji}</div>`
      ).join('');
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      // 不正解
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setAnswer('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-purple p-4">
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation: float 3s ease-in forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.5s;
        }
      `}</style>
      
      <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full ${shake ? 'shake' : ''}`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-pastel-pink animate-pulse" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple mb-2">
            Welcome
          </h1>
          <p className="text-gray-600">
            このアプリに入るには<br />
            特別な言葉が必要です
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2 text-center">
              <Sparkles className="w-4 h-4 inline mr-1 text-yellow-400" />
              あなたへの気持ちを教えてください
              <Sparkles className="w-4 h-4 inline ml-1 text-yellow-400" />
            </label>
            <input
              type="text"
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="ここに入力..."
              className="w-full px-4 py-3 text-center border-2 border-pastel-pink rounded-full focus:outline-none focus:ring-4 focus:ring-pastel-pink/30 text-lg"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pastel-pink to-pastel-purple text-white font-semibold py-3 rounded-full hover:opacity-90 transition-all transform hover:scale-105"
          >
            確認
          </button>

          {!showHint && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ヒントが欲しい？
            </button>
          )}

          {showHint && (
            <div className="bg-pastel-lavender/30 rounded-2xl p-4 text-sm text-gray-700 text-center animate-fade-in">
              <p className="mb-2">💡 ヒント:</p>
              <p>あなたへの<span className="font-bold text-pastel-pink">愛情</span>を<br />言葉で伝えてください ❤️</p>
            </div>
          )}
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Made with 💖 for you</p>
        </div>
      </div>
    </div>
  );
}
