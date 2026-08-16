"use client";
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { fetchCurrentPollQuestion, submitPollRating } from "@/app/services/polls";

export default function WeeklyPoll() {
  const [question, setQuestion] = useState(null);
  const [pollRating, setPollRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchCurrentPollQuestion()
      .then(setQuestion)
      .catch((err) => console.error("Error fetching poll question:", err));
  }, []);

  const handleRate = (star) => {
    setPollRating(star);
    submitPollRating(star);
  };

  return (
    <div className="bg-white border-2 border-[#001c7f] rounded-lg p-5 shadow-sm mt-6">
      <h3 className="text-[#001c7f] font-black text-sm tracking-wider uppercase leading-snug">
        HOW DO YOU FEEL ABOUT WORK THIS WEEK?
      </h3>
      <p className="text-xs text-blue-500 font-bold mt-1">All answers will be anonymous.</p>

      <div className="flex justify-between my-5 px-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || pollRating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-[#001c7f] hover:scale-110 transition-transform duration-150"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-8 h-8 transition-colors duration-150 ${
                  isFilled ? 'fill-[#001c7f] text-[#001c7f]' : 'fill-white text-[#001c7f]'
                }`}
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>

      {question && (
        <div className="border-t border-[#001c7f]/20 pt-3 mt-2">
          <span className="text-xs font-black text-[#001c7f] block uppercase">
            Question {question.current} of {question.total}:
          </span>
          <span className="text-xs font-black text-[#001c7f] uppercase">{question.text}</span>
        </div>
      )}
    </div>
  );
}