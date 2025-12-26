// // Custom components
// import React from "react";
// import { forwardRef } from "react";

// const InputField = forwardRef(function InputField(props,ref) {
//   // const { label, id, extra, type, placeholder, variant, state, disabled } =
//   //   props;

//   return (
//     <div className={`${props.extra}`}>
//       <label
//         htmlFor={props.id}
//         className={`text-sm text-black-700 dark:text-white ${
//           props.variant === "auth" ? "ml-1.5 font-medium" : "ml-3 font-bold"
//         }`}
//       >
//         {props.label}<span className="text-red-500">*</span>
//       </label>
//       <input
//         disabled={props.disabled}
//         type={props.type}
//         id={props.id}
//         ref={ref}
//         {...props}
//         placeholder={props.placeholder}
//         className={`mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none ${
//           props.disabled === true
//             ? "!border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:!text-[rgba(255,255,255,0.15)]"
//             : props.state === "error"
//             ? "border-red-500 text-red-500 placeholder:text-red-500 dark:!border-red-400 dark:!text-red-400 dark:placeholder:!text-red-400"
//             : props.state === "success"
//             ? "border-green-500 text-green-500 placeholder:text-green-500 dark:!border-green-400 dark:!text-green-400 dark:placeholder:!text-green-400"
//             : "border-gray-200 dark:!border-white/10 dark:text-white"
//         }`}
//       />
//     </div>
//   );
// })

// export default InputField;


import React from "react";
import { forwardRef } from "react";

const InputField = forwardRef(function InputField(props, ref) {
  const { label, id, extra, type, placeholder, variant, disabled, error } = props;

  return (
    <div className={`${extra}`}>
      <label
        htmlFor={id}
        className={`text-sm text-black-700 dark:text-white ${
          variant === "auth" ? "ml-1.5 font-medium" : "ml-3 font-bold"
        }`}
      >
        {label}
        {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        disabled={disabled}
        type={type}
        id={id}
        ref={ref}
        {...props}
        placeholder={placeholder}
        className={`mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none ${
          disabled
            ? "!border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:!text-[rgba(255,255,255,0.15)]"
            : error
            ? "border-red-500 text-red-500 placeholder:text-red-500 dark:!border-red-400 dark:!text-red-400 dark:placeholder:!text-red-400"
            : "border-gray-200 dark:!border-white/10 dark:text-white"
        }`}
      />
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
});

export default InputField;

