"use client";

import dynamic from "next/dynamic";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-32 border rounded-md p-4 animate-pulse bg-muted">Loading editor...</div>
  )
});

// Quill editor configuration
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"]
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video"
];

export function RichTextEditor({ name, label, required = false }) {
  const { setValue, watch, register } = useFormContext();
  const value = watch(name);

  const handleChange = (content) => {
    setValue(name, content);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <ReactQuill
        id={name}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        className="rounded-md border border-border focus:outline-none focus:ring-0 focus:border-border"
      />
      {/* Hidden input to maintain form registration */}
      <input type="hidden" {...register(name)} />
    </div>
  );
}
