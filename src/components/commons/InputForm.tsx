type InputFormProps = {
  title: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  img?: string;
};

const InputForm = ({
  title,
  placeholder,
  type,
  required,
  img,
}: InputFormProps) => {
  return (
    <div className="">
      <label className="block mb-1 text-sm font-medium text-gray-900">
        {title}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <img
          src={img}
          alt={title + " icono"}
          className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
        />

        <input
          type={type || "text"} // Default to text if type is not provided
          className={
            type === "date"
              ? " text-gray-500 pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:text-gray-900"
              : "text-sm lg:text-base pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          }
          placeholder={placeholder}
          required={required} // Spread type prop if provided
        />
      </div>
    </div>
  );
};

export default InputForm;
