import { useState } from "react";

type FAQCardProps = {
  question: string;
  answer: string;
};

const FAQCard = ({ question, answer }: FAQCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left text-xl font-medium text-[#2B7A57] focus:outline-none"
      >
        {question}
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out px-4 text-sm overflow-hidden ${
          isOpen ? "max-h-96 py-4" : "max-h-0"
        }`}
      >
        <p className="opacity-80 text-lg text-black">{answer}</p>
      </div>
    </div>
  );
};

export default FAQCard;
