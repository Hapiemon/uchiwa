"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, RotateCcw } from "lucide-react";

interface Card {
  id: number;
  char: string;
}

export default function Home() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const correctAnswer = ["あ", "い", "し", "て", "る"];

  // 初期化：カードをランダムにシャッフル
  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const shuffled = [...correctAnswer]
      .map((char, index) => ({ id: index, char }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setShowSuccess(false);
  };

  // 正解チェック
  useEffect(() => {
    if (cards.length === 0) return;
    const currentOrder = cards.map((c) => c.char).join("");
    console.log('Current order:', currentOrder, 'Show success:', showSuccess);
    if (currentOrder === correctAnswer.join("") && !showSuccess) {
      console.log('🎉 正解！演出を開始します');
      setShowSuccess(true);
    }
  }, [cards, showSuccess]);

  // 正解時の演出とリダイレクト
  useEffect(() => {
    if (!showSuccess) return;
    
    console.log('💖 演出を表示します');

    // キラキラエフェクト
    const confetti = document.createElement("div");
    confetti.className = "fixed inset-0 pointer-events-none z-50";
    confetti.id = "confetti-effect";

    // 各💖をランダムな位置に配置
    const hearts = Array.from({ length: 30 }, (_, i) => {
      const heart = document.createElement("div");
      heart.className = "absolute text-4xl animate-float";
      heart.textContent = "💖";
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.top = "-50px";
      heart.style.animationDelay = `${i * 0.08}s`;
      return heart;
    });

    hearts.forEach((heart) => confetti.appendChild(heart));
    document.body.appendChild(confetti);
    console.log('💖 ハート要素を追加しました');

    // エフェクト終了後にDOM要素を削除して日記画面へ
    const timer = setTimeout(() => {
      console.log('⏱️ 2.5秒経過、日記画面に移動します');
      const element = document.getElementById("confetti-effect");
      if (element) {
        document.body.removeChild(element);
      }
      router.push("/diary");
    }, 2500);

    return () => {
      clearTimeout(timer);
      const element = document.getElementById("confetti-effect");
      if (element && document.body.contains(element)) {
        document.body.removeChild(element);
      }
    };
  }, [showSuccess, router]);

  // ドラッグ開始
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    setDraggedCard(index);
  };

  // ドラッグ中
  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null) {
      const newCards = [...cards];
      const draggedItemContent = newCards[dragItemRef.current];
      newCards.splice(dragItemRef.current, 1);
      newCards.splice(dragOverItemRef.current, 0, draggedItemContent);
      setCards(newCards);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
    setDraggedCard(null);
  };

  // タッチイベント対応
  const touchStartX = useRef<number>(0);
  const touchStartIndex = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartIndex.current = index;
    setDraggedCard(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartIndex.current === null) return;

    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX.current;

    // 50px以上移動したら隣と入れ替え
    if (Math.abs(diff) > 50) {
      const currentIndex = touchStartIndex.current;
      const newIndex = diff > 0 ? currentIndex + 1 : currentIndex - 1;

      if (newIndex >= 0 && newIndex < cards.length) {
        const newCards = [...cards];
        [newCards[currentIndex], newCards[newIndex]] = [
          newCards[newIndex],
          newCards[currentIndex],
        ];
        setCards(newCards);
        touchStartIndex.current = newIndex;
        touchStartX.current = touchX;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartIndex.current = null;
    setDraggedCard(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-purple p-4 sm:p-8">
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 3s ease-in forwards;
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .shake {
          animation: shake 0.5s;
        }
        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-2xl w-full ${
          shake ? "shake" : ""
        }`}
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Heart
              className="w-12 h-12 sm:w-16 sm:h-16 text-pastel-pink animate-pulse"
              fill="currentColor"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple mb-2">
            Welcome
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            文字を並び替えて
            <br />
            気持ちを伝えてください
          </p>
        </div>

        {/* カードエリア - 横並び */}
        <div className="mb-6">
          <div className="flex flex-row flex-wrap justify-center sm:gap-3">
            {cards.map((card, index) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center
                  bg-gradient-to-br from-white to-pink-50
                  border-4 border-pastel-pink
                  rounded-2xl shadow-lg
                  cursor-move select-none
                  transition-all duration-200
                  active:shadow-xl active:scale-105
                  ${draggedCard === index ? "opacity-50 scale-95" : ""}
                  ${showSuccess ? "pulse-scale" : ""}
                `}
              >
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-pastel-pink to-pastel-purple">
                  {card.char}
                </span>
              </div>
            ))}
          </div>
        </div>

        {showSuccess && (
          <div className="mt-6 text-center">
            <p className="text-base sm:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple animate-pulse">
              わーい！ログイン画面に移動します...💖
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
