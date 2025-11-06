import { useState } from "react";

type FAQCardProps = {
  question: string;
  answer: string;
};

const FAQCard = ({ question, answer }: FAQCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

const hasBullets = answer.includes("●");
  const parts = hasBullets ? answer.split("●") : [];
  const intro = hasBullets ? (parts.shift()?.trim() ?? "") : "";
  const bullets = hasBullets ? parts.map(s => s.trim()).filter(Boolean) : [];


  return (
    <div className="border rounded-lg overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left text-xl font-medium text-[#2B7A57] focus:outline-none"
      >
        {question}
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </button>

      {/* <div
        className={`transition-all duration-300 ease-in-out px-4 text-sm overflow-hidden ${
          isOpen ? "max-h-96 py-4" : "max-h-0"
        }`}
      >
        <p className="opacity-80 text-lg text-black">{answer}</p>
      </div> */}
       <div
        className={`transition-all duration-300 ease-in-out px-4 text-sm overflow-hidden ${
          isOpen ? "max-h-96 py-4" : "max-h-0"
        }`}
      >
        {hasBullets ? (
          <>
            {intro && (
              <p className="text-lg text-black mb-2">{intro}</p>
            )}
            {bullets.length > 0 && (
              <ul className="list-disc pl-6 space-y-2 text-lg text-black">
                {bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="opacity-80 text-lg text-black">{answer}</p>
        )}
      </div>
    </div>
  );
};

export default FAQCard;
