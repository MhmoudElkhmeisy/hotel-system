"use client";

type Props = {
  message: string;
  type?: "success" | "error" | "info";
};

export default function Toast({ message, type = "info" }: Props) {
  const bg =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-gray-800";

  return (
    <div className="fixed top-6 right-6 z-50">
      <div
        className={`${bg} text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn`}
      >
        {message}
      </div>
    </div>
  );
}