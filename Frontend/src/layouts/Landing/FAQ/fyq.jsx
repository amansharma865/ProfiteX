import React, { useState } from 'react';
import down from '../../../assets/img/layout/down.png';
import up from '../../../assets/img/layout/upload.png';

const FAQ = () => {
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  const questions = [
    {
      question: 'How do I order?',
      answer: 'We are not always in the position that we want to be at. We are constantly growing. We are constantly making mistakes. We are constantly trying to express ourselves and actualize our dreams. If you have the opportunity to play this game of life you need to appreciate every moment. A lot of people do not appreciate the moment until it is passed.',
    },
    {
      question: 'How can I make payments?',
      answer: 'It really matters and then like it really does not matter. What matters is the people who are sparked by it. And the people who are like offended by it, it does not matter. Because it is about motivating the doers. Because I am here to follow my dreams and inspire other people to follow their dreams, too.',
    },
    {
      question: 'How much time does it take to receive the orders?',
      answer: 'The time is now for it to be okay to be great. People in this world shun people for being great. For being a bright color. For standing out. But the time is now to be okay to be the greatest you. Would you believe in what you believe in, if you were the only one who believed it?',
    },
    {
      question: 'Can I resell the products?',
      answer: 'The time is now for it to be okay to be great. People in this world shun people for being great. For being a bright color. For standing out. But the time is now to be okay to be the greatest you. Would you believe in what you believe in, if you were the only one who believed it?',
    },
    {
      question: 'Where can I find shipping details?',
      answer: 'The time is now for it to be okay to be great. People in this world shun people for being great. For being a bright color. For standing out. But the time is now to be okay to be the greatest you. Would you believe in what you believe in, if you were the only one who believed it?',
    },
  ];

  const toggleQuestion = (index) => {
    if (openQuestionIndex === index) {
      setOpenQuestionIndex(null); // Close the question if it's already open
    } else {
      setOpenQuestionIndex(index); // Open the selected question
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-5xl text-[#050323] font-bold mb-16 mt-20 flex justify-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div key={index} className="border-b">
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full text-left py-2 flex justify-between items-center"
            >
              <span className="text-2xl font-[500] p-4">{item.question}</span>
              <img
                src={openQuestionIndex === index ? up : down}
                alt={openQuestionIndex === index ? 'Expand' : 'Collapse'}
                className={`transition-transform duration-300 ease-in-out ${openQuestionIndex === index ? 'rotate-180 w-[15px] h-[15px]' : 'rotate-0 w-[25px] h-[25px]'}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${openQuestionIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="text-black-300 text-large mt-2 ml-4 font-[400] p-2">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;